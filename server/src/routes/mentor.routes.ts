import { Router, Request, Response } from "express";
import { eq, and, desc, count, inArray, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  userProfiles,
  mentorMenteeRelationships,
  courses,
  courseEnrollments,
  lessons,
  tasks,
  taskSubmissions,
  messages,
} from "../db/schema.js";
import { verifyToken, requireRole } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { queueEmail } from "../jobs/email.producer.js";
import {
  notifyTaskReviewed,
  notifyMessageReceived,
  notifyCourseEnrolled,
} from "../services/notification.service.js";

const router = Router();

// GET /api/mentor-get-dashboard
router.get(
  "/mentor-get-dashboard",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const mentorId = req.user!.userId;

    const totalMenteesResult = await db
      .select({ count: count() })
      .from(mentorMenteeRelationships)
      .where(eq(mentorMenteeRelationships.mentorId, mentorId));

    const totalMentees = totalMenteesResult[0]?.count || 0;

    const activeMenteesResult = await db
      .select({ count: count() })
      .from(mentorMenteeRelationships)
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.status, "active")
        )
      );

    const activeMentees = activeMenteesResult[0]?.count || 0;

    const totalCoursesResult = await db
      .select({ count: count() })
      .from(courses)
      .where(and(eq(courses.mentorId, mentorId), eq(courses.status, "active")));

    const totalCourses = totalCoursesResult[0]?.count || 0;

    const pendingSubmissionsResult = await db
      .select({ count: count() })
      .from(taskSubmissions)
      .innerJoin(tasks, eq(tasks.id, taskSubmissions.taskId))
      .where(
        and(eq(tasks.mentorId, mentorId), eq(taskSubmissions.status, "pending"))
      );

    const pendingSubmissions = pendingSubmissionsResult[0]?.count || 0;

    const recentCourses = await db
      .select({
        id: courses.id,
        name: courses.name,
        duration: courses.duration,
        description: courses.description,
        enrolledMenteesCount: courses.enrolledMenteesCount,
        createdAt: courses.createdAt,
        status: courses.status,
      })
      .from(courses)
      .where(and(eq(courses.mentorId, mentorId), eq(courses.status, "active")))
      .orderBy(desc(courses.createdAt))
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalMentees,
          activeMentees,
          totalCourses,
          pendingSubmissions,
        },
        recentCourses: recentCourses.map((course) => ({
          id: course.id,
          name: course.name,
          duration: course.duration,
          description: course.description,
          enrolledMentees: course.enrolledMenteesCount || 0,
          createdAt: course.createdAt,
          status: course.status,
        })),
      },
    });
  })
);

// GET /api/mentor-get-courses
router.get(
  "/mentor-get-courses",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const mentorId = req.user!.userId;

    const mentorCourses = await db
      .select()
      .from(courses)
      .where(eq(courses.mentorId, mentorId))
      .orderBy(desc(courses.createdAt));

    const totalCourses = mentorCourses.length;
    const activeCourses = mentorCourses.filter(
      (c) => c.status === "active"
    ).length;
    const totalEnrollments = mentorCourses.reduce(
      (sum, c) => sum + (c.enrolledMenteesCount || 0),
      0
    );

    const formattedCourses = mentorCourses.map((course) => ({
      id: course.id,
      name: course.name,
      duration: course.duration,
      description: course.description,
      status: course.status,
      enrolledMentees: course.enrolledMenteesCount || 0,
      createdAt: course.createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        courses: formattedCourses,
        stats: {
          totalCourses,
          activeCourses,
          totalEnrollments,
        },
      },
    });
  })
);

// POST /api/mentor-create-course
router.post(
  "/mentor-create-course",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { name, duration, description } = req.body;

    if (!name || !duration || !description) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "name, duration, and description are required",
      });
    }

    if (name.trim().length === 0) {
      return res.status(400).json({ error: "Course name cannot be empty" });
    }

    if (description.trim().length === 0) {
      return res
        .status(400)
        .json({ error: "Course description cannot be empty" });
    }

    const mentorId = req.user!.userId;

    const newCourse = await db
      .insert(courses)
      .values({
        mentorId,
        name: name.trim(),
        duration: duration.trim(),
        description: description.trim(),
        status: "active",
        enrolledMenteesCount: 0,
      })
      .returning();

    res.status(201).json({
      success: true,
      data: {
        id: newCourse[0].id,
        mentorId: newCourse[0].mentorId,
        name: newCourse[0].name,
        duration: newCourse[0].duration,
        description: newCourse[0].description,
        status: newCourse[0].status,
        enrolledMenteesCount: newCourse[0].enrolledMenteesCount,
        createdAt: newCourse[0].createdAt,
        updatedAt: newCourse[0].updatedAt,
      },
    });
  })
);

// GET /api/mentor-get-course-detail
router.get(
  "/mentor-get-course-detail",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.query.courseId as string;

    if (!courseId) {
      return res.status(400).json({ error: "courseId is required" });
    }

    const mentorId = req.user!.userId;

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.mentorId, mentorId)))
      .limit(1);

    if (course.length === 0) {
      return res
        .status(404)
        .json({
          error: "Course not found or you do not have permission to view it",
        });
    }

    const courseLessons = await db
      .select()
      .from(lessons)
      .where(eq(lessons.courseId, courseId));

    const courseTasks = await db
      .select()
      .from(tasks)
      .where(eq(tasks.courseId, courseId));

    const courseData = {
      id: course[0].id,
      name: course[0].name,
      duration: course[0].duration,
      description: course[0].description,
      status: course[0].status,
      enrolledMentees: course[0].enrolledMenteesCount || 0,
      createdAt: course[0].createdAt,
      lessons: courseLessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        link: lesson.link,
        createdAt: lesson.createdAt,
      })),
      tasks: courseTasks.map((task) => {
        let requirements: any[] = [];
        if (task.requirements) {
          try {
            requirements = JSON.parse(task.requirements as string);
          } catch (e) {
            requirements = [];
          }
        }
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          deadline: task.deadline,
          status: task.status,
          requirements,
          createdAt: task.createdAt,
        };
      }),
    };

    res.status(200).json({
      success: true,
      data: courseData,
    });
  })
);

// PUT /api/mentor-update-course-status
router.put(
  "/mentor-update-course-status",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { courseId, status } = req.body;

    if (!courseId || !status) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "courseId and status are required",
      });
    }

    const validStatuses = ["active", "archived", "ended"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        details: "Status must be one of: active, archived, ended",
      });
    }

    const mentorId = req.user!.userId;

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.mentorId, mentorId)))
      .limit(1);

    if (course.length === 0) {
      return res
        .status(404)
        .json({
          error: "Course not found or you do not have permission to update it",
        });
    }

    const updatedCourse = await db
      .update(courses)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning();

    res.status(200).json({
      success: true,
      data: {
        id: updatedCourse[0].id,
        status: updatedCourse[0].status,
        updatedAt: updatedCourse[0].updatedAt,
      },
    });
  })
);

// GET /api/mentor-get-mentees
router.get(
  "/mentor-get-mentees",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const mentorId = req.user!.userId;

    const menteesResult = await db
      .select({
        relationshipId: mentorMenteeRelationships.id,
        menteeId: mentorMenteeRelationships.menteeId,
        status: mentorMenteeRelationships.status,
        assignedDate: mentorMenteeRelationships.assignedDate,
        completionDate: mentorMenteeRelationships.completionDate,
        progressPercentage: mentorMenteeRelationships.progressPercentage,
        notes: mentorMenteeRelationships.notes,
        createdAt: mentorMenteeRelationships.createdAt,
        menteeFullName: userProfiles.fullName,
        menteeEmail: userProfiles.email,
        menteeCareerPath: userProfiles.careerPath,
      })
      .from(mentorMenteeRelationships)
      .innerJoin(
        userProfiles,
        eq(mentorMenteeRelationships.menteeId, userProfiles.id)
      )
      .where(eq(mentorMenteeRelationships.mentorId, mentorId))
      .orderBy(desc(mentorMenteeRelationships.assignedDate));

    const mentees = menteesResult.map((m) => ({
      id: m.relationshipId,
      menteeId: m.menteeId,
      fullName: m.menteeFullName,
      email: m.menteeEmail,
      careerPath: m.menteeCareerPath,
      status: m.status,
      assignedDate: m.assignedDate,
      completionDate: m.completionDate,
      progressPercentage: m.progressPercentage || 0,
      notes: m.notes,
      createdAt: m.createdAt,
    }));

    const totalMentees = mentees.length;
    const activeMentees = mentees.filter((m) => m.status === "active").length;
    const completedMentees = mentees.filter(
      (m) => m.status === "completed"
    ).length;
    const avgProgress =
      totalMentees > 0
        ? Math.round(
            mentees.reduce((acc, m) => acc + m.progressPercentage, 0) /
              totalMentees
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        mentees,
        stats: {
          totalMentees,
          activeMentees,
          completedMentees,
          avgProgress,
        },
      },
    });
  })
);

// GET /api/mentor-get-assigned-mentees
router.get(
  "/mentor-get-assigned-mentees",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const courseId = req.query.courseId as string;
    const mentorId = req.user!.userId;

    if (courseId) {
      const result = await db.execute(sql`
      SELECT
        up.id,
        up.full_name,
        up.email,
        up.career_path,
        up.membership_category,
        mmr.status,
        CASE
          WHEN ce.mentee_id IS NOT NULL THEN true
          ELSE false
        END as is_enrolled
      FROM mentor_mentee_relationships mmr
      INNER JOIN user_profiles up ON mmr.mentee_id = up.id
      LEFT JOIN course_enrollments ce ON ce.mentee_id = up.id AND ce.course_id = ${courseId}
      WHERE mmr.mentor_id = ${mentorId}
        AND mmr.status = 'active'
      ORDER BY up.full_name ASC
    `);

      const mentees = result.rows.map((row: any) => ({
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        careerPath: row.career_path,
        membershipCategory: row.membership_category,
        profilePicture: null,
        status: row.status,
        isEnrolled: row.is_enrolled,
      }));

      return res.status(200).json({
        success: true,
        data: mentees,
      });
    }

    const result = await db.execute(sql`
    SELECT
      up.id,
      up.full_name,
      up.email,
      mmr.status
    FROM mentor_mentee_relationships mmr
    INNER JOIN user_profiles up ON mmr.mentee_id = up.id
    WHERE mmr.mentor_id = ${mentorId}
      AND mmr.status = 'active'
    ORDER BY up.full_name ASC
  `);

    const mentees = result.rows.map((row: any) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      profilePicture: null,
      status: row.status,
      isEnrolled: false,
    }));

    res.status(200).json({
      success: true,
      data: mentees,
    });
  })
);

// GET /api/mentor-get-mentee-detail
router.get(
  "/mentor-get-mentee-detail",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.query.menteeId as string;

    if (!menteeId) {
      return res.status(400).json({ error: "Mentee ID is required" });
    }

    const mentorId = req.user!.userId;

    const relationshipCheck = await db.execute(sql`
    SELECT 1
    FROM mentor_mentee_relationships
    WHERE mentor_id = ${mentorId}
      AND mentee_id = ${menteeId}
      AND status = 'active'
    LIMIT 1
  `);

    if (relationshipCheck.rows.length === 0) {
      return res
        .status(403)
        .json({ error: "You do not have access to this mentee" });
    }

    const menteeResult = await db.execute(sql`
    SELECT
      up.id,
      up.full_name,
      up.email,
      up.membership_category,
      up.career_path,
      up.status,
      up.contract_file_url,
      up.community_link,
      up.created_at,
      up.updated_at,
      mmr.progress_percentage,
      mmr.assigned_date,
      mmr.notes
    FROM user_profiles up
    INNER JOIN mentor_mentee_relationships mmr
      ON up.id = mmr.mentee_id
    WHERE up.id = ${menteeId}
      AND mmr.mentor_id = ${mentorId}
      AND up.role = 'Mentee'
    LIMIT 1
  `);

    if (menteeResult.rows.length === 0) {
      return res.status(404).json({ error: "Mentee not found" });
    }

    const menteeData: any = menteeResult.rows[0];

    const coursesResult = await db.execute(sql`
    SELECT
      c.id,
      c.name,
      c.duration,
      c.description,
      ce.status,
      ce.progress_percentage,
      ce.enrolled_at,
      ce.completed_at,
      COALESCE(lesson_stats.total_lessons, 0) as total_lessons,
      COALESCE(lesson_stats.completed_lessons, 0) as completed_lessons,
      COALESCE(task_stats.total_tasks, 0) as total_tasks,
      COALESCE(task_stats.approved_tasks, 0) as approved_tasks
    FROM course_enrollments ce
    INNER JOIN courses c ON ce.course_id = c.id
    LEFT JOIN (
      SELECT
        l.course_id,
        COUNT(*) as total_lessons,
        COUNT(lp.completed) FILTER (WHERE lp.completed = true) as completed_lessons
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.mentee_id = ${menteeId}
      GROUP BY l.course_id
    ) lesson_stats ON c.id = lesson_stats.course_id
    LEFT JOIN (
      SELECT
        t.course_id,
        COUNT(*) as total_tasks,
        COUNT(ts.status) FILTER (WHERE ts.status = 'approved') as approved_tasks
      FROM tasks t
      LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.mentee_id = ${menteeId}
      GROUP BY t.course_id
    ) task_stats ON c.id = task_stats.course_id
    WHERE ce.mentee_id = ${menteeId}
    ORDER BY ce.enrolled_at DESC
  `);

    const enrolledCourses = coursesResult.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      duration: row.duration,
      description: row.description,
      status: row.status,
      progress: row.progress_percentage || 0,
      completedLessons: parseInt(row.completed_lessons) || 0,
      totalLessons: parseInt(row.total_lessons) || 0,
      approvedTasks: parseInt(row.approved_tasks) || 0,
      totalTasks: parseInt(row.total_tasks) || 0,
      enrolledDate: row.enrolled_at,
      completedAt: row.completed_at,
    }));

    const menteeDetail = {
      id: menteeData.id,
      fullName: menteeData.full_name,
      email: menteeData.email,
      membershipCategory: menteeData.membership_category,
      careerPath: menteeData.career_path,
      status: menteeData.status,
      progress: menteeData.progress_percentage || 0,
      contractFileUrl: menteeData.contract_file_url,
      communityLink: menteeData.community_link,
      joinedDate: menteeData.assigned_date,
      lastActive: menteeData.updated_at,
      notes: menteeData.notes,
      courses: enrolledCourses,
    };

    res.status(200).json({
      success: true,
      data: menteeDetail,
    });
  })
);

// POST /api/mentor-create-lesson
router.post(
  "/mentor-create-lesson",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { courseId, title, description, link } = req.body;

    if (!courseId || !title || !link) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "courseId, title, and link are required",
      });
    }

    const mentorId = req.user!.userId;

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.mentorId, mentorId)))
      .limit(1);

    if (course.length === 0) {
      return res
        .status(404)
        .json({ error: "Course not found or you do not have permission" });
    }

    const newLesson = await db
      .insert(lessons)
      .values({
        courseId,
        mentorId,
        title: title.trim(),
        description: description?.trim() || "",
        link: link.trim(),
      })
      .returning();

    res.status(201).json({
      success: true,
      data: {
        id: newLesson[0].id,
        courseId: newLesson[0].courseId,
        title: newLesson[0].title,
        description: newLesson[0].description,
        link: newLesson[0].link,
        createdAt: newLesson[0].createdAt,
      },
    });
  })
);

// PUT /api/mentor-update-lesson
router.put(
  "/mentor-update-lesson",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { lessonId, title, description, link } = req.body;

    if (!lessonId || !title || !link) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "lessonId, title, and link are required",
      });
    }

    const mentorId = req.user!.userId;

    const existingLesson = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.mentorId, mentorId)))
      .limit(1);

    if (existingLesson.length === 0) {
      return res
        .status(404)
        .json({ error: "Lesson not found or you do not have permission" });
    }

    const updatedLesson = await db
      .update(lessons)
      .set({
        title: title.trim(),
        description: description?.trim() || "",
        link: link.trim(),
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, lessonId))
      .returning();

    res.status(200).json({
      success: true,
      data: updatedLesson[0],
    });
  })
);

// DELETE /api/mentor-delete-lesson
router.delete(
  "/mentor-delete-lesson",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const lessonId = req.query.lessonId as string;

    if (!lessonId) {
      return res.status(400).json({
        error: "Missing required field",
        details: "lessonId is required",
      });
    }

    const mentorId = req.user!.userId;

    const existingLesson = await db
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.mentorId, mentorId)))
      .limit(1);

    if (existingLesson.length === 0) {
      return res
        .status(404)
        .json({ error: "Lesson not found or you do not have permission" });
    }

    await db.delete(lessons).where(eq(lessons.id, lessonId));

    res.status(200).json({
      success: true,
      message: "Lesson deleted successfully",
    });
  })
);

// POST /api/mentor-create-task
router.post(
  "/mentor-create-task",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { courseId, title, description, requirements, deadline } = req.body;

    if (!courseId || !title || !description || !deadline) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "courseId, title, description, and deadline are required",
      });
    }

    const mentorId = req.user!.userId;

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.mentorId, mentorId)))
      .limit(1);

    if (course.length === 0) {
      return res
        .status(404)
        .json({ error: "Course not found or you do not have permission" });
    }

    const filteredRequirements = (requirements || []).filter(
      (r: string) => r.trim() !== ""
    );

    const newTask = await db
      .insert(tasks)
      .values({
        courseId,
        mentorId,
        title: title.trim(),
        description: description.trim(),
        requirements: JSON.stringify(filteredRequirements),
        deadline: new Date(deadline),
        status: "active",
      })
      .returning();

    res.status(201).json({
      success: true,
      data: {
        id: newTask[0].id,
        courseId: newTask[0].courseId,
        title: newTask[0].title,
        description: newTask[0].description,
        requirements: newTask[0].requirements,
        deadline: newTask[0].deadline,
        status: newTask[0].status,
        createdAt: newTask[0].createdAt,
      },
    });
  })
);

// PUT /api/mentor-update-task
router.put(
  "/mentor-update-task",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { taskId, title, description, requirements, deadline } = req.body;

    if (!taskId || !title || !description || !deadline) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "taskId, title, description, and deadline are required",
      });
    }

    const mentorId = req.user!.userId;

    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.mentorId, mentorId)))
      .limit(1);

    if (existingTask.length === 0) {
      return res
        .status(404)
        .json({ error: "Task not found or you do not have permission" });
    }

    const filteredRequirements = (requirements || []).filter(
      (r: string) => r.trim() !== ""
    );

    const updatedTask = await db
      .update(tasks)
      .set({
        title: title.trim(),
        description: description.trim(),
        requirements: JSON.stringify(filteredRequirements),
        deadline: new Date(deadline),
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    res.status(200).json({
      success: true,
      data: updatedTask[0],
    });
  })
);

// DELETE /api/mentor-delete-task
router.delete(
  "/mentor-delete-task",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const taskId = req.query.taskId as string;

    if (!taskId) {
      return res.status(400).json({
        error: "Missing required field",
        details: "taskId is required",
      });
    }

    const mentorId = req.user!.userId;

    const existingTask = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, taskId), eq(tasks.mentorId, mentorId)))
      .limit(1);

    if (existingTask.length === 0) {
      return res
        .status(404)
        .json({ error: "Task not found or you do not have permission" });
    }

    await db.delete(tasks).where(eq(tasks.id, taskId));

    res.status(200).json({
      success: true,
      message: "Task deleted successfully",
    });
  })
);

// POST /api/mentor-enroll-mentees
router.post(
  "/mentor-enroll-mentees",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { courseId, menteeIds } = req.body;

    if (!courseId || !menteeIds || menteeIds.length === 0) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "courseId and menteeIds are required",
      });
    }

    const mentorId = req.user!.userId;

    const course = await db
      .select()
      .from(courses)
      .where(and(eq(courses.id, courseId), eq(courses.mentorId, mentorId)))
      .limit(1);

    if (course.length === 0) {
      return res
        .status(404)
        .json({ error: "Course not found or you do not have permission" });
    }

    const relationships = await db
      .select()
      .from(mentorMenteeRelationships)
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          inArray(mentorMenteeRelationships.menteeId, menteeIds)
        )
      );

    if (relationships.length !== menteeIds.length) {
      return res
        .status(403)
        .json({ error: "Some mentees are not assigned to you" });
    }

    const existingEnrollments = await db
      .select()
      .from(courseEnrollments)
      .where(
        and(
          eq(courseEnrollments.courseId, courseId),
          inArray(courseEnrollments.menteeId, menteeIds)
        )
      );

    const alreadyEnrolledIds = existingEnrollments.map((e) => e.menteeId);
    const newMenteeIds = menteeIds.filter(
      (id: string) => !alreadyEnrolledIds.includes(id)
    );

    if (newMenteeIds.length === 0) {
      return res.status(400).json({
        error: "All selected mentees are already enrolled in this course",
      });
    }

    const enrollmentValues = newMenteeIds.map((menteeId: string) => ({
      courseId,
      menteeId,
      status: "active",
      progressPercentage: 0,
    }));

    await db.insert(courseEnrollments).values(enrollmentValues);

    const updatedCourse = await db
      .update(courses)
      .set({
        enrolledMenteesCount:
          (course[0].enrolledMenteesCount || 0) + newMenteeIds.length,
        updatedAt: new Date(),
      })
      .where(eq(courses.id, courseId))
      .returning();

    const [mentor] = await db
      .select({ fullName: userProfiles.fullName })
      .from(userProfiles)
      .where(eq(userProfiles.id, mentorId))
      .limit(1);

    const mentees = await db
      .select({
        id: userProfiles.id,
        email: userProfiles.email,
        fullName: userProfiles.fullName,
      })
      .from(userProfiles)
      .where(inArray(userProfiles.id, newMenteeIds));

    const courseLink = `${
      process.env.APP_URL || "https://slinttech.netlify.app"
    }/dashboard`;

    // Only send emails and notifications if mentor exists
    if (mentor) {
      for (const mentee of mentees) {
        await queueEmail({
          type: "course-enrollment",
          to: { email: mentee.email, name: mentee.fullName },
          data: {
            menteeName: mentee.fullName,
            courseTitle: course[0].name,
            courseDescription:
              course[0].description || "No description available",
            courseDuration: course[0].duration || "Self-paced",
            courseLevel: "Intermediate",
            mentorName: mentor.fullName,
            courseLink,
          },
        });

        // Send real-time notification to mentee
        await notifyCourseEnrolled({
          menteeId: mentee.id,
          courseId,
          courseName: course[0].name,
          mentorName: mentor.fullName,
        });
      }
    }

    res.status(201).json({
      success: true,
      data: {
        enrolledCount: newMenteeIds.length,
        totalEnrolled: updatedCourse[0].enrolledMenteesCount,
        alreadyEnrolledCount: alreadyEnrolledIds.length,
      },
    });
  })
);

// GET /api/mentor-get-submissions
router.get(
  "/mentor-get-submissions",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const mentorId = req.user!.userId;

    const submissions = await db
      .select({
        id: taskSubmissions.id,
        taskId: tasks.id,
        taskTitle: tasks.title,
        taskDescription: tasks.description,
        taskRequirements: tasks.requirements,
        deadline: tasks.deadline,
        menteeId: userProfiles.id,
        menteeName: userProfiles.fullName,
        menteeEmail: userProfiles.email,
        courseId: courses.id,
        courseName: courses.name,
        submissionLink: taskSubmissions.submissionLink,
        submissionNotes: taskSubmissions.submissionNotes,
        submittedAt: taskSubmissions.submittedAt,
        status: taskSubmissions.status,
        mentorFeedback: taskSubmissions.mentorFeedback,
        reviewedAt: taskSubmissions.reviewedAt,
      })
      .from(taskSubmissions)
      .innerJoin(tasks, eq(tasks.id, taskSubmissions.taskId))
      .innerJoin(userProfiles, eq(userProfiles.id, taskSubmissions.menteeId))
      .innerJoin(courses, eq(courses.id, tasks.courseId))
      .where(eq(tasks.mentorId, mentorId))
      .orderBy(desc(taskSubmissions.submittedAt));

    const pendingCount = submissions.filter(
      (s) => s.status === "pending" || s.status === "submitted"
    ).length;
    const approvedCount = submissions.filter(
      (s) => s.status === "approved"
    ).length;
    const rejectedCount = submissions.filter(
      (s) => s.status === "rejected"
    ).length;

    res.status(200).json({
      success: true,
      data: {
        submissions: submissions.map((sub) => ({
          id: sub.id,
          taskId: sub.taskId,
          taskTitle: sub.taskTitle,
          taskDescription: sub.taskDescription,
          taskRequirements: sub.taskRequirements,
          deadline: sub.deadline,
          menteeId: sub.menteeId,
          menteeName: sub.menteeName,
          menteeEmail: sub.menteeEmail,
          courseId: sub.courseId,
          courseName: sub.courseName,
          submissionLink: sub.submissionLink,
          submissionNotes: sub.submissionNotes,
          submittedAt: sub.submittedAt,
          status: sub.status,
          mentorFeedback: sub.mentorFeedback,
          reviewedAt: sub.reviewedAt,
        })),
        stats: {
          total: submissions.length,
          pending: pendingCount,
          approved: approvedCount,
          rejected: rejectedCount,
        },
      },
    });
  })
);

// POST /api/mentor-review-submission
router.post(
  "/mentor-review-submission",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const mentorId = req.user!.userId;
    const { submissionId, status, feedback } = req.body;

    if (!submissionId || !status) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "submissionId and status are required",
      });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        error: "Invalid status",
        details: "Status must be either approved or rejected",
      });
    }

    if (status === "rejected" && !feedback?.trim()) {
      return res.status(400).json({
        error: "Feedback required",
        details: "Feedback is required for rejected submissions",
      });
    }

    const submission = await db
      .select({
        submissionId: taskSubmissions.id,
        taskId: taskSubmissions.taskId,
      })
      .from(taskSubmissions)
      .innerJoin(tasks, eq(tasks.id, taskSubmissions.taskId))
      .where(
        and(eq(taskSubmissions.id, submissionId), eq(tasks.mentorId, mentorId))
      )
      .limit(1);

    if (!submission || submission.length === 0) {
      return res.status(404).json({
        error: "Submission not found or unauthorized",
      });
    }

    const updatedSubmission = await db
      .update(taskSubmissions)
      .set({
        status: status,
        mentorFeedback: feedback || null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(taskSubmissions.id, submissionId))
      .returning();

    const reviewDetails = await db
      .select({
        menteeId: taskSubmissions.menteeId,
        taskId: tasks.id,
        taskTitle: tasks.title,
        courseId: courses.id,
        courseName: courses.name,
        mentorId: courses.mentorId,
      })
      .from(taskSubmissions)
      .innerJoin(tasks, eq(tasks.id, taskSubmissions.taskId))
      .innerJoin(courses, eq(courses.id, tasks.courseId))
      .where(eq(taskSubmissions.id, submissionId))
      .limit(1);

    if (reviewDetails.length > 0) {
      const [mentee] = await db
        .select({
          email: userProfiles.email,
          fullName: userProfiles.fullName,
        })
        .from(userProfiles)
        .where(eq(userProfiles.id, reviewDetails[0].menteeId))
        .limit(1);

      const [mentor] = await db
        .select({
          fullName: userProfiles.fullName,
        })
        .from(userProfiles)
        .where(eq(userProfiles.id, reviewDetails[0].mentorId))
        .limit(1);

      if (mentee && mentor) {
        const taskLink = `${
          process.env.APP_URL || "https://slinttech.netlify.app"
        }/task/${reviewDetails[0].taskId}`;

        await queueEmail({
          type: "task-review-mentee",
          to: { email: mentee.email, name: mentee.fullName },
          data: {
            menteeName: mentee.fullName,
            taskTitle: reviewDetails[0].taskTitle,
            courseName: reviewDetails[0].courseName,
            mentorName: mentor.fullName,
            reviewDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            feedback: feedback || undefined,
            taskLink,
            status: status,
          },
        });

        // Send real-time notification to mentee
        await notifyTaskReviewed({
          menteeId: reviewDetails[0].menteeId,
          mentorName: mentor.fullName,
          taskId: reviewDetails[0].taskId,
          taskTitle: reviewDetails[0].taskTitle,
          status: status as "approved" | "rejected",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: `Submission ${status} successfully`,
      data: {
        submission: updatedSubmission[0],
      },
    });
  })
);

// POST /api/mentor-send-message
router.post(
  "/mentor-send-message",
  verifyToken,
  requireRole("Mentor"),
  asyncHandler(async (req: Request, res: Response) => {
    const { menteeId, message } = req.body;

    if (!menteeId || !message) {
      return res.status(400).json({
        error: "Missing required fields",
        details: "menteeId and message are required",
      });
    }

    if (!message.trim()) {
      return res.status(400).json({
        error: "Invalid message",
        details: "Message cannot be empty",
      });
    }

    const mentorId = req.user!.userId;

    const relationship = await db
      .select()
      .from(mentorMenteeRelationships)
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.menteeId, menteeId)
        )
      )
      .limit(1);

    if (relationship.length === 0) {
      return res.status(403).json({
        error: "Unauthorized",
        details: "This mentee is not assigned to you",
      });
    }

    const [mentor] = await db
      .select({
        fullName: userProfiles.fullName,
        email: userProfiles.email,
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, mentorId))
      .limit(1);

    const [mentee] = await db
      .select({
        email: userProfiles.email,
        fullName: userProfiles.fullName,
      })
      .from(userProfiles)
      .where(eq(userProfiles.id, menteeId))
      .limit(1);

    if (!mentor || !mentee) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Save message to database
    const [savedMessage] = await db
      .insert(messages)
      .values({
        senderId: mentorId,
        recipientId: menteeId,
        subject: "Direct Message",
        content: message.trim(),
        read: false,
      })
      .returning();

    await queueEmail({
      type: "direct-message",
      to: { email: mentee.email, name: mentee.fullName },
      data: {
        menteeName: mentee.fullName,
        mentorName: mentor.fullName,
        mentorEmail: mentor.email,
        messageDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        messageContent: message.trim(),
      },
    });

    // Send real-time notification to mentee
    await notifyMessageReceived({
      recipientId: menteeId,
      senderName: mentor.fullName,
      messageId: savedMessage.id,
      subject: "Direct Message",
    });

    res.status(200).json({
      success: true,
      message: "Message sent successfully",
    });
  })
);

export default router;

import { Router, Request, Response } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  userProfiles,
  mentorMenteeRelationships,
  courseEnrollments,
  courses,
  lessons,
  lessonProgress,
  tasks,
  taskSubmissions,
  announcements,
} from "../db/schema.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";
import { queueEmail } from "../jobs/email.producer.js";
import { notifyTaskSubmitted } from "../services/notification.service.js";

const router = Router();

// GET /api/mentee-get-dashboard
router.get(
  "/mentee-get-dashboard",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;

    const enrolledCoursesResultRaw = await db.execute(sql`
    SELECT
      mmr.id as relationship_id,
      mmr.mentor_id,
      u.full_name as mentor_name,
      u.email as mentor_email,
      u.specialization as mentor_specialization,
      c.id as course_id,
      c.name as course_name,
      c.duration,
      mmr.status,
      ce.progress_percentage,
      mmr.assigned_date,
      mmr.notes
    FROM mentor_mentee_relationships mmr
    LEFT JOIN user_profiles u ON mmr.mentor_id = u.id
    LEFT JOIN courses c ON c.mentor_id = mmr.mentor_id
    LEFT JOIN course_enrollments ce ON ce.course_id = c.id AND ce.mentee_id = ${menteeId}
    WHERE mmr.mentee_id = ${menteeId}
  `);

    const enrolledCoursesResult: any[] =
      enrolledCoursesResultRaw.rows || enrolledCoursesResultRaw;
    const enrolledCourseIds = enrolledCoursesResult
      .filter((r) => r.course_id)
      .map((r) => r.course_id);

    let lessonsData = { completed: 0, total: 0 };
    let tasksData = { approved: 0, pending: 0, rejected: 0, total: 0 };

    if (enrolledCourseIds.length > 0) {
      const lessonsProgressResultRaw = await db.execute(sql`
      SELECT
        COUNT(DISTINCT l.id) as total_lessons,
        COUNT(DISTINCT CASE WHEN lp.completed = true THEN l.id END) as completed_lessons
      FROM lessons l
      LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.mentee_id = ${menteeId}
      WHERE l.course_id = ANY(${sql.raw(
        `ARRAY[${enrolledCourseIds
          .map((id: string) => `'${id}'`)
          .join(",")}]::uuid[]`
      )})
    `);

      const tasksProgressResultRaw = await db.execute(sql`
      SELECT
        COUNT(DISTINCT t.id) as total_tasks,
        COUNT(DISTINCT CASE WHEN ts.status = 'approved' THEN t.id END) as approved_tasks,
        COUNT(DISTINCT CASE WHEN ts.status IN ('pending', 'submitted') THEN t.id END) as pending_tasks,
        COUNT(DISTINCT CASE WHEN ts.status = 'rejected' THEN t.id END) as rejected_tasks
      FROM tasks t
      LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.mentee_id = ${menteeId}
      WHERE t.course_id = ANY(${sql.raw(
        `ARRAY[${enrolledCourseIds
          .map((id: string) => `'${id}'`)
          .join(",")}]::uuid[]`
      )})
    `);

      const lessonsProgressResult: any[] =
        lessonsProgressResultRaw.rows || lessonsProgressResultRaw;
      const tasksProgressResult: any[] =
        tasksProgressResultRaw.rows || tasksProgressResultRaw;

      lessonsData = {
        completed: Number(lessonsProgressResult[0]?.completed_lessons || 0),
        total: Number(lessonsProgressResult[0]?.total_lessons || 0),
      };

      tasksData = {
        approved: Number(tasksProgressResult[0]?.approved_tasks || 0),
        pending: Number(tasksProgressResult[0]?.pending_tasks || 0),
        rejected: Number(tasksProgressResult[0]?.rejected_tasks || 0),
        total: Number(tasksProgressResult[0]?.total_tasks || 0),
      };
    }

    const announcementsResult = await db
      .select({
        id: announcements.id,
        title: announcements.title,
        content: announcements.content,
        priority: announcements.priority,
        publishedAt: announcements.publishedAt,
      })
      .from(announcements)
      .where(
        and(
          eq(announcements.published, true),
          sql`${announcements.targetAudience} IN ('all', 'mentees')`
        )
      )
      .orderBy(sql`${announcements.publishedAt} DESC`)
      .limit(10);

    const mentorMap = new Map();
    enrolledCoursesResult.forEach((assignment: any) => {
      if (!mentorMap.has(assignment.mentor_id)) {
        mentorMap.set(assignment.mentor_id, {
          id: assignment.relationship_id,
          mentor: `${assignment.mentor_name} - ${
            assignment.mentor_specialization || "General Mentorship"
          }`,
          mentorName: assignment.mentor_name,
          mentorEmail: assignment.mentor_email,
          mentorSpecialization: assignment.mentor_specialization,
          courseName: assignment.course_name || "No courses yet",
          duration: assignment.duration || "N/A",
          status: assignment.status,
          progressPercentage: assignment.progress_percentage || 0,
          assignedDate: assignment.assigned_date,
          notes: assignment.notes,
          courses: [],
        });
      }
      if (assignment.course_id && assignment.course_name) {
        const mentor = mentorMap.get(assignment.mentor_id);
        mentor.courses.push({
          id: assignment.course_id,
          name: assignment.course_name,
          duration: assignment.duration,
        });
      }
    });

    const mentorAssignments = Array.from(mentorMap.values()).map((mentor) => {
      if (mentor.courses.length > 1) {
        mentor.courseName = `${mentor.courses.length} Active Courses`;
        mentor.duration = "Multiple";
      } else if (mentor.courses.length === 1) {
        mentor.courseName = mentor.courses[0].name;
        mentor.duration = mentor.courses[0].duration;
      }
      delete mentor.courses;
      return mentor;
    });

    const announcementsList = announcementsResult.map((announcement) => ({
      id: announcement.id,
      title: announcement.title,
      message: announcement.content,
      date:
        announcement.publishedAt?.toISOString().split("T")[0] ||
        new Date().toISOString().split("T")[0],
      type: announcement.priority === "high" ? "warning" : "info",
    }));

    res.status(200).json({
      success: true,
      data: {
        mentorAssignments,
        lessonsData,
        tasksData,
        announcements: announcementsList,
      },
    });
  })
);

// GET /api/mentee-get-mentors
router.get(
  "/mentee-get-mentors",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;

    const assignedMentorsResult = await db
      .select({
        mentorId: mentorMenteeRelationships.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization,
        status: mentorMenteeRelationships.status,
        assignedDate: mentorMenteeRelationships.assignedDate,
        notes: mentorMenteeRelationships.notes,
      })
      .from(mentorMenteeRelationships)
      .leftJoin(
        userProfiles,
        eq(mentorMenteeRelationships.mentorId, userProfiles.id)
      )
      .where(
        and(
          eq(mentorMenteeRelationships.menteeId, menteeId),
          eq(mentorMenteeRelationships.status, "active")
        )
      )
      .orderBy(desc(mentorMenteeRelationships.assignedDate));

    const enrolledCoursesResult = await db
      .select({
        courseId: courses.id,
        courseName: courses.name,
        courseDescription: courses.description,
        courseDuration: courses.duration,
        courseStatus: courses.status,
        mentorId: courses.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization,
        enrollmentStatus: courseEnrollments.status,
        progressPercentage: courseEnrollments.progressPercentage,
        enrolledAt: courseEnrollments.enrolledAt,
        completedAt: courseEnrollments.completedAt,
      })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .leftJoin(userProfiles, eq(courses.mentorId, userProfiles.id))
      .where(
        and(
          eq(courseEnrollments.menteeId, menteeId),
          eq(courseEnrollments.status, "active")
        )
      )
      .orderBy(desc(courseEnrollments.enrolledAt));

    const assignedMentors = assignedMentorsResult.map((mentor) => {
      const enrolledCoursesForMentor = enrolledCoursesResult.filter(
        (course) => course.mentorId === mentor.mentorId
      );
      return {
        id: mentor.mentorId,
        fullName: mentor.mentorName,
        email: mentor.mentorEmail,
        specialization: mentor.mentorSpecialization,
        status: mentor.status,
        assignedDate: mentor.assignedDate,
        notes: mentor.notes,
        enrolledCoursesCount: enrolledCoursesForMentor.length,
      };
    });

    const activeCourses = await Promise.all(
      enrolledCoursesResult.map(async (enrollment) => {
        const lessonsProgressResult = await db
          .select({
            totalLessons: sql<number>`count(distinct ${lessons.id})`,
            completedLessons: sql<number>`count(distinct case when ${lessonProgress.completed} = true then ${lessons.id} end)`,
          })
          .from(lessons)
          .leftJoin(
            lessonProgress,
            and(
              eq(lessons.id, lessonProgress.lessonId),
              eq(lessonProgress.menteeId, menteeId)
            )
          )
          .where(eq(lessons.courseId, enrollment.courseId));

        const tasksProgressResult = await db
          .select({
            totalTasks: sql<number>`count(distinct ${tasks.id})`,
            approvedTasks: sql<number>`count(distinct case when ${taskSubmissions.status} = 'approved' then ${tasks.id} end)`,
          })
          .from(tasks)
          .leftJoin(
            taskSubmissions,
            and(
              eq(tasks.id, taskSubmissions.taskId),
              eq(taskSubmissions.menteeId, menteeId)
            )
          )
          .where(eq(tasks.courseId, enrollment.courseId));

        return {
          courseId: enrollment.courseId,
          courseName: enrollment.courseName,
          courseDescription: enrollment.courseDescription,
          duration: enrollment.courseDuration,
          mentorId: enrollment.mentorId,
          mentorName: enrollment.mentorName,
          mentorEmail: enrollment.mentorEmail,
          mentorSpecialization: enrollment.mentorSpecialization,
          enrollmentStatus: enrollment.enrollmentStatus,
          progressPercentage: enrollment.progressPercentage,
          enrolledAt: enrollment.enrolledAt,
          completedAt: enrollment.completedAt,
          lessonsCount: Number(lessonsProgressResult[0]?.totalLessons || 0),
          tasksCount: Number(tasksProgressResult[0]?.totalTasks || 0),
          completedLessons: Number(
            lessonsProgressResult[0]?.completedLessons || 0
          ),
          approvedTasks: Number(tasksProgressResult[0]?.approvedTasks || 0),
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        assignedMentors,
        activeCourses,
      },
    });
  })
);

// GET /api/mentee-get-mentor-courses
router.get(
  "/mentee-get-mentor-courses",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;
    const mentorId = req.query.mentorId as string;

    if (!mentorId) {
      return res.status(400).json({ error: "Mentor ID is required" });
    }

    const relationshipResult = await db
      .select({
        relationshipId: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization,
        status: mentorMenteeRelationships.status,
        assignedDate: mentorMenteeRelationships.assignedDate,
      })
      .from(mentorMenteeRelationships)
      .leftJoin(
        userProfiles,
        eq(mentorMenteeRelationships.mentorId, userProfiles.id)
      )
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.menteeId, menteeId)
        )
      )
      .limit(1);

    if (!relationshipResult.length) {
      return res.status(403).json({
        error: "Access denied",
        message: "This mentor is not assigned to you",
      });
    }

    const relationship = relationshipResult[0];

    const enrolledCoursesResultRaw = await db.execute(sql`
    SELECT
      c.id as course_id,
      c.name as course_name,
      c.description as course_description,
      c.duration as course_duration,
      ce.status as enrollment_status,
      ce.progress_percentage,
      ce.enrolled_at,
      ce.completed_at
    FROM courses c
    INNER JOIN course_enrollments ce ON ce.course_id = c.id
    WHERE c.mentor_id = ${mentorId}
      AND ce.mentee_id = ${menteeId}
  `);

    const enrolledCoursesResult: any[] =
      enrolledCoursesResultRaw.rows || enrolledCoursesResultRaw;

    const coursesWithDetails = await Promise.all(
      enrolledCoursesResult.map(async (enrollment: any) => {
        const lessonsResultRaw = await db.execute(sql`
        SELECT l.id as lesson_id, lp.completed
        FROM lessons l
        LEFT JOIN lesson_progress lp ON l.id = lp.lesson_id AND lp.mentee_id = ${menteeId}
        WHERE l.course_id = ${enrollment.course_id}
      `);

        const tasksResultRaw = await db.execute(sql`
        SELECT t.id as task_id, ts.status as submission_status
        FROM tasks t
        LEFT JOIN task_submissions ts ON t.id = ts.task_id AND ts.mentee_id = ${menteeId}
        WHERE t.course_id = ${enrollment.course_id}
      `);

        const lessonsResult: any[] = lessonsResultRaw.rows || lessonsResultRaw;
        const tasksResult: any[] = tasksResultRaw.rows || tasksResultRaw;

        return {
          courseId: enrollment.course_id,
          courseName: enrollment.course_name,
          courseDescription: enrollment.course_description,
          duration: enrollment.course_duration,
          enrollmentStatus: enrollment.enrollment_status,
          progressPercentage: enrollment.progress_percentage || 0,
          enrolledAt: enrollment.enrolled_at,
          completedAt: enrollment.completed_at,
          stats: {
            totalLessons: lessonsResult.length,
            completedLessons: lessonsResult.filter((l: any) => l.completed)
              .length,
            totalTasks: tasksResult.length,
            approvedTasks: tasksResult.filter(
              (t: any) => t.submission_status === "approved"
            ).length,
            pendingTasks: tasksResult.filter((t: any) => !t.submission_status)
              .length,
            submittedTasks: tasksResult.filter(
              (t: any) => t.submission_status === "submitted"
            ).length,
          },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        mentor: {
          id: relationship.mentorId,
          fullName: relationship.mentorName,
          email: relationship.mentorEmail,
          specialization: relationship.mentorSpecialization,
          assignedDate: relationship.assignedDate,
        },
        courses: coursesWithDetails,
      },
    });
  })
);

// GET /api/mentee-get-tasks
router.get(
  "/mentee-get-tasks",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;

    const tasksResult = await db
      .select({
        taskId: tasks.id,
        title: tasks.title,
        description: tasks.description,
        requirements: tasks.requirements,
        deadline: tasks.deadline,
        taskStatus: tasks.status,
        createdAt: tasks.createdAt,
        courseId: courses.id,
        courseName: courses.name,
        mentorId: userProfiles.id,
        mentorName: userProfiles.fullName,
        submissionId: taskSubmissions.id,
        submissionLink: taskSubmissions.submissionLink,
        submissionNotes: taskSubmissions.submissionNotes,
        submissionStatus: taskSubmissions.status,
        mentorFeedback: taskSubmissions.mentorFeedback,
        submittedAt: taskSubmissions.submittedAt,
        reviewedAt: taskSubmissions.reviewedAt,
      })
      .from(tasks)
      .innerJoin(courses, eq(tasks.courseId, courses.id))
      .innerJoin(
        courseEnrollments,
        and(
          eq(courseEnrollments.courseId, courses.id),
          eq(courseEnrollments.menteeId, menteeId)
        )
      )
      .innerJoin(userProfiles, eq(tasks.mentorId, userProfiles.id))
      .leftJoin(
        taskSubmissions,
        and(
          eq(taskSubmissions.taskId, tasks.id),
          eq(taskSubmissions.menteeId, menteeId)
        )
      )
      .where(eq(tasks.status, "active"))
      .orderBy(desc(tasks.createdAt));

    const tasksData = tasksResult.map((task) => ({
      id: task.taskId,
      title: task.title,
      description: task.description,
      requirements: task.requirements,
      deadline: task.deadline,
      status: task.taskStatus,
      createdAt: task.createdAt,
      course: { id: task.courseId, name: task.courseName },
      mentor: { id: task.mentorId, name: task.mentorName },
      submission: task.submissionId
        ? {
            id: task.submissionId,
            submissionLink: task.submissionLink,
            submissionNotes: task.submissionNotes,
            status: task.submissionStatus,
            mentorFeedback: task.mentorFeedback,
            submittedAt: task.submittedAt,
            reviewedAt: task.reviewedAt,
          }
        : null,
    }));

    res.status(200).json({ success: true, data: { tasks: tasksData } });
  })
);

// GET /api/mentee-get-task-detail
router.get(
  "/mentee-get-task-detail",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;
    const taskId = req.query.taskId as string;

    if (!taskId) {
      return res.status(400).json({ error: "Task ID is required" });
    }

    const taskResult = await db
      .select({
        taskId: tasks.id,
        title: tasks.title,
        description: tasks.description,
        requirements: tasks.requirements,
        deadline: tasks.deadline,
        taskStatus: tasks.status,
        createdAt: tasks.createdAt,
        courseId: courses.id,
        courseName: courses.name,
        mentorId: userProfiles.id,
        mentorName: userProfiles.fullName,
        submissionId: taskSubmissions.id,
        submissionLink: taskSubmissions.submissionLink,
        submissionNotes: taskSubmissions.submissionNotes,
        submissionStatus: taskSubmissions.status,
        mentorFeedback: taskSubmissions.mentorFeedback,
        submittedAt: taskSubmissions.submittedAt,
        reviewedAt: taskSubmissions.reviewedAt,
      })
      .from(tasks)
      .innerJoin(courses, eq(tasks.courseId, courses.id))
      .innerJoin(
        courseEnrollments,
        and(
          eq(courseEnrollments.courseId, courses.id),
          eq(courseEnrollments.menteeId, menteeId)
        )
      )
      .innerJoin(userProfiles, eq(tasks.mentorId, userProfiles.id))
      .leftJoin(
        taskSubmissions,
        and(
          eq(taskSubmissions.taskId, tasks.id),
          eq(taskSubmissions.menteeId, menteeId)
        )
      )
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!taskResult.length) {
      return res
        .status(404)
        .json({
          error: "Task not found or you are not enrolled in this course",
        });
    }

    const task = taskResult[0];
    let requirements: any[] = [];
    if (task.requirements) {
      try {
        requirements = JSON.parse(task.requirements as string);
      } catch (e) {
        requirements = [];
      }
    }

    const taskData = {
      id: task.taskId,
      title: task.title,
      description: task.description,
      requirements,
      deadline: task.deadline,
      status: task.taskStatus,
      createdAt: task.createdAt,
      course: { id: task.courseId, name: task.courseName },
      mentor: { id: task.mentorId, name: task.mentorName },
      submission: task.submissionId
        ? {
            id: task.submissionId,
            submissionLink: task.submissionLink,
            submissionNotes: task.submissionNotes,
            status: task.submissionStatus,
            mentorFeedback: task.mentorFeedback,
            submittedAt: task.submittedAt,
            reviewedAt: task.reviewedAt,
          }
        : null,
    };

    res.status(200).json({ success: true, data: taskData });
  })
);

// POST /api/mentee-submit-task
router.post(
  "/mentee-submit-task",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;
    const { taskId, submissionLink, submissionNotes } = req.body;

    if (!taskId || !submissionLink) {
      return res
        .status(400)
        .json({ error: "Task ID and submission link are required" });
    }

    const taskCheck = await db
      .select({ taskId: tasks.id, courseId: tasks.courseId })
      .from(tasks)
      .innerJoin(courses, eq(tasks.courseId, courses.id))
      .innerJoin(
        courseEnrollments,
        and(
          eq(courseEnrollments.courseId, courses.id),
          eq(courseEnrollments.menteeId, menteeId)
        )
      )
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!taskCheck.length) {
      return res
        .status(404)
        .json({
          error: "Task not found or you are not enrolled in this course",
        });
    }

    const existing = await db
      .select({ id: taskSubmissions.id, status: taskSubmissions.status })
      .from(taskSubmissions)
      .where(
        and(
          eq(taskSubmissions.taskId, taskId),
          eq(taskSubmissions.menteeId, menteeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      const newStatus =
        existing[0].status === "rejected" ? "pending" : "submitted";
      await db
        .update(taskSubmissions)
        .set({
          submissionLink,
          submissionNotes: submissionNotes || null,
          status: newStatus,
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(taskSubmissions.taskId, taskId),
            eq(taskSubmissions.menteeId, menteeId)
          )
        );
    } else {
      await db.insert(taskSubmissions).values({
        taskId,
        menteeId,
        submissionLink,
        submissionNotes: submissionNotes || null,
        status: "submitted",
        submittedAt: new Date(),
      });
    }

    // Send email notification to mentor
    const taskDetails = await db
      .select({
        taskTitle: tasks.title,
        courseId: courses.id,
        courseName: courses.name,
        mentorId: courses.mentorId,
      })
      .from(tasks)
      .innerJoin(courses, eq(tasks.courseId, courses.id))
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (taskDetails.length > 0) {
      const [mentor] = await db
        .select({ email: userProfiles.email, fullName: userProfiles.fullName })
        .from(userProfiles)
        .where(eq(userProfiles.id, taskDetails[0].mentorId))
        .limit(1);

      const [mentee] = await db
        .select({ fullName: userProfiles.fullName })
        .from(userProfiles)
        .where(eq(userProfiles.id, menteeId))
        .limit(1);

      if (mentor && mentee) {
        const reviewLink = `${
          process.env.APP_URL || "https://slinttech.netlify.app"
        }/mentor/submissions`;
        await queueEmail({
          type: "task-submission-mentor",
          to: { email: mentor.email, name: mentor.fullName },
          data: {
            mentorName: mentor.fullName,
            menteeName: mentee.fullName,
            taskTitle: taskDetails[0].taskTitle,
            courseName: taskDetails[0].courseName,
            submissionDate: new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            }),
            submissionContent: submissionNotes || undefined,
            reviewLink,
          },
        });

        // Send real-time notification to mentor
        await notifyTaskSubmitted({
          mentorId: taskDetails[0].mentorId,
          menteeId,
          menteeName: mentee.fullName,
          taskId,
          taskTitle: taskDetails[0].taskTitle,
          courseName: taskDetails[0].courseName,
        });
      }
    }

    res
      .status(200)
      .json({ success: true, message: "Task submitted successfully" });
  })
);

// GET /api/mentee-get-lessons
router.get(
  "/mentee-get-lessons",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;

    const lessonsResult = await db
      .select({
        lessonId: lessons.id,
        title: lessons.title,
        description: lessons.description,
        link: lessons.link,
        orderIndex: lessons.orderIndex,
        status: lessons.status,
        createdAt: lessons.createdAt,
        courseId: courses.id,
        courseName: courses.name,
        mentorId: userProfiles.id,
        mentorName: userProfiles.fullName,
        completed: lessonProgress.completed,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessons)
      .innerJoin(courses, eq(lessons.courseId, courses.id))
      .innerJoin(
        courseEnrollments,
        and(
          eq(courseEnrollments.courseId, courses.id),
          eq(courseEnrollments.menteeId, menteeId)
        )
      )
      .innerJoin(userProfiles, eq(lessons.mentorId, userProfiles.id))
      .leftJoin(
        lessonProgress,
        and(
          eq(lessonProgress.lessonId, lessons.id),
          eq(lessonProgress.menteeId, menteeId)
        )
      )
      .where(eq(lessons.status, "active"))
      .orderBy(desc(lessons.createdAt));

    const lessonsData = lessonsResult.map((lesson) => ({
      id: lesson.lessonId,
      title: lesson.title,
      description: lesson.description,
      link: lesson.link,
      orderIndex: lesson.orderIndex,
      status: lesson.status,
      createdAt: lesson.createdAt,
      completed: lesson.completed || false,
      completedAt: lesson.completedAt,
      course: { id: lesson.courseId, name: lesson.courseName },
      mentor: { id: lesson.mentorId, name: lesson.mentorName },
    }));

    res.status(200).json({ success: true, data: { lessons: lessonsData } });
  })
);

// POST /api/mentee-complete-lesson
router.post(
  "/mentee-complete-lesson",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;
    const { lessonId } = req.body;

    if (!lessonId) {
      return res.status(400).json({ error: "Lesson ID is required" });
    }

    const lessonCheck = await db
      .select({ lessonId: lessons.id, courseId: lessons.courseId })
      .from(lessons)
      .innerJoin(courses, eq(lessons.courseId, courses.id))
      .innerJoin(
        courseEnrollments,
        and(
          eq(courseEnrollments.courseId, courses.id),
          eq(courseEnrollments.menteeId, menteeId)
        )
      )
      .where(eq(lessons.id, lessonId))
      .limit(1);

    if (!lessonCheck.length) {
      return res
        .status(404)
        .json({
          error: "Lesson not found or you are not enrolled in this course",
        });
    }

    const existing = await db
      .select({ id: lessonProgress.id })
      .from(lessonProgress)
      .where(
        and(
          eq(lessonProgress.lessonId, lessonId),
          eq(lessonProgress.menteeId, menteeId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(lessonProgress)
        .set({
          completed: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(lessonProgress.lessonId, lessonId),
            eq(lessonProgress.menteeId, menteeId)
          )
        );
    } else {
      await db.insert(lessonProgress).values({
        lessonId,
        menteeId,
        completed: true,
        completedAt: new Date(),
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Lesson marked as complete" });
  })
);

// GET /api/mentee-get-course-detail
router.get(
  "/mentee-get-course-detail",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;
    const courseId = req.query.courseId as string;
    const mentorId = req.query.mentorId as string;

    if (!courseId || !mentorId) {
      return res
        .status(400)
        .json({ error: "Course ID and Mentor ID are required" });
    }

    const enrollmentResult = await db
      .select({
        enrollmentId: courseEnrollments.id,
        courseId: courses.id,
        courseName: courses.name,
        courseDescription: courses.description,
        courseDuration: courses.duration,
        mentorId: courses.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        enrollmentStatus: courseEnrollments.status,
        progressPercentage: courseEnrollments.progressPercentage,
        enrolledAt: courseEnrollments.enrolledAt,
      })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .leftJoin(userProfiles, eq(courses.mentorId, userProfiles.id))
      .where(
        and(
          eq(courseEnrollments.courseId, courseId),
          eq(courseEnrollments.menteeId, menteeId),
          eq(courses.mentorId, mentorId)
        )
      )
      .limit(1);

    if (!enrollmentResult.length) {
      return res
        .status(403)
        .json({
          error: "Access denied",
          message: "You are not enrolled in this course",
        });
    }

    const enrollment = enrollmentResult[0];

    const lessonsResult = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        description: lessons.description,
        link: lessons.link,
        orderIndex: lessons.orderIndex,
        status: lessons.status,
        createdAt: lessons.createdAt,
        completed: lessonProgress.completed,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessons)
      .leftJoin(
        lessonProgress,
        and(
          eq(lessons.id, lessonProgress.lessonId),
          eq(lessonProgress.menteeId, menteeId)
        )
      )
      .where(eq(lessons.courseId, courseId))
      .orderBy(lessons.orderIndex);

    const tasksResult = await db
      .select({
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        deadline: tasks.deadline,
        status: tasks.status,
        createdAt: tasks.createdAt,
        submissionId: taskSubmissions.id,
        submissionLink: taskSubmissions.submissionLink,
        submissionNotes: taskSubmissions.submissionNotes,
        submissionStatus: taskSubmissions.status,
        mentorFeedback: taskSubmissions.mentorFeedback,
        submittedAt: taskSubmissions.submittedAt,
        reviewedAt: taskSubmissions.reviewedAt,
      })
      .from(tasks)
      .leftJoin(
        taskSubmissions,
        and(
          eq(tasks.id, taskSubmissions.taskId),
          eq(taskSubmissions.menteeId, menteeId)
        )
      )
      .where(eq(tasks.courseId, courseId))
      .orderBy(tasks.createdAt);

    const lessonsData = lessonsResult.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      link: l.link,
      orderIndex: l.orderIndex,
      status: l.status,
      completed: l.completed || false,
      completedAt: l.completedAt,
      createdAt: l.createdAt,
    }));

    const tasksData = tasksResult.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      deadline: t.deadline,
      status: t.status,
      createdAt: t.createdAt,
      submission: t.submissionId
        ? {
            id: t.submissionId,
            submissionLink: t.submissionLink,
            submissionNotes: t.submissionNotes,
            status: t.submissionStatus,
            mentorFeedback: t.mentorFeedback,
            submittedAt: t.submittedAt,
            reviewedAt: t.reviewedAt,
          }
        : null,
    }));

    res.status(200).json({
      success: true,
      data: {
        course: {
          id: enrollment.courseId,
          name: enrollment.courseName,
          description: enrollment.courseDescription,
          duration: enrollment.courseDuration,
          progressPercentage: enrollment.progressPercentage || 0,
          enrolledAt: enrollment.enrolledAt,
          mentor: {
            id: enrollment.mentorId,
            name: enrollment.mentorName,
            email: enrollment.mentorEmail,
          },
        },
        lessons: lessonsData,
        tasks: tasksData,
        stats: {
          totalLessons: lessonsData.length,
          completedLessons: lessonsData.filter((l) => l.completed).length,
          totalTasks: tasksData.length,
          completedTasks: tasksData.filter(
            (t) => t.submission?.status === "approved"
          ).length,
          pendingTasks: tasksData.filter((t) => !t.submission).length,
          submittedTasks: tasksData.filter(
            (t) => t.submission && t.submission.status === "submitted"
          ).length,
        },
      },
    });
  })
);

// GET /api/mentee-get-mentor-detail
router.get(
  "/mentee-get-mentor-detail",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const menteeId = req.user!.userId;
    const mentorId = req.query.mentorId as string;

    if (!mentorId) {
      return res.status(400).json({ error: "Mentor ID is required" });
    }

    const relationshipResult = await db
      .select({
        relationshipId: mentorMenteeRelationships.id,
        mentorId: mentorMenteeRelationships.mentorId,
        mentorName: userProfiles.fullName,
        mentorEmail: userProfiles.email,
        mentorSpecialization: userProfiles.specialization,
        status: mentorMenteeRelationships.status,
        assignedDate: mentorMenteeRelationships.assignedDate,
        notes: mentorMenteeRelationships.notes,
      })
      .from(mentorMenteeRelationships)
      .leftJoin(
        userProfiles,
        eq(mentorMenteeRelationships.mentorId, userProfiles.id)
      )
      .where(
        and(
          eq(mentorMenteeRelationships.mentorId, mentorId),
          eq(mentorMenteeRelationships.menteeId, menteeId)
        )
      )
      .limit(1);

    if (!relationshipResult.length) {
      return res
        .status(403)
        .json({
          error: "Access denied",
          message: "This mentor is not assigned to you",
        });
    }

    const relationship = relationshipResult[0];

    const enrolledCoursesResult = await db
      .select({
        courseId: courses.id,
        courseName: courses.name,
        courseDescription: courses.description,
        courseDuration: courses.duration,
        enrollmentStatus: courseEnrollments.status,
        progressPercentage: courseEnrollments.progressPercentage,
        enrolledAt: courseEnrollments.enrolledAt,
      })
      .from(courseEnrollments)
      .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
      .where(
        and(
          eq(courseEnrollments.menteeId, menteeId),
          eq(courses.mentorId, mentorId),
          eq(courseEnrollments.status, "active")
        )
      );

    if (!enrolledCoursesResult.length) {
      return res.status(200).json({
        success: true,
        data: {
          id: relationship.mentorId,
          relationshipId: relationship.relationshipId,
          fullName: relationship.mentorName,
          email: relationship.mentorEmail,
          specialization: relationship.mentorSpecialization,
          courseName: "No courses assigned yet",
          courseDescription:
            "Your mentor has not enrolled you in any courses yet.",
          duration: "N/A",
          status: relationship.status,
          progressPercentage: 0,
          assignedDate: relationship.assignedDate,
          notes: relationship.notes,
          lessons: [],
          tasks: [],
          stats: {
            totalLessons: 0,
            completedLessons: 0,
            totalTasks: 0,
            completedTasks: 0,
            pendingTasks: 0,
            submittedTasks: 0,
          },
        },
      });
    }

    // Process courses and aggregate data
    const coursesWithDetails = await Promise.all(
      enrolledCoursesResult.map(async (enrollment) => {
        const lessonsResult = await db
          .select({
            id: lessons.id,
            title: lessons.title,
            description: lessons.description,
            link: lessons.link,
            orderIndex: lessons.orderIndex,
            status: lessons.status,
            completedAt: lessonProgress.completedAt,
            completed: lessonProgress.completed,
            createdAt: lessons.createdAt,
          })
          .from(lessons)
          .leftJoin(
            lessonProgress,
            and(
              eq(lessons.id, lessonProgress.lessonId),
              eq(lessonProgress.menteeId, menteeId)
            )
          )
          .where(eq(lessons.courseId, enrollment.courseId))
          .orderBy(lessons.orderIndex);

        const tasksResult = await db
          .select({
            id: tasks.id,
            title: tasks.title,
            description: tasks.description,
            deadline: tasks.deadline,
            status: tasks.status,
            createdAt: tasks.createdAt,
            submissionId: taskSubmissions.id,
            submissionLink: taskSubmissions.submissionLink,
            submissionNotes: taskSubmissions.submissionNotes,
            submissionStatus: taskSubmissions.status,
            mentorFeedback: taskSubmissions.mentorFeedback,
            submittedAt: taskSubmissions.submittedAt,
            reviewedAt: taskSubmissions.reviewedAt,
          })
          .from(tasks)
          .leftJoin(
            taskSubmissions,
            and(
              eq(tasks.id, taskSubmissions.taskId),
              eq(taskSubmissions.menteeId, menteeId)
            )
          )
          .where(eq(tasks.courseId, enrollment.courseId));

        const lessonsData = lessonsResult.map((l) => ({
          id: l.id,
          title: l.title,
          description: l.description,
          link: l.link,
          orderIndex: l.orderIndex,
          status: l.status,
          completed: l.completed || false,
          completedAt: l.completedAt,
          createdAt: l.createdAt,
        }));

        const tasksData = tasksResult.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          deadline: t.deadline,
          status: t.status,
          createdAt: t.createdAt,
          submission: t.submissionId
            ? {
                id: t.submissionId,
                submissionLink: t.submissionLink,
                submissionNotes: t.submissionNotes,
                status: t.submissionStatus,
                mentorFeedback: t.mentorFeedback,
                submittedAt: t.submittedAt,
                reviewedAt: t.reviewedAt,
              }
            : null,
        }));

        return {
          lessons: lessonsData,
          tasks: tasksData,
          stats: {
            totalLessons: lessonsData.length,
            completedLessons: lessonsData.filter((l) => l.completed).length,
            totalTasks: tasksData.length,
            completedTasks: tasksData.filter(
              (t) => t.submission?.status === "approved"
            ).length,
            pendingTasks: tasksData.filter((t) => !t.submission).length,
            submittedTasks: tasksData.filter(
              (t) => t.submission && t.submission.status === "submitted"
            ).length,
          },
          progressPercentage: enrollment.progressPercentage,
        };
      })
    );

    const aggregateStats = coursesWithDetails.reduce(
      (acc, course) => ({
        totalLessons: acc.totalLessons + course.stats.totalLessons,
        completedLessons: acc.completedLessons + course.stats.completedLessons,
        totalTasks: acc.totalTasks + course.stats.totalTasks,
        completedTasks: acc.completedTasks + course.stats.completedTasks,
        pendingTasks: acc.pendingTasks + course.stats.pendingTasks,
        submittedTasks: acc.submittedTasks + course.stats.submittedTasks,
      }),
      {
        totalLessons: 0,
        completedLessons: 0,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        submittedTasks: 0,
      }
    );

    const allLessons = coursesWithDetails
      .flatMap((c) => c.lessons)
      .slice(0, 10);
    const allTasks = coursesWithDetails.flatMap((c) => c.tasks).slice(0, 10);

    const avgProgress =
      coursesWithDetails.length > 0
        ? Math.round(
            coursesWithDetails.reduce(
              (sum, c) => sum + (c.progressPercentage || 0),
              0
            ) / coursesWithDetails.length
          )
        : 0;

    res.status(200).json({
      success: true,
      data: {
        id: relationship.mentorId,
        relationshipId: relationship.relationshipId,
        fullName: relationship.mentorName,
        email: relationship.mentorEmail,
        specialization: relationship.mentorSpecialization,
        courseName:
          enrolledCoursesResult.length === 1
            ? enrolledCoursesResult[0].courseName
            : `${enrolledCoursesResult.length} Active Courses`,
        courseDescription:
          enrolledCoursesResult.length === 1
            ? enrolledCoursesResult[0].courseDescription
            : `You are enrolled in ${enrolledCoursesResult.length} courses with this mentor.`,
        duration:
          enrolledCoursesResult.length === 1
            ? enrolledCoursesResult[0].courseDuration
            : "Multiple",
        status: relationship.status,
        progressPercentage: avgProgress,
        assignedDate: relationship.assignedDate,
        notes: relationship.notes,
        lessons: allLessons,
        tasks: allTasks,
        stats: aggregateStats,
      },
    });
  })
);

export default router;

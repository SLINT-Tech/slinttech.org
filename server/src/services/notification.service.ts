import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { emitNotification } from "../socket/index.js";

export type NotificationType =
  | "task_submitted"
  | "task_reviewed"
  | "message_received"
  | "course_enrolled";

export type ReferenceType = "task" | "course" | "message" | null;

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceType?: ReferenceType;
  referenceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Create a notification and emit it via Socket.IO
 */
export async function createNotification(
  params: CreateNotificationParams
): Promise<void> {
  const {
    userId,
    type,
    title,
    message,
    referenceType = null,
    referenceId,
    metadata,
  } = params;

  try {
    // Insert notification into database
    const [notification] = await db
      .insert(notifications)
      .values({
        userId,
        type,
        title,
        message,
        referenceType,
        referenceId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .returning();

    // Emit to user via Socket.IO for real-time update
    emitNotification(userId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      referenceType: notification.referenceType,
      referenceId: notification.referenceId,
      createdAt: notification.createdAt!,
    });

    console.log(
      `[NOTIFICATION] Created notification for user ${userId}: ${type}`
    );
  } catch (error) {
    console.error("[NOTIFICATION] Failed to create notification:", error);
    // Don't throw - notification failure shouldn't break the main operation
  }
}

/**
 * Notify mentor when a mentee submits a task
 */
export async function notifyTaskSubmitted(params: {
  mentorId: string;
  menteeId: string;
  menteeName: string;
  taskId: string;
  taskTitle: string;
  courseName: string;
}): Promise<void> {
  await createNotification({
    userId: params.mentorId,
    type: "task_submitted",
    title: "New Task Submission",
    message: `${params.menteeName} submitted "${params.taskTitle}" for ${params.courseName}`,
    referenceType: "task",
    referenceId: params.taskId,
    metadata: {
      menteeId: params.menteeId,
      menteeName: params.menteeName,
      taskTitle: params.taskTitle,
      courseName: params.courseName,
    },
  });
}

/**
 * Notify mentee when mentor reviews their task
 */
export async function notifyTaskReviewed(params: {
  menteeId: string;
  mentorName: string;
  taskId: string;
  taskTitle: string;
  status: "approved" | "rejected";
}): Promise<void> {
  const statusText =
    params.status === "approved" ? "approved" : "needs revision";

  await createNotification({
    userId: params.menteeId,
    type: "task_reviewed",
    title: `Task ${
      params.status === "approved" ? "Approved" : "Needs Revision"
    }`,
    message: `${params.mentorName} ${statusText} your task "${params.taskTitle}"`,
    referenceType: "task",
    referenceId: params.taskId,
    metadata: {
      mentorName: params.mentorName,
      taskTitle: params.taskTitle,
      status: params.status,
    },
  });
}

/**
 * Notify mentee when they receive a message from mentor
 */
export async function notifyMessageReceived(params: {
  recipientId: string;
  senderName: string;
  messageId: string;
  subject?: string;
}): Promise<void> {
  await createNotification({
    userId: params.recipientId,
    type: "message_received",
    title: "New Message",
    message: `${params.senderName} sent you a message${
      params.subject ? `: ${params.subject}` : ""
    }. Check your email.`,
    referenceType: "message",
    referenceId: params.messageId,
    metadata: {
      senderName: params.senderName,
      subject: params.subject,
    },
  });
}

/**
 * Notify mentee when they are enrolled in a course
 */
export async function notifyCourseEnrolled(params: {
  menteeId: string;
  courseId: string;
  courseName: string;
  mentorName: string;
}): Promise<void> {
  await createNotification({
    userId: params.menteeId,
    type: "course_enrolled",
    title: "Course Enrollment",
    message: `You have been enrolled in "${params.courseName}" by ${params.mentorName}`,
    referenceType: "course",
    referenceId: params.courseId,
    metadata: {
      courseName: params.courseName,
      mentorName: params.mentorName,
    },
  });
}

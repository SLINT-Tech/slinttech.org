import { Router, Request, Response } from "express";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../middleware/error.middleware.js";

const router = Router();

// GET /api/notifications - Get paginated notifications
router.get(
  "/notifications",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filter = req.query.filter as string; // 'all' | 'unread'
    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause =
      filter === "unread"
        ? and(eq(notifications.userId, userId), eq(notifications.read, false))
        : eq(notifications.userId, userId);

    // Get notifications
    const userNotifications = await db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ total }] = await db
      .select({ total: count() })
      .from(notifications)
      .where(whereClause);

    res.json({
      notifications: userNotifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: offset + userNotifications.length < total,
      },
    });
  })
);

// GET /api/notifications/latest - Get 5 latest notifications for offcanvas
router.get(
  "/notifications/latest",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const latestNotifications = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(5);

    res.json({ notifications: latestNotifications });
  })
);

// GET /api/notifications/unread-count - Get unread count for badge
router.get(
  "/notifications/unread-count",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const [{ unreadCount }] = await db
      .select({ unreadCount: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      );

    res.json({ unreadCount });
  })
);

// POST /api/notifications/:id/read - Mark single notification as read
router.post(
  "/notifications/:id/read",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const notificationId = req.params.id;

    const result = await db
      .update(notifications)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, notification: result[0] });
  })
);

// POST /api/notifications/mark-all-read - Mark all notifications as read
router.post(
  "/notifications/mark-all-read",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    await db
      .update(notifications)
      .set({
        read: true,
        readAt: new Date(),
      })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, false))
      );

    res.json({ success: true, message: "All notifications marked as read" });
  })
);

// DELETE /api/notifications/:id - Delete a single notification
router.delete(
  "/notifications/:id",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const notificationId = req.params.id;

    const result = await db
      .delete(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.userId, userId)
        )
      )
      .returning();

    if (result.length === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, message: "Notification deleted" });
  })
);

// DELETE /api/notifications/clear-all - Delete all read notifications
router.delete(
  "/notifications/clear-all",
  verifyToken,
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.userId;

    const result = await db
      .delete(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.read, true))
      )
      .returning();

    res.json({
      success: true,
      message: `${result.length} notification(s) deleted`,
      deletedCount: result.length,
    });
  })
);

export default router;

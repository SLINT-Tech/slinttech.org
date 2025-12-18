import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../middleware/auth.middleware.js";

const JWT_SECRET = process.env.JWT_SECRET!;

let io: SocketIOServer | null = null;

// Track connected users for debugging
const connectedUsers = new Map<string, Set<string>>();

export const initializeSocket = (httpServer: HTTPServer): SocketIOServer => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [
    "http://localhost:5173",
    "http://localhost:3000",
  ];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket.io",
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware
  io.use((socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      socket.data.userId = decoded.userId;
      socket.data.email = decoded.email;
      socket.data.role = decoded.role;

      next();
    } catch (error) {
      console.error("[SOCKET] Authentication failed:", error);
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId;
    const userRoom = `user:${userId}`;

    // Join user's private room
    socket.join(userRoom);

    // Track connection
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId)!.add(socket.id);

    console.log(`[SOCKET] User ${userId} connected (socket: ${socket.id})`);

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      console.log(`[SOCKET] User ${userId} disconnected: ${reason}`);

      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
        }
      }
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`[SOCKET] Error for user ${userId}:`, error);
    });

    // Client can request to mark notification as read
    socket.on("mark-notification-read", async (notificationId: string) => {
      // This is handled via REST API, but we can acknowledge receipt
      socket.emit("notification-read-ack", { notificationId });
    });
  });

  console.log("[SOCKET] Socket.IO server initialized");
  return io;
};

/**
 * Emit an event to a specific user
 * User can have multiple connections (tabs/devices)
 */
export const emitToUser = (userId: string, event: string, data: any): void => {
  if (!io) {
    console.warn("[SOCKET] Socket.IO not initialized, cannot emit to user");
    return;
  }

  const userRoom = `user:${userId}`;
  io.to(userRoom).emit(event, data);
  console.log(`[SOCKET] Emitted "${event}" to user ${userId}`);
};

/**
 * Emit a new notification to a user
 */
export const emitNotification = (
  userId: string,
  notification: {
    id: string;
    type: string;
    title: string;
    message: string;
    referenceType?: string | null;
    referenceId?: string | null;
    createdAt: Date;
  }
): void => {
  emitToUser(userId, "notification", notification);
};

/**
 * Check if a user is currently connected
 */
export const isUserConnected = (userId: string): boolean => {
  return connectedUsers.has(userId) && connectedUsers.get(userId)!.size > 0;
};

/**
 * Get the Socket.IO server instance
 */
export const getIO = (): SocketIOServer | null => {
  return io;
};

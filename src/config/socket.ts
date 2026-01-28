import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  sessionId?: string;
}

export const initializeSocket = (httpServer: HTTPServer): Server => {
  const io = new Server(httpServer, {
    // cors: {
    //   origin: process.env.FRONTEND_URL,
    //   methods: ["GET", "POST"],
    //   credentials: true,
    // },
    cors: {
      origin: "*",
    },
    transports: ["websocket", "polling"], // Fallback to polling if WebSocket fails
    // reconnection: true,
    // reconnectionDelay: 1000,
    // reconnectionDelayMax: 5000,
    // reconnectionAttempts: 5,
  });

  // Middleware: Authenticate socket connection
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication failed: No token provided"));
      }

      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET as string
      );

      socket.userId = decoded._id;
      socket.sessionId = socket.id;

    //   logger.info(`Socket authenticated`, {
    //     userId: socket.userId,
    //     socketId: socket.sessionId,
    //   });

      next();
    } catch (err: any) {
    //   logger.error(`Socket authentication failed: ${err.message}`);
      next(new Error(`Authentication failed: ${err.message}`));
    }
  });

  // Connection handler
  io.on("connection", (socket: AuthenticatedSocket) => {
    // logger.info(`User ${socket.userId} connected to payment notifications`);

    // Join user-specific room for private notifications
    socket.join(`user:${socket.userId}`);
    socket.join(`user:${socket.userId}:payments`);

    socket.on("disconnect", () => {
    //   logger.info(`User ${socket.userId} disconnected`);
    });
  });

  return io;
};
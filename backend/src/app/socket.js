import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "./prisma/client.js";
import { envVars } from "./config/env.js";

let io;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // frontend domain here
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, envVars.JWT_SECRET_TOKEN);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = user;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.user;

    console.log("🔌 Socket connected:", user.email);

    // 🔒 Admin room (KEEP AS IS)
    if (user.role === "ADMIN" || user.role === "OWNER") {
      socket.join("admin-room");
      console.log(`👑 ${user.email} joined admin-room`);
    }

    // ✅ Student private room
    const studentRoom = `student:${user.id}`;
    socket.join(studentRoom);
    console.log(`🎓 ${user.email} joined ${studentRoom}`);

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", user.email);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

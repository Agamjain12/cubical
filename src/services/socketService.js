import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  const connectedUsers = new Map(); // Store socketId -> userId mapping

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Store user connection
    socket.on("register", ({ userId }) => {
      connectedUsers.set(socket.id, userId);
      console.log(`User ${userId} registered with socket ${socket.id}`);
    });

    // Handle call initiation
    socket.on("call-user", async ({ to, from, signalData }) => {
      try {
        // Fetch caller data from database
        const callerData = await prisma.user.findUnique({
          where: { googleId: from },
          select: {
            name: true,
            email: true,
            profilePicture: true,
            userType: true,
          },
        });

        const toSocketId = [...connectedUsers.entries()].find(
          ([_, userId]) => userId === to
        )?.[0];

        if (toSocketId) {
          io.to(toSocketId).emit("incoming-call", {
            from,
            signalData,
            callerData, // Include caller's data
          });
        }
      } catch (error) {
        console.error("Error in call-user event:", error);
      }
    });

    // Handle call acceptance
    socket.on("accept-call", ({ to, signalData }) => {
      const toSocketId = [...connectedUsers.entries()].find(
        ([_, userId]) => userId === to
      )?.[0];

      if (toSocketId) {
        io.to(toSocketId).emit("call-accepted", { signalData });
      }
    });

    // Handle call rejection
    socket.on("reject-call", ({ to }) => {
      const toSocketId = [...connectedUsers.entries()].find(
        ([_, userId]) => userId === to
      )?.[0];

      if (toSocketId) {
        io.to(toSocketId).emit("call-rejected");
      }
    });

    // Handle call end
    socket.on("end-call", ({ to }) => {
      const toSocketId = [...connectedUsers.entries()].find(
        ([_, userId]) => userId === to
      )?.[0];

      if (toSocketId) {
        io.to(toSocketId).emit("call-ended");
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      connectedUsers.delete(socket.id);
      console.log("Client disconnected:", socket.id);
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

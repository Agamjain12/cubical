import { PrismaClient } from "@prisma/client";
import { getIO } from "../services/socketService.js";

const prisma = new PrismaClient();

export const initiateCall = async (req, res) => {
  try {
    const { to } = req.body;
    const from = req.user.googleId; // From authenticated user

    // Verify if both users exist
    const [caller, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { googleId: from } }),
      prisma.user.findUnique({ where: { googleId: to } }),
    ]);

    if (!caller || !receiver) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Call initiated",
      data: {
        to: receiver.googleId,
        toName: receiver.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error initiating call",
      error: error.message,
    });
  }
};

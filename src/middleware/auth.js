import { verifyToken } from "../utils/jwt.js";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = verifyToken(token);

    // Verify if user exists and token matches their email
    const user = await prisma.user.findUnique({
      where: {
        email: decoded.email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Verify if token belongs to the correct user
    if (user.email !== decoded.email) {
      return res.status(401).json({
        success: false,
        message: "Invalid token for this user.",
      });
    }

    // Add full user object to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
      error: error.message,
    });
  }
};

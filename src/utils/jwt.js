import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      userType: user.userType,
    },
    JWT_SECRET,
    { expiresIn: "24h" }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error("Invalid token");
  }
};

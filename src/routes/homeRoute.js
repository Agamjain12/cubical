import express from "express";
import { authenticateToken } from "../middleware/auth.js";
const router = express.Router();

router.get("/home", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Welcome to protected home page",
    user: req.user,
  });
});

export default router;

import {
  GoogleLogin,
  GoogleLoginCallback,
  logout,
  setUserType,
  getUserProfile,
  fetchOperators,
} from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";
import express from "express";
const router = express.Router();

// Public routes
router.get("/health", (req, res) => {
  res.send("Hello World, API is running");
});
router.get("/auth/google", GoogleLogin);
router.get("/accounts/google/login/callback/", GoogleLoginCallback);
router.get("/logout", logout);

// Protected routes
router.patch("/set-user-type", authenticateToken, setUserType);
router.get("/profile", authenticateToken, getUserProfile);
router.get("/operators", authenticateToken, fetchOperators);

export default router;

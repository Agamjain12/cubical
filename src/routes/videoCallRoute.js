import express from "express";
import { initiateCall } from "../controllers/videoCallController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/call/initiate", authenticateToken, initiateCall);

export default router;

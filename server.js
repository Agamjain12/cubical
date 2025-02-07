import express from "express";
import cors from "cors";
import { createServer } from "http";
import authRoutes from "./src/routes/authRoute.js";
import { initializeSocket } from "./src/services/socketService.js";

const app = express();
const httpServer = createServer(app);

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://cubical-bw9p.onrender.com",
    "https://cubicals-agam.netlify.app",
  ],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRoutes);

// Initialize Socket.io
initializeSocket(httpServer);

httpServer.listen(6600, () => {
  console.log("Server started on port 6600");
});

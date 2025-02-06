import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/authRoute.js";
import homeRoutes from "./src/routes/homeRoute.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", authRoutes);
app.use("/", homeRoutes);

app.listen(6600, () => {
  console.log("Server started on port 6600");
});

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./config/db";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

import authRouter from "./routes/group1-user/auth.routes";
import profileRouter from "./routes/group2-profile/profile.routes";
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);

app.get("/health", (req, res) => {
  res.send({ status: "good response" });
});

async function start() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 Server is running on ${PORT}`);
  });
}

start();

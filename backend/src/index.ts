import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./config/db";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

import authRouter from "./routes/group1-user/auth.routes";
import profileRouter from "./routes/group2-profile/profile.routes";
import activityRouter from "./routes/group3-activity/activity.routes";
import connectionRouter from "./routes/group4-interaction/connection.routes";
import chatRouter from "./routes/group4-interaction/chat.routes";
import reviewRouter from "./routes/group5-review/review.routes";
import reportRouter from "./routes/group6-admin/report.routes";
import adminRouter from "./routes/group6-admin/admin.routes";
import accountRouter from "./routes/group6-admin/account.routes";
import rolePermissionRouter from "./routes/group6-admin/rolePermission.routes";

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/activities", activityRouter);
app.use("/api/connections", connectionRouter);
app.use("/api/chat", chatRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/reports", reportRouter);
app.use("/api/admin/accounts", accountRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", rolePermissionRouter);

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


import dotenv from "dotenv";
dotenv.config({ quiet: process.env.NODE_ENV === "test" });

import express from "express";
import cors from "cors";
import helmet from "helmet";
import {
  notFoundHandler,
  errorHandler,
} from "./middlewares/errorHandler.middleware";

import authRouter from "./routes/group1-user/auth.routes";
import profileRouter from "./routes/group2-profile/profile.routes";
import activityRouter from "./routes/group3-activity/activity.routes";
import connectionRouter from "./routes/group4-interaction/connection.routes";
import chatRouter from "./routes/group4-interaction/chat.routes";
import reviewRouter from "./routes/group5-review/review.routes";
import postRouter from "./routes/group4-interaction/post.routes";
import reportRouter from "./routes/group6-admin/report.routes";
import adminRouter from "./routes/group6-admin/admin.routes";
import accountRouter from "./routes/group6-admin/account.routes";
import rolePermissionRouter from "./routes/group6-admin/rolePermission.routes";

const app = express();

const corsOrigin = process.env.CORS_ORIGIN?.split(",");

app.use(helmet());
app.use(
  cors({
    origin: corsOrigin === undefined || corsOrigin === null ? "*" : corsOrigin,
  }),
);
app.use(express.json({ limit: "50mb" }));

app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/activities", activityRouter);
app.use("/api/connections", connectionRouter);
app.use("/api/chat", chatRouter);
app.use("/api/posts", postRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/reports", reportRouter);
app.use("/api/admin/accounts", accountRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", rolePermissionRouter);

app.get("/health", (req, res) => {
  res.send({ status: "good response" });
});

// Đặt SAU tất cả router: bắt mọi request không khớp route nào (404)
app.use(notFoundHandler);

// Đặt CUỐI CÙNG: xử lý lỗi tập trung cho toàn bộ app
app.use(errorHandler);

export default app;

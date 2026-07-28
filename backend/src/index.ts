import dotenv from "dotenv";
dotenv.config({ quiet: process.env.NODE_ENV === "test" });

import app from "./app";
import { connectDB, pool } from "./config/db";

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} nhận được, đang tắt server...`);
    server.close(async () => {
      await pool.end();
      console.log("✅ Đã đóng kết nối PostgreSQL, thoát chương trình.");
      process.exit(0);
    });
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
}

start();

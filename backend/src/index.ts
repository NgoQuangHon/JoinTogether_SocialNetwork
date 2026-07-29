import dotenv from "dotenv";
dotenv.config({ quiet: process.env.NODE_ENV === "test" });

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { connectDB, pool } from "./config/db";
import { ChatService } from "./services/group4-interaction/chat.service";

const PORT = process.env.PORT || 5000;
const chatService = new ChatService();

async function start() {
  await connectDB();

  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.on("join_room", (phongId: number | string) => {
      const roomName = `room_${phongId}`;
      socket.join(roomName);
    });

    socket.on("leave_room", (phongId: number | string) => {
      const roomName = `room_${phongId}`;
      socket.leave(roomName);
    });

    socket.on("send_message", async (data: { phongId: number; nguoiGuiId: number; noiDung: string; nguoiGuiTen?: string }) => {
      try {
        const { phongId, nguoiGuiId, noiDung, nguoiGuiTen } = data;
        const msg = await chatService.sendMessage(phongId, nguoiGuiId, noiDung);
        const roomName = `room_${phongId}`;
        io.to(roomName).emit("receive_message", {
          tinNhanId: msg.tinNhanId,
          phongId,
          nguoiGuiId,
          noiDung,
          taoLuc: msg.taoLuc || new Date().toISOString(),
          nguoiGuiTen: nguoiGuiTen || "Người dùng",
        });
      } catch (err: any) {
        socket.emit("chat_error", { message: err.message || "Lỗi khi gửi tin nhắn" });
      }
    });
  });

  const server = httpServer.listen(PORT, () => {
    console.log(`🚀 Server & Socket.IO running on port ${PORT}`);
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

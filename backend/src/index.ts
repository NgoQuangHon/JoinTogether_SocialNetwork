import dotenv from "dotenv";
dotenv.config({ quiet: process.env.NODE_ENV === "test" });

import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { connectDB, pool } from "./config/db";
import { ChatService } from "./services/group4-interaction/chat.service";
import { HoatDongRepository } from "./repositories/group3-activity/hoatDong.repository";
import { NearbyService } from "./services/group4-interaction/nearby.service";

const PORT = process.env.PORT || 5000;
const chatService = new ChatService();
const hoatDongRepo = new HoatDongRepository();
const nearbyService = new NearbyService();

async function start() {
  await connectDB();

  // Chạy ngay lần đầu và đặt timer 30s đồng bộ trạng thái theo thời gian
  await hoatDongRepo.syncActivityStatuses().catch(() => {});
  const syncInterval = setInterval(() => {
    hoatDongRepo.syncActivityStatuses().catch(() => {});
  }, 30000);

  const httpServer = http.createServer(app);
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  app.set("io", io);

  // Interval dọn dẹp các phòng chat tạm thời 10 phút đã hết hạn
  const cleanupInterval = setInterval(() => {
    nearbyService.cleanupExpiredRooms().catch(() => {});
  }, 10000);

  io.on("connection", (socket) => {
    // ================= CHAT EVENTS =================
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

    // ================= NEARBY MATCH EVENTS =================

    // Client bắt đầu quét tìm bạn
    socket.on("nearby_scan_start", async (data: { nguoiDungId: number; viDo: number; kinhDo: number }) => {
      const { nguoiDungId, viDo, kinhDo } = data;
      if (!nguoiDungId || !viDo || !kinhDo) return;

      try {
        await nearbyService.startScan(nguoiDungId, viDo, kinhDo, socket.id);
        socket.emit("nearby_scan_active", { message: "Đang tìm kiếm bạn phù hợp trong khu vực..." });

        // Tìm người phù hợp ngay lập tức
        const matches = await nearbyService.findMatches(nguoiDungId, viDo, kinhDo);
        if (matches.length === 0) return;

        const matchedUser = matches[0] as any;
        const matchedSocketId = matchedUser.socketId;
        if (!matchedSocketId) return;

        // Lấy thông tin người dùng A để gửi cho B
        const userAInfo = await pool.query(
          `SELECT nd.ho_ten, hnd.anh_dai_dien FROM nguoi_dung nd
           JOIN ho_so_nguoi_dung hnd ON hnd.nguoi_dung_id = nd.nguoi_dung_id
           WHERE nd.nguoi_dung_id = $1`,
          [nguoiDungId]
        );
        const userAData = userAInfo.rows[0];

        // Lấy sở thích của A
        const interestsARes = await pool.query(
          `SELECT st.ten_so_thich FROM so_thich st
           JOIN ho_so_so_thich hss ON hss.so_thich_id = st.so_thich_id
           JOIN ho_so_nguoi_dung hnd ON hnd.ho_so_id = hss.ho_so_id
           WHERE hnd.nguoi_dung_id = $1 LIMIT 5`,
          [nguoiDungId]
        );
        const soThichA = interestsARes.rows.map((r: any) => r.ten_so_thich);

        // Tạo match session
        const session = nearbyService.createMatchSession(nguoiDungId, matchedUser.nguoiDungId, socket.id, matchedSocketId);

        // Notify user A
        socket.emit("nearby_match_found", {
          matchId: session.matchId,
          nguoiDung: {
            nguoiDungId: matchedUser.nguoiDungId,
            hoTen: matchedUser.hoTen,
            anhDaiDien: matchedUser.anhDaiDien || null,
            soThichChung: matchedUser.soThichChung,
            khoangCachKm: matchedUser.khoangCachKm,
          },
          timer: 30,
        });

        // Notify user B
        io.to(matchedSocketId).emit("nearby_match_found", {
          matchId: session.matchId,
          nguoiDung: {
            nguoiDungId,
            hoTen: userAData?.ho_ten || "Người dùng",
            anhDaiDien: userAData?.anh_dai_dien || null,
            soThichChung: matchedUser.soThichChung,
            khoangCachKm: matchedUser.khoangCachKm,
          },
          timer: 30,
        });

        // Timer 30 giây — nếu hết giờ mà chưa cả 2 accept thì hủy
        const timer = setTimeout(async () => {
          const s = nearbyService.getMatchSession(session.matchId);
          if (s && (!s.acceptedA || !s.acceptedB)) {
            nearbyService.clearMatchSession(session.matchId);
            io.to(socket.id).emit("nearby_match_cancelled", { reason: "timeout" });
            io.to(matchedSocketId).emit("nearby_match_cancelled", { reason: "timeout" });
          }
        }, 30000);

        nearbyService.setMatchTimer(session.matchId, timer);

      } catch (err: any) {
        console.error("nearby_scan_start error:", err);
        socket.emit("nearby_error", { message: "Lỗi khi tìm kiếm. Vui lòng thử lại." });
      }
    });

    // Client dừng quét
    socket.on("nearby_scan_stop", async (data: { nguoiDungId: number }) => {
      if (!data?.nguoiDungId) return;
      try {
        await nearbyService.stopScan(data.nguoiDungId);
        socket.emit("nearby_scan_stopped", {});
      } catch {}
    });

    // Client đồng ý kết nối ở màn hình 30s
    socket.on("nearby_match_accept", async (data: { matchId: string; nguoiDungId: number }) => {
      const { matchId, nguoiDungId } = data;
      const session = nearbyService.getMatchSession(matchId);
      if (!session) {
        socket.emit("nearby_match_cancelled", { reason: "session_expired" });
        return;
      }

      const { bothAccepted } = nearbyService.acceptMatch(matchId, Number(nguoiDungId));

      if (bothAccepted) {
        try {
          nearbyService.clearMatchSession(matchId);
          const { chatRoomId } = await nearbyService.finalizeMatch(session.userAId, session.userBId);

          // Lấy thông tin cả 2 để gửi cho nhau
          const usersRes = await pool.query(
            `SELECT nd.nguoi_dung_id, nd.ho_ten, hnd.anh_dai_dien FROM nguoi_dung nd
             JOIN ho_so_nguoi_dung hnd ON hnd.nguoi_dung_id = nd.nguoi_dung_id
             WHERE nd.nguoi_dung_id = ANY($1::bigint[])`,
            [[session.userAId, session.userBId]]
          );
          const usersMap: any = {};
          usersRes.rows.forEach((r: any) => { usersMap[r.nguoi_dung_id] = r; });

          io.to(session.socketAId).emit("nearby_match_success", {
            chatRoomId,
            friend: { nguoiDungId: session.userBId, hoTen: usersMap[session.userBId]?.ho_ten, anhDaiDien: usersMap[session.userBId]?.anh_dai_dien },
          });
          io.to(session.socketBId).emit("nearby_match_success", {
            chatRoomId,
            friend: { nguoiDungId: session.userAId, hoTen: usersMap[session.userAId]?.ho_ten, anhDaiDien: usersMap[session.userAId]?.anh_dai_dien },
          });
        } catch (err: any) {
          console.error("nearby finalize error:", err);
          socket.emit("nearby_error", { message: "Lỗi khi kết nối. Vui lòng thử lại." });
        }
      } else {
        // Thông báo cho người dùng này là đã ghi nhận đồng ý
        socket.emit("nearby_match_waiting", { message: "Đang chờ đối phương đồng ý..." });
      }
    });

    // Client từ chối kết nối ở màn hình 30s
    socket.on("nearby_match_decline", (data: { matchId: string; nguoiDungId: number }) => {
      const session = nearbyService.getMatchSession(data.matchId);
      if (!session) return;
      nearbyService.clearMatchSession(data.matchId);
      io.to(session.socketAId).emit("nearby_match_cancelled", { reason: "declined" });
      io.to(session.socketBId).emit("nearby_match_cancelled", { reason: "declined" });
    });

    // ================= CHAT FRIEND PROPOSAL EVENTS =================
    socket.on("nearby_friend_proposal_agree", async (data: { phongId: number; nguoiDungId: number }) => {
      const { phongId, nguoiDungId } = data;
      if (!phongId || !nguoiDungId) return;

      try {
        const { bothAccepted, isFriend } = await nearbyService.acceptFriendProposal(Number(phongId), Number(nguoiDungId));
        const roomName = `room_${phongId}`;

        if (bothAccepted && isFriend) {
          io.to(roomName).emit("nearby_friend_accepted", { phongId, isFriend: true });
        } else {
          io.to(roomName).emit("nearby_friend_pending", { phongId, agreedByUserId: Number(nguoiDungId) });
        }
      } catch (err: any) {
        socket.emit("chat_error", { message: "Lỗi khi xử lý đề xuất kết bạn." });
      }
    });

    socket.on("nearby_friend_proposal_decline", async (data: { phongId: number; nguoiDungId: number }) => {
      const { phongId, nguoiDungId } = data;
      if (!phongId || !nguoiDungId) return;

      try {
        await nearbyService.declineFriendProposal(Number(phongId), Number(nguoiDungId));
        const roomName = `room_${phongId}`;
        io.to(roomName).emit("nearby_friend_declined", { phongId, declinedByUserId: Number(nguoiDungId) });
      } catch {}
    });

    // Dọn dẹp khi ngắt kết nối
    socket.on("disconnect", async () => {
      try {
        // Tìm người dùng theo socket.id và dừng quét
        const res = await pool.query(
          `SELECT nguoi_dung_id FROM phien_quet_ban WHERE socket_id = $1`,
          [socket.id]
        );
        if (res.rows.length > 0) {
          await nearbyService.stopScan(Number(res.rows[0].nguoi_dung_id));
        }
      } catch {}
    });
  });

  const server = httpServer.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`🚀 Server & Socket.IO running on port ${PORT}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} nhận được, đang tắt server...`);
    clearInterval(syncInterval);
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

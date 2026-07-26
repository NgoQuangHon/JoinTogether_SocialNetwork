import { Router } from "express";
import { ChatController } from "../../controllers/group4-interaction/chat.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireActivityMember } from "../../middlewares/authorization.middleware";

const chatRouter = Router();
const chatController = new ChatController();

// ==================== UC4.2: PHÒNG TRÒ CHUYỆN ====================

// GET /api/chat/rooms — Danh sách phòng của tôi
chatRouter.get("/rooms", authenticateToken, chatController.getUserRooms);

// GET /api/chat/rooms/:hoatDongId — Lấy/tạo phòng trò chuyện cho hoạt động
chatRouter.get(
  "/rooms/:hoatDongId",
  authenticateToken,
  requireActivityMember("hoatDongId"),
  chatController.getOrCreateRoom,
);

// ==================== UC4.2: TIN NHẮN ====================

// POST /api/chat/rooms/:phongId/messages — Gửi tin nhắn
chatRouter.post(
  "/rooms/:phongId/messages",
  authenticateToken,
  chatController.sendMessage,
);

// GET /api/chat/rooms/:phongId/messages — Lấy tin nhắn
chatRouter.get(
  "/rooms/:phongId/messages",
  authenticateToken,
  chatController.getMessages,
);

// DELETE /api/chat/messages/:tinNhanId — Xóa tin nhắn
chatRouter.delete(
  "/messages/:tinNhanId",
  authenticateToken,
  chatController.deleteMessage,
);

// ==================== THÔNG BÁO ====================

// GET /api/chat/notifications — Lấy thông báo của tôi
chatRouter.get(
  "/notifications",
  authenticateToken,
  chatController.getNotifications,
);

// DELETE /api/chat/notifications/:thongBaoId — Xóa thông báo
chatRouter.delete(
  "/notifications/:thongBaoId",
  authenticateToken,
  chatController.deleteNotification,
);

export default chatRouter;

import { Router } from "express";
import { SupportController } from "../../controllers/group6-admin/support.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/authorization.middleware";

const supportRouter = Router();
const supportController = new SupportController();

// Người dùng gửi yêu cầu hỗ trợ
supportRouter.post("/", authenticateToken, supportController.createSupportRequest);

// Admin xem danh sách
supportRouter.get("/", authenticateToken, requireAdmin, supportController.getSupportRequests);

// Admin xem chi tiết
supportRouter.get("/:id", authenticateToken, requireAdmin, supportController.getSupportRequestById);

// Admin xử lý yêu cầu
supportRouter.put("/:id/process", authenticateToken, requireAdmin, supportController.processSupportRequest);

export default supportRouter;

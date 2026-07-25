import { Router } from "express";
import { AdminController } from "../../controllers/group6-admin/admin.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/authorization.middleware";

const adminRouter = Router();
const adminController = new AdminController();

// --- Nhật ký quản trị (UC6.3) ---
adminRouter.get("/audit-logs", authenticateToken, requireAdmin, adminController.getAuditLogs);

export default adminRouter;


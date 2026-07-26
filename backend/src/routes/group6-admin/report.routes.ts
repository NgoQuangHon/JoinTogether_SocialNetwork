import { Router } from "express";
import { ReportController } from "../../controllers/group6-admin/report.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireAdmin } from "../../middlewares/authorization.middleware";

const reportRouter = Router();
const reportController = new ReportController();

// --- UC6.3: Quản lý loại vi phạm (admin) ---
reportRouter.put("/violation-types/:id", authenticateToken, requireAdmin, reportController.updateLoaiViPham);
reportRouter.delete("/violation-types/:id", authenticateToken, requireAdmin, reportController.deleteLoaiViPham);

// --- Loại vi phạm (public, có thể xem trước khi báo cáo) ---
reportRouter.get("/violation-types", authenticateToken, reportController.getLoaiViPham);
reportRouter.post("/violation-types", authenticateToken, requireAdmin, reportController.createLoaiViPham);

// --- Thống kê vi phạm (admin) ---
reportRouter.get("/stats", authenticateToken, requireAdmin, reportController.getViolationStats);

// --- Báo cáo vi phạm (UC6.1) ---
reportRouter.post("/", authenticateToken, reportController.createReport);

// --- Danh sách báo cáo (admin) ---
reportRouter.get("/", authenticateToken, requireAdmin, reportController.getReports);
reportRouter.get("/:id", authenticateToken, requireAdmin, reportController.getReportById);

// --- Xử lý báo cáo (UC6.2 - admin) ---
reportRouter.put("/:id/process", authenticateToken, requireAdmin, reportController.processReport);

export default reportRouter;


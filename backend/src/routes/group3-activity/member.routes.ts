import { Router } from "express";
import { MemberController } from "../../controllers/group3-activity/member.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireActivityOwner } from "../../middlewares/authorization.middleware";

const memberRouter = Router();
const memberController = new MemberController();

// ==================== UC4.1: GỬI YÊU CẦU THAM GIA ====================
// POST /api/activities/:id/join — Gửi yêu cầu tham gia hoạt động
memberRouter.post(
  "/:id/join",
  authenticateToken,
  memberController.sendJoinRequest,
);

// ==================== THÀNH VIÊN ====================
// GET /api/activities/:id/members — Danh sách thành viên
memberRouter.get(
  "/:id/members",
  authenticateToken,
  memberController.getMembers,
);

// DELETE /api/activities/:id/leave — Rời hoạt động
memberRouter.delete(
  "/:id/leave",
  authenticateToken,
  memberController.leaveActivity,
);

// ==================== UC4.3: DUYỆT YÊU CẦU THAM GIA ====================
// GET /api/activities/:id/requests — Danh sách yêu cầu đang chờ
memberRouter.get(
  "/:id/requests",
  authenticateToken,
  requireActivityOwner("id"),
  memberController.getPendingRequests,
);

// PUT /api/activities/:id/requests/:yeuCauId/approve — Chấp nhận yêu cầu
memberRouter.put(
  "/:id/requests/:yeuCauId/approve",
  authenticateToken,
  requireActivityOwner("id"),
  memberController.approveRequest,
);

// PUT /api/activities/:id/requests/:yeuCauId/reject — Từ chối yêu cầu
memberRouter.put(
  "/:id/requests/:yeuCauId/reject",
  authenticateToken,
  requireActivityOwner("id"),
  memberController.rejectRequest,
);

// ==================== XÓA THÀNH VIÊN ====================
// DELETE /api/activities/:id/members/:thanhVienId — Xóa thành viên
memberRouter.delete(
  "/:id/members/:thanhVienId",
  authenticateToken,
  requireActivityOwner("id"),
  memberController.removeMember,
);

// ==================== XÁC NHẬN THAM DỰ ====================
// PUT /api/activities/:id/members/:thanhVienId/confirm — Xác nhận tham dự
memberRouter.put(
  "/:id/members/:thanhVienId/confirm",
  authenticateToken,
  requireActivityOwner("id"),
  memberController.confirmAttendance,
);

// GET /api/activities/:id/attendance — Danh sách điểm danh
memberRouter.get(
  "/:id/attendance",
  authenticateToken,
  requireActivityOwner("id"),
  memberController.getAttendanceList,
);

export default memberRouter;

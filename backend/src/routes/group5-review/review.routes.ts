import { Router } from "express";
import { ReviewController } from "../../controllers/group5-review/review.controller";
import { authenticateToken } from "../../middlewares/auth.middleware";
import { requireReviewParticipant } from "../../middlewares/authorization.middleware";

const reviewRouter = Router();
const reviewController = new ReviewController();

// ==================== UC5.1: GỬI ĐÁNH GIÁ ====================

// POST /api/reviews — Gửi đánh giá (cần tham gia cùng hoạt động)
reviewRouter.post(
  "/",
  authenticateToken,
  requireReviewParticipant("hoatDongId", "nguoiDuocDanhGiaId"),
  reviewController.createReview,
);

// ==================== UC5.2: XEM ĐÁNH GIÁ ====================

// GET /api/reviews/activity/:hoatDongId — Đánh giá trong hoạt động
reviewRouter.get(
  "/activity/:hoatDongId",
  authenticateToken,
  reviewController.getReviewsByActivity,
);

// GET /api/reviews/user/:nguoiDungId — Đánh giá dành cho người dùng
reviewRouter.get(
  "/user/:nguoiDungId",
  authenticateToken,
  reviewController.getReviewsForUser,
);

// GET /api/reviews/detail/:danhGiaId — Chi tiết đánh giá
reviewRouter.get(
  "/detail/:danhGiaId",
  authenticateToken,
  reviewController.getReviewDetail,
);

// ==================== TIÊU CHÍ ĐÁNH GIÁ ====================

// GET /api/reviews/criteria — Danh sách tiêu chí đánh giá
reviewRouter.get("/criteria", authenticateToken, reviewController.getAllTieuChi);

// ==================== UC5.3: ĐIỂM UY TÍN ====================

// GET /api/reviews/reputation/:nguoiDungId — Xem điểm uy tín
reviewRouter.get(
  "/reputation/:nguoiDungId",
  authenticateToken,
  reviewController.getReputation,
);

// GET /api/reviews/reputation/:nguoiDungId/history — Lịch sử điểm uy tín
reviewRouter.get(
  "/reputation/:nguoiDungId/history",
  authenticateToken,
  reviewController.getReputationHistory,
);

export default reviewRouter;


import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ReviewService } from "../../services/group5-review/review.service";

export class ReviewController {
  private reviewService = new ReviewService();

  // ==================== UC5.1: GỬI ĐÁNH GIÁ ====================

  public createReview = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDanhGiaId = req.user!.nguoiDungId;
      const { hoatDongId, nguoiDuocDanhGiaId, nhanXet, diemTong, chiTiet } = req.body;

      if (!hoatDongId || !nguoiDuocDanhGiaId) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp ID hoạt động và ID người được đánh giá." });
        return;
      }

      const result = await this.reviewService.createReview(nguoiDanhGiaId, hoatDongId, nguoiDuocDanhGiaId, {
        nhanXet,
        diemTong,
        chiTiet,
      });

      res.status(201).json({ success: true, message: "Đã gửi đánh giá.", data: result });
    });

  // ==================== UC5.2: XEM ĐÁNH GIÁ ====================

  public getReviewsByActivity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const hoatDongId = parseInt(req.params.hoatDongId as string, 10);

      if (isNaN(hoatDongId)) {
        res.status(400).json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReviewsByActivity(hoatDongId);
      res.status(200).json({ success: true, data: result });
    });

  public getReviewsForUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDuocDanhGiaId = parseInt(req.params.nguoiDungId as string, 10);

      if (isNaN(nguoiDuocDanhGiaId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReviewsForUser(nguoiDuocDanhGiaId);
      res.status(200).json({ success: true, data: result });
    });

  public getReviewDetail = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const danhGiaId = parseInt(req.params.danhGiaId as string, 10);

      if (isNaN(danhGiaId)) {
        res.status(400).json({ success: false, message: "ID đánh giá không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReviewDetail(danhGiaId);
      res.status(200).json({ success: true, data: result });
    });

  // ==================== TIÊU CHÍ ĐÁNH GIÁ ====================

  public getAllTieuChi = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
      const result = await this.reviewService.getAllTieuChi();
      res.status(200).json({ success: true, data: result });
    });

  // ==================== UC5.3: XEM ĐIỂM UY TÍN ====================

  public getReputation = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = parseInt(req.params.nguoiDungId as string, 10);

      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReputation(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    });

  public getReputationHistory = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = parseInt(req.params.nguoiDungId as string, 10);

      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReputationHistory(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    });
}


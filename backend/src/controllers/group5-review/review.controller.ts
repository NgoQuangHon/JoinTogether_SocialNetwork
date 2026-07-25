import { Request, Response } from "express";
import { ReviewService } from "../../services/group5-review/review.service";

export class ReviewController {
  private reviewService = new ReviewService();

  // ==================== UC5.1: GỬI ĐÁNH GIÁ ====================

  public createReview = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDanhGiaId = (req as any).user.nguoiDungId;
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
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== UC5.2: XEM ĐÁNH GIÁ ====================

  public getReviewsByActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const hoatDongId = parseInt(req.params.hoatDongId as string, 10);

      if (isNaN(hoatDongId)) {
        res.status(400).json({ success: false, message: "ID hoạt động không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReviewsByActivity(hoatDongId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getReviewsForUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDuocDanhGiaId = parseInt(req.params.nguoiDungId as string, 10);

      if (isNaN(nguoiDuocDanhGiaId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReviewsForUser(nguoiDuocDanhGiaId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getReviewDetail = async (req: Request, res: Response): Promise<void> => {
    try {
      const danhGiaId = parseInt(req.params.danhGiaId as string, 10);

      if (isNaN(danhGiaId)) {
        res.status(400).json({ success: false, message: "ID đánh giá không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReviewDetail(danhGiaId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== TIÊU CHÍ ĐÁNH GIÁ ====================

  public getAllTieuChi = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.reviewService.getAllTieuChi();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== UC5.3: XEM ĐIỂM UY TÍN ====================

  public getReputation = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = parseInt(req.params.nguoiDungId as string, 10);

      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReputation(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getReputationHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = parseInt(req.params.nguoiDungId as string, 10);

      if (isNaN(nguoiDungId)) {
        res.status(400).json({ success: false, message: "ID người dùng không hợp lệ." });
        return;
      }

      const result = await this.reviewService.getReputationHistory(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}


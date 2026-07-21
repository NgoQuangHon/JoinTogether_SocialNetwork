import { Request, Response } from "express";
import { ProfileService } from "../../services/group2-profile/profile.service";

export class ProfileController {
  private profileService = new ProfileService();

  // ==================== UC1.3 - PROFILE ====================

  public getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = parseInt(req.params.id as string, 10);

      if (isNaN(nguoiDungId)) {
        res.status(400).json({
          success: false,
          message: "ID người dùng không hợp lệ.",
        });
        return;
      }

      const profile = await this.profileService.getProfile(nguoiDungId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  public getMyProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;

      const profile = await this.profileService.getProfile(nguoiDungId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  public updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;

      const { tieuSu, ngaySinh, khuVuc } = req.body;

      // Validate ngaySinh if provided
      if (ngaySinh && isNaN(Date.parse(ngaySinh))) {
        res.status(400).json({
          success: false,
          message: "Ngày sinh không hợp lệ.",
          invalidFields: ["ngaySinh"],
        });
        return;
      }

      const updatedProfile = await this.profileService.updateProfile(
        nguoiDungId,
        {
          tieuSu,
          ngaySinh: ngaySinh || null,
          khuVuc: khuVuc || null,
          ...req.body,
        }
      );

      res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công.",
        data: updatedProfile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
        invalidFields: error.invalidFields || [],
      });
    }
  };

  public updateAvatar = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const { anhDaiDien } = req.body;

      if (!anhDaiDien) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp đường dẫn ảnh đại diện.",
        });
        return;
      }

      const updated = await this.profileService.updateAvatar(
        nguoiDungId,
        anhDaiDien
      );

      res.status(200).json({
        success: true,
        message: "Cập nhật ảnh đại diện thành công.",
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  // ==================== UC1.4 - INTERESTS ====================

  public getAllInterestCategories = async (
    _req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const categories = await this.profileService.getAllInterestCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  public getUserInterests = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const interests = await this.profileService.getUserInterests(
        nguoiDungId
      );

      res.status(200).json({
        success: true,
        data: interests,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };

  public addInterest = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const { soThichId, mucDoQuanTam } = req.body;

      if (!soThichId) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp ID sở thích.",
        });
        return;
      }

      const result = await this.profileService.addInterest(
        nguoiDungId,
        soThichId,
        mucDoQuanTam ?? null
      );

      res.status(201).json({
        success: true,
        message: "Thêm sở thích thành công.",
        data: result,
      });
    } catch (error: any) {
      const statusCode =
        error.message === "Sở thích đã tồn tại trong hồ sơ." ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  public removeInterest = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const soThichId = parseInt(req.params.soThichId as string, 10);

      if (isNaN(soThichId)) {
        res.status(400).json({
          success: false,
          message: "ID sở thích không hợp lệ.",
        });
        return;
      }

      await this.profileService.removeInterest(nguoiDungId, soThichId);

      res.status(200).json({
        success: true,
        message: "Xóa sở thích thành công.",
      });
    } catch (error: any) {
      const statusCode =
        error.message === "Sở thích không tồn tại trong hồ sơ." ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  };

  public updateGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiDungId = (req as any).user.nguoiDungId;
      const { mucTieuThamGia, thoiGianRanh } = req.body;

      const updated = await this.profileService.updateProfileGoals(
        nguoiDungId,
        {
          mucTieuThamGia,
          thoiGianRanh,
        }
      );

      res.status(200).json({
        success: true,
        message: "Cập nhật mục tiêu và thời gian rảnh thành công.",
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  };
}


import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ProfileService } from "../../services/group2-profile/profile.service";

export class ProfileController {
  private profileService = new ProfileService();

  // ==================== UC1.3 - PROFILE ====================

  public getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
    });

  public getMyProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const profile = await this.profileService.getProfile(nguoiDungId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    });

  public updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const { hoTen, email, soDienThoai, tieuSu, ngaySinh, khuVuc, gioiTinh, mucTieuThamGia, thoiGianRanh } = req.body;

      const invalidFields: string[] = [];

      if (hoTen !== undefined && (!hoTen || typeof hoTen !== 'string' || hoTen.trim().length < 2)) {
        invalidFields.push('hoTen');
      }

      if (email !== undefined && email !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          invalidFields.push('email');
        }
      }

      if (soDienThoai !== undefined && soDienThoai !== '') {
        const phoneClean = soDienThoai.replace(/[\s\-()]/g, '');
        if (phoneClean.length < 9 || phoneClean.length > 15 || !/^\d+$/.test(phoneClean)) {
          invalidFields.push('soDienThoai');
        }
      }

      if (ngaySinh && isNaN(Date.parse(ngaySinh))) {
        invalidFields.push('ngaySinh');
      }

      if (invalidFields.length > 0) {
        res.status(400).json({
          success: false,
          message: "Dữ liệu không hợp lệ.",
          invalidFields,
        });
        return;
      }

      const updatedProfile = await this.profileService.updateProfile(
        nguoiDungId,
        { hoTen, email, soDienThoai, tieuSu, ngaySinh: ngaySinh || null, khuVuc: khuVuc || null, gioiTinh: gioiTinh || null, mucTieuThamGia: mucTieuThamGia || null, thoiGianRanh: thoiGianRanh || null }
      );

      res.status(200).json({
        success: true,
        message: "Cập nhật hồ sơ thành công.",
        data: updatedProfile,
      });
    });

  public updateAvatar = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
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
    });

  // ==================== UC1.4 - INTERESTS ====================

  public getAllInterestCategories = asyncHandler(async (
    _req: Request,
    res: Response
  ): Promise<void> => {
      const categories = await this.profileService.getAllInterestCategories();

      res.status(200).json({
        success: true,
        data: categories,
      });
    });

  public getUserInterests = asyncHandler(async (
    req: Request,
    res: Response
  ): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const interests = await this.profileService.getUserInterests(
        nguoiDungId
      );

      res.status(200).json({
        success: true,
        data: interests,
      });
    });

  public addInterest = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
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
        mucDoQuanTam ? mucDoQuanTam : null
      );

      res.status(201).json({
        success: true,
        message: "Thêm sở thích thành công.",
        data: result,
      });
    });

  public removeInterest = asyncHandler(async (
    req: Request,
    res: Response
  ): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
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
    });

  public updateGoals = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const { mucTieuThamGia, thoiGianRanh, banKinhMongMuon } = req.body;

      const updated = await this.profileService.updateProfileGoals(
        nguoiDungId,
        {
          mucTieuThamGia,
          thoiGianRanh,
          banKinhMongMuon: banKinhMongMuon !== undefined ? banKinhMongMuon : null,
        }
      );

      res.status(200).json({
        success: true,
        message: "Cập nhật mục tiêu, thời gian rảnh và phạm vi mong muốn thành công.",
        data: updated,
      });
    });
}

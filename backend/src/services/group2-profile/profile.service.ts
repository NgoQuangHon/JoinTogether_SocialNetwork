import { HoSoNguoiDungRepository } from "../../repositories/group2-profile/hoSoNguoiDung.repository";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { SoThichRepository } from "../../repositories/group2-profile/soThich.repository";
import { HoSoSoThichRepository } from "../../repositories/group2-profile/hoSoSoThich.repository";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/AppError";

export class ProfileService {
  private hoSoNguoiDungRepo = new HoSoNguoiDungRepository();
  private nguoiDungRepo = new NguoiDungRepository();
  private soThichRepo = new SoThichRepository();
  private hoSoSoThichRepo = new HoSoSoThichRepository();

  // ==================== UC1.3 - PROFILE ====================

  async getProfile(nguoiDungId: number): Promise<any> {
    let profile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);

    if (!profile) {
      // Auto-create profile if not exists
      profile = await this.hoSoNguoiDungRepo.create({ nguoiDungId });
    }

    // Get interests for this profile
    const interests = await this.soThichRepo.findInterestsByProfileId(
      profile.hoSoId!,
    );

    const user = await this.nguoiDungRepo.findById(nguoiDungId);

    const result: any = {};
    Object.assign(result, profile);
    result.soThich = interests;
    result.user = user
      ? { hoTen: user.hoTen, email: user.email, soDienThoai: user.soDienThoai }
      : null;
    return result;
  }

  async updateProfile(nguoiDungId: number, data: any): Promise<any> {
    // Ensure profile exists
    const existingProfile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);
    if (!existingProfile) {
      await this.hoSoNguoiDungRepo.create({ nguoiDungId });
    }

    const updatedProfile = await this.hoSoNguoiDungRepo.update(nguoiDungId, {
      tieuSu: data.tieuSu,
      ngaySinh: data.ngaySinh,
      khuVuc: data.khuVuc,
      gioiTinh: data.gioiTinh,
      mucTieuThamGia: data.mucTieuThamGia,
      thoiGianRanh: data.thoiGianRanh,
      anhDaiDien: data.anhDaiDien,
    });

    if (!updatedProfile) {
      throw new BadRequestError("Không tìm thấy hồ sơ người dùng.");
    }

    if (data.hoTen !== undefined || data.email !== undefined || data.soDienThoai !== undefined) {
      const userUpdateData: any = {};
      if (data.hoTen !== undefined) userUpdateData.hoTen = data.hoTen;
      if (data.email !== undefined) userUpdateData.email = data.email;
      if (data.soDienThoai !== undefined) userUpdateData.soDienThoai = data.soDienThoai;
      await this.nguoiDungRepo.update(nguoiDungId, userUpdateData);
    }

    return updatedProfile;
  }

  async getAIMatches(currentUserId: number): Promise<any[]> {
    const currentProfile = await this.getProfile(currentUserId);
    const currentInterests: string[] = (currentProfile.soThich || []).map((s: any) => s.tenSoThich?.toLowerCase() || s.toLowerCase());
    const currentKhuVuc = (currentProfile.khuVuc || '').toLowerCase().trim();

    // Lấy tất cả người dùng trừ người hiện tại
    const allUsers = await this.nguoiDungRepo.findAll();
    const otherUsers = allUsers.filter((u: any) => u.nguoiDungId !== currentUserId);

    const results = [];
    for (const u of otherUsers) {
      const prof = await this.getProfile(u.nguoiDungId);
      const userInterests: string[] = (prof.soThich || []).map((s: any) => s.tenSoThich?.toLowerCase() || s.toLowerCase());
      const userInterestsRaw: string[] = (prof.soThich || []).map((s: any) => s.tenSoThich || s);
      const userKhuVuc = (prof.khuVuc || '').toLowerCase().trim();

      // Tính điểm trùng sở thích
      const commonInterests = currentInterests.filter(i => userInterests.includes(i));
      let score = 50; // base score
      score += Math.min(40, commonInterests.length * 12);

      if (currentKhuVuc && userKhuVuc && (currentKhuVuc.includes(userKhuVuc) || userKhuVuc.includes(currentKhuVuc))) {
        score += 10;
      }

      score = Math.min(99, score);

      let reason = 'Gợi ý kết nối dựa trên hồ sơ cộng đồng';
      if (commonInterests.length > 0) {
        reason = `Có ${commonInterests.length} sở thích chung cùng bạn`;
      } else if (score >= 60) {
        reason = 'Cùng khu vực sinh sống và tần suất hoạt động tương đồng';
      }

      results.push({
        nguoiDungId: u.nguoiDungId,
        hoTen: u.hoTen,
        anhDaiDien: prof.anhDaiDien,
        khuVuc: prof.khuVuc || 'Chưa cập nhật',
        tieuSu: prof.tieuSu || '',
        soThich: userInterestsRaw.length ? userInterestsRaw : ['Giao lưu', 'Tham gia sự kiện'],
        matchScore: score,
        reason,
      });
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    return results;
  }

  async updateAvatar(nguoiDungId: number, anhDaiDien: string): Promise<any> {
    // Check if profile exists, create if not
    let profile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);
    if (!profile) {
      profile = await this.hoSoNguoiDungRepo.create({ nguoiDungId });
    }

    const updated = await this.hoSoNguoiDungRepo.updateAvatar(
      nguoiDungId,
      anhDaiDien,
    );
    return updated;
  }

  // ==================== UC1.4 - INTERESTS ====================

  async getAllInterestCategories(): Promise<any> {
    const categories = await this.soThichRepo.findAllCategories();
    const interests = await this.soThichRepo.findAllInterestsByCategory();

    // Group interests by category
    const result = categories.map((cat: any) => ({
      ...cat,
      soThich: interests.filter(
        (i: any) => i.danhMucSoThichId === cat.danhMucSoThichId,
      ),
    }));

    // Add uncategorized interests
    const uncategorized = interests.filter((i: any) => !i.danhMucSoThichId);
    if (uncategorized.length > 0) {
      result.push({
        danhMucSoThichId: null,
        tenDanhMuc: "Khác",
        moTa: "Sở thích không thuộc danh mục nào",
        soThich: uncategorized,
      });
    }

    return result;
  }

  async getUserInterests(nguoiDungId: number): Promise<any> {
    let profile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);
    if (!profile) {
      return [];
    }

    return this.soThichRepo.findInterestsByProfileId(profile.hoSoId!);
  }

  async addInterest(
    nguoiDungId: number,
    soThichId: number,
    mucDoQuanTam?: number | null,
  ): Promise<any> {
    // Verify interest exists
    const interest = await this.soThichRepo.findById(soThichId);
    if (!interest) {
      throw new NotFoundError("Sở thích không tồn tại.");
    }

    // Ensure profile exists
    let profile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);
    if (!profile) {
      profile = await this.hoSoNguoiDungRepo.create({ nguoiDungId });
    }

    // Check for duplicate
    const existing = await this.hoSoSoThichRepo.findByHoSoIdAndSoThichId(
      profile.hoSoId!,
      soThichId,
    );
    if (existing) {
      throw new ConflictError("Sở thích đã tồn tại trong hồ sơ.");
    }

    const result = await this.hoSoSoThichRepo.addInterest(
      profile.hoSoId!,
      soThichId,
      mucDoQuanTam,
    );

    return result;
  }

  async removeInterest(nguoiDungId: number, soThichId: number): Promise<void> {
    const profile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);
    if (!profile) {
      throw new BadRequestError("Không tìm thấy hồ sơ người dùng.");
    }

    const removed = await this.hoSoSoThichRepo.removeInterest(
      profile.hoSoId!,
      soThichId,
    );

    if (!removed) {
      throw new NotFoundError("Sở thích không tồn tại trong hồ sơ.");
    }
  }

  async updateProfileGoals(
    nguoiDungId: number,
    data: {
      mucTieuThamGia?: string;
      thoiGianRanh?: string;
      banKinhMongMuon?: number | null;
    },
  ): Promise<any> {
    let profile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);
    if (!profile) {
      profile = await this.hoSoNguoiDungRepo.create({ nguoiDungId });
    }

    const updated = await this.hoSoNguoiDungRepo.update(nguoiDungId, {
      mucTieuThamGia: data.mucTieuThamGia ? data.mucTieuThamGia : null,
      thoiGianRanh: data.thoiGianRanh ? data.thoiGianRanh : null,
      banKinhMongMuon: data.banKinhMongMuon !== undefined ? data.banKinhMongMuon : null,
    });

    return updated;
  }
}

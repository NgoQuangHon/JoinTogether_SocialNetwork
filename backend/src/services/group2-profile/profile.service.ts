import { HoSoNguoiDungRepository } from "../../repositories/group2-profile/hoSoNguoiDung.repository";
import { NguoiDungRepository } from "../../repositories/group1-user/nguoiDung.repository";
import { SoThichRepository } from "../../repositories/group2-profile/soThich.repository";
import { HoSoSoThichRepository } from "../../repositories/group2-profile/hoSoSoThich.repository";
import { BadRequestError, ConflictError, NotFoundError } from "../../utils/AppError";
import { pool } from "../../config/db";

export class ProfileService {
  private hoSoNguoiDungRepo = new HoSoNguoiDungRepository();
  private nguoiDungRepo = new NguoiDungRepository();
  private soThichRepo = new SoThichRepository();
  private hoSoSoThichRepo = new HoSoSoThichRepository();

  // ==================== UC1.3 - PROFILE ====================

  async getProfile(nguoiDungId: number): Promise<any> {
    const user = await this.nguoiDungRepo.findById(nguoiDungId);
    if (!user) {
      throw new NotFoundError("Tài khoản chưa tồn tại trên Cơ sở dữ liệu mới. Vui lòng bấm Đăng xuất và Đăng ký tài khoản mới.");
    }

    let profile = await this.hoSoNguoiDungRepo.findByNguoiDungId(nguoiDungId);

    if (!profile) {
      // Auto-create profile if not exists
      profile = await this.hoSoNguoiDungRepo.create({ nguoiDungId });
    }

    // Get interests for this profile
    const interests = await this.soThichRepo.findInterestsByProfileId(
      profile.hoSoId!,
    );

    // Kiểm tra trạng thái xác thực tài khoản từ tai_khoan
    const accountRes = await pool.query(
      `SELECT da_xac_thuc FROM tai_khoan WHERE nguoi_dung_id = $1`,
      [nguoiDungId]
    );
    const daXacThuc = accountRes.rows[0]?.da_xac_thuc === true;

    let tuoi: number | null = null;
    if (profile.ngaySinh) {
      const dob = new Date(profile.ngaySinh);
      if (!isNaN(dob.getTime())) {
        const today = new Date();
        tuoi = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          tuoi--;
        }
      }
    }

    const result: any = {};
    Object.assign(result, profile);
    result.tuoi = tuoi;
    result.soThich = interests;
    result.daXacThuc = daXacThuc;
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
    const currentInterests: string[] = (currentProfile.soThich || []).map((s: any) => (s.tenSoThich || s || '').toString().toLowerCase());
    const currentKhuVuc = (currentProfile.khuVuc || '').toLowerCase().trim();
    const currentSchedule = (currentProfile.thoiGianRanh || '').toLowerCase().trim();

    const allUsers = await this.nguoiDungRepo.findAll();
    const otherUsers = allUsers.filter((u: any) => u.nguoiDungId !== currentUserId);

    const results = [];
    for (const u of otherUsers) {
      const prof = await this.getProfile(u.nguoiDungId);
      const userInterests: string[] = (prof.soThich || []).map((s: any) => (s.tenSoThich || s || '').toString().toLowerCase());
      const userInterestsRaw: string[] = (prof.soThich || []).map((s: any) => s.tenSoThich || s);
      const userKhuVuc = (prof.khuVuc || '').toLowerCase().trim();
      const userSchedule = (prof.thoiGianRanh || '').toLowerCase().trim();

      // 1. Tính bạn chung (Mutual Friends)
      const mutualRes = await pool.query(`
        SELECT DISTINCT nd.ho_ten FROM nguoi_dung nd
        WHERE nd.nguoi_dung_id IN (
          SELECT CASE WHEN nguoi_dung_id_1 = $1 THEN nguoi_dung_id_2 ELSE nguoi_dung_id_1 END
          FROM quan_he_ket_noi WHERE (nguoi_dung_id_1 = $1 OR nguoi_dung_id_2 = $1) AND trang_thai = 'ACTIVE'
        )
        AND nd.nguoi_dung_id IN (
          SELECT CASE WHEN nguoi_dung_id_1 = $2 THEN nguoi_dung_id_2 ELSE nguoi_dung_id_1 END
          FROM quan_he_ket_noi WHERE (nguoi_dung_id_1 = $2 OR nguoi_dung_id_2 = $2) AND trang_thai = 'ACTIVE'
        )
        LIMIT 5
      `, [currentUserId, u.nguoiDungId]);
      const danhSachBanChung = mutualRes.rows.map((r: any) => r.ho_ten);
      const banChungCount = mutualRes.rows.length;

      // 2. Tính điểm đánh giá thành viên (Average User Rating)
      const ratingRes = await pool.query(`
        SELECT COALESCE(AVG(diem_tong), 0) AS avg_stars, COUNT(*) AS total_reviews
        FROM danh_gia
        WHERE nguoi_duoc_danh_gia_id = $1 AND (loai_danh_gia = 'USER' OR loai_danh_gia IS NULL)
      `, [u.nguoiDungId]);
      const diemTrungBinh = Math.round(Number(ratingRes.rows[0]?.avg_stars || 0) * 10) / 10;
      const soLuotDanhGia = Number(ratingRes.rows[0]?.total_reviews || 0);

      // 3. Tiêu chí match score
      let score = 55; // Base score

      const commonInterests = currentInterests.filter(i => userInterests.includes(i));
      score += Math.min(45, commonInterests.length * 15);

      const isLocationMatched = currentKhuVuc && userKhuVuc && (currentKhuVuc.includes(userKhuVuc) || userKhuVuc.includes(currentKhuVuc));
      if (isLocationMatched) {
        score += 20;
      }

      const isScheduleMatched = currentSchedule && userSchedule && (currentSchedule.includes(userSchedule) || userSchedule.includes(currentSchedule) || (currentSchedule.length > 2 && userSchedule.length > 2));
      if (isScheduleMatched) {
        score += 15;
      }

      if (banChungCount > 0) {
        score += Math.min(15, banChungCount * 5);
      }

      if (diemTrungBinh >= 4.0) {
        score += 10;
      }

      score = Math.min(99, score);

      // 4. Tìm hoạt động đôi phù hợp cho kèo Next Meetup
      let hoatDongGoiY = null;
      if (commonInterests.length > 0) {
        try {
          const actRes = await pool.query(`
            SELECT hoat_dong_id, ten_hoat_dong, mo_ta, dia_diem, thoi_gian_bat_dau
            FROM hoat_dong
            WHERE (
              LOWER(ten_hoat_dong) LIKE ANY($1::text[])
              OR LOWER(mo_ta) LIKE ANY($1::text[])
            )
            ORDER BY thoi_gian_bat_dau DESC LIMIT 1
          `, [commonInterests.map(i => `%${i}%`)]);
          if (actRes.rows.length > 0) {
            hoatDongGoiY = {
              hoatDongId: Number(actRes.rows[0].hoat_dong_id),
              tenHoatDong: actRes.rows[0].ten_hoat_dong,
              moTa: actRes.rows[0].mo_ta,
              diaDiem: actRes.rows[0].dia_diem,
              thoiGianBatDau: actRes.rows[0].thoi_gian_bat_dau,
            };
          }
        } catch {
          hoatDongGoiY = null;
        }
      }

      const matchBadges: string[] = [];
      if (banChungCount > 0) {
        matchBadges.push(`🤝 ${banChungCount} bạn chung`);
      }
      if (diemTrungBinh >= 4.0) {
        matchBadges.push(`⭐ ${diemTrungBinh}/5.0 Đánh giá cao`);
      }
      if (commonInterests.length >= 3) {
        matchBadges.push(`🎯 Trùng ${commonInterests.length} sở thích`);
      } else if (commonInterests.length > 0) {
        matchBadges.push(`🎯 ${commonInterests.length} sở thích chung`);
      }

      if (isLocationMatched) {
        matchBadges.push("📍 Khoảng cách < 10km");
      }

      if (isScheduleMatched) {
        matchBadges.push("📅 Lịch rảnh trùng khớp");
      }

      if (matchBadges.length === 0) {
        matchBadges.push("✨ Gợi ý từ cộng đồng JoinTogether");
      }

      results.push({
        nguoiDungId: u.nguoiDungId,
        hoTen: u.hoTen,
        anhDaiDien: prof.anhDaiDien,
        khuVuc: prof.khuVuc || 'Hà Nội',
        tieuSu: prof.tieuSu || '',
        soThich: userInterestsRaw.length ? userInterestsRaw : ['Giao lưu', 'Tham gia sự kiện'],
        matchScore: score,
        matchBadges,
        reason: matchBadges.join(' • '),
        banChungCount,
        danhSachBanChung,
        diemTrungBinh,
        soLuotDanhGia,
        hoatDongGoiY,
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

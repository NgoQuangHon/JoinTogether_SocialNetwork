import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { DanhGiaRepository } from "../../src/repositories/group5-review/danhGia.repository";
import { TieuChiDanhGiaRepository } from "../../src/repositories/group5-review/tieuChiDanhGia.repository";
import { DiemUyTinRepository } from "../../src/repositories/group5-review/diemUyTin.repository";
import { LichSuDiemUyTinRepository } from "../../src/repositories/group5-review/lichSuDiemUyTin.repository";
import { HoatDongRepository } from "../../src/repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../src/repositories/group3-activity/thanhVienHoatDong.repository";
import { ChiTietDanhGiaRepository } from "../../src/repositories/group5-review/chiTietDanhGia.repository";

jest.mock("../../src/repositories/group5-review/danhGia.repository");
jest.mock("../../src/repositories/group5-review/tieuChiDanhGia.repository");
jest.mock("../../src/repositories/group5-review/diemUyTin.repository");
jest.mock("../../src/repositories/group5-review/lichSuDiemUyTin.repository");
jest.mock("../../src/repositories/group3-activity/hoatDong.repository");
jest.mock("../../src/repositories/group3-activity/thanhVienHoatDong.repository");
jest.mock("../../src/repositories/group5-review/chiTietDanhGia.repository");
jest.mock("../../src/config/db", () => ({
  pool: { connect: jest.fn(), query: jest.fn() },
  Queryable: {},
}));

const userToken = jwt.sign(
  { taiKhoanId: 1, nguoiDungId: 10, role: "USER", roles: ["USER"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

describe("Review Router Integration Tests (/api/reviews)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET /api/reviews/criteria ====================
  describe("GET /api/reviews/criteria", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/reviews/criteria");
      expect(res.status).toBe(401);
    });

    it("should return evaluation criteria list", async () => {
      const mockCriteria = [
        { tieuChiDanhGiaId: 1, tenTieuChi: "Thái độ", trongSo: 0.3, diemToiDa: 10 },
      ];
      (TieuChiDanhGiaRepository.prototype.findAll as jest.Mock).mockResolvedValue(mockCriteria);

      const res = await request(app)
        .get("/api/reviews/criteria")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== GET /api/reviews/reputation/:nguoiDungId ====================
  describe("GET /api/reviews/reputation/:nguoiDungId", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/reviews/reputation/10");
      expect(res.status).toBe(401);
    });

    it("should return reputation score for user", async () => {
      const mockReputation = {
        diemUyTinId: 1,
        nguoiDungId: 10,
        diemHienTai: 100,
        soLuotDanhGia: 3,
        soLanCanhBao: 0,
      };
      (DiemUyTinRepository.prototype.findByNguoiDungId as jest.Mock)
        .mockResolvedValue(mockReputation);

      const res = await request(app)
        .get("/api/reviews/reputation/10")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.diemHienTai).toBe(100);
    });
  });

  // ==================== GET /api/reviews/reputation/:nguoiDungId/history ====================
  describe("GET /api/reviews/reputation/:nguoiDungId/history", () => {
    it("should return history of reputation changes", async () => {
      const mockHistory = [
        { lichSuId: 1, diemUyTinId: 1, diemThayDoi: 5, lyDoThayDoi: "Đánh giá tốt" },
      ];
      (LichSuDiemUyTinRepository.prototype.findByNguoiDungId as jest.Mock)
        .mockResolvedValue(mockHistory);

      const res = await request(app)
        .get("/api/reviews/reputation/10/history")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== GET /api/reviews/activity/:hoatDongId ====================
  describe("GET /api/reviews/activity/:hoatDongId", () => {
    it("should return reviews for an activity", async () => {
      const mockReviews = [
        { danhGiaId: 1, hoatDongId: 100, nguoiDanhGiaId: 10, nguoiDuocDanhGiaId: 20 },
      ];
      (DanhGiaRepository.prototype.findByHoatDongId as jest.Mock).mockResolvedValue(mockReviews);

      const res = await request(app)
        .get("/api/reviews/activity/100")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== GET /api/reviews/user/:nguoiDungId ====================
  describe("GET /api/reviews/user/:nguoiDungId", () => {
    it("should return reviews received by user", async () => {
      const mockReviews = [{ danhGiaId: 2, nguoiDuocDanhGiaId: 10 }];
      (DanhGiaRepository.prototype.findByNguoiDuocDanhGia as jest.Mock)
        .mockResolvedValue(mockReviews);

      const res = await request(app)
        .get("/api/reviews/user/10")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});

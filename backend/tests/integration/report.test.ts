import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { BaoCaoViPhamRepository } from "../../src/repositories/group6-admin/baoCaoViPham.repository";
import { LoaiViPhamRepository } from "../../src/repositories/group6-admin/loaiViPham.repository";
import { NguoiDungRepository } from "../../src/repositories/group1-user/nguoiDung.repository";

jest.mock("../../src/repositories/group6-admin/baoCaoViPham.repository");
jest.mock("../../src/repositories/group6-admin/loaiViPham.repository");
jest.mock("../../src/repositories/group6-admin/bangChungViPham.repository");
jest.mock("../../src/repositories/group6-admin/quyetDinhXuLy.repository");
jest.mock("../../src/repositories/group5-review/diemUyTin.repository");
jest.mock("../../src/repositories/group5-review/lichSuDiemUyTin.repository");
jest.mock("../../src/repositories/group6-admin/nhatKyQuanTri.repository");
jest.mock("../../src/repositories/group4-interaction/thongBao.repository");
jest.mock("../../src/repositories/group1-user/nguoiDung.repository");

// User thường
const userToken = jwt.sign(
  { taiKhoanId: 1, nguoiDungId: 10, role: "USER", roles: ["USER"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

// Admin (nguoiDungId: 1 trùng với ADMIN_USER_IDS)
const adminToken = jwt.sign(
  { taiKhoanId: 2, nguoiDungId: 1, role: "ADMIN", roles: ["ADMIN"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

describe("Report Router Integration Tests (/api/reports)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET /api/reports/violation-types ====================
  describe("GET /api/reports/violation-types", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/reports/violation-types");
      expect(res.status).toBe(401);
    });

    it("should return list of violation types", async () => {
      const mockTypes = [{ loaiViPhamId: 1, tenLoai: "Spam", mucDo: "MEDIUM" }];
      (LoaiViPhamRepository.prototype.findAll as jest.Mock).mockResolvedValue(mockTypes);

      const res = await request(app)
        .get("/api/reports/violation-types")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== POST /api/reports (create report) ====================
  describe("POST /api/reports", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).post("/api/reports").send({});
      expect(res.status).toBe(401);
    });

    it("should return 400 if reporting self", async () => {
      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ nguoiBiBaoCaoId: 10, loaiViPhamId: 1, noiDung: "Self report" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Không thể báo cáo chính mình.");
    });

    it("should return 404 if reported user not found", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(null);
      (LoaiViPhamRepository.prototype.findById as jest.Mock)
        .mockResolvedValue({ loaiViPhamId: 1 });

      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ nguoiBiBaoCaoId: 9999, loaiViPhamId: 1 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Người dùng bị báo cáo không tồn tại.");
    });

    it("should create report successfully", async () => {
      const mockReport = { baoCaoId: 1, nguoiBaoCaoId: 10, nguoiBiBaoCaoId: 20 };
      (NguoiDungRepository.prototype.findById as jest.Mock)
        .mockResolvedValue({ nguoiDungId: 20 });
      (LoaiViPhamRepository.prototype.findById as jest.Mock)
        .mockResolvedValue({ loaiViPhamId: 1 });
      (BaoCaoViPhamRepository.prototype.create as jest.Mock).mockResolvedValue(mockReport);

      const res = await request(app)
        .post("/api/reports")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ nguoiBiBaoCaoId: 20, loaiViPhamId: 1, noiDung: "Spam" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });

  // ==================== GET /api/reports (admin only) ====================
  describe("GET /api/reports", () => {
    it("should return 403 for non-admin user", async () => {
      const res = await request(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("should return list of reports for admin", async () => {
      const mockReports = [{ baoCaoId: 1, nguoiBaoCaoId: 10, nguoiBiBaoCaoId: 20 }];
      (BaoCaoViPhamRepository.prototype.findAll as jest.Mock).mockResolvedValue(mockReports);

      const res = await request(app)
        .get("/api/reports")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });
});

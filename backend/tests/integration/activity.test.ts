import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { HoatDongRepository } from "../../src/repositories/group3-activity/hoatDong.repository";
import { DanhMucHoatDongRepository } from "../../src/repositories/group3-activity/danhMucHoatDong.repository";
import { DiaDiemRepository } from "../../src/repositories/group3-activity/diaDiem.repository";
import { HinhAnhHoatDongRepository } from "../../src/repositories/group3-activity/hinhAnhHoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../src/repositories/group3-activity/thanhVienHoatDong.repository";
import { YeuCauThamGiaRepository } from "../../src/repositories/group3-activity/yeuCauThamGia.repository";
import { pool } from "../../src/config/db";

jest.mock("../../src/repositories/group3-activity/hoatDong.repository");
jest.mock("../../src/repositories/group3-activity/danhMucHoatDong.repository");
jest.mock("../../src/repositories/group3-activity/diaDiem.repository");
jest.mock("../../src/repositories/group3-activity/hinhAnhHoatDong.repository");
jest.mock("../../src/repositories/group3-activity/thanhVienHoatDong.repository");
jest.mock("../../src/repositories/group3-activity/yeuCauThamGia.repository");
jest.mock("../../src/repositories/group4-interaction/thongBao.repository");
jest.mock("../../src/repositories/group4-interaction/lichSuTimKiem.repository");
jest.mock("../../src/config/db", () => ({
  pool: {
    connect: jest.fn(),
    query: jest.fn(),
  },
  Queryable: {},
}));

import { ThongBaoRepository } from "../../src/repositories/group4-interaction/thongBao.repository";
import { LichSuTimKiemRepository } from "../../src/repositories/group4-interaction/lichSuTimKiem.repository";

// Token cho user thường (nguoiDungId: 10)
const userToken = jwt.sign(
  { taiKhoanId: 1, nguoiDungId: 10, role: "USER", roles: ["USER"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

// Token cho admin (nguoiDungId: 1 - khớp ADMIN_USER_IDS)
const adminToken = jwt.sign(
  { taiKhoanId: 2, nguoiDungId: 1, role: "ADMIN", roles: ["ADMIN"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

const mockActivity = {
  hoatDongId: 100,
  nguoiToChucId: 10,
  tenHoatDong: "Bóng đá cuối tuần",
  moTa: "Vui vẻ",
  thoiGianBatDau: new Date("2026-08-01T09:00:00Z"),
};

describe("Activity Router Integration Tests (/api/activities)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== GET /api/activities ====================
  describe("GET /api/activities", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/activities");
      expect(res.status).toBe(401);
    });

    it("should return list of activities", async () => {
      (HoatDongRepository.prototype.findAll as jest.Mock).mockResolvedValue([mockActivity]);

      const res = await request(app)
        .get("/api/activities")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== GET /api/activities/:id ====================
  describe("GET /api/activities/:id", () => {
    it("should return 404 if activity does not exist", async () => {
      (HoatDongRepository.prototype.findById as jest.Mock).mockResolvedValue(null);
      (HinhAnhHoatDongRepository.prototype.findByHoatDongId as jest.Mock).mockResolvedValue([]);

      const res = await request(app)
        .get("/api/activities/9999")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Hoạt động không tồn tại.");
    });

    it("should return activity with images", async () => {
      (HoatDongRepository.prototype.findById as jest.Mock).mockResolvedValue(mockActivity);
      (HinhAnhHoatDongRepository.prototype.findByHoatDongId as jest.Mock)
        .mockResolvedValue([{ hinhAnhId: 1, duongDan: "http://img.jpg", laAnhDaiDien: true }]);

      const res = await request(app)
        .get("/api/activities/100")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hoatDongId).toBe(100);
      expect(res.body.data.hinhAnh).toHaveLength(1);
    });
  });

  // ==================== POST /api/activities ====================
  describe("POST /api/activities", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).post("/api/activities").send({ tenHoatDong: "Test" });
      expect(res.status).toBe(401);
    });

    it("should create an activity successfully", async () => {
      const createdActivity = { ...mockActivity, hoatDongId: 200 };
      (HoatDongRepository.prototype.create as jest.Mock).mockResolvedValue(createdActivity);

      const res = await request(app)
        .post("/api/activities")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ tenHoatDong: "Bóng đá cuối tuần", moTa: "Vui vẻ" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tenHoatDong).toBe("Bóng đá cuối tuần");
    });
  });

  // ==================== GET /api/activities/categories ====================
  describe("GET /api/activities/categories", () => {
    it("should return all categories", async () => {
      const mockCategories = [{ danhMucHoatDongId: 1, tenDanhMuc: "Thể thao" }];
      (DanhMucHoatDongRepository.prototype.findAll as jest.Mock).mockResolvedValue(mockCategories);

      const res = await request(app)
        .get("/api/activities/categories")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== GET /api/activities/locations ====================
  describe("GET /api/activities/locations", () => {
    it("should return all locations", async () => {
      const mockLocations = [{ diaDiemId: 1, tenDiaDiem: "Sân Mỹ Đình" }];
      (DiaDiemRepository.prototype.findAll as jest.Mock).mockResolvedValue(mockLocations);

      const res = await request(app)
        .get("/api/activities/locations")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== POST /api/activities/:id/join ====================
  describe("POST /api/activities/:id/join", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).post("/api/activities/100/join");
      expect(res.status).toBe(401);
    });

    it("should send a join request", async () => {
      const mockRequest = { yeuCauId: 1, hoatDongId: 100, nguoiDungId: 10, trangThai: "PENDING" };

      (HoatDongRepository.prototype.findById as jest.Mock).mockResolvedValue(mockActivity);
      (ThanhVienHoatDongRepository.prototype.isMember as jest.Mock).mockResolvedValue(false);
      (YeuCauThamGiaRepository.prototype.findExistingRequest as jest.Mock).mockResolvedValue(null);
      (YeuCauThamGiaRepository.prototype.create as jest.Mock).mockResolvedValue(mockRequest);
      (ThongBaoRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post("/api/activities/100/join")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 409 if already a member", async () => {
      (HoatDongRepository.prototype.findById as jest.Mock).mockResolvedValue(mockActivity);
      (ThanhVienHoatDongRepository.prototype.isMember as jest.Mock).mockResolvedValue(true);

      const res = await request(app)
        .post("/api/activities/100/join")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Bạn đã là thành viên của hoạt động này.");
    });
  });

  // ==================== GET /api/activities/:id/members ====================
  describe("GET /api/activities/:id/members", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/activities/100/members");
      expect(res.status).toBe(401);
    });

    it("should return list of members", async () => {
      const mockMembers = [{ thanhVienId: 1, nguoiDungId: 10, hoatDongId: 100 }];
      (ThanhVienHoatDongRepository.prototype.findByHoatDongId as jest.Mock)
        .mockResolvedValue(mockMembers);

      const res = await request(app)
        .get("/api/activities/100/members")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==================== GET /api/activities/search ====================
  describe("GET /api/activities/search", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/activities/search?keyword=bóng");
      expect(res.status).toBe(401);
    });

    it("should return search results and save search history", async () => {
      (HoatDongRepository.prototype.search as jest.Mock)
        .mockResolvedValue({ rows: [mockActivity], total: 1 });
      (LichSuTimKiemRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .get("/api/activities/search?keyword=bong")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.total).toBe(1);
    });
  });
});


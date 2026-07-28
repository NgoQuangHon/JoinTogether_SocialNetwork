import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { HoSoNguoiDungRepository } from "../../src/repositories/group2-profile/hoSoNguoiDung.repository";
import { SoThichRepository } from "../../src/repositories/group2-profile/soThich.repository";
import { HoSoSoThichRepository } from "../../src/repositories/group2-profile/hoSoSoThich.repository";

// Mock all profile repositories
jest.mock("../../src/repositories/group2-profile/hoSoNguoiDung.repository");
jest.mock("../../src/repositories/group2-profile/soThich.repository");
jest.mock("../../src/repositories/group2-profile/hoSoSoThich.repository");

// Tạo valid JWT token dùng chung cho toàn bộ test file
const authToken = jwt.sign(
  { taiKhoanId: 1, nguoiDungId: 10, role: "USER", roles: ["USER"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

describe("Profile Router Integration Tests (/api/profile)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== /api/profile/my-profile ====================
  describe("GET /api/profile/my-profile", () => {
    it("should return 401 if no Authorization token provided", async () => {
      const res = await request(app).get("/api/profile/my-profile");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Không tìm thấy token xác thực");
    });

    it("should return profile when token is valid", async () => {
      const mockProfile = { hoSoId: 1, nguoiDungId: 10, tieuSu: "Hello!" };
      const mockInterests = [{ soThichId: 1, tenSoThich: "Bóng đá" }];

      (HoSoNguoiDungRepository.prototype.findByNguoiDungId as jest.Mock)
        .mockResolvedValue(mockProfile);
      (SoThichRepository.prototype.findInterestsByProfileId as jest.Mock)
        .mockResolvedValue(mockInterests);

      const res = await request(app)
        .get("/api/profile/my-profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hoSoId).toBe(1);
      expect(res.body.data.soThich).toEqual(mockInterests);
    });
  });

  // ==================== /api/profile/interests/categories ====================
  describe("GET /api/profile/interests/categories", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/profile/interests/categories");
      expect(res.status).toBe(401);
    });

    it("should return grouped interest categories", async () => {
      const mockCategories = [
        { danhMucSoThichId: 1, tenDanhMuc: "Thể thao" },
      ];
      const mockInterests = [
        { soThichId: 10, danhMucSoThichId: 1, tenSoThich: "Bóng đá" },
        { soThichId: 11, danhMucSoThichId: null, tenSoThich: "Nấu ăn" },
      ];

      (SoThichRepository.prototype.findAllCategories as jest.Mock)
        .mockResolvedValue(mockCategories);
      (SoThichRepository.prototype.findAllInterestsByCategory as jest.Mock)
        .mockResolvedValue(mockInterests);

      const res = await request(app)
        .get("/api/profile/interests/categories")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // 1 named category + 1 "Khác" for uncategorized
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].tenDanhMuc).toBe("Thể thao");
      expect(res.body.data[1].tenDanhMuc).toBe("Khác");
    });
  });

  // ==================== /api/profile/interests ====================
  describe("GET /api/profile/interests", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/profile/interests");
      expect(res.status).toBe(401);
    });

    it("should return user interests", async () => {
      const mockProfile = { hoSoId: 5, nguoiDungId: 10 };
      const mockInterests = [{ soThichId: 1, tenSoThich: "Bơi lội" }];

      (HoSoNguoiDungRepository.prototype.findByNguoiDungId as jest.Mock)
        .mockResolvedValue(mockProfile);
      (SoThichRepository.prototype.findInterestsByProfileId as jest.Mock)
        .mockResolvedValue(mockInterests);

      const res = await request(app)
        .get("/api/profile/interests")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ==================== PUT /api/profile (update profile) ====================
  describe("PUT /api/profile", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).put("/api/profile").send({ tieuSu: "New bio" });
      expect(res.status).toBe(401);
    });

    it("should update profile successfully", async () => {
      const mockProfile = { hoSoId: 1, nguoiDungId: 10 };
      const updatedProfile = { hoSoId: 1, nguoiDungId: 10, tieuSu: "Updated bio", khuVuc: "Hà Nội" };

      (HoSoNguoiDungRepository.prototype.findByNguoiDungId as jest.Mock)
        .mockResolvedValue(mockProfile);
      (HoSoNguoiDungRepository.prototype.update as jest.Mock)
        .mockResolvedValue(updatedProfile);

      const res = await request(app)
        .put("/api/profile")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ tieuSu: "Updated bio", khuVuc: "Hà Nội" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tieuSu).toBe("Updated bio");
    });
  });

  // ==================== POST /api/profile/interests (add interest) ====================
  describe("POST /api/profile/interests", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app)
        .post("/api/profile/interests")
        .send({ soThichId: 1 });
      expect(res.status).toBe(401);
    });

    it("should return 404 if interest does not exist", async () => {
      (SoThichRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/profile/interests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ soThichId: 9999 });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Sở thích không tồn tại.");
    });

    it("should add interest to profile successfully", async () => {
      const mockInterest = { soThichId: 1, tenSoThich: "Bóng đá" };
      const mockProfile = { hoSoId: 5, nguoiDungId: 10 };
      const addResult = { hoSoId: 5, soThichId: 1, mucDoQuanTam: 3 };

      (SoThichRepository.prototype.findById as jest.Mock).mockResolvedValue(mockInterest);
      (HoSoNguoiDungRepository.prototype.findByNguoiDungId as jest.Mock)
        .mockResolvedValue(mockProfile);
      (HoSoSoThichRepository.prototype.findByHoSoIdAndSoThichId as jest.Mock)
        .mockResolvedValue(null);
      (HoSoSoThichRepository.prototype.addInterest as jest.Mock)
        .mockResolvedValue(addResult);

      const res = await request(app)
        .post("/api/profile/interests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ soThichId: 1, mucDoQuanTam: 3 });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it("should return 409 if interest already in profile", async () => {
      const mockInterest = { soThichId: 1, tenSoThich: "Bóng đá" };
      const mockProfile = { hoSoId: 5, nguoiDungId: 10 };
      const existingLink = { hoSoId: 5, soThichId: 1 };

      (SoThichRepository.prototype.findById as jest.Mock).mockResolvedValue(mockInterest);
      (HoSoNguoiDungRepository.prototype.findByNguoiDungId as jest.Mock)
        .mockResolvedValue(mockProfile);
      (HoSoSoThichRepository.prototype.findByHoSoIdAndSoThichId as jest.Mock)
        .mockResolvedValue(existingLink);

      const res = await request(app)
        .post("/api/profile/interests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ soThichId: 1 });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Sở thích đã tồn tại trong hồ sơ.");
    });
  });
});

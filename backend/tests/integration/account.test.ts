import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { NguoiDungRepository } from "../../src/repositories/group1-user/nguoiDung.repository";
import { NhatKyQuanTriRepository } from "../../src/repositories/group6-admin/nhatKyQuanTri.repository";

jest.mock("../../src/repositories/group1-user/nguoiDung.repository");
jest.mock("../../src/repositories/group6-admin/nhatKyQuanTri.repository");
jest.mock("../../src/repositories/group4-interaction/thongBao.repository");
jest.mock("../../src/config/db", () => ({
  pool: { connect: jest.fn(), query: jest.fn() },
  Queryable: {},
}));

const userToken = jwt.sign(
  { taiKhoanId: 1, nguoiDungId: 10, role: "USER", roles: ["USER"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

const adminToken = jwt.sign(
  { taiKhoanId: 2, nguoiDungId: 1, role: "ADMIN", roles: ["ADMIN"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

const mockUser = {
  nguoiDungId: 10,
  hoTen: "Nguyen Van A",
  email: "test@example.com",
  soDienThoai: "0123456789",
  trangThai: "ACTIVE",
  ngayTao: new Date("2026-01-01"),
};

describe("Account Management Integration Tests (/api/admin/accounts)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/accounts", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/admin/accounts");
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not admin", async () => {
      const res = await request(app)
        .get("/api/admin/accounts")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("should return list of users with pagination", async () => {
      const mockUsers = [mockUser];
      (NguoiDungRepository.prototype.findAll as jest.Mock).mockResolvedValue(mockUsers);
      (NguoiDungRepository.prototype.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app)
        .get("/api/admin/accounts")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.users).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });
  });

  describe("GET /api/admin/accounts/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .get("/api/admin/accounts/abc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID người dùng không hợp lệ.");
    });

    it("should return 404 if user not found", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/admin/accounts/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Người dùng không tồn tại.");
    });

    it("should return user details", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .get("/api/admin/accounts/10")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.nguoiDungId).toBe(10);
    });
  });

  describe("PUT /api/admin/accounts/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .put("/api/admin/accounts/abc")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ hoTen: "Updated" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID người dùng không hợp lệ.");
    });

    it("should return 404 if user not found", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/admin/accounts/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ hoTen: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Người dùng không tồn tại.");
    });

    it("should update user successfully", async () => {
      const updatedUser = { ...mockUser, hoTen: "Updated Name" };
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(mockUser);
      (NguoiDungRepository.prototype.update as jest.Mock).mockResolvedValue(updatedUser);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .put("/api/admin/accounts/10")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ hoTen: "Updated Name" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hoTen).toBe("Updated Name");
    });
  });

  describe("PUT /api/admin/accounts/:id/lock", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .put("/api/admin/accounts/abc/lock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID người dùng không hợp lệ.");
    });

    it("should return 404 if user not found", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/admin/accounts/999/lock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Người dùng không tồn tại.");
    });

    it("should return 409 if already locked", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue({
        ...mockUser,
        trangThai: "LOCKED",
      });

      const res = await request(app)
        .put("/api/admin/accounts/10/lock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Tài khoản này đã bị khóa trước đó.");
    });

    it("should lock account successfully", async () => {
      const lockedUser = { ...mockUser, trangThai: "LOCKED" };
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(mockUser);
      (NguoiDungRepository.prototype.updateTrangThai as jest.Mock).mockResolvedValue(lockedUser);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .put("/api/admin/accounts/10/lock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã khóa tài khoản.");
    });
  });

  describe("PUT /api/admin/accounts/:id/unlock", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .put("/api/admin/accounts/abc/unlock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID người dùng không hợp lệ.");
    });

    it("should return 404 if user not found", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/admin/accounts/999/unlock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Người dùng không tồn tại.");
    });

    it("should return 409 if not locked", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(mockUser);

      const res = await request(app)
        .put("/api/admin/accounts/10/unlock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Tài khoản này không bị khóa.");
    });

    it("should unlock account successfully", async () => {
      const lockedUser = { ...mockUser, trangThai: "LOCKED" };
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(lockedUser);
      (NguoiDungRepository.prototype.updateTrangThai as jest.Mock).mockResolvedValue(mockUser);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .put("/api/admin/accounts/10/unlock")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã mở khóa tài khoản.");
    });
  });
});

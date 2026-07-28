import request from "supertest";
import app from "../../src/app";
import { NguoiDungRepository } from "../../src/repositories/group1-user/nguoiDung.repository";
import { TaiKhoanRepository } from "../../src/repositories/group1-user/taiKhoan.repository";
import { VaiTroRepository } from "../../src/repositories/group1-user/vaiTro.repository";
import { pool } from "../../src/config/db";

// Mock the DB repositories and pool connection
jest.mock("../../src/repositories/group1-user/nguoiDung.repository");
jest.mock("../../src/repositories/group1-user/taiKhoan.repository");
jest.mock("../../src/repositories/group1-user/vaiTro.repository");
jest.mock("../../src/config/db", () => {
  const originalModule = jest.requireActual("../../src/config/db");
  return {
    ...originalModule,
    pool: {
      connect: jest.fn(),
      query: jest.fn(),
    },
  };
});

describe("Auth Router Integration Tests (/api/auth)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/register", () => {
    it("should return 400 Bad Request when required fields are missing", async () => {
      const response = await request(app).post("/api/auth/register").send({
        hoTen: "Nguyen Van A",
        email: "test@example.com",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Vui lòng cung cấp đầy đủ");
    });

    it("should return 400 Bad Request when password is under 6 characters", async () => {
      const response = await request(app).post("/api/auth/register").send({
        hoTen: "Nguyen Van A",
        email: "test@example.com",
        tenDangNhap: "testuser",
        matKhau: "12345",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Mật khẩu phải có ít nhất 6 ký tự");
    });

    it("should return 409 Conflict when email is already in use", async () => {
      (NguoiDungRepository.prototype.findByEmail as jest.Mock).mockResolvedValue({
        nguoiDungId: 1,
        email: "test@example.com",
      });

      const response = await request(app).post("/api/auth/register").send({
        hoTen: "Nguyen Van A",
        email: "test@example.com",
        tenDangNhap: "testuser",
        matKhau: "password123",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email đã được sử dụng.");
    });

    it("should register user successfully and return 201 Created", async () => {
      (NguoiDungRepository.prototype.findByEmail as jest.Mock).mockResolvedValue(null);
      (TaiKhoanRepository.prototype.findByUsername as jest.Mock).mockResolvedValue(null);

      const mockClient = {
        query: jest.fn().mockImplementation((queryText: string) => {
          if (queryText.includes("INSERT INTO nguoi_dung")) {
            return Promise.resolve({ rows: [{ nguoiDungId: 10 }] });
          }
          if (queryText.includes("INSERT INTO tai_khoan")) {
            return Promise.resolve({ rows: [{ taiKhoanId: 20 }] });
          }
          return Promise.resolve({ rows: [] });
        }),
        release: jest.fn(),
      };

      (pool.connect as jest.Mock).mockResolvedValue(mockClient);
      (VaiTroRepository.prototype.assignRoleToTaiKhoan as jest.Mock).mockResolvedValue(undefined);

      const response = await request(app).post("/api/auth/register").send({
        hoTen: "Nguyen Van A",
        email: "newuser@example.com",
        tenDangNhap: "newuser",
        matKhau: "password123",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Đăng ký thành công.");
      expect(mockClient.query).toHaveBeenCalledWith("BEGIN");
      expect(mockClient.query).toHaveBeenCalledWith("COMMIT");
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe("POST /api/auth/login", () => {
    it("should return 400 Bad Request when credentials are missing", async () => {
      const response = await request(app).post("/api/auth/login").send({
        tenDangNhap: "testuser",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain("Vui lòng cung cấp tên đăng nhập và mật khẩu");
    });

    it("should return 401 Unauthorized when username is not found", async () => {
      (TaiKhoanRepository.prototype.findByUsername as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/api/auth/login").send({
        tenDangNhap: "nonexistentuser",
        matKhau: "password123",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Tên đăng nhập hoặc mật khẩu không chính xác.");
    });
  });
});

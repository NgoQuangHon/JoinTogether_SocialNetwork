import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { YeuCauKetNoiRepository } from "../../src/repositories/group4-interaction/yeuCauKetNoi.repository";
import { QuanHeKetNoiRepository } from "../../src/repositories/group4-interaction/quanHeKetNoi.repository";
import { NguoiDungRepository } from "../../src/repositories/group1-user/nguoiDung.repository";
import { pool } from "../../src/config/db";

jest.mock("../../src/repositories/group4-interaction/yeuCauKetNoi.repository");
jest.mock("../../src/repositories/group4-interaction/quanHeKetNoi.repository");
jest.mock("../../src/repositories/group1-user/nguoiDung.repository");
jest.mock("../../src/config/db", () => ({
  pool: {
    connect: jest.fn(),
    query: jest.fn().mockResolvedValue({ rows: [] }),
  },
  Queryable: {},
}));

const userToken = jwt.sign(
  { taiKhoanId: 1, nguoiDungId: 10, role: "USER", roles: ["USER"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

const mockClient = {
  query: jest.fn().mockResolvedValue({ rows: [] }),
  release: jest.fn(),
};

describe("Connection Router Integration Tests (/api/connections)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (pool.connect as jest.Mock).mockResolvedValue(mockClient);
  });

  // ==================== GET /api/connections ====================
  describe("GET /api/connections", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/connections");
      expect(res.status).toBe(401);
    });

    it("should return user connections list", async () => {
      const mockConnections = [
        {
          quanHeId: 1,
          nguoiDungId1: 10,
          nguoiDungId2: 20,
          trangThai: "ACTIVE",
        },
      ];
      (
        QuanHeKetNoiRepository.prototype.findConnectionsByUser as jest.Mock
      ).mockResolvedValue(mockConnections);

      const res = await request(app)
        .get("/api/connections")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== GET /api/connections/requests ====================
  describe("GET /api/connections/requests", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/connections/requests");
      expect(res.status).toBe(401);
    });

    it("should return pending connection requests", async () => {
      const mockRequests = [
        {
          yeuCauKetNoiId: 1,
          nguoiGuiId: 5,
          nguoiNhanId: 10,
          trangThai: "PENDING",
        },
      ];
      (
        YeuCauKetNoiRepository.prototype.findPendingByUser as jest.Mock
      ).mockResolvedValue(mockRequests);

      const res = await request(app)
        .get("/api/connections/requests")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  // ==================== POST /api/connections/request ====================
  describe("POST /api/connections/request", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app)
        .post("/api/connections/request")
        .send({ nguoiNhanId: 20 });
      expect(res.status).toBe(401);
    });

    it("should return 400 if sending to self", async () => {
      const res = await request(app)
        .post("/api/connections/request")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ nguoiNhanId: 10 }); // same as nguoiDungId in token

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(
        "Không thể gửi yêu cầu kết nối cho chính mình.",
      );
    });

    it("should return 404 if receiver does not exist", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue(
        null,
      );
      (
        QuanHeKetNoiRepository.prototype.findExistingConnection as jest.Mock
      ).mockResolvedValue(null);
      (
        YeuCauKetNoiRepository.prototype.findExistingRequest as jest.Mock
      ).mockResolvedValue(null);

      const res = await request(app)
        .post("/api/connections/request")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ nguoiNhanId: 9999 });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Người dùng không tồn tại.");
    });

    it("should return 409 if already connected", async () => {
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue({
        nguoiDungId: 20,
      });
      (
        QuanHeKetNoiRepository.prototype.findExistingConnection as jest.Mock
      ).mockResolvedValue({ quanHeId: 1 });

      const res = await request(app)
        .post("/api/connections/request")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ nguoiNhanId: 20 });

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Đã kết nối với người dùng này.");
    });

    it("should send connection request successfully", async () => {
      const mockRequest = {
        yeuCauKetNoiId: 1,
        nguoiGuiId: 10,
        nguoiNhanId: 20,
        trangThai: "PENDING",
      };
      (NguoiDungRepository.prototype.findById as jest.Mock).mockResolvedValue({
        nguoiDungId: 20,
      });
      (
        QuanHeKetNoiRepository.prototype.findExistingConnection as jest.Mock
      ).mockResolvedValue(null);
      (
        YeuCauKetNoiRepository.prototype.findExistingRequest as jest.Mock
      ).mockResolvedValue(null);
      (YeuCauKetNoiRepository.prototype.create as jest.Mock).mockResolvedValue(
        mockRequest,
      );

      const res = await request(app)
        .post("/api/connections/request")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ nguoiNhanId: 20, loiNhan: "Xin chào!" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.trangThai).toBe("PENDING");
    });
  });

  // ==================== PUT /api/connections/request/:id ====================
  describe("PUT /api/connections/request/:id", () => {
    it("should accept connection request successfully", async () => {
      const mockRequest = {
        yeuCauKetNoiId: 1,
        nguoiGuiId: 20,
        nguoiNhanId: 10,
        trangThai: "PENDING",
      };
      (YeuCauKetNoiRepository.prototype.findById as jest.Mock).mockResolvedValue(
        mockRequest,
      );
      (
        YeuCauKetNoiRepository.prototype.updateStatus as jest.Mock
      ).mockResolvedValue({ ...mockRequest, trangThai: "ACCEPTED" });
      (QuanHeKetNoiRepository.prototype.create as jest.Mock).mockResolvedValue(
        {},
      );

      const res = await request(app)
        .put("/api/connections/request/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ accept: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã chấp nhận yêu cầu kết nối.");
    });

    it("should reject connection request successfully", async () => {
      const mockRequest = {
        yeuCauKetNoiId: 1,
        nguoiGuiId: 20,
        nguoiNhanId: 10,
        trangThai: "PENDING",
      };
      (YeuCauKetNoiRepository.prototype.findById as jest.Mock).mockResolvedValue(
        mockRequest,
      );
      (
        YeuCauKetNoiRepository.prototype.updateStatus as jest.Mock
      ).mockResolvedValue({ ...mockRequest, trangThai: "REJECTED" });

      const res = await request(app)
        .put("/api/connections/request/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ accept: false });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã từ chối yêu cầu kết nối.");
    });

    it("should return 403 if responding to someone else's request", async () => {
      const mockRequest = {
        yeuCauKetNoiId: 1,
        nguoiGuiId: 10,
        nguoiNhanId: 20, // Not me (10)
        trangThai: "PENDING",
      };
      (YeuCauKetNoiRepository.prototype.findById as jest.Mock).mockResolvedValue(
        mockRequest,
      );

      const res = await request(app)
        .put("/api/connections/request/1")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ accept: true });

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Bạn không có quyền xử lý yêu cầu này.");
    });
  });

  // ==================== DELETE /api/connections/:id ====================
  describe("DELETE /api/connections/:id", () => {
    it("should remove connection successfully", async () => {
      (QuanHeKetNoiRepository.prototype.delete as jest.Mock).mockResolvedValue(
        true,
      );

      const res = await request(app)
        .delete("/api/connections/20")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã hủy kết nối thành công.");
    });

    it("should return 404 if connection not found", async () => {
      (QuanHeKetNoiRepository.prototype.delete as jest.Mock).mockResolvedValue(
        false,
      );

      const res = await request(app)
        .delete("/api/connections/999")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Không tìm thấy kết nối với người dùng này.");
    });
  });
});

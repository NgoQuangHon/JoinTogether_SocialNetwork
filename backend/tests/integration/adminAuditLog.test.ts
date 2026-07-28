import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { NhatKyQuanTriRepository } from "../../src/repositories/group6-admin/nhatKyQuanTri.repository";

jest.mock("../../src/repositories/group6-admin/nhatKyQuanTri.repository");
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

const mockAuditLog = {
  nhatKyId: 1,
  nguoiQuanTriId: 1,
  nguoiQuanTri: "Admin User",
  hanhDong: "KHÓA_TÀI_KHOẢN #10",
  doiTuongTacDong: "NguoiDung_10",
  thoiGianThucHien: new Date("2026-07-28T10:00:00Z"),
};

describe("Admin Audit Log Integration Tests (/api/admin/audit-logs)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/admin/audit-logs", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/admin/audit-logs");
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not admin", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("should return audit logs list", async () => {
      (NhatKyQuanTriRepository.prototype.findAll as jest.Mock)
        .mockResolvedValue([mockAuditLog]);

      const res = await request(app)
        .get("/api/admin/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs).toHaveLength(1);
      expect(res.body.data.logs[0].hanhDong).toBe("KHÓA_TÀI_KHOẢN #10");
    });

    it("should pass query filters to service", async () => {
      (NhatKyQuanTriRepository.prototype.findAll as jest.Mock)
        .mockResolvedValue([mockAuditLog]);

      const res = await request(app)
        .get("/api/admin/audit-logs?hanhDong=KHÓA&nguoiDungId=1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(NhatKyQuanTriRepository.prototype.findAll).toHaveBeenCalled();
    });

    it("should return empty list when no logs exist", async () => {
      (NhatKyQuanTriRepository.prototype.findAll as jest.Mock)
        .mockResolvedValue([]);

      const res = await request(app)
        .get("/api/admin/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs).toHaveLength(0);
    });
  });
});

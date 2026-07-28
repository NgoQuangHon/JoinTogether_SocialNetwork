import request from "supertest";
import app from "../../src/app";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../src/config/jwt";
import { VaiTroRepository } from "../../src/repositories/group1-user/vaiTro.repository";
import { QuyenHanRepository } from "../../src/repositories/group1-user/quyenHan.repository";
import { NhatKyQuanTriRepository } from "../../src/repositories/group6-admin/nhatKyQuanTri.repository";

jest.mock("../../src/repositories/group1-user/vaiTro.repository");
jest.mock("../../src/repositories/group1-user/quyenHan.repository");
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

const mockRole = {
  vaiTroId: 1,
  tenVaiTro: "MODERATOR",
  moTa: "Moderator role",
};

const mockPermission = {
  quyenHanId: 1,
  tenQuyen: "MANAGE_USERS",
  moTa: "Can manage users",
};

describe("Role & Permission Integration Tests (/api/admin)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== VAI TRÒ (ROLES) ====================

  describe("GET /api/admin/roles", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/admin/roles");
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not admin", async () => {
      const res = await request(app)
        .get("/api/admin/roles")
        .set("Authorization", `Bearer ${userToken}`);
      expect(res.status).toBe(403);
    });

    it("should return list of roles", async () => {
      (VaiTroRepository.prototype.findAll as jest.Mock).mockResolvedValue([mockRole]);

      const res = await request(app)
        .get("/api/admin/roles")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].tenVaiTro).toBe("MODERATOR");
    });
  });

  describe("GET /api/admin/roles/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .get("/api/admin/roles/abc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID vai trò không hợp lệ.");
    });

    it("should return 404 if role not found", async () => {
      (VaiTroRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/admin/roles/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Vai trò không tồn tại.");
    });

    it("should return role by id", async () => {
      (VaiTroRepository.prototype.findById as jest.Mock).mockResolvedValue(mockRole);

      const res = await request(app)
        .get("/api/admin/roles/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vaiTroId).toBe(1);
    });
  });

  describe("POST /api/admin/roles", () => {
    it("should return 400 if tenVaiTro is missing", async () => {
      const res = await request(app)
        .post("/api/admin/roles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ moTa: "Some description" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Vui lòng cung cấp tên vai trò.");
    });

    it("should create role successfully", async () => {
      const newRole = { ...mockRole, vaiTroId: 2 };
      (VaiTroRepository.prototype.create as jest.Mock).mockResolvedValue(newRole);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post("/api/admin/roles")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenVaiTro: "MODERATOR", moTa: "Moderator role" });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tenVaiTro).toBe("MODERATOR");
    });
  });

  describe("PUT /api/admin/roles/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .put("/api/admin/roles/abc")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenVaiTro: "Updated" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID vai trò không hợp lệ.");
    });

    it("should return 404 if role not found", async () => {
      (VaiTroRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/admin/roles/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenVaiTro: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Vai trò không tồn tại.");
    });

    it("should update role successfully", async () => {
      const updatedRole = { ...mockRole, tenVaiTro: "SUPER_MOD" };
      (VaiTroRepository.prototype.findById as jest.Mock).mockResolvedValue(mockRole);
      (VaiTroRepository.prototype.update as jest.Mock).mockResolvedValue(updatedRole);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .put("/api/admin/roles/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenVaiTro: "SUPER_MOD" });

      expect(res.status).toBe(200);
      expect(res.body.data.tenVaiTro).toBe("SUPER_MOD");
    });
  });

  describe("DELETE /api/admin/roles/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .delete("/api/admin/roles/abc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID vai trò không hợp lệ.");
    });

    it("should return 404 if role not found", async () => {
      (VaiTroRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/admin/roles/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Vai trò không tồn tại.");
    });

    it("should delete role successfully", async () => {
      (VaiTroRepository.prototype.findById as jest.Mock).mockResolvedValue(mockRole);
      (VaiTroRepository.prototype.delete as jest.Mock).mockResolvedValue(true);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .delete("/api/admin/roles/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã xóa vai trò.");
    });
  });

  // ==================== QUYỀN HẠN (PERMISSIONS) ====================

  describe("GET /api/admin/permissions", () => {
    it("should return list of permissions", async () => {
      (QuyenHanRepository.prototype.findAll as jest.Mock).mockResolvedValue([mockPermission]);

      const res = await request(app)
        .get("/api/admin/permissions")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe("GET /api/admin/permissions/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .get("/api/admin/permissions/abc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID quyền hạn không hợp lệ.");
    });

    it("should return 404 if permission not found", async () => {
      (QuyenHanRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/admin/permissions/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Quyền hạn không tồn tại.");
    });

    it("should return permission by id", async () => {
      (QuyenHanRepository.prototype.findById as jest.Mock).mockResolvedValue(mockPermission);

      const res = await request(app)
        .get("/api/admin/permissions/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.tenQuyen).toBe("MANAGE_USERS");
    });
  });

  describe("POST /api/admin/permissions", () => {
    it("should return 400 if tenQuyen is missing", async () => {
      const res = await request(app)
        .post("/api/admin/permissions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ moTa: "Some description" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Vui lòng cung cấp tên quyền.");
    });

    it("should create permission successfully", async () => {
      const newPermission = { ...mockPermission, quyenHanId: 2 };
      (QuyenHanRepository.prototype.create as jest.Mock).mockResolvedValue(newPermission);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post("/api/admin/permissions")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenQuyen: "MANAGE_USERS", moTa: "Can manage users" });

      expect(res.status).toBe(201);
      expect(res.body.data.tenQuyen).toBe("MANAGE_USERS");
    });
  });

  describe("PUT /api/admin/permissions/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .put("/api/admin/permissions/abc")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenQuyen: "Updated" });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID quyền hạn không hợp lệ.");
    });

    it("should return 404 if permission not found", async () => {
      (QuyenHanRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put("/api/admin/permissions/999")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenQuyen: "Updated" });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Quyền hạn không tồn tại.");
    });

    it("should update permission successfully", async () => {
      const updatedPermission = { ...mockPermission, tenQuyen: "MANAGE_ROLES" };
      (QuyenHanRepository.prototype.findById as jest.Mock).mockResolvedValue(mockPermission);
      (QuyenHanRepository.prototype.update as jest.Mock).mockResolvedValue(updatedPermission);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .put("/api/admin/permissions/1")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ tenQuyen: "MANAGE_ROLES" });

      expect(res.status).toBe(200);
      expect(res.body.data.tenQuyen).toBe("MANAGE_ROLES");
    });
  });

  describe("DELETE /api/admin/permissions/:id", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await request(app)
        .delete("/api/admin/permissions/abc")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("ID quyền hạn không hợp lệ.");
    });

    it("should return 404 if permission not found", async () => {
      (QuyenHanRepository.prototype.findById as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .delete("/api/admin/permissions/999")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe("Quyền hạn không tồn tại.");
    });

    it("should delete permission successfully", async () => {
      (QuyenHanRepository.prototype.findById as jest.Mock).mockResolvedValue(mockPermission);
      (QuyenHanRepository.prototype.delete as jest.Mock).mockResolvedValue(true);
      (NhatKyQuanTriRepository.prototype.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .delete("/api/admin/permissions/1")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đã xóa quyền hạn.");
    });
  });
});

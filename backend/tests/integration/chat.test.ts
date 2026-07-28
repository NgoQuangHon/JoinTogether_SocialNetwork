import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../../src/app";
import { JWT_SECRET } from "../../src/config/jwt";
import { pool } from "../../src/config/db";
import { PhongTroChuyenRepository } from "../../src/repositories/group4-interaction/phongTroChuyen.repository";
import { TinNhanRepository } from "../../src/repositories/group4-interaction/tinNhan.repository";
import { HoatDongRepository } from "../../src/repositories/group3-activity/hoatDong.repository";
import { ThanhVienHoatDongRepository } from "../../src/repositories/group3-activity/thanhVienHoatDong.repository";

jest.mock("../../src/config/db", () => ({
  pool: {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  },
  Queryable: {},
}));

jest.mock("../../src/repositories/group4-interaction/phongTroChuyen.repository");
jest.mock("../../src/repositories/group4-interaction/tinNhan.repository");
jest.mock("../../src/repositories/group3-activity/hoatDong.repository");
jest.mock("../../src/repositories/group3-activity/thanhVienHoatDong.repository");
jest.mock("../../src/repositories/group4-interaction/thongBao.repository");

const userToken = jwt.sign(
  { taiKhoanId: 1, nguoiDungId: 10, role: "USER", roles: ["USER"] },
  JWT_SECRET,
  { expiresIn: "1h" },
);

const room = {
  phongId: 5,
  hoatDongId: 100,
  tenPhong: "Weekend football",
  trangThai: "ACTIVE",
};

function mockRoomMemberAccess(): void {
  (pool.query as jest.Mock)
    .mockResolvedValueOnce({ rows: [{ hoatDongId: 100 }], rowCount: 1 })
    .mockResolvedValueOnce({ rows: [], rowCount: 0 })
    .mockResolvedValueOnce({ rows: [{ exists: 1 }], rowCount: 1 });
}

function mockRoomNonMemberAccess(): void {
  (pool.query as jest.Mock)
    .mockResolvedValueOnce({ rows: [{ hoatDongId: 100 }], rowCount: 1 })
    .mockResolvedValueOnce({ rows: [], rowCount: 0 })
    .mockResolvedValueOnce({ rows: [], rowCount: 0 });
}

describe("Chat Router Integration Tests (/api/chat)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/chat/rooms/:phongId/messages", () => {
    it("should return 401 if unauthenticated", async () => {
      const res = await request(app).get("/api/chat/rooms/5/messages");

      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an activity member", async () => {
      mockRoomNonMemberAccess();

      const res = await request(app)
        .get("/api/chat/rooms/5/messages")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(TinNhanRepository.prototype.findByPhongId).not.toHaveBeenCalled();
    });

    it("should return messages if user is an activity member", async () => {
      const messages = [{ tinNhanId: 1, phongId: 5, nguoiGuiId: 10, noiDung: "Hello" }];
      mockRoomMemberAccess();
      (PhongTroChuyenRepository.prototype.findById as jest.Mock).mockResolvedValue(room);
      (TinNhanRepository.prototype.findByPhongId as jest.Mock).mockResolvedValue(messages);

      const res = await request(app)
        .get("/api/chat/rooms/5/messages")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(messages);
    });
  });

  describe("POST /api/chat/rooms/:phongId/messages", () => {
    it("should return 403 if user is not an activity member", async () => {
      mockRoomNonMemberAccess();

      const res = await request(app)
        .post("/api/chat/rooms/5/messages")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ noiDung: "Hello" });

      expect(res.status).toBe(403);
      expect(TinNhanRepository.prototype.create).not.toHaveBeenCalled();
    });

    it("should create message if user is an activity member", async () => {
      const createdMessage = { tinNhanId: 1, phongId: 5, nguoiGuiId: 10, noiDung: "Hello" };
      mockRoomMemberAccess();
      (PhongTroChuyenRepository.prototype.findById as jest.Mock).mockResolvedValue(room);
      (HoatDongRepository.prototype.findById as jest.Mock).mockResolvedValue({
        hoatDongId: 100,
        nguoiToChucId: 20,
      });
      (ThanhVienHoatDongRepository.prototype.isMember as jest.Mock).mockResolvedValue(true);
      (TinNhanRepository.prototype.create as jest.Mock).mockResolvedValue(createdMessage);

      const res = await request(app)
        .post("/api/chat/rooms/5/messages")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ noiDung: " Hello " });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(createdMessage);
      expect(TinNhanRepository.prototype.create).toHaveBeenCalledWith({
        phongId: 5,
        nguoiGuiId: 10,
        noiDung: "Hello",
      });
    });
  });
});

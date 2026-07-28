import { Request, Response, NextFunction } from "express";
import { requireAdmin } from "../../src/middlewares/authorization.middleware";

describe("Authorization Middleware Unit Tests", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should return 403 if user is not authenticated", () => {
    requireAdmin(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Bạn không có quyền thực hiện hành động này.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if user has ADMIN role", () => {
    req.user = { nguoiDungId: 1, role: "ADMIN", roles: ["ADMIN"] };

    requireAdmin(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 403 if user is a normal USER without ADMIN role or ADMIN_USER_IDS match", () => {
    req.user = { nguoiDungId: 999, role: "USER", roles: ["USER"] };

    requireAdmin(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Chỉ quản trị viên mới có quyền thực hiện hành động này.",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next() if nguoiDungId is listed in ADMIN_USER_IDS env", () => {
    process.env.ADMIN_USER_IDS = "1,2,5";
    req.user = { nguoiDungId: 5, role: "USER", roles: ["USER"] };

    requireAdmin(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

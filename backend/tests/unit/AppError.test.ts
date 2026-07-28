import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  ForbiddenError,
  BadRequestError,
} from "../../src/utils/AppError";

describe("AppError Unit Tests", () => {
  // AppError constructor có default statusCode = 400 (theo code thực tế)
  it("should create AppError with default 400 status code", () => {
    const error = new AppError("Test error");
    expect(error.message).toBe("Test error");
    expect(error.statusCode).toBe(400);
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.isOperational).toBe(true);
  });

  it("should create AppError with specified status code", () => {
    const error = new AppError("Custom status error", 422);
    expect(error.message).toBe("Custom status error");
    expect(error.statusCode).toBe(422);
  });

  it("should create NotFoundError with 404 status code", () => {
    const error = new NotFoundError("Hoạt động không tồn tại.");
    expect(error.message).toBe("Hoạt động không tồn tại.");
    expect(error.statusCode).toBe(404);
    expect(error).toBeInstanceOf(AppError);
  });

  it("should use default message for NotFoundError", () => {
    const error = new NotFoundError();
    expect(error.message).toBe("Không tìm thấy tài nguyên.");
    expect(error.statusCode).toBe(404);
  });

  it("should create UnauthorizedError with 401 status code", () => {
    const error = new UnauthorizedError("Unauthorized access");
    expect(error.message).toBe("Unauthorized access");
    expect(error.statusCode).toBe(401);
  });

  it("should create ConflictError with 409 status code", () => {
    const error = new ConflictError("Email đã được sử dụng.");
    expect(error.message).toBe("Email đã được sử dụng.");
    expect(error.statusCode).toBe(409);
  });

  it("should create ForbiddenError with 403 status code", () => {
    const error = new ForbiddenError("Forbidden action");
    expect(error.message).toBe("Forbidden action");
    expect(error.statusCode).toBe(403);
  });

  it("should create BadRequestError with 400 status code", () => {
    const error = new BadRequestError("Invalid payload");
    expect(error.message).toBe("Invalid payload");
    expect(error.statusCode).toBe(400);
  });

  it("should be instanceof Error for all subclasses", () => {
    expect(new NotFoundError()).toBeInstanceOf(Error);
    expect(new ConflictError()).toBeInstanceOf(Error);
    expect(new BadRequestError()).toBeInstanceOf(Error);
    expect(new ForbiddenError()).toBeInstanceOf(Error);
    expect(new UnauthorizedError()).toBeInstanceOf(Error);
  });
});

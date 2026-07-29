/**
 * Lỗi nghiệp vụ có kèm HTTP status code, để middleware xử lý lỗi tập trung
 * (errorHandler.middleware.ts) biết cách trả response phù hợp thay vì luôn
 * mặc định trả về 400 cho mọi loại lỗi.
 *
 * Cách dùng trong service:
 *   throw new AppError('Email đã được sử dụng.', 409);
 *   throw new AppError('Hoạt động không tồn tại.', 404);
 *
 * Nếu chỉ `throw new Error(...)` như code cũ, middleware sẽ coi đây là lỗi
 * hệ thống không lường trước và trả về 500 (an toàn hơn là đoán bừa 400).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly data?: any;

  constructor(message: string, statusCode: number = 400, data?: any) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.name = 'AppError';
    this.data = data;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Không tìm thấy tài nguyên.', data?: any) {
    super(message, 404, data);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Yêu cầu không hợp lệ.', data?: any) {
    super(message, 400, data);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Bạn chưa đăng nhập hoặc token không hợp lệ.', data?: any) {
    super(message, 401, data);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Bạn không có quyền thực hiện hành động này.', data?: any) {
    super(message, 403, data);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Dữ liệu đã tồn tại hoặc bị xung đột.', data?: any) {
    super(message, 409, data);
  }
}

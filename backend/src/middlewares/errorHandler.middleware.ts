import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

/**
 * Middleware 404 - đặt SAU tất cả các router trong index.ts.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy đường dẫn: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Middleware xử lý lỗi tập trung - đặt CUỐI CÙNG trong index.ts (sau notFoundHandler).
 *
 * - AppError (lỗi nghiệp vụ đã biết trước, ví dụ "Email đã tồn tại") -> trả đúng
 *   statusCode + message mà service đã throw.
 * - Lỗi khác (bug, lỗi DB, lỗi không lường trước) -> luôn trả 500 và KHÔNG lộ
 *   chi tiết lỗi gốc ra ngoài (chỉ log ở server), tránh rò rỉ thông tin nội bộ.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  console.error('❌ Unhandled error:', err);

  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.',
  });
}

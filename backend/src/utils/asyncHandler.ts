import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Bọc một async controller handler để tự động bắt lỗi (reject promise)
 * và chuyển cho `next(error)` -> errorHandler.middleware.ts xử lý tập trung.
 *
 * Thay vì mỗi controller phải viết:
 *   try { ... } catch (error: any) { res.status(400).json({ success: false, message: error.message }); }
 *
 * Chỉ cần viết:
 *   public createActivity = asyncHandler(async (req, res) => {
 *     const result = await this.activityService.createActivity(...);
 *     res.status(201).json({ success: true, data: result });
 *   });
 */
export const asyncHandler = (
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void | Response>,
): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

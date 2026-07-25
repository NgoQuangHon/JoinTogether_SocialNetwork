import 'express';

export interface AuthenticatedUser {
  taiKhoanId?: number;
  nguoiDungId: number;
  role?: string;
  roles?: string[];
}

declare global {
  namespace Express {
    interface Request {
      /** Được gán bởi middleware `authenticateToken` sau khi verify JWT thành công. */
      user?: AuthenticatedUser;
    }
  }
}

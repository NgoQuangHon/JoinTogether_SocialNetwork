import { NextFunction, Request, Response } from "express";
import { pool } from "../config/db";

type AuthenticatedUser = {
  taiKhoanId?: number;
  nguoiDungId?: number;
  role?: string;
  roles?: string[];
};

function getUser(req: Request): AuthenticatedUser | null {
  return ((req as any).user as AuthenticatedUser | undefined) ?? null;
}

function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function forbidden(
  res: Response,
  message = "Ban khong co quyen thuc hien hanh dong nay.",
): void {
  res.status(403).json({ success: false, message });
}

function badRequest(res: Response, message = "ID khong hop le."): void {
  res.status(400).json({ success: false, message });
}

async function isActivityOwner(
  hoatDongId: number,
  nguoiDungId: number,
): Promise<boolean> {
  const result = await pool.query(
    `
      SELECT 1
      FROM hoat_dong
      WHERE hoat_dong_id = $1
        AND nguoi_to_chuc_id = $2
      LIMIT 1
    `,
    [hoatDongId, nguoiDungId],
  );

  return (result.rowCount ?? 0) > 0;
}

async function isActivityMember(
  hoatDongId: number,
  nguoiDungId: number,
): Promise<boolean> {
  const result = await pool.query(
    `
      SELECT 1
      FROM thanh_vien_hoat_dong
      WHERE hoat_dong_id = $1
        AND nguoi_dung_id = $2
      LIMIT 1
    `,
    [hoatDongId, nguoiDungId],
  );

  return (result.rowCount ?? 0) > 0;
}

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = getUser(req);
  if (!user?.nguoiDungId) {
    forbidden(res);
    return;
  }

  const roles = new Set([
    user.role?.toUpperCase(),
    ...(user.roles ?? []).map((role) => role.toUpperCase()),
  ]);
  const adminUserIds = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (roles.has("ADMIN") || adminUserIds.includes(user.nguoiDungId)) {
    next();
    return;
  }

  forbidden(res, "Chi quan tri vien moi co quyen thuc hien hanh dong nay.");
}

export function requireActivityOwner(paramName = "id") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = getUser(req);
      const hoatDongId = parseId(req.params[paramName]);

      if (!user?.nguoiDungId) {
        forbidden(res);
        return;
      }

      if (!hoatDongId) {
        badRequest(res, "ID hoat dong khong hop le.");
        return;
      }

      if (await isActivityOwner(hoatDongId, user.nguoiDungId)) {
        next();
        return;
      }

      forbidden(res, "Chi nguoi to chuc moi co quyen thay doi hoat dong nay.");
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export function requireCriteriaOwner(paramName = "id") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = getUser(req);
      const tieuChiId = parseId(req.params[paramName]);

      if (!user?.nguoiDungId) {
        forbidden(res);
        return;
      }

      if (!tieuChiId) {
        badRequest(res, "ID tieu chi khong hop le.");
        return;
      }

      const result = await pool.query(
        `
          SELECT hd.nguoi_to_chuc_id AS "nguoiToChucId"
          FROM tieu_chi_tham_gia tc
          JOIN hoat_dong hd ON hd.hoat_dong_id = tc.hoat_dong_id
          WHERE tc.tieu_chi_id = $1
        `,
        [tieuChiId],
      );

      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "Tieu chi khong ton tai." });
        return;
      }

      if (result.rows[0].nguoiToChucId === user.nguoiDungId) {
        next();
        return;
      }

      forbidden(res, "Chi nguoi to chuc moi co quyen thay doi tieu chi nay.");
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export function requireImageOwner(paramName = "id") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = getUser(req);
      const hinhAnhId = parseId(req.params[paramName]);

      if (!user?.nguoiDungId) {
        forbidden(res);
        return;
      }

      if (!hinhAnhId) {
        badRequest(res, "ID hinh anh khong hop le.");
        return;
      }

      const result = await pool.query(
        `
          SELECT hd.nguoi_to_chuc_id AS "nguoiToChucId"
          FROM hinh_anh_hoat_dong ha
          JOIN hoat_dong hd ON hd.hoat_dong_id = ha.hoat_dong_id
          WHERE ha.hinh_anh_id = $1
        `,
        [hinhAnhId],
      );

      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "Hinh anh khong ton tai." });
        return;
      }

      if (result.rows[0].nguoiToChucId === user.nguoiDungId) {
        next();
        return;
      }

      forbidden(res, "Chi nguoi to chuc moi co quyen thay doi hinh anh nay.");
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export function requireActivityMember(paramName = "hoatDongId") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = getUser(req);
      const hoatDongId = parseId(req.params[paramName]);

      if (!user?.nguoiDungId) {
        forbidden(res);
        return;
      }

      if (!hoatDongId) {
        badRequest(res, "ID hoat dong khong hop le.");
        return;
      }

      const allowed =
        (await isActivityOwner(hoatDongId, user.nguoiDungId)) ||
        (await isActivityMember(hoatDongId, user.nguoiDungId));

      if (allowed) {
        next();
        return;
      }

      forbidden(res, "Chi thanh vien hoat dong moi co quyen truy cap.");
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export function requireChatRoomMember(paramName = "phongId") {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = getUser(req);
      const phongId = parseId(req.params[paramName]);

      if (!user?.nguoiDungId) {
        forbidden(res);
        return;
      }

      if (!phongId) {
        badRequest(res, "ID phong tro chuyen khong hop le.");
        return;
      }

      const result = await pool.query(
        `
          SELECT pt.hoat_dong_id AS "hoatDongId"
          FROM phong_tro_chuyen pt
          WHERE pt.phong_id = $1
        `,
        [phongId],
      );

      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "Phong tro chuyen khong ton tai." });
        return;
      }

      const hoatDongId = Number(result.rows[0].hoatDongId);
      const allowed =
        (await isActivityOwner(hoatDongId, user.nguoiDungId)) ||
        (await isActivityMember(hoatDongId, user.nguoiDungId));

      if (allowed) {
        next();
        return;
      }

      forbidden(
        res,
        "Chi thanh vien hoat dong moi co quyen truy cap phong tro chuyen.",
      );
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}

export function requireReviewParticipant(
  activityParamName = "hoatDongId",
  reviewedUserParamName = "nguoiDuocDanhGiaId",
) {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = getUser(req);
      const hoatDongId = parseId(
        req.params[activityParamName] ?? req.body?.[activityParamName],
      );
      const nguoiDuocDanhGiaId = parseId(
        req.params[reviewedUserParamName] ?? req.body?.[reviewedUserParamName],
      );

      if (!user?.nguoiDungId) {
        forbidden(res);
        return;
      }

      if (!hoatDongId || !nguoiDuocDanhGiaId) {
        badRequest(res, "ID hoat dong hoac nguoi duoc danh gia khong hop le.");
        return;
      }

      if (user.nguoiDungId === nguoiDuocDanhGiaId) {
        forbidden(res, "Khong the tu danh gia chinh minh.");
        return;
      }

      const reviewerAllowed =
        (await isActivityOwner(hoatDongId, user.nguoiDungId)) ||
        (await isActivityMember(hoatDongId, user.nguoiDungId));
      const reviewedAllowed =
        (await isActivityOwner(hoatDongId, nguoiDuocDanhGiaId)) ||
        (await isActivityMember(hoatDongId, nguoiDuocDanhGiaId));

      if (reviewerAllowed && reviewedAllowed) {
        next();
        return;
      }

      forbidden(
        res,
        "Chi nguoi tham gia cung hoat dong moi co the danh gia nhau.",
      );
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
}
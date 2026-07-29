import { NextFunction, Request, Response } from "express";
import { pool } from "../config/db";
import { AuthenticatedUser } from "../types/express";

function getUser(req: Request): AuthenticatedUser | null {
  return req.user === undefined || req.user === null ? null : req.user;
}

function parseId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function forbidden(
  res: Response,
  message = "Bạn không có quyền thực hiện hành động này.",
): void {
  res.status(403).json({ success: false, message });
}

function badRequest(res: Response, message = "ID không hợp lệ."): void {
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

  return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
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

  return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
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
    ...(user.roles === undefined || user.roles === null ? [] : user.roles).map((role) => role.toUpperCase()),
  ]);
  const adminUserIds = (process.env.ADMIN_USER_IDS === undefined || process.env.ADMIN_USER_IDS === null ? "" : process.env.ADMIN_USER_IDS)
    .split(",")
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (roles.has("ADMIN") || adminUserIds.includes(user.nguoiDungId)) {
    next();
    return;
  }

  forbidden(res, "Chỉ quản trị viên mới có quyền thực hiện hành động này.");
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
        badRequest(res, "ID hoạt động không hợp lệ.");
        return;
      }

      if (await isActivityOwner(hoatDongId, user.nguoiDungId)) {
        next();
        return;
      }

      forbidden(res, "Chỉ người tổ chức mới có quyền thay đổi hoạt động này.");
    } catch (error) {
      next(error);
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
        badRequest(res, "ID tiêu chí không hợp lệ.");
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
          .json({ success: false, message: "Tiêu chí không tồn tại." });
        return;
      }

      if (result.rows[0].nguoiToChucId === user.nguoiDungId) {
        next();
        return;
      }

      forbidden(res, "Chỉ người tổ chức mới có quyền thay đổi tiêu chí này.");
    } catch (error) {
      next(error);
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
        badRequest(res, "ID hình ảnh không hợp lệ.");
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
          .json({ success: false, message: "Hình ảnh không tồn tại." });
        return;
      }

      if (result.rows[0].nguoiToChucId === user.nguoiDungId) {
        next();
        return;
      }

      forbidden(res, "Chỉ người tổ chức mới có quyền thay đổi hình ảnh này.");
    } catch (error) {
      next(error);
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
        badRequest(res, "ID hoạt động không hợp lệ.");
        return;
      }

      const allowed =
        (await isActivityOwner(hoatDongId, user.nguoiDungId)) ||
        (await isActivityMember(hoatDongId, user.nguoiDungId));

      if (allowed) {
        next();
        return;
      }

      forbidden(res, "Chỉ thành viên hoạt động mới có quyền truy cập.");
    } catch (error) {
      next(error);
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
        badRequest(res, "ID phòng trò chuyện không hợp lệ.");
        return;
      }

      const result = await pool.query(
        `
          SELECT pt.hoat_dong_id AS "hoatDongId", pt.loai_phong AS "loaiPhong"
          FROM phong_tro_chuyen pt
          WHERE pt.phong_id = $1
        `,
        [phongId],
      );

      if (result.rows.length === 0) {
        res
          .status(404)
          .json({ success: false, message: "Phòng trò chuyện không tồn tại." });
        return;
      }

      const { hoatDongId, loaiPhong } = result.rows[0];

      if (loaiPhong === 'RIENG_TU') {
        const memberCheck = await pool.query(
          `SELECT 1 FROM thanh_vien_phong WHERE phong_id = $1 AND nguoi_dung_id = $2`,
          [phongId, user.nguoiDungId],
        );
        if (memberCheck.rows.length > 0) {
          next();
          return;
        }
        forbidden(
          res,
          "Bạn không có quyền truy cập phòng trò chuyện riêng tư này.",
        );
        return;
      }

      const parsedHoatDongId = Number(hoatDongId);
      const allowed =
        (await isActivityOwner(parsedHoatDongId, user.nguoiDungId)) ||
        (await isActivityMember(parsedHoatDongId, user.nguoiDungId));

      if (allowed) {
        next();
        return;
      }

      forbidden(
        res,
        "Chỉ thành viên hoạt động mới có quyền truy cập phòng trò chuyện.",
      );
    } catch (error) {
      next(error);
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
        req.params[activityParamName] === undefined || req.params[activityParamName] === null ? req.body?.[activityParamName] : req.params[activityParamName],
      );
      const nguoiDuocDanhGiaId = parseId(
        req.params[reviewedUserParamName] === undefined || req.params[reviewedUserParamName] === null ? req.body?.[reviewedUserParamName] : req.params[reviewedUserParamName],
      );

      if (!user?.nguoiDungId) {
        forbidden(res);
        return;
      }

      if (!hoatDongId || !nguoiDuocDanhGiaId) {
        badRequest(res, "ID hoạt động hoặc người được đánh giá không hợp lệ.");
        return;
      }

      if (user.nguoiDungId === nguoiDuocDanhGiaId) {
        forbidden(res, "Không thể tự đánh giá chính mình.");
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
        "Chỉ người tham gia cùng hoạt động mới có thể đánh giá nhau.",
      );
    } catch (error) {
      next(error);
    }
  };
}
import { Request, Response } from "express";
import { RolePermissionService } from "../../services/group6-admin/rolePermission.service";

export class RolePermissionController {
  private rolePermissionService = new RolePermissionService();

  // ==================== UC7.2: QUẢN LÝ VAI TRÒ ====================

  public getRoles = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.rolePermissionService.getRoles();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID vai trò không hợp lệ." });
        return;
      }
      const result = await this.rolePermissionService.getRoleById(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = (req as any).user.nguoiDungId;
      const { tenVaiTro, moTa } = req.body;

      if (!tenVaiTro) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp tên vai trò." });
        return;
      }

      const result = await this.rolePermissionService.createRole(adminId, { tenVaiTro, moTa });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const adminId = (req as any).user.nguoiDungId;
      const { tenVaiTro, moTa } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID vai trò không hợp lệ." });
        return;
      }

      const result = await this.rolePermissionService.updateRole(id, adminId, { tenVaiTro, moTa });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const adminId = (req as any).user.nguoiDungId;

      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID vai trò không hợp lệ." });
        return;
      }

      await this.rolePermissionService.deleteRole(id, adminId);
      res.status(200).json({ success: true, message: "Đã xóa vai trò." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== UC7.2: QUẢN LÝ QUYỀN HẠN ====================

  public getPermissions = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.rolePermissionService.getPermissions();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getPermissionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID quyền hạn không hợp lệ." });
        return;
      }
      const result = await this.rolePermissionService.getPermissionById(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public createPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const adminId = (req as any).user.nguoiDungId;
      const { tenQuyen, moTa } = req.body;

      if (!tenQuyen) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp tên quyền." });
        return;
      }

      const result = await this.rolePermissionService.createPermission(adminId, { tenQuyen, moTa });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public updatePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const adminId = (req as any).user.nguoiDungId;
      const { tenQuyen, moTa } = req.body;

      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID quyền hạn không hợp lệ." });
        return;
      }

      const result = await this.rolePermissionService.updatePermission(id, adminId, { tenQuyen, moTa });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deletePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      const adminId = (req as any).user.nguoiDungId;

      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID quyền hạn không hợp lệ." });
        return;
      }

      await this.rolePermissionService.deletePermission(id, adminId);
      res.status(200).json({ success: true, message: "Đã xóa quyền hạn." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}


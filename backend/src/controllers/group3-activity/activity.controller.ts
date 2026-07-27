import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ActivityService } from "../../services/group3-activity/activity.service";

export class ActivityController {
  private activityService = new ActivityService();

  // ==================== ACTIVITIES ====================

  public createActivity = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiToChucId = req.user!.nguoiDungId;
      const result = await this.activityService.createActivity(
        nguoiToChucId,
        req.body,
      );
      res.status(201).json({ success: true, data: result });
    },
  );

  public getAllActivities = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.activityService.getAllActivities();
      res.status(200).json({ success: true, data: result });
    },
  );

  public getActivityById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID hoạt động không hợp lệ.");
      }
      const result = await this.activityService.getActivityById(id);
      res.status(200).json({ success: true, data: result });
    },
  );

  public updateActivity = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID hoạt động không hợp lệ.");
      }
      const result = await this.activityService.updateActivity(id, req.body);
      res.status(200).json({ success: true, data: result });
    },
  );

  public deleteActivity = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID hoạt động không hợp lệ.");
      }
      await this.activityService.deleteActivity(id);
      res
        .status(200)
        .json({ success: true, message: "Xóa hoạt động thành công." });
    },
  );

  // ==================== CATEGORIES ====================

  public getAllCategories = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.activityService.getAllCategories();
      res.status(200).json({ success: true, data: result });
    },
  );

  public createCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await this.activityService.createCategory(req.body);
      res.status(201).json({ success: true, data: result });
    },
  );

  public updateCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID danh mục không hợp lệ.");
      }
      const result = await this.activityService.updateCategory(id, req.body);
      res.status(200).json({ success: true, data: result });
    },
  );

  public deleteCategory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID danh mục không hợp lệ.");
      }
      await this.activityService.deleteCategory(id);
      res
        .status(200)
        .json({ success: true, message: "Xóa danh mục thành công." });
    },
  );

  // ==================== LOCATIONS ====================

  public getAllLocations = asyncHandler(
    async (_req: Request, res: Response): Promise<void> => {
      const result = await this.activityService.getAllLocations();
      res.status(200).json({ success: true, data: result });
    },
  );

  public createLocation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const result = await this.activityService.createLocation(req.body);
      res.status(201).json({ success: true, data: result });
    },
  );

  public updateLocation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID địa điểm không hợp lệ.");
      }
      const result = await this.activityService.updateLocation(id, req.body);
      res.status(200).json({ success: true, data: result });
    },
  );

  public deleteLocation = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID địa điểm không hợp lệ.");
      }
      await this.activityService.deleteLocation(id);
      res
        .status(200)
        .json({ success: true, message: "Xóa địa điểm thành công." });
    },
  );

  // ==================== IMAGES ====================

  public addImage = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const hoatDongId = parseInt(req.params.id as string, 10);
      if (isNaN(hoatDongId)) {
        throw new Error("ID hoạt động không hợp lệ.");
      }
      const result = await this.activityService.addImage(hoatDongId, req.body);
      res.status(201).json({ success: true, data: result });
    },
  );

  public deleteImage = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        throw new Error("ID hình ảnh không hợp lệ.");
      }
      await this.activityService.deleteImage(id);
      res
        .status(200)
        .json({ success: true, message: "Xóa hình ảnh thành công." });
    },
  );
}

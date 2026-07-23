import { Request, Response } from "express";
import { ActivityService } from "../../services/group3-activity/activity.service";

export class ActivityController {
  private activityService = new ActivityService();

  // ==================== ACTIVITIES ====================

  public createActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiToChucId = (req as any).user.nguoiDungId;
      const result = await this.activityService.createActivity(nguoiToChucId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getAllActivities = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.activityService.getAllActivities();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getActivityById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID hoạt động không hợp lệ."); }
      const result = await this.activityService.getActivityById(id);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public updateActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID hoạt động không hợp lệ."); }
      const result = await this.activityService.updateActivity(id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID hoạt động không hợp lệ."); }
      await this.activityService.deleteActivity(id);
      res.status(200).json({ success: true, message: "Xóa hoạt động thành công." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== CATEGORIES ====================

  public getAllCategories = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.activityService.getAllCategories();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public createCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.activityService.createCategory(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public updateCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID danh mục không hợp lệ."); }
      const result = await this.activityService.updateCategory(id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteCategory = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID danh mục không hợp lệ."); }
      await this.activityService.deleteCategory(id);
      res.status(200).json({ success: true, message: "Xóa danh mục thành công." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== LOCATIONS ====================

  public getAllLocations = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.activityService.getAllLocations();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public createLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.activityService.createLocation(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public updateLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID địa điểm không hợp lệ."); }
      const result = await this.activityService.updateLocation(id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteLocation = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID địa điểm không hợp lệ."); }
      await this.activityService.deleteLocation(id);
      res.status(200).json({ success: true, message: "Xóa địa điểm thành công." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== IMAGES ====================

  public addImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const hoatDongId = parseInt(req.params.id as string, 10);
      if (isNaN(hoatDongId)) { throw new Error("ID hoạt động không hợp lệ."); }
      const result = await this.activityService.addImage(hoatDongId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteImage = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID hình ảnh không hợp lệ."); }
      await this.activityService.deleteImage(id);
      res.status(200).json({ success: true, message: "Xóa hình ảnh thành công." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}

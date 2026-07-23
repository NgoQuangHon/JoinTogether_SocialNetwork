import { Request, Response } from "express";
import { CriteriaService } from "../../services/group3-activity/criteria.service";

export class CriteriaController {
  private criteriaService = new CriteriaService();

  public getCriteriaByActivity = async (req: Request, res: Response): Promise<void> => {
    try {
      const hoatDongId = parseInt(req.params.hoatDongId as string, 10);
      if (isNaN(hoatDongId)) { throw new Error("ID hoạt động không hợp lệ."); }
      const result = await this.criteriaService.getCriteriaByActivity(hoatDongId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public addCriteria = async (req: Request, res: Response): Promise<void> => {
    try {
      const hoatDongId = parseInt(req.params.hoatDongId as string, 10);
      if (isNaN(hoatDongId)) { throw new Error("ID hoạt động không hợp lệ."); }
      const result = await this.criteriaService.addCriteria(hoatDongId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public updateCriteria = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID tiêu chí không hợp lệ."); }
      const result = await this.criteriaService.updateCriteria(id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteCriteria = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID tiêu chí không hợp lệ."); }
      await this.criteriaService.deleteCriteria(id);
      res.status(200).json({ success: true, message: "Xóa tiêu chí thành công." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}

import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { CriteriaService } from "../../services/group3-activity/criteria.service";

export class CriteriaController {
  private criteriaService = new CriteriaService();

  public getCriteriaByActivity = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const hoatDongId = parseInt(req.params.hoatDongId as string, 10);
      if (isNaN(hoatDongId)) { throw new Error("ID hoạt động không hợp lệ."); }
      const result = await this.criteriaService.getCriteriaByActivity(hoatDongId);
      res.status(200).json({ success: true, data: result });
    });

  public addCriteria = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const hoatDongId = parseInt(req.params.hoatDongId as string, 10);
      if (isNaN(hoatDongId)) { throw new Error("ID hoạt động không hợp lệ."); }
      const result = await this.criteriaService.addCriteria(hoatDongId, req.body);
      res.status(201).json({ success: true, data: result });
    });

  public updateCriteria = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID tiêu chí không hợp lệ."); }
      const result = await this.criteriaService.updateCriteria(id, req.body);
      res.status(200).json({ success: true, data: result });
    });

  public deleteCriteria = asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) { throw new Error("ID tiêu chí không hợp lệ."); }
      await this.criteriaService.deleteCriteria(id);
      res.status(200).json({ success: true, message: "Xóa tiêu chí thành công." });
    });
}

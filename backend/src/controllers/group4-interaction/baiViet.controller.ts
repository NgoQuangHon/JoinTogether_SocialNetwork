import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { BaiVietService } from "../../services/group4-interaction/baiViet.service";

export class BaiVietController {
  private service = new BaiVietService();

  public create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiDungId = req.user!.nguoiDungId;
    const result = await this.service.create({ ...req.body, nguoiDungId });
    res.status(201).json({ success: true, data: result });
  });

  public getAll = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const result = await this.service.getAll();
    res.status(200).json({ success: true, data: result });
  });
}

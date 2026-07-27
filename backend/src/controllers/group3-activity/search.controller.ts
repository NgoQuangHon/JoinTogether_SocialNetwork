import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { SearchService } from "../../services/group3-activity/search.service";

export class SearchController {
  private searchService = new SearchService();

  public searchActivities = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const {
        keyword,
        danhMucHoatDongId,
        diaDiemId,
        tuNgay,
        denNgay,
        limit,
        offset,
      } = req.query;

      const filters: any = {};
      if (keyword) filters.keyword = keyword as string;
      if (danhMucHoatDongId)
        filters.danhMucHoatDongId = parseInt(danhMucHoatDongId as string, 10);
      if (diaDiemId) filters.diaDiemId = parseInt(diaDiemId as string, 10);
      if (tuNgay) filters.tuNgay = tuNgay as string;
      if (denNgay) filters.denNgay = denNgay as string;
      if (limit) filters.limit = parseInt(limit as string, 10);
      if (offset) filters.offset = parseInt(offset as string, 10);

      const result = await this.searchService.searchActivities(
        nguoiDungId,
        filters,
      );

      res
        .status(200)
        .json({ success: true, data: result.rows, total: result.total });
    },
  );

  public getSearchHistory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      const result = await this.searchService.getSearchHistory(nguoiDungId);
      res.status(200).json({ success: true, data: result });
    },
  );

  public clearSearchHistory = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const nguoiDungId = req.user!.nguoiDungId;
      await this.searchService.clearSearchHistory(nguoiDungId);
      res
        .status(200)
        .json({ success: true, message: "Xóa lịch sử tìm kiếm thành công." });
    },
  );
}

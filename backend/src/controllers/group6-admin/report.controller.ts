import { Request, Response } from "express";
import { ReportService } from "../../services/group6-admin/report.service";

export class ReportController {
  private reportService = new ReportService();

  // ==================== UC6.1: GỬI BÁO CÁO VI PHẠM ====================

  public createReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiBaoCaoId = (req as any).user.nguoiDungId;
      const { nguoiBiBaoCaoId, loaiViPhamId, noiDung, bangChung } = req.body;

      if (!nguoiBiBaoCaoId || !loaiViPhamId) {
        res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp ID người bị báo cáo và loại vi phạm.",
        });
        return;
      }

      const result = await this.reportService.createReport(nguoiBaoCaoId, {
        nguoiBiBaoCaoId,
        loaiViPhamId,
        noiDung,
        bangChung,
      });

      res.status(201).json({ success: true, message: "Đã gửi báo cáo vi phạm.", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== XEM DANH SÁCH BÁO CÁO ====================

  public getReports = async (req: Request, res: Response): Promise<void> => {
    try {
      const trangThai = req.query.trangThai as string | undefined;
      const result = await this.reportService.getReports(trangThai);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getReportById = async (req: Request, res: Response): Promise<void> => {
    try {
      const baoCaoId = parseInt(req.params.id as string, 10);

      if (isNaN(baoCaoId)) {
        res.status(400).json({ success: false, message: "ID báo cáo không hợp lệ." });
        return;
      }

      const result = await this.reportService.getReportById(baoCaoId);
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== UC6.2: XỬ LÝ BÁO CÁO ====================

  public processReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const nguoiXuLyId = (req as any).user.nguoiDungId;
      const baoCaoId = parseInt(req.params.id as string, 10);
      const { ketQua, truDiem } = req.body;

      if (isNaN(baoCaoId)) {
        res.status(400).json({ success: false, message: "ID báo cáo không hợp lệ." });
        return;
      }

      if (!ketQua) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp kết quả xử lý." });
        return;
      }

      const result = await this.reportService.processReport(baoCaoId, nguoiXuLyId, { ketQua, truDiem });
      res.status(200).json({ success: true, message: "Đã xử lý báo cáo.", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== LOẠI VI PHẠM ====================

  public getLoaiViPham = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.reportService.getLoaiViPham();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public createLoaiViPham = async (req: Request, res: Response): Promise<void> => {
    try {
      const { tenLoai, moTa, mucDo } = req.body;

      if (!tenLoai) {
        res.status(400).json({ success: false, message: "Vui lòng cung cấp tên loại vi phạm." });
        return;
      }

      const result = await this.reportService.createLoaiViPham({ tenLoai, moTa, mucDo });
      res.status(201).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // ==================== UC6.3: QUẢN LÝ VI PHẠM ====================

  public updateLoaiViPham = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID loại vi phạm không hợp lệ." });
        return;
      }

      const { tenLoai, moTa, mucDo } = req.body;
      const result = await this.reportService.updateLoaiViPham(id, { tenLoai, moTa, mucDo });
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public deleteLoaiViPham = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id as string, 10);
      if (isNaN(id)) {
        res.status(400).json({ success: false, message: "ID loại vi phạm không hợp lệ." });
        return;
      }

      await this.reportService.deleteLoaiViPham(id);
      res.status(200).json({ success: true, message: "Đã xóa loại vi phạm." });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  public getViolationStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.reportService.getViolationStats();
      res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
}


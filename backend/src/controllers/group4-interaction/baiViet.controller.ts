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

  public getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiDungId = req.user!.nguoiDungId;
    const result = await this.service.getAll(nguoiDungId);
    res.status(200).json({ success: true, data: result });
  });

  public like = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiDungId = req.user!.nguoiDungId;
    const baiVietId = parseInt(req.params.id as string, 10);
    if (isNaN(baiVietId)) { res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." }); return; }
    await this.service.like(nguoiDungId, baiVietId);
    res.status(200).json({ success: true, message: "Đã thích." });
  });

  public unlike = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiDungId = req.user!.nguoiDungId;
    const baiVietId = parseInt(req.params.id as string, 10);
    if (isNaN(baiVietId)) { res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." }); return; }
    await this.service.unlike(nguoiDungId, baiVietId);
    res.status(200).json({ success: true, message: "Đã bỏ thích." });
  });

  public getComments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const baiVietId = parseInt(req.params.id as string, 10);
    if (isNaN(baiVietId)) { res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." }); return; }
    const result = await this.service.getComments(baiVietId);
    res.status(200).json({ success: true, data: result });
  });

  public addComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiDungId = req.user!.nguoiDungId;
    const baiVietId = parseInt(req.params.id as string, 10);
    const { noiDung } = req.body;
    if (isNaN(baiVietId)) { res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." }); return; }
    if (!noiDung || !noiDung.trim()) { res.status(400).json({ success: false, message: "Nội dung bình luận không được để trống." }); return; }
    const result = await this.service.addComment(baiVietId, nguoiDungId, noiDung.trim());
    res.status(201).json({ success: true, data: result });
  });

  public deleteComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiDungId = req.user!.nguoiDungId;
    const binhLuanId = parseInt(req.params.commentId as string, 10);
    if (isNaN(binhLuanId)) { res.status(400).json({ success: false, message: "ID bình luận không hợp lệ." }); return; }
    const deleted = await this.service.deleteComment(binhLuanId, nguoiDungId);
    if (!deleted) { res.status(404).json({ success: false, message: "Không tìm thấy bình luận." }); return; }
    res.status(200).json({ success: true, message: "Đã xóa bình luận." });
  });

  public share = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const nguoiDungId = req.user!.nguoiDungId;
    const baiVietId = parseInt(req.params.id as string, 10);
    if (isNaN(baiVietId)) { res.status(400).json({ success: false, message: "ID bài viết không hợp lệ." }); return; }
    await this.service.share(baiVietId, nguoiDungId);
    res.status(200).json({ success: true, message: "Đã chia sẻ." });
  });
}

import { BaiVietRepository } from "../../repositories/group4-interaction/baiViet.repository";
import { ThichBaiVietRepository } from "../../repositories/group4-interaction/thichBaiViet.repository";
import { BinhLuanRepository } from "../../repositories/group4-interaction/binhLuan.repository";
import { ChiaSeRepository } from "../../repositories/group4-interaction/chiaSe.repository";

export class BaiVietService {
  private repo = new BaiVietRepository();
  private thichRepo = new ThichBaiVietRepository();
  private binhLuanRepo = new BinhLuanRepository();
  private chiaSeRepo = new ChiaSeRepository();

  async create(data: any): Promise<any> {
    return await this.repo.create(data);
  }

  async getAll(nguoiDungId?: number): Promise<any[]> {
    const posts = await this.repo.findAll();
    if (nguoiDungId) {
      const likedIds = await this.thichRepo.findLikedPostIds(nguoiDungId);
      return posts.map((p: any) => ({ ...p, daThich: likedIds.has(p.baiVietId) }));
    }
    return posts;
  }

  async like(nguoiDungId: number, baiVietId: number): Promise<void> {
    await this.thichRepo.like(nguoiDungId, baiVietId);
  }

  async unlike(nguoiDungId: number, baiVietId: number): Promise<void> {
    await this.thichRepo.unlike(nguoiDungId, baiVietId);
  }

  async getComments(baiVietId: number): Promise<any[]> {
    return await this.binhLuanRepo.findByBaiVietId(baiVietId);
  }

  async addComment(baiVietId: number, nguoiDungId: number, noiDung: string): Promise<any> {
    return await this.binhLuanRepo.create(baiVietId, nguoiDungId, noiDung);
  }

  async deleteComment(binhLuanId: number, nguoiDungId: number): Promise<boolean> {
    return await this.binhLuanRepo.delete(binhLuanId, nguoiDungId);
  }

  async share(baiVietId: number, nguoiDungId: number): Promise<void> {
    await this.chiaSeRepo.share(baiVietId, nguoiDungId);
  }
}

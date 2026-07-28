import { BaiVietRepository } from "../../repositories/group4-interaction/baiViet.repository";

export class BaiVietService {
  private repo = new BaiVietRepository();

  async create(data: any): Promise<any> {
    return await this.repo.create(data);
  }

  async getAll(): Promise<any[]> {
    return await this.repo.findAll();
  }
}

import { pool, Queryable } from "../../config/db";
import { DanhGia } from "../../models/group5-review/danhGia.model";

export class DanhGiaRepository {
  constructor() {
    this.ensureReplyColumns();
  }

  private async ensureReplyColumns() {
    try {
      await pool.query(`
        ALTER TABLE danh_gia ADD COLUMN IF NOT EXISTS phan_hoi TEXT;
        ALTER TABLE danh_gia ADD COLUMN IF NOT EXISTS thoi_gian_phan_hoi TIMESTAMP;
        ALTER TABLE danh_gia ADD COLUMN IF NOT EXISTS trang_thai VARCHAR(50) DEFAULT 'ACTIVE';
      `);
    } catch {}
  }

  async create(data: Partial<DanhGia>, executor: Queryable = pool): Promise<DanhGia> {
    const query = `
      INSERT INTO danh_gia (hoat_dong_id, nguoi_danh_gia_id, nguoi_duoc_danh_gia_id, nhan_xet, diem_tong)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        danh_gia_id AS "danhGiaId",
        hoat_dong_id AS "hoatDongId",
        nguoi_danh_gia_id AS "nguoiDanhGiaId",
        nguoi_duoc_danh_gia_id AS "nguoiDuocDanhGiaId",
        nhan_xet AS "nhanXet",
        diem_tong AS "diemTong",
        phan_hoi AS "phanHoi",
        thoi_gian_phan_hoi AS "thoiGianPhanHoi",
        trang_thai AS "trangThai"
    `;
    const result = await executor.query(query, [
      data.hoatDongId,
      data.nguoiDanhGiaId,
      data.nguoiDuocDanhGiaId,
      data.nhanXet === undefined || data.nhanXet === null ? null : data.nhanXet,
      data.diemTong === undefined || data.diemTong === null ? null : data.diemTong,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<any | null> {
    const query = `
      SELECT
        danh_gia_id AS "danhGiaId",
        hoat_dong_id AS "hoatDongId",
        nguoi_danh_gia_id AS "nguoiDanhGiaId",
        nguoi_duoc_danh_gia_id AS "nguoiDuocDanhGiaId",
        nhan_xet AS "nhanXet",
        diem_tong AS "diemTong",
        phan_hoi AS "phanHoi",
        thoi_gian_phan_hoi AS "thoiGianPhanHoi",
        trang_thai AS "trangThai"
      FROM danh_gia
      WHERE danh_gia_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByHoatDongId(hoatDongId: number): Promise<any[]> {
    const query = `
      SELECT
        dg.danh_gia_id AS "danhGiaId",
        dg.hoat_dong_id AS "hoatDongId",
        dg.nguoi_danh_gia_id AS "nguoiDanhGiaId",
        nd.ho_ten AS "nguoiDanhGia",
        dg.nguoi_duoc_danh_gia_id AS "nguoiDuocDanhGiaId",
        nn.ho_ten AS "nguoiDuocDanhGia",
        dg.nhan_xet AS "nhanXet",
        dg.diem_tong AS "diemTong",
        dg.phan_hoi AS "phanHoi",
        dg.thoi_gian_phan_hoi AS "thoiGianPhanHoi",
        dg.trang_thai AS "trangThai"
      FROM danh_gia dg
      LEFT JOIN nguoi_dung nd ON dg.nguoi_danh_gia_id = nd.nguoi_dung_id
      LEFT JOIN nguoi_dung nn ON dg.nguoi_duoc_danh_gia_id = nn.nguoi_dung_id
      WHERE dg.hoat_dong_id = $1
      ORDER BY dg.danh_gia_id DESC
    `;
    const result = await pool.query(query, [hoatDongId]);
    return result.rows;
  }

  async findByNguoiDuocDanhGia(nguoiDuocDanhGiaId: number): Promise<any[]> {
    const query = `
      SELECT
        dg.danh_gia_id AS "danhGiaId",
        dg.hoat_dong_id AS "hoatDongId",
        hd.ten_hoat_dong AS "tenHoatDong",
        dg.nguoi_danh_gia_id AS "nguoiDanhGiaId",
        nd.ho_ten AS "nguoiDanhGia",
        dg.nhan_xet AS "nhanXet",
        dg.diem_tong AS "diemTong",
        dg.phan_hoi AS "phanHoi",
        dg.thoi_gian_phan_hoi AS "thoiGianPhanHoi",
        dg.trang_thai AS "trangThai"
      FROM danh_gia dg
      JOIN hoat_dong hd ON dg.hoat_dong_id = hd.hoat_dong_id
      LEFT JOIN nguoi_dung nd ON dg.nguoi_danh_gia_id = nd.nguoi_dung_id
      WHERE dg.nguoi_duoc_danh_gia_id = $1
      ORDER BY dg.danh_gia_id DESC
    `;
    const result = await pool.query(query, [nguoiDuocDanhGiaId]);
    return result.rows;
  }

  async findExistingReview(hoatDongId: number, nguoiDanhGiaId: number, nguoiDuocDanhGiaId: number): Promise<DanhGia | null> {
    const query = `
      SELECT
        danh_gia_id AS "danhGiaId",
        hoat_dong_id AS "hoatDongId",
        nguoi_danh_gia_id AS "nguoiDanhGiaId",
        nguoi_duoc_danh_gia_id AS "nguoiDuocDanhGiaId",
        nhan_xet AS "nhanXet",
        diem_tong AS "diemTong"
      FROM danh_gia
      WHERE hoat_dong_id = $1 AND nguoi_danh_gia_id = $2 AND nguoi_duoc_danh_gia_id = $3
    `;
    const result = await pool.query(query, [hoatDongId, nguoiDanhGiaId, nguoiDuocDanhGiaId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateReply(danhGiaId: number, phanHoi: string): Promise<any> {
    const query = `
      UPDATE danh_gia
      SET phan_hoi = $1, thoi_gian_phan_hoi = NOW()
      WHERE danh_gia_id = $2
      RETURNING
        danh_gia_id AS "danhGiaId",
        phan_hoi AS "phanHoi",
        thoi_gian_phan_hoi AS "thoiGianPhanHoi"
    `;
    const result = await pool.query(query, [phanHoi, danhGiaId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM danh_gia WHERE danh_gia_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
  }
}

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
        ALTER TABLE danh_gia ADD COLUMN IF NOT EXISTS loai_danh_gia VARCHAR(50) DEFAULT 'USER';
      `);
    } catch {}
  }

  async create(data: Partial<DanhGia> & { loaiDanhGia?: string }, executor: Queryable = pool): Promise<DanhGia> {
    const query = `
      INSERT INTO danh_gia (hoat_dong_id, nguoi_danh_gia_id, nguoi_duoc_danh_gia_id, nhan_xet, diem_tong, loai_danh_gia)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        danh_gia_id AS "danhGiaId",
        hoat_dong_id AS "hoatDongId",
        nguoi_danh_gia_id AS "nguoiDanhGiaId",
        nguoi_duoc_danh_gia_id AS "nguoiDuocDanhGiaId",
        nhan_xet AS "nhanXet",
        diem_tong AS "diemTong",
        phan_hoi AS "phanHoi",
        thoi_gian_phan_hoi AS "thoiGianPhanHoi",
        trang_thai AS "trangThai",
        loai_danh_gia AS "loaiDanhGia"
    `;
    const result = await executor.query(query, [
      data.hoatDongId,
      data.nguoiDanhGiaId,
      data.nguoiDuocDanhGiaId || null,
      data.nhanXet === undefined || data.nhanXet === null ? null : data.nhanXet,
      data.diemTong === undefined || data.diemTong === null ? null : data.diemTong,
      data.loaiDanhGia || (data.nguoiDuocDanhGiaId ? 'USER' : 'HOAT_DONG'),
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
        trang_thai AS "trangThai",
        loai_danh_gia AS "loaiDanhGia"
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
        hs.anh_dai_dien AS "anhDaiDienNguoiDanhGia",
        dg.nguoi_duoc_danh_gia_id AS "nguoiDuocDanhGiaId",
        nn.ho_ten AS "nguoiDuocDanhGia",
        dg.nhan_xet AS "nhanXet",
        dg.diem_tong AS "diemTong",
        dg.phan_hoi AS "phanHoi",
        dg.thoi_gian_phan_hoi AS "thoiGianPhanHoi",
        dg.trang_thai AS "trangThai",
        COALESCE(dg.loai_danh_gia, CASE WHEN dg.nguoi_duoc_danh_gia_id IS NULL THEN 'HOAT_DONG' ELSE 'USER' END) AS "loaiDanhGia"
      FROM danh_gia dg
      LEFT JOIN nguoi_dung nd ON dg.nguoi_danh_gia_id = nd.nguoi_dung_id
      LEFT JOIN ho_so_nguoi_dung hs ON hs.nguoi_dung_id = nd.nguoi_dung_id
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
        hs.anh_dai_dien AS "anhDaiDienNguoiDanhGia",
        dg.nhan_xet AS "nhanXet",
        dg.diem_tong AS "diemTong",
        dg.phan_hoi AS "phanHoi",
        dg.thoi_gian_phan_hoi AS "thoiGianPhanHoi",
        dg.trang_thai AS "trangThai",
        COALESCE(dg.loai_danh_gia, 'USER') AS "loaiDanhGia"
      FROM danh_gia dg
      JOIN hoat_dong hd ON dg.hoat_dong_id = hd.hoat_dong_id
      LEFT JOIN nguoi_dung nd ON dg.nguoi_danh_gia_id = nd.nguoi_dung_id
      LEFT JOIN ho_so_nguoi_dung hs ON hs.nguoi_dung_id = nd.nguoi_dung_id
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

  async findExistingActivityReview(hoatDongId: number, nguoiDanhGiaId: number): Promise<DanhGia | null> {
    const query = `
      SELECT
        danh_gia_id AS "danhGiaId",
        hoat_dong_id AS "hoatDongId",
        nguoi_danh_gia_id AS "nguoiDanhGiaId",
        nhan_xet AS "nhanXet",
        diem_tong AS "diemTong"
      FROM danh_gia
      WHERE hoat_dong_id = $1 AND nguoi_danh_gia_id = $2 AND (loai_danh_gia = 'HOAT_DONG' OR nguoi_duoc_danh_gia_id IS NULL)
    `;
    const result = await pool.query(query, [hoatDongId, nguoiDanhGiaId]);
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

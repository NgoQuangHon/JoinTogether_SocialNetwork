import { pool } from "../../config/db";
import { BaoCaoViPham } from "../../models/group6-admin/baoCaoViPham.model";

export class BaoCaoViPhamRepository {
  constructor() {
    this.ensureColumns();
  }

  private async ensureColumns() {
    try {
      await pool.query(`
        ALTER TABLE bao_cao_vi_pham ADD COLUMN IF NOT EXISTS thoi_gian_tao TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE bao_cao_vi_pham ADD COLUMN IF NOT EXISTS trang_thai VARCHAR(50) DEFAULT 'CHO_XU_LY';
        ALTER TABLE bao_cao_vi_pham ADD COLUMN IF NOT EXISTS hoat_dong_id INTEGER;
        ALTER TABLE bao_cao_vi_pham ADD COLUMN IF NOT EXISTS thanh_vien_id INTEGER;
      `);
    } catch {}
  }

  async create(data: Partial<BaoCaoViPham>): Promise<BaoCaoViPham> {
    const query = `
      INSERT INTO bao_cao_vi_pham (nguoi_bao_cao_id, nguoi_bi_bao_cao_id, loai_vi_pham_id, noi_dung, hoat_dong_id, thanh_vien_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING
        bao_cao_id AS "baoCaoId",
        nguoi_bao_cao_id AS "nguoiBaoCaoId",
        nguoi_bi_bao_cao_id AS "nguoiBiBaoCaoId",
        loai_vi_pham_id AS "loaiViPhamId",
        noi_dung AS "noiDung",
        hoat_dong_id AS "hoatDongId",
        thanh_vien_id AS "thanhVienId",
        thoi_gian_tao AS "thoiGianTao",
        trang_thai AS "trangThai"
    `;
    const result = await pool.query(query, [
      data.nguoiBaoCaoId,
      data.nguoiBiBaoCaoId,
      data.loaiViPhamId,
      data.noiDung === undefined || data.noiDung === null ? null : data.noiDung,
      data.hoatDongId === undefined || data.hoatDongId === null ? null : data.hoatDongId,
      data.thanhVienId === undefined || data.thanhVienId === null || data.thanhVienId === 0 ? null : data.thanhVienId,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<any | null> {
    const query = `
      SELECT
        bcvp.bao_cao_id AS "baoCaoId",
        bcvp.nguoi_bao_cao_id AS "nguoiBaoCaoId",
        nc.ho_ten AS "nguoiBaoCao",
        bcvp.nguoi_bi_bao_cao_id AS "nguoiBiBaoCaoId",
        nb.ho_ten AS "nguoiBiBaoCao",
        bcvp.loai_vi_pham_id AS "loaiViPhamId",
        lvp.ten_loai AS "tenLoaiViPham",
        bcvp.noi_dung AS "noiDung",
        bcvp.hoat_dong_id AS "hoatDongId",
        hd.ten_hoat_dong AS "tenHoatDong",
        bcvp.thanh_vien_id AS "thanhVienId",
        bcvp.thoi_gian_tao AS "thoiGianTao",
        bcvp.trang_thai AS "trangThai"
      FROM bao_cao_vi_pham bcvp
      LEFT JOIN nguoi_dung nc ON bcvp.nguoi_bao_cao_id = nc.nguoi_dung_id
      LEFT JOIN nguoi_dung nb ON bcvp.nguoi_bi_bao_cao_id = nb.nguoi_dung_id
      LEFT JOIN loai_vi_pham lvp ON bcvp.loai_vi_pham_id = lvp.loai_vi_pham_id
      LEFT JOIN hoat_dong hd ON bcvp.hoat_dong_id = hd.hoat_dong_id
      WHERE bcvp.bao_cao_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findAll(trangThai?: string): Promise<any[]> {
    let query = `
      SELECT
        bcvp.bao_cao_id AS "baoCaoId",
        bcvp.nguoi_bao_cao_id AS "nguoiBaoCaoId",
        nc.ho_ten AS "nguoiBaoCao",
        bcvp.nguoi_bi_bao_cao_id AS "nguoiBiBaoCaoId",
        nb.ho_ten AS "nguoiBiBaoCao",
        bcvp.loai_vi_pham_id AS "loaiViPhamId",
        lvp.ten_loai AS "tenLoaiViPham",
        bcvp.noi_dung AS "noiDung",
        bcvp.hoat_dong_id AS "hoatDongId",
        hd.ten_hoat_dong AS "tenHoatDong",
        bcvp.thanh_vien_id AS "thanhVienId",
        bcvp.thoi_gian_tao AS "thoiGianTao",
        bcvp.trang_thai AS "trangThai",
        qd.quyet_dinh_id AS "quyetDinhId",
        qd.ket_qua AS "ketQua"
      FROM bao_cao_vi_pham bcvp
      LEFT JOIN nguoi_dung nc ON bcvp.nguoi_bao_cao_id = nc.nguoi_dung_id
      LEFT JOIN nguoi_dung nb ON bcvp.nguoi_bi_bao_cao_id = nb.nguoi_dung_id
      LEFT JOIN loai_vi_pham lvp ON bcvp.loai_vi_pham_id = lvp.loai_vi_pham_id
      LEFT JOIN hoat_dong hd ON bcvp.hoat_dong_id = hd.hoat_dong_id
      LEFT JOIN quyet_dinh_xu_ly qd ON bcvp.bao_cao_id = qd.bao_cao_id
    `;

    const values: any[] = [];
    if (trangThai === 'CHUA_XU_LY' || trangThai === 'CHO_XU_LY' || trangThai === 'pending') {
      query += ` WHERE qd.quyet_dinh_id IS NULL`;
    } else if (trangThai === 'DA_XU_LY' || trangThai === 'processed') {
      query += ` WHERE qd.quyet_dinh_id IS NOT NULL`;
    }

    query += ` ORDER BY bcvp.bao_cao_id DESC`;
    const result = await pool.query(query, values);
    return result.rows.map((row: any) => ({
      ...row,
      quyetDinh: row.quyetDinhId ? { quyetDinhId: row.quyetDinhId, ketQua: row.ketQua } : null,
    }));
  }

  async findByNguoiBaoCao(nguoiBaoCaoId: number): Promise<any[]> {
    const query = `
      SELECT
        bao_cao_id AS "baoCaoId",
        nguoi_bao_cao_id AS "nguoiBaoCaoId",
        nguoi_bi_bao_cao_id AS "nguoiBiBaoCaoId",
        loai_vi_pham_id AS "loaiViPhamId",
        noi_dung AS "noiDung",
        hoat_dong_id AS "hoatDongId",
        thanh_vien_id AS "thanhVienId",
        thoi_gian_tao AS "thoiGianTao",
        trang_thai AS "trangThai"
      FROM bao_cao_vi_pham
      WHERE nguoi_bao_cao_id = $1
      ORDER BY bao_cao_id DESC
    `;
    const result = await pool.query(query, [nguoiBaoCaoId]);
    return result.rows;
  }
}

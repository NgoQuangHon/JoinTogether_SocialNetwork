import { pool } from "../../config/db";
import { BaoCaoViPham } from "../../models/group6-admin/baoCaoViPham.model";

export class BaoCaoViPhamRepository {
  async create(data: Partial<BaoCaoViPham>): Promise<BaoCaoViPham> {
    const query = `
      INSERT INTO bao_cao_vi_pham (nguoi_bao_cao_id, nguoi_bi_bao_cao_id, loai_vi_pham_id, noi_dung)
      VALUES ($1, $2, $3, $4)
      RETURNING
        bao_cao_id AS "baoCaoId",
        nguoi_bao_cao_id AS "nguoiBaoCaoId",
        nguoi_bi_bao_cao_id AS "nguoiBiBaoCaoId",
        loai_vi_pham_id AS "loaiViPhamId",
        noi_dung AS "noiDung"
    `;
    const result = await pool.query(query, [
      data.nguoiBaoCaoId,
      data.nguoiBiBaoCaoId,
      data.loaiViPhamId,
      data.noiDung === undefined || data.noiDung === null ? null : data.noiDung,
    ]);
    return result.rows[0];
  }

  async findById(id: number): Promise<any | null> {
    const query = `
      SELECT
        bao_cao_id AS "baoCaoId",
        nguoi_bao_cao_id AS "nguoiBaoCaoId",
        nc.ho_ten AS "nguoiBaoCao",
        nguoi_bi_bao_cao_id AS "nguoiBiBaoCaoId",
        nb.ho_ten AS "nguoiBiBaoCao",
        loai_vi_pham_id AS "loaiViPhamId",
        lvp.ten_loai AS "tenLoaiViPham",
        noi_dung AS "noiDung"
      FROM bao_cao_vi_pham bcvp
      LEFT JOIN nguoi_dung nc ON bcvp.nguoi_bao_cao_id = nc.nguoi_dung_id
      LEFT JOIN nguoi_dung nb ON bcvp.nguoi_bi_bao_cao_id = nb.nguoi_dung_id
      LEFT JOIN loai_vi_pham lvp ON bcvp.loai_vi_pham_id = lvp.loai_vi_pham_id
      WHERE bao_cao_id = $1
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
        qd.quyet_dinh_id AS "quyetDinhId",
        qd.ket_qua AS "ketQua"
      FROM bao_cao_vi_pham bcvp
      LEFT JOIN nguoi_dung nc ON bcvp.nguoi_bao_cao_id = nc.nguoi_dung_id
      LEFT JOIN nguoi_dung nb ON bcvp.nguoi_bi_bao_cao_id = nb.nguoi_dung_id
      LEFT JOIN loai_vi_pham lvp ON bcvp.loai_vi_pham_id = lvp.loai_vi_pham_id
      LEFT JOIN quyet_dinh_xu_ly qd ON bcvp.bao_cao_id = qd.bao_cao_id
    `;

    const values: any[] = [];
    if (trangThai === 'CHUA_XU_LY') {
      query += ` WHERE qd.quyet_dinh_id IS NULL`;
    } else if (trangThai === 'DA_XU_LY') {
      query += ` WHERE qd.quyet_dinh_id IS NOT NULL`;
    }

    query += ` ORDER BY bcvp.bao_cao_id DESC`;
    const result = await pool.query(query, values);
    return result.rows;
  }

  async findByNguoiBaoCao(nguoiBaoCaoId: number): Promise<any[]> {
    const query = `
      SELECT
        bao_cao_id AS "baoCaoId",
        nguoi_bao_cao_id AS "nguoiBaoCaoId",
        nguoi_bi_bao_cao_id AS "nguoiBiBaoCaoId",
        loai_vi_pham_id AS "loaiViPhamId",
        noi_dung AS "noiDung"
      FROM bao_cao_vi_pham
      WHERE nguoi_bao_cao_id = $1
      ORDER BY bao_cao_id DESC
    `;
    const result = await pool.query(query, [nguoiBaoCaoId]);
    return result.rows;
  }
}


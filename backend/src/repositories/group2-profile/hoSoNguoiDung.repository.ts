import { pool } from "../../config/db";
import { HoSoNguoiDung } from "../../models/group2-profile/hoSoNguoiDung.model";

export class HoSoNguoiDungRepository {
  async findByNguoiDungId(nguoiDungId: number): Promise<HoSoNguoiDung | null> {
    const query = `
      SELECT
        ho_so_id as "hoSoId",
        nguoi_dung_id as "nguoiDungId",
        tieu_su as "tieuSu",
        ngay_sinh as "ngaySinh",
        khu_vuc as "khuVuc",
        muc_tieu_tham_gia as "mucTieuThamGia",
        thoi_gian_ranh as "thoiGianRanh",
        anh_dai_dien as "anhDaiDien"
      FROM ho_so_nguoi_dung
      WHERE nguoi_dung_id = $1
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async create(data: Partial<HoSoNguoiDung>): Promise<HoSoNguoiDung> {
    const query = `
      INSERT INTO ho_so_nguoi_dung (nguoi_dung_id, tieu_su, ngay_sinh, khu_vuc, muc_tieu_tham_gia, thoi_gian_ranh, anh_dai_dien)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        ho_so_id as "hoSoId",
        nguoi_dung_id as "nguoiDungId",
        tieu_su as "tieuSu",
        ngay_sinh as "ngaySinh",
        khu_vuc as "khuVuc",
        muc_tieu_tham_gia as "mucTieuThamGia",
        thoi_gian_ranh as "thoiGianRanh",
        anh_dai_dien as "anhDaiDien"
    `;
    const values = [
      data.nguoiDungId,
      data.tieuSu === undefined || data.tieuSu === null ? null : data.tieuSu,
      data.ngaySinh === undefined || data.ngaySinh === null ? null : data.ngaySinh,
      data.khuVuc === undefined || data.khuVuc === null ? null : data.khuVuc,
      data.mucTieuThamGia === undefined || data.mucTieuThamGia === null ? null : data.mucTieuThamGia,
      data.thoiGianRanh === undefined || data.thoiGianRanh === null ? null : data.thoiGianRanh,
      data.anhDaiDien === undefined || data.anhDaiDien === null ? null : data.anhDaiDien,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async update(nguoiDungId: number, data: Partial<HoSoNguoiDung>): Promise<HoSoNguoiDung | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.tieuSu !== undefined) {
      setClauses.push(`tieu_su = $${paramIndex++}`);
      values.push(data.tieuSu);
    }
    if (data.ngaySinh !== undefined) {
      setClauses.push(`ngay_sinh = $${paramIndex++}`);
      values.push(data.ngaySinh);
    }
    if (data.khuVuc !== undefined) {
      setClauses.push(`khu_vuc = $${paramIndex++}`);
      values.push(data.khuVuc);
    }
    if (data.mucTieuThamGia !== undefined) {
      setClauses.push(`muc_tieu_tham_gia = $${paramIndex++}`);
      values.push(data.mucTieuThamGia);
    }
    if (data.thoiGianRanh !== undefined) {
      setClauses.push(`thoi_gian_ranh = $${paramIndex++}`);
      values.push(data.thoiGianRanh);
    }
    if (data.anhDaiDien !== undefined) {
      setClauses.push(`anh_dai_dien = $${paramIndex++}`);
      values.push(data.anhDaiDien);
    }

    if (setClauses.length === 0) {
      return this.findByNguoiDungId(nguoiDungId);
    }

    values.push(nguoiDungId);
    const query = `
      UPDATE ho_so_nguoi_dung
      SET ${setClauses.join(', ')}
      WHERE nguoi_dung_id = $${paramIndex}
      RETURNING
        ho_so_id as "hoSoId",
        nguoi_dung_id as "nguoiDungId",
        tieu_su as "tieuSu",
        ngay_sinh as "ngaySinh",
        khu_vuc as "khuVuc",
        muc_tieu_tham_gia as "mucTieuThamGia",
        thoi_gian_ranh as "thoiGianRanh",
        anh_dai_dien as "anhDaiDien"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async updateAvatar(nguoiDungId: number, anhDaiDien: string): Promise<HoSoNguoiDung | null> {
    const query = `
      UPDATE ho_so_nguoi_dung
      SET anh_dai_dien = $1
      WHERE nguoi_dung_id = $2
      RETURNING
        ho_so_id as "hoSoId",
        nguoi_dung_id as "nguoiDungId",
        tieu_su as "tieuSu",
        ngay_sinh as "ngaySinh",
        khu_vuc as "khuVuc",
        muc_tieu_tham_gia as "mucTieuThamGia",
        thoi_gian_ranh as "thoiGianRanh",
        anh_dai_dien as "anhDaiDien"
    `;
    const result = await pool.query(query, [anhDaiDien, nguoiDungId]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }
}


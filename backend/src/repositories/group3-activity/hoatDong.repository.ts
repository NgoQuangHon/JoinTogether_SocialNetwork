import { pool } from "../../config/db";
import { HoatDong } from "../../models/group3-activity/hoatDong.model";

export class HoatDongRepository {
  async create(data: Partial<HoatDong>): Promise<HoatDong> {
    const query = `
      INSERT INTO hoat_dong (nguoi_to_chuc_id, danh_muc_hoat_dong_id, dia_diem_id, ten_hoat_dong, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING
        hoat_dong_id AS "hoatDongId",
        nguoi_to_chuc_id AS "nguoiToChucId",
        danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        dia_diem_id AS "diaDiemId",
        ten_hoat_dong AS "tenHoatDong",
        mo_ta AS "moTa",
        thoi_gian_bat_dau AS "thoiGianBatDau",
        thoi_gian_ket_thuc AS "thoiGianKetThuc"
    `;
    const values = [
      data.nguoiToChucId ?? null,
      data.danhMucHoatDongId ?? null,
      data.diaDiemId ?? null,
      data.tenHoatDong,
      data.moTa ?? null,
      data.thoiGianBatDau ?? null,
      data.thoiGianKetThuc ?? null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(): Promise<any[]> {
    const query = `
      SELECT
        hd.hoat_dong_id AS "hoatDongId",
        hd.nguoi_to_chuc_id AS "nguoiToChucId",
        nd.ho_ten AS "nguoiToChuc",
        hd.danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        dm.ten_danh_muc AS "tenDanhMuc",
        hd.dia_diem_id AS "diaDiemId",
        dd.ten_dia_diem AS "tenDiaDiem",
        dd.dia_chi AS "diaChi",
        dd.hinh_thuc AS "hinhThuc",
        hd.ten_hoat_dong AS "tenHoatDong",
        hd.mo_ta AS "moTa",
        hd.thoi_gian_bat_dau AS "thoiGianBatDau",
        hd.thoi_gian_ket_thuc AS "thoiGianKetThuc",
        (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) AS "soLuongThanhVien"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      ORDER BY hd.thoi_gian_bat_dau DESC NULLS LAST
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<any | null> {
    const query = `
      SELECT
        hd.hoat_dong_id AS "hoatDongId",
        hd.nguoi_to_chuc_id AS "nguoiToChucId",
        nd.ho_ten AS "nguoiToChuc",
        hd.danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        dm.ten_danh_muc AS "tenDanhMuc",
        hd.dia_diem_id AS "diaDiemId",
        dd.ten_dia_diem AS "tenDiaDiem",
        dd.dia_chi AS "diaChi",
        dd.hinh_thuc AS "hinhThuc",
        dd.duong_dan_truc_tuyen AS "duongDanTrucTuyen",
        hd.ten_hoat_dong AS "tenHoatDong",
        hd.mo_ta AS "moTa",
        hd.thoi_gian_bat_dau AS "thoiGianBatDau",
        hd.thoi_gian_ket_thuc AS "thoiGianKetThuc"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      WHERE hd.hoat_dong_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async update(id: number, data: Partial<HoatDong>): Promise<HoatDong | null> {
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.nguoiToChucId !== undefined) {
      setClauses.push(`nguoi_to_chuc_id = $${paramIndex++}`);
      values.push(data.nguoiToChucId);
    }
    if (data.danhMucHoatDongId !== undefined) {
      setClauses.push(`danh_muc_hoat_dong_id = $${paramIndex++}`);
      values.push(data.danhMucHoatDongId);
    }
    if (data.diaDiemId !== undefined) {
      setClauses.push(`dia_diem_id = $${paramIndex++}`);
      values.push(data.diaDiemId);
    }
    if (data.tenHoatDong !== undefined) {
      setClauses.push(`ten_hoat_dong = $${paramIndex++}`);
      values.push(data.tenHoatDong);
    }
    if (data.moTa !== undefined) {
      setClauses.push(`mo_ta = $${paramIndex++}`);
      values.push(data.moTa);
    }
    if (data.thoiGianBatDau !== undefined) {
      setClauses.push(`thoi_gian_bat_dau = $${paramIndex++}`);
      values.push(data.thoiGianBatDau);
    }
    if (data.thoiGianKetThuc !== undefined) {
      setClauses.push(`thoi_gian_ket_thuc = $${paramIndex++}`);
      values.push(data.thoiGianKetThuc);
    }

    if (setClauses.length === 0) return this.findById(id) as any;

    values.push(id);
    const query = `
      UPDATE hoat_dong
      SET ${setClauses.join(", ")}
      WHERE hoat_dong_id = $${paramIndex}
      RETURNING
        hoat_dong_id AS "hoatDongId",
        nguoi_to_chuc_id AS "nguoiToChucId",
        danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        dia_diem_id AS "diaDiemId",
        ten_hoat_dong AS "tenHoatDong",
        mo_ta AS "moTa",
        thoi_gian_bat_dau AS "thoiGianBatDau",
        thoi_gian_ket_thuc AS "thoiGianKetThuc"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM hoat_dong WHERE hoat_dong_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async search(filters: {
    keyword?: string;
    danhMucHoatDongId?: number;
    diaDiemId?: number;
    tuNgay?: string;
    denNgay?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ rows: any[]; total: number }> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.keyword) {
      conditions.push(
        `($3 ILIKE $${paramIndex} OR hd.mo_ta ILIKE $${paramIndex})`,
      );
      values.push(`%${filters.keyword}%`);
      paramIndex++;
    }
    if (filters.danhMucHoatDongId) {
      conditions.push(`hd.danh_muc_hoat_dong_id = $${paramIndex++}`);
      values.push(filters.danhMucHoatDongId);
    }
    if (filters.diaDiemId) {
      conditions.push(`hd.dia_diem_id = $${paramIndex++}`);
      values.push(filters.diaDiemId);
    }
    if (filters.tuNgay) {
      conditions.push(`hd.thoi_gian_bat_dau >= $${paramIndex++}`);
      values.push(filters.tuNgay);
    }
    if (filters.denNgay) {
      conditions.push(`hd.thoi_gian_bat_dau <= $${paramIndex++}`);
      values.push(filters.denNgay);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;

    const countQuery = `SELECT COUNT(*) as total FROM hoat_dong hd ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total, 10);

    const dataQuery = `
      SELECT
        hd.hoat_dong_id AS "hoatDongId",
        hd.nguoi_to_chuc_id AS "nguoiToChucId",
        nd.ho_ten AS "nguoiToChuc",
        hd.danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        dm.ten_danh_muc AS "tenDanhMuc",
        hd.dia_diem_id AS "diaDiemId",
        dd.ten_dia_diem AS "tenDiaDiem",
        hd.ten_hoat_dong AS "tenHoatDong",
        hd.mo_ta AS "moTa",
        hd.thoi_gian_bat_dau AS "thoiGianBatDau",
        hd.thoi_gian_ket_thuc AS "thoiGianKetThuc",
        (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) AS "soLuongThanhVien"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      ${whereClause}
      ORDER BY hd.thoi_gian_bat_dau DESC NULLS LAST
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;
    values.push(limit, offset);
    const dataResult = await pool.query(dataQuery, values);

    return { rows: dataResult.rows, total };
  }
}

import { pool } from "../../config/db";

export class YeuCauHoTroRepository {
  constructor() {
    this.ensureTable();
  }

  private async ensureTable() {
    try {
      // Tạo bảng yêu cầu hỗ trợ nếu chưa tồn tại
      await pool.query(`
        CREATE TABLE IF NOT EXISTS yeu_cau_ho_tro (
          ho_tro_id SERIAL PRIMARY KEY,
          nguoi_gui_id INTEGER REFERENCES nguoi_dung(nguoi_dung_id),
          loai_ho_tro VARCHAR(100) NOT NULL DEFAULT 'KHAC',
          tieu_de VARCHAR(255) NOT NULL,
          mo_ta TEXT NOT NULL,
          trang_thai VARCHAR(50) NOT NULL DEFAULT 'CHO_XU_LY',
          ghi_chu_admin TEXT,
          tao_luc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          cap_nhat_luc TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);
      // Thêm cột hoat_dong_id và thanh_vien_id vào bao_cao_vi_pham nếu chưa có
      await pool.query(`
        ALTER TABLE bao_cao_vi_pham ADD COLUMN IF NOT EXISTS hoat_dong_id INTEGER;
        ALTER TABLE bao_cao_vi_pham ADD COLUMN IF NOT EXISTS thanh_vien_id INTEGER;
      `);
    } catch {
      // Ignore if already exists
    }
  }

  async create(data: {
    nguoiGuiId: number;
    loaiHoTro: string;
    tieuDe: string;
    moTa: string;
  }): Promise<any> {
    const query = `
      INSERT INTO yeu_cau_ho_tro (nguoi_gui_id, loai_ho_tro, tieu_de, mo_ta)
      VALUES ($1, $2, $3, $4)
      RETURNING
        ho_tro_id AS "hoTroId",
        nguoi_gui_id AS "nguoiGuiId",
        loai_ho_tro AS "loaiHoTro",
        tieu_de AS "tieuDe",
        mo_ta AS "moTa",
        trang_thai AS "trangThai",
        tao_luc AS "taoLuc"
    `;
    const result = await pool.query(query, [
      data.nguoiGuiId,
      data.loaiHoTro,
      data.tieuDe,
      data.moTa,
    ]);
    return result.rows[0];
  }

  async findAll(trangThai?: string): Promise<any[]> {
    let query = `
      SELECT
        ycht.ho_tro_id AS "hoTroId",
        ycht.nguoi_gui_id AS "nguoiGuiId",
        nd.ho_ten AS "nguoiGui",
        nd.email AS "emailNguoiGui",
        ycht.loai_ho_tro AS "loaiHoTro",
        ycht.tieu_de AS "tieuDe",
        ycht.mo_ta AS "moTa",
        ycht.trang_thai AS "trangThai",
        ycht.ghi_chu_admin AS "ghiChuAdmin",
        ycht.tao_luc AS "taoLuc",
        ycht.cap_nhat_luc AS "capNhatLuc"
      FROM yeu_cau_ho_tro ycht
      LEFT JOIN nguoi_dung nd ON ycht.nguoi_gui_id = nd.nguoi_dung_id
    `;
    const values: any[] = [];
    if (trangThai) {
      if (trangThai === 'CHUA_XU_LY' || trangThai === 'CHO_XU_LY' || trangThai === 'pending') {
        query += ` WHERE ycht.trang_thai = 'CHO_XU_LY'`;
      } else if (trangThai === 'DA_XU_LY' || trangThai === 'processed') {
        query += ` WHERE ycht.trang_thai = 'DA_XU_LY'`;
      } else if (trangThai === 'DA_DONG') {
        query += ` WHERE ycht.trang_thai = 'DA_DONG'`;
      }
    }
    query += ` ORDER BY ycht.tao_luc DESC`;
    const result = await pool.query(query, values);
    return result.rows;
  }

  async findById(id: number): Promise<any | null> {
    const query = `
      SELECT
        ycht.ho_tro_id AS "hoTroId",
        ycht.nguoi_gui_id AS "nguoiGuiId",
        nd.ho_ten AS "nguoiGui",
        nd.email AS "emailNguoiGui",
        ycht.loai_ho_tro AS "loaiHoTro",
        ycht.tieu_de AS "tieuDe",
        ycht.mo_ta AS "moTa",
        ycht.trang_thai AS "trangThai",
        ycht.ghi_chu_admin AS "ghiChuAdmin",
        ycht.tao_luc AS "taoLuc",
        ycht.cap_nhat_luc AS "capNhatLuc"
      FROM yeu_cau_ho_tro ycht
      LEFT JOIN nguoi_dung nd ON ycht.nguoi_gui_id = nd.nguoi_dung_id
      WHERE ycht.ho_tro_id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async process(
    id: number,
    data: { trangThai: string; ghiChuAdmin?: string },
  ): Promise<any> {
    const query = `
      UPDATE yeu_cau_ho_tro
      SET
        trang_thai = $1,
        ghi_chu_admin = COALESCE($2, ghi_chu_admin),
        cap_nhat_luc = CURRENT_TIMESTAMP
      WHERE ho_tro_id = $3
      RETURNING
        ho_tro_id AS "hoTroId",
        trang_thai AS "trangThai",
        ghi_chu_admin AS "ghiChuAdmin",
        cap_nhat_luc AS "capNhatLuc"
    `;
    const result = await pool.query(query, [
      data.trangThai,
      data.ghiChuAdmin ?? null,
      id,
    ]);
    return result.rows[0];
  }

  async countByNguoiGui(nguoiGuiId: number): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(*) FROM yeu_cau_ho_tro WHERE nguoi_gui_id = $1`,
      [nguoiGuiId],
    );
    return parseInt(result.rows[0].count, 10);
  }
}

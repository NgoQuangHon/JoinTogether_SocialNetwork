import { pool } from "../../config/db";

export interface BinhLuan {
    binhLuanId: number;
    baiVietId: number;
    nguoiDungId: number;
    nguoiDung?: string;
    noiDung: string;
    thoiGianTao: Date | string;
}

export class BinhLuanRepository {
    async create(baiVietId: number, nguoiDungId: number, noiDung: string): Promise<BinhLuan> {
        const result = await pool.query(`
            INSERT INTO binh_luan_bai_viet (bai_viet_id, nguoi_dung_id, noi_dung)
            VALUES ($1, $2, $3)
            RETURNING
                binh_luan_id AS "binhLuanId",
                bai_viet_id AS "baiVietId",
                nguoi_dung_id AS "nguoiDungId",
                noi_dung AS "noiDung",
                thoi_gian_tao AS "thoiGianTao"
        `, [baiVietId, nguoiDungId, noiDung]);
        await pool.query(
            `UPDATE bai_viet SET so_binh_luan = (SELECT COUNT(*) FROM binh_luan_bai_viet WHERE bai_viet_id = $1) WHERE bai_viet_id = $1`,
            [baiVietId]
        );
        return result.rows[0];
    }

    async findByBaiVietId(baiVietId: number): Promise<any[]> {
        const result = await pool.query(`
            SELECT
                bl.binh_luan_id AS "binhLuanId",
                bl.bai_viet_id AS "baiVietId",
                bl.nguoi_dung_id AS "nguoiDungId",
                nd.ho_ten AS "nguoiDung",
                bl.noi_dung AS "noiDung",
                bl.thoi_gian_tao AS "thoiGianTao"
            FROM binh_luan_bai_viet bl
            LEFT JOIN nguoi_dung nd ON bl.nguoi_dung_id = nd.nguoi_dung_id
            WHERE bl.bai_viet_id = $1
            ORDER BY bl.thoi_gian_tao ASC
        `, [baiVietId]);
        return result.rows;
    }

    async delete(binhLuanId: number, nguoiDungId: number): Promise<boolean> {
        const result = await pool.query(
            `DELETE FROM binh_luan_bai_viet WHERE binh_luan_id = $1 AND nguoi_dung_id = $2 RETURNING bai_viet_id`,
            [binhLuanId, nguoiDungId]
        );
        if (result.rows.length > 0) {
            await pool.query(
                `UPDATE bai_viet SET so_binh_luan = (SELECT COUNT(*) FROM binh_luan_bai_viet WHERE bai_viet_id = $1) WHERE bai_viet_id = $1`,
                [result.rows[0].bai_viet_id]
            );
            return true;
        }
        return false;
    }
}

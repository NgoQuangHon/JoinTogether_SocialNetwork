import { pool } from "../../config/db";

export class ThichBaiVietRepository {
    async like(nguoiDungId: number, baiVietId: number): Promise<void> {
        await pool.query(
            `INSERT INTO thich_bai_viet (nguoi_dung_id, bai_viet_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [nguoiDungId, baiVietId]
        );
        await pool.query(
            `UPDATE bai_viet SET so_luot_thich = (SELECT COUNT(*) FROM thich_bai_viet WHERE bai_viet_id = $1) WHERE bai_viet_id = $1`,
            [baiVietId]
        );
    }

    async unlike(nguoiDungId: number, baiVietId: number): Promise<void> {
        await pool.query(
            `DELETE FROM thich_bai_viet WHERE nguoi_dung_id = $1 AND bai_viet_id = $2`,
            [nguoiDungId, baiVietId]
        );
        await pool.query(
            `UPDATE bai_viet SET so_luot_thich = (SELECT COUNT(*) FROM thich_bai_viet WHERE bai_viet_id = $1) WHERE bai_viet_id = $1`,
            [baiVietId]
        );
    }

    async isLiked(nguoiDungId: number, baiVietId: number): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM thich_bai_viet WHERE nguoi_dung_id = $1 AND bai_viet_id = $2`,
            [nguoiDungId, baiVietId]
        );
        return result.rows.length > 0;
    }

    async findLikedPostIds(nguoiDungId: number): Promise<Set<number>> {
        const result = await pool.query(
            `SELECT bai_viet_id FROM thich_bai_viet WHERE nguoi_dung_id = $1`,
            [nguoiDungId]
        );
        return new Set(result.rows.map((r: any) => r.bai_viet_id));
    }
}

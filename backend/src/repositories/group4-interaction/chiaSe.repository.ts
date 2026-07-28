import { pool } from "../../config/db";

export class ChiaSeRepository {
    async share(baiVietId: number, nguoiDungId: number): Promise<void> {
        await pool.query(
            `INSERT INTO chia_se_bai_viet (bai_viet_id, nguoi_dung_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [baiVietId, nguoiDungId]
        );
        await pool.query(
            `UPDATE bai_viet SET so_luot_chia_se = (SELECT COUNT(*) FROM chia_se_bai_viet WHERE bai_viet_id = $1) WHERE bai_viet_id = $1`,
            [baiVietId]
        );
    }
}

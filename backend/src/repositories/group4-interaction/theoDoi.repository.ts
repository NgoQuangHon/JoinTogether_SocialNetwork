import { pool } from "../../config/db";

export interface TheoDoi {
    nguoiTheoDoiId: number;
    nguoiDuocTheoDoiId: number;
    thoiGianTao?: Date | string;
}

export class TheoDoiRepository {
    async create(nguoiTheoDoiId: number, nguoiDuocTheoDoiId: number): Promise<TheoDoi> {
        const query = `
            INSERT INTO theo_doi (nguoi_theo_doi_id, nguoi_duoc_theo_doi_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
            RETURNING
                nguoi_theo_doi_id AS "nguoiTheoDoiId",
                nguoi_duoc_theo_doi_id AS "nguoiDuocTheoDoiId",
                thoi_gian_tao AS "thoiGianTao"
        `;
        const result = await pool.query(query, [nguoiTheoDoiId, nguoiDuocTheoDoiId]);
        return result.rows[0];
    }

    async delete(nguoiTheoDoiId: number, nguoiDuocTheoDoiId: number): Promise<boolean> {
        const query = `DELETE FROM theo_doi WHERE nguoi_theo_doi_id = $1 AND nguoi_duoc_theo_doi_id = $2`;
        const result = await pool.query(query, [nguoiTheoDoiId, nguoiDuocTheoDoiId]);
        return (result.rowCount ?? 0) > 0;
    }

    async findByFollower(nguoiTheoDoiId: number): Promise<TheoDoi[]> {
        const query = `
            SELECT
                nguoi_theo_doi_id AS "nguoiTheoDoiId",
                nguoi_duoc_theo_doi_id AS "nguoiDuocTheoDoiId",
                thoi_gian_tao AS "thoiGianTao"
            FROM theo_doi
            WHERE nguoi_theo_doi_id = $1
            ORDER BY thoi_gian_tao DESC
        `;
        const result = await pool.query(query, [nguoiTheoDoiId]);
        return result.rows;
    }

    async isFollowing(nguoiTheoDoiId: number, nguoiDuocTheoDoiId: number): Promise<boolean> {
        const query = `SELECT 1 FROM theo_doi WHERE nguoi_theo_doi_id = $1 AND nguoi_duoc_theo_doi_id = $2`;
        const result = await pool.query(query, [nguoiTheoDoiId, nguoiDuocTheoDoiId]);
        return result.rows.length > 0;
    }
}

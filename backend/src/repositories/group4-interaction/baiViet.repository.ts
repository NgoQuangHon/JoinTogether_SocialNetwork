import { pool } from "../../config/db";
import { BaiViet } from "../../models/group4-interaction/baiViet.model";

export class BaiVietRepository {
    async create(data: Partial<BaiViet>): Promise<BaiViet> {
        const query = `
            INSERT INTO bai_viet (nguoi_dung_id, hoat_dong_id, noi_dung, hinh_anh)
            VALUES ($1, $2, $3, $4)
            RETURNING
                bai_viet_id AS "baiVietId",
                nguoi_dung_id AS "nguoiDungId",
                hoat_dong_id AS "hoatDongId",
                noi_dung AS "noiDung",
                hinh_anh AS "hinhAnh",
                so_luot_thich AS "soLuotThich",
                so_binh_luan AS "soBinhLuan",
                so_luot_chia_se AS "soLuotChiaSe",
                thoi_gian_tao AS "thoiGianTao"
        `;
        const values = [
            data.nguoiDungId,
            data.hoatDongId || null,
            data.noiDung,
            data.hinhAnh || null,
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    async findAll(): Promise<any[]> {
        const query = `
            SELECT
                bv.bai_viet_id AS "baiVietId",
                bv.nguoi_dung_id AS "nguoiDungId",
                nd.ho_ten AS "nguoiDung",
                bv.hoat_dong_id AS "hoatDongId",
                hd.ten_hoat_dong AS "hoatDongLienQuan",
                bv.noi_dung AS "noiDung",
                bv.hinh_anh AS "hinhAnh",
                bv.so_luot_thich AS "soLuotThich",
                bv.so_binh_luan AS "soBinhLuan",
                bv.so_luot_chia_se AS "soLuotChiaSe",
                bv.thoi_gian_tao AS "thoiGianTao"
            FROM bai_viet bv
            LEFT JOIN nguoi_dung nd ON bv.nguoi_dung_id = nd.nguoi_dung_id
            LEFT JOIN hoat_dong hd ON bv.hoat_dong_id = hd.hoat_dong_id
            ORDER BY bv.thoi_gian_tao DESC
            LIMIT 20
        `;
        const result = await pool.query(query);
        return result.rows;
    }
}

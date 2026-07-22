import { pool } from '../../config/db';
import { HoatDongModel } from '../../models/group3-activity/hoatDong.model';

export class CreateActivityService {
    async createActivity(data: any): Promise<any> {
        const hoatDongModel = new HoatDongModel(data);

        const thoiGianBatDau = hoatDongModel.thoiGianBatDau
            ? new Date(hoatDongModel.thoiGianBatDau)
            : null;
        const thoiGianKetThuc = hoatDongModel.thoiGianKetThuc
            ? new Date(hoatDongModel.thoiGianKetThuc)
            : null;

        const query = `
            INSERT INTO hoat_dong (
                nguoi_to_chuc_id,
                danh_muc_hoat_dong_id,
                dia_diem_id,
                ten_hoat_dong,
                mo_ta,
                thoi_gian_bat_dau,
                thoi_gian_ket_thuc
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
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

        const result = await pool.query(query, [
            hoatDongModel.nguoiToChucId,
            hoatDongModel.danhMucHoatDongId,
            hoatDongModel.diaDiemId,
            hoatDongModel.tenHoatDong,
            hoatDongModel.moTa,
            thoiGianBatDau,
            thoiGianKetThuc,
        ]);

        return result.rows[0];
    }

    async getAllActivities(): Promise<any[]> {
        const query = `
            SELECT
                hoat_dong_id AS "hoatDongId",
                nguoi_to_chuc_id AS "nguoiToChucId",
                danh_muc_hoat_dong_id AS "danhMucHoatDongId",
                dia_diem_id AS "diaDiemId",
                ten_hoat_dong AS "tenHoatDong",
                mo_ta AS "moTa",
                thoi_gian_bat_dau AS "thoiGianBatDau",
                thoi_gian_ket_thuc AS "thoiGianKetThuc"
            FROM hoat_dong
            ORDER BY hoat_dong_id DESC
        `;

        const result = await pool.query(query);
        return result.rows;
    }

    async getActivityById(id: number): Promise<any> {
        const query = `
            SELECT
                hoat_dong_id AS "hoatDongId",
                nguoi_to_chuc_id AS "nguoiToChucId",
                danh_muc_hoat_dong_id AS "danhMucHoatDongId",
                dia_diem_id AS "diaDiemId",
                ten_hoat_dong AS "tenHoatDong",
                mo_ta AS "moTa",
                thoi_gian_bat_dau AS "thoiGianBatDau",
                thoi_gian_ket_thuc AS "thoiGianKetThuc"
            FROM hoat_dong
            WHERE hoat_dong_id = $1
        `;

        const result = await pool.query(query, [id]);
        if (result.rowCount === 0) {
            throw new Error('Hoạt động không tồn tại.');
        }

        return result.rows[0];
    }

    async updateActivity(id: number, data: any): Promise<any> {
        const existing = await this.getActivityById(id);
        const updatedModel = HoatDongModel.createHoatDongModel({
            ...existing,
            ...data,
        });

        const thoiGianBatDau = updatedModel.thoiGianBatDau
            ? new Date(updatedModel.thoiGianBatDau)
            : null;
        const thoiGianKetThuc = updatedModel.thoiGianKetThuc
            ? new Date(updatedModel.thoiGianKetThuc)
            : null;

        const query = `
            UPDATE hoat_dong
            SET
                nguoi_to_chuc_id = $1,
                danh_muc_hoat_dong_id = $2,
                dia_diem_id = $3,
                ten_hoat_dong = $4,
                mo_ta = $5,
                thoi_gian_bat_dau = $6,
                thoi_gian_ket_thuc = $7
            WHERE hoat_dong_id = $8
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

        const result = await pool.query(query, [
            updatedModel.nguoiToChucId,
            updatedModel.danhMucHoatDongId,
            updatedModel.diaDiemId,
            updatedModel.tenHoatDong,
            updatedModel.moTa,
            thoiGianBatDau,
            thoiGianKetThuc,
            id,
        ]);

        return result.rows[0];
    }

    async deleteActivity(id: number): Promise<void> {
        await this.getActivityById(id);

        const query = `
            DELETE FROM hoat_dong
            WHERE hoat_dong_id = $1
        `;

        await pool.query(query, [id]);
    }
}

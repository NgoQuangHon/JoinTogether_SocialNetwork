import { pool } from "../../config/db";
import { HoatDong } from "../../models/group3-activity/hoatDong.model";

export class HoatDongRepository {
  async syncActivityStatuses(): Promise<void> {
    try {
      // 1. Chuyển sang 'dang_dien_ra' nếu CURRENT_TIMESTAMP >= thoi_gian_bat_dau và < thoi_gian_ket_thuc
      await pool.query(`
        UPDATE hoat_dong
        SET trang_thai = 'dang_dien_ra'
        WHERE (trang_thai = 'sap_dien_ra' OR trang_thai IS NULL)
          AND thoi_gian_bat_dau IS NOT NULL
          AND CURRENT_TIMESTAMP >= thoi_gian_bat_dau
          AND (thoi_gian_ket_thuc IS NULL OR CURRENT_TIMESTAMP < thoi_gian_ket_thuc);
      `);

      // 2. Chuyển sang 'da_ket_thuc' nếu CURRENT_TIMESTAMP >= thoi_gian_ket_thuc
      await pool.query(`
        UPDATE hoat_dong
        SET trang_thai = 'da_ket_thuc'
        WHERE (trang_thai = 'sap_dien_ra' OR trang_thai = 'dang_dien_ra' OR trang_thai IS NULL)
          AND thoi_gian_ket_thuc IS NOT NULL
          AND CURRENT_TIMESTAMP >= thoi_gian_ket_thuc;
      `);
    } catch (err) {
      console.error("Lỗi tự động đồng bộ trạng thái hoạt động theo thời gian:", err);
    }
  }

  async create(data: Partial<HoatDong>): Promise<HoatDong> {
    const query = `
      INSERT INTO hoat_dong (nguoi_to_chuc_id, danh_muc_hoat_dong_id, dia_diem_id, ten_hoat_dong, mo_ta, thoi_gian_bat_dau, thoi_gian_ket_thuc, so_luong_toi_da, do_tuoi_tu, do_tuoi_den, gioi_tinh_phu_hop, muc_do_kinh_nghiem, yeu_cau_khac, noi_quy_chung, luu_y_dac_biet, do_dung_can_mang, han_dang_ky, trang_thai)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING
        hoat_dong_id AS "hoatDongId",
        nguoi_to_chuc_id AS "nguoiToChucId",
        danh_muc_hoat_dong_id AS "danhMucHoatDongId",
        dia_diem_id AS "diaDiemId",
        ten_hoat_dong AS "tenHoatDong",
        mo_ta AS "moTa",
        thoi_gian_bat_dau AS "thoiGianBatDau",
        thoi_gian_ket_thuc AS "thoiGianKetThuc",
        so_luong_toi_da AS "soLuongToiDa",
        do_tuoi_tu AS "doTuoiTu",
        do_tuoi_den AS "doTuoiDen",
        gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        yeu_cau_khac AS "yeuCauKhac",
        noi_quy_chung AS "noiQuyChung",
        luu_y_dac_biet AS "luuYDatBiet",
        do_dung_can_mang AS "doDungCanMang",
        han_dang_ky AS "hanDangKy",
        trang_thai AS "trangThai"
    `;
    const values = [
      data.nguoiToChucId === undefined || data.nguoiToChucId === null ? null : data.nguoiToChucId,
      data.danhMucHoatDongId === undefined || data.danhMucHoatDongId === null ? null : data.danhMucHoatDongId,
      data.diaDiemId === undefined || data.diaDiemId === null ? null : data.diaDiemId,
      data.tenHoatDong,
      data.moTa === undefined || data.moTa === null ? null : data.moTa,
      data.thoiGianBatDau === undefined || data.thoiGianBatDau === null ? null : data.thoiGianBatDau,
      data.thoiGianKetThuc === undefined || data.thoiGianKetThuc === null ? null : data.thoiGianKetThuc,
      data.soLuongToiDa === undefined || data.soLuongToiDa === null ? null : data.soLuongToiDa,
      data.doTuoiTu === undefined || data.doTuoiTu === null ? null : data.doTuoiTu,
      data.doTuoiDen === undefined || data.doTuoiDen === null ? null : data.doTuoiDen,
      data.gioiTinhPhuHop === undefined || data.gioiTinhPhuHop === null ? null : data.gioiTinhPhuHop,
      data.mucDoKinhNghiem === undefined || data.mucDoKinhNghiem === null ? null : data.mucDoKinhNghiem,
      data.yeuCauKhac === undefined || data.yeuCauKhac === null ? null : data.yeuCauKhac,
      data.noiQuyChung === undefined || data.noiQuyChung === null ? null : data.noiQuyChung,
      data.luuYDatBiet === undefined || data.luuYDatBiet === null ? null : data.luuYDatBiet,
      data.doDungCanMang === undefined || data.doDungCanMang === null ? null : data.doDungCanMang,
      data.hanDangKy === undefined || data.hanDangKy === null ? null : data.hanDangKy,
      data.trangThai === undefined || data.trangThai === null ? 'sap_dien_ra' : data.trangThai,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findAll(): Promise<any[]> {
    await this.syncActivityStatuses();
    const query = `
      SELECT
        hd.hoat_dong_id AS "hoatDongId",
        hd.nguoi_to_chuc_id AS "nguoiToChucId",
        nd.ho_ten AS "nguoiToChuc",
        hs.anh_dai_dien AS "anhDaiDienNguoiToChuc",
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
        hd.so_luong_toi_da AS "soLuongToiDa",
        hd.do_tuoi_tu AS "doTuoiTu",
        hd.do_tuoi_den AS "doTuoiDen",
        hd.gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        hd.muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        hd.yeu_cau_khac AS "yeuCauKhac",
        hd.noi_quy_chung AS "noiQuyChung",
        hd.luu_y_dac_biet AS "luuYDatBiet",
        hd.do_dung_can_mang AS "doDungCanMang",
        hd.han_dang_ky AS "hanDangKy",
        hd.trang_thai AS "trangThai",
        hd.ly_do_huy AS "lyDoHuy",
        (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) AS "soLuongThanhVien"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN ho_so_nguoi_dung hs ON hs.nguoi_dung_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      WHERE (hd.trang_thai IS NULL OR hd.trang_thai != 'da_huy')
      ORDER BY hd.thoi_gian_bat_dau DESC NULLS LAST
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async findById(id: number): Promise<any | null> {
    await this.syncActivityStatuses();
    const query = `
      SELECT
        hd.hoat_dong_id AS "hoatDongId",
        hd.nguoi_to_chuc_id AS "nguoiToChucId",
        nd.ho_ten AS "nguoiToChuc",
        hs.anh_dai_dien AS "anhDaiDienNguoiToChuc",
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
        hd.thoi_gian_ket_thuc AS "thoiGianKetThuc",
        hd.so_luong_toi_da AS "soLuongToiDa",
        hd.do_tuoi_tu AS "doTuoiTu",
        hd.do_tuoi_den AS "doTuoiDen",
        hd.gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        hd.muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        hd.yeu_cau_khac AS "yeuCauKhac",
        hd.noi_quy_chung AS "noiQuyChung",
        hd.luu_y_dac_biet AS "luuYDatBiet",
        hd.do_dung_can_mang AS "doDungCanMang",
        hd.han_dang_ky AS "hanDangKy",
        hd.trang_thai AS "trangThai",
        hd.ly_do_huy AS "lyDoHuy"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN ho_so_nguoi_dung hs ON hs.nguoi_dung_id = nd.nguoi_dung_id
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
    if (data.soLuongToiDa !== undefined) {
      setClauses.push(`so_luong_toi_da = $${paramIndex++}`);
      values.push(data.soLuongToiDa);
    }
    if (data.doTuoiTu !== undefined) {
      setClauses.push(`do_tuoi_tu = $${paramIndex++}`);
      values.push(data.doTuoiTu);
    }
    if (data.doTuoiDen !== undefined) {
      setClauses.push(`do_tuoi_den = $${paramIndex++}`);
      values.push(data.doTuoiDen);
    }
    if (data.gioiTinhPhuHop !== undefined) {
      setClauses.push(`gioi_tinh_phu_hop = $${paramIndex++}`);
      values.push(data.gioiTinhPhuHop);
    }
    if (data.mucDoKinhNghiem !== undefined) {
      setClauses.push(`muc_do_kinh_nghiem = $${paramIndex++}`);
      values.push(data.mucDoKinhNghiem);
    }
    if (data.yeuCauKhac !== undefined) {
      setClauses.push(`yeu_cau_khac = $${paramIndex++}`);
      values.push(data.yeuCauKhac);
    }
    if (data.noiQuyChung !== undefined) {
      setClauses.push(`noi_quy_chung = $${paramIndex++}`);
      values.push(data.noiQuyChung);
    }
    if (data.luuYDatBiet !== undefined) {
      setClauses.push(`luu_y_dac_biet = $${paramIndex++}`);
      values.push(data.luuYDatBiet);
    }
    if (data.doDungCanMang !== undefined) {
      setClauses.push(`do_dung_can_mang = $${paramIndex++}`);
      values.push(data.doDungCanMang);
    }
    if (data.hanDangKy !== undefined) {
      setClauses.push(`han_dang_ky = $${paramIndex++}`);
      values.push(data.hanDangKy);
    }
    if (data.trangThai !== undefined) {
      setClauses.push(`trang_thai = $${paramIndex++}`);
      values.push(data.trangThai);
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
        thoi_gian_ket_thuc AS "thoiGianKetThuc",
        so_luong_toi_da AS "soLuongToiDa",
        do_tuoi_tu AS "doTuoiTu",
        do_tuoi_den AS "doTuoiDen",
        gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        yeu_cau_khac AS "yeuCauKhac",
        noi_quy_chung AS "noiQuyChung",
        luu_y_dac_biet AS "luuYDatBiet",
        do_dung_can_mang AS "doDungCanMang",
        han_dang_ky AS "hanDangKy",
        trang_thai AS "trangThai",
        ly_do_huy AS "lyDoHuy"
    `;
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findByNguoiToChucId(nguoiDungId: number): Promise<any[]> {
    await this.syncActivityStatuses();
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
        hd.ten_hoat_dong AS "tenHoatDong",
        hd.mo_ta AS "moTa",
        hd.thoi_gian_bat_dau AS "thoiGianBatDau",
        hd.thoi_gian_ket_thuc AS "thoiGianKetThuc",
        hd.so_luong_toi_da AS "soLuongToiDa",
        hd.do_tuoi_tu AS "doTuoiTu",
        hd.do_tuoi_den AS "doTuoiDen",
        hd.gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        hd.muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        hd.yeu_cau_khac AS "yeuCauKhac",
        hd.noi_quy_chung AS "noiQuyChung",
        hd.luu_y_dac_biet AS "luuYDatBiet",
        hd.do_dung_can_mang AS "doDungCanMang",
        hd.han_dang_ky AS "hanDangKy",
        hd.trang_thai AS "trangThai",
        hd.ly_do_huy AS "lyDoHuy",
        (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) AS "soLuongThanhVien"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      WHERE hd.nguoi_to_chuc_id = $1
      ORDER BY hd.thoi_gian_bat_dau DESC NULLS LAST
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }

  async findByMemberId(nguoiDungId: number): Promise<any[]> {
    await this.syncActivityStatuses();
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
        hd.ten_hoat_dong AS "tenHoatDong",
        hd.mo_ta AS "moTa",
        hd.thoi_gian_bat_dau AS "thoiGianBatDau",
        hd.thoi_gian_ket_thuc AS "thoiGianKetThuc",
        hd.so_luong_toi_da AS "soLuongToiDa",
        hd.do_tuoi_tu AS "doTuoiTu",
        hd.do_tuoi_den AS "doTuoiDen",
        hd.gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        hd.muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        hd.yeu_cau_khac AS "yeuCauKhac",
        hd.noi_quy_chung AS "noiQuyChung",
        hd.luu_y_dac_biet AS "luuYDatBiet",
        hd.do_dung_can_mang AS "doDungCanMang",
        hd.han_dang_ky AS "hanDangKy",
        hd.trang_thai AS "trangThai",
        hd.ly_do_huy AS "lyDoHuy",
        (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) AS "soLuongThanhVien"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      WHERE hd.hoat_dong_id IN (
        SELECT hoat_dong_id FROM thanh_vien_hoat_dong WHERE nguoi_dung_id = $1
      )
      ORDER BY hd.thoi_gian_bat_dau DESC NULLS LAST
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }

  async findByRequesterId(nguoiDungId: number): Promise<any[]> {
    await this.syncActivityStatuses();
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
        hd.ten_hoat_dong AS "tenHoatDong",
        hd.mo_ta AS "moTa",
        hd.thoi_gian_bat_dau AS "thoiGianBatDau",
        hd.thoi_gian_ket_thuc AS "thoiGianKetThuc",
        hd.so_luong_toi_da AS "soLuongToiDa",
        hd.do_tuoi_tu AS "doTuoiTu",
        hd.do_tuoi_den AS "doTuoiDen",
        hd.gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        hd.muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        hd.yeu_cau_khac AS "yeuCauKhac",
        hd.noi_quy_chung AS "noiQuyChung",
        hd.luu_y_dac_biet AS "luuYDatBiet",
        hd.do_dung_can_mang AS "doDungCanMang",
        hd.han_dang_ky AS "hanDangKy",
        hd.trang_thai AS "trangThai",
        hd.ly_do_huy AS "lyDoHuy",
        (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) AS "soLuongThanhVien"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      WHERE hd.hoat_dong_id IN (
        SELECT hoat_dong_id FROM yeu_cau_tham_gia WHERE nguoi_dung_id = $1
      )
      ORDER BY hd.thoi_gian_bat_dau DESC NULLS LAST
    `;
    const result = await pool.query(query, [nguoiDungId]);
    return result.rows;
  }

  async cancelActivity(id: number, lyDoHuy?: string): Promise<any> {
    const query = `
      UPDATE hoat_dong
      SET trang_thai = 'da_huy', ly_do_huy = $2
      WHERE hoat_dong_id = $1
      RETURNING
        hoat_dong_id AS "hoatDongId",
        trang_thai AS "trangThai",
        ly_do_huy AS "lyDoHuy"
    `;
    const result = await pool.query(query, [id, lyDoHuy || null]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  async findFeatured(): Promise<any[]> {
    await this.syncActivityStatuses();
    const query = `
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
        hd.so_luong_toi_da AS "soLuongToiDa",
        hd.han_dang_ky AS "hanDangKy",
        hd.trang_thai AS "trangThai",
        hd.ly_do_huy AS "lyDoHuy",
        (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) AS "soLuongThanhVien"
      FROM hoat_dong hd
      LEFT JOIN nguoi_dung nd ON hd.nguoi_to_chuc_id = nd.nguoi_dung_id
      LEFT JOIN danh_muc_hoat_dong dm ON hd.danh_muc_hoat_dong_id = dm.danh_muc_hoat_dong_id
      LEFT JOIN dia_diem dd ON hd.dia_diem_id = dd.dia_diem_id
      WHERE (hd.trang_thai IS NULL OR (hd.trang_thai != 'da_huy' AND hd.trang_thai != 'da_ket_thuc'))
      ORDER BY (SELECT COUNT(*) FROM thanh_vien_hoat_dong tv WHERE tv.hoat_dong_id = hd.hoat_dong_id) DESC
      LIMIT 5
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  async delete(id: number): Promise<boolean> {
    const query = `DELETE FROM hoat_dong WHERE hoat_dong_id = $1`;
    const result = await pool.query(query, [id]);
    return (result.rowCount === undefined || result.rowCount === null ? 0 : result.rowCount) > 0;
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
    await this.syncActivityStatuses();
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.keyword) {
      conditions.push(
        `(hd.ten_hoat_dong ILIKE $${paramIndex} OR hd.mo_ta ILIKE $${paramIndex})`,
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
    const limit = filters.limit === undefined || filters.limit === null ? 20 : filters.limit;
    const offset = filters.offset === undefined || filters.offset === null ? 0 : filters.offset;

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
        hd.so_luong_toi_da AS "soLuongToiDa",
        hd.do_tuoi_tu AS "doTuoiTu",
        hd.do_tuoi_den AS "doTuoiDen",
        hd.gioi_tinh_phu_hop AS "gioiTinhPhuHop",
        hd.muc_do_kinh_nghiem AS "mucDoKinhNghiem",
        hd.yeu_cau_khac AS "yeuCauKhac",
        hd.noi_quy_chung AS "noiQuyChung",
        hd.luu_y_dac_biet AS "luuYDatBiet",
        hd.do_dung_can_mang AS "doDungCanMang",
        hd.han_dang_ky AS "hanDangKy",
        hd.trang_thai AS "trangThai",
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

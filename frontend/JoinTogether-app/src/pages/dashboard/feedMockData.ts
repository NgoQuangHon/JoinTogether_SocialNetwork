/* =====================================================
   FEED MOCK DATA
   Dữ liệu mẫu cho trang Tổng quan (newsfeed) - JoinTogether
   Sẽ được thay bằng dữ liệu thật khi tích hợp API group2/group3
===================================================== */

// ==================== TYPES ====================

export interface NguoiDungRutGon {
  id: number;
  hoTen: string;
  avatarMau: string; // màu nền avatar (lấy từ palette hệ thống)
  avatarChu: string; // chữ cái đại diện hiển thị trong avatar
}

export interface BaiViet {
  id: number;
  tacGia: NguoiDungRutGon;
  thoiGian: string;
  noiDung: string;
  hoatDongLienQuan?: string;
  hinhAnhMau?: string; // gradient minh hoạ thay cho ảnh thật
  soLuotThich: number;
  soBinhLuan: number;
  soLuotChiaSe: number;
  daThich?: boolean;
}

export interface HoatDongNoiBat {
  id: number;
  tieuDe: string;
  mauNen: string;
  soNguoiThamGia: number;
}

export interface GoiYKetNoi {
  id: number;
  nguoiDung: NguoiDungRutGon;
  phanTramPhuHop: number; // kết quả AI Matching
  soSoThichChung: number;
  moTaChung: string;
}

export interface HoatDongSapDienRa {
  id: number;
  tenHoatDong: string;
  ngay: string;
  gio: string;
  soNguoiThamGia: number;
  trangThai: 'sap-dien-ra' | 'con-cho' | 'sap-day';
}

// ==================== DỮ LIỆU MẪU ====================

export const hoatDongNoiBatList: HoatDongNoiBat[] = [
  { id: 1, tieuDe: 'Leo núi Bà Đen', mauNen: 'linear-gradient(160deg, #6fbf73, #3d7d43)', soNguoiThamGia: 24 },
  { id: 2, tieuDe: 'Cà phê & Sách', mauNen: 'linear-gradient(160deg, #66c2b2, #4baa9a)', soNguoiThamGia: 12 },
  { id: 3, tieuDe: 'Chạy bộ cuối tuần', mauNen: 'linear-gradient(160deg, #91d197, #5aae61)', soNguoiThamGia: 31 },
  { id: 4, tieuDe: 'Nhiếp ảnh đường phố', mauNen: 'linear-gradient(160deg, #8ed8cc, #66c2b2)', soNguoiThamGia: 8 },
  { id: 5, tieuDe: 'Học nhóm Tiếng Anh', mauNen: 'linear-gradient(160deg, #b5e0ba, #91d197)', soNguoiThamGia: 15 },
];

export const baiVietList: BaiViet[] = [
  {
    id: 1,
    tacGia: { id: 101, hoTen: 'Minh Thư', avatarMau: '#6fbf73', avatarChu: 'T' },
    thoiGian: '2 giờ trước',
    noiDung:
      'Sáng nay mình vừa hoàn thành chuyến leo núi Bà Đen cùng nhóm JoinTogether. Mọi người siêu nhiệt tình, hẹn lần sau đi tiếp nha mọi người ơi!',
    hoatDongLienQuan: 'Leo núi Bà Đen',
    hinhAnhMau: 'linear-gradient(135deg, #d1edd4, #8ed8cc)',
    soLuotThich: 34,
    soBinhLuan: 8,
    soLuotChiaSe: 2,
  },
  {
    id: 2,
    tacGia: { id: 102, hoTen: 'Quốc Bảo', avatarMau: '#66c2b2', avatarChu: 'B' },
    thoiGian: '5 giờ trước',
    noiDung:
      'AI Matching vừa gợi ý cho mình 3 người có cùng sở thích chụp ảnh phim. Đã kết nối và hẹn cà phê cuối tuần này, quá tiện luôn!',
    soLuotThich: 21,
    soBinhLuan: 5,
    soLuotChiaSe: 1,
  },
  {
    id: 3,
    tacGia: { id: 103, hoTen: 'Ngọc Anh', avatarMau: '#ffd166', avatarChu: 'A' },
    thoiGian: 'Hôm qua',
    noiDung:
      'Buổi học nhóm Tiếng Anh tối qua rất vui, cảm ơn cả nhà đã tham gia đông đủ. Tuần sau mình tổ chức thêm 1 buổi nữa, ai quan tâm để lại bình luận nhé.',
    hoatDongLienQuan: 'Học nhóm Tiếng Anh',
    soLuotThich: 12,
    soBinhLuan: 3,
    soLuotChiaSe: 0,
    daThich: true,
  },
  {
    id: 4,
    tacGia: { id: 104, hoTen: 'Hải Đăng', avatarMau: '#4b9651', avatarChu: 'Đ' },
    thoiGian: '2 ngày trước',
    noiDung:
      'Chia sẻ vài tấm ảnh chụp trong buổi chạy bộ cuối tuần trước. Cung đường ven sông sáng sớm đẹp không tưởng luôn mọi người.',
    hoatDongLienQuan: 'Chạy bộ cuối tuần',
    hinhAnhMau: 'linear-gradient(135deg, #b5e0ba, #66c2b2)',
    soLuotThich: 45,
    soBinhLuan: 11,
    soLuotChiaSe: 4,
  },
];

export const goiYKetNoiList: GoiYKetNoi[] = [
  {
    id: 1,
    nguoiDung: { id: 201, hoTen: 'Thảo Vy', avatarMau: '#66c2b2', avatarChu: 'V' },
    phanTramPhuHop: 92,
    soSoThichChung: 5,
    moTaChung: 'Cùng thích nhiếp ảnh & du lịch bụi',
  },
  {
    id: 2,
    nguoiDung: { id: 202, hoTen: 'Đức Anh', avatarMau: '#6fbf73', avatarChu: 'A' },
    phanTramPhuHop: 87,
    soSoThichChung: 4,
    moTaChung: 'Cùng tham gia CLB chạy bộ',
  },
  {
    id: 3,
    nguoiDung: { id: 203, hoTen: 'Bích Ngọc', avatarMau: '#8ed8cc', avatarChu: 'N' },
    phanTramPhuHop: 81,
    soSoThichChung: 3,
    moTaChung: 'Cùng quan tâm đọc sách kỹ năng',
  },
];

export const hoatDongSapDienRaList: HoatDongSapDienRa[] = [
  { id: 1, tenHoatDong: 'Trekking Tà Năng', ngay: '02/08', gio: '05:30', soNguoiThamGia: 18, trangThai: 'con-cho' },
  { id: 2, tenHoatDong: 'Workshop Nhiếp ảnh', ngay: '05/08', gio: '19:00', soNguoiThamGia: 9, trangThai: 'sap-dien-ra' },
  { id: 3, tenHoatDong: 'Giải chạy Sunday Run', ngay: '09/08', gio: '06:00', soNguoiThamGia: 47, trangThai: 'sap-day' },
];

/* =====================================================
   HOME MOCK DATA
   Dữ liệu mẫu cho trang chủ (theo wireframe "Trang chủ (AI Matching)")
   Sẽ được thay bằng dữ liệu thật khi tích hợp API group3 (Hoạt động) / group4 (Kết nối)
===================================================== */

// ==================== TYPES ====================

export interface DanhMuc {
  id: string;
  ten: string;
}

export interface HoatDongGanBan {
  id: number;
  tieuDe: string;
  khoangCach: string; // vd: "500m", "1.2km"
  thoiGian: string;
  soNguoiThamGia: number;
  soChoToiDa: number;
  mauAnh: string; // gradient thay cho ảnh thật
}

export interface NguoiDongHanhDeXuat {
  id: number;
  hoTen: string;
  soThich: string;
  avatarMau: string;
  avatarChu: string;
}

export interface HoatDongNoiBat {
  id: number;
  tieuDe: string;
  nhanCongDong: string; // vd: "CỘNG ĐỒNG"
  nhanThoiGian: string; // vd: "Thứ 7 tuần này"
  mauAnh: string;
}

// ==================== DỮ LIỆU MẪU ====================

export const danhMucList: DanhMuc[] = [
  { id: 'tat-ca', ten: 'Tất cả' },
  { id: 'the-thao', ten: 'Thể thao' },
  { id: 'hoc-tap', ten: 'Học tập' },
  { id: 'giai-tri', ten: 'Giải trí' },
  { id: 'nghe-thuat', ten: 'Nghệ thuật' },
  { id: 'tinh-nguyen', ten: 'Tình nguyện' },
];

export const hoatDongGanBanList: HoatDongGanBan[] = [
  {
    id: 1,
    tieuDe: 'Giao lưu bóng rổ không chuyên',
    khoangCach: '500m',
    thoiGian: 'Hôm nay, 17:30',
    soNguoiThamGia: 4,
    soChoToiDa: 10,
    mauAnh: 'linear-gradient(160deg, #3d7d43, #1f2f22)',
  },
  {
    id: 2,
    tieuDe: 'Học nhóm Toán cao cấp',
    khoangCach: '1.2km',
    thoiGian: 'Thứ 7, 09:00',
    soNguoiThamGia: 6,
    soChoToiDa: 8,
    mauAnh: 'linear-gradient(160deg, #66c2b2, #4baa9a)',
  },
  {
    id: 3,
    tieuDe: 'Đạp xe quanh Hồ Tây',
    khoangCach: '2.4km',
    thoiGian: 'Chủ nhật, 06:00',
    soNguoiThamGia: 9,
    soChoToiDa: 15,
    mauAnh: 'linear-gradient(160deg, #91d197, #5aae61)',
  },
];

export const nguoiDongHanhDeXuatList: NguoiDongHanhDeXuat[] = [
  { id: 1, hoTen: 'Minh Anh', soThich: 'Chạy bộ, Guitar', avatarMau: '#6fbf73', avatarChu: 'M' },
  { id: 2, hoTen: 'Quốc Trung', soThich: 'Nhiếp ảnh, Gym', avatarMau: '#66c2b2', avatarChu: 'Q' },
  { id: 3, hoTen: 'Linh San', soThich: 'Sách, Vẽ tranh', avatarMau: '#ffd166', avatarChu: 'L' },
  { id: 4, hoTen: 'Bảo Châu', soThich: 'Yoga, Cà phê', avatarMau: '#8ed8cc', avatarChu: 'C' },
];

export const hoatDongNoiBatList: HoatDongNoiBat[] = [
  {
    id: 1,
    tieuDe: 'Ngày hội trồng cây xanh 2024',
    nhanCongDong: 'CỘNG ĐỒNG',
    nhanThoiGian: 'Thứ 7 tuần này',
    mauAnh: 'linear-gradient(165deg, #b5e0ba, #4b9651 55%, #2e6133)',
  },
  {
    id: 2,
    tieuDe: 'Giải chạy thiện nguyện Sunday Run',
    nhanCongDong: 'CỘNG ĐỒNG',
    nhanThoiGian: 'Chủ nhật, 09/08',
    mauAnh: 'linear-gradient(165deg, #8ed8cc, #4baa9a 55%, #2f6d63)',
  },
];

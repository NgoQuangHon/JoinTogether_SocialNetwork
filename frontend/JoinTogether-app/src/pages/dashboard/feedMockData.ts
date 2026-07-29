export interface DanhMuc {
  id: string;
  ten: string;
}

export const danhMucList: DanhMuc[] = [
  { id: 'tat-ca', ten: 'Tất cả' },
  { id: 'the-thao', ten: 'Thể thao' },
  { id: 'hoc-tap', ten: 'Học tập' },
  { id: 'giai-tri', ten: 'Giải trí' },
  { id: 'nghe-thuat', ten: 'Nghệ thuật' },
  { id: 'tinh-nguyen', ten: 'Tình nguyện' },
];

export const MOCK_ACTIVITIES = [
  { tenHoatDong: 'Giao lưu bóng rổ cuối tuần', tenDanhMuc: 'Thể thao', tenDiaDiem: 'Sân bóng rổ Hồ Tây', hoatDongId: 1001, soLuongThanhVien: 8, thoiGianBatDau: '2026-08-10T17:00:00Z' },
  { tenHoatDong: 'Học nhóm React Native', tenDanhMuc: 'Học tập', tenDiaDiem: 'Cà phê The Coffee House', hoatDongId: 1002, soLuongThanhVien: 5, thoiGianBatDau: '2026-08-12T09:00:00Z' },
  { tenHoatDong: 'Chạy bộ công viên Thống Nhất', tenDanhMuc: 'Thể thao', tenDiaDiem: 'Công viên Thống Nhất', hoatDongId: 1003, soLuongThanhVien: 12, thoiGianBatDau: '2026-08-11T06:00:00Z' },
  { tenHoatDong: 'Vẽ tranh acrylic cuối tuần', tenDanhMuc: 'Nghệ thuật', tenDiaDiem: 'Studio Vẽ Xanh', hoatDongId: 1004, soLuongThanhVien: 6, thoiGianBatDau: '2026-08-13T14:00:00Z' },
  { tenHoatDong: 'Dọn rác bãi biển Đồ Sơn', tenDanhMuc: 'Tình nguyện', tenDiaDiem: 'Bãi biển Đồ Sơn', hoatDongId: 1005, soLuongThanhVien: 25, thoiGianBatDau: '2026-08-15T07:00:00Z' },
  { tenHoatDong: 'Đạp xe quanh phố cổ', tenDanhMuc: 'Giải trí', tenDiaDiem: 'Hồ Hoàn Kiếm', hoatDongId: 1006, soLuongThanhVien: 10, thoiGianBatDau: '2026-08-14T16:00:00Z' },
  { tenHoatDong: 'Workshop làm bánh', tenDanhMuc: 'Học tập', tenDiaDiem: 'Baking Lab Hai Bà Trưng', hoatDongId: 1007, soLuongThanhVien: 8, thoiGianBatDau: '2026-08-16T08:00:00Z' },
  { tenHoatDong: 'Xem phim ngoài trời', tenDanhMuc: 'Giải trí', tenDiaDiem: 'Sân vườn The Garden', hoatDongId: 1008, soLuongThanhVien: 30, thoiGianBatDau: '2026-08-17T19:00:00Z' },
  { tenHoatDong: 'Triển lãm nhiếp ảnh', tenDanhMuc: 'Nghệ thuật', tenDiaDiem: 'Bảo tàng Mỹ thuật', hoatDongId: 1009, soLuongThanhVien: 15, thoiGianBatDau: '2026-08-18T10:00:00Z' },
  { tenHoatDong: 'Giải chạy thiện nguyện', tenDanhMuc: 'Tình nguyện', tenDiaDiem: 'Khu đô thị Ecopark', hoatDongId: 1010, soLuongThanhVien: 50, thoiGianBatDau: '2026-08-20T05:30:00Z' },
];

export const MOCK_FEATURED = [
  { tenHoatDong: 'Ngày hội trồng cây xanh 2026', tenDanhMuc: 'Tình nguyện', hoatDongId: 2001, soLuongThanhVien: 120, thoiGianBatDau: '2026-08-22T07:00:00Z' },
  { tenHoatDong: 'Giải chạy Sunday Run', tenDanhMuc: 'Thể thao', hoatDongId: 2002, soLuongThanhVien: 200, thoiGianBatDau: '2026-08-23T05:30:00Z' },
  { tenHoatDong: 'Hội thảo lập trình AI', tenDanhMuc: 'Học tập', hoatDongId: 2003, soLuongThanhVien: 80, thoiGianBatDau: '2026-08-25T08:00:00Z' },
  { tenHoatDong: 'Đêm nhạc Acoustic', tenDanhMuc: 'Giải trí', hoatDongId: 2004, soLuongThanhVien: 150, thoiGianBatDau: '2026-08-26T19:00:00Z' },
  { tenHoatDong: 'Triển lãm hội họa đường phố', tenDanhMuc: 'Nghệ thuật', hoatDongId: 2005, soLuongThanhVien: 60, thoiGianBatDau: '2026-08-28T09:00:00Z' },
];

export const MOCK_SUGGESTIONS = [
  { nguoiDungId: 9001, hoTen: 'Minh Anh', soThich: ['Chạy bộ', 'Guitar'], hoanThanhPhanTram: 85 },
  { nguoiDungId: 9002, hoTen: 'Quốc Trung', soThich: ['Nhiếp ảnh', 'Gym'], hoanThanhPhanTram: 72 },
  { nguoiDungId: 9003, hoTen: 'Linh San', soThich: ['Sách', 'Vẽ tranh'], hoanThanhPhanTram: 90 },
  { nguoiDungId: 9004, hoTen: 'Bảo Châu', soThich: ['Yoga', 'Cà phê'], hoanThanhPhanTram: 68 },
  { nguoiDungId: 9005, hoTen: 'Hoàng Nam', soThich: ['Bóng đá', 'Du lịch'], hoanThanhPhanTram: 78 },
  { nguoiDungId: 9006, hoTen: 'Phương Thảo', soThich: ['Nấu ăn', 'Chạy bộ'], hoanThanhPhanTram: 82 },
  { nguoiDungId: 9007, hoTen: 'Đức Anh', soThich: ['Game', 'Công nghệ'], hoanThanhPhanTram: 60 },
];

export const MOCK_POSTS = [
  {
    baiVietId: 8001,
    nguoiDungId: 9001,
    nguoiDung: "Minh Anh",
    noiDung: "Hôm nay mình vừa hoàn thành buổi chạy bộ 5km quanh Hồ Tây. Cảm giác thật sảng khoái! Có ai muốn tham gia cùng mình vào cuối tuần này không?",
    soLuotThich: 15,
    soBinhLuan: 3,
    soLuotChiaSe: 1,
    thoiGianTao: "2026-07-29T08:00:00Z"
  },
  {
    baiVietId: 8002,
    nguoiDungId: 9003,
    nguoiDung: "Linh San",
    noiDung: "Cuối tuần vừa rồi tham gia vẽ tranh acrylic tại studio Vẽ Xanh vui cực kỳ. Mọi người thân thiện và chỉ dẫn rất tận tình. Đây là tác phẩm đầu tay của mình!",
    hinhAnh: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=60",
    soLuotThich: 28,
    soBinhLuan: 5,
    soLuotChiaSe: 2,
    thoiGianTao: "2026-07-28T14:30:00Z"
  },
  {
    baiVietId: 8003,
    nguoiDungId: 9005,
    nguoiDung: "Hoàng Nam",
    noiDung: "Tìm đồng đội đá bóng giao lưu tối thứ 4 hàng tuần tại sân bóng Thượng Đình. Đội mình hiện đang thiếu 2-3 người nữa, trình độ trung bình vui vẻ là chính.",
    soLuotThich: 8,
    soBinhLuan: 2,
    soLuotChiaSe: 0,
    thoiGianTao: "2026-07-29T10:15:00Z"
  }
];

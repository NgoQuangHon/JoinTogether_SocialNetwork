# 📜 HƯỚNG DẪN CẤU HÌNH XÁC THỰC EMAIL VÀ SỐ ĐIỆN THOẠI (PRODUCTION & DEV)

Tài liệu này hướng dẫn chi tiết cách lấy thông tin API Keys và cấu hình môi trường cho 2 tính năng: **Gửi Email SMTP** và **Xác thực Số điện thoại SMS OTP qua Firebase**.

---

## ✉️ PHẦN 1: HƯỚNG DẪN CẤU HÌNH GỬI EMAIL (GMAIL SMTP)

### ❓ 1. `SMTP_HOST` và `SMTP_PORT` có quan trọng không? Có thể điền ngẫu nhiên không?
> 🔴 **CỰC KỲ QUAN TRỌNG! BẮT BUỘC NGUYÊN GIÁ TRỊ, KHÔNG ĐƯỢC ĐIỀN BẤT KỲ!**
> 
> - **`SMTP_HOST=smtp.gmail.com`**: Địa chỉ Server máy chủ gửi thư cố định của Google.
> - **`SMTP_PORT=587`**: Cổng kết nối bảo mật (STARTTLS) chuẩn của Google.
> 
> Nếu bạn thay đổi 2 tham số này thành địa chỉ ngẫu nhiên, thư viện Nodemailer sẽ **kết nối thất bại** và không thể gửi email đến bất kỳ ai.

---

### 📌 2. Các bước lấy Mật Khẩu Ứng Dụng (App Password) cho Gmail:
1. Đăng nhập Gmail trên trình duyệt.
2. Truy cập: [myaccount.google.com/security](https://myaccount.google.com/security) và đảm bảo đã **Bật Xác minh 2 bước (2-Step Verification)**.
3. Truy cập đường dẫn tạo mật khẩu ứng dụng: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords).
4. Nhập tên ứng dụng (VD: `JoinTogether App`) ➔ Bấm **Tạo (Create)**.
5. Sao chép chuỗi **16 ký tự mật khẩu** do Google cấp (VD: `abcd efgh ijkl mnop`).

### 📝 Điền vào file `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email_du_an_cua_ban@gmail.com
SMTP_PASS=abcdefghijklmnop
```
*(Viết liền 16 ký tự mật khẩu không chứa khoảng trắng).*

---

## 📱 PHẦN 2: HƯỚNG DẪN CẤU HÌNH XÁC THỰC SỐ ĐIỆN THOẠI (FIREBASE SMS OTP)

### ❓ 1. Khi Deploy lên Server, xác thực SĐT là mã thật hay mã giả lập?
> 🟢 **KHI DEPLOY SẼ LÀ MÃ SMS THẬT 100% GỬI VỀ ĐIỆN THOẠI NGƯỜI DÙNG!**
>
> Hệ thống được thiết kế theo mô hình **Hybrid (Thông minh)**:
> 1. **Môi trường Dev (Chưa có Firebase Key)**: Hệ thống cho phép dùng mã ngẫu nhiên hiển thị trên màn hình hoặc mã test `686868` để lập trình viên test mượt mà không tốn thời gian.
> 2. **Môi trường Production (Khi Deploy)**: Mã test `686868` tự động bị **VÔ HIỆU HÓA HOÀN TOÀN**. Firebase SDK sẽ trực tiếp gửi **mã SMS OTP 6 số thật** về máy điện thoại của bất kỳ người dùng nào nhập số điện thoại.

---

### 📌 2. Các bước lấy API Key Firebase (Miễn phí 10,000 SMS/tháng):
1. Truy cập: [console.firebase.google.com](https://console.firebase.google.com).
2. Bấm **Add project (Thêm dự án)** ➔ Nhập tên dự án (VD: `JoinTogether`) ➔ Nhấp **Create Project**.
3. Tại giao diện chính, bấm vào biểu tượng Web **`</>`** để thêm ứng dụng web ➔ Đặt tên và bấm **Register app**.
4. Sao chép các thông tin trong đối tượng `firebaseConfig`.
5. **Bật tính năng Phone Auth**:
   - Vào menu bên trái chọn **Build ➔ Authentication ➔ Get Started**.
   - Ở tab **Sign-in method**, chọn **Phone** ➔ Chuyển công tắc sang **Enable** ➔ Nhấp **Save**.
6. **Thêm Domain được phép gửi SMS (Authorized Domains)**:
   - Vào **Authentication ➔ Settings ➔ Authorized domains**.
   - Thêm tên miền website hoặc IP server sau khi bạn deploy (VD: `jointogether.vn` hoặc `123.45.67.89`).

### 📝 Điền vào file `frontend/JoinTogether-app/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy... (lấy từ Firebase Console)
VITE_FIREBASE_AUTH_DOMAIN=jointogether.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jointogether
VITE_FIREBASE_STORAGE_BUCKET=jointogether.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef...
```

---

## 🎯 TỔNG KẾT
| Tính năng | Môi trường Dev | Môi trường Production (Deploy) |
| :--- | :--- | :--- |
| **Gửi Email** | In log kiểm thử lên Terminal | Gửi Mail thật 100% đến Gmail người nhận |
| **Xác thực SĐT** | Nhập `686868` hoặc mã hiển thị màn hình | Gửi SMS thật 100% về điện thoại (Firebase) |

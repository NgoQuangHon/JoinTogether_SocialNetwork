# 📜 HƯỚNG DẪN CẤU HÌNH XÁC THỰC EMAIL VÀ SỐ ĐIỆN THOẠI (PRODUCTION & DEV)

Tài liệu này hướng dẫn chi tiết cách cấu hình môi trường và quy trình hoạt động của 2 tính năng xác thực cốt lõi trong hệ thống **JoinTogether**:
1. **Xác thực Email OTP & Phục hồi mật khẩu** (Gmail SMTP & Mailjet API)
2. **Xác thực Số điện thoại SMS OTP 2 Bước** (Firebase Phone Authentication)

---

## ✉️ PHẦN 1: HƯỚNG DẪN CẤU HÌNH GỬI EMAIL (GMAIL SMTP & MAILJET API)

### 📌 1. Tại sao cần hỗ trợ cả Mailjet API bên cạnh Gmail SMTP?
- **Gmail SMTP (Port 587)**: Hoạt động hoàn hảo ở môi trường Local/Dev. Tuy nhiên khi Deploy lên cloud miễn phí (như Render), Render chặn toàn bộ cổng gửi SMTP đầu ra (Port 587/465) để phòng chống spam email.
- **Mailjet API / Brevo API**: Sử dụng giao thức HTTP API gửi email qua cổng 443 tiêu chuẩn. Giúp ứng dụng gửi Mail xác thực OTP đến Gmail người dùng mượt mà 100% khi chạy trên Render mà không bị chặn cổng.

---

### 📌 2. Các bước cấu hình Email:

#### A. Cấu hình Gmail SMTP (Môi trường Local / Dev):
1. Truy cập: [myaccount.google.com/security](https://myaccount.google.com/security) và **Bật Xác minh 2 bước**.
2. Truy cập: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords) ➔ Tạo **App Password** 16 ký tự.
3. Điền vào file `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email_du_an_cua_ban@gmail.com
SMTP_PASS=abcdefghijklmnop
```

#### B. Cấu hình Mailjet API (Môi trường Render Production):
1. Truy cập [mailjet.com](https://www.mailjet.com) ➔ Đăng ký tài khoản miễn phí (cho phép gửi 6,000 email/tháng).
2. Vào mục **Account Settings ➔ API Key Management**.
3. Sao chép `API Key` và `Secret Key`.
4. Điền vào file `backend/.env` hoặc biến môi trường Render:
```env
MAILJET_API_KEY=a1b2c3d4e5f6...
MAILJET_SECRET_KEY=z9y8x7w6v5u4...
```

---

## 📱 PHẦN 2: QUY TRÌNH XÁC THỰC 2 BƯỚC & FIREBASE PHONE AUTH

### 🎯 Quy trình Xác thực 2 Bước (Two-Stage Verification):
Hệ thống **JoinTogether** áp dụng cơ chế xác thực tài khoản nghiêm ngặt:
1. **Bước 1 (Xác thực Email OTP)**:
   - Khi người dùng đăng ký ➔ Hệ thống gửi mã OTP 6 số qua Email.
   - Nhập đúng mã Email OTP ➔ Tài khoản chuyển trạng thái `ACTIVE` (Cho phép đăng nhập sử dụng hệ thống), nhưng trường `da_xac_thuc = false`.
2. **Bước 2 (Xác thực Số điện thoại SMS OTP)**:
   - Trong trang Hồ sơ cá nhân hoặc khi thực hiện hành động yêu cầu xác minh ➔ Người dùng nhập SĐT chính chủ.
   - Nhập đúng mã SMS OTP từ Firebase ➔ Cập nhật SĐT và chuyển `da_xac_thuc = true`.
   - **Tài khoản chính thức nhận huy hiệu Tích Xanh: `✓ Tài khoản xác thực`**.

---

### 📌 Cấu hình Firebase Phone Auth trên Frontend:

#### 1. Bộ biến môi trường chuẩn trong `frontend/JoinTogether-app/.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSyBt-5fEs0AZswqZsLliCOjQ2ZIW7HleqQQ
VITE_FIREBASE_AUTH_DOMAIN=jointogether-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=jointogether-app
VITE_FIREBASE_STORAGE_BUCKET=jointogether-app.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=599015660338
VITE_FIREBASE_APP_ID=1:599015660338:web:b425650f7c0b709ff8552b
```

#### 2. Cài đặt bắt buộc trên Trang [console.firebase.google.com](https://console.firebase.google.com):
1. **Bật Phone Auth**: Vào **Authentication ➔ Sign-in method ➔ Phone** ➔ Chuyển công tắc sang **Enable** ➔ Bấm **Save**.
2. **Thêm Domain được phép gửi SMS (Authorized Domains)**:
   - Vào **Authentication ➔ Settings ➔ Authorized domains** ➔ Bấm **Add domain**.
   - Thêm 2 tên miền: `join-together-social-network.vercel.app` và `localhost`.

#### 3. Cơ chế Thử nghiệm (Test Phone Numbers - Miễn phí 0đ không cần Thẻ Visa):
* Trong mục **Authentication ➔ Sign-in method ➔ Phone**, kéo xuống **Phone numbers for testing**:
  - Thêm SĐT thử nghiệm: `+84389439976`
  - Mã OTP thử nghiệm: `686868`
* Khi mở ứng dụng trên Web, bạn nhập số `0389439976` và điền mã `686868` ➔ Ứng dụng sẽ lập tức xác thực thành công và cấp Huy hiệu Tích Xanh `✓ Tài khoản xác thực` hoàn toàn miễn phí mà không tốn cước viễn thông.

---

## 📊 BẢNG TỔNG KẾT MÔ I HÌNH HOẠT ĐỘNG

| Tính năng | Môi trường Local / Dev | Môi trường Production (Render / Vercel) |
| :--- | :--- | :--- |
| **Gửi Mã Email OTP** | Gmail SMTP (`smtp.gmail.com:587`) | Mailjet API / Brevo API (Bypass lỗi chặn port 587 trên Render) |
| **Xác thực SĐT SMS** | SĐT Thử nghiệm (`+84389439976` / `686868`) | SMS thật gửi về điện thoại qua Firebase Auth (Blaze Plan) |
| **Trạng thái Tài khoản** | Đã xác thực Email ➔ Trạng thái `ACTIVE` | Xác thực cả SĐT ➔ Huy hiệu `✓ Tài khoản xác thực` |

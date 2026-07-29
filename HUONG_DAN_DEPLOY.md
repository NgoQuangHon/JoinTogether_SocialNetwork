# 🚀 HƯỚNG DẪN CHI TIẾT DEPLOY HỆ THỐNG JOINTOGETHER (MIỄN PHÍ 100% & 24/7)

Tài liệu này hướng dẫn chi tiết từng bước deploy toàn bộ hệ thống lên Cloud miễn phí:
1. **Database PostgreSQL**: Supabase (Miễn phí)
2. **Backend Express + Socket.IO**: Koyeb.com (Miễn phí, 24/7 không ngủ)
3. **Frontend React Vite**: Vercel.com (Miễn phí, tốc độ cao)

---

## 🗄️ BƯỚC 1: TẠO DATABASE POSTGRESQL TRÊN SUPABASE

1. Truy cập [supabase.com](https://supabase.com) ➔ Đăng ký/Đăng nhập bằng GitHub.
2. Bấm **New Project** ➔ Đặt tên dự án (VD: `JoinTogether-DB`).
3. Tạo **Database Password** mạnh (Lưu lại mật khẩu này).
4. Chọn Region (Ví dụ: `Singapore` hoặc `Tokyo` để tốc độ về Việt Nam nhanh nhất).
5. Khi dự án khởi tạo xong, truy cập: **Project Settings ➔ Database ➔ Connection string (URI)**.
6. Bạn sẽ thu được các tham số kết nối:
   - `DB_HOST`: `db.xxxxxxxxx.supabase.co`
   - `DB_PORT`: `5432`
   - `DB_NAME`: `postgres`
   - `DB_USER`: `postgres`
   - `DB_PASSWORD`: *(Mật khẩu bạn vừa đặt)*
   - `DB_SSL`: `true`

---

## ⚙️ BƯỚC 2: DEPLOY BACKEND LÊN KOYEB (KHÔNG SLEEP 24/7)

1. Đẩy mã nguồn dự án của bạn lên **GitHub** (Repo Private hoặc Public).
2. Truy cập [koyeb.com](https://koyeb.com) ➔ Đăng ký bằng tài khoản GitHub.
3. Tạo Web Service mới: Bấm **Create App / Service** ➔ Chọn nguồn từ **GitHub**.
4. Chọn Repository của bạn, đặt Work Directory là `/backend` (nếu dự án ở thư mục con backend) hoặc chọn nhánh `main`.
5. Trong mục **Environment Variables**, điền các biến môi trường sau:
   - `DB_HOST` = *(Lấy từ Supabase)*
   - `DB_PORT` = `5432`
   - `DB_NAME` = `postgres`
   - `DB_USER` = `postgres`
   - `DB_PASSWORD` = *(Mật khẩu Supabase)*
   - `DB_SSL` = `true`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `chuoi_bao_mat_ngau_nhien_123456`
   - `JWT_EXPIRES_IN` = `7d`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `email_cua_ban@gmail.com`
   - `SMTP_PASS` = `16_ky_tu_app_password_gmail`
6. Bấm **Deploy**. Koyeb sẽ tự động build ứng dụng và cấp cho bạn 1 URL public Backend dạng:  
   👉 `https://jointogether-backend-xxxx.koyeb.app`

---

## 🌐 BƯỚC 3: DEPLOY FRONTEND LÊN VERCEL

1. Truy cập [vercel.com](https://vercel.com) ➔ Đăng nhập bằng GitHub.
2. Bấm **Add New ➔ Project** ➔ Import Repository GitHub của bạn.
3. Đặt **Root Directory** là `frontend/JoinTogether-app` (hoặc thư mục chứa code frontend).
4. Trong mục **Environment Variables**, điền các biến:
   - `VITE_API_URL` = `https://jointogether-backend-xxxx.koyeb.app` *(URL Backend Koyeb vừa tạo ở Bước 2)*
   - `VITE_SOCKET_URL` = `https://jointogether-backend-xxxx.koyeb.app`
   - *(Các biến Firebase nếu có)*:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
5. Bấm **Deploy**. Vercel sẽ tự động build và cấp domain miễn phí dạng:  
   👉 `https://jointogether.vercel.app`

---

## 🔐 BƯỚC 4: BỔ SUNG DOMAIN TRÊN FIREBASE (SMS OTP)
1. Mở trang [console.firebase.google.com](https://console.firebase.google.com).
2. Vào **Authentication ➔ Settings ➔ Authorized domains**.
3. Bấm **Add domain** ➔ Dán tên miền Vercel của bạn vào (VD: `jointogether.vercel.app`).

---

🎉 **HOÀN TẤT!**  
Bây giờ ứng dụng của bạn đã chạy trực tuyến 24/7 miễn phí hoàn toàn trên Internet. Mỗi khi bạn sửa code và `git push`, Vercel & Koyeb sẽ tự động cập nhật bản mới nhất lên mạng!

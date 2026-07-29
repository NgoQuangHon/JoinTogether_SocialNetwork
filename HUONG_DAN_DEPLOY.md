# 🚀 HƯỚNG DẪN CHI TIẾT DEPLOY HỆ THỐNG JOINTOGETHER (MIỄN PHÍ 100% & 24/7)

Tài liệu này hướng dẫn chi tiết từng bước deploy toàn bộ hệ thống lên Cloud miễn phí:

1. **Database PostgreSQL**: Neon.tech (Miễn phí 100%, hỗ trợ IPv4 mượt mà)
2. **Backend Express + Socket.IO**: Render.com (Miễn phí, cài UptimeRobot 24/7 không ngủ)
3. **Monitor Chống Sleep 24/7**: UptimeRobot.com (Miễn phí, ping giữ thức 5p/lần)
4. **Frontend React Vite**: Vercel.com (Miễn phí 100%, tốc độ cao)

---

## 🗄️ BƯỚC 1: TẠO DATABASE POSTGRESQL TRÊN NEON.TECH

1. Truy cập [neon.tech](https://neon.tech) ➔ Đăng ký/Đăng nhập bằng GitHub.
2. Bấm **Create Project** ➔ Đặt tên dự án (VD: `JoinTogether-DB`).
3. Chọn Region `Asia Pacific (Singapore)` ➔ Bấm **Create Project**.
4. Sao chép các tham số kết nối điền vào Render:
   - `DB_HOST`: `ep-xxxx.ap-southeast-1.aws.neon.tech` *(Hostname Neon của bạn)*
   - `DB_PORT`: `5432`
   - `DB_NAME`: `neondb`
   - `DB_USER`: `neondb_owner`
   - `DB_PASSWORD`: `npg_xxxx` *(Mật khẩu Neon)*
   - `DB_SSL`: `true`

---

## ⚙️ BƯỚC 2: DEPLOY BACKEND LÊN RENDER.COM (KÈM MẸO CHỐNG SLEEP 24/7)

Render.com là nền tảng host Backend Node.js Express + Socket.IO phổ biến và ổn định nhất hiện nay.

### 📌 A. Deploy Backend trên Render:

1. Đẩy mã nguồn dự án của bạn lên **GitHub**.
2. Truy cập [render.com](https://render.com) ➔ Đăng ký/Đăng nhập bằng GitHub.
3. Nhấp nút **New + ➔ Web Service**.
4. Chọn Repository GitHub của bạn ➔ Bấm **Connect**.
5. Cấu hình thông tin:
   - **Name**: `jointogether-backend` (hoặc tên tùy chọn).
   - **Root Directory**: `backend` (thư mục chứa backend của bạn).
   - **Environment**: `Node`.
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start` (hoặc `node dist/index.js`).
6. Kéo xuống mục **Environment Variables** ➔ Bấm **Add Environment Variable** và thêm các biến:
   - `DB_HOST` = _(Lấy từ Supabase)_
   - `DB_PORT` = `5432`
   - `DB_NAME` = `postgres`
   - `DB_USER` = `postgres`
   - `DB_PASSWORD` = _(Mật khẩu Supabase)_
   - `DB_SSL` = `true`
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = `chuoi_bao_mat_ngau_nhien_123456`
   - `JWT_EXPIRES_IN` = `7d`
   - `SMTP_HOST` = `smtp.gmail.com`
   - `SMTP_PORT` = `587`
   - `SMTP_USER` = `email_cua_ban@gmail.com`
   - `SMTP_PASS` = `16_ky_tu_app_password_gmail`
7. Bấm **Create Web Service**. Render sẽ tự động build và cấp cho bạn 1 URL Backend dạng:  
   👉 `https://jointogether-backend.onrender.com`

---

### 💡 B. MẸO CHỐNG SLEEP (GIÚP RENDER CHẠY 24/7 KHÔNG BAO GIỜ NGỦ ME)

_Mặc định Render miễn phí sẽ tạm thời ngủ nếu 15 phút không ai truy cập. Để nó chạy 24/7 liên tục suốt vài tháng:_

1. Đăng ký trang web miễn phí [uptimerobot.com](https://uptimerobot.com) (hoặc [cron-job.org](https://cron-job.org)).
2. Tạo 1 **Monitor** mới ➔ Chọn loại **HTTP(s)**.
3. Điền URL Backend Render của bạn (VD: `https://jointogether-backend.onrender.com`).
4. Đặt thời gian ping: **Every 5 minutes (Mỗi 5 phút 1 lần)**.
5. Bấm **Create Monitor**.  
   👉 UptimeRobot sẽ gửi tín hiệu nhẹ giữ cho Backend Render của bạn **luôn thức 24/7 liên tục không bao giờ ngủ**!

---

## 🌐 BƯỚC 3: DEPLOY FRONTEND LÊN VERCEL

1. Truy cập [vercel.com](https://vercel.com) ➔ Đăng nhập bằng GitHub.
2. Bấm **Add New ➔ Project** ➔ Import Repository GitHub của bạn.
3. Đặt **Root Directory** là `frontend/JoinTogether-app` (hoặc thư mục chứa code frontend).
4. Trong mục **Environment Variables**, điền các biến:
   - `VITE_API_URL` = `https://jointogether-backend.onrender.com` _(URL Backend Render vừa tạo ở Bước 2)_
   - `VITE_SOCKET_URL` = `https://jointogether-backend.onrender.com`
   - _(Các biến Firebase nếu có)_:
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

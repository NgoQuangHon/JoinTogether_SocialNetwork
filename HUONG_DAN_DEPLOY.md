# 🚀 HƯỚNG DẪN CHI TIẾT DEPLOY HỆ THỐNG JOINTOGETHER (MIỄN PHÍ 100% & 24/7)

Tài liệu này hướng dẫn chi tiết từng bước deploy toàn bộ hệ thống dự án **JoinTogether** lên Môi trường Production trực tuyến miễn phí 100% và hoạt động 24/7:

1. **Database PostgreSQL**: Neon.tech (Miễn phí 100%, hỗ trợ kết nối SSL IPv4/IPv6 mượt mà)
2. **Backend Express + Socket.IO**: Render.com (Cài UptimeRobot ping chống ngủ 24/7)
3. **Monitor Chống Sleep 24/7**: UptimeRobot.com (Ping giữ thức 5 phút/lần vào đường dẫn `/`)
4. **Frontend React Vite**: Vercel.com (Tốc độ cao, tự động deploy từ GitHub)
5. **Xác thực SMS OTP**: Firebase Authentication (Gửi mã SMS OTP 6 số)

---

## 🗄️ BƯỚC 1: CẤU HÌNH DATABASE POSTGRESQL TRÊN NEON.TECH

1. Truy cập [neon.tech](https://neon.tech) ➔ Đăng ký/Đăng nhập bằng tài khoản GitHub.
2. Bấm **Create Project** ➔ Đặt tên dự án (VD: `JoinTogether-DB`).
3. Chọn Region `Asia Pacific (Singapore)` ➔ Bấm **Create Project**.
4. Sao chép các tham số kết nối để điền vào biến môi trường Backend trên Render:
   - `DB_HOST`: `ep-twilight-mouse-azk1kjgu.c-3.ap-southeast-1.aws.neon.tech` *(Hostname Neon của bạn)*
   - `DB_PORT`: `5432`
   - `DB_NAME`: `neondb`
   - `DB_USER`: `neondb_owner`
   - `DB_PASSWORD`: *(Mật khẩu Neon cung cấp)*
   - `DB_SSL`: `true`

---

## ⚙️ BƯỚC 2: DEPLOY BACKEND LÊN RENDER.COM (KÈM MẸO CHỐNG SLEEP 24/7)

Render.com là nền tảng máy chủ lưu trữ Backend Node.js Express + Socket.IO ổn định nhất hiện nay.

### 📌 A. Deploy Backend trên Render:

1. Đẩy mã nguồn dự án của bạn lên **GitHub**.
2. Truy cập [render.com](https://render.com) ➔ Đăng nhập bằng GitHub.
3. Nhấp nút **New + ➔ Web Service**.
4. Chọn Repository GitHub `JoinTogether_SocialNetwork` ➔ Bấm **Connect**.
5. Cấu hình các thông số cơ bản:
   - **Name**: `jointogether-backend` (hoặc tên tùy chọn)
   - **Root Directory**: `backend` *(Thư mục chứa mã nguồn Backend)*
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start` (hoặc `node dist/app.js`)
6. Kéo xuống mục **Environment Variables** ➔ Bấm **Add Environment Variable** và thêm các biến:
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
   - `DB_HOST` = `ep-twilight-mouse-azk1kjgu.c-3.ap-southeast-1.aws.neon.tech`
   - `DB_PORT` = `5432`
   - `DB_NAME` = `neondb`
   - `DB_USER` = `neondb_owner`
   - `DB_PASSWORD` = _(Mật khẩu Neon DB)_
   - `DB_SSL` = `true`
   - `JWT_SECRET` = `chuoi_bao_mat_jwt_secret_key_123456`
   - `JWT_EXPIRES_IN` = `7d`
   - **Cấu hình Email (Chọn 1 trong 2 cách)**:
     - *Cách 1 (Mailjet API - Khuyên dùng cho Render để không bị chặn Cổng 587)*:
       - `MAILJET_API_KEY` = _(API Key từ Mailjet)_
       - `MAILJET_SECRET_KEY` = _(Secret Key từ Mailjet)_
     - *Cách 2 (Gmail SMTP)*:
       - `SMTP_HOST` = `smtp.gmail.com`
       - `SMTP_PORT` = `587`
       - `SMTP_USER` = `email_cua_ban@gmail.com`
       - `SMTP_PASS` = `16_ky_tu_app_password_gmail`
7. Bấm **Create Web Service**. Render sẽ tự động build và cấp cho bạn URL Backend dạng:  
   👉 `https://jointogether-backend.onrender.com`

---

### 💡 B. MẸO CHỐNG SLEEP (GIÚP RENDER CHẠY 24/7 KHÔNG BAO GIỜ NGỦ)

*Mặc định gói miễn phí của Render sẽ tạm dừng (ngủ) nếu 15 phút không có lượt truy cập. Để Backend luôn thức và phản hồi tức thì:*

1. Đăng ký tài khoản miễn phí tại [uptimerobot.com](https://uptimerobot.com) (hoặc [cron-job.org](https://cron-job.org)).
2. Bấm **Add New Monitor** ➔ Chọn loại **HTTP(s)**.
3. Đặt tên: `JoinTogether Backend Health`.
4. Điền URL Backend Render của bạn: `https://jointogether-backend.onrender.com/` *(Hệ thống đã có sẵn Endpoint `/` trả về 200 OK)*.
5. Chọn thời gian kiểm tra: **Every 5 minutes (Mỗi 5 phút 1 lần)**.
6. Bấm **Create Monitor**.  
   👉 UptimeRobot sẽ gửi request nhẹ duy trì giúp Backend Render của bạn **chạy liên tục 24/7 không bao giờ bị ngủ**!

---

## 🌐 BƯỚC 3: DEPLOY FRONTEND LÊN VERCEL

1. Truy cập [vercel.com](https://vercel.com) ➔ Đăng nhập bằng tài khoản GitHub.
2. Bấm **Add New ➔ Project** ➔ Import Repository `JoinTogether_SocialNetwork`.
3. Đặt **Root Directory** là `frontend/JoinTogether-app`.
4. Trong mục **Environment Variables**, thêm các biến cấu hình kết nối:
   - `VITE_API_URL` = `https://jointogether-backend.onrender.com` *(URL Backend vừa tạo ở Bước 2)*
   - `VITE_SOCKET_URL` = `https://jointogether-backend.onrender.com`
   - `VITE_FIREBASE_API_KEY` = `AIzaSyBt-5fEs0AZswqZsLliCOjQ2ZIW7HleqQQ`
   - `VITE_FIREBASE_AUTH_DOMAIN` = `jointogether-app.firebaseapp.com`
   - `VITE_FIREBASE_PROJECT_ID` = `jointogether-app`
   - `VITE_FIREBASE_STORAGE_BUCKET` = `jointogether-app.firebasestorage.app`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID` = `599015660338`
   - `VITE_FIREBASE_APP_ID` = `1:599015660338:web:b425650f7c0b709ff8552b`
5. Bấm **Deploy**. Vercel sẽ tự động biên dịch và cấp domain dạng:  
   👉 `https://join-together-social-network.vercel.app`

---

## 🔐 BƯỚC 4: BỔ SUNG DOMAIN VERCEL VÀO FIREBASE (SMS OTP)

1. Mở trang [console.firebase.google.com](https://console.firebase.google.com) ➔ Chọn dự án `jointogether-app`.
2. Vào menu **Authentication ➔ Tab Settings ➔ Authorized domains**.
3. Bấm **Add domain** ➔ Điền tên miền Vercel của bạn: `join-together-social-network.vercel.app` ➔ Bấm **Save**.

---

🎉 **HOÀN TẤT!**  
Hệ thống JoinTogether đã hoạt động 24/7 trực tuyến trên Internet. Mỗi khi bạn thực hiện chỉnh sửa code và chạy lệnh `git push origin main`, Vercel & Render sẽ tự động cập nhật phiên bản mới nhất!

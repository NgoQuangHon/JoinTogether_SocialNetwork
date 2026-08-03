import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

try {
  dns.setDefaultResultOrder('ipv4first');
} catch {}

dotenv.config({ quiet: process.env.NODE_ENV === 'test' });

if (!process.env.DB_HOST) {
    dotenv.config({ path: 'src/.env', quiet: process.env.NODE_ENV === 'test' });
}

const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
    throw new Error(`Missing database environment variables: ${missingEnvVars.join(', ')}`);
}

export type Queryable = Pool | PoolClient;

let dbHost = process.env.DB_HOST || '';
let dbPort = Number(process.env.DB_PORT) || 5432;
let dbName = process.env.DB_NAME || 'postgres';
let dbUser = process.env.DB_USER || 'postgres';
let dbPass = process.env.DB_PASSWORD || '';

const fullUrl = process.env.DATABASE_URL || (dbHost.startsWith('postgres') ? dbHost : null);
if (fullUrl) {
  try {
    const parsed = new URL(fullUrl);
    dbHost = parsed.hostname;
    dbPort = Number(parsed.port) || 5432;
    dbName = parsed.pathname.replace(/^\//, '') || dbName;
    dbUser = parsed.username || dbUser;
    dbPass = parsed.password || dbPass;
  } catch {}
}

export const pool = new Pool({
    host: dbHost,
    port: dbPort,
    database: dbName,
    user: dbUser,
    password: dbPass,
    parseInt8: true,
    max: 10,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.DB_SSL === 'true' || process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
} as any);

function getSqlContent(): string | null {
  const possiblePaths = [
    path.join(__dirname, 'file.sql'),
    path.join(__dirname, '../src/config/file.sql'),
    path.join(process.cwd(), 'src/config/file.sql'),
    path.join(process.cwd(), 'dist/config/file.sql'),
    path.join(process.cwd(), 'backend/src/config/file.sql'),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, 'utf8');
    }
  }
  return null;
}

export async function connectDB() {
    try {
        console.log(`🔌 Đang kết nối PostgreSQL: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected');

        // Kiểm tra xem bảng nguoi_dung đã tồn tại chưa (Nếu DB mới tinh thì tự khởi tạo Schema)
        const checkTable = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'nguoi_dung'
          );
        `);

        if (!checkTable.rows[0]?.exists) {
          console.log('📦 Database mới chưa có bảng, đang tự động khởi tạo toàn bộ Schema từ file.sql...');
          const sqlContent = getSqlContent();
          if (sqlContent) {
            await client.query(sqlContent);
            console.log('✅ Đã khởi tạo toàn bộ 40+ bảng cơ sở dữ liệu thành công!');
          } else {
            console.warn('⚠️ Không tìm thấy file.sql để tự động khởi tạo bảng.');
          }
        }

        // Migration tự động đảm bảo bảng chan và các cột tùy chọn quyền riêng tư luôn tồn tại
        await client.query(`
          CREATE TABLE IF NOT EXISTS chan (
            nguoi_chan_id INT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
            nguoi_bi_chan_id INT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
            thoi_gian TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (nguoi_chan_id, nguoi_bi_chan_id)
          );

          ALTER TABLE ho_so_nguoi_dung ADD COLUMN IF NOT EXISTS cho_phep_nhan_yeu_cau_ket_noi BOOLEAN DEFAULT TRUE;
          ALTER TABLE ho_so_nguoi_dung ADD COLUMN IF NOT EXISTS an_ngay_sinh BOOLEAN DEFAULT FALSE;
          ALTER TABLE ho_so_nguoi_dung ADD COLUMN IF NOT EXISTS an_so_dien_thoai BOOLEAN DEFAULT FALSE;
          ALTER TABLE ho_so_nguoi_dung ADD COLUMN IF NOT EXISTS an_dia_chi BOOLEAN DEFAULT FALSE;

          -- Nearby Match: vị trí GPS trong hồ sơ
          ALTER TABLE ho_so_nguoi_dung ADD COLUMN IF NOT EXISTS vi_do DECIMAL(10,8);
          ALTER TABLE ho_so_nguoi_dung ADD COLUMN IF NOT EXISTS kinh_do DECIMAL(11,8);

          -- Đảm bảo chỉ tài khoản đã xác thực SĐT mới có da_xac_thuc = true
          UPDATE tai_khoan SET da_xac_thuc = false 
          WHERE nguoi_dung_id IN (
            SELECT nguoi_dung_id FROM nguoi_dung WHERE so_dien_thoai IS NULL OR TRIM(so_dien_thoai) = ''
          );

          CREATE TABLE IF NOT EXISTS phong_tro_chuyen (
            phong_id BIGSERIAL PRIMARY KEY,
            ten_phong VARCHAR(255),
            loai_phong VARCHAR(50) DEFAULT 'DIRECT',
            ngay_tao TIMESTAMPTZ DEFAULT NOW(),
            het_han_luc TIMESTAMPTZ
          );

          CREATE TABLE IF NOT EXISTS thanh_vien_phong (
            phong_id BIGINT REFERENCES phong_tro_chuyen(phong_id) ON DELETE CASCADE,
            nguoi_dung_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
            ngay_tham_gia TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (phong_id, nguoi_dung_id)
          );

          -- Phòng chat tạm thời (het_han_luc cho chat 10 phút)
          ALTER TABLE phong_tro_chuyen ADD COLUMN IF NOT EXISTS het_han_luc TIMESTAMPTZ;

          -- Bảng lưu phiên quét tạm thời (tự xóa sau 10 phút)
          CREATE TABLE IF NOT EXISTS phien_quet_ban (
            phien_id      BIGSERIAL PRIMARY KEY,
            nguoi_dung_id BIGINT UNIQUE REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
            vi_do         DECIMAL(10,8) NOT NULL,
            kinh_do       DECIMAL(11,8) NOT NULL,
            socket_id     VARCHAR(255),
            bat_dau_luc   TIMESTAMPTZ DEFAULT NOW(),
            het_han_luc   TIMESTAMPTZ DEFAULT NOW() + INTERVAL '10 minutes'
          );

          -- Bảng lưu lựa chọn đề xuất kết bạn trong khung chat tạm thời
          CREATE TABLE IF NOT EXISTS de_xuat_ket_ban (
            phong_id      BIGINT REFERENCES phong_tro_chuyen(phong_id) ON DELETE CASCADE,
            nguoi_dung_id BIGINT REFERENCES nguoi_dung(nguoi_dung_id) ON DELETE CASCADE,
            trang_thai    VARCHAR(20) NOT NULL DEFAULT 'NONE',
            ngay_tao      TIMESTAMPTZ DEFAULT NOW(),
            PRIMARY KEY (phong_id, nguoi_dung_id)
          );
        `);

        // Khởi tạo / Cập nhật tài khoản Admin mặc định (admin / adminpassword)
        const adminCheck = await client.query(`SELECT tai_khoan_id FROM tai_khoan WHERE ten_dang_nhap = 'admin'`);
        const hashedPassword = await bcrypt.hash('adminpassword', 10);

        let adminTaiKhoanId: number;
        if (adminCheck.rows.length === 0) {
          const userRes = await client.query(`
            INSERT INTO nguoi_dung (ho_ten, email, so_dien_thoai)
            VALUES ('Quản trị viên', 'admin@jointogether.vn', '0999999999')
            RETURNING nguoi_dung_id
          `);
          const nguoiDungId = userRes.rows[0].nguoi_dung_id;

          const tkRes = await client.query(`
            INSERT INTO tai_khoan (nguoi_dung_id, ten_dang_nhap, mat_khau_ma_hoa, trang_thai, da_xac_thuc)
            VALUES ($1, 'admin', $2, 'ACTIVE', true)
            RETURNING tai_khoan_id
          `, [nguoiDungId, hashedPassword]);
          adminTaiKhoanId = tkRes.rows[0].tai_khoan_id;

          // Gán vai trò ADMIN
          await client.query(`
            INSERT INTO tai_khoan_vai_tro (tai_khoan_id, vai_tro_id)
            SELECT $1, vai_tro_id FROM vai_tro WHERE ten_vai_tro = 'ADMIN'
            ON CONFLICT DO NOTHING
          `, [adminTaiKhoanId]);
          console.log('🔑 Đã tạo tự động tài khoản admin (admin / adminpassword) thành công!');
        } else {
          adminTaiKhoanId = adminCheck.rows[0].tai_khoan_id;
          await client.query(`
            UPDATE tai_khoan
            SET mat_khau_ma_hoa = $1, trang_thai = 'ACTIVE', da_xac_thuc = true
            WHERE tai_khoan_id = $2
          `, [hashedPassword, adminTaiKhoanId]);
          
          await client.query(`
            INSERT INTO tai_khoan_vai_tro (tai_khoan_id, vai_tro_id)
            SELECT $1, vai_tro_id FROM vai_tro WHERE ten_vai_tro = 'ADMIN'
            ON CONFLICT DO NOTHING
          `, [adminTaiKhoanId]);
          console.log('🔑 Đã cập nhật mật khẩu tài khoản admin (admin / adminpassword) thành công!');
        }

        // Tự động Seed Loại vi phạm & Báo cáo / Yêu cầu hỗ trợ mẫu (nếu chưa có)
        await client.query(`
          INSERT INTO loai_vi_pham (loai_vi_pham_id, ten_loai, mo_ta, muc_do)
          VALUES 
            (1, 'Quấy rối', 'Hành vi xúc phạm, đe dọa người khác', 'CAO'),
            (2, 'Giả mạo', 'Giả mạo danh tính cá nhân', 'TRUNG_BINH'),
            (3, 'Lừa đảo', 'Chiếm đoạt tài sản hoặc thông tin', 'NGHIEM_TRONG'),
            (4, 'Nội dung không phù hợp', 'Nội dung phản cảm', 'TRUNG_BINH'),
            (5, 'Spam', 'Quảng cáo hoặc gửi tin rác', 'NHE'),
            (6, 'Khác', 'Lý do vi phạm khác', 'NHE')
          ON CONFLICT (loai_vi_pham_id) DO NOTHING;
        `);

        // Đảm bảo sequence loai_vi_pham_id khớp với max id
        await client.query(`SELECT setval(pg_get_serial_sequence('loai_vi_pham', 'loai_vi_pham_id'), COALESCE(MAX(loai_vi_pham_id), 1)) FROM loai_vi_pham;`).catch(() => {});

        const countReports = await client.query(`SELECT COUNT(*) FROM bao_cao_vi_pham`);
        if (parseInt(countReports.rows[0].count, 10) === 0) {
          await client.query(`
            INSERT INTO bao_cao_vi_pham (nguoi_bao_cao_id, nguoi_bi_bao_cao_id, loai_vi_pham_id, noi_dung, trang_thai)
            VALUES 
              (1, 1, 1, 'Báo cáo mẫu: Người dùng có hành vi ngôn từ quấy rối trong phòng chat hoạt động.', 'CHO_XU_LY')
          `).catch(() => {});
        }

        const countSupports = await client.query(`SELECT COUNT(*) FROM yeu_cau_ho_tro`);
        if (parseInt(countSupports.rows[0].count, 10) === 0) {
          await client.query(`
            INSERT INTO yeu_cau_ho_tro (nguoi_gui_id, loai_ho_tro, tieu_de, mo_ta, trang_thai)
            VALUES 
              (1, 'LOI_KY_THUAT', 'Yêu cầu hỗ trợ mẫu: Lỗi không mở được khung chat lân cận', 'Hệ thống báo lỗi kết nối Socket.IO khi tôi bật quét tìm bạn lân cận.', 'CHO_XU_LY')
          `).catch(() => {});
        }

        client.release();
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        process.exit(1);
    }
}

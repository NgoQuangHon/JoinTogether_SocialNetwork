import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';
import dns from 'dns';
import fs from 'fs';
import path from 'path';

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

        client.release();
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        process.exit(1);
    }
}

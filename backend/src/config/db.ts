import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

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

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    parseInt8: true,
} as any);

export async function connectDB() {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected');

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

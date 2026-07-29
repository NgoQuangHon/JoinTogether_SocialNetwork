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
        `);

        client.release();
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        process.exit(1);
    }
}

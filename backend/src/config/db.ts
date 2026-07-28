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

/**
 * Cho phép các repository nhận vào `pool` (mặc định) hoặc một `PoolClient`
 * đang trong transaction (BEGIN/COMMIT/ROLLBACK), để nhiều lệnh ghi liên
 * quan tới nhau có thể được gộp vào cùng 1 transaction từ tầng service.
 */
export type Queryable = Pool | PoolClient;

export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    parseInt8: true,
});

export async function connectDB() {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL connected');
        client.release();
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
        process.exit(1);
    }
}

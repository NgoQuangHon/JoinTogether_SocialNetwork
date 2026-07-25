const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-do-not-use-in-production';

const configuredSecret = process.env.JWT_SECRET?.trim();

if (!configuredSecret) {
  if (process.env.NODE_ENV === 'production') {
    // Không cho phép chạy production mà thiếu JWT_SECRET - đây là lỗ hổng bảo mật nghiêm trọng.
    throw new Error(
      'Thiếu biến môi trường JWT_SECRET. Hãy đặt JWT_SECRET trong .env trước khi khởi động server ở môi trường production.',
    );
  }
  console.warn(
    '⚠️  JWT_SECRET chưa được cấu hình trong .env — đang dùng secret mặc định CHỈ DÙNG CHO DEV. ' +
      'Thêm dòng `JWT_SECRET=<chuỗi-ngẫu-nhiên-dài>` vào file .env trước khi deploy.',
  );
}

export const JWT_SECRET = configuredSecret || DEV_FALLBACK_SECRET;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

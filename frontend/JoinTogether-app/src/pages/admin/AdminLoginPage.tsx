import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import '../../App.css';

const schema = z.object({
  tenDangNhap: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  matKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      await login(data);
      // Check role after login from localStorage (state may lag)
      const saved = localStorage.getItem('auth_state');
      let isAdmin = false;
      if (saved) {
        try {
          const s = JSON.parse(saved);
          const allRoles: string[] = s.roles || [];
          const r = (s.role || '').toLowerCase();
          isAdmin =
            r.includes('admin') ||
            r.includes('quan_tri') ||
            allRoles.some((x: string) =>
              ['admin', 'quan_tri', 'quan tri', 'administrator'].includes(x.toLowerCase()),
            );
        } catch {
          /* ignore */
        }
      }
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        // Allow entry; backend will reject non-admin API calls
        navigate('/admin', { replace: true });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string };
      setError(e?.response?.data?.message || e?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="app">
      <div className="hero" style={{ minHeight: '100vh', justifyContent: 'center' }}>
        <div className="brand" style={{ marginBottom: 32 }}>
          <div className="brand-icon">🌿</div>
          <div className="brand-name">JoinTogether Admin</div>
        </div>

        <div className="auth-card" style={{ maxWidth: 420, width: '100%' }}>
          <h2>Đăng nhập Quản trị</h2>
          <p className="subtitle">Chỉ dành cho tài khoản có quyền quản trị hệ thống.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <input
              type="text"
              placeholder="Tên đăng nhập admin"
              {...register('tenDangNhap')}
              className={errors.tenDangNhap ? 'input-error' : ''}
            />
            {errors.tenDangNhap && (
              <p className="field-error">{errors.tenDangNhap.message}</p>
            )}

            <input
              type="password"
              placeholder="Mật khẩu"
              {...register('matKhau')}
              className={errors.matKhau ? 'input-error' : ''}
            />
            {errors.matKhau && <p className="field-error">{errors.matKhau.message}</p>}

            <button type="submit" className="primary-btn" disabled={isLoading}>
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập Admin'}
            </button>
          </form>

          <p style={{ marginTop: 18, fontSize: 13, textAlign: 'center', color: 'var(--text-light)' }}>
            <Link to="/login" style={{ color: 'var(--primary-700)' }}>
              ← Quay lại đăng nhập người dùng
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

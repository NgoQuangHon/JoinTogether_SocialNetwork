import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";
import TermsModal from "./TermsModal";

const loginSchema = z.object({
  tenDangNhap: z.string().min(1, "Vui lòng nhập email, số điện thoại hoặc tên đăng nhập"),
  matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
  dongYDieuKhoan: z.boolean().refine((val) => val === true, {
    message: "Bạn phải xác nhận đồng ý với Điều khoản dịch vụ để tiếp tục",
  }),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [termsTab, setTermsTab] = useState<'TERMS' | 'PRIVACY' | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      const { dongYDieuKhoan, ...payload } = data;
      await login(payload);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string, data?: { taiKhoanId?: number } } } };
      const msg =
        errObj?.response?.data?.message ||
        (err instanceof Error ? err.message : "Đăng nhập thất bại");
      setError(msg);

      const unverifiedId = errObj?.response?.data?.data?.taiKhoanId;
      if (unverifiedId) {
        setTimeout(() => {
          navigate(`/verify-email?taiKhoanId=${unverifiedId}`);
        }, 1500);
      }
    }
  };

  return (
    <div className="auth-card">
      <h2>Chào mừng trở lại!</h2>
      <p className="subtitle">
        Đăng nhập để tiếp tục hành trình cùng JoinTogether.
      </p>

      {error && (
        <div
          className="error-message"
          style={{
            background: error.includes("khóa vĩnh viễn") ? "#fef2f2" : undefined,
            color: error.includes("khóa vĩnh viễn") ? "#991b1b" : undefined,
            border: error.includes("khóa vĩnh viễn") ? "1.5px solid #fca5a5" : undefined,
            padding: "14px 16px",
            borderRadius: "12px",
            fontSize: "14px",
            fontWeight: error.includes("khóa vĩnh viễn") ? 700 : 500,
            lineHeight: 1.5,
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          {error.includes("khóa vĩnh viễn") && <div style={{ fontSize: 24, marginBottom: 4 }}>⛔</div>}
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Email / SĐT / Tên đăng nhập"
          {...register("tenDangNhap")}
          className={errors.tenDangNhap ? "input-error" : ""}
        />
        {errors.tenDangNhap && (
          <p className="field-error">{errors.tenDangNhap.message}</p>
        )}

        <input
          type="password"
          placeholder="Mật khẩu"
          {...register("matKhau")}
          className={errors.matKhau ? "input-error" : ""}
        />
        {errors.matKhau && (
          <p className="field-error">{errors.matKhau.message}</p>
        )}

        <div className="terms-checkbox-row" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, margin: '12px 0 16px', fontSize: 13, color: '#546e7a', textAlign: 'left' }}>
          <input
            type="checkbox"
            id="dongYDieuKhoanLogin"
            {...register("dongYDieuKhoan")}
            style={{ width: 16, height: 16, marginTop: 2, accentColor: '#6fbf73', cursor: 'pointer', flexShrink: 0 }}
          />
          <label htmlFor="dongYDieuKhoanLogin" style={{ cursor: 'pointer', lineHeight: 1.4 }}>
            Tôi đồng ý với <a href="#terms" onClick={(e) => { e.preventDefault(); setTermsTab('TERMS'); }} style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'underline' }}>Điều khoản dịch vụ</a> và <a href="#privacy" onClick={(e) => { e.preventDefault(); setTermsTab('PRIVACY'); }} style={{ color: '#2e7d32', fontWeight: 600, textDecoration: 'underline' }}>Chính sách bảo mật</a>.
          </label>
        </div>
        {errors.dongYDieuKhoan && (
          <p className="field-error" style={{ marginTop: -10, marginBottom: 12 }}>{errors.dongYDieuKhoan.message}</p>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '8px 0 16px', fontSize: 13 }}>
          <Link to="/forgot-password" className="forgot-link" style={{ margin: 0 }}>Quên mật khẩu?</Link>
          <Link to="/admin/login" style={{ color: '#16a34a', fontWeight: 600, textDecoration: 'underline' }}>🔐 Đăng nhập Quản trị</Link>
        </div>

        <button type="submit" className="primary-btn" disabled={isLoading}>
          {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <button className="google-btn" type="button">
        <img
          src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg"
          alt=""
        />
        Đăng nhập với Google
      </button>

      <button className="facebook-btn" type="button">
        Facebook
      </button>

      <div className="divider">
        <span>Hoặc</span>
      </div>

      <Link to="/register" className="outline-btn">
        Đăng ký tham gia JoinTogether
      </Link>

      <TermsModal
        isOpen={!!termsTab}
        onClose={() => setTermsTab(null)}
        defaultTab={termsTab || 'TERMS'}
      />
    </div>
  );
}

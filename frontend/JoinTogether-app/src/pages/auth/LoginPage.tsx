import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = z.object({
  tenDangNhap: z.string().min(1, "Vui lòng nhập email, số điện thoại hoặc tên đăng nhập"),
  matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

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
      await login(data);
      navigate("/dashboard", { replace: true });
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      const msg =
        errObj?.response?.data?.message ||
        (err instanceof Error ? err.message : "Đăng nhập thất bại");
      setError(msg);
    }
  };

  return (
    <div className="auth-card">
      <h2>Chào mừng trở lại!</h2>
      <p className="subtitle">
        Đăng nhập để tiếp tục hành trình cùng JoinTogether.
      </p>

      {error && <div className="error-message">{error}</div>}

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

        <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>

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
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "../../contexts/AuthContext";

const registerSchema = z
  .object({
    hoTen: z.string().min(1, "Vui lòng nhập họ tên"),
    email: z.string().email("Email không hợp lệ"),
    soDienThoai: z.string().optional(),
    tenDangNhap: z.string().min(3, "Tên đăng nhập phải có ít nhất 3 ký tự"),
    matKhau: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    xacNhanMatKhau: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.matKhau === data.xacNhanMatKhau, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["xacNhanMatKhau"],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: registerUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    try {
      const { xacNhanMatKhau, ...payload } = data;
      const res = await registerUser(payload);
      const taiKhoanId = (res as { data?: { taiKhoanId?: number } })?.data
        ?.taiKhoanId;
      if (taiKhoanId) {
        navigate(`/verify-email?taiKhoanId=${taiKhoanId}`, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      const msg =
        errObj?.response?.data?.message ||
        (err instanceof Error ? err.message : "Đăng ký thất bại");
      setError(msg);
    }
  };

  return (
    <div className="auth-card">
      <h2>Tạo tài khoản</h2>
      <p className="subtitle">Bắt đầu hành trình kết nối của bạn.</p>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          placeholder="Họ tên"
          {...register("hoTen")}
          className={errors.hoTen ? "input-error" : ""}
        />
        {errors.hoTen && <p className="field-error">{errors.hoTen.message}</p>}

        <input
          type="email"
          placeholder="Email"
          {...register("email")}
          className={errors.email ? "input-error" : ""}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}

        <input
          type="tel"
          placeholder="Số điện thoại"
          {...register("soDienThoai")}
          className={errors.soDienThoai ? "input-error" : ""}
        />
        {errors.soDienThoai && (
          <p className="field-error">{errors.soDienThoai.message}</p>
        )}

        <input
          type="text"
          placeholder="Tên đăng nhập"
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

        <input
          type="password"
          placeholder="Xác nhận mật khẩu"
          {...register("xacNhanMatKhau")}
          className={errors.xacNhanMatKhau ? "input-error" : ""}
        />
        {errors.xacNhanMatKhau && (
          <p className="field-error">{errors.xacNhanMatKhau.message}</p>
        )}

        <button type="submit" className="primary-btn" disabled={isLoading}>
          {isLoading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </button>
      </form>

      <div className="divider">
        <span>Hoặc</span>
      </div>

      <Link to="/login" className="outline-btn">
        Tôi đã có tài khoản
      </Link>
    </div>
  );
}

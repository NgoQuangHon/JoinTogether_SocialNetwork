export interface LoginRequest {
  tenDangNhap: string;
  matKhau: string;
}

export interface RegisterRequest {
  hoTen: string;
  email: string;
  soDienThoai?: string;
  tenDangNhap: string;
  matKhau: string;
}

export interface LoginResponseData {
  message: string;
  token: string;
  nguoiDungId: number;
  roles: string[];
  role: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface AuthState {
  token: string | null;
  nguoiDungId: number | null;
  roles: string[];
  role: string | null;
  isAuthenticated: boolean;
}

export interface ConnectionRequest {
  yeuCauKetNoiId: number;
  nguoiGuiId: number;
  nguoiGui?: string;
  nguoiNhanId: number;
  nguoiNhan?: string;
  loiNhan?: string | null;
  trangThai: string;
}

export interface ConnectionStatus {
  status: 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'CONNECTED';
  yeuCauId?: number;
}

export interface ThongBao {
  thongBaoId: number;
  nguoiNhanId: number;
  tieuDe?: string;
  noiDung?: string;
  loaiThongBao?: string;
  duongDan?: string;
}

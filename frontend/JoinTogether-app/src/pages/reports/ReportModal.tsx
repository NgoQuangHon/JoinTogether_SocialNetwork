import { useState, useEffect } from 'react';
import { createReportApi, getViolationTypesApi } from '../../services/report.service';
import type { LoaiViPham } from '../../types/report';
import './Report.css';

interface Props {
  open: boolean;
  onClose: () => void;
  nguoiBiBaoCaoId?: number;
  tenNguoiBiBaoCao?: string;
}

export default function ReportModal({
  open,
  onClose,
  nguoiBiBaoCaoId: initialId,
  tenNguoiBiBaoCao,
}: Props) {
  const [loaiList, setLoaiList] = useState<LoaiViPham[]>([]);
  const [nguoiBiBaoCaoId, setNguoiBiBaoCaoId] = useState(initialId?.toString() || '');
  const [loaiViPhamId, setLoaiViPhamId] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [bangChungUrl, setBangChungUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setNguoiBiBaoCaoId(initialId?.toString() || '');
      setMsg(null);
      loadTypes();
    }
  }, [open, initialId]);

  const loadTypes = async () => {
    try {
      const res = await getViolationTypesApi();
      if (res.success && res.data) setLoaiList(res.data);
    } catch {
      // Fallback mock if endpoint not available yet
      setLoaiList([
        { loaiViPhamId: 1, tenLoai: 'Spam / Quảng cáo', mucDo: 'Thấp' },
        { loaiViPhamId: 2, tenLoai: 'Nội dung không phù hợp', mucDo: 'Trung bình' },
        { loaiViPhamId: 3, tenLoai: 'Quấy rối / Bắt nạt', mucDo: 'Cao' },
        { loaiViPhamId: 4, tenLoai: 'Giả mạo danh tính', mucDo: 'Cao' },
        { loaiViPhamId: 5, tenLoai: 'Khác', mucDo: 'Thấp' },
      ]);
    }
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const targetId = parseInt(nguoiBiBaoCaoId, 10);
    const loaiId = parseInt(loaiViPhamId, 10);
    if (isNaN(targetId) || isNaN(loaiId)) {
      setMsg({ type: 'err', text: 'Vui lòng chọn loại vi phạm và ID người bị báo cáo.' });
      return;
    }
    setLoading(true);
    try {
      const bangChung = bangChungUrl
        ? [{ loaiBangChung: 'link', duongDan: bangChungUrl }]
        : undefined;
      const res = await createReportApi({
        nguoiBiBaoCaoId: targetId,
        loaiViPhamId: loaiId,
        noiDung: noiDung || undefined,
        bangChung,
      });
      if (res.success) {
        setMsg({ type: 'ok', text: 'Đã gửi báo cáo vi phạm. Cảm ơn bạn đã góp phần giữ cộng đồng an toàn!' });
        setTimeout(() => {
          onClose();
          setNoiDung('');
          setBangChungUrl('');
          setLoaiViPhamId('');
        }, 1800);
      } else {
        setMsg({ type: 'err', text: res.message || 'Gửi báo cáo thất bại.' });
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setMsg({ type: 'err', text: e?.response?.data?.message || 'Gửi báo cáo thất bại.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="report-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h2>🚩 Báo cáo vi phạm</h2>
          <button className="report-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {tenNguoiBiBaoCao && (
          <p className="report-target">
            Đang báo cáo: <strong>{tenNguoiBiBaoCao}</strong>
          </p>
        )}

        {msg && (
          <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'}>{msg.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          {!initialId && (
            <div className="form-row">
              <label>ID người bị báo cáo *</label>
              <input
                type="number"
                value={nguoiBiBaoCaoId}
                onChange={(e) => setNguoiBiBaoCaoId(e.target.value)}
                placeholder="Nhập ID người dùng"
                required
              />
            </div>
          )}

          <div className="form-row">
            <label>Loại vi phạm *</label>
            <select
              value={loaiViPhamId}
              onChange={(e) => setLoaiViPhamId(e.target.value)}
              required
            >
              <option value="">— Chọn loại —</option>
              {loaiList.map((l) => (
                <option key={l.loaiViPhamId} value={l.loaiViPhamId}>
                  {l.tenLoai}
                  {l.mucDo ? ` (${l.mucDo})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Mô tả chi tiết</label>
            <textarea
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Mô tả hành vi vi phạm..."
              rows={4}
            />
          </div>

          <div className="form-row">
            <label>Bằng chứng (URL ảnh / liên kết)</label>
            <input
              type="url"
              value={bangChungUrl}
              onChange={(e) => setBangChungUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="report-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: 'auto', flex: 1 }}>
              {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

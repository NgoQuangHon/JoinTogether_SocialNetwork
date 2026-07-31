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
  const [bangChungImage, setBangChungImage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (open) {
      setNguoiBiBaoCaoId(initialId?.toString() || '');
      setBangChungImage('');
      setNoiDung('');
      setLoaiViPhamId('');
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
        { loaiViPhamId: 1, tenLoai: 'Lừa đảo / Chiếm đoạt tài sản', mucDo: 'Rất Cao' },
        { loaiViPhamId: 2, tenLoai: 'Spam / Quảng cáo độc hại', mucDo: 'Trung bình' },
        { loaiViPhamId: 3, tenLoai: 'Nội dung không phù hợp / Đồi trụy', mucDo: 'Cao' },
        { loaiViPhamId: 4, tenLoai: 'Quấy rối / Bắt nạt / Đe dọa', mucDo: 'Cao' },
        { loaiViPhamId: 5, tenLoai: 'Giả mạo danh tính', mucDo: 'Cao' },
        { loaiViPhamId: 6, tenLoai: 'Khác', mucDo: 'Thấp' },
      ]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'err', text: 'Kích thước ảnh tối đa là 5MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBangChungImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const targetId = parseInt(nguoiBiBaoCaoId, 10);
    const loaiId = parseInt(loaiViPhamId, 10);
    if (isNaN(targetId) || isNaN(loaiId)) {
      setMsg({ type: 'err', text: 'Vui lòng chọn loại vi phạm và cung cấp ID đối tượng.' });
      return;
    }
    setLoading(true);
    try {
      const bangChung = bangChungImage
        ? [{ loaiBangChung: 'anh', duongDan: bangChungImage }]
        : undefined;

      const res = await createReportApi({
        nguoiBiBaoCaoId: targetId,
        loaiViPhamId: loaiId,
        noiDung: noiDung || undefined,
        bangChung,
      });

      if (res.success) {
        setMsg({ type: 'ok', text: 'Đã gửi báo cáo vi phạm. Cảm ơn bạn đã đóng góp bảo vệ cộng đồng!' });
        setTimeout(() => {
          onClose();
          setNoiDung('');
          setBangChungImage('');
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
          <h2>🚩 Báo cáo vi phạm & Lừa đảo</h2>
          <button className="report-close" onClick={onClose} type="button">
            ×
          </button>
        </div>

        {tenNguoiBiBaoCao ? (
          <div className="report-target" style={{ background: '#ffebee', color: '#c62828', padding: '10px 14px', borderRadius: 8, margin: '12px 0 16px', fontSize: 13.5, fontWeight: 600 }}>
            👤 Người bị báo cáo: <strong>{tenNguoiBiBaoCao}</strong>
          </div>
        ) : null}

        {msg && (
          <div className={msg.type === 'ok' ? 'alert-success' : 'alert-error'}>{msg.text}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label>Loại vi phạm / Hành vi lừa đảo *</label>
            <select
              className="report-select"
              value={loaiViPhamId}
              onChange={(e) => setLoaiViPhamId(e.target.value)}
              required
            >
              <option value="">— Chọn lý do vi phạm —</option>
              {loaiList.map((l) => (
                <option key={l.loaiViPhamId} value={l.loaiViPhamId}>
                  {l.tenLoai}
                  {l.mucDo ? ` (${l.mucDo})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <label>Mô tả chi tiết sự việc *</label>
            <textarea
              value={noiDung}
              onChange={(e) => setNoiDung(e.target.value)}
              placeholder="Cung cấp thêm chi tiết về hành vi vi phạm, tin nhắn lừa đảo hoặc dấu hiệu bất thường..."
              rows={4}
              required
            />
          </div>

          <div className="form-row">
            <label>Bằng chứng kèm theo (Ảnh chụp tin nhắn / Giao dịch)</label>
            <div className="custom-file-upload-zone">
              <input
                type="file"
                id="report-file-input"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              {!bangChungImage ? (
                <label htmlFor="report-file-input" className="file-upload-button-label">
                  <div className="upload-icon">📸</div>
                  <div className="upload-text">
                    <strong>Bấm vào đây để tải ảnh bằng chứng lên</strong>
                    <span>Hỗ trợ định dạng PNG, JPG, JPEG (Dung lượng tối đa 5MB)</span>
                  </div>
                </label>
              ) : (
                <div className="file-upload-preview-card">
                  <img src={bangChungImage} alt="Bằng chứng" className="preview-img" />
                  <div className="preview-info">
                    <span className="preview-title">✓ Ảnh bằng chứng đã chọn thành công</span>
                    <button
                      type="button"
                      onClick={() => setBangChungImage('')}
                      className="btn-remove-preview"
                    >
                      🗑️ Xóa ảnh & chọn lại
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="report-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-btn" disabled={loading} style={{ width: 'auto', flex: 1, background: '#d32f2f' }}>
              {loading ? 'Đang gửi báo cáo...' : 'Gửi báo cáo vi phạm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

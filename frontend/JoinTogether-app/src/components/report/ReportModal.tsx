import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { createReportApi, getViolationTypesApi } from '../../services/report.service';
import type { LoaiViPham } from '../../types/report';
import '../../pages/dashboard/CreateActivity.css';

interface ReportModalProps {
  nguoiBiBaoCaoId: number;
  tenNguoiBiBaoCao?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export default function ReportModal({
  nguoiBiBaoCaoId,
  tenNguoiBiBaoCao,
  onClose,
  onSuccess,
}: ReportModalProps) {
  const [violationTypes, setViolationTypes] = useState<LoaiViPham[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number | ''>('');
  const [noiDung, setNoiDung] = useState('');
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [evidencePreview, setEvidencePreview] = useState<string>('');
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    setLoadingTypes(true);
    getViolationTypesApi()
      .then((res) => {
        if (res.success && res.data) {
          setViolationTypes(res.data);
          if (res.data.length > 0) {
            setSelectedTypeId(res.data[0].loaiViPhamId);
          }
        }
      })
      .catch(() => setError('Không thể tải danh sách loại vi phạm.'))
      .finally(() => setLoadingTypes(false));
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError('');

    if (!file) {
      setEvidenceFile(null);
      setEvidencePreview('');
      return;
    }

    // Luồng 4b: Kiểm tra định dạng tệp đính kèm
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setError('Tệp bằng chứng không đúng định dạng. Chỉ hỗ trợ định dạng JPG, PNG, WebP, PDF.');
      return;
    }

    // Luồng 4b: Kiểm tra kích thước tệp (max 5MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Dung lượng tệp bằng chứng vượt quá giới hạn 5MB.');
      return;
    }

    setEvidenceFile(file);

    // Read base64 for upload/preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setEvidencePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    setError('');
    setSuccessMsg('');

    // Luồng 4a: Kiểm tra thiếu thông tin bắt buộc
    if (!selectedTypeId) {
      setError('Vui lòng chọn loại vi phạm.');
      return;
    }

    if (!noiDung.trim()) {
      setError('Vui lòng nhập nội dung mô tả chi tiết lý do báo cáo.');
      return;
    }

    setSubmitting(true);

    try {
      const bangChung = evidencePreview
        ? [
            {
              loaiBangChung: evidenceFile?.type.includes('pdf') ? 'TÀI_LIỆU' : 'HÌNH_ẢNH',
              duongDan: evidencePreview,
              kichThuoc: evidenceFile?.size,
            },
          ]
        : undefined;

      const res = await createReportApi({
        nguoiBiBaoCaoId,
        loaiViPhamId: Number(selectedTypeId),
        noiDung: noiDung.trim(),
        bangChung,
      });

      if (res.success) {
        setSuccessMsg('Hệ thống đã tiếp nhận báo cáo vi phạm của bạn! Ban quản trị sẽ tiến hành xác minh và phản hồi.');
        setTimeout(() => {
          onClose();
          onSuccess?.();
        }, 1800);
      } else {
        setError(res.message || 'Gửi báo cáo thất bại.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gửi báo cáo thất bại. Vui lòng kiểm tra lại thông tin.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose} style={{ zIndex: 1200 }}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="cam-header">
          <h2>🚩 Báo cáo vi phạm quy định</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          <p style={{ margin: '0 0 14px 0', fontSize: 14, color: '#37474f' }}>
            Đối tượng bị báo cáo: <strong style={{ color: '#d32f2f' }}>{tenNguoiBiBaoCao || `Người dùng #${nguoiBiBaoCaoId}`}</strong>
          </p>

          {successMsg && (
            <div style={{ padding: '12px 16px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 12, fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              ✅ {successMsg}
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', background: '#ffebee', color: '#c62828', borderRadius: 12, fontSize: 13, fontWeight: 500, marginBottom: 14 }}>
              ⚠️ {error}
            </div>
          )}

          {loadingTypes ? (
            <div style={{ textAlign: 'center', color: '#90a4ae', padding: 20 }}>Đang tải danh mục vi phạm...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Chọn loại vi phạm */}
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 6 }}>
                  1. Loại vi phạm <span style={{ color: '#f44336' }}>*</span>
                </label>
                <select
                  value={selectedTypeId}
                  onChange={(e) => setSelectedTypeId(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #cfd8dc',
                    fontSize: 14,
                    outline: 'none',
                  }}
                >
                  {violationTypes.map((vt) => (
                    <option key={vt.loaiViPhamId} value={vt.loaiViPhamId}>
                      {vt.tenLoai} {vt.mucDo ? `(${vt.mucDo})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mô tả chi tiết */}
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 6 }}>
                  2. Mô tả chi tiết hành vi vi phạm <span style={{ color: '#f44336' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  value={noiDung}
                  onChange={(e) => setNoiDung(e.target.value)}
                  placeholder="Mô tả cụ thể hành vi vi phạm (thời gian, nội dung tin nhắn, hành vi không đúng mực...)"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid #cfd8dc',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>

              {/* Tệp bằng chứng đính kèm */}
              <div>
                <label style={{ fontWeight: 600, fontSize: 13, color: '#37474f', display: 'block', marginBottom: 6 }}>
                  3. Đính kèm bằng chứng (Hình ảnh hoặc PDF, tối đa 5MB)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  style={{ fontSize: 13 }}
                />
                {evidenceFile && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#2e7d32', fontWeight: 500 }}>
                    📎 Đã chọn: {evidenceFile.name} ({(evidenceFile.size / 1024).toFixed(1)} KB)
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
                <button className="cam-btn-outline" onClick={onClose}>
                  Hủy
                </button>
                <button
                  className="save-btn"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedTypeId || !noiDung.trim()}
                  style={{ borderRadius: 20, padding: '10px 24px', background: '#d32f2f' }}
                >
                  {submitting ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

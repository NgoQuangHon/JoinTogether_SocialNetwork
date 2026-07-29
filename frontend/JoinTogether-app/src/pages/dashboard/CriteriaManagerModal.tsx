import { useState, useEffect } from 'react';
import {
  getCriteriaByActivityApi,
  addCriteriaApi,
  updateCriteriaApi,
  deleteCriteriaApi,
} from '../../services/activity.service';
import type { TieuChiThamGia } from '../../types/activity';
import './CreateActivity.css';

interface CriteriaManagerModalProps {
  hoatDongId: number;
  onClose: () => void;
}

const PRESET_CRITERIA = [
  { tenTieuChi: 'Độ tuổi tham gia', giaTriYeuCau: 'Từ 18 đến 35 tuổi', batBuoc: true },
  { tenTieuChi: 'Phương tiện di chuyển', giaTriYeuCau: 'Tự túc xe máy hoặc ô tô', batBuoc: false },
  { tenTieuChi: 'Trang phục & Dụng cụ', giaTriYeuCau: 'Giày thể thao, quần áo thoải mái', batBuoc: true },
  { tenTieuChi: 'Cam kết thời gian', giaTriYeuCau: 'Có mặt trước 15 phút, tham gia trọn vẹn', batBuoc: true },
  { tenTieuChi: 'Kênh liên lạc', giaTriYeuCau: 'Có sử dụng Zalo/SĐT để vào nhóm chat', batBuoc: false },
];

export default function CriteriaManagerModal({
  hoatDongId,
  onClose,
}: CriteriaManagerModalProps) {
  const [criteriaList, setCriteriaList] = useState<TieuChiThamGia[]>([]);
  const [editingCriteria, setEditingCriteria] = useState<TieuChiThamGia | null>(null);

  const [tenTieuChi, setTenTieuChi] = useState('');
  const [giaTriYeuCau, setGiaTriYeuCau] = useState('');
  const [batBuoc, setBatBuoc] = useState(true);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCriteria = () => {
    setLoading(true);
    setError('');
    getCriteriaByActivityApi(hoatDongId)
      .then((res) => {
        if (res.success && res.data) {
          setCriteriaList(res.data);
        }
      })
      .catch(() => setError('Không thể tải danh sách tiêu chí.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCriteria();
  }, [hoatDongId]);

  const resetForm = () => {
    setEditingCriteria(null);
    setTenTieuChi('');
    setGiaTriYeuCau('');
    setBatBuoc(true);
    setError('');
  };

  const handleStartEdit = (c: TieuChiThamGia) => {
    setEditingCriteria(c);
    setTenTieuChi(c.tenTieuChi);
    setGiaTriYeuCau(c.giaTriYeuCau || '');
    setBatBuoc(c.batBuoc ?? true);
    setError('');
    setSuccessMsg('');
  };

  const handleApplyPreset = (preset: { tenTieuChi: string; giaTriYeuCau: string; batBuoc: boolean }) => {
    setEditingCriteria(null);
    setTenTieuChi(preset.tenTieuChi);
    setGiaTriYeuCau(preset.giaTriYeuCau);
    setBatBuoc(preset.batBuoc);
    setError('');
  };

  const handleSubmit = async () => {
    if (!tenTieuChi.trim()) {
      setError('Vui lòng nhập tên tiêu chí.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        tenTieuChi: tenTieuChi.trim(),
        giaTriYeuCau: giaTriYeuCau.trim() || undefined,
        batBuoc,
      };

      if (editingCriteria) {
        const res = await updateCriteriaApi(editingCriteria.tieuChiId, payload);
        if (res.success) {
          setSuccessMsg('Đã cập nhật tiêu chí thành công!');
          resetForm();
          loadCriteria();
        } else {
          setError(res.message || 'Cập nhật tiêu chí thất bại.');
        }
      } else {
        const res = await addCriteriaApi(hoatDongId, payload);
        if (res.success) {
          setSuccessMsg('Đã thêm tiêu chí mới!');
          resetForm();
          loadCriteria();
        } else {
          setError(res.message || 'Thêm tiêu chí thất bại.');
        }
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể lưu tiêu chí. Vui lòng kiểm tra lại.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tiêu chí "${name}"?`)) return;
    setError('');
    setSuccessMsg('');
    try {
      const res = await deleteCriteriaApi(id);
      if (res.success) {
        setSuccessMsg('Đã xóa tiêu chí!');
        if (editingCriteria?.tieuChiId === id) {
          resetForm();
        }
        loadCriteria();
      } else {
        setError(res.message || 'Xóa tiêu chí thất bại.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Xóa tiêu chí thất bại.';
      setError(msg);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose} style={{ zIndex: 1150 }}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 680 }}>
        <div className="cam-header">
          <h2>🎯 Quản lý tiêu chí tham gia hoạt động</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {successMsg && (
            <div style={{ padding: '10px 14px', background: '#e8f5e9', color: '#2e7d32', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              ✅ {successMsg}
            </div>
          )}

          {error && (
            <div style={{ padding: '10px 14px', background: '#ffebee', color: '#c62828', borderRadius: 10, fontSize: 13, fontWeight: 500, marginBottom: 12 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Danh sách tiêu chí hiện có */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: 14, color: '#37474f', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📋 Danh sách tiêu chí hiện có ({criteriaList.length})</span>
              {loading && <span style={{ fontSize: 12, color: '#78909c' }}>Đang tải...</span>}
            </h4>

            {criteriaList.length === 0 && !loading ? (
              <div style={{ padding: 20, background: '#f7f9f8', borderRadius: 12, textAlign: 'center', color: '#78909c', fontSize: 13 }}>
                Hoạt động này chưa thiết lập tiêu chí tham gia nào. Chọn mẫu gợi ý hoặc tạo mới bên dưới!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 220, overflowY: 'auto' }}>
                {criteriaList.map((c) => {
                  const isBeingEdited = editingCriteria?.tieuChiId === c.tieuChiId;
                  return (
                    <div
                      key={c.tieuChiId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        borderRadius: 12,
                        border: isBeingEdited ? '2px solid #2e7d32' : '1px solid #e0e0e0',
                        background: isBeingEdited ? '#f1f8e9' : '#ffffff',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <strong style={{ fontSize: 14, color: '#263238' }}>{c.tenTieuChi}</strong>
                          {c.batBuoc ? (
                            <span style={{ fontSize: 11, background: '#ffebee', color: '#c62828', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                              🔴 Bắt buộc
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                              🟢 Tùy chọn
                            </span>
                          )}
                        </div>
                        {c.giaTriYeuCau && (
                          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#546e7a' }}>
                            Yêu cầu: <span>{c.giaTriYeuCau}</span>
                          </p>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          className="cam-btn-outline"
                          onClick={() => handleStartEdit(c)}
                          style={{ padding: '5px 12px', fontSize: 12, borderRadius: 14 }}
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          type="button"
                          className="cam-btn-outline"
                          onClick={() => handleDelete(c.tieuChiId, c.tenTieuChi)}
                          style={{ padding: '5px 12px', fontSize: 12, borderRadius: 14, color: '#d32f2f', borderColor: '#ffcdd2' }}
                        >
                          🗑️ Xóa
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Form thêm mới / chỉnh sửa */}
          <div style={{ background: editingCriteria ? '#fff8e1' : '#f7f9f8', padding: 18, borderRadius: 16, border: editingCriteria ? '1px solid #ffe0b2' : '1px solid #e4ece6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: editingCriteria ? '#e65100' : '#2e7d32', fontWeight: 700 }}>
                {editingCriteria ? `✏️ Đang chỉnh sửa tiêu chí #${editingCriteria.tieuChiId}` : '➕ Thêm tiêu chí mới'}
              </h4>
              {editingCriteria && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{ background: 'none', border: 'none', color: '#e65100', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Hủy chỉnh sửa
                </button>
              )}
            </div>

            {/* Mẫu tiêu chí gợi ý có sẵn */}
            {!editingCriteria && (
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, color: '#78909c', display: 'block', marginBottom: 6, fontWeight: 600 }}>
                  💡 Gợi ý mẫu nhanh:
                </span>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRESET_CRITERIA.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 14,
                        border: '1px solid #cfd8dc',
                        background: '#ffffff',
                        fontSize: 12,
                        color: '#37474f',
                        cursor: 'pointer',
                      }}
                    >
                      + {p.tenTieuChi}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontWeight: 600, fontSize: 12, color: '#37474f', display: 'block', marginBottom: 4 }}>
                  Tên tiêu chí <span style={{ color: '#f44336' }}>*</span>
                </label>
                <input
                  type="text"
                  value={tenTieuChi}
                  onChange={(e) => setTenTieuChi(e.target.value)}
                  placeholder="VD: Độ tuổi, Kinh nghiệm, Trang phục..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #cfd8dc',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontWeight: 600, fontSize: 12, color: '#37474f', display: 'block', marginBottom: 4 }}>
                  Giá trị / Chi tiết yêu cầu
                </label>
                <input
                  type="text"
                  value={giaTriYeuCau}
                  onChange={(e) => setGiaTriYeuCau(e.target.value)}
                  placeholder="VD: 18 - 30 tuổi, Xe máy cá nhân, Đúng giờ..."
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #cfd8dc',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  id="chkBatBuoc"
                  checked={batBuoc}
                  onChange={(e) => setBatBuoc(e.target.checked)}
                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                />
                <label htmlFor="chkBatBuoc" style={{ fontSize: 13, color: '#37474f', cursor: 'pointer', fontWeight: 600 }}>
                  Tiêu chí bắt buộc (Thành viên phải đáp ứng)
                </label>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                {editingCriteria && (
                  <button type="button" className="cam-btn-outline" onClick={resetForm} style={{ padding: '8px 16px', fontSize: 13 }}>
                    Hủy
                  </button>
                )}
                <button
                  type="button"
                  className="save-btn"
                  onClick={handleSubmit}
                  disabled={saving || !tenTieuChi.trim()}
                  style={{ padding: '8px 20px', fontSize: 13, borderRadius: 18 }}
                >
                  {saving ? 'Đang lưu...' : editingCriteria ? 'Lưu cập nhật' : 'Thêm tiêu chí'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

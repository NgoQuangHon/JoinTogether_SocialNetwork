import { useState, useEffect } from 'react';
import { getCriteriaByActivityApi, addCriteriaApi, updateCriteriaApi, deleteCriteriaApi } from '../../services/activity.service';
import type { TieuChiThamGia } from '../../types/activity';
import './CreateActivity.css';

interface FormData {
  tenTieuChi: string;
  giaTriYeuCau: string;
  batBuoc: boolean;
}

const initForm = (c?: TieuChiThamGia): FormData => ({
  tenTieuChi: c?.tenTieuChi || '',
  giaTriYeuCau: c?.giaTriYeuCau || '',
  batBuoc: c?.batBuoc || false,
});

export default function CriteriaManagerModal({
  hoatDongId,
  onClose,
}: {
  hoatDongId: number;
  onClose: () => void;
}) {
  const [criteriaList, setCriteriaList] = useState<TieuChiThamGia[]>([]);
  const [editing, setEditing] = useState<TieuChiThamGia | null>(null);
  const [form, setForm] = useState<FormData>(initForm());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = () => {
    setLoading(true);
    setError('');
    getCriteriaByActivityApi(hoatDongId)
      .then((res) => { if (res.success && res.data) setCriteriaList(res.data); })
      .catch(() => setError('Không thể tải danh sách tiêu chí.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [hoatDongId]);

  const resetForm = () => { setEditing(null); setForm(initForm()); setError(''); };

  const startEdit = (c: TieuChiThamGia) => {
    setEditing(c);
    setForm(initForm(c));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.tenTieuChi.trim()) { setError('Tên tiêu chí không được để trống.'); return; }
    if (form.batBuoc && !form.giaTriYeuCau.trim()) { setError('Tiêu chí bắt buộc phải có giá trị yêu cầu.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        tenTieuChi: form.tenTieuChi.trim(),
        giaTriYeuCau: form.giaTriYeuCau.trim() || undefined,
        batBuoc: form.batBuoc,
      };
      if (editing) {
        const res = await updateCriteriaApi(editing.tieuChiId, payload);
        if (!res.success) { setError(res.message || 'Cập nhật thất bại.'); return; }
      } else {
        const res = await addCriteriaApi(hoatDongId, payload);
        if (!res.success) { setError(res.message || 'Thêm thất bại.'); return; }
      }
      resetForm();
      fetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi hệ thống.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Xóa tiêu chí này?')) return;
    try {
      const res = await deleteCriteriaApi(id);
      if (!res.success) { setError(res.message || 'Xóa thất bại.'); return; }
      fetch();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi hệ thống.';
      setError(msg);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 650 }}>
        <div className="cam-header">
          <h2>Quản lý tiêu chí tham gia</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="cam-error">{error}</div>}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#888' }}>Đang tải...</p>
        ) : (
          <>
            {criteriaList.length === 0 && !editing && (
              <p style={{ textAlign: 'center', color: '#888', margin: '20px 0' }}>
                Chưa có tiêu chí nào.
              </p>
            )}

            {criteriaList.map((c) => (
              <div key={c.tieuChiId} className="cam-criteria-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <strong>{c.tenTieuChi}</strong>
                  {c.giaTriYeuCau && <span style={{ marginLeft: 8, color: '#666' }}>— {c.giaTriYeuCau}</span>}
                  {c.batBuoc && <span style={{ marginLeft: 8, color: '#e53935', fontSize: 12 }}>(Bắt buộc)</span>}
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="cam-btn-small" onClick={() => startEdit(c)}>Sửa</button>
                  <button className="cam-btn-small cam-btn-danger" style={{ background: '#e53935', color: '#fff' }} onClick={() => handleDelete(c.tieuChiId)}>Xóa</button>
                </div>
              </div>
            ))}

            <div style={{ marginTop: 20, padding: 16, background: '#f9f9f9', borderRadius: 8 }}>
              <h4 style={{ margin: '0 0 12px' }}>{editing ? 'Chỉnh sửa tiêu chí' : 'Thêm tiêu chí mới'}</h4>
              <div className="cam-field">
                <label>Tên tiêu chí <span className="req">*</span></label>
                <input type="text" value={form.tenTieuChi} onChange={(e) => setForm((p) => ({ ...p, tenTieuChi: e.target.value }))} placeholder="VD: Có kinh nghiệm chụp ảnh" />
              </div>
              <div className="cam-field">
                <label>Giá trị yêu cầu {form.batBuoc && <span className="req">*</span>}</label>
                <input type="text" value={form.giaTriYeuCau} onChange={(e) => setForm((p) => ({ ...p, giaTriYeuCau: e.target.value }))} placeholder="VD: Tối thiểu 2 năm" />
              </div>
              <div className="cam-field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" id="batBuoc" checked={form.batBuoc} onChange={(e) => setForm((p) => ({ ...p, batBuoc: e.target.checked }))} />
                <label htmlFor="batBuoc" style={{ margin: 0 }}>Bắt buộc</label>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="cam-btn-primary" disabled={saving} onClick={handleSubmit}>
                  {saving ? 'Đang lưu...' : editing ? 'Cập nhật' : 'Thêm'}
                </button>
                {editing && (
                  <button className="cam-btn-outline" onClick={resetForm}>Hủy</button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

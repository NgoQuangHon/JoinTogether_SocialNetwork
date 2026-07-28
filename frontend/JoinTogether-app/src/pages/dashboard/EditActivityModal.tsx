import { useState } from 'react';
import { updateActivityApi } from '../../services/activity.service';
import type { HoatDongResponse } from '../../types/activity';
import './CreateActivity.css';

export default function EditActivityModal({
  activity,
  onClose,
  onSaved,
}: {
  activity: HoatDongResponse;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    tenHoatDong: activity.tenHoatDong || '',
    moTa: activity.moTa || '',
    soLuongToiDa: activity.soLuongToiDa?.toString() || '',
    doTuoiTu: activity.doTuoiTu?.toString() || '',
    doTuoiDen: activity.doTuoiDen?.toString() || '',
    gioiTinhPhuHop: activity.gioiTinhPhuHop || '',
    mucDoKinhNghiem: activity.mucDoKinhNghiem || '',
    yeuCauKhac: activity.yeuCauKhac || '',
    noiQuyChung: activity.noiQuyChung || '',
    luuYDatBiet: activity.luuYDatBiet || '',
    doDungCanMang: activity.doDungCanMang || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const set = (key: keyof typeof form, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const addDoDung = (tag: string) => {
    const current = form.doDungCanMang ? form.doDungCanMang.split(',').map((t) => t.trim()).filter(Boolean) : [];
    if (!current.includes(tag)) {
      current.push(tag);
      set('doDungCanMang', current.join(', '));
    }
    setTagInput('');
  };
  const removeDoDung = (tag: string) => {
    const current = form.doDungCanMang ? form.doDungCanMang.split(',').map((t) => t.trim()).filter(Boolean) : [];
    set('doDungCanMang', current.filter((t) => t !== tag).join(', '));
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const payload: any = {
        tenHoatDong: form.tenHoatDong,
        moTa: form.moTa || undefined,
        soLuongToiDa: form.soLuongToiDa ? Number(form.soLuongToiDa) : undefined,
        doTuoiTu: form.doTuoiTu ? Number(form.doTuoiTu) : undefined,
        doTuoiDen: form.doTuoiDen ? Number(form.doTuoiDen) : undefined,
        gioiTinhPhuHop: form.gioiTinhPhuHop || undefined,
        mucDoKinhNghiem: form.mucDoKinhNghiem || undefined,
        yeuCauKhac: form.yeuCauKhac || undefined,
        noiQuyChung: form.noiQuyChung || undefined,
        luuYDatBiet: form.luuYDatBiet || undefined,
        doDungCanMang: form.doDungCanMang || undefined,
      };
      const res = await updateActivityApi(activity.hoatDongId, payload);
      if (res.success) {
        onSaved();
      } else {
        setError(res.message || 'Cập nhật thất bại.');
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Lỗi hệ thống.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cam-header">
          <h2>Chỉnh sửa hoạt động</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="cam-error">{error}</div>}

        <div className="cam-step-content">
          <div className="cam-field">
            <label>Tên hoạt động</label>
            <input type="text" value={form.tenHoatDong} onChange={(e) => set('tenHoatDong', e.target.value)} />
          </div>
          <div className="cam-field">
            <label>Số lượng tối đa</label>
            <input type="number" min={1} value={form.soLuongToiDa} onChange={(e) => set('soLuongToiDa', e.target.value)} />
          </div>
          <div className="cam-row">
            <div className="cam-field">
              <label>Độ tuổi từ</label>
              <input type="number" min={1} value={form.doTuoiTu} onChange={(e) => set('doTuoiTu', e.target.value)} />
            </div>
            <div className="cam-field">
              <label>Đến</label>
              <input type="number" min={1} value={form.doTuoiDen} onChange={(e) => set('doTuoiDen', e.target.value)} />
            </div>
          </div>
          <div className="cam-field">
            <label>Giới tính phù hợp</label>
            <select value={form.gioiTinhPhuHop} onChange={(e) => set('gioiTinhPhuHop', e.target.value)}>
              <option value="">Tất cả</option>
              <option value="nam">Nam</option>
              <option value="nu">Nữ</option>
            </select>
          </div>
          <div className="cam-field">
            <label>Mức độ kinh nghiệm</label>
            <select value={form.mucDoKinhNghiem} onChange={(e) => set('mucDoKinhNghiem', e.target.value)}>
              <option value="">Mọi cấp độ</option>
              <option value="nhieu">Nhiều kinh nghiệm</option>
              <option value="it">Ít kinh nghiệm</option>
            </select>
          </div>
          <div className="cam-field">
            <label>Yêu cầu khác</label>
            <textarea rows={2} value={form.yeuCauKhac} onChange={(e) => set('yeuCauKhac', e.target.value)} />
          </div>
          <div className="cam-field">
            <label>Mô tả</label>
            <textarea rows={4} value={form.moTa} onChange={(e) => set('moTa', e.target.value)} />
          </div>
          <div className="cam-field">
            <label>Nội quy</label>
            <textarea rows={2} value={form.noiQuyChung} onChange={(e) => set('noiQuyChung', e.target.value)} />
          </div>
          <div className="cam-field">
            <label>Lưu ý đặc biệt</label>
            <textarea rows={2} value={form.luuYDatBiet} onChange={(e) => set('luuYDatBiet', e.target.value)} />
          </div>
          <div className="cam-field">
            <label>Đồ dùng cần mang</label>
            <div className="cam-tags">
              {(form.doDungCanMang ? form.doDungCanMang.split(',').map((t) => t.trim()).filter(Boolean) : []).map((tag) => (
                <span key={tag} className="cam-tag">
                  {tag}
                  <button className="cam-tag-remove" onClick={() => removeDoDung(tag)}>✕</button>
                </span>
              ))}
            </div>
            <div className="cam-tag-input">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Nhập đồ dùng..." onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (tagInput.trim()) addDoDung(tagInput.trim()); } }} />
              <button className="cam-btn-small" onClick={() => { if (tagInput.trim()) addDoDung(tagInput.trim()); }}>Thêm</button>
            </div>
          </div>
          <div className="cam-nav">
            <button className="cam-btn-outline" onClick={onClose}>Hủy</button>
            <button className="cam-btn-primary" disabled={saving} onClick={handleSubmit}>
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

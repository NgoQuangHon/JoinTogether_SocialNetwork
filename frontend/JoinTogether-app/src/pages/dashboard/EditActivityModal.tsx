import { useState, useEffect, useRef } from 'react';
import { updateActivityApi, getCategoriesApi } from '../../services/activity.service';
import type { HoatDongResponse, DanhMucHoatDong } from '../../types/activity';
import './CreateActivity.css';

const GIOI_TINH_OPTIONS = [
  { value: '', label: 'Tất cả' },
  { value: 'nam', label: 'Nam' },
  { value: 'nu', label: 'Nữ' },
];

const KINH_NGHIEM_OPTIONS = [
  { value: '', label: 'Mọi cấp độ' },
  { value: 'nhieu', label: 'Nhiều kinh nghiệm' },
  { value: 'it', label: 'Ít kinh nghiệm' },
];

const toLocalDatetime = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

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
    danhMucHoatDongId: activity.danhMucHoatDongId || 0,
    moTa: activity.moTa || '',
    hinhThuc: activity.hinhThuc || 'offline',
    thoiGianBatDau: toLocalDatetime(activity.thoiGianBatDau),
    thoiGianKetThuc: toLocalDatetime(activity.thoiGianKetThuc),
    hanDangKy: toLocalDatetime(activity.hanDangKy),
    tenDiaDiem: activity.tenDiaDiem || '',
    diaChi: activity.diaChi || '',
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
  const [images, setImages] = useState<string[]>(
    activity.hinhAnh?.filter((h) => !h.laAnhDaiDien).map((h) => h.duongDan) || []
  );
  const [thumbnail, setThumbnail] = useState(activity.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan || '');
  const [danhMucList, setDanhMucList] = useState<DanhMucHoatDong[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [buoc, setBuoc] = useState(1);
  const [tagInput, setTagInput] = useState('');
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategoriesApi()
      .then((res) => { if (res.success && res.data) setDanhMucList(res.data); })
      .catch(() => {});
  }, []);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 5 * 1024 * 1024;

  const compressImage = (file: File, maxDim = 1920, quality = 0.7): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Chỉ chấp nhận ảnh JPG, PNG, WebP hoặc GIF.';
    }
    if (file.size > MAX_SIZE) {
      return 'Kích thước ảnh tối đa là 5MB.';
    }
    return null;
  };

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const err = validateFile(file);
      if (err) { setError(err); return; }
      setThumbnail(await compressImage(file));
    }
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const err = validateFile(f);
      if (err) { setError(err); return; }
    }
    const remaining = 5 - images.length;
    const toAdd = files.slice(0, remaining);
    const b64s = await Promise.all(toAdd.map((f) => compressImage(f)));
    setImages((prev) => [...prev, ...b64s]);
    e.target.value = '';
  };

  const removeImage = (i: number) => setImages((prev) => prev.filter((_, idx) => idx !== i));

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
        danhMucHoatDongId: form.danhMucHoatDongId || undefined,
        moTa: form.moTa || undefined,
        thumbnail: thumbnail || undefined,
        hinhThuc: form.hinhThuc || undefined,
        thoiGianBatDau: form.thoiGianBatDau ? new Date(form.thoiGianBatDau).toISOString() : undefined,
        thoiGianKetThuc: form.thoiGianKetThuc ? new Date(form.thoiGianKetThuc).toISOString() : undefined,
        hanDangKy: form.hanDangKy ? new Date(form.hanDangKy).toISOString() : undefined,
        tenDiaDiem: form.tenDiaDiem || undefined,
        diaChi: form.diaChi || undefined,
        soLuongToiDa: form.soLuongToiDa ? Number(form.soLuongToiDa) : undefined,
        doTuoiTu: form.doTuoiTu ? Number(form.doTuoiTu) : undefined,
        doTuoiDen: form.doTuoiDen ? Number(form.doTuoiDen) : undefined,
        gioiTinhPhuHop: form.gioiTinhPhuHop || undefined,
        mucDoKinhNghiem: form.mucDoKinhNghiem || undefined,
        yeuCauKhac: form.yeuCauKhac || undefined,
        hinhAnh: images.length > 0 ? images : undefined,
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

  const canStep1 = form.tenHoatDong.trim().length > 0 && form.danhMucHoatDongId > 0 && form.moTa.trim().length > 0;
  const canStep2 = form.thoiGianBatDau && form.thoiGianKetThuc && form.tenDiaDiem.trim().length > 0;
  const canStep3 = form.soLuongToiDa !== '' && Number(form.soLuongToiDa) > 0;

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cam-header">
          <h2>Chỉnh sửa hoạt động</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="cam-error">{error}</div>}

        {buoc === 1 && (
          <div className="cam-step-content">
            <div className="cam-field">
              <label>Tên hoạt động <span className="required">*</span></label>
              <input type="text" value={form.tenHoatDong} onChange={(e) => set('tenHoatDong', e.target.value)} placeholder="Ví dụ: Giao lưu bóng rổ cuối tuần" />
            </div>
            <div className="cam-field">
              <label>Danh mục <span className="required">*</span></label>
              <select value={form.danhMucHoatDongId} onChange={(e) => set('danhMucHoatDongId', Number(e.target.value))}>
                <option value={0}>-- Chọn danh mục --</option>
                {danhMucList.map((dm) => (
                  <option key={dm.danhMucHoatDongId} value={dm.danhMucHoatDongId}>{dm.tenDanhMuc}</option>
                ))}
              </select>
            </div>
            <div className="cam-field">
              <label>Mô tả <span className="required">*</span></label>
              <textarea rows={4} value={form.moTa} onChange={(e) => set('moTa', e.target.value)} placeholder="Mô tả về hoạt động của bạn..." />
            </div>
            <div className="cam-field">
              <label>Ảnh đại diện</label>
              <div className="cam-thumb-upload">
                {thumbnail ? (
                  <div className="cam-thumb-preview">
                    <img src={thumbnail} alt="thumbnail" />
                    <button type="button" className="cam-remove-img" onClick={() => setThumbnail('')}>✕</button>
                  </div>
                ) : (
                  <button type="button" className="cam-upload-btn" onClick={() => thumbInputRef.current?.click()}>
                    Chọn ảnh đại diện
                  </button>
                )}
                <input ref={thumbInputRef} type="file" accept="image/*" hidden onChange={handleThumbnailChange} />
              </div>
            </div>
            <div className="cam-nav">
              <button className="cam-btn-outline" onClick={onClose}>Hủy</button>
              <button className="cam-btn-primary" disabled={!canStep1} onClick={() => setBuoc(2)}>Tiếp theo</button>
            </div>
          </div>
        )}

        {buoc === 2 && (
          <div className="cam-step-content">
            <div className="cam-field">
              <label>Hình thức <span className="required">*</span></label>
              <div className="cam-radio-group">
                <label className="cam-radio">
                  <input type="radio" name="editHinhThuc" value="offline" checked={form.hinhThuc === 'offline'} onChange={(e) => set('hinhThuc', e.target.value)} />
                  Offline
                </label>
                <label className="cam-radio">
                  <input type="radio" name="editHinhThuc" value="online" checked={form.hinhThuc === 'online'} onChange={(e) => set('hinhThuc', e.target.value)} />
                  Online
                </label>
              </div>
            </div>
            <div className="cam-field">
              <label>Thời gian bắt đầu <span className="required">*</span></label>
              <input type="datetime-local" value={form.thoiGianBatDau} onChange={(e) => set('thoiGianBatDau', e.target.value)} />
            </div>
            <div className="cam-field">
              <label>Thời gian kết thúc <span className="required">*</span></label>
              <input type="datetime-local" value={form.thoiGianKetThuc} onChange={(e) => set('thoiGianKetThuc', e.target.value)} />
            </div>
            <div className="cam-field">
              <label>Hạn đăng ký</label>
              <input type="datetime-local" value={form.hanDangKy} onChange={(e) => set('hanDangKy', e.target.value)} />
            </div>
            <div className="cam-field">
              <label>Địa điểm <span className="required">*</span></label>
              <input type="text" value={form.tenDiaDiem} onChange={(e) => set('tenDiaDiem', e.target.value)} placeholder="Tên địa điểm" />
            </div>
            <div className="cam-field">
              <label>Địa chỉ</label>
              <input type="text" value={form.diaChi} onChange={(e) => set('diaChi', e.target.value)} placeholder="Số nhà, đường, thành phố" />
            </div>
            <div className="cam-nav">
              <button className="cam-btn-outline" onClick={() => setBuoc(1)}>Quay lại</button>
              <button className="cam-btn-primary" disabled={!canStep2} onClick={() => setBuoc(3)}>Tiếp theo</button>
            </div>
          </div>
        )}

        {buoc === 3 && (
          <div className="cam-step-content">
            <div className="cam-field">
              <label>Số lượng tối đa <span className="required">*</span></label>
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
                {GIOI_TINH_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="cam-field">
              <label>Mức độ kinh nghiệm</label>
              <select value={form.mucDoKinhNghiem} onChange={(e) => set('mucDoKinhNghiem', e.target.value)}>
                {KINH_NGHIEM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="cam-field">
              <label>Yêu cầu khác</label>
              <textarea rows={2} value={form.yeuCauKhac} onChange={(e) => set('yeuCauKhac', e.target.value)} placeholder="Ví dụ: Có xe di chuyển riêng..." />
            </div>
            <div className="cam-nav">
              <button className="cam-btn-outline" onClick={() => setBuoc(2)}>Quay lại</button>
              <button className="cam-btn-primary" disabled={!canStep3} onClick={() => setBuoc(4)}>Tiếp theo</button>
            </div>
          </div>
        )}

        {buoc === 4 && (
          <div className="cam-step-content">
            <div className="cam-field">
              <label>Nội quy</label>
              <textarea rows={2} value={form.noiQuyChung} onChange={(e) => set('noiQuyChung', e.target.value)} placeholder="Nội quy hoạt động..." />
            </div>
            <div className="cam-field">
              <label>Lưu ý đặc biệt</label>
              <textarea rows={2} value={form.luuYDatBiet} onChange={(e) => set('luuYDatBiet', e.target.value)} placeholder="Lưu ý cho người tham gia..." />
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
            <div className="cam-field">
              <label>Hình ảnh bổ sung (tối đa 5 ảnh)</label>
              <div className="cam-images-upload">
                {images.map((b64, i) => (
                  <div key={i} className="cam-image-item">
                    <img src={b64} alt={`Ảnh ${i + 1}`} />
                    <button type="button" className="cam-remove-img" onClick={() => removeImage(i)}>✕</button>
                  </div>
                ))}
                {images.length < 5 && (
                  <button type="button" className="cam-upload-btn" onClick={() => imageInputRef.current?.click()}>
                    + Thêm ảnh
                  </button>
                )}
                <input ref={imageInputRef} type="file" accept="image/*" multiple hidden onChange={handleImagesChange} />
              </div>
            </div>
            <div className="cam-nav">
              <button className="cam-btn-outline" onClick={() => setBuoc(3)}>Quay lại</button>
              <button className="cam-btn-primary" disabled={saving} onClick={handleSubmit}>
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

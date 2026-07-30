import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createActivityApi, getCategoriesApi } from '../../services/activity.service';
import type { DanhMucHoatDong, HoatDongResponse } from '../../types/activity';
import './CreateActivity.css';

interface FormData {
  tenHoatDong: string;
  danhMucHoatDongId: number;
  moTa: string;
  thumbnail: string;
  hinhThuc: string;
  thoiGianBatDau: string;
  thoiGianKetThuc: string;
  hanDangKy: string;
  tenDiaDiem: string;
  diaChi: string;
  soLuongToiDa: number | '';
  doTuoiTu: number | '';
  doTuoiDen: number | '';
  gioiTinhPhuHop: string;
  mucDoKinhNghiem: string;
  yeuCauKhac: string;
  hinhAnh: string[];
  noiQuyChung: string;
  luuYDatBiet: string;
  doDungCanMang: string;
}

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

const initialForm: FormData = {
  tenHoatDong: '',
  danhMucHoatDongId: 0,
  moTa: '',
  thumbnail: '',
  hinhThuc: 'offline',
  thoiGianBatDau: '',
  thoiGianKetThuc: '',
  hanDangKy: '',
  tenDiaDiem: '',
  diaChi: '',
  soLuongToiDa: '',
  doTuoiTu: '',
  doTuoiDen: '',
  gioiTinhPhuHop: '',
  mucDoKinhNghiem: '',
  yeuCauKhac: '',
  hinhAnh: [],
  noiQuyChung: '',
  luuYDatBiet: '',
  doDungCanMang: '',
};

export default function CreateActivityModal({ onClose }: { onClose: () => void }) {
  useAuth();
  const [buoc, setBuoc] = useState(1);
  const [form, setForm] = useState<FormData>(initialForm);
  const [danhMucList, setDanhMucList] = useState<DanhMucHoatDong[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<HoatDongResponse | null>(null);
  const [tagInput, setTagInput] = useState('');
  const thumbInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const [profileIncomplete, setProfileIncomplete] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  useEffect(() => {
    getCategoriesApi()
      .then((res) => { if (res.success && res.data) setDanhMucList(res.data); })
      .catch(() => {});

    import('../../services/profile.service').then(({ getMyProfile }) => {
      getMyProfile().then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          const missing: string[] = [];
          if (!p.user?.hoTen) missing.push('Họ tên');
          if (!p.ngaySinh) missing.push('Ngày sinh');
          if (!p.gioiTinh) missing.push('Giới tính');
          if (!p.khuVuc) missing.push('Khu vực');

          if (missing.length > 0) {
            setProfileIncomplete(true);
            setProfileMsg(`Hồ sơ của bạn chưa hoàn thiện 100%. Còn thiếu: ${missing.join(', ')}. Vui lòng hoàn thiện hồ sơ trước khi tạo hoạt động.`);
          }
        }
      }).catch(() => {});
    });
  }, []);

  const set = (key: keyof FormData, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  const compressImage = (file: File, maxDim = 1920, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
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
  };

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const MAX_SIZE = 5 * 1024 * 1024;

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
      setError('');
      const b64 = await compressImage(file);
      set('thumbnail', b64);
    }
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const f of files) {
      const err = validateFile(f);
      if (err) { setError(err); return; }
    }
    setError('');
    const remaining = 5 - form.hinhAnh.length;
    const toAdd = files.slice(0, remaining);
    const b64s = await Promise.all(toAdd.map((f) => compressImage(f)));
    set('hinhAnh', [...form.hinhAnh, ...b64s]);
    e.target.value = '';
  };

  const removeHinhAnh = (i: number) => set('hinhAnh', form.hinhAnh.filter((_, idx) => idx !== i));

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
      const payload = {
        tenHoatDong: form.tenHoatDong,
        danhMucHoatDongId: form.danhMucHoatDongId || undefined,
        moTa: form.moTa,
        thumbnail: form.thumbnail || undefined,
        hinhThuc: form.hinhThuc || undefined,
        thoiGianBatDau: new Date(form.thoiGianBatDau).toISOString(),
        thoiGianKetThuc: new Date(form.thoiGianKetThuc).toISOString(),
        hanDangKy: form.hanDangKy ? new Date(form.hanDangKy).toISOString() : undefined,
        tenDiaDiem: form.tenDiaDiem || undefined,
        diaChi: form.diaChi || undefined,
        soLuongToiDa: form.soLuongToiDa || undefined,
        doTuoiTu: form.doTuoiTu || undefined,
        doTuoiDen: form.doTuoiDen || undefined,
        gioiTinhPhuHop: form.gioiTinhPhuHop || undefined,
        mucDoKinhNghiem: form.mucDoKinhNghiem || undefined,
        yeuCauKhac: form.yeuCauKhac || undefined,
        hinhAnh: form.hinhAnh.length > 0 ? form.hinhAnh : undefined,
        noiQuyChung: form.noiQuyChung || undefined,
        luuYDatBiet: form.luuYDatBiet || undefined,
        doDungCanMang: form.doDungCanMang || undefined,
      } as any;
      const res = await createActivityApi(payload);
      if (res.success && res.data) {
        setSuccess(res.data);
      } else {
        setError(res.message || 'Tạo hoạt động thất bại.');
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

  const gioiTinhLabel = (v: string) => GIOI_TINH_OPTIONS.find((o) => o.value === v)?.label || 'Tất cả';
  const kinhNghiemLabel = (v: string) => KINH_NGHIEM_OPTIONS.find((o) => o.value === v)?.label || 'Mọi cấp độ';
  const selectedCategory = danhMucList.find((d) => d.danhMucHoatDongId === form.danhMucHoatDongId);

  const renderStepIndicator = () => (
    <div className="cam-step-indicator">
      {[1, 2, 3, 4, 5].map((s) => (
        <div key={s} className="cam-step-wrap">
          <div className={`cam-step-dot ${buoc === s ? 'active' : ''} ${buoc > s ? 'done' : ''}`}>
            {buoc > s ? '✓' : s}
          </div>
          {s < 5 && <div className={`cam-step-line ${buoc > s ? 'done' : ''}`} />}
        </div>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="cam-overlay" onClick={onClose}>
        <div className="cam-modal cam-success" onClick={(e) => e.stopPropagation()}>
          <div className="success-icon">🎉</div>
          <h2>Hoạt động đã được tạo thành công!</h2>
          <p className="success-sub">"{success.tenHoatDong}" đã được công bố đến mọi người.</p>
          <div className="success-actions">
            <button className="cam-btn-primary" onClick={onClose}>
              Quay về trang chủ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cam-overlay" onClick={onClose}>
      <div className="cam-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cam-header">
          <h2>Tạo hoạt động mới</h2>
          <button className="cam-close" onClick={onClose}>✕</button>
        </div>

        {renderStepIndicator()}

        {profileIncomplete && (
          <div style={{
            background: '#fff3e0',
            border: '1px solid #ffe0b2',
            color: '#e65100',
            padding: '14px 16px',
            borderRadius: 8,
            margin: '0 0 16px 0',
            fontSize: 14,
            lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
              ⚠️ Hồ sơ chưa đạt 100%!
            </div>
            <div style={{ color: '#d84315', marginBottom: 10 }}>
              {profileMsg}
            </div>
            <a
              href="/edit-profile"
              style={{
                background: '#e65100',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: 6,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: 600,
                display: 'inline-block'
              }}
            >
              Cập nhật hồ sơ ngay
            </a>
          </div>
        )}

        {error && <div className="cam-error">{error}</div>}

        {/* ========== BƯỚC 1: CƠ BẢN ========== */}
        {buoc === 1 && (
          <div className="cam-step-content">
            <h3>Bước 1: Thông tin cơ bản</h3>
            <div className="cam-field">
              <label>Tên hoạt động <span className="req">*</span></label>
              <input type="text" value={form.tenHoatDong} onChange={(e) => set('tenHoatDong', e.target.value)} placeholder="Ví dụ: Chạy bộ công viên" />
            </div>
            <div className="cam-field">
              <label>Danh mục <span className="req">*</span></label>
              <select value={form.danhMucHoatDongId} onChange={(e) => set('danhMucHoatDongId', Number(e.target.value))}>
                <option value={0}>-- Chọn danh mục --</option>
                {danhMucList.map((dm) => (
                  <option key={dm.danhMucHoatDongId} value={dm.danhMucHoatDongId}>{dm.tenDanhMuc}</option>
                ))}
              </select>
            </div>
            <div className="cam-field">
              <label>Ảnh đại diện</label>
              <input type="file" accept="image/*" ref={thumbInputRef} onChange={handleThumbnailChange} hidden />
              {form.thumbnail ? (
                <div className="cam-thumb-preview">
                  <img src={form.thumbnail} alt="thumbnail" />
                  <button className="cam-image-remove" onClick={() => set('thumbnail', '')}>✕</button>
                </div>
              ) : (
                <button type="button" className="cam-upload-btn" onClick={() => thumbInputRef.current?.click()}>
                  + Chọn ảnh đại diện
                </button>
              )}
            </div>
            <div className="cam-field">
              <label>Mô tả chi tiết <span className="req">*</span></label>
              <textarea rows={4} value={form.moTa} onChange={(e) => set('moTa', e.target.value)} placeholder="Mô tả về hoạt động..." />
            </div>
            <div className="cam-nav">
              <button className="cam-btn-primary" disabled={!canStep1 || profileIncomplete} onClick={() => setBuoc(2)}>
                {profileIncomplete ? 'Vui lòng cập nhật hồ sơ' : 'Tiếp tục'}
              </button>
            </div>
          </div>
        )}

        {/* ========== BƯỚC 2: THỜI GIAN & ĐỊA ĐIỂM ========== */}
        {buoc === 2 && (
          <div className="cam-step-content">
            <h3>Bước 2: Thời gian & Địa điểm</h3>
            <div className="cam-field">
              <label>Hình thức <span className="req">*</span></label>
              <div className="cam-radio-group">
                <label className="cam-radio">
                  <input type="radio" name="hinhThuc" value="offline" checked={form.hinhThuc === 'offline'} onChange={(e) => set('hinhThuc', e.target.value)} />
                  Offline
                </label>
                <label className="cam-radio">
                  <input type="radio" name="hinhThuc" value="online" checked={form.hinhThuc === 'online'} onChange={(e) => set('hinhThuc', e.target.value)} />
                  Online
                </label>
              </div>
            </div>
            <div className="cam-row">
              <div className="cam-field">
                <label>Ngày tổ chức <span className="req">*</span></label>
                <input type="datetime-local" value={form.thoiGianBatDau ? form.thoiGianBatDau.slice(0, 16) : ''} onChange={(e) => set('thoiGianBatDau', e.target.value)} />
              </div>
              <div className="cam-field">
                <label>Kết thúc <span className="req">*</span></label>
                <input type="datetime-local" value={form.thoiGianKetThuc ? form.thoiGianKetThuc.slice(0, 16) : ''} onChange={(e) => set('thoiGianKetThuc', e.target.value)} />
              </div>
            </div>
            <div className="cam-field">
              <label>Hạn đăng ký</label>
              <input type="datetime-local" value={form.hanDangKy ? form.hanDangKy.slice(0, 16) : ''} onChange={(e) => set('hanDangKy', e.target.value)} />
            </div>
            <div className="cam-field">
              <label>Địa điểm <span className="req">*</span></label>
              <input type="text" value={form.tenDiaDiem} onChange={(e) => set('tenDiaDiem', e.target.value)} placeholder="Tên địa điểm" />
            </div>
            <div className="cam-field">
              <label>Địa chỉ chi tiết</label>
              <input type="text" value={form.diaChi} onChange={(e) => set('diaChi', e.target.value)} placeholder="Số nhà, đường, phường..." />
            </div>
            <div className="cam-field">
              <label>Bản đồ</label>
              {form.diaChi ? (
                <div className="cam-map">
                  <iframe
                    title="map"
                    width="100%"
                    height="200"
                    style={{ border: 0, borderRadius: 8 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps?q=${encodeURIComponent(form.diaChi)}&output=embed`}
                  />
                </div>
              ) : (
                <p className="cam-hint">Nhập địa chỉ để hiển thị bản đồ</p>
              )}
            </div>
            <div className="cam-nav">
              <button className="cam-btn-outline" onClick={() => setBuoc(1)}>Quay lại</button>
              <button className="cam-btn-primary" disabled={!canStep2} onClick={() => setBuoc(3)}>Tiếp tục</button>
            </div>
          </div>
        )}

        {/* ========== BƯỚC 3: THAM GIA ========== */}
        {buoc === 3 && (
          <div className="cam-step-content">
            <h3>Bước 3: Điều kiện tham gia</h3>
            <div className="cam-field">
              <label>Số lượng người tối đa <span className="req">*</span></label>
              <input type="number" min={1} value={form.soLuongToiDa} onChange={(e) => set('soLuongToiDa', e.target.value ? Number(e.target.value) : '')} placeholder="Ví dụ: 20" />
            </div>
            <div className="cam-row">
              <div className="cam-field">
                <label>Độ tuổi từ</label>
                <input type="number" min={1} value={form.doTuoiTu} onChange={(e) => set('doTuoiTu', e.target.value ? Number(e.target.value) : '')} placeholder="18" />
              </div>
              <div className="cam-field">
                <label>Đến</label>
                <input type="number" min={1} value={form.doTuoiDen} onChange={(e) => set('doTuoiDen', e.target.value ? Number(e.target.value) : '')} placeholder="35" />
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
              <label>Yêu cầu khác (tùy chọn)</label>
              <textarea rows={2} value={form.yeuCauKhac} onChange={(e) => set('yeuCauKhac', e.target.value)} placeholder="Có laptop cá nhân, có xe máy..." />
            </div>
            <div className="cam-nav">
              <button className="cam-btn-outline" onClick={() => setBuoc(2)}>Quay lại</button>
              <button className="cam-btn-primary" disabled={!canStep3} onClick={() => setBuoc(4)}>Tiếp tục</button>
            </div>
          </div>
        )}

        {/* ========== BƯỚC 4: HÌNH ẢNH & LƯU Ý ========== */}
        {buoc === 4 && (
          <div className="cam-step-content">
            <h3>Bước 4: Hình ảnh & Lưu ý</h3>
            <div className="cam-field">
              <label>Ảnh hoạt động (tối đa 5 ảnh)</label>
              <div className="cam-images">
                {form.hinhAnh.map((b64, i) => (
                  <div key={i} className="cam-image-item">
                    <img src={b64} alt={`Ảnh ${i + 1}`} />
                    <button className="cam-image-remove" onClick={() => removeHinhAnh(i)}>✕</button>
                  </div>
                ))}
                {form.hinhAnh.length < 5 && (
                  <button type="button" className="cam-image-add" onClick={() => imageInputRef.current?.click()}>
                    + Thêm ảnh
                  </button>
                )}
              </div>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImagesChange} multiple hidden />
              <p className="cam-hint">Chọn ảnh từ máy tính. Tối đa 5 ảnh.</p>
            </div>
            <div className="cam-field">
              <label>Nội quy chung</label>
              <textarea rows={2} value={form.noiQuyChung} onChange={(e) => set('noiQuyChung', e.target.value)} placeholder="Không xả rác, đúng giờ..." />
            </div>
            <div className="cam-field">
              <label>Lưu ý đặc biệt</label>
              <textarea rows={2} value={form.luuYDatBiet} onChange={(e) => set('luuYDatBiet', e.target.value)} placeholder="Thời tiết xấu sẽ dời lịch..." />
            </div>
            <div className="cam-field">
              <label>Đồ dùng cần mang theo</label>
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
              <button className="cam-btn-outline" onClick={() => setBuoc(3)}>Quay lại</button>
              <button className="cam-btn-primary" onClick={() => setBuoc(5)}>Tiếp tục</button>
            </div>
          </div>
        )}

        {/* ========== BƯỚC 5: XEM LẠI & GỬI ========== */}
        {buoc === 5 && (
          <div className="cam-step-content">
            <h3>Bước 5: Kiểm tra thông tin</h3>
            <div className="cam-review">
              {form.thumbnail && (
                <div className="cam-review-thumb">
                  <img src={form.thumbnail} alt="thumbnail" />
                </div>
              )}
              <div className="cam-review-section">
                <h4>{form.tenHoatDong}</h4>
                {selectedCategory && (
                  <div className="cam-review-tags" style={{ marginBottom: 8 }}>
                    <span className="cam-tag">{selectedCategory.tenDanhMuc}</span>
                  </div>
                )}
                <p className="cam-review-time">🕐 {new Date(form.thoiGianBatDau).toLocaleString('vi-VN')} — {new Date(form.thoiGianKetThuc).toLocaleString('vi-VN')}</p>
                <p className="cam-review-place">📍 {form.tenDiaDiem}{form.diaChi ? `, ${form.diaChi}` : ''}</p>
                {form.hanDangKy && <p className="cam-review-hdk">📅 Hạn đăng ký: {new Date(form.hanDangKy).toLocaleString('vi-VN')}</p>}
                <p className="cam-review-hthuc">🔘 Hình thức: {form.hinhThuc === 'online' ? 'Online' : 'Offline'}</p>
              </div>
              <div className="cam-review-section">
                <h5>Mô tả</h5>
                <p>{form.moTa}</p>
              </div>
              <div className="cam-review-section">
                <h5>Tiêu chí tham gia</h5>
                <ul>
                  <li>Tối đa {form.soLuongToiDa} người</li>
                  {form.doTuoiTu || form.doTuoiDen ? <li>Độ tuổi: {form.doTuoiTu || 0} - {form.doTuoiDen || 99}</li> : null}
                  <li>Giới tính: {gioiTinhLabel(form.gioiTinhPhuHop)}</li>
                  <li>Kinh nghiệm: {kinhNghiemLabel(form.mucDoKinhNghiem)}</li>
                  {form.yeuCauKhac && <li>Yêu cầu: {form.yeuCauKhac}</li>}
                </ul>
              </div>
              {form.noiQuyChung && <div className="cam-review-section"><h5>Nội quy</h5><p>{form.noiQuyChung}</p></div>}
              {form.luuYDatBiet && <div className="cam-review-section"><h5>Lưu ý</h5><p>{form.luuYDatBiet}</p></div>}
              {form.doDungCanMang && (
                <div className="cam-review-section">
                  <h5>Đồ dùng cần mang</h5>
                  <div className="cam-review-tags">
                    {form.doDungCanMang.split(',').map((t) => t.trim()).filter(Boolean).map((t) => (
                      <span key={t} className="cam-tag">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {form.hinhAnh.length > 0 && (
                <div className="cam-review-section">
                  <h5>Hình ảnh ({form.hinhAnh.length})</h5>
                  <div className="cam-images">
                    {form.hinhAnh.map((b64, i) => (
                      <div key={i} className="cam-image-item">
                        <img src={b64} alt={`Ảnh ${i + 1}`} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="cam-nav">
              <button className="cam-btn-outline" onClick={() => setBuoc(4)}>Quay lại</button>
              <button className="cam-btn-primary" disabled={saving} onClick={handleSubmit}>
                {saving ? 'Đang gửi...' : 'Gửi yêu cầu tạo hoạt động'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

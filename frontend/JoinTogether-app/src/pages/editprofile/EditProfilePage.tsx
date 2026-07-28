import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateProfile, updateAvatar } from '../../services/profile.service';
import './EditProfile.css';

const GIOI_TINH_OPTIONS = [
  { value: 'nam', label: 'Nam' },
  { value: 'nu', label: 'Nữ' },
  { value: 'khac', label: 'Khác' },
];

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get('onboarding') === 'true';
  const { nguoiDungId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [hoTen, setHoTen] = useState('');
  const [email, setEmail] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [tieuSu, setTieuSu] = useState('');
  const [khuVuc, setKhuVuc] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [gioiTinh, setGioiTinh] = useState('');
  const [mucTieuThamGia, setMucTieuThamGia] = useState('');
  const [thoiGianRanh, setThoiGianRanh] = useState('');
  const [avatar, setAvatar] = useState('');

  const compressImage = (file: File, maxW = 1920, quality = 0.7): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          if (width > maxW) { height *= maxW / width; width = maxW; }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const base64 = await compressImage(file, 512, 0.8);
      setAvatar(base64);
      await updateAvatar(base64);
    }
  };

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          if (p.user) {
            setHoTen(p.user.hoTen || '');
            setEmail(p.user.email || '');
            setSoDienThoai(p.user.soDienThoai || '');
          }
          setTieuSu(p.tieuSu || '');
          setKhuVuc(p.khuVuc || '');
          setNgaySinh(p.ngaySinh ? p.ngaySinh.slice(0, 10) : '');
          setGioiTinh(p.gioiTinh || '');
          setMucTieuThamGia(p.mucTieuThamGia || '');
          setThoiGianRanh(p.thoiGianRanh || '');
          if (p.anhDaiDien) setAvatar(p.anhDaiDien);
        }
      })
      .catch(() => setError('Không thể tải thông tin hồ sơ.'))
      .finally(() => setLoading(false));
  }, []);

  const requiredFields = [hoTen, tieuSu, khuVuc, ngaySinh];
  const allFields = [hoTen, email, soDienThoai, tieuSu, khuVuc, ngaySinh, gioiTinh, mucTieuThamGia, thoiGianRanh, avatar];
  const filledCount = allFields.filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  const progressPct = Math.round((filledCount / allFields.length) * 100);
  const canSave = requiredFields.every((v) => v.trim().length > 0);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({ hoTen, email, soDienThoai, tieuSu, ngaySinh, khuVuc, gioiTinh, mucTieuThamGia, thoiGianRanh });
      navigate(onboarding ? '/interests?onboarding=true' : '/my-profile', { replace: true });
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Lưu thông tin thất bại';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-page">
        <div className="profile-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 12 }}>
          <div className="spinner" style={{ width: 44, height: 44, border: '4px solid #e4ece6', borderTopColor: '#6fbf73', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <div className="back-hover-area">
        <button className="back-profile-btn" onClick={() => navigate('/my-profile')}>
          <span className="back-icon">←</span>
          <span className="back-text">Quay lại hồ sơ</span>
        </button>
      </div>

      <header className="edit-header">
        <div className="edit-logo">🌿 JoinTogether</div>
        <div className="header-user">
          <span>🔔</span>
          <img src={avatar || `https://i.pravatar.cc/100?u=${nguoiDungId}`} alt="avatar" />
        </div>
      </header>

      <main className="edit-container">
        <h1>Chỉnh sửa hồ sơ</h1>

        {error && <div className="edit-error">{error}</div>}

        <section className="edit-card">
          <div className="avatar-edit">
            <img src={avatar || `https://i.pravatar.cc/200?u=${nguoiDungId}`} alt="avatar" />
            <label className="avatar-button" style={{ cursor: 'pointer' }}>
              ✏️
              <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </label>
          </div>

          <div className="profile-progress-wrap">
            <div className="profile-progress-bar">
              <div className="profile-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="profile-progress-label">{progressPct}%</span>
          </div>

          <div className="form-group">
            <label>Họ tên <span style={{ color: 'var(--error, #f44336)' }}>*</span></label>
            <input type="text" value={hoTen} onChange={(e) => setHoTen(e.target.value)} placeholder="Nguyễn Văn A" />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input type="tel" value={soDienThoai} onChange={(e) => setSoDienThoai(e.target.value)} placeholder="0912345678" />
          </div>

          <div className="form-group">
            <label>Giới tính</label>
            <select value={gioiTinh} onChange={(e) => setGioiTinh(e.target.value)}>
              <option value="">Chọn giới tính</option>
              {GIOI_TINH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Khu vực <span style={{ color: 'var(--error, #f44336)' }}>*</span></label>
            <input type="text" value={khuVuc} onChange={(e) => setKhuVuc(e.target.value)} placeholder="Ví dụ: Hà Nội" />
          </div>

          <div className="form-group">
            <label>Ngày sinh <span style={{ color: 'var(--error, #f44336)' }}>*</span></label>
            <input type="date" value={ngaySinh} onChange={(e) => setNgaySinh(e.target.value)} />
          </div>

          <div className="form-group">
            <label>Mục tiêu tham gia</label>
            <input type="text" value={mucTieuThamGia} onChange={(e) => setMucTieuThamGia(e.target.value)} placeholder="Ví dụ: Kết bạn, học hỏi..." />
          </div>

          <div className="form-group">
            <label>Thời gian rảnh</label>
            <input type="text" value={thoiGianRanh} onChange={(e) => setThoiGianRanh(e.target.value)} placeholder="Ví dụ: Cuối tuần, tối thứ 7" />
          </div>

          <div className="form-group">
            <div className="bio-header">
              <label>Giới thiệu bản thân <span style={{ color: 'var(--error, #f44336)' }}>*</span></label>
              <span>{tieuSu.length}/500</span>
            </div>
            <textarea maxLength={500} value={tieuSu} onChange={(e) => setTieuSu(e.target.value)} placeholder="Hãy viết đôi điều về bạn..." />
          </div>

          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave} disabled={!canSave || saving}>
              {saving ? 'Đang lưu...' : !canSave ? 'Vui lòng điền đầy đủ thông tin' : 'Lưu thông tin'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

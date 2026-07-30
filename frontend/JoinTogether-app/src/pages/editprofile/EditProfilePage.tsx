import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateProfile, updateAvatar } from '../../services/profile.service';
import { getInterestCategories, addInterest, updateGoals } from '../../services/interest.service';
import type { InterestCategory } from '../../services/interest.service';
import SidebarLayout from '../../components/SidebarLayout';
import './EditProfile.css';
import '../onboarding/Onboarding.css';

const GIOI_TINH_OPTIONS = [
  { value: 'nam', label: 'Nam' },
  { value: 'nu', label: 'Nữ' },
  { value: 'khac', label: 'Khác' },
];

const GOAL_OPTIONS = [
  { value: 'ket-ban', label: 'Kết bạn mới' },
  { value: 'hoc-hoi', label: 'Học hỏi kỹ năng' },
  { value: 'giao-luu', label: 'Giao lưu cộng đồng' },
  { value: 'thu-gian', label: 'Thư giãn giải trí' },
  { value: 'the-duc', label: 'Rèn luyện sức khỏe' },
  { value: 'thien-nguyen', label: 'Hoạt động tình nguyện' },
  { value: 'trai-nghiem', label: 'Trải nghiệm mới' },
  { value: 'khac', label: 'Mục đích khác' },
];

const DAY_OPTIONS = [
  { value: 'thu-2', label: 'Thứ 2' }, { value: 'thu-3', label: 'Thứ 3' },
  { value: 'thu-4', label: 'Thứ 4' }, { value: 'thu-5', label: 'Thứ 5' },
  { value: 'thu-6', label: 'Thứ 6' }, { value: 'thu-7', label: 'Thứ 7' },
  { value: 'cn', label: 'Chủ nhật' },
];

const TIME_OPTIONS = [
  { value: 'sang', label: 'Buổi sáng (6h-12h)' },
  { value: 'chieu', label: 'Buổi chiều (12h-18h)' },
  { value: 'toi', label: 'Buổi tối (18h-22h)' },
  { value: 'dem', label: 'Đêm khuya (22h-6h)' },
];

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 0, label: 'Không giới hạn' },
];

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get('onboarding') === 'true';
  const { nguoiDungId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Profile Form state
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

  // Interests state
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<number>>(new Set());
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [radius, setRadius] = useState<number>(25);

  const initialValues = useRef('');

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
    if (!file) return;

    if (file.size > MAX_AVATAR_SIZE) {
      setError(`Ảnh đại diện không được vượt quá 5MB. Dung lượng hiện tại: ${(file.size / 1024 / 1024).toFixed(1)}MB.`);
      return;
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Định dạng ảnh không hợp lệ. Chỉ chấp nhận JPG, PNG, WebP, GIF.');
      return;
    }

    setError('');
    const base64 = await compressImage(file, 512, 0.8);
    setAvatar(base64);
    await updateAvatar(base64);
  };

  const getCurrentValues = () =>
    JSON.stringify({ hoTen, email, soDienThoai, tieuSu, ngaySinh, khuVuc, gioiTinh, mucTieuThamGia, thoiGianRanh, avatar });

  useEffect(() => {
    Promise.all([
      getMyProfile(),
      getInterestCategories(),
    ])
      .then(([profileRes, catRes]) => {
        if (profileRes.success && profileRes.data) {
          const p = profileRes.data;
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

        if (catRes.success && catRes.data) {
          setCategories(catRes.data);
        }
      })
      .catch(() => setError('Không thể tải thông tin hồ sơ và sở thích.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      initialValues.current = getCurrentValues();
    }
  }, [loading]);

  const currentSnapshot = getCurrentValues();
  const hasUnsavedChanges = !loading && currentSnapshot !== initialValues.current;

  const requiredFields = [hoTen, tieuSu, khuVuc, ngaySinh];
  const allFields = [hoTen, email, soDienThoai, tieuSu, khuVuc, ngaySinh, gioiTinh, mucTieuThamGia, thoiGianRanh, avatar];
  const filledCount = allFields.filter((v) => typeof v === 'string' && v.trim().length > 0).length;
  const progressPct = Math.round((filledCount / allFields.length) * 100);
  const canSave = requiredFields.every((v) => v.trim().length > 0);

  const toggleInterest = (id: number) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGoal = (value: string) => {
    setSelectedGoals((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleDay = (value: string) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleTime = (value: string) => {
    setSelectedTimes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleCancel = () => {
    if (hasUnsavedChanges && !window.confirm('Bạn có thay đổi chưa được lưu. Bạn có chắc muốn hủy?')) {
      return;
    }
    navigate('/my-profile', { replace: true });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // 1. Save profile basic info
      const finalMucTieu = selectedGoals.length > 0
        ? selectedGoals.map(g => GOAL_OPTIONS.find(o => o.value === g)?.label || g).join(', ')
        : mucTieuThamGia;

      const finalThoiGian = selectedDays.length > 0 || selectedTimes.length > 0
        ? `${selectedDays.map(d => DAY_OPTIONS.find(o => o.value === d)?.label || d).join(', ')} (${selectedTimes.map(t => TIME_OPTIONS.find(o => o.value === t)?.label || t).join(', ')})`
        : thoiGianRanh;

      await updateProfile({
        hoTen,
        email,
        soDienThoai,
        tieuSu,
        ngaySinh,
        khuVuc,
        gioiTinh,
        mucTieuThamGia: finalMucTieu,
        thoiGianRanh: finalThoiGian,
      });

      // 2. Save interests & goals if selected
      if (selectedInterests.size > 0) {
        await Promise.all(
          Array.from(selectedInterests).map((soThichId) =>
            addInterest(soThichId, 3).catch(() => {}),
          ),
        );
      }

      await updateGoals({
        mucTieuThamGia: finalMucTieu || undefined,
        thoiGianRanh: finalThoiGian || undefined,
        banKinhMongMuon: radius || undefined,
      }).catch(() => {});

      initialValues.current = getCurrentValues();
      setSuccess('Cập nhật hồ sơ và sở thích thành công!');
      setTimeout(() => {
        navigate(onboarding ? '/interests?onboarding=true' : '/my-profile', { replace: true });
      }, 1500);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string; invalidFields?: string[] } } };
      const msg = errObj?.response?.data?.message || 'Lưu thông tin thất bại';
      const invalidFields = errObj?.response?.data?.invalidFields;

      if (invalidFields && invalidFields.length > 0) {
        const fieldLabels: Record<string, string> = {
          email: 'Email',
          soDienThoai: 'Số điện thoại',
          hoTen: 'Họ tên',
          ngaySinh: 'Ngày sinh',
        };
        const details = invalidFields.map((f) => fieldLabels[f] || f).join(', ');
        setError(`${msg}: ${details}`);
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    const loadingContent = (
      <div className="profile-loading" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', gap: 12 }}>
        <div className="spinner" style={{ width: 44, height: 44, border: '4px solid #e4ece6', borderTopColor: '#6fbf73', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p>Đang tải thông tin hồ sơ...</p>
      </div>
    );
    if (onboarding) {
      return <div className="onboarding-page">{loadingContent}</div>;
    }
    return <SidebarLayout title="Chỉnh sửa hồ sơ">{loadingContent}</SidebarLayout>;
  }

  const formBody = (
    <div className={onboarding ? 'onboarding-container' : 'edit-profile-page'}>
      {onboarding && (
        <div className="onboarding-header">
          <div className="step-indicator">
            <div className="step-dot done">✓</div>
            <div className="step-line done" />
            <div className="step-dot active">2</div>
            <div className="step-line" />
            <div className="step-dot">3</div>
          </div>
          <h1>Bước 2: Thông tin cá nhân</h1>
          <p className="subtitle">Cập nhật thông tin cá nhân của bạn để mọi người dễ dàng nhận diện và kết nối.</p>
        </div>
      )}

      <main className="edit-container" style={{ maxWidth: '100%', margin: 0, padding: 0 }}>
        {success && <div className="edit-success">{success}</div>}
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

          {/* === CÁC TRƯỜNG THÔNG TIN THƯỜNG === */}
          <h3 style={{ fontSize: 16, color: 'var(--primary-800)', marginTop: 10, marginBottom: 14 }}>
            👤 Thông tin cá nhân cơ bản
          </h3>

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
            <div className="bio-header">
              <label>Giới thiệu bản thân <span style={{ color: 'var(--error, #f44336)' }}>*</span></label>
              <span>{tieuSu.length}/500</span>
            </div>
            <textarea maxLength={500} value={tieuSu} onChange={(e) => setTieuSu(e.target.value)} placeholder="Hãy viết đôi điều về bạn..." />
          </div>

          {!onboarding && (
            <>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />

              {/* === SỞ THÍCH VÀ MỤC TIÊU === */}
              <h3 style={{ fontSize: 16, color: 'var(--primary-800)', marginBottom: 14 }}>
                🎯 Danh mục sở thích & Thời gian rảnh
              </h3>

              {/* Danh mục sở thích */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                  Chọn các sở thích của bạn (Đã chọn: {selectedInterests.size})
                </label>
                {categories.length === 0 ? (
                  <p style={{ color: 'var(--text-light)', fontSize: 13 }}>Đang tải danh mục sở thích...</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.danhMucSoThichId ?? 'khac'} style={{ marginBottom: 16 }}>
                      {cat.tenDanhMuc && (
                        <h4 style={{ color: 'var(--primary-700)', marginBottom: 8, fontSize: 14 }}>
                          {cat.tenDanhMuc}
                        </h4>
                      )}
                      <div className="interests-grid">
                        {cat.soThich.map((item) => (
                          <button
                            type="button"
                            key={item.soThichId}
                            className={`interest-card ${selectedInterests.has(item.soThichId) ? 'selected' : ''}`}
                            onClick={() => toggleInterest(item.soThichId)}
                          >
                            <span className="interest-label">{item.tenSoThich}</span>
                            {selectedInterests.has(item.soThichId) && <span className="interest-check">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mục tiêu tham gia */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                  Mục tiêu tham gia cộng đồng
                </label>
                <div className="goals-grid">
                  {GOAL_OPTIONS.map((goal) => (
                    <button
                      type="button"
                      key={goal.value}
                      className={`goal-card ${selectedGoals.includes(goal.value) ? 'selected' : ''}`}
                      onClick={() => toggleGoal(goal.value)}
                    >
                      <span className="goal-label">{goal.label}</span>
                      {selectedGoals.includes(goal.value) && <span className="goal-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thời gian rảnh */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                  Thời gian bạn thường rảnh rỗi
                </label>
                <div className="day-grid" style={{ marginBottom: 12 }}>
                  {DAY_OPTIONS.map((day) => (
                    <button
                      type="button"
                      key={day.value}
                      className={`day-chip ${selectedDays.includes(day.value) ? 'selected' : ''}`}
                      onClick={() => toggleDay(day.value)}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                <div className="goals-grid">
                  {TIME_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`goal-card ${selectedTimes.includes(opt.value) ? 'selected' : ''}`}
                      onClick={() => toggleTime(opt.value)}
                    >
                      <span className="goal-label">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bán kính mong muốn */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', display: 'block', marginBottom: 8 }}>
                  Bán kính tìm kiếm hoạt động mong muốn
                </label>
                <div className="radius-grid">
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      type="button"
                      key={opt.value}
                      className={`radius-chip ${radius === opt.value ? 'selected' : ''}`}
                      onClick={() => setRadius(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="edit-actions" style={{ marginTop: 28 }}>
            {!onboarding && (
              <button className="cancel-btn" onClick={handleCancel}>
                Hủy
              </button>
            )}
            <button
              className={onboarding ? "primary-btn" : "save-btn"}
              style={onboarding ? { flex: 1, padding: '14px 24px', fontSize: 15 } : undefined}
              onClick={handleSave}
              disabled={!canSave || saving || !!success}
            >
              {saving
                ? 'Đang lưu...'
                : onboarding
                ? 'Tiếp tục — Bước 3: Sở thích & Thiết lập'
                : !canSave
                ? 'Vui lòng điền đầy đủ thông tin'
                : 'Lưu thông tin'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );

  if (onboarding) {
    return <div className="onboarding-page">{formBody}</div>;
  }

  return (
    <SidebarLayout title="Chỉnh sửa hồ sơ & Sở thích">
      {formBody}
    </SidebarLayout>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile, updateProfile } from '../../services/profile.service';
import './EditProfile.css';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { nguoiDungId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [tieuSu, setTieuSu] = useState('');
  const [khuVuc, setKhuVuc] = useState('');
  const [ngaySinh, setNgaySinh] = useState('');
  const [mucTieuThamGia, setMucTieuThamGia] = useState('');
  const [thoiGianRanh, setThoiGianRanh] = useState('');

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        if (res.success && res.data) {
          const p = res.data;
          setTieuSu(p.tieuSu || '');
          setKhuVuc(p.khuVuc || '');
          setNgaySinh(p.ngaySinh ? p.ngaySinh.slice(0, 10) : '');
          setMucTieuThamGia(p.mucTieuThamGia || '');
          setThoiGianRanh(p.thoiGianRanh || '');
        }
      })
      .catch(() => setError('Không thể tải thông tin hồ sơ.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await updateProfile({ tieuSu, ngaySinh, khuVuc, mucTieuThamGia, thoiGianRanh });
      navigate('/my-profile', { replace: true });
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
          <img src={`https://i.pravatar.cc/100?u=${nguoiDungId}`} alt="avatar" />
        </div>
      </header>

      <main className="edit-container">
        <h1>Chỉnh sửa hồ sơ</h1>

        {error && <div className="edit-error">{error}</div>}

        <section className="edit-card">
          <div className="avatar-edit">
            <img src={`https://i.pravatar.cc/200?u=${nguoiDungId}`} alt="avatar" />
            <button className="avatar-button" type="button">✏️</button>
          </div>

          <div className="form-group">
            <label>Khu vực</label>
            <input type="text" value={khuVuc} onChange={(e) => setKhuVuc(e.target.value)} placeholder="Ví dụ: Hà Nội" />
          </div>

          <div className="form-group">
            <label>Ngày sinh</label>
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
              <label>Giới thiệu bản thân</label>
              <span>{tieuSu.length}/500</span>
            </div>
            <textarea maxLength={500} value={tieuSu} onChange={(e) => setTieuSu(e.target.value)} placeholder="Hãy viết đôi điều về bạn..." />
          </div>

          <div className="edit-actions">
            <button className="save-btn" onClick={handleSave} disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu thông tin'}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

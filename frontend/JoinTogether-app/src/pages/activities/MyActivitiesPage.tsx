import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyActivitiesApi } from '../../services/activity.service';
import type { HoatDongResponse } from '../../types/activity';
import NavItems from '../../components/NavItems';
import ActivityDetailModal from '../dashboard/ActivityDetailModal';
import '../../styles/dashboard.css';
import './MyActivities.css';

const TRANG_THAI_LABEL: Record<string, string> = {
  sap_dien_ra: 'Sắp diễn ra',
  dang_dien_ra: 'Đang diễn ra',
  da_ket_thuc: 'Đã kết thúc',
  da_huy: 'Đã hủy',
};

function MyActivityCard({ hd, onClick }: { hd: HoatDongResponse; onClick: () => void }) {
  const thumb = hd.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan;
  const status = TRANG_THAI_LABEL[hd.trangThai || 'sap_dien_ra'] || 'Sắp diễn ra';
  const isCancelled = hd.trangThai === 'da_huy';
  return (
    <div className="my-activity-card" onClick={onClick}>
      <div className="my-activity-thumb" style={{ background: thumb ? `url(${thumb}) center/cover` : '#e8f5e9' }}>
        <span className={`my-activity-badge ${isCancelled ? 'badge-cancelled' : ''}`}>{status}</span>
      </div>
      <div className="my-activity-body">
        <h4>{hd.tenHoatDong}</h4>
        {hd.tenDanhMuc && <p className="my-activity-cat">{hd.tenDanhMuc}</p>}
        <p className="my-activity-time">🕐 {hd.thoiGianBatDau ? new Date(hd.thoiGianBatDau).toLocaleDateString('vi-VN') : ''}</p>
        <p className="my-activity-place">📍 {hd.tenDiaDiem || 'Chưa có địa điểm'}</p>
        <div className="my-activity-footer">
          <span className="my-activity-count">{hd.soLuongThanhVien || 0} tham gia</span>
          {hd.soLuongToiDa && <span className="my-activity-limit">tối đa {hd.soLuongToiDa}</span>}
        </div>
      </div>
    </div>
  );
}

export default function MyActivitiesPage() {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<HoatDongResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<HoatDongResponse | null>(null);
  const [menuMo, setMenuMo] = useState(false);
  const [filter, setFilter] = useState<string>('tat-ca');

  const filteredActivities = filter === 'tat-ca'
    ? activities
    : activities.filter((a) => a.trangThai === filter);

  useEffect(() => {
    getMyActivitiesApi()
      .then((res) => { if (res.success && res.data) setActivities(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleDeleted = (id: number) => {
    setActivities((prev) => prev.map((a) => a.hoatDongId === id ? { ...a, trangThai: 'da_huy' } : a));
    setSelectedActivity(null);
  };

  const handleEdited = () => {
    setSelectedActivity(null);
    getMyActivitiesApi()
      .then((res) => { if (res.success && res.data) setActivities(res.data); })
      .catch(() => {});
  };

  const FilterBar = () => (
    <div className="my-filter-bar">
      {[
        { key: 'tat-ca', label: 'Tất cả' },
        { key: 'sap_dien_ra', label: 'Sắp diễn ra' },
        { key: 'dang_dien_ra', label: 'Đang diễn ra' },
        { key: 'da_huy', label: 'Đã hủy' },
      ].map((f) => (
        <button
          key={f.key}
          className={`my-filter-btn ${filter === f.key ? 'my-filter-active' : ''} ${f.key === 'da_huy' ? 'my-filter-danger' : ''}`}
          onClick={() => setFilter(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* Mobile */}
      <div className="mobile-view">
        <div className="app-outer">
          <div className="phone-shell">
            <header className="app-header">
              <button className="icon-btn" onClick={() => setMenuMo(true)}>☰</button>
              <span className="app-title">🌿 Hoạt động của tôi</span>
              <button className="icon-btn icon-btn-bell">🔔<span className="bell-dot" /></button>
            </header>

            {menuMo && (
              <>
                <div className="drawer-overlay" onClick={() => setMenuMo(false)} />
                <nav className="drawer-panel">
                  <div className="drawer-brand">
                    <div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>🌿</div>
                  </div>
                  <NavItems onClose={() => setMenuMo(false)} />
                  <button className="logout-btn" onClick={handleLogout}>🚪 Đăng xuất</button>
                </nav>
              </>
            )}

            <div className="app-body">
              {loading ? (
                <p className="cam-hint">Đang tải...</p>
              ) : activities.length === 0 ? (
                <div className="my-empty">
                  <p>Bạn chưa tạo hoạt động nào.</p>
                  <button className="cam-btn-primary" onClick={() => navigate('/dashboard')}>Quay về trang chủ</button>
                </div>
              ) : (
                <>
                  <FilterBar />
                  <div className="my-list-mobile">
                    {filteredActivities.map((hd) => (
                      <MyActivityCard key={hd.hoatDongId} hd={hd} onClick={() => setSelectedActivity(hd)} />
                    ))}
                  </div>
                </>
              )}
            </div>

            <nav className="bottom-nav">
              <button className="bottom-nav-item" onClick={() => navigate('/dashboard')}>
                <span className="bottom-nav-icon">🏠</span>Trang chủ
              </button>
              <button className="bottom-nav-item bottom-nav-active">
                <span className="bottom-nav-icon">🎯</span>Hoạt động
              </button>
              <button className="bottom-nav-item">
                <span className="bottom-nav-icon">💬</span>Tin nhắn
              </button>
              <button className="bottom-nav-item" onClick={() => setMenuMo(true)}>
                <span className="bottom-nav-icon">👤</span>Cá nhân
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div className="desktop-view">
        <aside className="sidebar">
          <div className="drawer-brand">
            <div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>🌿</div>
          </div>
          <nav className="sidebar-nav">
            <NavItems />
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>🚪 Đăng xuất</button>
          </div>
        </aside>

        <main className="main-content">
          <header className="topbar">
            <h1>Hoạt động của tôi</h1>
            <div className="topbar-user">
              <span className="user-badge">ID: {nguoiDungId}</span>
              <button className="icon-btn icon-btn-bell">🔔<span className="bell-dot" /></button>
            </div>
          </header>

          <div className="content-body">
            {loading ? (
              <p className="cam-hint">Đang tải...</p>
            ) : activities.length === 0 ? (
              <div className="my-empty">
                <p>Bạn chưa tạo hoạt động nào.</p>
                <button className="cam-btn-primary" onClick={() => navigate('/dashboard')}>Quay về trang chủ</button>
              </div>
            ) : (
              <>
                <FilterBar />
                <div className="my-grid">
                  {filteredActivities.map((hd) => (
                    <MyActivityCard key={hd.hoatDongId} hd={hd} onClick={() => setSelectedActivity(hd)} />
                  ))}
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onCancel={handleDeleted}
          onEdited={handleEdited}
        />
      )}
    </>
  );
}

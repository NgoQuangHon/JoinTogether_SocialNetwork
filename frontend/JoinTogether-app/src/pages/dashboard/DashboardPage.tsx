import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';
import CreateActivityModal from './CreateActivityModal';
import ActivityDetailModal from './ActivityDetailModal';
import NavItems from '../../components/NavItems';
import { getMyActivitiesApi, getAllActivitiesApi, getFeaturedActivitiesApi } from '../../services/activity.service';
import { getSuggestionsApi } from '../../services/connection.service';
import { getPostsApi } from '../../services/post.service';
import type { HoatDongResponse } from '../../types/activity';
import type { BaiVietResponse } from '../../services/post.service';
import { danhMucList, type DanhMuc } from './feedMockData';

function Avatar({ mau, chu, kichThuoc = 44 }: { mau: string; chu: string; kichThuoc?: number }) {
  return (
    <div
      className="avatar-tron"
      style={{
        background: mau,
        width: kichThuoc,
        height: kichThuoc,
        fontSize: kichThuoc * 0.42,
      }}
    >
      {chu}
    </div>
  );
}

function AIBanner() {
  return (
    <section className="ai-banner">
      <div className="ai-banner-main">
        <div className="ai-banner-icon">✦</div>
        <h2>AI Matching</h2>
        <p className="ai-banner-sub">Tìm người đồng hành lý tưởng cho bạn</p>
        <p className="ai-banner-desc">
          Dựa trên sở thích và lịch trình của bạn, AI sẽ đề xuất những hoạt động và bạn đồng hành phù
          hợp nhất ngay lúc này.
        </p>
      </div>
      <div className="ai-banner-bottom">
        <button className="ai-banner-cta">
          THỬ NGAY <span>→</span>
        </button>
        <div className="ai-banner-slider">
          <span className="ai-banner-slider-dot" />
        </div>
      </div>
    </section>
  );
}

function CategoryChips({ chon, onChon }: { chon: string; onChon: (id: string) => void }) {
  return (
    <div className="category-row">
      {danhMucList.map((dm: DanhMuc) => (
        <button
          key={dm.id}
          className={`category-chip ${chon === dm.id ? 'category-chip-active' : ''}`}
          onClick={() => onChon(dm.id)}
        >
          {dm.ten}
        </button>
      ))}
    </div>
  );
}

function ActivityCard({ hd }: { hd: HoatDongResponse }) {
  const thumb = hd.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan;
  return (
    <div className="activity-card">
      <div className="activity-thumb" style={{ background: thumb ? `url(${thumb}) center/cover` : '#e8f5e9' }}>
        <span className="distance-badge">{hd.tenDanhMuc?.[0] || 'Khác'}</span>
      </div>
      <p className="activity-title">{hd.tenHoatDong}</p>
      <p className="activity-time">🕐 {hd.thoiGianBatDau ? new Date(hd.thoiGianBatDau).toLocaleDateString('vi-VN') : ''}</p>
      <div className="activity-footer">
        <span className="participants-badge">{hd.soLuongThanhVien || 0} tham gia</span>
      </div>
    </div>
  );
}

function CompanionCard({ ng }: { ng: any }) {
  return (
    <div className="companion-card">
      <Avatar mau="#7c4dff" chu={(ng.hoTen || '?').charAt(0).toUpperCase()} kichThuoc={64} />
      <p className="companion-name">{ng.hoTen || ng.tenNguoiDung || 'Người dùng'}</p>
      <p className="companion-interest">{(ng.soThich || ng.danhSachSoThich || []).slice(0, 2).join(', ')}</p>
      <button className="btn-connect-outline">Kết nối</button>
    </div>
  );
}

function FeaturedCard({ hd }: { hd: HoatDongResponse }) {
  const thumb = hd.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan;
  return (
    <div className="featured-card">
      <div className="featured-thumb" style={{ background: thumb ? `url(${thumb}) center/cover` : '#e8f5e9' }}>
        <span className="featured-badge">{hd.tenDanhMuc?.[0] || 'Nổi bật'}</span>
        <span className="featured-badge featured-badge-light">{hd.soLuongThanhVien || 0} tham gia</span>
      </div>
      <p className="featured-title">{hd.tenHoatDong}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();

  const [menuMo, setMenuMo] = useState(false);
  const [danhMucChon, setDanhMucChon] = useState('tat-ca');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myActivities, setMyActivities] = useState<HoatDongResponse[]>([]);
  const [recentActivities, setRecentActivities] = useState<HoatDongResponse[]>([]);
  const [featuredActivities, setFeaturedActivities] = useState<HoatDongResponse[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [posts, setPosts] = useState<BaiVietResponse[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<HoatDongResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [postInput, setPostInput] = useState('');
  const [postImage, setPostImage] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    Promise.all([
      getMyActivitiesApi(),
      getAllActivitiesApi(),
      getFeaturedActivitiesApi(),
      getSuggestionsApi(),
      getPostsApi(),
    ])
      .then(([myRes, actRes, featRes, sugRes, postRes]) => {
        if (myRes.success && myRes.data) setMyActivities(myRes.data);
        if (actRes.success && actRes.data) setRecentActivities(actRes.data);
        if (featRes.success && featRes.data) setFeaturedActivities(featRes.data);
        if (sugRes.success && sugRes.data) setSuggestions(sugRes.data);
        if (postRes.success && postRes.data) setPosts(postRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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

  const handlePostImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setPostImage(await compressImage(file));
  };

  const handlePostSubmit = async () => {
    if (!postInput.trim() && !postImage) return;
    setPosting(true);
    try {
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ noiDung: postInput.trim(), hinhAnh: postImage || null }),
      });
      const json = await res.json();
      if (json.success) {
        setPostInput('');
        setPostImage('');
        const postsRes = await getPostsApi();
        if (postsRes.success && postsRes.data) setPosts(postsRes.data);
      }
    } catch { }
    finally { setPosting(false); }
  };

  const mobileView = (
    <div className="mobile-view">
      <div className="app-outer">
        <div className="phone-shell">
          <header className="app-header">
            <button className="icon-btn" onClick={() => setMenuMo(true)} aria-label="Mở menu">
              ☰
            </button>
            <span className="app-title">🌿</span>
            <button className="icon-btn icon-btn-bell" aria-label="Thông báo">
              🔔
              <span className="bell-dot" />
            </button>
          </header>

          {menuMo && (
            <>
              <div className="drawer-overlay" onClick={() => setMenuMo(false)} />
              <nav className="drawer-panel">
                <div className="drawer-brand">
                  <div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>🌿</div>
                </div>
                <NavItems onClose={() => setMenuMo(false)} onNavigate={(href) => { if (href === '#my-activities') { document.getElementById('my-activities')?.scrollIntoView({ behavior: 'smooth' }); } }} />
                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Đăng xuất
                </button>
              </nav>
            </>
          )}

          <div className="app-body">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Tìm kiếm hoạt động, bạn bè..." />
            </div>

            <AIBanner />

            <div className="post-create-box">
              <textarea
                className="post-create-input"
                placeholder="Bạn đang nghĩ gì?"
                value={postInput}
                onChange={(e) => setPostInput(e.target.value)}
                rows={3}
              />
              {postImage && (
                <div className="post-create-preview">
                  <img src={postImage} alt="preview" />
                  <button className="post-create-remove-img" onClick={() => setPostImage('')}>✕</button>
                </div>
              )}
              <div className="post-create-toolbar">
                <label className="post-create-image-btn">
                  📷 Ảnh
                  <input type="file" accept="image/*" hidden onChange={handlePostImageChange} />
                </label>
                <button
                  className="post-create-submit"
                  disabled={(!postInput.trim() && !postImage) || posting}
                  onClick={handlePostSubmit}
                >
                  {posting ? 'Đang đăng...' : 'Đăng bài'}
                </button>
              </div>
            </div>

            <button className="create-activity-btn" onClick={() => setShowCreateModal(true)}>
              ➕ Tạo hoạt động
            </button>
            <CategoryChips chon={danhMucChon} onChon={setDanhMucChon} />

            <section className="section-block">
              <div className="section-heading">
                <h3>Hoạt động gần bạn</h3>
                <a href="#" className="section-link">XEM THÊM</a>
              </div>
              <div className="hscroll">
                {recentActivities.map((hd) => (
                  <ActivityCard key={hd.hoatDongId} hd={hd} />
                ))}
              </div>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <h3>Người đồng hành đề xuất</h3>
              </div>
              <div className="hscroll">
                {suggestions.map((ng) => (
                  <CompanionCard key={ng.nguoiDungId || ng.nguoiDungId2} ng={ng} />
                ))}
              </div>
            </section>

            <section className="section-block" id="my-activities">
              <div className="section-heading">
                <h3>Hoạt động của tôi</h3>
              </div>
              {loading ? (
                <p className="cam-hint">Đang tải...</p>
              ) : myActivities.length === 0 ? (
                <p className="cam-hint">Bạn chưa tạo hoạt động nào.</p>
              ) : (
                <div className="hscroll">
                  {myActivities.map((hd) => {
                    const thumb = hd.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan;
                    const statusLabel: Record<string, string> = { sap_dien_ra: 'Sắp diễn ra', dang_dien_ra: 'Đang diễn ra', da_ket_thuc: 'Đã kết thúc', da_huy: 'Đã hủy' };
                    return (
                      <div key={hd.hoatDongId} className="activity-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedActivity(hd)}>
                        <div className="activity-thumb" style={{ background: thumb ? `url(${thumb}) center/cover` : '#e8f5e9' }}>
                          <span className="distance-badge" style={{ background: hd.trangThai === 'da_huy' ? '#f44336' : '#e8f5e9', color: hd.trangThai === 'da_huy' ? '#fff' : '#333' }}>
                            {statusLabel[hd.trangThai || 'sap_dien_ra'] || 'Sắp diễn ra'}
                          </span>
                        </div>
                        <p className="activity-title">{hd.tenHoatDong}</p>
                        <p className="activity-time">🕐 {hd.thoiGianBatDau ? new Date(hd.thoiGianBatDau).toLocaleDateString('vi-VN') : ''}</p>
                        <div className="activity-footer">
                          <span className="participants-badge">{hd.soLuongThanhVien || 0} tham gia</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="section-block section-block-last">
              <div className="section-heading">
                <h3>Hoạt động nổi bật</h3>
              </div>
              <div className="hscroll">
                {featuredActivities.map((hd) => (
                  <FeaturedCard key={hd.hoatDongId} hd={hd} />
                ))}
              </div>
            </section>
          </div>

          <nav className="bottom-nav">
            <button className="bottom-nav-item bottom-nav-active">
              <span className="bottom-nav-icon">🏠</span>
              Trang chủ
            </button>
            <button className="bottom-nav-item">
              <span className="bottom-nav-icon">🎯</span>
              Hoạt động
            </button>
            <button className="bottom-nav-item">
              <span className="bottom-nav-icon">💬</span>
              Tin nhắn
            </button>
            <button className="bottom-nav-item" onClick={() => setMenuMo(true)}>
              <span className="bottom-nav-icon">👤</span>
              Cá nhân
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  const desktopView = (
    <div className="desktop-view">
      <aside className="sidebar">
        <div className="drawer-brand">
          <div className="brand-icon" style={{ width: 44, height: 44, fontSize: 22 }}>🌿</div>
        </div>
        <nav className="sidebar-nav">
          <NavItems onNavigate={(href) => { if (href === '#my-activities') { document.getElementById('my-activities')?.scrollIntoView({ behavior: 'smooth' }); } }} />
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Trang chủ</h1>
          <div className="search-bar topbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm kiếm hoạt động, bạn bè..." />
          </div>
          <div className="topbar-user">
            <span className="user-badge">ID: {nguoiDungId}</span>
            <button className="icon-btn icon-btn-bell" aria-label="Thông báo">
              🔔
              <span className="bell-dot" />
            </button>
            <Avatar mau="var(--primary-600)" chu="B" kichThuoc={36} />
          </div>
        </header>

        <div className="content-body">
          <AIBanner />

          <div className="post-create-box">
            <textarea
              className="post-create-input"
              placeholder="Bạn đang nghĩ gì?"
              value={postInput}
              onChange={(e) => setPostInput(e.target.value)}
              rows={3}
            />
            {postImage && (
              <div className="post-create-preview">
                <img src={postImage} alt="preview" />
                <button className="post-create-remove-img" onClick={() => setPostImage('')}>✕</button>
              </div>
            )}
            <div className="post-create-toolbar">
              <label className="post-create-image-btn">
                📷 Ảnh
                <input type="file" accept="image/*" hidden onChange={handlePostImageChange} />
              </label>
              <button
                className="post-create-submit"
                disabled={(!postInput.trim() && !postImage) || posting}
                onClick={handlePostSubmit}
              >
                {posting ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </div>

          <button className="create-activity-btn" onClick={() => setShowCreateModal(true)}>
            ➕ Tạo hoạt động
          </button>
          <CategoryChips chon={danhMucChon} onChon={setDanhMucChon} />

          <section className="section-block">
            <div className="section-heading">
              <h3>Hoạt động gần bạn</h3>
              <a href="#" className="section-link">XEM THÊM</a>
            </div>
            <div className="grid-activities">
              {recentActivities.map((hd) => (
                <ActivityCard key={hd.hoatDongId} hd={hd} />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h3>Người đồng hành đề xuất</h3>
            </div>
            <div className="grid-companions">
              {suggestions.map((ng) => (
                <CompanionCard key={ng.nguoiDungId || ng.nguoiDungId2} ng={ng} />
              ))}
            </div>
          </section>

          <section className="section-block" id="my-activities">
            <div className="section-heading">
              <h3>Hoạt động của tôi</h3>
            </div>
            {loading ? (
              <p className="cam-hint">Đang tải...</p>
            ) : myActivities.length === 0 ? (
              <p className="cam-hint">Bạn chưa tạo hoạt động nào.</p>
            ) : (
              <div className="grid-activities">
                {myActivities.map((hd) => {
                  const thumb = hd.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan;
                  const statusLabel: Record<string, string> = { sap_dien_ra: 'Sắp diễn ra', dang_dien_ra: 'Đang diễn ra', da_ket_thuc: 'Đã kết thúc', da_huy: 'Đã hủy' };
                  return (
                    <div key={hd.hoatDongId} className="activity-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedActivity(hd)}>
                      <div className="activity-thumb" style={{ background: thumb ? `url(${thumb}) center/cover` : '#e8f5e9' }}>
                        <span className="distance-badge" style={{ background: hd.trangThai === 'da_huy' ? '#f44336' : '#e8f5e9', color: hd.trangThai === 'da_huy' ? '#fff' : '#333' }}>
                          {statusLabel[hd.trangThai || 'sap_dien_ra'] || 'Sắp diễn ra'}
                        </span>
                      </div>
                      <p className="activity-title">{hd.tenHoatDong}</p>
                      <p className="activity-time">🕐 {hd.thoiGianBatDau ? new Date(hd.thoiGianBatDau).toLocaleDateString('vi-VN') : ''}</p>
                      <div className="activity-footer">
                        <span className="participants-badge">{hd.soLuongThanhVien || 0} tham gia</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h3>Hoạt động nổi bật</h3>
            </div>
            <div className="grid-featured">
              {featuredActivities.map((hd) => (
                <FeaturedCard key={hd.hoatDongId} hd={hd} />
              ))}
            </div>
          </section>

          <section className="section-block section-block-last">
            <div className="section-heading">
              <h3>Bài viết gần đây</h3>
            </div>
            {posts.map((bv) => (
              <article key={bv.baiVietId} className="post-card">
                <div className="post-header">
                  <Avatar mau="#7c4dff" chu={(bv.nguoiDung || '?').charAt(0).toUpperCase()} />
                  <div className="post-header-info">
                    <p className="post-author">{bv.nguoiDung || 'Người dùng'}</p>
                    <p className="post-meta">
                      {bv.thoiGianTao ? new Date(bv.thoiGianTao).toLocaleDateString('vi-VN') : ''}
                      {bv.hoatDongLienQuan && (
                        <> · <span className="post-tag">🎯 {bv.hoatDongLienQuan}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <p className="post-content">{bv.noiDung}</p>
                {bv.hinhAnh && <div className="post-image" style={{ background: `url(${bv.hinhAnh}) center/cover` }} />}
                <div className="post-stats">
                  <span>👍 {bv.soLuotThich || 0} lượt thích</span>
                  <span>{bv.soBinhLuan || 0} bình luận · {bv.soLuotChiaSe || 0} chia sẻ</span>
                </div>
                <div className="post-actions">
                  <button className="post-action-btn">👍 Thích</button>
                  <button className="post-action-btn">💬 Bình luận</button>
                  <button className="post-action-btn">↗️ Chia sẻ</button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );

  const handleActivityDeleted = (id: number) => {
    setMyActivities((prev) => prev.map((a) => a.hoatDongId === id ? { ...a, trangThai: 'da_huy' } : a));
    setSelectedActivity(null);
  };

  const handleActivityEdited = () => {
    setSelectedActivity(null);
    getMyActivitiesApi()
      .then((res) => { if (res.success && res.data) setMyActivities(res.data); })
      .catch(() => {});
  };

  return (
    <>
      {mobileView}
      {desktopView}
      {showCreateModal && <CreateActivityModal onClose={() => setShowCreateModal(false)} />}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onCancel={handleActivityDeleted}
          onEdited={handleActivityEdited}
        />
      )}
    </>
  );
}

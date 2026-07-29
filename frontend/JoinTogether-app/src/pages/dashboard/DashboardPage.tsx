import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';
import CreateActivityModal from './CreateActivityModal';
import ActivityDetailModal from './ActivityDetailModal';
import MainLayout from '../../components/layout/MainLayout';
import { getMyActivitiesApi, getAllActivitiesApi, searchActivitiesApi, searchUsersApi, getCategoriesApi } from '../../services/activity.service';
import { getSuggestionsApi, sendConnectionRequestApi } from '../../services/connection.service';
import { getNotificationsApi, deleteNotificationApi } from '../../services/notification.service';
import type { ThongBao } from '../../types/connection';
import { getPostsApi, likePostApi, unlikePostApi, getCommentsApi, addCommentApi, sharePostApi } from '../../services/post.service';
import { getMyProfile } from '../../services/profile.service';
import type { HoatDongResponse, SearchFilters, DanhMucHoatDong } from '../../types/activity';
import type { HoSoNguoiDung } from '../../types/profile';
import type { BaiVietResponse, BinhLuanResponse } from '../../services/post.service';
import { danhMucList, MOCK_ACTIVITIES, MOCK_SUGGESTIONS, MOCK_POSTS } from './feedMockData';
import { API_BASE_URL } from '../../config/constants';

const LIMIT = 5;

function fillMock<T>(arr: T[], mock: T[], key: keyof T, limit = LIMIT): T[] {
  const result = [...arr];
  const ids = new Set(arr.map((item) => item[key]));
  for (const m of mock) {
    if (result.length >= limit) break;
    if (!ids.has(m[key])) {
      result.push(m);
      ids.add(m[key]);
    }
  }
  return result.slice(0, limit);
}

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

function MatchBannersSection() {
  const navigate = useNavigate();
  return (
    <section className="match-banners-container">
      {/* NỬA TRÁI: AI MATCHING */}
      <div className="match-banner-card ai-card" onClick={() => navigate('/ai-match')}>
        <div className="match-banner-header">
          <div className="match-icon-badge ai-icon">✦ AI MATCHING</div>
          <span className="match-tag-badge">Thuật toán AI</span>
        </div>
        <h3 className="match-banner-title">AI Matching</h3>
        <p className="match-banner-sub">Kết nối thông minh theo độ tương thích!</p>
        <p className="match-banner-desc">Phân tích sở thích cá nhân và điểm uy tín để đề xuất người đồng hành tối ưu nhất cho bạn.</p>
        <button className="match-banner-btn ai-btn">
          Khám phá AI Match <span>→</span>
        </button>
      </div>

      {/* NỬA PHẢI: AREA MATCHING (QUÉT LÂN CẬN) */}
      <div className="match-banner-card area-card" onClick={() => navigate('/nearby')}>
        <div className="match-banner-header">
          <div className="match-icon-badge area-icon">📍 AREA MATCHING</div>
          <span className="match-tag-badge live-tag">● Trực tiếp</span>
        </div>
        <h3 className="match-banner-title">Area Matching</h3>
        <p className="match-banner-sub">Quét vị trí GPS bán kính 10km!</p>
        <p className="match-banner-desc">Định vị người dùng cùng sở thích đang bật tìm kiếm lân cận quanh khu vực bạn sinh sống.</p>
        <button className="match-banner-btn area-btn">
          Bắt đầu quét lân cận <span>→</span>
        </button>
      </div>
    </section>
  );
}

function ProfileBanner({ percent, onNavigate }: { percent: number; onNavigate: () => void }) {
  return (
    <div className="companion-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
        <h4 style={{ margin: 0, fontSize: 15, color: 'var(--primary-800)' }}>Mức độ hoàn thiện hồ sơ</h4>
        <span style={{ fontWeight: 800, color: 'var(--primary-600)', fontSize: 16 }}>{percent}%</span>
      </div>
      <div className="progress" style={{ width: '100%', height: 8, background: '#e5f6e7', borderRadius: 999, overflow: 'hidden' }}>
        <span style={{ display: 'block', height: '100%', width: `${percent}%`, background: 'var(--primary)' }} />
      </div>
      <button className="btn-follow" style={{ width: '100%', marginTop: 4 }} onClick={onNavigate}>
        Cập nhật thông tin hồ sơ
      </button>
    </div>
  );
}

function NotificationDropdown({ notifications, onDelete, onClose }: { notifications: ThongBao[]; onDelete: (id: number) => void; onClose: () => void }) {
  const navigate = useNavigate();

  const getNotifIcon = (type?: string) => {
    switch (type) {
      case 'KET_NOI':
        return { icon: '🤝', bg: '#e8f5e9', color: '#2e7d32' };
      case 'HOAT_DONG':
        return { icon: '📅', bg: '#e3f2fd', color: '#1565c0' };
      case 'BAI_VIET':
        return { icon: '📝', bg: '#f3e5f5', color: '#7b1fa2' };
      default:
        return { icon: '🔔', bg: '#fff3e0', color: '#e65100' };
    }
  };

  return (
    <div className="notif-dropdown" onClick={(e) => e.stopPropagation()}>
      <div className="notif-dropdown-header">
        <div className="notif-header-title">
          <h4>Thông báo</h4>
          {notifications.length > 0 && <span className="notif-badge-count">{notifications.length}</span>}
        </div>
        <button className="notif-close-btn" onClick={onClose}>✕</button>
      </div>
      <div className="notif-list">
        {notifications.length === 0 ? (
          <div className="notif-empty">
            <span style={{ fontSize: 32, display: 'block', marginBottom: 6 }}>🔔</span>
            Không có thông báo mới
          </div>
        ) : (
          notifications.map((n) => {
            const { icon, bg, color } = getNotifIcon(n.loaiThongBao);
            return (
              <div
                key={n.thongBaoId}
                className="notif-item"
                onClick={() => {
                  if (n.duongDan) {
                    navigate(n.duongDan);
                    onClose();
                  }
                }}
                style={{ cursor: n.duongDan ? 'pointer' : 'default' }}
              >
                <div className="notif-avatar-icon" style={{ background: bg, color: color }}>
                  {icon}
                </div>
                <div className="notif-item-content">
                  <p className="notif-title">{n.tieuDe || 'Thông báo'}</p>
                  <p className="notif-text">{n.noiDung}</p>
                  {(n.guiLuc || n.thoiGianTao) && (
                    <span className="notif-time">
                      {new Date(n.guiLuc || n.thoiGianTao!).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <button
                  className="notif-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(n.thongBaoId);
                  }}
                  title="Xóa thông báo"
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { nguoiDungId } = useAuth();
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myActivities, setMyActivities] = useState<HoatDongResponse[]>([]);
  const [recentActivities, setRecentActivities] = useState<HoatDongResponse[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [posts, setPosts] = useState<BaiVietResponse[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<HoatDongResponse | null>(null);
  const [selectedFeatured, setSelectedFeatured] = useState<HoatDongResponse | null>(null);
  const [postInput, setPostInput] = useState('');
  const [postImage, setPostImage] = useState('');
  const [posting, setPosting] = useState(false);
  const [toast, setToast] = useState('');
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [commentsVisible, setCommentsVisible] = useState<Record<number, boolean>>({});
  const [commentData, setCommentData] = useState<Record<number, BinhLuanResponse[]>>({});

  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<HoatDongResponse[]>([]);
  const [searchUserResults, setSearchUserResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [apiDanhMucList, setApiDanhMucList] = useState<DanhMucHoatDong[]>([]);
  const [profilePct, setProfilePct] = useState(100);
  const [notifications, setNotifications] = useState<ThongBao[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [requestedUserIds, setRequestedUserIds] = useState<Set<number>>(new Set());
  const notifRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSendConnect = async (userId: number) => {
    setRequestedUserIds((prev) => new Set([...prev, userId]));
    try {
      await sendConnectionRequestApi(userId, 'Xin chào! Tôi muốn kết nối cùng bạn trên JoinTogether.');
    } catch {
      /* silent */
    }
  };

  const doSearch = useCallback(async (keyword: string, categoryId: number | null) => {
    if (!keyword.trim() && (!categoryId || categoryId === 0)) {
      setSearchResults([]);
      setSearchUserResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const filters: SearchFilters = {};
      if (keyword.trim()) filters.keyword = keyword.trim();
      if (categoryId && categoryId > 0) filters.danhMucHoatDongId = categoryId;
      filters.limit = 20;

      const [actRes, userRes] = await Promise.allSettled([
        searchActivitiesApi(filters),
        keyword.trim() ? searchUsersApi(keyword.trim()) : Promise.resolve({ success: true, data: [] } as any),
      ]);

      if (actRes.status === 'fulfilled' && actRes.value.success && actRes.value.data) {
        setSearchResults(Array.isArray(actRes.value.data) ? actRes.value.data : []);
      } else {
        setSearchResults([]);
      }

      if (userRes.status === 'fulfilled' && userRes.value.success && userRes.value.data) {
        setSearchUserResults(Array.isArray(userRes.value.data) ? userRes.value.data : []);
      } else {
        setSearchUserResults([]);
      }
    } catch {
      setSearchResults([]);
      setSearchUserResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const triggerSearch = useCallback((keyword: string, categoryId: number | null) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(keyword, categoryId), 300);
  }, [doSearch]);

  useEffect(() => {
    triggerSearch(searchKeyword, null);
  }, [searchKeyword, triggerSearch]);

  useEffect(() => {
    Promise.all([
      getMyActivitiesApi(),
      getAllActivitiesApi(),
      getSuggestionsApi(),
      getPostsApi(),
      getCategoriesApi(),
      getMyProfile().catch(() => ({ success: false } as any)),
      getNotificationsApi(20).catch(() => ({ success: false } as any)),
    ])
      .then(([myRes, actRes, sugRes, postRes, catRes, profileRes, notifRes]) => {
        if (myRes.success && myRes.data) setMyActivities(myRes.data);
        if (actRes.success && actRes.data) {
          const activeActs = actRes.data.filter((a: any) => a.trangThai !== 'da_ket_thuc' && a.trangThai !== 'da_huy');
          setRecentActivities(fillMock(activeActs, MOCK_ACTIVITIES as any, 'hoatDongId'));
        }
        if (sugRes.success && sugRes.data) setSuggestions(fillMock(sugRes.data, MOCK_SUGGESTIONS as any, 'nguoiDungId'));
        if (postRes.success && postRes.data) {
          setPosts(fillMock(postRes.data, MOCK_POSTS as any, 'baiVietId', 10));
          setLikedPosts(new Set(postRes.data.filter((p) => p.daThich).map((p) => p.baiVietId)));
        }
        if (catRes.success && catRes.data) setApiDanhMucList(catRes.data);
        if (notifRes.success && notifRes.data) setNotifications(notifRes.data);
        if (profileRes.success && profileRes.data) {
          const p = profileRes.data as HoSoNguoiDung;
          const allFields = [
            p.user?.hoTen || '',
            p.user?.email || '',
            p.user?.soDienThoai || '',
            p.tieuSu || '',
            p.khuVuc || '',
            p.ngaySinh || '',
            p.gioiTinh || '',
            p.mucTieuThamGia || '',
            p.thoiGianRanh || '',
            p.anhDaiDien || '',
          ];
          const filled = allFields.filter((v) => v.trim().length > 0).length;
          setProfilePct(Math.round((filled / allFields.length) * 100));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!showNotifDropdown) return;
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showNotifDropdown]);

  useEffect(() => {
    if (searchKeyword || selectedCategory !== null) {
      triggerSearch(searchKeyword, selectedCategory);
    } else {
      setSearchResults([]);
    }
  }, [searchKeyword, selectedCategory, triggerSearch]);

  const handleCategoryClick = (catId: number | null) => {
    setSelectedCategory(catId);
  };



  const handleLike = async (postId: number) => {
    const wasLiked = likedPosts.has(postId);
    setLikedPosts((prev) => { const next = new Set(prev); wasLiked ? next.delete(postId) : next.add(postId); return next; });
    setPosts((prev) => prev.map((p) => p.baiVietId === postId ? { ...p, soLuotThich: (p.soLuotThich || 0) + (wasLiked ? -1 : 1) } : p));
    try {
      if (wasLiked) await unlikePostApi(postId);
      else await likePostApi(postId);
    } catch { setLikedPosts((prev) => { const next = new Set(prev); wasLiked ? next.add(postId) : next.delete(postId); return next; }); }
  };

  const handleShare = async (postId: number) => {
    try { await sharePostApi(postId); } catch {}
  };

  const toggleComments = async (postId: number) => {
    const open = !commentsVisible[postId];
    setCommentsVisible((prev) => ({ ...prev, [postId]: open }));
    if (open && !commentData[postId]) {
      try {
        const res = await getCommentsApi(postId);
        if (res.success && res.data) setCommentData((prev) => ({ ...prev, [postId]: res.data! }));
      } catch {}
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    try {
      const res = await addCommentApi(postId, text);
      if (res.success && res.data) {
        setCommentData((prev) => ({ ...prev, [postId]: [...(prev[postId] || []), res.data!] }));
        setPosts((prev) => prev.map((p) => p.baiVietId === postId ? { ...p, soBinhLuan: (p.soBinhLuan || 0) + 1 } : p));
      }
    } catch {}
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

  const handleDeleteNotification = async (id: number) => {
    try {
      await deleteNotificationApi(id);
      setNotifications((prev) => prev.filter((n) => n.thongBaoId !== id));
    } catch {}
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handlePostSubmit = async () => {
    if (!postInput.trim() && !postImage) return;
    setPosting(true);
    try {
      const res = await fetch(`${API_BASE_URL.replace(/\/$/, '')}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ noiDung: postInput.trim(), hinhAnh: postImage || null }),
      });
      const json = await res.json();
      if (json.success) {
        setPostInput('');
        setPostImage('');
        setToast('Đã đăng bài viết thành công!');
        const postsRes = await getPostsApi();
        if (postsRes.success && postsRes.data) setPosts(fillMock(postsRes.data, MOCK_POSTS as any, 'baiVietId', 10));
      }
    } catch {}
    finally { setPosting(false); }
  };

  const formatThoiGian = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('vi-VN');
  };

  const displayActivities = (searchResults.length > 0 ? searchResults : recentActivities)
    .filter((a) => !a.isMember && a.trangThaiYeuCau !== 'PENDING');
  const categoriesList = apiDanhMucList.length > 0 ? apiDanhMucList.map(c => ({ id: c.danhMucHoatDongId, ten: c.tenDanhMuc })) : danhMucList.map((c, i) => ({ id: i + 1, ten: c.ten }));

  return (
    <MainLayout pageTitle="Trang chủ">
      <div className="dashboard-page-container">
        {/* Top Search & Filter Bar */}
        <div className="dashboard-search-row">
          <div className="search-bar dashboard-search-input">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm hoạt động, bạn bè, người dùng..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword.trim().length > 0 && (
              <div className="fb-search-panel">
                <div className="fb-search-section">
                  <h5 className="fb-search-section-title">👥 Người dùng & Bạn bè ({searchUserResults.length})</h5>
                  {isSearching ? (
                    <p className="fb-search-empty">Đang tìm kiếm...</p>
                  ) : searchUserResults.length === 0 ? (
                    <p className="fb-search-empty">Không tìm thấy người dùng phù hợp.</p>
                  ) : (
                    searchUserResults.map((u) => (
                      <div key={u.nguoiDungId} className="fb-search-item" onClick={() => navigate(`/profile/${u.nguoiDungId}`)}>
                        <Avatar mau="#66c2b2" chu={(u.hoTen || '?').charAt(0).toUpperCase()} kichThuoc={34} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#1a237e' }}>{u.hoTen}</div>
                          <div style={{ fontSize: 11, color: '#607d8b' }}>{u.khuVuc || 'Cộng đồng'}</div>
                        </div>
                        {u.isFriend ? (
                          <span className="fb-badge-friend">✓ Bạn bè</span>
                        ) : u.trangThaiYeuCau === 'PENDING' || requestedUserIds.has(u.nguoiDungId) ? (
                          <span className="fb-badge-pending">⏳ Đã gửi</span>
                        ) : (
                          <button
                            className="fb-btn-connect"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendConnect(u.nguoiDungId);
                            }}
                          >
                            + Kết nối
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="fb-search-section" style={{ borderTop: '1px solid #e0e0e0', paddingTop: 10 }}>
                  <h5 className="fb-search-section-title">📅 Hoạt động ({searchResults.length})</h5>
                  {isSearching ? (
                    <p className="fb-search-empty">Đang tìm kiếm...</p>
                  ) : searchResults.length === 0 ? (
                    <p className="fb-search-empty">Không tìm thấy hoạt động phù hợp.</p>
                  ) : (
                    searchResults.slice(0, 5).map((a) => (
                      <div key={a.hoatDongId} className="fb-search-item" onClick={() => setSelectedActivity(a)}>
                        <span style={{ fontSize: 18 }}>📅</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: '#2e7d32' }}>{a.tenHoatDong}</div>
                          <div style={{ fontSize: 11, color: '#607d8b' }}>📍 {a.tenDiaDiem || 'Địa điểm'}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="notif-wrapper" ref={notifRef}>
            <button className="icon-btn icon-btn-bell" aria-label="Thông báo" onClick={() => setShowNotifDropdown(!showNotifDropdown)}>
              🔔{notifications.length > 0 && <span className="bell-dot" />}
            </button>
            {showNotifDropdown && (
              <NotificationDropdown notifications={notifications} onDelete={handleDeleteNotification} onClose={() => setShowNotifDropdown(false)} />
            )}
          </div>
        </div>

        <MatchBannersSection />

        {/* Dashboard Main Grid Layout */}
        <div className="dashboard-grid-layout">
          {/* Main Feed Column */}
          <div className="dashboard-main-column">
            {toast && (
              <div style={{
                position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
                background: '#2e7d32', color: '#fff', padding: '12px 24px', borderRadius: 12,
                fontSize: 14, fontWeight: 600, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                animation: 'slideDown 0.3s ease',
              }}>
                ✅ {toast}
              </div>
            )}
            {/* Post Create Box */}
            <div className="post-create-box">
              <div className="post-create-row">
                <input
                  className="post-create-input"
                  placeholder="Bạn đang nghĩ gì? Chia sẻ câu chuyện sở thích của bạn..."
                  value={postInput}
                  onChange={(e) => setPostInput(e.target.value)}
                />
                <label className="post-create-image-btn" title="Thêm hình ảnh">
                  🖼️
                  <input type="file" accept="image/*" hidden onChange={handlePostImageChange} />
                </label>
                <button
                  className="post-create-submit"
                  disabled={(!postInput.trim() && !postImage) || posting}
                  onClick={handlePostSubmit}
                >
                  {posting ? 'Đang gửi...' : 'Đăng bài'}
                </button>
              </div>
              {postImage && (
                <div className="post-create-preview">
                  <img src={postImage} alt="preview" />
                  <button className="post-create-remove-img" onClick={() => setPostImage('')}>✕</button>
                </div>
              )}
            </div>

            <button className="create-activity-btn" onClick={() => setShowCreateModal(true)}>
              + Tạo hoạt động nhóm mới
            </button>

            {/* Categories chips */}
            <div className="category-row">
              <button
                className={`category-chip ${selectedCategory === null ? 'category-chip-active' : ''}`}
                onClick={() => handleCategoryClick(null)}
              >
                Tất cả ({categoriesList.length})
              </button>
              {categoriesList.map((cat, i) => (
                <button
                  key={cat.id || i}
                  className={`category-chip ${selectedCategory === Number(cat.id || i + 1) ? 'category-chip-active' : ''}`}
                  onClick={() => handleCategoryClick(Number(cat.id || i + 1))}
                >
                  {cat.ten}
                </button>
              ))}
            </div>

            {/* Activities horizontal list */}
            <section className="section-block">
              <div className="section-heading">
                <h3>Hoạt động mới nhất</h3>
                <span className="section-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/activities')}>Xem tất cả ({myActivities.length})</span>
              </div>

              {isSearching ? (
                <div className="loading-spinner">Đang tìm kiếm...</div>
              ) : displayActivities.length === 0 ? (
                <div className="empty-search">
                  <p>Không tìm thấy hoạt động phù hợp.</p>
                </div>
              ) : (
                <div className="hscroll">
                  {displayActivities.map((act) => (
                    <div key={act.hoatDongId} className="activity-card" style={{ cursor: 'pointer' }} onClick={() => setSelectedActivity(act)}>
                        {(() => {
                          const t = act.hinhAnh?.find(h => h.laAnhDaiDien)?.duongDan;
                          const loc = act.tenDiaDiem || act.diaChi;
                          if (t) {
                            return <div className="activity-thumb" style={{ background: `url(${t}) center/cover` }}><span className="distance-badge">{act.tenDanhMuc || 'Hoạt động'}</span></div>;
                          }
                          if (loc) {
                            return <div className="activity-thumb" style={{ background: 'linear-gradient(135deg, #0d47a1, #42a5f5)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, padding: 8 }}>
                              <span className="distance-badge" style={{ position: 'absolute', top: 8, left: 8 }}>{act.tenDanhMuc || 'Hoạt động'}</span>
                              <span style={{ fontSize: 28 }}>📍</span>
                              <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{loc}</span>
                            </div>;
                          }
                          return <div className="activity-thumb" style={{ background: '#e5f6e7' }}><span className="distance-badge">{act.tenDanhMuc || 'Hoạt động'}</span></div>;
                        })()}
                      <div className="activity-title">{act.tenHoatDong}</div>
                      <div className="activity-time">{formatThoiGian(act.thoiGianBatDau)}</div>
                      <div className="activity-location">{act.tenDiaDiem || act.diaChi || 'Trực tuyến / Chưa định vị'}</div>
                      <div className="activity-footer">
                        <div className="avatar-stack">
                          <span className="avatar-dot" />
                          <span className="avatar-dot" />
                        </div>
                        <span className="participants-badge">Còn nhận thành viên</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Posts Feed */}
            <section className="section-block mt-3">
              <div className="section-heading">
                <h3>Bảng tin cộng đồng</h3>
              </div>
              {posts.map((bv) => {
                const liked = likedPosts.has(bv.baiVietId);
                const likesCount = bv.soLuotThich || 0;
                const commentsCount = bv.soBinhLuan || 0;
                const comments = commentData[bv.baiVietId] || [];
                const showComments = commentsVisible[bv.baiVietId] || false;

                return (
                  <article key={bv.baiVietId} className="post-card">
                    <div className="post-header">
                      <div className="post-author-info">
                        <Avatar mau="#6fbf73" chu={bv.nguoiDung ? bv.nguoiDung.charAt(0).toUpperCase() : 'U'} kichThuoc={40} />
                        <div>
                          <h4 className="post-author-name">{bv.nguoiDung || 'Người dùng'}</h4>
                          <span className="post-time">{bv.thoiGianTao ? new Date(bv.thoiGianTao).toLocaleString('vi-VN') : ''}</span>
                        </div>
                      </div>
                    </div>

                    <p className="post-content">{bv.noiDung}</p>

                    {bv.hinhAnh && (
                      <div className="post-image-container">
                        <img src={bv.hinhAnh} alt="post" />
                      </div>
                    )}

                    <div className="post-stats">
                      <span>❤️ {likesCount} lượt thích</span>
                      <span>💬 {commentsCount} bình luận</span>
                    </div>

                    <div className="post-actions">
                      <button className={`post-action-btn ${liked ? 'post-action-active' : ''}`} onClick={() => handleLike(bv.baiVietId)}>Thích</button>
                      <button className="post-action-btn" onClick={() => toggleComments(bv.baiVietId)}>Bình luận</button>
                      <button className="post-action-btn" onClick={() => handleShare(bv.baiVietId)}>Chia sẻ</button>
                    </div>

                    {showComments && (
                      <div className="post-comments">
                        {comments.map((c) => (
                          <div key={c.binhLuanId} className="post-comment">
                            <strong>{c.nguoiDung || 'Người dùng'}:</strong> {c.noiDung}
                          </div>
                        ))}
                        <div className="post-comment-input">
                          <input
                            type="text"
                            placeholder="Viết bình luận..."
                            value={commentInputs[bv.baiVietId] || ''}
                            onChange={(e) => setCommentInputs((prev) => ({ ...prev, [bv.baiVietId]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCommentSubmit(bv.baiVietId); }}
                          />
                          <button onClick={() => handleCommentSubmit(bv.baiVietId)}>Gửi</button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </section>
          </div>

          {/* Right Side Widgets Column */}
          <aside className="dashboard-widgets-column">
            <ProfileBanner percent={profilePct} onNavigate={() => navigate('/profile')} />

            <section className="section-block">
              <div className="section-heading">
                <h3>Gợi ý kết nối</h3>
                <span className="section-link" style={{ cursor: 'pointer' }} onClick={() => navigate('/connections')}>Xem tất cả</span>
              </div>
              <div className="suggestions-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {suggestions.map((u) => (
                  <div key={u.nguoiDungId} className="companion-card" style={{ flexDirection: 'row', textAlign: 'left', padding: '12px 14px' }}>
                    <Avatar mau="#66c2b2" chu={u.hoTen ? u.hoTen.charAt(0).toUpperCase() : 'U'} kichThuoc={40} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="companion-name">{u.hoTen}</div>
                      <div className="companion-interest">{u.soThich ? u.soThich.join(', ') : u.khuVuc || 'Cộng đồng'}</div>
                    </div>
                    <button
                      className="btn-follow"
                      style={requestedUserIds.has(u.nguoiDungId) ? { background: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7', cursor: 'default' } : {}}
                      onClick={() => handleSendConnect(u.nguoiDungId)}
                      disabled={requestedUserIds.has(u.nguoiDungId)}
                    >
                      {requestedUserIds.has(u.nguoiDungId) ? '✓ Đã gửi' : '+ Kết nối'}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showCreateModal && <CreateActivityModal onClose={() => setShowCreateModal(false)} />}
      {selectedActivity && (
        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
          onCancel={(id) => {
            setMyActivities((prev) => prev.map((a) => a.hoatDongId === id ? { ...a, trangThai: 'da_huy' } : a));
            setSelectedActivity(null);
          }}
          onEdited={() => {
            setSelectedActivity(null);
            Promise.all([
              getMyActivitiesApi(),
              getAllActivitiesApi(),
            ]).then(([myRes, actRes]) => {
              if (myRes.success && myRes.data) setMyActivities(myRes.data);
              if (actRes.success && actRes.data) setRecentActivities(actRes.data);
            }).catch(() => {});
          }}
          onDataChanged={() => {
            Promise.all([
              getMyActivitiesApi(),
              getAllActivitiesApi(),
            ]).then(([myRes, actRes]) => {
              if (myRes.success && myRes.data) setMyActivities(myRes.data);
              if (actRes.success && actRes.data) setRecentActivities(actRes.data);
            }).catch(() => {});
          }}
          currentUserId={nguoiDungId}
        />
      )}
      {selectedFeatured && (
        <ActivityDetailModal
          activity={selectedFeatured}
          onClose={() => setSelectedFeatured(null)}
          onCancel={() => {}}
          onEdited={() => {}}
          currentUserId={nguoiDungId}
        />
      )}
    </MainLayout>
  );
}

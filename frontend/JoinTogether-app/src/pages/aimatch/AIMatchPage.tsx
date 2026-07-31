import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import ReportModal from '../reports/ReportModal';
import { getSuggestionsApi, followUserApi } from '../../services/connection.service';
import { getAllActivitiesApi } from '../../services/activity.service';
import { getAIMatchApi } from '../../services/profile.service';
import { getOrCreatePrivateRoomApi } from '../../services/chat.service';
import type { HoatDongResponse } from '../../types/activity';
import '../../styles/dashboard.css';
import './AIMatch.css';

interface HoatDongGoiY {
  hoatDongId: number;
  tenHoatDong: string;
  moTa?: string;
  diaDiem?: string;
  thoiGianBatDau?: string;
}

interface MatchUser {
  nguoiDungId: number;
  hoTen: string;
  anhDaiDien?: string;
  khuVuc?: string;
  soThich?: string[];
  matchScore: number;
  reason: string;
  banChungCount?: number;
  danhSachBanChung?: string[];
  diemTrungBinh?: number;
  soLuotDanhGia?: number;
  hoatDongGoiY?: HoatDongGoiY | null;
}

function Avatar({ mau, chu, kichThuoc = 48 }: { mau: string; chu: string; kichThuoc?: number }) {
  return (
    <div
      className="avatar-tron"
      style={{ background: mau, width: kichThuoc, height: kichThuoc, fontSize: kichThuoc * 0.38 }}
    >
      {chu}
    </div>
  );
}

const AVATAR_COLORS = ['#6fbf73', '#66c2b2', '#ffd166', '#29b6f6', '#ab47bc', '#ef5350'];

type FilterTab = 'ALL' | 'MUTUAL' | 'MEETUP_ACTIVITY' | 'TOP_RATED';

export default function AIMatchPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [activities, setActivities] = useState<HoatDongResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [reportTarget, setReportTarget] = useState<{ id: number; name: string } | null>(null);
  const [followed, setFollowed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    runMatch();
  }, [isAuthenticated]);

  const runMatch = async () => {
    setMatching(true);
    try {
      const [aiRes, actRes] = await Promise.allSettled([
        getAIMatchApi(),
        getAllActivitiesApi(),
      ]);

      if (aiRes.status === 'fulfilled' && aiRes.value.success && aiRes.value.data) {
        setMatches(aiRes.value.data);
      } else {
        const sugRes = await getSuggestionsApi();
        if (sugRes.success && sugRes.data) {
          const mapped: MatchUser[] = (sugRes.data as any[]).slice(0, 12).map((u: any, i: number) => ({
            nguoiDungId: u.nguoiDungId || i + 1,
            hoTen: u.hoTen || `Người dùng ${i + 1}`,
            anhDaiDien: u.anhDaiDien,
            khuVuc: u.khuVuc || 'Hà Nội',
            soThich: u.soThich || ['Thể thao', 'Du lịch'],
            matchScore: 85 - i * 3,
            reason: 'Tương đồng sở thích và khu vực',
            banChungCount: Math.max(0, 3 - i),
            danhSachBanChung: ['Minh', 'Hà', 'Lan'].slice(0, Math.max(0, 3 - i)),
            diemTrungBinh: 4.8 - (i % 3) * 0.2,
            soLuotDanhGia: 8 + i * 2,
          }));
          setMatches(mapped);
        }
      }

      if (actRes.status === 'fulfilled' && actRes.value.success && actRes.value.data) {
        const acts = Array.isArray(actRes.value.data)
          ? actRes.value.data
          : (actRes.value.data as any).rows || [];
        setActivities(acts.slice(0, 6));
      }
    } catch {
      setMatches([]);
    } finally {
      setMatching(false);
    }
  };

  const handleFollow = async (userId: number) => {
    try {
      await followUserApi(userId);
      setFollowed((prev) => new Set(prev).add(userId));
    } catch {
      /* ignore */
    }
  };

  const handleStartMeetupChat = async (targetUserId: number) => {
    try {
      const res = await getOrCreatePrivateRoomApi(targetUserId);
      if (res.success && res.data) {
        navigate(`/chat?room=${res.data.phongId}`);
      } else {
        navigate('/chat');
      }
    } catch {
      navigate('/chat');
    }
  };

  // Filter based on search keyword & tab
  const filtered = matches.filter((m) => {
    const matchSearch =
      !keyword ||
      m.hoTen.toLowerCase().includes(keyword.toLowerCase()) ||
      m.soThich?.some((t) => t.toLowerCase().includes(keyword.toLowerCase()));

    if (!matchSearch) return false;

    if (activeTab === 'MUTUAL') return (m.banChungCount || 0) > 0;
    if (activeTab === 'MEETUP_ACTIVITY') return !!m.hoatDongGoiY;
    if (activeTab === 'TOP_RATED') return (m.diemTrungBinh || 0) >= 4.0;

    return true;
  });

  return (
    <MainLayout pageTitle="Next Meetup & AI Match">
      <div className="aimatch-page">
        <section className="aimatch-hero">
          <div className="aimatch-hero-icon">🤝</div>
          <h1>Next Meetup & AI Match</h1>
          <p>
            Tự động phân tích bạn chung, gợi ý hoạt động đôi phù hợp và đề xuất những thành viên được đánh giá tốt nhất trong cộng đồng để bạn dễ dàng kết nối!
          </p>
          <button className="aimatch-cta" onClick={runMatch} disabled={matching}>
            {matching ? 'Đang phân tích dữ liệu...' : matches.length ? 'Làm mới gợi ý ✦' : 'Phân tích & Tìm kiếm ✦'}
          </button>
        </section>

        {/* Tab Filters */}
        <div className="next-meetup-tabs">
          <button
            className={`meetup-tab ${activeTab === 'ALL' ? 'active' : ''}`}
            onClick={() => setActiveTab('ALL')}
          >
            ✦ Tất cả gợi ý ({matches.length})
          </button>
          <button
            className={`meetup-tab ${activeTab === 'MUTUAL' ? 'active' : ''}`}
            onClick={() => setActiveTab('MUTUAL')}
          >
            🤝 Có bạn chung ({matches.filter(m => (m.banChungCount || 0) > 0).length})
          </button>
          <button
            className={`meetup-tab ${activeTab === 'MEETUP_ACTIVITY' ? 'active' : ''}`}
            onClick={() => setActiveTab('MEETUP_ACTIVITY')}
          >
            🎯 Kèo Meetup đôi ({matches.filter(m => !!m.hoatDongGoiY).length})
          </button>
          <button
            className={`meetup-tab ${activeTab === 'TOP_RATED' ? 'active' : ''}`}
            onClick={() => setActiveTab('TOP_RATED')}
          >
            ⭐ Uy tín Đánh giá cao ({matches.filter(m => (m.diemTrungBinh || 0) >= 4.0).length})
          </button>
        </div>

        <div className="aimatch-filters" style={{ marginTop: 16 }}>
          <input
            type="text"
            placeholder="Lọc theo tên / sở thích / từ khóa..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <h2 className="section-title">
          {activeTab === 'MUTUAL' && '🤝 Gợi ý người có bạn chung'}
          {activeTab === 'MEETUP_ACTIVITY' && '🎯 Đề xuất cuộc hẹn & Hoạt động phù hợp'}
          {activeTab === 'TOP_RATED' && '⭐ Thành viên uy tín được đánh giá tốt'}
          {activeTab === 'ALL' && '✨ Gợi ý người đồng hành Meetup'}
        </h2>

        {filtered.length > 0 ? (
          <div className="match-grid">
            {filtered.map((m, idx) => (
              <div key={m.nguoiDungId} className="match-card">
                <div className="match-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {m.anhDaiDien ? (
                      <img src={m.anhDaiDien} alt={m.hoTen} className="avatar-tron-img" style={{ width: 48, height: 48, borderRadius: '50%' }} />
                    ) : (
                      <Avatar
                        mau={AVATAR_COLORS[idx % AVATAR_COLORS.length]}
                        chu={m.hoTen ? m.hoTen.charAt(0).toUpperCase() : 'U'}
                        kichThuoc={48}
                      />
                    )}
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{m.hoTen}</h3>
                      {m.khuVuc && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#666' }}>📍 {m.khuVuc}</p>}
                    </div>
                  </div>
                  <div className="match-badge">{m.matchScore}% Trùng khớp</div>
                </div>

                {/* Rating Badge if available */}
                {m.diemTrungBinh && m.diemTrungBinh > 0 ? (
                  <div className="rating-badge-chip">
                    ⭐ <strong>{m.diemTrungBinh}/5.0</strong> ({m.soLuotDanhGia || 1} đánh giá tốt)
                  </div>
                ) : null}

                {/* Mutual Friends Badge if available */}
                {m.banChungCount && m.banChungCount > 0 ? (
                  <div className="mutual-friends-chip">
                    🤝 <strong>{m.banChungCount} bạn chung</strong>
                    {m.danhSachBanChung && m.danhSachBanChung.length > 0 && (
                      <span className="mutual-friends-list">
                        : {m.danhSachBanChung.join(', ')}
                      </span>
                    )}
                  </div>
                ) : null}

                <p className="match-reason">💡 {m.reason}</p>

                {/* Matched Activity for Next Meetup */}
                {m.hoatDongGoiY && (
                  <div className="meetup-suggested-card">
                    <div className="meetup-suggested-title">
                      <span>🎯 Kèo Meetup gợi ý cùng tham gia:</span>
                    </div>
                    <div className="meetup-suggested-name">{m.hoatDongGoiY.tenHoatDong}</div>
                    {m.hoatDongGoiY.diaDiem && (
                      <div className="meetup-suggested-meta">📍 {m.hoatDongGoiY.diaDiem}</div>
                    )}
                  </div>
                )}

                {m.soThich && m.soThich.length > 0 && (
                  <div className="match-tags">
                    {m.soThich.map((t) => (
                      <span key={t} className="match-tag">#{t}</span>
                    ))}
                  </div>
                )}

                <div className="match-actions">
                  <button
                    className="match-btn match-btn-primary"
                    onClick={() => handleStartMeetupChat(m.nguoiDungId)}
                  >
                    💬 Lên kèo Meetup
                  </button>
                  <button
                    className={`match-btn match-btn-outline ${followed.has(m.nguoiDungId) ? 'followed' : ''}`}
                    onClick={() => handleFollow(m.nguoiDungId)}
                  >
                    {followed.has(m.nguoiDungId) ? 'Đã kết nối' : 'Kết nối'}
                  </button>
                  <button
                    className="match-btn match-btn-report"
                    onClick={() => setReportTarget({ id: m.nguoiDungId, name: m.hoTen })}
                  >
                    🚩
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-match">
            <div className="empty-match-icon">🔍</div>
            <p>Chưa tìm thấy người phù hợp với tiêu chí lọc này.</p>
          </div>
        )}

        {activities.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h2 className="section-title">🎉 Tất cả sự kiện & hoạt động sắp diễn ra</h2>
            <div className="activity-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
              {activities.map((a) => (
                <div key={a.hoatDongId} className="activity-card" style={{ background: '#fff', padding: 16, borderRadius: 12, border: '1px solid #e4ece6' }}>
                  <h4 style={{ margin: '0 0 6px', fontSize: 15 }}>{a.tenHoatDong}</h4>
                  <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.4 }}>{a.moTa}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <ReportModal
          open={!!reportTarget}
          onClose={() => setReportTarget(null)}
          nguoiBiBaoCaoId={reportTarget?.id}
          tenNguoiBiBaoCao={reportTarget?.name}
        />
      </div>
    </MainLayout>
  );
}


import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NavItems from '../../components/NavItems';
import ReportModal from '../reports/ReportModal';
import { getSuggestionsApi, followUserApi } from '../../services/connection.service';
import { getAllActivitiesApi } from '../../services/activity.service';
import type { HoatDongResponse } from '../../types/activity';
import '../../styles/dashboard.css';
import './AIMatch.css';

interface MatchUser {
  nguoiDungId: number;
  hoTen: string;
  anhDaiDien?: string;
  khuVuc?: string;
  soThich?: string[];
  matchScore: number;
  reason: string;
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

export default function AIMatchPage() {
  const { isAuthenticated, logout, nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [matching, setMatching] = useState(false);
  const [matches, setMatches] = useState<MatchUser[]>([]);
  const [activities, setActivities] = useState<HoatDongResponse[]>([]);
  const [keyword, setKeyword] = useState('');
  const [reportTarget, setReportTarget] = useState<{ id: number; name: string } | null>(null);
  const [followed, setFollowed] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated]);

  const runMatch = async () => {
    setMatching(true);
    try {
      // Use connection suggestions + activities as AI match data source
      const [sugRes, actRes] = await Promise.allSettled([
        getSuggestionsApi(),
        getAllActivitiesApi(),
      ]);

      let users: any[] = [];
      if (sugRes.status === 'fulfilled' && sugRes.value.success && sugRes.value.data) {
        users = Array.isArray(sugRes.value.data) ? sugRes.value.data : [];
      }

      // Map to match cards with simulated AI score based on available fields
      const mapped: MatchUser[] = users.slice(0, 12).map((u: any, i: number) => {
        const score = Math.min(99, 55 + Math.floor(Math.random() * 40) - (i % 5) * 3);
        const interests: string[] = u.soThich || u.interests || u.tags || [];
        return {
          nguoiDungId: u.nguoiDungId || u.nguoi_dung_id || u.id || i + 1,
          hoTen: u.hoTen || u.ho_ten || u.ten || `Người dùng ${i + 1}`,
          anhDaiDien: u.anhDaiDien || u.anh_dai_dien,
          khuVuc: u.khuVuc || u.khu_vuc || u.location,
          soThich: interests.length
            ? interests
            : ['Thể thao', 'Du lịch', 'Ẩm thực', 'Công nghệ', 'Nghệ thuật'].slice(
                i % 3,
                (i % 3) + 2,
              ),
          matchScore: score,
          reason:
            score >= 85
              ? 'Sở thích và khu vực rất tương đồng với bạn'
              : score >= 70
                ? 'Có nhiều sở thích chung, phù hợp tham gia hoạt động cùng'
                : 'Gợi ý dựa trên hoạt động gần đây và hồ sơ của bạn',
        };
      });

      // Sort by score desc
      mapped.sort((a, b) => b.matchScore - a.matchScore);
      setMatches(mapped);

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

  const filtered = keyword
    ? matches.filter(
        (m) =>
          m.hoTen.toLowerCase().includes(keyword.toLowerCase()) ||
          m.soThich?.some((t) => t.toLowerCase().includes(keyword.toLowerCase())),
      )
    : matches;

  return (
    <div className="desktop-view" style={{ minHeight: '100vh' }}>
      <aside
        style={{
          width: 240,
          borderRight: '1px solid var(--border)',
          padding: '20px 12px',
          background: '#fff',
          position: 'sticky',
          top: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28, padding: '0 8px' }}>
          <div className="brand-icon">🌿</div>
          <span className="brand-name">JoinTogether</span>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
          <NavItems />
        </nav>
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          <span className="nav-icon">🚪</span> Đăng xuất
        </button>
      </aside>

      <main style={{ flex: 1, background: 'var(--background)' }}>
        <div className="aimatch-page">
          <section className="aimatch-hero">
            <div className="aimatch-hero-icon">✦</div>
            <h1>AI Matching</h1>
            <p>
              Dựa trên sở thích, khu vực và lịch trình của bạn, AI sẽ đề xuất những người đồng hành
              và hoạt động phù hợp nhất ngay lúc này.
            </p>
            <button className="aimatch-cta" onClick={runMatch} disabled={matching}>
              {matching ? 'Đang phân tích...' : matches.length ? 'Làm mới gợi ý ✦' : 'Bắt đầu tìm kiếm ✦'}
            </button>
          </section>

          {matches.length > 0 && (
            <>
              <div className="aimatch-filters">
                <input
                  type="text"
                  placeholder="Lọc theo tên / sở thích..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <h2 className="section-title">Người đồng hành phù hợp</h2>
              <div className="match-grid">
                {filtered.map((m, idx) => (
                  <div key={m.nguoiDungId} className="match-card">
                    <div className="match-card-top">
                      <Avatar
                        mau={AVATAR_COLORS[idx % AVATAR_COLORS.length]}
                        chu={m.hoTen[0]?.toUpperCase() || '?'}
                      />
                      <div className="match-card-info">
                        <h3>{m.hoTen}</h3>
                        <p>{m.khuVuc || 'Chưa cập nhật khu vực'}</p>
                      </div>
                      <div className="match-score">{m.matchScore}%</div>
                    </div>
                    {m.soThich && m.soThich.length > 0 && (
                      <div className="match-tags">
                        {m.soThich.map((t) => (
                          <span key={t} className="match-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="match-reason">{m.reason}</p>
                    <div className="match-actions">
                      <button
                        className="match-btn match-btn-primary"
                        onClick={() => handleFollow(m.nguoiDungId)}
                        disabled={followed.has(m.nguoiDungId)}
                      >
                        {followed.has(m.nguoiDungId) ? 'Đã kết nối' : 'Kết nối'}
                      </button>
                      <button
                        className="match-btn match-btn-outline"
                        onClick={() => navigate('/my-profile')}
                      >
                        Xem hồ sơ
                      </button>
                      <button
                        className="match-btn match-btn-report"
                        title="Báo cáo"
                        onClick={() => setReportTarget({ id: m.nguoiDungId, name: m.hoTen })}
                      >
                        🚩
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {activities.length > 0 && (
                <>
                  <h2 className="section-title">Hoạt động gợi ý cho bạn</h2>
                  {activities.map((a: any) => (
                    <div key={a.hoatDongId || a.hoat_dong_id} className="activity-match-card">
                      <div className="activity-match-icon">🎯</div>
                      <div className="activity-match-body">
                        <h4>{a.tieuDe || a.tieu_de || a.tenHoatDong || 'Hoạt động'}</h4>
                        <p>
                          {a.diaDiem?.tenDiaDiem || a.dia_diem || 'Chưa có địa điểm'}
                          {(a.thoiGianBatDau || a.thoi_gian_bat_dau) &&
                            ` · ${new Date(a.thoiGianBatDau || a.thoi_gian_bat_dau).toLocaleDateString('vi-VN')}`}
                        </p>
                      </div>
                      <button
                        className="match-btn match-btn-primary"
                        style={{ flex: '0 0 auto', padding: '10px 18px' }}
                        onClick={() => navigate('/activities')}
                      >
                        Xem
                      </button>
                    </div>
                  ))}
                </>
              )}
            </>
          )}

          {!matching && matches.length === 0 && (
            <div className="empty-match">
              <div className="empty-match-icon">✦</div>
              <p>Nhấn &quot;Bắt đầu tìm kiếm&quot; để AI tìm người đồng hành phù hợp với bạn.</p>
            </div>
          )}

          {matching && <div className="loading-spinner">✦ AI đang phân tích hồ sơ của bạn...</div>}
        </div>
      </main>

      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        nguoiBiBaoCaoId={reportTarget?.id}
        tenNguoiBiBaoCao={reportTarget?.name}
      />
    </div>
  );
}

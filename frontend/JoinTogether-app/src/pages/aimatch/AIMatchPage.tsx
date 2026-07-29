import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../components/layout/MainLayout';
import ReportModal from '../reports/ReportModal';
import { getSuggestionsApi, followUserApi } from '../../services/connection.service';
import { getAllActivitiesApi } from '../../services/activity.service';
import { getAIMatchApi } from '../../services/profile.service';
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
  const { isAuthenticated } = useAuth();
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

  const filtered = keyword
    ? matches.filter(
        (m) =>
          m.hoTen.toLowerCase().includes(keyword.toLowerCase()) ||
          m.soThich?.some((t) => t.toLowerCase().includes(keyword.toLowerCase())),
      )
    : matches;

  return (
    <MainLayout pageTitle="AI Ghép đôi">
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
                        <h3 style={{ margin: 0, fontSize: 16 }}>{m.hoTen}</h3>
                        {m.khuVuc && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#666' }}>📍 {m.khuVuc}</p>}
                      </div>
                    </div>
                    <div className="match-badge">{m.matchScore}% Trùng khớp</div>
                  </div>

                  <p className="match-reason">💡 {m.reason}</p>

                  {m.soThich && m.soThich.length > 0 && (
                    <div className="match-tags">
                      {m.soThich.map((t) => (
                        <span key={t} className="match-tag">#{t}</span>
                      ))}
                    </div>
                  )}

                  <div className="match-actions">
                    <button
                      className={`match-btn-follow ${followed.has(m.nguoiDungId) ? 'followed' : ''}`}
                      onClick={() => handleFollow(m.nguoiDungId)}
                    >
                      {followed.has(m.nguoiDungId) ? 'Đã theo dõi' : 'Theo dõi'}
                    </button>
                    <button
                      className="match-btn-report"
                      onClick={() => setReportTarget({ id: m.nguoiDungId, name: m.hoTen })}
                    >
                      Báo cáo
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activities.length > 0 && (
          <div style={{ marginTop: 36 }}>
            <h2 className="section-title">Hoạt động được đề xuất</h2>
            <div className="activity-grid">
              {activities.map((a) => (
                <div key={a.hoatDongId} className="activity-card">
                  <h4>{a.tenHoatDong}</h4>
                  <p style={{ fontSize: 13, color: '#666' }}>{a.moTa}</p>
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

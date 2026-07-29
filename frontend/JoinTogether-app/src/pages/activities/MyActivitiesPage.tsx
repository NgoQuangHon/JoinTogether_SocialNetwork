import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMyActivitiesApi } from '../../services/activity.service';
import type { HoatDongResponse } from '../../types/activity';
import SidebarLayout from '../../components/SidebarLayout';
import ActivityDetailModal from '../dashboard/ActivityDetailModal';
import '../../styles/dashboard.css';
import './MyActivities.css';

const TRANG_THAI_LABEL: Record<string, string> = {
  sap_dien_ra: 'Sắp diễn ra',
  dang_dien_ra: 'Đang diễn ra',
  da_ket_thuc: 'Đã kết thúc',
  da_huy: 'Đã hủy',
};

function MyActivityCard({ hd, currentUserId, onClick }: { hd: HoatDongResponse; currentUserId?: number | null; onClick: () => void }) {
  const thumb = hd.hinhAnh?.find((h) => h.laAnhDaiDien)?.duongDan;
  const status = TRANG_THAI_LABEL[hd.trangThai || 'sap_dien_ra'] || 'Sắp diễn ra';
  const isCancelled = hd.trangThai === 'da_huy';
  const isOwner = currentUserId != null && hd.nguoiToChucId === currentUserId;
  let roleTag = '';
  let roleColor = '';
  if (isOwner) { roleTag = 'owner'; roleColor = '#2e7d32'; }
  else if (hd.isMember) { roleTag = 'member'; roleColor = '#1565c0'; }
  else if (hd.trangThaiYeuCau === 'PENDING') { roleTag = 'đã gửi yêu cầu'; roleColor = '#e65100'; }
  return (
    <div className="my-activity-card" onClick={onClick}>
      {(() => {
        const loc = hd.tenDiaDiem || hd.diaChi;
        if (thumb) {
          return <div className="my-activity-thumb" style={{ background: `url(${thumb}) center/cover`, position: 'relative' }}>
            <span className={`my-activity-badge ${isCancelled ? 'badge-cancelled' : ''}`}>{status}</span>
            {roleTag && (
              <span style={{ position: 'absolute', top: 8, right: 8, background: roleColor, color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{roleTag}</span>
            )}
          </div>;
        }
        if (loc) {
          return <div className="my-activity-thumb" style={{ background: 'linear-gradient(135deg, #0d47a1, #42a5f5)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4, padding: 8 }}>
            <span className={`my-activity-badge ${isCancelled ? 'badge-cancelled' : ''}`}>{status}</span>
            {roleTag && (
              <span style={{ position: 'absolute', top: 8, right: 8, background: roleColor, color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{roleTag}</span>
            )}
            <span style={{ fontSize: 28 }}>📍</span>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{loc}</span>
          </div>;
        }
        return <div className="my-activity-thumb" style={{ background: '#e8f5e9', position: 'relative' }}>
          <span className={`my-activity-badge ${isCancelled ? 'badge-cancelled' : ''}`}>{status}</span>
          {roleTag && (
            <span style={{ position: 'absolute', top: 8, right: 8, background: roleColor, color: '#fff', padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }}>{roleTag}</span>
          )}
        </div>;
      })()}
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
  const { nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<HoatDongResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<HoatDongResponse | null>(null);
  const [filter, setFilter] = useState<string>('sap_dien_ra');

  const filteredActivities = filter === 'tat-ca'
    ? activities
    : activities.filter((a) => a.trangThai === filter);

  useEffect(() => {
    getMyActivitiesApi()
      .then((res) => { if (res.success && res.data) setActivities(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
    <div className="my-filter-bar" style={{ marginBottom: 20 }}>
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
    <SidebarLayout title="Hoạt động của tôi">
      <div className="my-activities-container">
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
            <div className="my-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {filteredActivities.map((hd) => (
                <MyActivityCard key={hd.hoatDongId} hd={hd} currentUserId={nguoiDungId} onClick={() => setSelectedActivity(hd)} />
              ))}
            </div>
          </>
        )}

        {selectedActivity && (
          <ActivityDetailModal
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
            onCancel={handleDeleted}
            onEdited={handleEdited}
            onDataChanged={() => {
              getMyActivitiesApi()
                .then((res) => { if (res.success && res.data) setActivities(res.data); })
                .catch(() => {});
            }}
            currentUserId={nguoiDungId}
          />
        )}
      </div>
    </SidebarLayout>
  );
}

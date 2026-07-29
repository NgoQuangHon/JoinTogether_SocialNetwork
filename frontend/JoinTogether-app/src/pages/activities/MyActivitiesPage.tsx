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
  const { nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<HoatDongResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState<HoatDongResponse | null>(null);
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
                <MyActivityCard key={hd.hoatDongId} hd={hd} onClick={() => setSelectedActivity(hd)} />
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
            currentUserId={nguoiDungId}
          />
        )}
      </div>
    </SidebarLayout>
  );
}

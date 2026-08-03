import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllActivitiesApi, getMembersApi } from '../../services/activity.service';
import type { HoatDongResponse } from '../../types/activity';
import './ReportActivityMember.css';

export default function ReportActivityMember() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<HoatDongResponse[]>([]);
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await getAllActivitiesApi();
      if (res.success && res.data) {
        setActivities(res.data);
      }
    } catch (err: any) {
      setError('Không thể tải danh sách hoạt động.');
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSelectActivity = async (activityId: number) => {
    setSelectedActivityId(activityId);
    setSelectedMemberId(null);
    setMembers([]);
    setLoadingMembers(true);
    setError('');

    try {
      const res = await getMembersApi(activityId);
      if (res.success && res.data) {
        setMembers(res.data);
      }
    } catch {
      setError('Không thể tải danh sách thành viên của hoạt động này.');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleContinue = () => {
    if (!selectedActivityId) {
      setError('Vui lòng chọn một hoạt động.');
      return;
    }
    if (!selectedMemberId) {
      setError('Vui lòng chọn thành viên tham gia cần báo cáo.');
      return;
    }

    const selectedMember = members.find(m => (m.nguoiDungId || m.nguoi_dung_id || m.id) === selectedMemberId);

    navigate('/report/reason', {
      state: {
        hoatDongId: selectedActivityId,
        thanhVienId: selectedMember?.thanhVienId || selectedMember?.thanh_vien_id || null,
        nguoiBiBaoCaoId: selectedMemberId,
        targetUserName: selectedMember?.hoTen || selectedMember?.ho_ten || 'Thành viên'
      }
    });
  };

  return (
    <div className="report-select-page">
      <header className="select-header">
        <button className="back-button" onClick={() => navigate('/sus')}>
          ← Quay lại SUS
        </button>
        <h1>🚨 Báo cáo vi phạm</h1>
      </header>

      <main className="select-container">
        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Chọn hoạt động */}
        <section className="select-section">
          <h2>1. Chọn hoạt động liên quan</h2>
          <p>Chọn hoạt động xảy ra hành vi vi phạm:</p>

          {loadingActivities ? (
            <div className="loading-text">Đang tải danh sách hoạt động...</div>
          ) : activities.length === 0 ? (
            <div className="empty-text">Chưa có hoạt động nào trong hệ thống.</div>
          ) : (
            <div className="activity-dropdown-container">
              <select
                className="select-input"
                value={selectedActivityId || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val) handleSelectActivity(val);
                }}
              >
                <option value="">-- Click để chọn hoạt động --</option>
                {activities.map((act) => (
                  <option key={act.hoatDongId} value={act.hoatDongId}>
                    #{act.hoatDongId} - {act.tenHoatDong} ({act.trangThai})
                  </option>
                ))}
              </select>
            </div>
          )}
        </section>

        {/* Step 2: Chọn thành viên */}
        {selectedActivityId && (
          <section className="select-section">
            <h2>2. Chọn thành viên tham gia vi phạm</h2>
            <p>Chọn người dùng cần báo cáo trong hoạt động này:</p>

            {loadingMembers ? (
              <div className="loading-text">Đang tải danh sách thành viên...</div>
            ) : members.length === 0 ? (
              <div className="empty-text">Hoạt động này chưa có thành viên nào khác.</div>
            ) : (
              <div className="member-grid">
                {members.map((mem) => {
                  const uId = mem.nguoiDungId || mem.nguoi_dung_id || mem.id;
                  const name = mem.hoTen || mem.ho_ten || mem.tenDangNhap || `Người dùng #${uId}`;
                  const isSelected = selectedMemberId === uId;

                  return (
                    <div
                      key={uId}
                      className={`member-card ${isSelected ? 'selected' : ''}`}
                      onClick={() => setSelectedMemberId(uId)}
                    >
                      <div className="member-avatar">
                        {mem.anhDaiDien ? (
                          <img src={mem.anhDaiDien} alt={name} />
                        ) : (
                          <div className="avatar-placeholder">👤</div>
                        )}
                      </div>
                      <div className="member-info">
                        <span className="member-name">{name}</span>
                        <span className="member-role">{mem.vaiTro || 'Thành viên'}</span>
                      </div>
                      {isSelected && <span className="check-badge">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        <div className="button-group">
          <button className="cancel-button" onClick={() => navigate('/sus')}>
            Hủy
          </button>
          <button
            className="continue-button"
            disabled={!selectedActivityId || !selectedMemberId}
            onClick={handleContinue}
          >
            Tiếp tục (Chọn lý do) →
          </button>
        </div>
      </main>
    </div>
  );
}

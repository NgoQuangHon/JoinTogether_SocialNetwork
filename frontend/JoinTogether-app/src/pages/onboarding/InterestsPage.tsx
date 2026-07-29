import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getInterestCategories, addInterest, updateGoals } from '../../services/interest.service';
import type { InterestCategory } from '../../services/interest.service';
import './Onboarding.css';

const GOAL_OPTIONS = [
  { value: 'ket-ban', label: 'Kết bạn mới' },
  { value: 'hoc-hoi', label: 'Học hỏi kỹ năng' },
  { value: 'giao-luu', label: 'Giao lưu cộng đồng' },
  { value: 'thu-gian', label: 'Thư giãn giải trí' },
  { value: 'the-duc', label: 'Rèn luyện sức khỏe' },
  { value: 'thien-nguyen', label: 'Hoạt động tình nguyện' },
  { value: 'trai-nghiem', label: 'Trải nghiệm mới' },
  { value: 'khac', label: 'Mục đích khác' },
];

const DAY_OPTIONS = [
  { value: 'thu-2', label: 'Thứ 2' }, { value: 'thu-3', label: 'Thứ 3' },
  { value: 'thu-4', label: 'Thứ 4' }, { value: 'thu-5', label: 'Thứ 5' },
  { value: 'thu-6', label: 'Thứ 6' }, { value: 'thu-7', label: 'Thứ 7' },
  { value: 'cn', label: 'Chủ nhật' },
];

const TIME_OPTIONS = [
  { value: 'sang', label: 'Buổi sáng (6h-12h)' },
  { value: 'chieu', label: 'Buổi chiều (12h-18h)' },
  { value: 'toi', label: 'Buổi tối (18h-22h)' },
  { value: 'dem', label: 'Đêm khuya (22h-6h)' },
];

const RADIUS_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 25, label: '25 km' },
  { value: 50, label: '50 km' },
  { value: 0, label: 'Không giới hạn' },
];

export default function InterestsPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<InterestCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<Set<number>>(new Set());
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [radius, setRadius] = useState<number>(25);
  const [saving, setSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getInterestCategories()
      .then((res) => {
        if (res.success && res.data) {
          setCategories(res.data);
        }
      })
      .catch(() => setError('Không thể tải danh sách sở thích.'))
      .finally(() => setLoading(false));
  }, []);

  const toggleInterest = (id: number) => {
    setSelectedInterests((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleGoal = (value: string) => {
    setSelectedGoals((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleDay = (value: string) => {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const toggleTime = (value: string) => {
    setSelectedTimes((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const needsMoreInterests = selectedInterests.size < 3;

  const handleFinish = async () => {
    setSaving(true);
    setError('');
    try {
      await Promise.all(
        Array.from(selectedInterests).map((soThichId) =>
          addInterest(soThichId, 3).catch(() => {}),
        ),
      );
      const mucTieuThamGia = selectedGoals.length > 0 ? selectedGoals.join(', ') : '';
      const daysText = selectedDays.length > 0 ? `Các ngày: ${selectedDays.join(', ')}` : '';
      const timesText = selectedTimes.length > 0 ? `Thời gian: ${selectedTimes.join(', ')}` : '';
      const thoiGianRanh = [daysText, timesText].filter(Boolean).join('; ');
      await updateGoals({ mucTieuThamGia, thoiGianRanh, banKinhMongMuon: radius || null });
    } catch {
      setError('Lưu thông tin thất bại. Vui lòng thử lại.');
      setSaving(false);
      return;
    }
    setSaving(false);
    setShowComplete(true);
  };

  if (loading) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-container" style={{ textAlign: 'center', paddingTop: 80 }}>
          <div className="spinner" />
          <p style={{ marginTop: 16, color: 'var(--text-light)' }}>Đang tải sở thích...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-container">
        <div className="onboarding-header">
          <div className="step-indicator">
            <div className="step-dot done">✓</div>
            <div className="step-line done" />
            <div className="step-dot done">✓</div>
            <div className="step-line done" />
            <div className="step-dot active">3</div>
          </div>
          <h1>Hoàn thiện hồ sơ</h1>
          <p className="subtitle">Chọn sở thích, mục tiêu và thời gian rảnh của bạn.</p>
        </div>

        {error && <div className="edit-error">{error}</div>}

        {needsMoreInterests && (
          <div className="interest-warning">
            <strong>Lưu ý:</strong> Bạn mới chọn {selectedInterests.size} sở thích. Việc chọn ít nhất 3 sở thích giúp
            hệ thống gợi ý và kết nối bạn với những người phù hợp hơn.
          </div>
        )}

        {/* === SỞ THÍCH === */}
        <section className="onboarding-section">
          <h3 className="section-title">Sở thích của bạn</h3>
          <p className="section-desc">Đã chọn: {selectedInterests.size}</p>
          {categories.length === 0 ? (
            <p style={{ color: 'var(--text-light)' }}>Chưa có sở thích nào.</p>
          ) : (
            categories.map((cat) => (
              <div key={cat.danhMucSoThichId ?? 'khac'} style={{ marginBottom: 24 }}>
                {cat.tenDanhMuc && (
                  <h4 style={{ color: 'var(--primary-700)', marginBottom: 10, fontSize: 15 }}>
                    {cat.tenDanhMuc}
                  </h4>
                )}
                <div className="interests-grid">
                  {cat.soThich.map((item) => (
                    <button
                      key={item.soThichId}
                      className={`interest-card ${selectedInterests.has(item.soThichId) ? 'selected' : ''}`}
                      onClick={() => toggleInterest(item.soThichId)}
                    >
                      <span className="interest-label">{item.tenSoThich}</span>
                      {selectedInterests.has(item.soThichId) && <span className="interest-check">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* === MỤC TIÊU === */}
        <section className="onboarding-section">
          <h3 className="section-title">Bạn muốn tham gia để làm gì?</h3>
          <div className="goals-grid">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal.value}
                className={`goal-card ${selectedGoals.includes(goal.value) ? 'selected' : ''}`}
                onClick={() => toggleGoal(goal.value)}
              >
                <span className="goal-label">{goal.label}</span>
                {selectedGoals.includes(goal.value) && <span className="goal-check">✓</span>}
              </button>
            ))}
          </div>
        </section>

        {/* === THỜI GIAN RẢNH === */}
        <section className="onboarding-section">
          <h3 className="section-title">Khi nào bạn rảnh?</h3>
          <p className="section-desc">Chọn ngày trong tuần</p>
          <div className="day-grid">
            {DAY_OPTIONS.map((day) => (
              <button
                key={day.value}
                className={`day-chip ${selectedDays.includes(day.value) ? 'selected' : ''}`}
                onClick={() => toggleDay(day.value)}
              >
                {day.label}
              </button>
            ))}
          </div>
          <p className="section-desc" style={{ marginTop: 16 }}>Chọn khung giờ</p>
          <div className="goals-grid">
            {TIME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`goal-card ${selectedTimes.includes(opt.value) ? 'selected' : ''}`}
                onClick={() => toggleTime(opt.value)}
              >
                <span className="goal-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* === PHẠM VI MONG MUỐN === */}
        <section className="onboarding-section">
          <h3 className="section-title">Phạm vi mong muốn</h3>
          <p className="section-desc">Bạn muốn kết nối với những người trong bán kính bao xa?</p>
          <div className="radius-grid">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                className={`radius-chip ${radius === opt.value ? 'selected' : ''}`}
                onClick={() => setRadius(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </section>

        <div className="onboarding-actions">
          <span className="selected-count">
            {needsMoreInterests
              ? `Cần chọn ít nhất 3 sở thích để gợi ý tốt hơn (hiện tại: ${selectedInterests.size})`
              : `${selectedInterests.size} sở thích đã chọn`}
          </span>
          <button
            className="primary-btn"
            disabled={saving}
            onClick={handleFinish}
          >
            {saving ? 'Đang lưu...' : 'Hoàn tất'}
          </button>
        </div>
      </div>

      {showComplete && (
        <div className="modal-overlay" onClick={() => setShowComplete(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="complete-icon">🎉</div>
            <h1>Hồ sơ của bạn đã hoàn tất!</h1>
            <p className="subtitle">
              Sở thích, mục tiêu và phạm vi mong muốn đã được lưu. Dữ liệu của bạn sẽ được sử dụng
              để gợi ý những người và hoạt động phù hợp nhất.
            </p>
            <div className="progress-bar-wrap">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '100%' }} />
              </div>
              <span className="progress-label">100%</span>
            </div>
            <div className="step-summary">
              <div className="summary-item done">
                <span className="summary-num">1</span>
                <span>Tài khoản</span>
                <span className="summary-check">✓</span>
              </div>
              <div className="summary-item done">
                <span className="summary-num">2</span>
                <span>Hồ sơ</span>
                <span className="summary-check">✓</span>
              </div>
              <div className="summary-item done">
                <span className="summary-num">3</span>
                <span>Sở thích</span>
                <span className="summary-check">✓</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center' }}>
              <button className="primary-btn" onClick={() => navigate('/dashboard', { replace: true })}>
                Khám phá ngay
              </button>
              <button className="outline-btn" onClick={() => navigate('/profile', { replace: true })} style={{ padding: '12px 24px', border: '2px solid var(--primary, #6fbf73)', borderRadius: 14, background: 'none', color: 'var(--primary-700, #4b9651)', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                Xem lại hồ sơ và chỉnh sửa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

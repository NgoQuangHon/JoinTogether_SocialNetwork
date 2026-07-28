import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { addInterest, updateGoals } from '../../services/interest.service';
import './Onboarding.css';

const MOCK_INTERESTS = [
  { soThichId: 1, tenSoThich: 'Đá bóng', icon: '⚽', color: '#4CAF50' },
  { soThichId: 2, tenSoThich: 'Chạy bộ', icon: '🏃', color: '#FF9800' },
  { soThichId: 3, tenSoThich: 'Bơi lội', icon: '🏊', color: '#03A9F4' },
  { soThichId: 4, tenSoThich: 'Cầu lông', icon: '🏸', color: '#26A69A' },
  { soThichId: 5, tenSoThich: 'Yoga', icon: '🧘', color: '#9E9E9E' },
  { soThichId: 6, tenSoThich: 'Xem phim', icon: '🎬', color: '#9C27B0' },
  { soThichId: 7, tenSoThich: 'Chơi game', icon: '🎮', color: '#673AB7' },
  { soThichId: 8, tenSoThich: 'Nghe nhạc', icon: '🎵', color: '#E91E63' },
  { soThichId: 9, tenSoThich: 'Nhảy múa', icon: '💃', color: '#F06292' },
  { soThichId: 10, tenSoThich: 'Học tập', icon: '📚', color: '#2196F3' },
  { soThichId: 11, tenSoThich: 'Đọc sách', icon: '📖', color: '#795548' },
  { soThichId: 12, tenSoThich: 'Cờ vua', icon: '♟️', color: '#424242' },
  { soThichId: 13, tenSoThich: 'Du lịch', icon: '✈️', color: '#00BCD4' },
  { soThichId: 14, tenSoThich: 'Cắm trại', icon: '🏕️', color: '#8BC34A' },
  { soThichId: 15, tenSoThich: 'Tình nguyện', icon: '💚', color: '#4CAF50' },
  { soThichId: 16, tenSoThich: 'Vẽ tranh', icon: '🎨', color: '#FFC107' },
  { soThichId: 17, tenSoThich: 'Chụp ảnh', icon: '📷', color: '#607D8B' },
  { soThichId: 18, tenSoThich: 'Viết lách', icon: '✍️', color: '#5C6BC0' },
  { soThichId: 19, tenSoThich: 'Nấu ăn', icon: '🍳', color: '#FF5722' },
  { soThichId: 20, tenSoThich: 'Làm vườn', icon: '🌱', color: '#66BB6A' },
];

const GOAL_OPTIONS = [
  { value: 'ket-ban', label: 'Kết bạn mới', icon: '🤝' },
  { value: 'hoc-hoi', label: 'Học hỏi kỹ năng', icon: '📚' },
  { value: 'giao-luu', label: 'Giao lưu cộng đồng', icon: '🗣️' },
  { value: 'thu-gian', label: 'Thư giãn giải trí', icon: '😌' },
  { value: 'the-duc', label: 'Rèn luyện sức khỏe', icon: '💪' },
  { value: 'thien-nguyen', label: 'Hoạt động tình nguyện', icon: '💚' },
  { value: 'trai-nghiem', label: 'Trải nghiệm mới', icon: '✨' },
  { value: 'khac', label: 'Mục đích khác', icon: '🎯' },
];

const DAY_OPTIONS = [
  { value: 'thu-2', label: 'Thứ 2' },
  { value: 'thu-3', label: 'Thứ 3' },
  { value: 'thu-4', label: 'Thứ 4' },
  { value: 'thu-5', label: 'Thứ 5' },
  { value: 'thu-6', label: 'Thứ 6' },
  { value: 'thu-7', label: 'Thứ 7' },
  { value: 'cn', label: 'Chủ nhật' },
];

const TIME_OPTIONS = [
  { value: 'sang', label: 'Buổi sáng (6h-12h)', icon: '🌅' },
  { value: 'chieu', label: 'Buổi chiều (12h-18h)', icon: '☀️' },
  { value: 'toi', label: 'Buổi tối (18h-22h)', icon: '🌆' },
  { value: 'dem', label: 'Đêm khuya (22h-6h)', icon: '🌙' },
];

export default function InterestsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get('onboarding') === 'true';
  const [selectedInterests, setSelectedInterests] = useState<Set<number>>(new Set());
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

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

  const canFinish = selectedInterests.size >= 3;

  const handleFinish = async () => {
    if (!canFinish) return;
    setSaving(true);
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
      await updateGoals({ mucTieuThamGia, thoiGianRanh });
    } catch {}
    setSaving(false);
    setShowComplete(true);
  };

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

        {/* === SỞ THÍCH === */}
        <section className="onboarding-section">
          <h3 className="section-title">Sở thích của bạn</h3>
          <p className="section-desc">Chọn ít nhất 3 sở thích (hiện tại: {selectedInterests.size})</p>
          <div className="interests-grid">
            {MOCK_INTERESTS.map((item) => (
              <button
                key={item.soThichId}
                className={`interest-card ${selectedInterests.has(item.soThichId) ? 'selected' : ''}`}
                style={{ '--card-accent': item.color } as React.CSSProperties}
                onClick={() => toggleInterest(item.soThichId)}
              >
                <span className="interest-icon">{item.icon}</span>
                <span className="interest-label">{item.tenSoThich}</span>
                {selectedInterests.has(item.soThichId) && <span className="interest-check">✓</span>}
              </button>
            ))}
          </div>
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
                <span className="goal-icon">{goal.icon}</span>
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
                <span className="goal-icon">{opt.icon}</span>
                <span className="goal-label">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="onboarding-actions">
          <span className="selected-count">Cần chọn ít nhất 3 sở thích</span>
          <button
            className="primary-btn"
            disabled={!canFinish || saving}
            onClick={handleFinish}
          >
            {saving ? 'Đang hoàn tất...' : 'Hoàn tất'}
          </button>
        </div>
      </div>

      {showComplete && (
        <div className="modal-overlay" onClick={() => setShowComplete(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="complete-icon">🎉</div>
            <h1>Hồ sơ của bạn đã hoàn tất!</h1>
            <p className="subtitle">
              Chúc mừng bạn đã hoàn thành tất cả các bước. Hãy bắt đầu khám phá và kết nối với cộng đồng!
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

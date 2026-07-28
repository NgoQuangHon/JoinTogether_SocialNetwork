import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateGoals } from '../../services/interest.service';
import './Onboarding.css';

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

export default function AvailableTimePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get('onboarding') === 'true';
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [showComplete, setShowComplete] = useState(false);

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

  const handleFinish = async () => {
    setSaving(true);
    try {
      const daysText = selectedDays.length > 0 ? `Các ngày: ${selectedDays.join(', ')}` : '';
      const timesText = selectedTimes.length > 0 ? `Thời gian: ${selectedTimes.join(', ')}` : '';
      const thoiGianRanh = [daysText, timesText].filter(Boolean).join('; ');
      await updateGoals({ thoiGianRanh });
    } catch {}
    setSaving(false);
    setShowComplete(true);
  };

  if (showComplete) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-container">
          <div className="complete-popup">
            <div className="complete-icon">🎉</div>
            <h1>Hồ sơ của bạn đã hoàn tất!</h1>
            <p className="subtitle">
              Chúc mừng bạn đã hoàn thành tất cả các bước. Hãy bắt đầu khám phá và kết nối với cộng đồng!
            </p>
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
              <div className="summary-item done">
                <span className="summary-num">4</span>
                <span>Mục tiêu</span>
                <span className="summary-check">✓</span>
              </div>
              <div className="summary-item done">
                <span className="summary-num">5</span>
                <span>Thời gian rảnh</span>
                <span className="summary-check">✓</span>
              </div>
            </div>
            <button className="primary-btn" onClick={() => navigate('/dashboard', { replace: true })}>
              Khám phá ngay
            </button>
          </div>
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
            <div className="step-dot done">✓</div>
            <div className="step-line done" />
            <div className="step-dot done">✓</div>
            <div className="step-line done" />
            <div className="step-dot active">5</div>
          </div>
          <h1>Khi nào bạn rảnh?</h1>
          <p className="subtitle">Chọn thời gian bạn thường rảnh để tham gia hoạt động.</p>
        </div>

        <div className="time-section">
          <h3>Bạn rảnh vào ngày nào?</h3>
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
        </div>

        <div className="time-section">
          <h3>Bạn rảnh vào khung giờ nào?</h3>
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
        </div>

        <div className="onboarding-actions">
          <button
            className="primary-btn"
            disabled={(selectedDays.length === 0 && selectedTimes.length === 0) || saving}
            onClick={handleFinish}
          >
            {saving ? 'Đang hoàn tất...' : 'Hoàn tất'}
          </button>
        </div>
      </div>
    </div>
  );
}

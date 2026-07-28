import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { updateGoals } from '../../services/interest.service';
import './Onboarding.css';

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

export default function GoalsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get('onboarding') === 'true';
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const toggle = (value: string) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  const handleContinue = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    try {
      await updateGoals({ mucTieuThamGia: selected.join(', ') });
    } catch {}
    const dest = onboarding ? '/available-time?onboarding=true' : '/dashboard';
    navigate(dest, { replace: true });
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
            <div className="step-line" />
            <div className="step-dot">4</div>
            <div className="step-line" />
            <div className="step-dot">5</div>
          </div>
          <h1>Bạn muốn tham gia để làm gì?</h1>
          <p className="subtitle">Chọn mục đích tham gia của bạn để chúng tôi có thể đề xuất phù hợp.</p>
        </div>

        <div className="goals-grid">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal.value}
              className={`goal-card ${selected.includes(goal.value) ? 'selected' : ''}`}
              onClick={() => toggle(goal.value)}
            >
              <span className="goal-icon">{goal.icon}</span>
              <span className="goal-label">{goal.label}</span>
              {selected.includes(goal.value) && <span className="goal-check">✓</span>}
            </button>
          ))}
        </div>

        <div className="onboarding-actions">
          <button
            className="primary-btn"
            disabled={selected.length === 0 || saving}
            onClick={handleContinue}
          >
            {saving ? 'Đang lưu...' : 'Tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}

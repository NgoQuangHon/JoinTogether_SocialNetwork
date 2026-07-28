import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getInterestCategories, addInterest } from '../../services/interest.service';
import './Onboarding.css';

interface InterestItem {
  soThichId: number;
  tenSoThich: string;
  icon: string;
  color: string;
}

const MOCK_INTERESTS: InterestItem[] = [
  { soThichId: 1, tenSoThich: 'Đá bóng', icon: '⚽', color: '#4CAF50' },
  { soThichId: 2, tenSoThich: 'Xem phim', icon: '🎬', color: '#9C27B0' },
  { soThichId: 3, tenSoThich: 'Chạy bộ', icon: '🏃', color: '#FF9800' },
  { soThichId: 4, tenSoThich: 'Học tập', icon: '📚', color: '#2196F3' },
  { soThichId: 5, tenSoThich: 'Du lịch', icon: '✈️', color: '#00BCD4' },
  { soThichId: 6, tenSoThich: 'Tình nguyện', icon: '💚', color: '#4CAF50' },
  { soThichId: 7, tenSoThich: 'Nấu ăn', icon: '🍳', color: '#FF5722' },
  { soThichId: 8, tenSoThich: 'Chơi game', icon: '🎮', color: '#673AB7' },
  { soThichId: 9, tenSoThich: 'Nghe nhạc', icon: '🎵', color: '#E91E63' },
  { soThichId: 10, tenSoThich: 'Đọc sách', icon: '📖', color: '#795548' },
  { soThichId: 11, tenSoThich: 'Chụp ảnh', icon: '📷', color: '#607D8B' },
  { soThichId: 12, tenSoThich: 'Vẽ tranh', icon: '🎨', color: '#FFC107' },
  { soThichId: 13, tenSoThich: 'Cắm trại', icon: '🏕️', color: '#8BC34A' },
  { soThichId: 14, tenSoThich: 'Bơi lội', icon: '🏊', color: '#03A9F4' },
  { soThichId: 15, tenSoThich: 'Yoga', icon: '🧘', color: '#9E9E9E' },
  { soThichId: 16, tenSoThich: 'Nhảy múa', icon: '💃', color: '#F06292' },
  { soThichId: 17, tenSoThich: 'Làm vườn', icon: '🌱', color: '#66BB6A' },
  { soThichId: 18, tenSoThich: 'Viết lách', icon: '✍️', color: '#5C6BC0' },
  { soThichId: 19, tenSoThich: 'Cờ vua', icon: '♟️', color: '#424242' },
  { soThichId: 20, tenSoThich: 'Cầu lông', icon: '🏸', color: '#26A69A' },
];

export default function InterestsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const onboarding = searchParams.get('onboarding') === 'true';
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [interests] = useState<InterestItem[]>(MOCK_INTERESTS);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = async () => {
    setSaving(true);
    try {
      await Promise.all(
        Array.from(selected).map((soThichId) =>
          addInterest(soThichId, 3).catch(() => {}),
        ),
      );
    } catch {}
    const dest = onboarding ? '/goals?onboarding=true' : '/dashboard';
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
          </div>
          <h1>Chọn sở thích của bạn</h1>
          <p className="subtitle">Chọn ít nhất 3 sở thích để chúng tôi có thể gợi ý hoạt động phù hợp.</p>
        </div>

        <div className="interests-grid">
          {interests.map((item) => (
            <button
              key={item.soThichId}
              className={`interest-card ${selected.has(item.soThichId) ? 'selected' : ''}`}
              style={{ '--card-accent': item.color } as React.CSSProperties}
              onClick={() => toggle(item.soThichId)}
            >
              <span className="interest-icon">{item.icon}</span>
              <span className="interest-label">{item.tenSoThich}</span>
              {selected.has(item.soThichId) && <span className="interest-check">✓</span>}
            </button>
          ))}
        </div>

        <div className="onboarding-actions">
          <span className="selected-count">Đã chọn: {selected.size} / 20</span>
          <button
            className="primary-btn"
            disabled={selected.size < 3 || saving}
            onClick={handleContinue}
          >
            {saving ? 'Đang lưu...' : 'Tiếp tục'}
          </button>
        </div>
      </div>
    </div>
  );
}

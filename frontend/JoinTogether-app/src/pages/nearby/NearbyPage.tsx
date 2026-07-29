import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile } from '../../services/profile.service';
import SidebarLayout from '../../components/SidebarLayout';
import './Nearby.css';

const SOCKET_URL = 'http://localhost:5000';
const TIMER_SECONDS = 30;
const RADIUS_KM = 10;

type ScanState = 'idle' | 'scanning' | 'match_found' | 'waiting_other' | 'success' | 'cancelled';

interface MatchData {
  matchId: string;
  nguoiDung: {
    nguoiDungId: number;
    hoTen: string;
    anhDaiDien: string | null;
    soThichChung: string[];
    khoangCachKm: number;
  };
  timer: number;
}

interface SuccessData {
  chatRoomId: number;
  friend: { nguoiDungId: number; hoTen: string; anhDaiDien?: string };
}

export default function NearbyPage() {
  const { nguoiDungId } = useAuth();
  const navigate = useNavigate();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);
  const [countdown, setCountdown] = useState(TIMER_SECONDS);
  const [soThich, setSoThich] = useState<string[]>([]);
  const [locationError, setLocationError] = useState('');
  const [accepted, setAccepted] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const posRef = useRef<{ lat: number; lng: number } | null>(null);

  // Lấy sở thích người dùng
  useEffect(() => {
    getMyProfile().then((res) => {
      if (res.success && res.data?.soThich) {
        setSoThich(res.data.soThich.map((s: any) => s.tenSoThich));
      }
    }).catch(() => {});
  }, []);

  // Kết nối Socket.IO
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('nearby_scan_active', () => {
      setScanState('scanning');
    });

    socket.on('nearby_match_found', (data: MatchData) => {
      setMatchData(data);
      setCountdown(TIMER_SECONDS);
      setAccepted(false);
      setScanState('match_found');
      startCountdown();
    });

    socket.on('nearby_match_success', (data: SuccessData) => {
      stopCountdown();
      setSuccessData(data);
      setScanState('success');
    });

    socket.on('nearby_match_cancelled', (data: { reason: string }) => {
      stopCountdown();
      setMatchData(null);
      setAccepted(false);
      if (data.reason === 'timeout') {
        setScanState('scanning');
        // Tự động tìm lại sau 3 giây
        setTimeout(() => retrySearch(), 3000);
      } else {
        setScanState('scanning');
        setTimeout(() => retrySearch(), 3000);
      }
    });

    socket.on('nearby_scan_stopped', () => {
      setScanState('idle');
    });

    socket.on('nearby_error', (data: { message: string }) => {
      console.error('Nearby error:', data.message);
      setScanState('idle');
    });

    return () => {
      socket.disconnect();
      stopCountdown();
    };
  }, []);

  const startCountdown = useCallback(() => {
    stopCountdown();
    setCountdown(TIMER_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopCountdown();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const stopCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const retrySearch = useCallback(() => {
    if (!posRef.current || !nguoiDungId) return;
    socketRef.current?.emit('nearby_scan_start', {
      nguoiDungId,
      viDo: posRef.current.lat,
      kinhDo: posRef.current.lng,
    });
  }, [nguoiDungId]);

  // Bắt đầu quét — xin vị trí GPS
  const handleStartScan = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị GPS. Vui lòng dùng thiết bị khác.');
      return;
    }

    setScanState('scanning');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        posRef.current = { lat, lng };

        socketRef.current?.emit('nearby_scan_start', {
          nguoiDungId,
          viDo: lat,
          kinhDo: lng,
        });
      },
      (err) => {
        setScanState('idle');
        if (err.code === 1) {
          setLocationError('Bạn đã từ chối quyền truy cập vị trí. Vui lòng bật lại trong cài đặt trình duyệt.');
        } else {
          setLocationError('Không thể lấy vị trí của bạn. Vui lòng thử lại.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Dừng quét
  const handleStopScan = () => {
    socketRef.current?.emit('nearby_scan_stop', { nguoiDungId });
    stopCountdown();
    setMatchData(null);
    setScanState('idle');
  };

  // Đồng ý kết nối
  const handleAccept = () => {
    if (!matchData) return;
    setAccepted(true);
    setScanState('waiting_other');
    socketRef.current?.emit('nearby_match_accept', {
      matchId: matchData.matchId,
      nguoiDungId,
    });
  };

  // Từ chối
  const handleDecline = () => {
    if (!matchData) return;
    socketRef.current?.emit('nearby_match_decline', {
      matchId: matchData.matchId,
      nguoiDungId,
    });
    stopCountdown();
    setMatchData(null);
    setScanState('scanning');
    setTimeout(() => retrySearch(), 2000);
  };

  // Countdown ring calculation
  const circumference = 2 * Math.PI * 31; // r=31
  const dashOffset = circumference * (1 - countdown / TIMER_SECONDS);

  return (
    <SidebarLayout title="Tìm bạn lân cận">
      <div className="nearby-page">
        {/* Header */}
        <div className="nearby-header">
          <h1>📍 Tìm bạn lân cận</h1>
          <p>
            Kết nối với người có cùng sở thích trong bán kính <strong>{RADIUS_KM}km</strong>.
            Cả hai cùng đồng ý thì sẽ trở thành bạn bè!
          </p>
        </div>

        {/* Radar */}
        <div className="radar-container">
          {scanState === 'scanning' && (
            <>
              <div className="radar-ring" />
              <div className="radar-ring" />
              <div className="radar-ring" />
            </>
          )}
          <button
            className={`radar-center-btn ${scanState === 'scanning' ? 'scanning' : ''}`}
            onClick={scanState === 'idle' ? handleStartScan : handleStopScan}
          >
            <span className="btn-icon">{scanState === 'scanning' ? '⏹' : '🔍'}</span>
            <span className="btn-label">{scanState === 'scanning' ? 'Dừng' : 'Tìm bạn'}</span>
          </button>
        </div>

        {/* Status */}
        {scanState === 'scanning' && (
          <div className="scan-status-chip">
            <div className="dot" />
            Đang quét trong bán kính {RADIUS_KM}km...
          </div>
        )}

        {/* Location error */}
        {locationError && (
          <div style={{ background: '#ffeaea', border: '1px solid #ffcdd2', color: '#c62828', borderRadius: 12, padding: '10px 16px', fontSize: 13, maxWidth: 380, marginBottom: 16, textAlign: 'center' }}>
            ⚠️ {locationError}
          </div>
        )}

        {/* Interests */}
        <div className="interests-section">
          <h4>Sở thích dùng để ghép cặp</h4>
          <div className="interest-chips">
            {soThich.length > 0 ? (
              soThich.map((s, i) => (
                <span key={i} className="interest-chip">🌱 {s}</span>
              ))
            ) : (
              <span className="interest-chip empty">
                Chưa có sở thích — <a href="/interests" style={{ color: '#2e7d32' }}>Thêm ngay</a>
              </span>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ maxWidth: 400, width: '100%', background: '#fff', borderRadius: 16, padding: '16px 20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', fontSize: 13, color: '#546e7a', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700, color: '#37474f' }}>🔒 Quyền riêng tư</p>
          <p style={{ margin: 0 }}>Vị trí của bạn chỉ được dùng khi đang quét và sẽ <strong>xóa ngay</strong> sau khi dừng. Chúng tôi không lưu vị trí lâu dài.</p>
        </div>
      </div>

      {/* Match Found Overlay */}
      {(scanState === 'match_found' || scanState === 'waiting_other') && matchData && (
        <div className="match-overlay">
          <div className="match-card">
            <div className="match-badge">🎉 Tìm thấy người phù hợp!</div>

            {matchData.nguoiDung.anhDaiDien ? (
              <img className="match-avatar" src={matchData.nguoiDung.anhDaiDien} alt="avatar" />
            ) : (
              <div className="match-avatar-fallback">
                {matchData.nguoiDung.hoTen.charAt(0).toUpperCase()}
              </div>
            )}

            <p className="match-name">{matchData.nguoiDung.hoTen}</p>
            <p className="match-distance">📍 Cách bạn {matchData.nguoiDung.khoangCachKm} km</p>

            {matchData.nguoiDung.soThichChung.length > 0 && (
              <div className="match-common-interests">
                {matchData.nguoiDung.soThichChung.slice(0, 5).map((s, i) => (
                  <span key={i} className="match-interest-chip">🌱 {s}</span>
                ))}
              </div>
            )}

            {/* Countdown ring */}
            <div className="countdown-wrapper">
              <svg className="countdown-svg" viewBox="0 0 72 72">
                <circle className="countdown-bg" cx="36" cy="36" r="31" />
                <circle
                  className={`countdown-progress ${countdown <= 10 ? 'urgent' : ''}`}
                  cx="36" cy="36" r="31"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="countdown-number">{countdown}</div>
            </div>

            {scanState === 'waiting_other' ? (
              <div className="waiting-chip">
                ⏳ Đang chờ phản hồi từ đối phương...
              </div>
            ) : (
              <div className="match-actions">
                <button className="btn-decline" onClick={handleDecline}>
                  ❌ Bỏ qua
                </button>
                <button className="btn-accept" onClick={handleAccept} disabled={accepted}>
                  ✅ Kết nối
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Overlay */}
      {scanState === 'success' && successData && (
        <div className="match-overlay">
          <div className="success-card">
            <div className="success-icon">🎊</div>
            <p className="success-title">Kết nối thành công!</p>
            <p className="success-subtitle">
              Bạn và <strong>{successData.friend.hoTen}</strong> đã kết nối.
              Hãy bắt đầu cuộc trò chuyện!
            </p>

            <button
              className="btn-go-chat"
              onClick={() => navigate(`/chat?room=${successData.chatRoomId}`)}
            >
              💬 Bắt đầu trò chuyện
            </button>
            <button
              className="btn-stay"
              onClick={() => { setSuccessData(null); setScanState('idle'); }}
            >
              Quay lại tìm kiếm
            </button>
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}

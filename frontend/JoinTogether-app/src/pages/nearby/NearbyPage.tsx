import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProfile } from '../../services/profile.service';
import SidebarLayout from '../../components/SidebarLayout';
import './Nearby.css';

import { SOCKET_URL } from '../../config/constants';

const TIMER_SECONDS = 30;
const RADIUS_KM = 10;

type ScanState = 'idle' | 'scanning' | 'match_found' | 'waiting_other' | 'cancelled';

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
  const [countdown, setCountdown] = useState(TIMER_SECONDS);
  const [soThich, setSoThich] = useState<string[]>([]);
  const [locationError, setLocationError] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

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

  // Tự động lấy vị trí khi vào trang để nạp Google Map làm background
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          posRef.current = { lat, lng };
          setCoords({ lat, lng });
        },
        () => {},
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
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

    // CẢ 2 BẤM ĐỒNG Ý -> CHUYỂN NGAY SANG TRANG CHAT
    socket.on('nearby_match_success', (data: SuccessData) => {
      stopCountdown();
      setMatchData(null);
      setScanState('idle');
      navigate(`/chat?room=${data.chatRoomId}`);
    });

    socket.on('nearby_match_waiting', () => {
      setScanState('waiting_other');
    });

    socket.on('nearby_match_cancelled', () => {
      stopCountdown();
      setMatchData(null);
      setAccepted(false);
      setScanState('scanning');
      setTimeout(() => retrySearch(), 3000);
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
  }, [navigate]);

  const stopCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
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
  }, [stopCountdown]);

  const retrySearch = useCallback(() => {
    if (!posRef.current || !nguoiDungId) return;
    socketRef.current?.emit('nearby_scan_start', {
      nguoiDungId: Number(nguoiDungId),
      viDo: posRef.current.lat,
      kinhDo: posRef.current.lng,
    });
  }, [nguoiDungId]);

  // Tự động quét tìm định kỳ mỗi 4s khi đang bật radar scanning
  useEffect(() => {
    if (scanState !== 'scanning') return;
    const interval = setInterval(() => {
      retrySearch();
    }, 4000);
    return () => clearInterval(interval);
  }, [scanState, retrySearch]);

  // Bắt đầu quét — xin vị trí GPS
  const handleStartScan = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt không hỗ trợ định vị GPS.');
      return;
    }

    setScanState('scanning');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        posRef.current = { lat, lng };
        setCoords({ lat, lng });

        socketRef.current?.emit('nearby_scan_start', {
          nguoiDungId: Number(nguoiDungId),
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
    socketRef.current?.emit('nearby_scan_stop', { nguoiDungId: Number(nguoiDungId) });
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
      nguoiDungId: Number(nguoiDungId),
    });
  };

  // Từ chối (Bỏ qua) - Dừng ghép bạn hoàn toàn
  const handleDecline = () => {
    if (!matchData) return;
    socketRef.current?.emit('nearby_match_decline', {
      matchId: matchData.matchId,
      nguoiDungId: Number(nguoiDungId),
    });
    socketRef.current?.emit('nearby_scan_stop', { nguoiDungId: Number(nguoiDungId) });
    stopCountdown();
    setMatchData(null);
    setAccepted(false);
    setScanState('idle');
  };

  // Countdown ring calculation
  const circumference = 2 * Math.PI * 31; // r=31
  const dashOffset = circumference * (1 - countdown / TIMER_SECONDS);

  return (
    <SidebarLayout title="Tìm bạn lân cận">
      {/* Navigation Sub-Tabs cho phép chuyển đổi nhanh giữa Bạn bè, Yêu cầu kết nối, Tìm bạn lân cận */}
      <div className="connection-nav-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e0e0e0', paddingBottom: 10, overflowX: 'auto', position: 'relative', zIndex: 10 }}>
        <button
          onClick={() => navigate('/connections')}
          style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          👥 Bạn bè
        </button>
        <button
          onClick={() => navigate('/requests')}
          style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📩 Yêu cầu kết nối
        </button>
        <button
          onClick={() => navigate('/nearby')}
          style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: '#2e7d32', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📍 Tìm bạn lân cận
        </button>
      </div>
      <div className="nearby-page">
        {/* GOOGLE MAP FIXED BACKGROUND (cố định không thể kéo vuốt) */}
        <div className="nearby-map-bg">
          <iframe
            title="nearby-bg-map"
            width="100%"
            height="100%"
            style={{ border: 0, pointerEvents: 'none' }}
            loading="lazy"
            src={`https://www.google.com/maps?q=${coords ? `${coords.lat},${coords.lng}` : '21.0285,105.8542'}&z=14&output=embed`}
          />
          <div className="nearby-map-overlay" />
        </div>

        {/* Content Container */}
        <div className="nearby-content">
          {/* Header */}
          <div className="nearby-header">
            <h1>📍 Tìm bạn lân cận</h1>
            <p>
              Kết nối với người có cùng sở thích trong bán kính <strong>{RADIUS_KM}km</strong>.
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

          {/* Privacy Note */}
          <div className="privacy-note">
            <p style={{ margin: '0 0 4px', fontWeight: 700, color: '#37474f' }}>🔒 Quyền riêng tư & Bản đồ</p>
            <p style={{ margin: 0 }}>Bản đồ vị trí hiện tại của bạn được nhúng cố định làm hình nền. Vị trí GPS của bạn chỉ dùng để tìm bạn bè lân cận và không lưu trữ lâu dài.</p>
          </div>
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
                ⏳ Đã gửi đồng ý, đang chờ đối phương...
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
    </SidebarLayout>
  );
}

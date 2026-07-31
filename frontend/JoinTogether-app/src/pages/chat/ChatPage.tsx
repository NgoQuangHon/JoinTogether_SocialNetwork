import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import ReportModal from '../reports/ReportModal';
import { getUserRoomsApi, getMessagesApi, sendMessageApi } from '../../services/chat.service';
import type { PhongTroChuyen, TinNhan } from '../../services/chat.service';
import '../../styles/dashboard.css';

import { SOCKET_URL } from '../../config/constants';

export default function ChatPage() {
  const { nguoiDungId } = useAuth();
  const [searchParams] = useSearchParams();
  const roomParam = searchParams.get('room');

  const [rooms, setRooms] = useState<PhongTroChuyen[]>([]);
  const [activeRoom, setActiveRoom] = useState<PhongTroChuyen | null>(null);
  const [messages, setMessages] = useState<TinNhan[]>([]);
  const [inputText, setInputText] = useState('');
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Safety & Anti-Scam state
  const [showScamWarning, setShowScamWarning] = useState(true);
  const [reportTarget, setReportTarget] = useState<{ id?: number; name?: string } | null>(null);

  // Proposal state
  const [myProposal, setMyProposal] = useState<'NONE' | 'AGREED' | 'DECLINED'>('NONE');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [tempRemainingSeconds, setTempRemainingSeconds] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Socket Connection & Listeners
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('receive_message', (msg: TinNhan) => {
      setMessages((prev) => {
        if (prev.some((m) => m.tinNhanId === msg.tinNhanId)) return prev;
        return [...prev, msg];
      });
    });

    socket.on('nearby_friend_pending', (data: { phongId: number; agreedByUserId: number }) => {
      if (data.agreedByUserId === Number(nguoiDungId)) {
        setMyProposal('AGREED');
      }
    });

    socket.on('nearby_friend_accepted', (data: { phongId: number; isFriend: boolean }) => {
      setMyProposal('AGREED');
      setShowSuccessBanner(true);
      setActiveRoom((prev) => (prev ? { ...prev, isFriend: true, hetHanLuc: null } : null));
      setRooms((prev) =>
        prev.map((r) => (r.phongId === data.phongId ? { ...r, isFriend: true, hetHanLuc: null } : r))
      );
      setTimeout(() => setShowSuccessBanner(false), 6000);
    });

    socket.on('nearby_friend_declined', (data: { phongId: number; declinedByUserId: number }) => {
      if (data.declinedByUserId === Number(nguoiDungId)) {
        setMyProposal('DECLINED');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [nguoiDungId]);

  // 2. Socket Join/Leave Room
  useEffect(() => {
    if (activeRoom && socketRef.current) {
      socketRef.current.emit('join_room', activeRoom.phongId);
      return () => {
        socketRef.current?.emit('leave_room', activeRoom.phongId);
      };
    }
  }, [activeRoom]);

  // 3. Load User Rooms & Open Target Room Immediately
  useEffect(() => {
    setLoadingRooms(true);
    getUserRoomsApi()
      .then((res) => {
        if (res.success && res.data) {
          const roomList = res.data;
          setRooms(roomList);

          if (roomParam) {
            const targetId = Number(roomParam);
            const foundIndex = roomList.findIndex(
              (r) =>
                Number(r.phongId) === targetId ||
                String(r.phongId) === String(roomParam) ||
                Number(r.hoatDongId) === targetId
            );

            if (foundIndex !== -1) {
              const foundRoom = roomList[foundIndex];
              // Đưa phòng cần mở lên ĐẦU danh sách (Index 0) để người dùng thấy ngay
              const reordered = [foundRoom, ...roomList.filter((_, idx) => idx !== foundIndex)];
              setRooms(reordered);
              selectRoom(foundRoom);
            } else {
              // Phòng mới được tạo mà chưa kịp nằm trong roomList API
              const newTempRoom: PhongTroChuyen = {
                phongId: targetId,
                tenPhong: 'Cuộc trò chuyện mới',
                loaiPhong: 'RIENG_TU',
                trangThai: 'ACTIVE',
              };
              setRooms((prev) => [newTempRoom, ...prev.filter((r) => Number(r.phongId) !== targetId)]);
              selectRoom(newTempRoom);
            }
          } else if (roomList.length > 0) {
            selectRoom(roomList[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, [roomParam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 4. Calculate 10-Minute Temporary Countdown & Auto Cleanup
  useEffect(() => {
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    setTempRemainingSeconds(null);

    if (activeRoom?.hetHanLuc && !activeRoom?.isFriend) {
      const calcSec = () => {
        const diffMs = new Date(activeRoom.hetHanLuc!).getTime() - Date.now();
        const sec = Math.max(0, Math.floor(diffMs / 1000));
        setTempRemainingSeconds(sec);

        // KHI HẾT 10 PHÚT: Khóa khung chat & tự động loại phòng khỏi danh sách
        if (sec <= 0) {
          setIsReadOnly(true);
          setRooms((prev) => prev.filter((r) => r.phongId !== activeRoom.phongId));
        }
      };
      calcSec();
      countdownTimerRef.current = setInterval(calcSec, 1000);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [activeRoom]);

  const selectRoom = async (roomItem: PhongTroChuyen) => {
    setActiveRoom(roomItem);
    setLoadingMessages(true);
    setErrorMsg('');
    setShowSuccessBanner(false);
    setShowScamWarning(true);
    setMyProposal(roomItem.myProposal || 'NONE');

    const isClosed = roomItem.trangThai === 'CLOSED';
    const isExpired = roomItem.hetHanLuc ? new Date(roomItem.hetHanLuc).getTime() < Date.now() && !roomItem.isFriend : false;
    setIsReadOnly(isClosed || isExpired);

    try {
      const res = await getMessagesApi(roomItem.phongId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể tải tin nhắn phòng trò chuyện.';
      setErrorMsg(msg);
      if (msg.includes('chỉ đọc') || msg.includes('không phải là thành viên') || msg.includes('tạm thời')) {
        setIsReadOnly(true);
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !activeRoom || sending || isReadOnly) return;
    const textToSend = inputText.trim();
    setSending(true);
    setErrorMsg('');

    try {
      const res = await sendMessageApi(activeRoom.phongId, textToSend);
      if (res.success && res.data) {
        setMessages((prev) => {
          if (prev.some((m) => m.tinNhanId === res.data!.tinNhanId)) return prev;
          return [...prev, res.data!];
        });
        setInputText('');
      } else {
        setErrorMsg(res.message || 'Gửi tin nhắn thất bại.');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Gửi tin nhắn thất bại. Vui lòng kiểm tra lại kết nối.';
      setErrorMsg(msg);
    } finally {
      setSending(false);
    }
  };

  const handleAgreeFriend = () => {
    if (!activeRoom) return;
    setMyProposal('AGREED');
    socketRef.current?.emit('nearby_friend_proposal_agree', {
      phongId: activeRoom.phongId,
      nguoiDungId: Number(nguoiDungId),
    });
  };

  const handleDeclineFriend = () => {
    if (!activeRoom) return;
    setMyProposal('DECLINED');
    socketRef.current?.emit('nearby_friend_proposal_decline', {
      phongId: activeRoom.phongId,
      nguoiDungId: Number(nguoiDungId),
    });
    // LƯU Ý: Vẫn cho chat tiếp trong 10 phút, không khóa phòng ngay lập tức!
  };

  const isClosed = activeRoom?.trangThai === 'CLOSED' || isReadOnly;

  const otherMsg = messages.find((m) => m.nguoiGuiId !== Number(nguoiDungId));
  const targetReportUserId = activeRoom?.otherUserId
    ? Number(activeRoom.otherUserId)
    : otherMsg?.nguoiGuiId
    ? Number(otherMsg.nguoiGuiId)
    : undefined;

  return (
    <SidebarLayout title="Trò chuyện">
      <div
        className="chat-page-container"
        style={{
          display: 'grid',
          gridTemplateColumns: '280px 1fr',
          gap: 0,
          background: '#ffffff',
          borderRadius: 16,
          border: '1px solid var(--border, #e4ece6)',
          height: 'calc(100vh - 140px)',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
      >
        {/* Left Side: Rooms List */}
        <div
          className="chat-rooms-sidebar"
          style={{
            borderRight: '1px solid var(--border, #e4ece6)',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            background: '#fafbfc',
          }}
        >
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border, #e4ece6)', flexShrink: 0 }}>
            <h3 style={{ margin: 0, fontSize: 15, color: 'var(--primary-800, #3d7d43)' }}>
              💬 Danh sách trò chuyện ({rooms.length})
            </h3>
          </div>

          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '8px' }}>
            {loadingRooms ? (
              <div style={{ textAlign: 'center', color: '#90a4ae', padding: 20, fontSize: 13 }}>Đang tải danh sách phòng...</div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#90a4ae', padding: 20, fontSize: 13 }}>
                Bạn chưa có cuộc trò chuyện nào. Hãy tham gia hoạt động hoặc quét tìm bạn lân cận!
              </div>
            ) : (
              rooms.map((r) => {
                const isActive = activeRoom?.phongId === r.phongId;
                return (
                  <div
                    key={r.phongId}
                    onClick={() => selectRoom(r)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 12,
                      marginBottom: 4,
                      cursor: 'pointer',
                      background: isActive ? '#e5f6e7' : 'transparent',
                      border: isActive ? '1px solid #c8e6c9' : '1px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <h4 style={{ margin: 0, fontSize: 14, color: isActive ? '#2e7d32' : '#263238', fontWeight: isActive ? 700 : 500 }}>
                        {r.tenPhong}
                      </h4>
                      {r.loaiPhong === 'RIENG_TU' && !r.isFriend && (
                        <span style={{ fontSize: 10, background: '#fff3e0', color: '#e65100', padding: '2px 6px', borderRadius: 8, fontWeight: 700 }}>Tạm thời 10p</span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: r.trangThai === 'CLOSED' ? '#d32f2f' : '#607d8b', marginTop: 4, display: 'block' }}>
                      {r.trangThai === 'CLOSED' ? '🔒 Đã đóng' : r.isFriend ? '👫 Bạn bè' : r.loaiPhong === 'RIENG_TU' ? '💬 Chat tạm thời 10p' : '🟢 Hoạt động'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Room Messages Area */}
        <div
          className="chat-main-area"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            maxHeight: '100%',
            overflow: 'hidden',
            background: '#ffffff',
          }}
        >
          {activeRoom ? (
            <>
              {/* Room Header */}
              <div
                style={{
                  padding: '16px 24px',
                  borderBottom: '1px solid var(--border, #e4ece6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: '#ffffff',
                  flexShrink: 0,
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#3d7d43', display: 'flex', alignItems: 'center', gap: 8 }}>
                    💬 {activeRoom.tenPhong}
                    {tempRemainingSeconds !== null && tempRemainingSeconds > 0 && !activeRoom.isFriend && (
                      <span className="temp-chat-badge">
                        ⏱️ Chat 10p ({Math.floor(tempRemainingSeconds / 60)}:{(tempRemainingSeconds % 60).toString().padStart(2, '0')})
                      </span>
                    )}
                  </h3>
                  <span style={{ fontSize: 12, color: isClosed ? '#d32f2f' : '#2e7d32', fontWeight: 600 }}>
                    {isClosed ? '🔒 Cuộc trò chuyện tạm thời đã kết thúc' : activeRoom.isFriend ? '👫 Bạn bè trực tiếp' : '🟢 Đang trò chuyện tạm thời (Tự xóa sau 10p)'}
                  </span>
                </div>
                {activeRoom.loaiPhong === 'RIENG_TU' && (
                  <button
                    onClick={() =>
                      setReportTarget({
                        id: targetReportUserId,
                        name: activeRoom.tenPhong,
                      })
                    }
                    style={{
                      border: '1px solid #ffcdd2',
                      background: '#fff',
                      color: '#d32f2f',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    🚩 Báo cáo
                  </button>
                )}
              </div>

              {/* SLIDING PROPOSAL BANNER */}
              {activeRoom.loaiPhong === 'RIENG_TU' && !activeRoom.isFriend && !isClosed && (
                <div className="friend-proposal-banner" style={{ flexShrink: 0 }}>
                  <div className="proposal-content">
                    <span className="proposal-icon">🤝</span>
                    <div className="proposal-text">
                      <strong>Đề xuất kết bạn:</strong> Bạn có muốn thêm <strong>{activeRoom.tenPhong}</strong> vào danh sách bạn bè không?
                    </div>
                  </div>

                  {myProposal === 'AGREED' ? (
                    <span className="proposal-status-chip">⏳ Bạn đã đồng ý kết bạn. Đang chờ đối phương...</span>
                  ) : myProposal === 'DECLINED' ? (
                    <span className="proposal-status-chip" style={{ background: '#ffebee', color: '#c62828', borderColor: '#ffcdd2' }}>
                      ❌ Bạn đã từ chối kết bạn. Bạn vẫn có thể trò chuyện trong 10 phút.
                    </span>
                  ) : (
                    <div className="proposal-buttons">
                      <button onClick={handleAgreeFriend} className="btn-agree-friend">
                        ✅ Đồng ý kết bạn
                      </button>
                      <button onClick={handleDeclineFriend} className="btn-decline-friend">
                        ❌ Từ chối
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ANTI-SCAM FRAUD WARNING BANNER FOR FIRST-TIME STRANGER CHAT */}
              {activeRoom.loaiPhong === 'RIENG_TU' && !activeRoom.isFriend && showScamWarning && (
                <div
                  style={{
                    background: 'linear-gradient(135deg, #fff3e0, #ffe0b2)',
                    borderBottom: '1.5px solid #ffe082',
                    padding: '12px 20px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    fontSize: 13,
                    color: '#e65100',
                    boxShadow: '0 2px 8px rgba(230, 81, 0, 0.08)',
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontSize: 22, flexShrink: 0 }}>🛡️</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                      CẢNH BÁO AN TOÀN & CHỐNG LỪA ĐẢO
                      <span style={{ fontSize: 11, background: '#e65100', color: '#fff', padding: '2px 8px', borderRadius: 10 }}>Lần đầu kết nối</span>
                    </div>
                    <div style={{ color: '#4e342e', lineHeight: 1.45, fontSize: 12.5 }}>
                      • <strong>Tuyệt đối KHÔNG chuyển tiền</strong>, nạp thẻ hoặc đặt cọc dưới mọi hình thức.<br />
                      • <strong>KHÔNG chia sẻ mã OTP</strong>, tài khoản ngân hàng hoặc nhấp vào đường link lạ.<br />
                      • <strong>Gặp mặt an toàn:</strong> Chọn nơi công cộng đông người nếu có hẹn gặp ngoài đời.
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button
                        onClick={() =>
                          setReportTarget({
                            id: targetReportUserId,
                            name: activeRoom.tenPhong,
                          })
                        }
                        style={{
                          border: 'none',
                          background: '#d32f2f',
                          color: '#fff',
                          fontSize: 12,
                          fontWeight: 700,
                          padding: '5px 14px',
                          borderRadius: 8,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        🚩 Báo cáo vi phạm / Lừa đảo
                      </button>
                      <button
                        onClick={() => setShowScamWarning(false)}
                        style={{
                          border: '1px solid #bcaaa4',
                          background: '#ffffff',
                          color: '#5d4037',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: '5px 12px',
                          borderRadius: 8,
                          cursor: 'pointer',
                        }}
                      >
                        ✕ Đã hiểu
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* SUCCESS BANNER WHEN BOTH AGREE */}
              {showSuccessBanner && (
                <div style={{ background: '#e8f5e9', borderBottom: '1.5px solid #a5d6a7', padding: '12px 20px', color: '#2e7d32', fontSize: 13, fontWeight: 700, textAlign: 'center', flexShrink: 0 }}>
                  🎉 Cả hai đã đồng ý! Bạn và {activeRoom.tenPhong} đã chính thức trở thành bạn bè và có thể trò chuyện vĩnh viễn!
                </div>
              )}

              {/* Error Notice */}
              {errorMsg && (
                <div
                  style={{
                    padding: '10px 20px',
                    background: '#ffebee',
                    color: '#c62828',
                    fontSize: 13,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #ffcdd2',
                    flexShrink: 0,
                  }}
                >
                  <span>⚠️ {errorMsg}</span>
                  <button
                    onClick={() => setErrorMsg('')}
                    style={{ border: 'none', background: 'none', color: '#c62828', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Messages Body */}
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  padding: '20px 24px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  background: '#f7f9f8',
                }}
              >
                {/* System Anti-Scam Notice Card */}
                {activeRoom.loaiPhong === 'RIENG_TU' && !activeRoom.isFriend && (
                  <div
                    style={{
                      alignSelf: 'center',
                      margin: '4px 0 10px',
                      padding: '8px 16px',
                      borderRadius: 20,
                      background: '#fff3e0',
                      border: '1px solid #ffe082',
                      color: '#e65100',
                      fontSize: 12,
                      fontWeight: 600,
                      textAlign: 'center',
                      maxWidth: '92%',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                    }}
                  >
                    🔒 HỆ THỐNG: Bạn và <strong>{activeRoom.tenPhong}</strong> lần đầu kết nối. Nâng cao cảnh giác chống lừa đảo & tuyệt đối không chuyển tiền cho người lạ!
                  </div>
                )}
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', color: '#78909c', marginTop: 40 }}>Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#90a4ae', marginTop: 40 }}>
                    Chưa có tin nhắn nào trong phòng. Hãy bắt đầu trò chuyện!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.nguoiGuiId === Number(nguoiDungId);
                    return (
                      <div
                        key={msg.tinNhanId}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: 11, color: '#78909c', marginBottom: 2, paddingLeft: 4, paddingRight: 4 }}>
                          {isMine ? 'Bạn' : msg.nguoiGuiName || msg.nguoiGui || 'Người dùng'}
                        </span>
                        <div
                          style={{
                            maxWidth: '65%',
                            padding: '10px 16px',
                            borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                            background: isMine ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : '#ffffff',
                            color: isMine ? '#ffffff' : '#263238',
                            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                            border: isMine ? 'none' : '1px solid #e0e7e0',
                            fontSize: 14,
                            lineHeight: 1.45,
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.noiDung}
                        </div>
                        <span style={{ fontSize: 10, color: '#b0bec5', marginTop: 3, paddingLeft: 4, paddingRight: 4 }}>
                          {msg.thoiGianGui || msg.guiLuc || msg.thoiGianTao
                            ? new Date(msg.thoiGianGui || msg.guiLuc || msg.thoiGianTao!).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <div
                style={{
                  padding: '16px 24px',
                  borderTop: '1px solid var(--border, #e4ece6)',
                  background: '#ffffff',
                  flexShrink: 0,
                }}
              >
                {isClosed ? (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#d32f2f',
                      fontSize: 13,
                      fontWeight: 600,
                      padding: '10px',
                      background: '#ffebee',
                      borderRadius: 12,
                    }}
                  >
                    🔒 Hết thời gian trò chuyện tạm thời (10 phút). Toàn bộ tin nhắn và phòng chat đã bị xóa khỏi hệ thống.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    style={{ display: 'flex', gap: 10 }}
                  >
                    <input
                      type="text"
                      placeholder="Nhập nội dung tin nhắn..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={sending || isReadOnly}
                      style={{
                        flex: 1,
                        padding: '12px 18px',
                        borderRadius: 24,
                        border: '1px solid var(--border, #e4ece6)',
                        outline: 'none',
                        fontSize: 14,
                        background: '#f7f9f8',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!inputText.trim() || sending || isReadOnly}
                      style={{
                        padding: '12px 24px',
                        borderRadius: 24,
                        border: 'none',
                        background: !inputText.trim() || sending || isReadOnly ? '#c8e6c9' : '#2e7d32',
                        color: '#ffffff',
                        fontWeight: 700,
                        cursor: !inputText.trim() || sending || isReadOnly ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {sending ? 'Đang gửi...' : 'Gửi'}
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#90a4ae',
                fontSize: 14,
              }}
            >
              Chọn một phòng trò chuyện từ danh sách bên trái để bắt đầu.
            </div>
          )}
        </div>
      </div>

      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        tenNguoiBiBaoCao={reportTarget?.name}
      />
    </SidebarLayout>
  );
}

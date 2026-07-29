import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SidebarLayout from '../../components/SidebarLayout';
import { getUserRoomsApi, getMessagesApi, sendMessageApi } from '../../services/chat.service';
import type { PhongTroChuyen, TinNhan } from '../../services/chat.service';
import '../../styles/dashboard.css';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setLoadingRooms(true);
    getUserRoomsApi()
      .then((res) => {
        if (res.success && res.data) {
          setRooms(res.data);
          if (roomParam) {
            const found = res.data.find((r) => r.phongId === Number(roomParam) || r.hoatDongId === Number(roomParam));
            if (found) {
              selectRoom(found);
            } else if (res.data.length > 0) {
              selectRoom(res.data[0]);
            }
          } else if (res.data.length > 0) {
            selectRoom(res.data[0]);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRooms(false));
  }, [roomParam]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const selectRoom = async (roomItem: PhongTroChuyen) => {
    setActiveRoom(roomItem);
    setLoadingMessages(true);
    setErrorMsg('');
    setIsReadOnly(roomItem.trangThai === 'CLOSED');

    try {
      const res = await getMessagesApi(roomItem.phongId);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Không thể tải tin nhắn phòng trò chuyện.';
      setErrorMsg(msg);
      if (msg.includes('chỉ đọc') || msg.includes('không phải là thành viên')) {
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
        setMessages((prev) => [...prev, res.data!]);
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

  const isClosed = activeRoom?.trangThai === 'CLOSED' || isReadOnly;

  return (
    <SidebarLayout title="Tin nhắn nhóm">
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
            background: '#fafbfc',
          }}
        >
          <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--border, #e4ece6)' }}>
            <h3 style={{ margin: 0, fontSize: 15, color: 'var(--primary-800, #3d7d43)' }}>
              💬 Phòng chat nhóm ({rooms.length})
            </h3>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
            {loadingRooms ? (
              <div style={{ textAlign: 'center', color: '#90a4ae', padding: 20, fontSize: 13 }}>Đang tải danh sách phòng...</div>
            ) : rooms.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#90a4ae', padding: 20, fontSize: 13 }}>
                Bạn chưa tham gia hoạt động nhóm nào. Hãy tham gia hoạt động để mở phòng chat!
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
                    <h4 style={{ margin: 0, fontSize: 14, color: isActive ? '#2e7d32' : '#263238', fontWeight: isActive ? 700 : 500 }}>
                      {r.tenPhong}
                    </h4>
                    <span style={{ fontSize: 11, color: r.trangThai === 'CLOSED' ? '#d32f2f' : '#607d8b', marginTop: 4, display: 'block' }}>
                      {r.trangThai === 'CLOSED' ? '🔒 Đã đóng' : '🟢 Đang hoạt động'}
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
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, color: '#3d7d43' }}>
                    💬 {activeRoom.tenPhong}
                  </h3>
                  <span style={{ fontSize: 12, color: isClosed ? '#d32f2f' : '#2e7d32', fontWeight: 600 }}>
                    {isClosed ? '🔒 Phòng trò chuyện (Chế độ chỉ đọc / Đã đóng)' : '🟢 Phòng trò chuyện đang hoạt động'}
                  </span>
                </div>
              </div>

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
                  padding: '20px 24px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  background: '#f7f9f8',
                }}
              >
                {loadingMessages ? (
                  <div style={{ textAlign: 'center', color: '#78909c', marginTop: 40 }}>Đang tải tin nhắn...</div>
                ) : messages.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#90a4ae', marginTop: 40 }}>
                    Chưa có tin nhắn nào trong phòng. Hãy bắt đầu trò chuyện!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.nguoiGuiId === nguoiDungId;
                    return (
                      <div
                        key={msg.tinNhanId}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isMine ? 'flex-end' : 'flex-start',
                          maxWidth: '75%',
                          alignSelf: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <span style={{ fontSize: 11, color: '#90a4ae', marginBottom: 3 }}>
                          {msg.nguoiGui || `Thành viên #${msg.nguoiGuiId}`}
                        </span>
                        <div
                          style={{
                            padding: '11px 16px',
                            borderRadius: isMine ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                            background: isMine ? '#6fbf73' : '#ffffff',
                            color: isMine ? '#ffffff' : '#263238',
                            fontSize: 14,
                            lineHeight: 1.45,
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                            wordBreak: 'break-word',
                          }}
                        >
                          {msg.noiDung}
                        </div>
                        <span style={{ fontSize: 10, color: '#b0bec5', marginTop: 3 }}>
                          {msg.guiLuc || msg.thoiGianTao ? new Date(msg.guiLuc || msg.thoiGianTao!).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div
                style={{
                  padding: '14px 20px',
                  background: '#ffffff',
                  borderTop: '1px solid #e4ece6',
                  display: 'flex',
                  gap: 12,
                  alignItems: 'center',
                }}
              >
                <input
                  type="text"
                  placeholder={isClosed ? 'Phòng trò chuyện đã đóng hoặc ở chế độ chỉ đọc' : 'Nhập tin nhắn...'}
                  value={inputText}
                  disabled={isClosed || sending}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isClosed) handleSend();
                  }}
                  style={{
                    flex: 1,
                    padding: '11px 18px',
                    borderRadius: 24,
                    border: '1px solid #e4ece6',
                    fontSize: 14,
                    outline: 'none',
                    background: isClosed ? '#f5f5f5' : '#fff',
                  }}
                />
                <button
                  className="save-btn"
                  disabled={isClosed || !inputText.trim() || sending}
                  onClick={handleSend}
                  style={{
                    borderRadius: 24,
                    padding: '11px 24px',
                    fontSize: 14,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {sending ? 'Đang gửi...' : 'Gửi'}
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#90a4ae' }}>
              Chọn một phòng trò chuyện ở cột bên trái để bắt đầu trao đổi tin nhắn.
            </div>
          )}
        </div>
      </div>
    </SidebarLayout>
  );
}

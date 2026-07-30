import { useState, useEffect, useRef } from 'react';
import { getOrCreateRoomApi, getMessagesApi, sendMessageApi } from '../../services/chat.service';
import type { PhongTroChuyen, TinNhan } from '../../services/chat.service';
import '../../styles/dashboard.css';

interface ActivityChatModalProps {
  hoatDongId: number;
  tenHoatDong: string;
  currentUserId: number | null;
  onClose: () => void;
}

export default function ActivityChatModal({
  hoatDongId,
  tenHoatDong,
  currentUserId,
  onClose,
}: ActivityChatModalProps) {
  const [room, setRoom] = useState<PhongTroChuyen | null>(null);
  const [messages, setMessages] = useState<TinNhan[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isReadOnly, setIsReadOnly] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);
    setErrorMsg('');
    getOrCreateRoomApi(hoatDongId)
      .then((res) => {
        if (res.success && res.data) {
          setRoom(res.data);
          if (res.data.trangThai === 'CLOSED' || res.data.activityStatus === 'da_huy' || res.data.activityStatus === 'da_ket_thuc') {
            setIsReadOnly(true);
          }
          return getMessagesApi(res.data.phongId);
        } else {
          throw new Error(res.message || 'Không thể mở phòng trò chuyện');
        }
      })
      .then((res) => {
        if (res && res.success && res.data) {
          setMessages(res.data);
        }
      })
      .catch((err: any) => {
        const msg = err?.response?.data?.message || err.message || 'Đã xảy ra lỗi khi tải phòng trò chuyện.';
        setErrorMsg(msg);
        if (msg.includes('chỉ đọc') || msg.includes('không phải là thành viên')) {
          setIsReadOnly(true);
        }
      })
      .finally(() => setLoading(false));
  }, [hoatDongId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || !room || sending || isReadOnly) return;
    const textToSend = inputText.trim();
    setSending(true);
    setErrorMsg('');

    try {
      const res = await sendMessageApi(room.phongId, textToSend);
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

  const isClosed = room?.trangThai === 'CLOSED' || isReadOnly;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal-card chat-modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 600,
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 0,
          borderRadius: 20,
          overflow: 'hidden',
          background: '#fff',
        }}
      >
        {/* Modal Header */}
        <div
          className="chat-modal-header"
          style={{
            padding: '16px 20px',
            background: '#ffffff',
            borderBottom: '1px solid #e4ece6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: 16, color: '#3d7d43' }}>
              💬 {tenHoatDong}
            </h3>
            <span style={{ fontSize: 12, color: isClosed ? '#d32f2f' : '#2e7d32', fontWeight: 600 }}>
              {isClosed ? '🔒 Phòng trò chuyện (Chế độ chỉ đọc / Đã đóng)' : '🟢 Phòng trò chuyện đang hoạt động'}
            </span>
          </div>
          <button
            className="modal-close-btn"
            onClick={onClose}
            style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#90a4ae' }}
          >
            ✕
          </button>
        </div>

        {/* Error Banner */}
        {errorMsg && (
          <div
            style={{
              padding: '10px 16px',
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

        {/* Messages History Body */}
        <div
          className="chat-messages-body"
          style={{
            flex: 1,
            minHeight: 0,
            padding: '16px 20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            background: '#f7f9f8',
          }}
        >
          {loading ? (
            <div style={{ textAlign: 'center', color: '#78909c', marginTop: 40 }}>Đang tải tin nhắn...</div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#90a4ae', marginTop: 40 }}>
              Chưa có tin nhắn nào. Hãy gửi lời chào đầu tiên đến nhóm!
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.nguoiGuiId === currentUserId;
              return (
                <div
                  key={msg.tinNhanId}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '80%',
                    alignSelf: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ fontSize: 11, color: '#90a4ae', marginBottom: 2 }}>
                    {msg.nguoiGui || `Thành viên #${msg.nguoiGuiId}`}
                  </span>
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: isMine ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
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
                  <span style={{ fontSize: 10, color: '#b0bec5', marginTop: 2 }}>
                    {msg.guiLuc || msg.thoiGianTao ? new Date(msg.guiLuc || msg.thoiGianTao!).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Modal Footer / Input Area */}
        <div
          className="chat-modal-footer"
          style={{
            padding: '12px 16px',
            background: '#ffffff',
            borderTop: '1px solid #e4ece6',
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexShrink: 0,
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
              padding: '10px 16px',
              borderRadius: 20,
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
              borderRadius: 20,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {sending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </div>
      </div>
    </div>
  );
}

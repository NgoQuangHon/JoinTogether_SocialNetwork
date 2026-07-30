import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getPendingRequestsApi,
  respondToRequestApi,
} from "../../services/connection.service";
import { getMyProfile } from "../../services/profile.service";
import SidebarLayout from "../../components/SidebarLayout";
import type { ConnectionRequest } from "../../types/connection";
import "../../styles/dashboard.css";

function getSavedUserId(): number | null {
  try {
    const saved = localStorage.getItem("auth_state");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.nguoiDungId) return Number(parsed.nguoiDungId);
    }
  } catch {}
  return null;
}

export default function RequestsPage() {
  const { nguoiDungId: authUserId } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ConnectionRequest[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(() => {
    return authUserId ? Number(authUserId) : getSavedUserId();
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      getMyProfile()
        .then((res: any) => {
          const id =
            res?.data?.nguoiDungId ||
            res?.data?.profile?.nguoiDungId ||
            res?.data?.user?.id;
          if (res?.success && id) {
            setCurrentUserId(Number(id));
          }
        })
        .catch(() => {});
    }
  }, [currentUserId]);

  const loadRequests = () => {
    setLoading(true);
    getPendingRequestsApi()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setRequests(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleRespond = async (yeuCauId: number, accept: boolean) => {
    try {
      const res = await respondToRequestApi(yeuCauId, accept);
      if (res.success) {
        setRequests((prev) =>
          prev.filter((r) => r.yeuCauKetNoiId !== yeuCauId),
        );
      }
    } catch {}
  };

  const myId = currentUserId ? Number(currentUserId) : getSavedUserId();

  // Subdivide requests safely
  const received = requests.filter((r) =>
    myId ? Number(r.nguoiNhanId) === myId : true,
  );
  const sent = requests.filter((r) =>
    myId ? Number(r.nguoiGuiId) === myId : false,
  );

  return (
    <SidebarLayout title="Yêu cầu kết nối">
      {/* Navigation Sub-Tabs cho phép chuyển đổi nhanh giữa Bạn bè, Yêu cầu kết nối, Tìm bạn lân cận */}
      <div className="connection-nav-tabs" style={{ display: 'flex', gap: 8, marginBottom: 20, borderBottom: '1px solid #e0e0e0', paddingBottom: 10, overflowX: 'auto' }}>
        <button
          onClick={() => navigate('/connections')}
          style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          👥 Bạn bè
        </button>
        <button
          onClick={() => navigate('/requests')}
          style={{ padding: '8px 16px', borderRadius: 20, border: 'none', background: '#2e7d32', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📩 Yêu cầu kết nối ({received.length})
        </button>
        <button
          onClick={() => navigate('/nearby')}
          style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid #e0e0e0', background: '#fff', color: '#555', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          📍 Tìm bạn lân cận
        </button>
      </div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={loadRequests}
          style={{
            background: "#e8f5e9",
            color: "#2e7d32",
            border: "none",
            padding: "6px 14px",
            borderRadius: 8,
            fontSize: 13,
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Tải lại danh sách
        </button>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: 32, color: "#90a4ae" }}>
          Đang tải...
        </p>
      ) : (
        <>
          <section className="section-block">
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
              Yêu cầu đến ({received.length})
            </h3>
            {received.length === 0 ? (
              <p style={{ color: "#90a4ae", fontSize: 13, margin: 0 }}>
                Không có yêu cầu kết nối nào.
              </p>
            ) : (
              received.map((r) => (
                <div
                  key={r.yeuCauKetNoiId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#66c2b2",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#fff",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    onClick={() => navigate(`/profile/${r.nguoiGuiId}`)}
                  >
                    {(r.nguoiGui || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        margin: 0,
                        color: "#1565c0",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/profile/${r.nguoiGuiId}`)}
                    >
                      {r.nguoiGui || `Người dùng #${r.nguoiGuiId}`}
                    </p>
                    {r.loiNhan && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "#607d8b",
                          margin: "4px 0 0",
                        }}
                      >
                        "{r.loiNhan}"
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      className="edit-button"
                      style={{
                        background: "#e8f5e9",
                        color: "#2e7d32",
                        fontSize: 12,
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => handleRespond(r.yeuCauKetNoiId, true)}
                    >
                      Chấp nhận
                    </button>
                    <button
                      className="edit-button"
                      style={{
                        background: "#fce4ec",
                        color: "#c62828",
                        fontSize: 12,
                        padding: "6px 14px",
                        borderRadius: 8,
                        border: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => handleRespond(r.yeuCauKetNoiId, false)}
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>

          <section className="section-block section-block-last">
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px" }}>
              Yêu cầu đã gửi ({sent.length})
            </h3>
            {sent.length === 0 ? (
              <p style={{ color: "#90a4ae", fontSize: 13, margin: 0 }}>
                Bạn chưa gửi yêu cầu kết nối nào.
              </p>
            ) : (
              sent.map((r) => (
                <div
                  key={r.yeuCauKetNoiId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      background: "#ab47bc",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: 16,
                      color: "#fff",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    onClick={() => navigate(`/profile/${r.nguoiNhanId}`)}
                  >
                    {(r.nguoiNhan || "?").charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 14,
                        margin: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/profile/${r.nguoiNhanId}`)}
                    >
                      {r.nguoiNhan || `Người dùng #${r.nguoiNhanId}`}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      padding: "4px 12px",
                      borderRadius: 12,
                      background: "#fff8e1",
                      color: "#f57f17",
                      fontWeight: 600,
                    }}
                  >
                    Đang chờ
                  </span>
                </div>
              ))
            )}
          </section>
        </>
      )}
    </SidebarLayout>
  );
}

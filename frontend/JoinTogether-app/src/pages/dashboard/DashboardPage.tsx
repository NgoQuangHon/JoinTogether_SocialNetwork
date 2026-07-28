import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../../styles/dashboard.css';
import {
    baiVietList as baiVietMauBanDau,
    hoatDongNoiBatList,
    goiYKetNoiList,
    hoatDongSapDienRaList,
    type BaiViet,
} from './feedMockData';

// ==================== HELPERS ====================

function Avatar({ mau, chu, kichThuoc = 44 }: { mau: string; chu: string; kichThuoc?: number }) {
    return (
        <div
            className="avatar-tron"
            style={{
                background: mau,
                width: kichThuoc,
                height: kichThuoc,
                fontSize: kichThuoc * 0.42,
            }}
        >
            {chu}
        </div>
    );
}

function nhanTrangThai(trangThai: 'sap-dien-ra' | 'con-cho' | 'sap-day') {
    switch (trangThai) {
        case 'con-cho':
            return { text: 'Còn chỗ', className: 'badge-success' };
        case 'sap-day':
            return { text: 'Sắp đầy', className: 'badge-warning' };
        default:
            return { text: 'Sắp diễn ra', className: 'badge-info' };
    }
}

// ==================== TRANG DASHBOARD ====================

export default function DashboardPage() {
    const { logout, nguoiDungId, role } = useAuth();
    const navigate = useNavigate();
    const [baiVietList, setBaiVietList] = useState<BaiViet[]>(baiVietMauBanDau);
    const [noiDungMoi, setNoiDungMoi] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const toggleThich = (id: number) => {
        setBaiVietList((truoc) =>
            truoc.map((bv) =>
                bv.id === id
                    ? {
                          ...bv,
                          daThich: !bv.daThich,
                          soLuotThich: bv.soLuotThich + (bv.daThich ? -1 : 1),
                      }
                    : bv,
            ),
        );
    };

    const dangPhepDang = noiDungMoi.trim().length > 0;

    return (
        <div className="dashboard">
            {/* ==================== SIDEBAR TRÁI ==================== */}
            <aside className="sidebar">
                <div className="sidebar-brand">
                    <div className="brand-icon">🌿</div>
                    <span className="brand-name">JoinTogether</span>
                </div>

                <nav className="sidebar-nav">
                    <a href="/dashboard" className="nav-item active">
                        <span className="nav-icon">📊</span>
                        Bảng tin
                    </a>
                    <a href="/my-profile" className="nav-item">
                        <span className="nav-icon">👤</span>
                        Hồ sơ
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">🎯</span>
                        Hoạt động
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">🔗</span>
                        Kết nối
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">💬</span>
                        Tin nhắn
                    </a>
                    <a href="#" className="nav-item">
                        <span className="nav-icon">⭐</span>
                        Đánh giá
                    </a>
                    {role === 'ADMIN' && (
                        <a href="#" className="nav-item">
                            <span className="nav-icon">⚙️</span>
                            Quản trị
                        </a>
                    )}
                </nav>

                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>
                        🚪 Đăng xuất
                    </button>
                </div>
            </aside>

            {/* ==================== NỘI DUNG CHÍNH ==================== */}
            <main className="main-content">
                <header className="topbar">
                    <h1>Bảng tin</h1>
                    <div className="topbar-search">
                        <span className="search-icon">🔍</span>
                        <input type="text" placeholder="Tìm hoạt động, người đồng hành..." />
                    </div>
                    <div className="topbar-user">
                        <span className="user-badge">ID: {nguoiDungId}</span>
                        <Avatar mau="var(--primary-600)" chu="B" kichThuoc={38} />
                    </div>
                </header>

                <div className="feed-layout">
                    {/* ==================== CỘT GIỮA: NEWSFEED ==================== */}
                    <div className="feed-main">
                        {/* -------- Hoạt động nổi bật (dạng story) -------- */}
                        <section className="story-row">
                            {hoatDongNoiBatList.map((hd) => (
                                <div key={hd.id} className="story-card" style={{ background: hd.mauNen }}>
                                    <span className="story-participants">{hd.soNguoiThamGia} người</span>
                                    <span className="story-title">{hd.tieuDe}</span>
                                </div>
                            ))}
                        </section>

                        {/* -------- Ô tạo bài viết -------- */}
                        <section className="composer-card">
                            <div className="composer-top">
                                <Avatar mau="var(--primary-600)" chu="B" />
                                <input
                                    type="text"
                                    placeholder="Bạn đang nghĩ gì, hãy chia sẻ với cộng đồng JoinTogether..."
                                    value={noiDungMoi}
                                    onChange={(e) => setNoiDungMoi(e.target.value)}
                                />
                            </div>
                            <div className="composer-actions">
                                <button className="composer-action">
                                    <span className="nav-icon">🖼️</span> Ảnh/Video
                                </button>
                                <button className="composer-action composer-action-accent">
                                    <span className="nav-icon">🎯</span> Gắn hoạt động
                                </button>
                                <button className="composer-action">
                                    <span className="nav-icon">😊</span> Cảm xúc
                                </button>
                                <button className="btn-post" disabled={!dangPhepDang}>
                                    Đăng
                                </button>
                            </div>
                        </section>

                        {/* -------- Danh sách bài viết -------- */}
                        {baiVietList.map((bv) => (
                            <article key={bv.id} className="post-card">
                                <div className="post-header">
                                    <Avatar mau={bv.tacGia.avatarMau} chu={bv.tacGia.avatarChu} />
                                    <div className="post-header-info">
                                        <p className="post-author">{bv.tacGia.hoTen}</p>
                                        <p className="post-meta">
                                            {bv.thoiGian}
                                            {bv.hoatDongLienQuan && (
                                                <>
                                                    {' '}
                                                    · <span className="post-tag">🎯 {bv.hoatDongLienQuan}</span>
                                                </>
                                            )}
                                        </p>
                                    </div>
                                </div>

                                <p className="post-content">{bv.noiDung}</p>

                                {bv.hinhAnhMau && <div className="post-image" style={{ background: bv.hinhAnhMau }} />}

                                <div className="post-stats">
                                    <span>👍 {bv.soLuotThich} lượt thích</span>
                                    <span>
                                        {bv.soBinhLuan} bình luận · {bv.soLuotChiaSe} chia sẻ
                                    </span>
                                </div>

                                <div className="post-actions">
                                    <button
                                        className={`post-action-btn ${bv.daThich ? 'post-action-active' : ''}`}
                                        onClick={() => toggleThich(bv.id)}
                                    >
                                        👍 Thích
                                    </button>
                                    <button className="post-action-btn">💬 Bình luận</button>
                                    <button className="post-action-btn">↗️ Chia sẻ</button>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* ==================== CỘT PHẢI: GỢI Ý & HOẠT ĐỘNG ==================== */}
                    <aside className="feed-sidebar">
                        {/* -------- Gợi ý kết nối (AI Matching) -------- */}
                        <section className="widget-card widget-accent">
                            <div className="widget-header">
                                <h3>✨ AI gợi ý đồng hành</h3>
                            </div>
                            <div className="widget-body">
                                {goiYKetNoiList.map((gy) => (
                                    <div key={gy.id} className="suggestion-item">
                                        <Avatar
                                            mau={gy.nguoiDung.avatarMau}
                                            chu={gy.nguoiDung.avatarChu}
                                            kichThuoc={40}
                                        />
                                        <div className="suggestion-info">
                                            <p className="suggestion-name">
                                                {gy.nguoiDung.hoTen}
                                                <span className="match-badge">{gy.phanTramPhuHop}% phù hợp</span>
                                            </p>
                                            <p className="suggestion-desc">{gy.moTaChung}</p>
                                        </div>
                                        <button className="btn-connect">Kết nối</button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* -------- Hoạt động sắp diễn ra -------- */}
                        <section className="widget-card">
                            <div className="widget-header">
                                <h3>📅 Hoạt động sắp diễn ra</h3>
                            </div>
                            <div className="widget-body">
                                {hoatDongSapDienRaList.map((hd) => {
                                    const nhan = nhanTrangThai(hd.trangThai);
                                    return (
                                        <div key={hd.id} className="event-item">
                                            <div className="event-date">
                                                <span className="event-day">{hd.ngay.split('/')[0]}</span>
                                                <span className="event-month">Th{hd.ngay.split('/')[1]}</span>
                                            </div>
                                            <div className="event-info">
                                                <p className="event-name">{hd.tenHoatDong}</p>
                                                <p className="event-meta">
                                                    {hd.gio} · {hd.soNguoiThamGia} người tham gia
                                                </p>
                                            </div>
                                            <span className={`badge ${nhan.className}`}>{nhan.text}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    </aside>
                </div>
            </main>
        </div>
    );
}

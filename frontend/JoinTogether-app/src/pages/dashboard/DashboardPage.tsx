import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";
import {
  danhMucList,
  hoatDongGanBanList,
  nguoiDongHanhDeXuatList,
  hoatDongNoiBatList,
  goiYKetNoiList,
  hoatDongSapDienRaList,
  baiVietMauBanDau,
  type DanhMuc,
  type HoatDongGanBan,
  type NguoiDongHanhDeXuat,
  type HoatDongNoiBat,
  type BaiViet,
  type GoiYKetNoi,
  type HoatDongSapDienRa,
} from "./feedMockData";

// ==================== COMPONENT DÙNG CHUNG ====================

function Avatar({ mau, chu, kichThuoc = 44 }: { mau: string; chu: string; kichThuoc?: number }) {
  return (
    <div
      className="avatar-tron"
      style={{ background: mau, width: kichThuoc, height: kichThuoc, fontSize: kichThuoc * 0.4 }}
    >
      {chu}
    </div>
  );
}

function AIBanner() {
  return (
    <section className="ai-banner">
      <div className="ai-banner-main">
        <div className="ai-banner-icon">✦</div>
        <h2>AI Matching</h2>
        <p className="ai-banner-sub">Tìm người đồng hành lý tưởng cho bạn</p>
        <p className="ai-banner-desc">
          Dựa trên sở thích và lịch trình của bạn, AI sẽ đề xuất những hoạt động và bạn đồng hành phù
          hợp nhất ngay lúc này.
        </p>
      </div>
      <div className="ai-banner-bottom">
        <button className="ai-banner-cta">
          THỬ NGAY <span>→</span>
        </button>
        <div className="ai-banner-slider">
          <span className="ai-banner-slider-dot" />
        </div>
      </div>
    </section>
  );
}

function CategoryChips({ chon, onChon }: { chon: string; onChon: (id: string) => void }) {
  return (
    <div className="category-row">
      {danhMucList.map((dm: DanhMuc) => (
        <button
          key={dm.id}
          className={`category-chip ${chon === dm.id ? "category-chip-active" : ""}`}
          onClick={() => onChon(dm.id)}
        >
          {dm.ten}
        </button>
      ))}
    </div>
  );
}

function ActivityCard({ hd }: { hd: HoatDongGanBan }) {
  return (
    <div className="activity-card">
      <div className="activity-thumb" style={{ background: hd.mauAnh }}>
        <span className="distance-badge">{hd.khoangCach}</span>
      </div>
      <p className="activity-title">{hd.tieuDe}</p>
      <p className="activity-time">🕐 {hd.thoiGian}</p>
      <div className="activity-footer">
        <div className="avatar-stack">
          <span className="avatar-dot" />
          <span className="avatar-dot" />
          <span className="avatar-dot" />
        </div>
        <span className="participants-badge">
          {hd.soNguoiThamGia}/{hd.soChoToiDa} tham gia
        </span>
      </div>
    </div>
  );
}

function CompanionCard({ ng }: { ng: NguoiDongHanhDeXuat }) {
  return (
    <div className="companion-card">
      <Avatar mau={ng.avatarMau} chu={ng.avatarChu} kichThuoc={64} />
      <p className="companion-name">{ng.hoTen}</p>
      <p className="companion-interest">{ng.soThich}</p>
      <button className="btn-connect-outline">Kết nối</button>
    </div>
  );
}

function nhanTrangThai(trangThai: "sap-dien-ra" | "con-cho" | "sap-day") {
  switch (trangThai) {
    case "con-cho":
      return { text: "Còn chỗ", className: "badge-success" };
    case "sap-day":
      return { text: "Sắp đầy", className: "badge-warning" };
    default:
      return { text: "Sắp diễn ra", className: "badge-info" };
  }
}

function FeaturedCard({ hd }: { hd: HoatDongNoiBat }) {
  return (
    <div className="featured-card">
      <div className="featured-thumb" style={{ background: hd.mauAnh }}>
        <span className="featured-badge">{hd.nhanCongDong}</span>
        <span className="featured-badge featured-badge-light">{hd.nhanThoiGian}</span>
      </div>
      <p className="featured-title">{hd.tieuDe}</p>
    </div>
  );
}

function DanhSachDieuHuong({ role, onDongMenu }: { role: string | null; onDongMenu?: () => void }) {
  return (
    <>
      <a href="/dashboard" className="nav-item active" onClick={onDongMenu}>
        <span className="nav-icon">📊</span>
        Trang chủ
      </a>
      <a href="/profile" className="nav-item" onClick={onDongMenu}>
        <span className="nav-icon">👤</span>
        Hồ sơ
      </a>
      <a href="#" className="nav-item" onClick={onDongMenu}>
        <span className="nav-icon">🔗</span>
        Kết nối
      </a>
      <a href="#" className="nav-item" onClick={onDongMenu}>
        <span className="nav-icon">💬</span>
        Tin nhắn
      </a>
      <a href="#" className="nav-item" onClick={onDongMenu}>
        <span className="nav-icon">⭐</span>
        Đánh giá
      </a>
      {role === "ADMIN" && (
        <a href="#" className="nav-item" onClick={onDongMenu}>
          <span className="nav-icon">⚙️</span>
          Quản trị
        </a>
      )}
    </>
  );
}

// ==================== TRANG CHỦ (DASHBOARD) ====================

export default function DashboardPage() {
  const { logout, role, nguoiDungId } = useAuth();
  const navigate = useNavigate();
  const [menuMo, setMenuMo] = useState(false);
  const [danhMucChon, setDanhMucChon] = useState("tat-ca");
  const [baiVietList, setBaiVietList] = useState<BaiViet[]>(baiVietMauBanDau);
  const [noiDungMoi, setNoiDungMoi] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const toggleThich = (id: number) => {
    setBaiVietList((truoc) =>
      truoc.map((bv) =>
        bv.id === id
          ? { ...bv, daThich: !bv.daThich, soLuotThich: bv.soLuotThich + (bv.daThich ? -1 : 1) }
          : bv
      )
    );
  };

  const dangPhepDang = noiDungMoi.trim().length > 0;

  const mobileView = (
    <div className="mobile-view">
      <div className="app-outer">
        <div className="phone-shell">
          {/* HEADER MOBILE */}
          <header className="app-header">
            <button className="icon-btn" onClick={() => setMenuMo(true)} aria-label="Mở menu">
              ☰
            </button>
            <span className="app-title">JoinTogether</span>
            <button className="icon-btn icon-btn-bell" aria-label="Thông báo">
              🔔
              <span className="bell-dot" />
            </button>
          </header>

          {/* DRAWER MOBILE */}
          {menuMo && (
            <>
              <div className="drawer-overlay" onClick={() => setMenuMo(false)} />
              <nav className="drawer-panel">
                <div className="drawer-brand">
                  <div className="brand-icon">🌿</div>
                  <span className="brand-name">JoinTogether</span>
                </div>
                <DanhSachDieuHuong role={role} onDongMenu={() => setMenuMo(false)} />
                <button className="logout-btn" onClick={handleLogout}>
                  🚪 Đăng xuất
                </button>
              </nav>
            </>
          )}

          {/* BODY MOBILE */}
          <div className="app-body">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input type="text" placeholder="Tìm kiếm hoạt động, bạn bè..." />
            </div>

            <AIBanner />
            <CategoryChips chon={danhMucChon} onChon={setDanhMucChon} />

            <section className="section-block">
              <div className="section-heading">
                <h3>Hoạt động gần bạn</h3>
                <a href="#" className="section-link">XEM THÊM</a>
              </div>
              <div className="hscroll">
                {hoatDongGanBanList.map((hd) => (
                  <ActivityCard key={hd.id} hd={hd} />
                ))}
              </div>
            </section>

            <section className="section-block">
              <div className="section-heading">
                <h3>Người đồng hành đề xuất</h3>
              </div>
              <div className="hscroll">
                {nguoiDongHanhDeXuatList.map((ng) => (
                  <CompanionCard key={ng.id} ng={ng} />
                ))}
              </div>
            </section>

            <section className="section-block section-block-last">
              <div className="section-heading">
                <h3>Hoạt động nổi bật</h3>
              </div>
              <div className="hscroll">
                {hoatDongNoiBatList.map((hd) => (
                  <FeaturedCard key={hd.id} hd={hd} />
                ))}
              </div>
            </section>
          </div>

          {/* BOTTOM NAV MOBILE */}
          <nav className="bottom-nav">
            <button className="bottom-nav-item bottom-nav-active">
              <span className="bottom-nav-icon">🏠</span>
              Trang chủ
            </button>
            <button className="bottom-nav-item">
              <span className="bottom-nav-icon">🎯</span>
              Hoạt động
            </button>
            <button className="bottom-nav-item">
              <span className="bottom-nav-icon">💬</span>
              Tin nhắn
            </button>
            <button className="bottom-nav-item" onClick={() => setMenuMo(true)}>
              <span className="bottom-nav-icon">👤</span>
              Cá nhân
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  const desktopView = (
    <div className="desktop-view">
      <aside className="sidebar">
        <div className="drawer-brand">
          <div className="brand-icon">🌿</div>
          <span className="brand-name">JoinTogether</span>
        </div>
        <nav className="sidebar-nav">
          <DanhSachDieuHuong role={role} />
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <h1>Trang chủ</h1>
          <div className="search-bar topbar-search">
            <span className="search-icon">🔍</span>
            <input type="text" placeholder="Tìm kiếm hoạt động, bạn bè..." />
          </div>
          <div className="topbar-user">
            <span className="user-badge">ID: {nguoiDungId}</span>
            <button className="icon-btn icon-btn-bell" aria-label="Thông báo">
              🔔
              <span className="bell-dot" />
            </button>
            <Avatar mau="var(--primary-600)" chu="B" kichThuoc={36} />
          </div>
        </header>

        <div className="content-body">
          <AIBanner />
          <CategoryChips chon={danhMucChon} onChon={setDanhMucChon} />

          <section className="section-block">
            <div className="section-heading">
              <h3>Hoạt động gần bạn</h3>
              <a href="#" className="section-link">XEM THÊM</a>
            </div>
            <div className="grid-activities">
              {hoatDongGanBanList.map((hd) => (
                <ActivityCard key={hd.id} hd={hd} />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h3>Người đồng hành đề xuất</h3>
            </div>
            <div className="grid-companions">
              {nguoiDongHanhDeXuatList.map((ng) => (
                <CompanionCard key={ng.id} ng={ng} />
              ))}
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <h3>Hoạt động nổi bật</h3>
            </div>
            <div className="grid-featured">
              {hoatDongNoiBatList.map((hd) => (
                <FeaturedCard key={hd.id} hd={hd} />
              ))}
            </div>
          </section>

          <section className="section-block section-block-last">
            <div className="section-heading">
              <h3>Bài viết gần đây</h3>
            </div>
            {baiVietList.map((bv) => (
              <article key={bv.id} className="post-card">
                <div className="post-header">
                  <Avatar mau={bv.tacGia.avatarMau} chu={bv.tacGia.avatarChu} />
                  <div className="post-header-info">
                    <p className="post-author">{bv.tacGia.hoTen}</p>
                    <p className="post-meta">
                      {bv.thoiGian}
                      {bv.hoatDongLienQuan && (
                        <> · <span className="post-tag">🎯 {bv.hoatDongLienQuan}</span></>
                      )}
                    </p>
                  </div>
                </div>
                <p className="post-content">{bv.noiDung}</p>
                {bv.hinhAnhMau && <div className="post-image" style={{ background: bv.hinhAnhMau }} />}
                <div className="post-stats">
                  <span>👍 {bv.soLuotThich} lượt thích</span>
                  <span>{bv.soBinhLuan} bình luận · {bv.soLuotChiaSe} chia sẻ</span>
                </div>
                <div className="post-actions">
                  <button
                    className={`post-action-btn ${bv.daThich ? "post-action-active" : ""}`}
                    onClick={() => toggleThich(bv.id)}
                  >
                    👍 Thích
                  </button>
                  <button className="post-action-btn">💬 Bình luận</button>
                  <button className="post-action-btn">↗️ Chia sẻ</button>
                </div>
              </article>
            ))}
          </section>
        </div>
      </main>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}
    </>
  );
}

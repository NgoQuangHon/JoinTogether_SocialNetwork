import { useNavigate } from "react-router-dom";
import "./SUS.css";

export default function SUSPage() {
  const navigate = useNavigate();

  return (
    <div className="sus-page">
      <div className="sus-header">
        <h1 className="sus-title">🛡️ Hỗ trợ Người dùng</h1>
        <p className="sus-subtitle">
          Hệ thống Hỗ trợ Người dùng JoinTogether (SUS) – Chọn loại yêu cầu phù hợp để được xử lý nhanh nhất.
        </p>
      </div>

      <div className="sus-cards">
        {/* Thẻ 1: Báo cáo vi phạm */}
        <div
          className="sus-card sus-card--report"
          onClick={() => navigate("/sus/report")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/sus/report")}
        >
          <div className="sus-card__icon">🚨</div>
          <div className="sus-card__content">
            <h2 className="sus-card__title">Báo cáo Vi phạm</h2>
            <p className="sus-card__desc">
              Báo cáo người dùng vi phạm quy tắc cộng đồng, quấy rối, lừa đảo hoặc đăng nội dung không phù hợp trong các hoạt động.
            </p>
            <ul className="sus-card__list">
              <li>✅ Chọn hoạt động liên quan</li>
              <li>✅ Chọn thành viên cần báo cáo</li>
              <li>✅ Chọn lý do & mô tả chi tiết</li>
              <li>✅ Admin xem xét & xử lý</li>
            </ul>
          </div>
          <div className="sus-card__arrow">→</div>
        </div>

        {/* Thẻ 2: Yêu cầu hỗ trợ */}
        <div
          className="sus-card sus-card--support"
          onClick={() => navigate("/sus/support")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/sus/support")}
        >
          <div className="sus-card__icon">🆘</div>
          <div className="sus-card__content">
            <h2 className="sus-card__title">Yêu cầu Hỗ trợ Kỹ thuật</h2>
            <p className="sus-card__desc">
              Gặp sự cố kỹ thuật, không thể sử dụng một tính năng, hoặc cần hướng dẫn về hệ thống JoinTogether?
            </p>
            <ul className="sus-card__list">
              <li>✅ Lỗi kỹ thuật & ứng dụng</li>
              <li>✅ Vấn đề tài khoản</li>
              <li>✅ Hướng dẫn sử dụng</li>
              <li>✅ Phản hồi & góp ý</li>
            </ul>
          </div>
          <div className="sus-card__arrow">→</div>
        </div>
      </div>

      <p className="sus-footer">
        💡 Mọi yêu cầu sẽ được đội ngũ quản trị JoinTogether xem xét và phản hồi trong thời gian sớm nhất.
      </p>
    </div>
  );
}

import { useState } from "react";

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "TERMS" | "PRIVACY" | "APPENDIX";
}

export default function TermsModal({
  isOpen,
  onClose,
  defaultTab = "TERMS",
}: TermsModalProps) {
  const [activeTab, setActiveTab] = useState<"TERMS" | "PRIVACY" | "APPENDIX">(
    defaultTab,
  );

  if (!isOpen) return null;

  return (
    <div
      className="terms-modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="terms-modal-card"
        style={{
          background: "#ffffff",
          borderRadius: 20,
          width: "100%",
          maxWidth: 920,
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(135deg, #f0fdf4, #e6f7ef)",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 18,
                color: "#166534",
                fontWeight: 800,
              }}
            >
              🌿 NỀN TẢNG JOINTOGETHER
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "#374151",
                fontWeight: 600,
              }}
            >
              ĐIỀU KHOẢN DỊCH VỤ VÀ CHÍNH SÁCH BẢO MẬT (Phiên bản phục vụ khóa
              luận tốt nghiệp - 27/07/2026)
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              border: "none",
              background: "#ffffff",
              width: 32,
              height: 32,
              borderRadius: "50%",
              fontSize: 16,
              cursor: "pointer",
              color: "#64748b",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: "flex",
            background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0",
            padding: "0 16px",
            gap: 8,
          }}
        >
          <button
            onClick={() => setActiveTab("TERMS")}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              borderBottom:
                activeTab === "TERMS"
                  ? "3px solid #16a34a"
                  : "3px solid transparent",
              color: activeTab === "TERMS" ? "#166534" : "#64748b",
              fontWeight: activeTab === "TERMS" ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            📜 Phần I: Điều khoản Dịch vụ
          </button>
          <button
            onClick={() => setActiveTab("PRIVACY")}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              borderBottom:
                activeTab === "PRIVACY"
                  ? "3px solid #16a34a"
                  : "3px solid transparent",
              color: activeTab === "PRIVACY" ? "#166534" : "#64748b",
              fontWeight: activeTab === "PRIVACY" ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            🛡️ Phần II: Chính sách Bảo mật
          </button>
          <button
            onClick={() => setActiveTab("APPENDIX")}
            style={{
              padding: "12px 16px",
              border: "none",
              background: "none",
              borderBottom:
                activeTab === "APPENDIX"
                  ? "3px solid #16a34a"
                  : "3px solid transparent",
              color: activeTab === "APPENDIX" ? "#166534" : "#64748b",
              fontWeight: activeTab === "APPENDIX" ? 700 : 500,
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            ⚖️ Phụ lục: Căn cứ Pháp lý & Tiêu chuẩn
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px 28px",
            fontSize: 14,
            lineHeight: 1.65,
            color: "#1e293b",
            background: "#ffffff",
          }}
        >
          {activeTab === "TERMS" && (
            <div>
              <h3
                style={{
                  color: "#166534",
                  borderBottom: "2px solid #bbf7d0",
                  paddingBottom: 6,
                }}
              >
                PHẦN I - ĐIỀU KHOẢN DỊCH VỤ
              </h3>
              <p>
                Điều khoản Dịch vụ này (&ldquo;Điều khoản&rdquo;) điều chỉnh
                việc truy cập và sử dụng nền tảng JoinTogether (&ldquo;Nền
                tảng&rdquo;, &ldquo;JoinTogether&rdquo;, &ldquo;chúng
                tôi&rdquo;) - một nền tảng số hỗ trợ người dùng tìm kiếm cộng
                đồng, người đồng hành và hoạt động phù hợp với sở thích cá nhân.
                Bằng việc tạo tài khoản hoặc sử dụng bất kỳ tính năng nào của
                Nền tảng, Người dùng xác nhận đã đọc, hiểu và đồng ý bị ràng
                buộc bởi Điều khoản này cũng như Chính sách Bảo mật tại Phần II.
              </p>

              <h4>1. Định nghĩa</h4>
              <ul>
                <li>
                  <strong>&ldquo;Người dùng&rdquo;:</strong> cá nhân đã tạo tài
                  khoản và sử dụng Nền tảng, bao gồm người tìm kiếm hoạt
                  động/cộng đồng và người tổ chức hoạt động.
                </li>
                <li>
                  <strong>&ldquo;Người tổ chức hoạt động&rdquo;:</strong> Người
                  dùng khởi tạo, đăng tải và quản lý một hoạt động cộng đồng
                  trên Nền tảng.
                </li>
                <li>
                  <strong>&ldquo;Hoạt động&rdquo;:</strong> sự kiện, buổi gặp gỡ
                  hoặc hoạt động cộng đồng được đăng tải trên Nền tảng, có thể
                  diễn ra trực tuyến hoặc trực tiếp.
                </li>
                <li>
                  <strong>&ldquo;Nội dung Người dùng&rdquo;:</strong> mọi thông
                  tin, hình ảnh, mô tả, bình luận, đánh giá do Người dùng tạo
                  hoặc tải lên Nền tảng.
                </li>
                <li>
                  <strong>&ldquo;Dữ liệu cá nhân&rdquo;:</strong> thông tin gắn
                  liền với việc xác định một cá nhân cụ thể, được định nghĩa và
                  xử lý theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân.
                </li>
              </ul>

              <h4>2. Điều kiện sử dụng dịch vụ</h4>
              <ul>
                <li>
                  Người dùng phải đủ 16 tuổi trở lên để tự mình đăng ký tài
                  khoản. Trường hợp Nền tảng cho phép người dùng từ 13 đến dưới
                  16 tuổi tham gia, việc xử lý dữ liệu cá nhân của nhóm này phải
                  có sự đồng ý của cha, mẹ hoặc người giám hộ theo quy định tại
                  Nghị định 13/2023/NĐ-CP.
                </li>
                <li>
                  Người dùng cam kết cung cấp thông tin đăng ký chính xác, trung
                  thực và cập nhật; không sử dụng danh tính giả hoặc mạo danh
                  người khác.
                </li>
                <li>
                  Mỗi cá nhân chỉ được sở hữu một tài khoản cá nhân, trừ trường
                  hợp được Nền tảng cho phép khác.
                </li>
                <li>
                  Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập và mọi
                  hoạt động phát sinh từ tài khoản của mình.
                </li>
              </ul>

              <h4>3. Đăng ký, xác thực và bảo mật tài khoản</h4>
              <p>
                Nền tảng áp dụng cơ chế xác thực tài khoản (ví dụ: xác thực qua
                email/số điện thoại) nhằm tăng cường độ tin cậy giữa các Người
                dùng khi kết nối và tham gia hoạt động trực tiếp. Mật khẩu được
                lưu trữ dưới dạng đã băm (hashed) theo thuật toán phù hợp; Nền
                tảng không lưu trữ mật khẩu ở dạng văn bản thuần (plain text).
              </p>
              <p>
                Người dùng có nghĩa vụ thông báo ngay cho Nền tảng khi phát hiện
                dấu hiệu truy cập trái phép vào tài khoản của mình.
              </p>

              <h4>4. Nội dung Người dùng và giấy phép sử dụng</h4>
              <ul>
                <li>
                  Người dùng giữ quyền sở hữu đối với Nội dung Người dùng mà
                  mình đăng tải.
                </li>
                <li>
                  Bằng việc đăng tải Nội dung Người dùng, Người dùng cấp cho Nền
                  tảng một giấy phép không độc quyền, có thể chuyển nhượng nội
                  bộ trong phạm vi cần thiết, miễn phí bản quyền, phạm vi toàn
                  cầu để lưu trữ, hiển thị, sao chép và phân phối nội dung đó
                  nhằm mục đích vận hành và cải thiện dịch vụ.
                </li>
                <li>
                  Người dùng cam kết Nội dung Người dùng không vi phạm pháp luật
                  Việt Nam, không xâm phạm quyền sở hữu trí tuệ, danh dự, nhân
                  phẩm của bên thứ ba, và không thuộc các loại nội dung bị cấm
                  quy định tại Điều 5 dưới đây.
                </li>
              </ul>

              <h4>5. Quy tắc cộng đồng và nội dung bị cấm</h4>
              <p>
                Nhằm bảo đảm an toàn và niềm tin giữa Người dùng - yếu tố then
                chốt đối với một nền tảng kết nối cộng đồng - Người dùng không
                được thực hiện các hành vi sau:
              </p>
              <ul>
                <li>
                  Đăng tải nội dung sai sự thật, lừa đảo, xuyên tạc, hoặc mạo
                  danh cá nhân/tổ chức khác.
                </li>
                <li>
                  Quấy rối, đe dọa, phân biệt đối xử hoặc có hành vi xâm hại đến
                  an toàn, danh dự, nhân phẩm của Người dùng khác.
                </li>
                <li>
                  Thu thập trái phép thông tin của Người dùng khác ngoài phạm vi
                  tính năng Nền tảng cho phép.
                </li>
                <li>
                  Đăng tải nội dung vi phạm thuần phong mỹ tục, kích động bạo
                  lực, phân biệt vùng miền, tôn giáo, hoặc vi phạm quy định tại
                  Luật An ninh mạng số 24/2018/QH14 và Nghị định 147/2024/NĐ-CP.
                </li>
                <li>
                  Sử dụng Nền tảng cho mục đích thương mại trái phép, gửi thư
                  rác (spam), hoặc quảng cáo không được phép.
                </li>
                <li>
                  Can thiệp trái phép vào hệ thống, cố gắng truy cập trái phép
                  dữ liệu hoặc phá hoại hoạt động bình thường của Nền tảng.
                </li>
              </ul>

              <h4>6. Hoạt động cộng đồng và tương tác trực tiếp</h4>
              <ul>
                <li>
                  JoinTogether đóng vai trò là nền tảng trung gian kết nối Người
                  dùng có cùng sở thích; Nền tảng không phải là bên tổ chức, bảo
                  hiểm hoặc bảo đảm cho các Hoạt động do Người dùng đăng tải,
                  trừ khi có thông báo khác bằng văn bản.
                </li>
                <li>
                  Người tổ chức hoạt động có trách nhiệm cung cấp thông tin đầy
                  đủ, chính xác về hoạt động: tên hoạt động, địa điểm, thời
                  gian, số lượng người tham gia, chi phí (nếu có) và quy tắc
                  tham gia.
                </li>
                <li>
                  Nền tảng khuyến nghị Người dùng thực hiện các biện pháp an
                  toàn hợp lý trước khi tham gia hoạt động trực tiếp, bao gồm:
                  gặp mặt ở nơi công cộng đối với lần gặp đầu tiên, thông báo
                  lịch trình cho người thân/bạn bè, xác nhận thông tin người tổ
                  chức và không chia sẻ thông tin nhạy cảm/tài chính với người
                  lạ.
                </li>
                <li>
                  Nền tảng không chịu trách nhiệm đối với các thiệt hại, tranh
                  chấp hoặc sự cố phát sinh trực tiếp giữa các Người dùng trong
                  quá trình tương tác trực tuyến hoặc tham gia Hoạt động trực
                  tiếp, trừ trường hợp thiệt hại phát sinh do lỗi trực tiếp của
                  Nền tảng.
                </li>
              </ul>

              <h4>7. Báo cáo vi phạm và xử lý vi phạm</h4>
              <ul>
                <li>
                  Người dùng có thể báo cáo Nội dung, tài khoản hoặc Hoạt động
                  vi phạm thông qua chức năng báo cáo được tích hợp trên Nền
                  tảng.
                </li>
                <li>
                  Nền tảng tiếp nhận, xem xét và xử lý báo cáo trong thời gian
                  hợp lý; các quyết định xử lý (cảnh báo, gỡ nội dung, tạm khóa,
                  chấm dứt tài khoản) được ghi nhận và lưu vết theo quy trình
                  quản trị nội dung nội bộ.
                </li>
                <li>
                  Tùy theo mức độ vi phạm, Nền tảng có quyền áp dụng một hoặc
                  nhiều biện pháp: cảnh báo, gỡ bỏ nội dung, tạm khóa tính năng,
                  tạm ngưng hoặc chấm dứt tài khoản mà không cần báo trước trong
                  trường hợp vi phạm nghiêm trọng.
                </li>
                <li>
                  Nền tảng phối hợp cung cấp thông tin cho cơ quan nhà nước có
                  thẩm quyền khi có yêu cầu hợp pháp theo quy định của Luật An
                  ninh mạng số 24/2018/QH14 và Nghị định 147/2024/NĐ-CP.
                </li>
              </ul>

              <h4>8. Phí dịch vụ (nếu áp dụng)</h4>
              <p>
                Tại thời điểm hiện tại, các tính năng cốt lõi của JoinTogether
                được cung cấp miễn phí. Trường hợp Nền tảng phát triển thêm các
                tính năng có phí, gói thành viên, đặt chỗ (booking) hoặc liên
                kết dịch vụ bên thứ ba (affiliate), Nền tảng sẽ ban hành điều
                khoản bổ sung về giá, phương thức thanh toán, chính sách
                hoàn/hủy và quy trình khiếu nại, tuân thủ Luật Bảo vệ quyền lợi
                người tiêu dùng số 19/2023/QH15 và Nghị định 52/2013/NĐ-CP (sửa
                đổi bởi Nghị định 85/2021/NĐ-CP) về thương mại điện tử.
              </p>

              <h4>9. Quyền sở hữu trí tuệ của Nền tảng</h4>
              <p>
                Toàn bộ thương hiệu, logo, giao diện, mã nguồn, thiết kế và các
                thành phần kỹ thuật khác của JoinTogether thuộc quyền sở hữu của
                đội ngũ phát triển/chủ sở hữu Nền tảng, được bảo hộ theo pháp
                luật sở hữu trí tuệ Việt Nam. Người dùng không được sao chép,
                phân phối lại hoặc khai thác các thành phần này ngoài phạm vi
                được phép sử dụng dịch vụ.
              </p>

              <h4>10. Giới hạn trách nhiệm và miễn trừ bảo đảm</h4>
              <p>
                Nền tảng được cung cấp trên cơ sở &ldquo;hiện trạng&rdquo;
                (as-is); Nền tảng không bảo đảm dịch vụ hoạt động liên tục,
                không gián đoạn hoặc không có lỗi tuyệt đối. Trong phạm vi tối
                đa được pháp luật cho phép, Nền tảng không chịu trách nhiệm đối
                với thiệt hại gián tiếp, ngẫu nhiên hoặc hệ quả phát sinh từ
                việc sử dụng hoặc không thể sử dụng dịch vụ.
              </p>

              <h4>11. Chấm dứt dịch vụ</h4>
              <p>
                Người dùng có quyền ngừng sử dụng và yêu cầu xóa tài khoản bất
                kỳ lúc nào theo hướng dẫn tại Chính sách Bảo mật. Nền tảng có
                quyền tạm ngưng hoặc chấm dứt quyền truy cập của Người dùng vi
                phạm Điều khoản này.
              </p>

              <h4>12. Luật áp dụng và giải quyết tranh chấp</h4>
              <p>
                Điều khoản này được điều chỉnh bởi pháp luật nước Cộng hòa xã
                hội chủ nghĩa Việt Nam. Mọi tranh chấp phát sinh trước hết được
                giải quyết thông qua thương lượng, hòa giải; trường hợp không
                đạt được thỏa thuận, tranh chấp sẽ được đưa ra giải quyết tại
                Tòa án có thẩm quyền.
              </p>

              <h4>13. Thay đổi Điều khoản</h4>
              <p>
                Nền tảng có quyền cập nhật, sửa đổi Điều khoản này theo thời
                gian. Các thay đổi quan trọng sẽ được thông báo cho Người dùng
                qua Nền tảng hoặc email trước khi có hiệu lực, phù hợp với Luật
                Giao dịch điện tử số 20/2023/QH15.
              </p>
            </div>
          )}

          {activeTab === "PRIVACY" && (
            <div>
              <h3
                style={{
                  color: "#166534",
                  borderBottom: "2px solid #bbf7d0",
                  paddingBottom: 6,
                }}
              >
                PHẦN II - CHÍNH SÁCH BẢO MẬT
              </h3>
              <p>
                Chính sách Bảo mật này mô tả cách JoinTogether thu thập, sử
                dụng, lưu trữ, chia sẻ và bảo vệ Dữ liệu cá nhân của Người dùng,
                được xây dựng trên cơ sở Nghị định 13/2023/NĐ-CP về bảo vệ dữ
                liệu cá nhân, Luật An toàn thông tin mạng số 86/2015/QH13 và
                tham chiếu khung quản trị quốc tế ISO/IEC 27001:2022 (an toàn
                thông tin) và ISO/IEC 27701:2025 (quản lý thông tin quyền riêng
                tư).
              </p>

              <h4>1. Phạm vi áp dụng</h4>
              <p>
                Chính sách này áp dụng cho toàn bộ Dữ liệu cá nhân được xử lý
                thông qua việc Người dùng đăng ký, sử dụng và tương tác với Nền
                tảng JoinTogether.
              </p>

              <h4>2. Dữ liệu cá nhân được thu thập</h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  margin: "14px 0",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f1f5f9",
                      textAlign: "left",
                      borderBottom: "2px solid #cbd5e1",
                    }}
                  >
                    <th style={{ padding: "8px 12px" }}>Nhóm dữ liệu</th>
                    <th style={{ padding: "8px 12px" }}>Ví dụ</th>
                    <th style={{ padding: "8px 12px" }}>Tính chất</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Dữ liệu định danh & tài khoản
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Họ tên, email, số điện thoại, mật khẩu (đã mã hóa), ảnh
                      đại diện
                    </td>
                    <td
                      style={{
                        padding: "8px 12px",
                        color: "#dc2626",
                        fontWeight: 600,
                      }}
                    >
                      Bắt buộc
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Dữ liệu hồ sơ & sở thích
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Sở thích cá nhân theo danh mục, mô tả ngắn, khu vực hoạt
                      động
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Bắt buộc một phần / Tùy chọn
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Dữ liệu vị trí tương đối
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Khu vực/quận huyện hoặc khoảng cách tương đối tới hoạt
                      động
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Tùy chọn, giới hạn mức cần thiết
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Dữ liệu hoạt động & tương tác
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Lịch sử tham gia hoạt động, yêu cầu kết nối, đánh giá sau
                      hoạt động
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Phát sinh khi sử dụng
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Nội dung do người dùng tạo
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Bài đăng, bình luận, mô tả hoạt động, hình ảnh tải lên
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Do người dùng chủ động cung cấp
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Dữ liệu kỹ thuật
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Nhật ký đăng nhập, địa chỉ IP, loại thiết bị, thông tin
                      phiên làm việc
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Thu thập tự động phục vụ bảo mật
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4>3. Mục đích xử lý dữ liệu</h4>
              <ul>
                <li>Tạo lập, xác thực và quản lý tài khoản Người dùng.</li>
                <li>
                  Gợi ý cộng đồng, hoạt động và người đồng hành phù hợp dựa trên
                  sở thích và khu vực hoạt động.
                </li>
                <li>
                  Bảo đảm an toàn, tin cậy: xác thực tài khoản, xử lý báo cáo vi
                  phạm, phòng chống gian lận và lạm dụng.
                </li>
                <li>
                  Phân tích, cải thiện chất lượng dịch vụ và tuân thủ nghĩa vụ
                  pháp lý.
                </li>
              </ul>

              <h4>4. Cơ sở pháp lý và sự đồng ý</h4>
              <p>
                Việc xử lý Dữ liệu cá nhân dựa trên sự đồng ý của Người dùng
                theo Nghị định 13/2023/NĐ-CP. Người dùng có quyền đồng ý một
                phần, đồng ý có điều kiện, hoặc rút lại sự đồng ý bất kỳ lúc
                nào.
              </p>

              <h4>5. Nguyên tắc xử lý dữ liệu cá nhân</h4>
              <p>
                Hợp pháp, công bằng, minh bạch, tối thiểu hóa dữ liệu, chính
                xác, bảo đảm tính bảo mật, toàn vẹn (Confidentiality, Integrity,
                Availability) theo khung ISO/IEC 27001:2022.
              </p>

              <h4>6. Chia sẻ và tiết lộ dữ liệu</h4>
              <p>
                Nền tảng không bán, cho thuê Dữ liệu cá nhân của Người dùng cho
                bên thứ ba vì mục đích thương mại. Dữ liệu chỉ được chia sẻ
                trong phạm vi cần thiết giữa người dùng hoặc phục vụ yêu cầu từ
                cơ quan nhà nước có thẩm quyền.
              </p>

              <h4>7. Quyền của chủ thể dữ liệu</h4>
              <p>
                Phù hợp với Nghị định 13/2023/NĐ-CP, Người dùng có các quyền
                sau:
              </p>
              <ul>
                <li>
                  Quyền được biết, đồng ý hoặc không đồng ý xử lý dữ liệu.
                </li>
                <li>
                  Quyền truy cập, xem, chỉnh sửa hoặc yêu cầu xóa Dữ liệu cá
                  nhân.
                </li>
                <li>
                  Quyền rút lại sự đồng ý, quyền hạn chế xử lý và quyền khiếu
                  nại tố cáo.
                </li>
              </ul>
            </div>
          )}

          {activeTab === "APPENDIX" && (
            <div>
              <h3
                style={{
                  color: "#166534",
                  borderBottom: "2px solid #bbf7d0",
                  paddingBottom: 6,
                }}
              >
                PHỤ LỤC - CĂN CỨ PHÁP LÝ VÀ TIÊU CHUẨN THAM CHIẾU
              </h3>

              <h4>A. Văn bản pháp luật Việt Nam</h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  margin: "14px 0",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f1f5f9",
                      textAlign: "left",
                      borderBottom: "2px solid #cbd5e1",
                    }}
                  >
                    <th style={{ padding: "8px 12px", width: "35%" }}>
                      Văn bản pháp luật
                    </th>
                    <th style={{ padding: "8px 12px" }}>
                      Nội dung điều chỉnh liên quan
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Nghị định 13/2023/NĐ-CP
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Bảo vệ dữ liệu cá nhân; cơ chế đồng ý; quyền của chủ thể
                      dữ liệu.
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Luật An toàn thông tin mạng 86/2015/QH13
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Bảo đảm an toàn thông tin mạng và bảo vệ thông tin cá
                      nhân.
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Luật An ninh mạng 24/2018/QH14
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Phòng ngừa vi phạm an ninh mạng, trách nhiệm phối hợp xử
                      lý.
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Nghị định 147/2024/NĐ-CP
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Quản lý dịch vụ Internet, thông tin trên mạng, gỡ bỏ nội
                      dung vi phạm.
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Luật Giao dịch điện tử 20/2023/QH15
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Chấp nhận điều khoản điện tử, bằng chứng đồng ý, giá trị
                      pháp lý.
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      Luật Bảo vệ quyền lợi người tiêu dùng 19/2023/QH15
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Minh bạch thông tin dịch vụ, tiếp nhận khiếu nại.
                    </td>
                  </tr>
                </tbody>
              </table>

              <h4>B. Tiêu chuẩn và khung thực hành kỹ thuật quốc tế</h4>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  margin: "14px 0",
                  fontSize: 13,
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: "#f1f5f9",
                      textAlign: "left",
                      borderBottom: "2px solid #cbd5e1",
                    }}
                  >
                    <th style={{ padding: "8px 12px", width: "35%" }}>
                      Tiêu chuẩn / Khung tham chiếu
                    </th>
                    <th style={{ padding: "8px 12px" }}>
                      Ứng dụng trong Điều khoản và Chính sách
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      ISO/IEC 27001:2022
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Khung quản trị an toàn thông tin: quản lý rủi ro, mã hóa,
                      nhật ký hệ thống.
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      ISO/IEC 27701:2025
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Khung quản lý thông tin quyền riêng tư: trách nhiệm giải
                      trình dữ liệu cá nhân.
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 600 }}>
                      OWASP ASVS / OWASP Top 10
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      Căn cứ kỹ thuật cho các cam kết bảo mật ứng dụng.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "14px 24px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748b" }}>
            Bằng việc tích chọn đồng ý tại trang Đăng nhập / Đăng ký, bạn xác
            nhận tuân thủ văn bản này.
          </span>
          <button
            onClick={onClose}
            style={{
              padding: "8px 20px",
              borderRadius: 10,
              border: "none",
              background: "#16a34a",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 13.5,
              cursor: "pointer",
              boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
            }}
          >
            Tôi đã hiểu & Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}

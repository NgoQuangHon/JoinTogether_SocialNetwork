import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ReportDescription.css';

const MAX_LENGTH = 500;

const ReportDescription = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [description, setDescription] = useState('');

    const [images, setImages] = useState<string[]>([]);

    const { reasonId, hoatDongId, thanhVienId, nguoiBiBaoCaoId, targetUserName } = location.state || {};

    const handleDescription = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= MAX_LENGTH) {
            setDescription(e.target.value);
        }
    };

    const handleChooseImage = () => {
        fileInputRef.current?.click();
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;

        if (!files) return;

        Array.from(files).forEach((file) => {
            if (file.size > 5 * 1024 * 1024) return;

            const reader = new FileReader();

            reader.onload = () => {
                setImages((prev) => [...prev, reader.result as string]);
            };

            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        navigate('/report/confirm', {
            state: {
                reasonId,
                description,
                images,
                hoatDongId,
                thanhVienId,
                nguoiBiBaoCaoId,
                targetUserName,
            },
        });
    };

    return (
        <div className="report-description-page">
            <header className="description-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    ←
                </button>

                <h1>Mô tả báo cáo</h1>
            </header>

            <main className="description-container">
                <section className="description-card">
                    <h2>Mô tả chi tiết</h2>

                    <p>Hãy mô tả rõ sự việc xảy ra để đội ngũ quản trị có thể xem xét và xử lý nhanh hơn.</p>

                    <textarea
                        value={description}
                        onChange={handleDescription}
                        placeholder="Ví dụ: Người dùng có hành vi quấy rối trong cuộc trò chuyện..."
                    />

                    <div className="character-count">
                        {description.length}/{MAX_LENGTH}
                    </div>
                </section>

                <section className="upload-card">
                    <h2>Hình ảnh minh chứng</h2>

                    <p>Có thể tải lên tối đa nhiều hình ảnh nếu cần.</p>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={handleImageChange}
                    />

                    <button className="upload-button" onClick={handleChooseImage}>
                        📷 Chọn hình ảnh
                    </button>

                    <div className="image-preview-list">
                        {images.map((image, index) => (
                            <div className="preview-item" key={index}>
                                <img src={image} alt="preview" />

                                <button className="remove-image" onClick={() => removeImage(index)}>
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="tips-card">
                    <div className="tips-icon">💡</div>

                    <div>
                        <h3>Gợi ý</h3>

                        <ul>
                            <li>Mô tả rõ thời gian xảy ra sự việc.</li>

                            <li>Nêu cụ thể hành vi vi phạm.</li>

                            <li>Đính kèm ảnh minh chứng nếu có.</li>

                            <li>Không cung cấp thông tin cá nhân nhạy cảm.</li>
                        </ul>
                    </div>
                </section>

                <div className="button-group">
                    <button className="cancel-button" onClick={() => navigate(-1)}>
                        Quay lại
                    </button>

                    <button className="submit-button" disabled={description.trim() === ''} onClick={handleSubmit}>
                        Gửi báo cáo
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ReportDescription;

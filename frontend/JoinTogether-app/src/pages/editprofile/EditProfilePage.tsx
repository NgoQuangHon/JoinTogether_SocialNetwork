import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './EditProfile.css';

const EditProfile = () => {
    const navigate = useNavigate();

    const [name, setName] = useState('Nguyễn Văn A');

    const [gender, setGender] = useState('Nam');

    const [location, setLocation] = useState('Hà Nội');

    const [bio, setBio] = useState('Yêu thích hoạt động cộng đồng và kết nối những người có cùng sở thích.');

    const handleSave = () => {
        const profileData = {
            name,

            gender,

            location,

            bio,
        };

        console.log(profileData);

        alert('Lưu thông tin thành công');
    };

    return (
        <div className="edit-profile-page">
            {/* ================= BACK BUTTON ================= */}

            <div className="back-hover-area">
                <button className="back-profile-btn" onClick={() => navigate('/profile')}>
                    <span className="back-icon">←</span>

                    <span className="back-text">Quay lại hồ sơ</span>
                </button>
            </div>

            {/* ================= HEADER ================= */}

            <header className="edit-header">
                <div className="edit-logo">🌿 JoinTogether</div>

                <div className="header-user">
                    <span>🔔</span>

                    <img src="https://i.pravatar.cc/100" alt="avatar" />
                </div>
            </header>

            {/* ================= CONTENT ================= */}

            <main className="edit-container">
                <h1>Chỉnh sửa hồ sơ</h1>

                <section className="edit-card">
                    {/* AVATAR */}

                    <div className="avatar-edit">
                        <img src="https://i.pravatar.cc/200" alt="avatar" />

                        <button className="avatar-button">✏️</button>
                    </div>

                    {/* NAME */}

                    <div className="form-group">
                        <label>Họ và tên</label>

                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>

                    {/* GENDER */}

                    <div className="form-group">
                        <label>Giới tính</label>

                        <select value={gender} onChange={(e) => setGender(e.target.value)}>
                            <option>Nam</option>

                            <option>Nữ</option>

                            <option>Khác</option>
                        </select>
                    </div>

                    {/* LOCATION */}

                    <div className="form-group">
                        <label>Địa điểm</label>

                        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                    </div>

                    {/* BIO */}

                    <div className="form-group">
                        <div className="bio-header">
                            <label>Giới thiệu bản thân</label>

                            <span>{bio.length}/500</span>
                        </div>

                        <textarea maxLength={500} value={bio} onChange={(e) => setBio(e.target.value)} />
                    </div>

                    {/* SAVE BUTTON */}

                    <div className="edit-actions">
                        <button className="save-btn" onClick={handleSave}>
                            Lưu thông tin
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default EditProfile;

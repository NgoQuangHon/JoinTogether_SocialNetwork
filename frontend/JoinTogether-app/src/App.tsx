import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/auth/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/editprofile/EditProfilePage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

export default function App() {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/verify-email" element={<VerifyEmailPage />} />
            </Route>
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/my-profile"
                element={
                    <ProtectedRoute>
                        <ProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/profile"
                element={
                    <ProtectedRoute>
                        <EditProfilePage />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

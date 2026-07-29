import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from './pages/auth/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MyActivitiesPage from './pages/activities/MyActivitiesPage';
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/editprofile/EditProfilePage';
import InterestsPage from './pages/onboarding/InterestsPage';
import ReviewPage from './pages/reviews/ReviewPage';
import AIMatchPage from './pages/aimatch/AIMatchPage';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ReportDetail from './pages/report/reportdetail/ReportDetail';
import ReportReason from './pages/report/reportreason/ReportReason';
import ReportDescription from './pages/report/reportdescription/ReportDescription';
import ReportConfirm from './pages/report/reportconfirm/ReportConfirm';
import ReportLoading from './pages/report/reportloading/ReportLoading';
import ReportSuccess from './pages/report/reportsuccess/ReportSuccess';
import ReportResult from './pages/report/reportresult/ReportResult';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

export default function App() {
    return (
        <Routes>
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* User routes */}
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
                path="/activities"
                element={
                    <ProtectedRoute>
                        <MyActivitiesPage />
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
            <Route
                path="/interests"
                element={
                    <ProtectedRoute>
                        <InterestsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/reviews"
                element={
                    <ProtectedRoute>
                        <ReviewPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/ai-match"
                element={
                    <ProtectedRoute>
                        <AIMatchPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/report"
                element={
                    <ProtectedRoute>
                        <ReportDetail />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/report/reason"
                element={
                    <ProtectedRoute>
                        <ReportReason />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/report/description"
                element={
                    <ProtectedRoute>
                        <ReportDescription />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/report/confirm"
                element={
                    <ProtectedRoute>
                        <ReportConfirm />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/report/loading"
                element={
                    <ProtectedRoute>
                        <ReportLoading />
                    </ProtectedRoute>
                }
            />

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminDashboard />} />

            <Route
                path="/report/success"
                element={
                    <ProtectedRoute>
                        <ReportSuccess />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/report/result"
                element={
                    <ProtectedRoute>
                        <ReportResult />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import AthleteProfilePage from './pages/AthleteProfile/AthleteProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import UploadVideoPage from './pages/UploadVideo/UploadVideoPage';
import UploadSuccessPage from './pages/UploadVideo/UploadSuccessPage';
import PoseEstimationPage from './pages/PoseEstimation/PoseEstimationPage';
import PoseEstimationResultsPage from './pages/PoseEstimation/PoseEstimationResultsPage';
import BiomechanicalAnalysisPage from './pages/BiomechanicalAnalysis/BiomechanicalAnalysisPage';
import InjuryRiskReportPage from './pages/InjuryRiskReport/InjuryRiskReport';
import AnalysisHistoryPage from './pages/AnalysisHistory/AnalysisHistoryPage';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { createAthleteProfile, loginUser, signupUser, updateAthleteProfile } from './services/api';

function PrivateRoute({ isAuthenticated, children }) {
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

function AthleteOnlyRoute({ isAuthenticated, role, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only athletes can enter the profile flow; every other role is sent to the dashboard.
  if (role !== 'athlete') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentRole, setCurrentRole] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const navigate = useNavigate();

  const appActions = useMemo(
    () => ({
      login: async (credentials) => {
        const response = await loginUser(credentials);
        const role = response.role || 'athlete';
        const profileExists = Boolean(response.profile_exists);

        setIsAuthenticated(true);
        setCurrentRole(role);
        setCurrentUserId(response.user_id);
        setProfileCompleted(profileExists);
        navigate(role === 'athlete' && !profileExists ? '/athlete-profile' : '/dashboard', { replace: true });
      },
      signup: async (account) => {
        const response = await signupUser(account);
        const role = response.role || account.role;

        setProfileCompleted(false);
        setCurrentRole(role);
        setCurrentUserId(response.user_id);
        setIsAuthenticated(true);
        navigate(role === 'athlete' ? '/athlete-profile' : '/dashboard', { replace: true });
      },
      logout: () => {
        setIsAuthenticated(false);
        setCurrentRole('');
        setCurrentUserId(null);
        setProfileCompleted(false);
        navigate('/login', { replace: true });
      },
      saveProfile: async (profile) => {
        if (!currentUserId) {
          throw new Error('Unable to save profile because the logged-in user was not found.');
        }

        const payload = {
          user_id: currentUserId,
          full_name: profile.fullName.trim(),
          age: Number(profile.age),
          gender: profile.gender,
          height: profile.height.trim(),
          weight: profile.weight.trim(),
          sport: profile.sport.trim(),
          playing_position: profile.playingPosition.trim(),
          dominant_side: profile.dominantSide,
          experience_years: Number(profile.experienceYears),
          previous_injuries: profile.previousInjuries.trim(),
        };

        if (profileCompleted) {
          await updateAthleteProfile(currentUserId, payload);
        } else {
          await createAthleteProfile(payload);
        }

        setProfileCompleted(true);
        navigate('/dashboard', { replace: true });
      },
    }),
    [currentUserId, navigate, profileCompleted],
  );

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage onLogin={appActions.login} />} />
      <Route path="/signup" element={<SignupPage onSignup={appActions.signup} />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute isAuthenticated={isAuthenticated}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <DashboardPage role={currentRole} onLogout={appActions.logout} />
              </main>
              <Footer />
            </div>
          </PrivateRoute>
        }
      />
      <Route
        path="/athlete-profile"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <AthleteProfilePage
                  userId={currentUserId}
                  profileSaved={profileCompleted}
                  onSaveProfile={appActions.saveProfile}
                />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route
        path="/upload-video"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <UploadVideoPage />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route
        path="/analysis-history"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <AnalysisHistoryPage />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route
        path="/upload-success"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <UploadSuccessPage />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route
        path="/pose-estimation"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <PoseEstimationPage />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route
        path="/pose-estimation-results"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <PoseEstimationResultsPage />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route
        path="/biomechanical-analysis"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <BiomechanicalAnalysisPage />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route
        path="/injury-risk-report"
        element={
          <AthleteOnlyRoute isAuthenticated={isAuthenticated} role={currentRole}>
            <div className="app-shell">
              <Navbar onLogout={appActions.logout} />
              <main className="app-shell__content">
                <InjuryRiskReportPage />
              </main>
              <Footer />
            </div>
          </AthleteOnlyRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

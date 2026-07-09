import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import LoginPage from './pages/Login/LoginPage';
import SignupPage from './pages/Signup/SignupPage';
import AthleteProfilePage from './pages/AthleteProfile/AthleteProfilePage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';
import { loginUser, signupUser } from './services/api';

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
  const [profileSaved, setProfileSaved] = useState(false);
  const navigate = useNavigate();

  const tryLocalSignupLogin = (credentials) => {
    const storedAccount = localStorage.getItem('demo-auth-account');

    if (!storedAccount) {
      return false;
    }

    try {
      const parsedAccount = JSON.parse(storedAccount);

      return (
        parsedAccount?.email?.toLowerCase() === credentials.email.toLowerCase() &&
        parsedAccount?.password === credentials.password
      );
    } catch {
      return false;
    }
  };

  const appActions = useMemo(
    () => ({
      login: async (credentials) => {
        let matchedAccount = null;

        try {
          await loginUser(credentials);
        } catch (error) {
          const storedAccount = localStorage.getItem('demo-auth-account');

          if (storedAccount) {
            try {
              const parsedAccount = JSON.parse(storedAccount);

              if (
                parsedAccount?.email?.toLowerCase() === credentials.email.toLowerCase() &&
                parsedAccount?.password === credentials.password
              ) {
                matchedAccount = parsedAccount;
              }
            } catch {
              matchedAccount = null;
            }
          }

          if (!matchedAccount && !tryLocalSignupLogin(credentials)) {
            throw error;
          }
        }

        setIsAuthenticated(true);
        setCurrentRole(matchedAccount?.role || 'athlete');

        // Role-based navigation keeps athletes in the profile setup flow and sends everyone else straight to the dashboard.
        navigate(matchedAccount?.role === 'athlete' ? '/athlete-profile' : '/dashboard', { replace: true });
      },
      signup: async (account) => {
        await signupUser(account);
        localStorage.setItem(
          'demo-auth-account',
          JSON.stringify({
            fullName: account.fullName,
            email: account.email,
            password: account.password,
            role: account.role,
          }),
        );

        setIsAuthenticated(true);
        setCurrentRole(account.role);

        // The selected role controls the first page after signup.
        navigate(account.role === 'athlete' ? '/athlete-profile' : '/dashboard', { replace: true });
      },
      logout: () => {
        setIsAuthenticated(false);
        setCurrentRole('');
        setProfileSaved(false);
        navigate('/login', { replace: true });
      },
      saveProfile: () => {
        setProfileSaved(true);
      },
      clearProfileSaved: () => {
        setProfileSaved(false);
      },
      finishProfile: () => {
        setProfileSaved(true);
        navigate('/dashboard', { replace: true });
      },
    }),
    [navigate],
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
                <DashboardPage role={currentRole} />
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
                  profileSaved={profileSaved}
                  onSaveProfile={appActions.saveProfile}
                  onResetProfile={appActions.clearProfileSaved}
                  onCompleteProfile={appActions.finishProfile}
                />
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

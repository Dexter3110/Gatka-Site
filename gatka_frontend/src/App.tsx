import React, { useState, useEffect } from 'react';
import { Mail, Lock, RefreshCw, Loader2 } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { ManagePlayers } from './components/ManagePlayers';
import { PlayersRegistration } from './components/PlayersRegistration';
import { SummarySheetPrint } from './components/SummarySheetPrint';
import { AddPlayer } from './components/AddPlayer';
import { ReportPage } from './components/ReportPage';
import { AdminDashboard } from './components/AdminDashboard';
import { AddCompetition } from './components/AddCompetition';
import { ManageCompetitions } from './components/ManageCompetitions';
import { ManageUsers } from './components/ManageUsers';
import { AddUser } from './components/AddUser';
import { login, saveToken, clearToken, getMe, getToken } from './api/api';

// Admin-only pages that non-admin users cannot access
const ADMIN_PAGES = ['admin-dashboard', 'add-competition', 'manage-competitions', 'manage-users', 'add-user', 'admin-settings'];

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [errors, setErrors] = useState({ email: '', password: '', captcha: '' });
  const [showDashboard, setShowDashboard] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [reportParams, setReportParams] = useState({ competition: '', district: '', gender: '' });
  const [isRestoringSession, setIsRestoringSession] = useState(true);

  // On mount: generate captcha + try to restore session from stored token
  useEffect(() => {
    generateCaptcha();

    const restoreSession = async () => {
      const token = getToken();
      if (!token) {
        setIsRestoringSession(false);
        return;
      }
      try {
        const user = await getMe();
        setLoggedInEmail(user.email);
        setIsAdmin(user.role === 'admin');
        setCurrentPage(user.role === 'admin' ? 'admin-dashboard' : 'dashboard');
        setShowDashboard(true);
      } catch {
        // Token is invalid or expired — clear it and show login
        clearToken();
      } finally {
        setIsRestoringSession(false);
      }
    };

    restoreSession();
  }, []);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaQuestion({ num1, num2, answer: num1 + num2 });
    setCaptchaInput('');
  };

  const validateEmail = (email: string) => {
    if (!email) {
      return 'Email is required';
    }
    if (!email.endsWith('@gatka.com')) {
      return 'Only @gatka.com email addresses are allowed';
    }
    const emailRegex = /^[^\s@]+@gatka\.com$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return '';
  };

  const validateCaptcha = (input: string) => {
    if (!input) {
      return 'Please solve the captcha';
    }
    if (parseInt(input) !== captchaQuestion.answer) {
      return 'Incorrect captcha answer';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const emailError   = validateEmail(email);
  const passwordError = validatePassword(password);
  const captchaError  = validateCaptcha(captchaInput);

  setErrors({ email: emailError, password: passwordError, captcha: captchaError });

  if (!emailError && !passwordError && !captchaError) {
    try {
      const result = await login(email, password);
      saveToken(result.access_token);
      setLoggedInEmail(email);
      const userIsAdmin = result.role === 'admin';
      setIsAdmin(userIsAdmin);
      setCurrentPage(userIsAdmin ? 'admin-dashboard' : 'dashboard');
      setShowDashboard(true);
    } catch (err: any) {
      setErrors({ ...errors, password: err.message });
      generateCaptcha();
    }
  }
};

  const handleLogout = () => {
    clearToken();
    setShowDashboard(false);
    setLoggedInEmail('');
    setIsAdmin(false);
    setEmail('');
    setPassword('');
    setCaptchaInput('');
    setErrors({ email: '', password: '', captcha: '' });
    setCurrentPage('dashboard');
    setReportParams({ competition: '', district: '', gender: '' });
    generateCaptcha();
  };

  const handleNavigate = (page: string) => {
    // Check if page contains query parameters
    if (page.startsWith('report?')) {
      // Extract query parameters
      const queryString = page.split('?')[1];
      const params = new URLSearchParams(queryString);
      setReportParams({
        competition: params.get('competition') || '',
        district: params.get('district') || '',
        gender: params.get('gender') || ''
      });
      setCurrentPage('report');
    } else {
      // Auth guard: non-admin users cannot access admin-only pages
      if (ADMIN_PAGES.includes(page) && !isAdmin) {
        setCurrentPage('dashboard');
        return;
      }
      setCurrentPage(page);
    }
  };

  // Show loading spinner while restoring session from token
  if (isRestoringSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#e8ebef]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600 text-sm">Restoring session...</p>
        </div>
      </div>
    );
  }

  if (showDashboard) {
    // Shared pages accessible to all authenticated users
    if (currentPage === 'players') {
      return <ManagePlayers userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
    }
    if (currentPage === 'registrations') {
      return <PlayersRegistration userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
    }
    if (currentPage === 'summary-sheet') {
      return <SummarySheetPrint userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
    }
    if (currentPage === 'add-player') {
      return <AddPlayer userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
    }
    if (currentPage === 'report') {
      return <ReportPage userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} competition={reportParams.competition} district={reportParams.district} gender={reportParams.gender} />;
    }

    // Admin-only pages — non-admins fall through to regular Dashboard
    if (isAdmin) {
      if (currentPage === 'admin-dashboard' || currentPage === 'dashboard') {
        return <AdminDashboard userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
      }
      if (currentPage === 'add-competition') {
        return <AddCompetition userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
      }
      if (currentPage === 'manage-competitions') {
        return <ManageCompetitions userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
      }
      if (currentPage === 'manage-users') {
        return <ManageUsers userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
      }
      if (currentPage === 'add-user') {
        return <AddUser userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} />;
      }
      if (currentPage === 'admin-settings') {
        return <Dashboard userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} isAdmin={true} />;
      }
    }

    // Default: regular user dashboard (also catches non-admin trying to access admin pages)
    return <Dashboard userEmail={loggedInEmail} onLogout={handleLogout} onNavigate={handleNavigate} isAdmin={isAdmin} />;
  }

  // Login form shown when user is not authenticated

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e8ebef] p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-gray-800 mb-2" style={{ fontFamily: 'serif' }}>
            Gatka Federation of Maharashtra
          </h1>
          <p className="text-gray-600 text-sm">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <div className="relative">
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors({ ...errors, email: '' });
                  }
                }}
                className={`w-full px-4 py-3 pr-10 border ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } rounded focus:outline-none focus:border-blue-500 transition-colors`}
              />
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: '' });
                  }
                }}
                className={`w-full px-4 py-3 pr-10 border ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                } rounded focus:outline-none focus:border-blue-500 transition-colors`}
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Captcha */}
          <div>
            <div className="bg-gray-50 border border-gray-300 rounded p-4 mb-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-700">What is </span>
                  <span className="bg-white px-3 py-1 rounded border border-gray-300 font-mono">
                    {captchaQuestion.num1} + {captchaQuestion.num2}
                  </span>
                  <span className="text-gray-700">?</span>
                </div>
                <button
                  type="button"
                  onClick={generateCaptcha}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  title="Refresh captcha"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter answer"
                value={captchaInput}
                onChange={(e) => {
                  setCaptchaInput(e.target.value);
                  if (errors.captcha) {
                    setErrors({ ...errors, captcha: '' });
                  }
                }}
                className={`w-full px-4 py-2 border ${
                  errors.captcha ? 'border-red-500' : 'border-gray-300'
                } rounded focus:outline-none focus:border-blue-500 transition-colors`}
              />
            </div>
            {errors.captcha && (
              <p className="text-red-500 text-sm mt-1">{errors.captcha}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded transition-colors"
          >
            Login Now
          </button>
        </form>
      </div>
    </div>
  );
}
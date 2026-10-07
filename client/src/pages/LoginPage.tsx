import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGoogleDemo, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDomainError, setIsDomainError] = useState(false);

  const isIpHost = typeof window !== 'undefined' && window.location.hostname === '127.0.0.1';

  const switchToLocalhost = () => {
    if (typeof window !== 'undefined') {
      const newUrl = window.location.href.replace('127.0.0.1', 'localhost');
      window.location.href = newUrl;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsDomainError(false);
    try {
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsDomainError(false);
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google sign-in was cancelled or failed.');
      if (err.code === 'auth/unauthorized-domain' || (err.message && err.message.toLowerCase().includes('domain'))) {
        setIsDomainError(true);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleDemoSignIn = async () => {
    setError(null);
    try {
      setGoogleLoading(true);
      await loginWithGoogleDemo();
      navigate('/');
    } catch (err: any) {
      setError('Google demo login failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleDemo = async (role: 'student' | 'vendor' | 'admin') => {
    try {
      setLoading(true);
      await quickDemoLogin(role);
      navigate(role === 'admin' ? '/admin' : '/');
    } catch (err: any) {
      setError('Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-4 space-y-space-md max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center space-y-1">
        <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center mx-auto shadow-md">
          <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            local_fire_department
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">CampusBite Login</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Find food. Order fast. Eat happy.</p>
      </div>

      {/* Google Authentication Section */}
      <div className="rounded-lg bg-surface-container-lowest p-4 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] border border-surface-container/60 space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-surface-container-high bg-surface hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
          id="googleSignInBtn"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
        </button>

        {isIpHost && (
          <div className="flex items-center justify-between px-2 text-[12px] text-on-surface-variant font-medium">
            <span>Running on 127.0.0.1</span>
            <button
              type="button"
              onClick={switchToLocalhost}
              className="text-primary font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Switch to localhost</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>

      {/* Error / Domain Authorization Helper Banner */}
      {error && (
        <div className="p-4 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm space-y-3 shadow-sm border border-error/20">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0 text-error">error</span>
            <div className="space-y-1">
              <p className="font-bold text-on-error-container">{error}</p>
            </div>
          </div>

          {isDomainError && (
            <div className="mt-2 pt-3 border-t border-error/15 space-y-2.5">
              <p className="text-[12px] text-on-error-container/90">
                Firebase projects authorize <code className="bg-surface px-1.5 py-0.5 rounded font-mono text-primary font-bold">localhost</code> by default. You can switch immediately or continue with a simulated Google login:
              </p>
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                {isIpHost && (
                  <button
                    type="button"
                    onClick={switchToLocalhost}
                    className="flex-1 py-2 px-3 rounded-full bg-primary-container text-on-primary font-label-sm text-[12px] font-bold shadow-sm hover:opacity-90 active:scale-95 text-center flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                    <span>Switch to localhost:5173</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleGoogleDemoSignIn}
                  className="flex-1 py-2 px-3 rounded-full bg-surface-container-lowest text-on-surface border border-surface-container-high font-label-sm text-[12px] font-bold shadow-sm hover:bg-surface-container-low active:scale-95 text-center flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px] text-secondary">verified_user</span>
                  <span>1-Click Google Demo Sign-In</span>
                </button>
              </div>

              <details className="text-[11px] text-on-error-container/80 pt-1 cursor-pointer">
                <summary className="font-semibold hover:underline">How to authorize 127.0.0.1 in Firebase Console (30 secs)</summary>
                <ol className="list-decimal pl-4 mt-1.5 space-y-1">
                  <li>Open <a href="https://console.firebase.google.com/project/studentfood-app/authentication/settings" target="_blank" rel="noreferrer" className="underline font-bold text-primary">Firebase Console &gt; Authentication &gt; Settings</a></li>
                  <li>Click on <strong>Authorized domains</strong> tab</li>
                  <li>Click <strong>Add domain</strong>, enter <code className="bg-surface px-1 rounded font-mono">127.0.0.1</code>, and save</li>
                </ol>
              </details>
            </div>
          )}
        </div>
      )}

      {/* Instant Demo Logins Card */}
      <div className="p-3.5 rounded-lg bg-surface-container-high border border-surface-container shadow-sm space-y-2">
        <span className="font-label-sm text-[11px] text-on-surface-variant uppercase tracking-wider font-bold block text-center">
          ⚡ 1-Click Instant Demo Login
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemo('student')}
            className="py-2 px-1 rounded-DEFAULT bg-primary-container text-on-primary font-label-sm text-[11px] font-bold shadow-sm hover:opacity-90 active:scale-95"
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => handleDemo('vendor')}
            className="py-2 px-1 rounded-DEFAULT bg-tertiary text-on-tertiary font-label-sm text-[11px] font-bold shadow-sm hover:opacity-90 active:scale-95"
          >
            🧑‍🍳 Vendor
          </button>
          <button
            type="button"
            onClick={() => handleDemo('admin')}
            className="py-2 px-1 rounded-DEFAULT bg-on-background text-surface font-label-sm text-[11px] font-bold shadow-sm hover:opacity-90 active:scale-95"
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-lg bg-surface-container-lowest p-5 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-4">
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-surface-container-high"></div>
          <span className="flex-shrink mx-3 text-body-sm text-on-surface-variant font-medium">or email password</span>
          <div className="flex-grow border-t border-surface-container-high"></div>
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@campusbites.edu"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Logging in...' : 'Sign In with Email'}
        </button>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant pt-2">
          Don't have a student account?{' '}
          <Link to="/register" className="font-bold text-primary hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
};

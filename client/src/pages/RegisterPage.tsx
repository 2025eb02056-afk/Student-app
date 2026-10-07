import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loginWithGoogleDemo } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    collegeName: 'Apex Institute of Technology',
    password: '',
    confirmPassword: ''
  });

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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit Indian phone number (starting with 6-9)");
      return;
    }

    try {
      setLoading(true);
      await register(formData);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
      setError(err.message || 'Google registration was cancelled or failed.');
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

  return (
    <div className="flex flex-col w-full px-margin-mobile pb-28 pt-4 space-y-space-md max-w-md mx-auto">
      <div className="text-center space-y-1">
        <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">Student Registration</h1>
        <p className="font-body-sm text-body-sm text-on-surface-variant">Join CampusBite for student discounts & dorm deliveries</p>
      </div>

      {/* Google Quick Registration */}
      <div className="rounded-lg bg-surface-container-lowest p-4 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] border border-surface-container/60 space-y-3">
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full border border-surface-container-high bg-surface hover:bg-surface-container-low text-on-surface font-label-md text-label-md font-semibold shadow-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
          id="googleRegisterBtn"
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
          <span>{googleLoading ? 'Connecting to Google...' : 'Sign up with Google'}</span>
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

      {error && (
        <div className="p-4 rounded-lg bg-error-container text-on-error-container font-body-sm text-body-sm space-y-3 shadow-sm border border-error/20">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[20px] shrink-0 text-error">error</span>
            <p className="font-bold">{error}</p>
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
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg bg-surface-container-lowest p-5 shadow-[0_4px_16px_-2px_rgba(15,23,42,0.06)] space-y-3.5">
        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-surface-container-high"></div>
          <span className="flex-shrink mx-3 text-body-sm text-on-surface-variant font-medium">or manual details</span>
          <div className="flex-grow border-t border-surface-container-high"></div>
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            Full Name
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="e.g. Rahul Verma"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            Campus / Student Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="student@campusbites.edu"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            Phone Number (10 Digits)
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="9876543210"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            College / Campus Name
          </label>
          <input
            type="text"
            value={formData.collegeName}
            onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
            placeholder="Apex Institute of Technology"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            Password (min. 8 characters)
          </label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <div>
          <label className="block font-label-sm text-label-sm font-semibold text-on-surface mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="••••••••"
            className="w-full p-2.5 bg-surface-container-low rounded-lg font-body-md text-body-md border border-surface-container focus:outline-none focus:ring-2 focus:ring-primary-container"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-full bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-md hover:opacity-90 active:scale-98 transition-all flex items-center justify-center gap-2 mt-2"
        >
          {loading ? 'Creating Account...' : 'Complete Registration'}
        </button>

        <p className="text-center font-body-sm text-body-sm text-on-surface-variant pt-1">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
};

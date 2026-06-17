import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import '../../styles/auth.css';
import { useAuth } from '../../hooks/useAuth';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email');
  const navigate = useNavigate();

  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { saveUser } = useAuth();

  if (!email) {
    return (
      <div className="login-wrapper">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-header">
            <h2>Invalid Access</h2>
            <p>No email address was provided for verification.</p>
          </div>
          <Link
            to="/signup"
            className="login-button"
            style={{ textDecoration: 'none', display: 'inline-block' }}
          >
            Return to Sign Up
          </Link>
        </div>
      </div>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();

    const cleanCode = code.trim();

    if (!cleanCode) {
      setError('Please enter the verification code.');
      return;
    }

    const codeRegex = /^\d{4}$/;
    if (!codeRegex.test(cleanCode)) {
      setError('Verification code must be exactly 4 digits.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await UserService.completeEmailVerification(email, code);
      const userData = response.data.data;
      saveUser({ token: userData.token, user: userData.user });
      navigate('/');
    } catch (err) {
      console.log(err);
      setError(
        err.data?.message ||
          err.message ||
          'Verification failed. Please check the code and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setError('');
    setMessage('');

    try {
      await UserService.sendVerificationCode(email);
      setMessage('A new verification code has been sent to your email.');
    } catch (err) {
      console.log(err);
      setError(
        err.data?.message ||
          err.message ||
          'Failed to resend the verification code. Please try again later.'
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>Verify Your Email</h2>
          <p>
            We sent a verification code to <strong>{email}</strong>.
          </p>
        </div>

        <form onSubmit={handleVerify} className="login-form">
          {/* Display Errors */}
          {error && <div className="login-error-message">{error}</div>}

          {/* Display Success Messages (Resend / Verification Success) */}
          {message && (
            <div
              style={{
                backgroundColor: '#f0fdf4',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: '4px',
                fontSize: '14px',
                border: '1px solid #bbf7d0',
                marginBottom: '8px',
              }}
            >
              {message}
            </div>
          )}

          <div className="input-group">
            <label htmlFor="code">Verification Code</label>
            <input
              id="code"
              type="text"
              placeholder="Enter the code here"
              className="login-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                textAlign: 'center',
                letterSpacing: '4px',
                fontSize: '18px',
                fontWeight: 'bold',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || resendLoading}
            className={`login-button ${loading ? 'loading' : ''}`}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <div
            style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#697386' }}
          >
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendLoading || loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#5469d4',
                fontWeight: '600',
                cursor: resendLoading || loading ? 'not-allowed' : 'pointer',
                padding: 0,
                fontSize: '14px',
                textDecoration: 'none',
              }}
            >
              {resendLoading ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

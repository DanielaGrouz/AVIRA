import React, { useState } from 'react';
import {Link, useNavigate, useSearchParams} from 'react-router-dom';
import UserService from '../../services/UserService';
import '../../styles/auth.css';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');

    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Missing email address. Please request a new password reset link.');
            return;
        }

        // 1. Basic validation
        if (!code || !newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await UserService.resetPassword(email, newPassword, code);
            setSuccess(true);
            navigate("/");
        } catch (err) {
            console.log(err);
            setError(
                err.data?.message || err.message ||
                'Failed to reset password. Please check your verification code and try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Create New Password</h2>
                    <p>Enter the verification code sent to your email and choose a new password.</p>
                </div>

                {!success ? (
                    <form onSubmit={handlePasswordReset} className="login-form">
                        {error && <div className="login-error-message">{error}</div>}

                        <div className="input-group">
                            <label htmlFor="code">Verification Code</label>
                            <input
                                id="code"
                                type="text"
                                placeholder="Enter 4-digit code"
                                className="login-input"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="newPassword">New Password</label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                className="login-input"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="confirmPassword">Confirm New Password</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat new password"
                                className="login-input"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`login-button ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#697386' }}>
                            <Link to="/login" style={{ color: '#5469d4', textDecoration: 'none', fontWeight: '600' }}>
                                Back to Login
                            </Link>
                        </div>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
                            <strong>Password Reset Successful!</strong>
                            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                                Your password has been successfully updated. You can now use your new password to log in.
                            </p>
                        </div>
                        <Link to="/login" className="login-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
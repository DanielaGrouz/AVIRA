import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import UserService from '../../services/UserService';
import InputField from '../../components/InputField';
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

    const isStrongPassword = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(pass);
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Missing email address. Please request a new password reset link.');
            return;
        }

        // Basic validation
        if (!code || !newPassword || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        const cleanCode = code.trim();
        const codeRegex = /^\d{4}$/;
        if (!codeRegex.test(cleanCode)) {
            setError('Verification code must be exactly 4 digits.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match. Please try again.');
            return;
        }

        if (!isStrongPassword(newPassword)) {
            setError('Password must be at least 6 characters long, include uppercase and lowercase letters, a number, and a special character.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await UserService.resetPassword(email, newPassword, code);
            setSuccess(true);
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

    const clearError = () => {
        if (error) setError('');
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

                        <InputField
                            id="code"
                            type="text"
                            label="Verification Code"
                            placeholder="Enter 4-digit code"
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                clearError();
                            }}
                        />

                        <InputField
                            id="newPassword"
                            type="password"
                            label="New Password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => {
                                setNewPassword(e.target.value);
                                clearError();
                            }}
                        />

                        <InputField
                            id="confirmPassword"
                            type="password"
                            label="Confirm New Password"
                            placeholder="Repeat new password"
                            value={confirmPassword}
                            onChange={(e) => {
                                setConfirmPassword(e.target.value);
                                clearError();
                            }}
                        />

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
                        <Link to="/login" className="login-button" style={{ display: 'inline-block', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}>
                            Go to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
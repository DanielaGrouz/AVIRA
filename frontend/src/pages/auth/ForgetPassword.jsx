import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import '../../styles/Login.css'; // Reusing your existing styles

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResetRequest = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your registered email address.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await UserService.resetPassword(email);
            setSuccess(true);
        } catch (err) {
            console.log(err);
            setError(
                err.data?.message || err.message ||
                'Failed to send verification code. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Reset Password</h2>
                    <p>Enter your email to receive a verification code.</p>
                </div>

                {!success ? (
                    <form onSubmit={handleResetRequest} className="login-form">
                        {error && <div className="login-error-message">{error}</div>}

                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                className="login-input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`login-button ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>

                        <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#697386' }}>
                            Remember your password? <Link to="/login" style={{ color: '#5469d4', textDecoration: 'none', fontWeight: '600' }}>Back to Login</Link>
                        </div>
                    </form>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #bbf7d0' }}>
                            <strong>Check your email!</strong>
                            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
                                A verification code has been sent to <strong>{email}</strong>.
                            </p>
                        </div>
                        <Link to="/login" className="login-button" style={{ display: 'inline-block', textDecoration: 'none' }}>
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
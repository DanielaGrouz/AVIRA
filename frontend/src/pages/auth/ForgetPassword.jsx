import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserService from '../../services/UserService';
import InputField from '../../components/InputField';
import '../../styles/auth.css';
import AppRoutes from "../../AppRoutesConfig";

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleResetRequest = async (e) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your registered email address.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await UserService.sendVerificationCode(email);
            setSuccess(true);
            navigate(`${AppRoutes.RESET_PASSWORD}?email=${encodeURIComponent(email)}`);
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

    const clearError = () => {
        if (error) setError('');
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Forgot Password</h2>
                    <p>Enter your email to receive a verification code.</p>
                </div>

                {!success ? (
                    <form onSubmit={handleResetRequest} className="login-form">
                        {error && <div className="login-error-message">{error}</div>}

                        <InputField
                            id="email"
                            type="email"
                            label="Email"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                clearError();
                            }}
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className={`login-button ${loading ? 'loading' : ''}`}
                        >
                            {loading ? 'Sending...' : 'Send Reset Code'}
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
                        <Link to="/login" className="login-button" style={{ display: 'inline-block', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}>
                            Return to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
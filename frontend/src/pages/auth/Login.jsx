import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import '../../styles/auth.css';
import { useAuth } from "../../hooks/useAuth";

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { saveUser } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();

        // Basic Client-Side Validation
        if (!email || password.length < 6) {
            setError('Email is required and password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setError(''); // Clear previous errors

        try {
            const response = await UserService.login(email, password);
            if (response.data.success) {
                const userData = response.data.data;
                saveUser(userData);
                navigate('/');
            }
        } catch (err) {
            console.log(err);
            // Display error message if login fails
            setError(
                err.response?.data?.error?.message ||
                'Login failed. Please check your credentials.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome to AVIRA</h2>
                    <p>Enter your credentials to access your account.</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
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

                    <div className="input-group">
                        <div className='forget-password-container'>
                            <label htmlFor="password" style={{ margin: 0 }}>Password</label>
                            <Link
                                to="/forgot-password"
                                className='forgot-password-button'
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Forgot password?
                            </Link>
                        </div>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            className="login-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Logging in...' : 'Sign In'}
                    </button>

                    <div className='signup-container'>
                        Don't have an account?{' '}
                        <Link
                            to="/signup"
                            className='signup-link'
                            onMouseEnter={(e) => e.target.style.color = '#4a5ece'}
                            onMouseLeave={(e) => e.target.style.color = '#5469d4'}
                        >
                            Sign up for free
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
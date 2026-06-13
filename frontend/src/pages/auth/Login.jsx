import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import InputField from '../../components/InputField';
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

        if (!email.trim()) {
            setError('Email address is required.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await UserService.login(email, password);
            if (response.data.success) {
                const userData = response.data.data;
                saveUser(userData);
                navigate('/');
            }
        } catch (err) {
            console.log(err);
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

                    <InputField
                        id="email"
                        type="email"
                        label="Email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <InputField
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        rightElement={
                            <Link
                                to="/forgot-password"
                                className="forget-password-button"
                            >
                                Forgot password?
                            </Link>
                        }
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <div className="signup-container">
                        Don't have an account?{' '}
                        <Link to="/signup" className="signup-link">
                            Sign up for free
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
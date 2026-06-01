import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import UserService from '../../services/UserService';
import ProfileImageUploader from '../../components/ProfileImageUploader';
import '../../styles/auth.css';
import InputField from '../../components/InputField';

export default function Signup() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [password, setPassword] = useState('');
    const [picture, setPicture] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const isStrongPassword = (pass) => {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        return regex.test(pass);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        // --- Client-Side Validation (Matching Backend Constraints) ---
        if (firstName.trim().length < 2) {
            return setError('First name must be at least 2 characters.');
        }
        if (lastName.trim().length < 2) {
            return setError('Last name must be at least 2 characters.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return setError('Please enter a valid email address.');
        }

        const cleanPhone = phoneNumber.replace(/\D/g, '');

        if (!cleanPhone.startsWith('05') || cleanPhone.length !== 10) {
            return setError('Please enter a valid Israeli phone number (e.g., 0545368889).');
        }

        if (!isStrongPassword(password)) {
            return setError('Password must be at least 6 characters long, include uppercase and lowercase letters, a number, and a special character.');
        }

        setLoading(true);

        try {
            await UserService.create(email, password, firstName, lastName, cleanPhone, picture, 'user');
            await UserService.sendVerificationCode(email);
            // TODO: add toast
            navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (err) {
            const backendErrors = err.data?.error?.details?.errors;
            const errorMessage = backendErrors
                ? backendErrors.join(' | ')
                : err.data?.error?.message || 'Registration failed. Please try again.';

            setError(errorMessage);
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
                    <h2>Create an Account</h2>
                    <p>Join AVIRA today to get started.</p>
                </div>

                <form onSubmit={handleSignup} className="login-form">
                    {error && <div className="login-error-message">{error}</div>}

                    <ProfileImageUploader
                        onImageSelected={(file) => setPicture(file)}
                    />

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <div style={{ flex: 1 }}>
                            <InputField
                                id="firstName"
                                type="text"
                                label="First Name"
                                placeholder="John"
                                value={firstName}
                                onChange={(e) => {
                                    setFirstName(e.target.value);
                                    clearError();
                                }}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <InputField
                                id="lastName"
                                type="text"
                                label="Last Name"
                                placeholder="Doe"
                                value={lastName}
                                onChange={(e) => {
                                    setLastName(e.target.value);
                                    clearError();
                                }}
                            />
                        </div>
                    </div>

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

                    <InputField
                        id="phoneNumber"
                        type="tel"
                        label="Phone Number"
                        placeholder="05XXXXXXXX"
                        value={phoneNumber}
                        onChange={(e) => {
                            setPhoneNumber(e.target.value);
                            clearError();
                        }}
                    />

                    <InputField
                        id="password"
                        type="password"
                        label="Password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            clearError();
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`login-button ${loading ? 'loading' : ''}`}
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: '#697386' }}>
                        Already have an account? <Link to="/login" style={{ color: '#5469d4', textDecoration: 'none', fontWeight: '600' }}>Login</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
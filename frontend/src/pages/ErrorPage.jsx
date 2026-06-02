import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft, FiLock } from 'react-icons/fi';
import '../styles/ErrorPage.css';

const ErrorPage = ({ code = 404 }) => { //defaulting to 404 if nothing is passed
    // Configuration object for different error types
    const errorContent = {
        404: {
            title: "Page Not Found",
            message: "Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.",
            icon: <FiAlertCircle className="not-found-icon" />
        },
        403: {
            title: "Access Denied",
            message: "Sorry, you don't have permission to access this event or page.",
            icon: <FiLock className="not-found-icon" /> // Lock icon for permission issues
        }
    };

    const currentError = errorContent[code] || errorContent[404];

    return (
        <div className="home-container not-found-wrapper">
            <div className="not-found-content">
                <div className="not-found-icon-wrapper">
                    {currentError.icon}
                </div>
                {/* Display the dynamic error and title */}
                <h1 className="not-found-title">{code}</h1>
                <h2 className="not-found-subtitle">{currentError.title}</h2>
                <p className="not-found-text">
                    {currentError.message}
                </p>

                {/* Back Button */}
                <Link to="/" className="modern-create-btn not-found-btn">
                    <FiArrowLeft size={20} strokeWidth={2.5} className="btn-icon" />
                    Back to Home
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
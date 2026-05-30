import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import '../styles/NotFoundPage.css';

const NotFoundPage = () => {
    return (
        <div className="home-container not-found-wrapper">
            <div className="not-found-content">
                <div className="not-found-icon-wrapper">
                    {/* Main 404 Icon */}
                    <FiAlertCircle className="not-found-icon" />
                </div>

                <h1 className="not-found-title">404</h1>
                <h2 className="not-found-subtitle">Page Not Found</h2>
                <p className="not-found-text">
                    Oops! The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
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

export default NotFoundPage;
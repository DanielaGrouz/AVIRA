import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import ProfileImage from './ProfileImage';
import '../styles/Navbar.css';

export default function Navbar() {
    const { user, forgetUser } = useAuth();

    console.log(user)
    // Helper function to handle the active class neatly
    const getLinkClass = ({ isActive }) => isActive ? "nav-link active" : "nav-link";

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-brand">
                    <img
                        src="/logo.png"
                        alt="AVIRA Logo"
                        style={{ width: '24px', height: '24px', objectFit: 'contain', borderRadius: '25%' }}
                        className="brand-image"
                    />
                    <span className="brand-name">AVIRA - Boutique Event Management System 🥂✨️ </span>
                </Link>

                {/* Right Corner: Navigation Links & User Actions */}
                <div className="navbar-actions">
                    <div className="navbar-links">
                        {/* Use NavLink and the 'end' prop for the root route */}
                        <NavLink to="/" end className={getLinkClass}>
                            Dashboard
                        </NavLink>
                        <NavLink to="/settings" className={getLinkClass}>
                            Settings
                        </NavLink>
                    </div>

                    <div className="navbar-divider"></div>

                    <div className="navbar-profile">
                        <ProfileImage
                            src={user?.avatarUrl}
                            fallbackText={user?.firstName || 'User'}
                            size="36px"
                        />
                        <span className="user-greeting">
                            Hello, <strong>{user?.firstName || 'User'}</strong>
                        </span>
                        <Button variant="danger" onClick={forgetUser}>
                            Logout
                        </Button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
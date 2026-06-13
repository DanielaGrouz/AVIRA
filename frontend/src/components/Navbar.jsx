import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from './Button';
import ProfileImage from './ProfileImage';
import '../styles/Navbar.css';
import Config from "../services/Config";

export default function Navbar() {
    const { user, forgetUser } = useAuth();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const logoutRef = useRef(null);

    // Helper function to handle the active class neatly
    const getLinkClass = ({ isActive }) => isActive ? "nav-link active" : "nav-link";

    useEffect(() => {
        function handleClickOutside(event) {
            // If the Logout box is open, and the click was not inside - close the box
            if (showLogoutConfirm && logoutRef.current && !logoutRef.current.contains(event.target)) {
                setShowLogoutConfirm(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showLogoutConfirm]);

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
                            src={
                                user?.picturePath
                                    ? (user.picturePath.startsWith('blob') || user.picturePath.startsWith('http')
                                        ? user.picturePath
                                        : `${Config.BASE_URL}${user.picturePath}`)
                                    : null
                            }
                            key={user?.picturePath}
                            fallbackText={user?.firstName || 'User'}
                            size="36px"
                        />
                        <span className="user-greeting">
                            Hello, <strong>{user?.firstName || 'User'}</strong>
                        </span>
                        <div style={{ position: 'relative' }} ref={logoutRef}>
                            <Button
                                variant="danger"
                                onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
                            >
                                Logout
                            </Button>

                            {/* Logout confirmation box */}
                            {showLogoutConfirm && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    marginTop: '10px',
                                    backgroundColor: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    zIndex: 50,
                                    minWidth: '220px',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', fontWeight: '500' }}>
                                        Are you sure you want to log out?
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <Button variant="text" className="cancel-btn" onClick={() => setShowLogoutConfirm(false)} style={{ padding: '6px 12px', fontSize: '13px' }}>
                                            Cancel
                                        </Button>
                                        <Button variant="danger" onClick={forgetUser} style={{ padding: '6px 12px', fontSize: '13px' }}>
                                            Yes, Log out
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}
// src/components/ProfileImage.jsx
import React, { useState } from 'react';
import '../styles/ProfileImage.css';

export default function ProfileImage({ src, alt, size = '40px', fallbackText = '?' }) {
    const [imgError, setImgError] = useState(false);

    // Grab the first letter for the fallback avatar
    const initial = fallbackText.charAt(0).toUpperCase();

    return (
        <div
            className="profile-image-wrapper"
            style={{ width: size, height: size }}
        >
            {src && !imgError ? (
                <img
                    src={src}
                    alt={alt || 'Profile'}
                    className="profile-image-content"
                    onError={() => setImgError(true)}
                />
            ) : (
                <div className="profile-image-fallback">
                    {initial}
                </div>
            )}
        </div>
    );
}
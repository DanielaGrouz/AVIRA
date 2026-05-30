import React, { useState, useRef, useEffect } from 'react';

export default function ProfileImageUploader({ onImageSelected }) {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isHovering, setIsHovering] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create a local URL for the preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // Pass the actual File object to the parent component
            onImageSelected(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current.click();
    };

    // Cleanup the object URL to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    // Modern inline styles for the uploader
    const uploaderStyle = {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: '#f3f4f6', // Soft gray background
        border: '2px dashed #cbd5e1',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        margin: '0 auto 20px',
        transition: 'all 0.2s ease',
        borderColor: isHovering ? '#5469d4' : '#cbd5e1',
        boxShadow: isHovering ? '0 0 0 3px rgba(84, 105, 212, 0.1)' : 'none'
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
                style={uploaderStyle}
                onClick={handleClick}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Profile Preview"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    // Default User Icon (SVG)
                    <svg
                        width="36"
                        height="36"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                )}

                {/* Overlay on hover when an image already exists */}
                {previewUrl && isHovering && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600'
                    }}>
                        Change
                    </div>
                )}
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
            />
        </div>
    );
}
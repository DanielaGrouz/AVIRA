import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../styles/events/GuestRSVP.css';
import eventService from "../../services/EventService";

const GuestRSVP = () => {
    const { token } = useParams();
    const [guest, setGuest] = useState(null);
    const [event, setEvent] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // RSVP Form States
    const [actionStatus, setActionStatus] = useState(null); // 'loading', 'success', 'error'

    // Image Upload States
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('idle'); // 'idle', 'uploading', 'success', 'error'

    const initData = async () => {
        try {
            const response = await eventService.getGuest(token);
            setGuest(response.data.data.guest);
            setEvent(response.data.data.event);
        } catch (e) {
            console.error("Failed to fetch invitation details", e);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        initData();
    }, []);

    const handleResponse = async (rsvpStatus) => {
        setActionStatus('loading');
        try {
            await eventService.updateGuestAttendance(token, rsvpStatus);
            // Update local guest status so they see their new RSVP state
            setGuest((prevGuest) => ({ ...prevGuest, status: rsvpStatus }));
            setActionStatus('success');
        } catch (error) {
            console.error("Error updating RSVP:", error);
            setActionStatus('error');
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
            setUploadStatus('idle');
        }
    };
    const handleImageUpload = async () => {
        if (!selectedFile) return;

        setUploadStatus('uploading');

        try {
            const response = await eventService.uploadToGalleryEvent(token, selectedFile);
            const imageData = response.data.data;

            const socket = io('http://localhost:3000');

            socket.on('connect', () => {
                socket.emit('imageUploaded', {
                    token,
                    ...imageData,
                });

                // Disconnect shortly after ensuring it was sent
                setTimeout(() => {
                    socket.disconnect();
                }, 500);
            });

            setUploadStatus('success');
            setSelectedFile(null);
        } catch (error) {
            console.error("Error uploading image:", error);
            setUploadStatus('error');
        }
    };

    const formatFriendlyDate = (dateStr) => {
        if (!dateStr || dateStr === 'TBD') return null;
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatFriendlyTime = (timeStr) => {
        if (!timeStr || timeStr === 'TBD') return null;
        const [hour, minute] = timeStr.split(':');
        const d = new Date();
        d.setHours(parseInt(hour, 10), parseInt(minute, 10));
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    // 1. Show a loading screen while fetching initial data
    if (isLoadingData) {
        return (
            <div className="rsvp-page-wrapper">
                <div className="rsvp-card">
                    <div className="rsvp-loading">Loading invitation details... ⏳</div>
                </div>
            </div>
        );
    }

    // 2. Error handling if link is invalid/expired
    if (!guest || !event) {
        return (
            <div className="rsvp-page-wrapper">
                <div className="rsvp-card">
                    <div className="rsvp-error-msg">Invitation not found. Please check your link.</div>
                </div>
            </div>
        );
    }

    // Safely destructure event variables
    const { title, date, time, location } = event;

    return (
        <div className="rsvp-page-wrapper">
            <div className="rsvp-card">

                {actionStatus === 'loading' && (
                    <div className="rsvp-loading">Updating your response... ⏳</div>
                )}

                {actionStatus === 'success' && (
                    <div className="rsvp-success-content">
                        <h2>Thank You, {guest.name}! 🎉</h2>
                        <p>Your response has been recorded successfully.</p>

                        {guest.status === 'confirmed' && (
                            <div className="photo-upload-section" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <h3>Share a Photo! 📸</h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Snap a picture at the event and share it with everyone.</p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ margin: '1rem 0' }}
                                />

                                {selectedFile && (
                                    <button
                                        className="rsvp-btn confirm"
                                        onClick={handleImageUpload}
                                        disabled={uploadStatus === 'uploading'}
                                    >
                                        {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Photo'}
                                    </button>
                                )}

                                {uploadStatus === 'success' && <div style={{ color: '#10b981', marginTop: '1rem' }}>Photo uploaded successfully!</div>}
                                {uploadStatus === 'error' && <div style={{ color: '#ef4444', marginTop: '1rem' }}>Failed to upload. Please try again.</div>}
                            </div>
                        )}

                        <button className="rsvp-btn outline-btn" onClick={() => setActionStatus(null)} style={{marginTop: '1.5rem'}}>
                            Go Back
                        </button>
                    </div>
                )}

                {actionStatus !== 'loading' && actionStatus !== 'success' && (
                    <>
                        <h1>Hello, {guest.name}! 👋</h1>
                        <p>We would love for you to join us.</p>

                        {/* Display previous RSVP status if they have one */}
                        {guest.status !== 'pending' && (
                            <div style={{ backgroundColor: '#f1f5f9', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                Your current RSVP status: <strong>{guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}</strong>
                            </div>
                        )}

                        <div className="rsvp-event-details">
                            <h3>{title && title !== 'TBD' ? title : 'Our Event'}</h3>

                            {date && date !== 'TBD' && (
                                <div className="detail-item">
                                    <span className="detail-icon">📅</span>
                                    <span>{formatFriendlyDate(date)}</span>
                                </div>
                            )}

                            {time && time !== 'TBD' && (
                                <div className="detail-item">
                                    <span className="detail-icon">⏰</span>
                                    <span>{formatFriendlyTime(time)}</span>
                                </div>
                            )}

                            {location && location !== 'TBD' && (
                                <div className="detail-item">
                                    <span className="detail-icon">📍</span>
                                    <span>{location}</span>
                                </div>
                            )}
                        </div>

                        <div className="rsvp-buttons">
                            {/* Adding a visual cue if they have already selected an option */}
                            <button
                                className="rsvp-btn confirm"
                                onClick={() => handleResponse('confirmed')}
                                style={guest.status === 'confirmed' ? { border: '2px solid #10b981', transform: 'scale(1.02)' } : {}}
                            >
                                Yes, I'll be there ✓
                            </button>
                            <button
                                className="rsvp-btn decline"
                                onClick={() => handleResponse('cancelled')}
                                style={guest.status === 'cancelled' ? { border: '2px solid #ef4444', transform: 'scale(1.02)' } : {}}
                            >
                                No, I can't make it ✕
                            </button>
                        </div>

                        {/* If they reopen the link and are already confirmed, they can still access the photo upload from the main screen */}
                        {guest.status === 'confirmed' && (
                            <div className="photo-upload-section" style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '8px' }}>
                                <h3>Share a Photo! 📸</h3>
                                <p style={{ fontSize: '0.9rem', color: '#64748b' }}>Snap a picture at the event and share it with everyone.</p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{ margin: '1rem 0', width: '100%' }}
                                />

                                {selectedFile && (
                                    <button
                                        className="rsvp-btn confirm"
                                        onClick={handleImageUpload}
                                        disabled={uploadStatus === 'uploading'}
                                    >
                                        {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload Photo'}
                                    </button>
                                )}

                                {uploadStatus === 'success' && <div style={{ color: '#10b981', marginTop: '1rem' }}>Photo uploaded successfully!</div>}
                                {uploadStatus === 'error' && <div style={{ color: '#ef4444', marginTop: '1rem' }}>Failed to upload. Please try again.</div>}
                            </div>
                        )}

                        {actionStatus === 'error' && (
                            <div className="rsvp-error-msg">
                                Oops, something went wrong. Please try again or contact the host.
                            </div>
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default GuestRSVP;
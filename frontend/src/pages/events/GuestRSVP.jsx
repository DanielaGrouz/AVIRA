import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import '../../styles/events/GuestRSVP.css';
import eventService from '../../services/EventService';
import PhotoUpload from '../../components/events/PhotoUpload';
import Config from "../../services/Config";

const GuestRSVP = () => {
    const { token } = useParams();
    const [guest, setGuest] = useState(null);
    const [event, setEvent] = useState(null);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [actionStatus, setActionStatus] = useState(null); // null | 'loading' | 'success' | 'error'

    const initData = async () => {
        try {
            const response = await eventService.getGuest(token);
            setGuest(response.data.data.guest);
            setEvent(response.data.data.event);
        } catch (e) {
            console.error('Failed to fetch invitation details', e);
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
            setGuest((prev) => ({ ...prev, status: rsvpStatus }));
            setActionStatus('success');
        } catch (error) {
            console.error('Error updating RSVP:', error);
            setActionStatus('error');
        }
    };

    const handlePhotoUpload = async (file) => {
        const response = await eventService.uploadToGalleryEvent(token, file);
        const imageData = response.data.data;

        const socket = io(Config.BASE_URL);

        await new Promise((resolve, reject) => {
            socket.on('connect', () => {
                socket.emit('imageUploaded', { token, ...imageData });
                setTimeout(() => {
                    socket.disconnect();
                    resolve();
                }, 500);
            });

            socket.on('connect_error', (err) => {
                socket.disconnect();
                reject(err);
            });
        });
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


    if (isLoadingData) {
        return (
            <div className="rsvp-page-wrapper">
                <div className="rsvp-card">
                    <div className="rsvp-loading">Loading invitation details... ⏳</div>
                </div>
            </div>
        );
    }


    if (!guest || !event) {
        return (
            <div className="rsvp-page-wrapper">
                <div className="rsvp-card">
                    <div className="rsvp-error-msg">Invitation not found. Please check your link.</div>
                </div>
            </div>
        );
    }

    const { title, date, time, location } = event;


    return (
        <div className="rsvp-page-wrapper">
            <div className="rsvp-card">

                {/* ── Saving indicator ── */}
                {actionStatus === 'loading' && (
                    <div className="rsvp-loading">Updating your response... ⏳</div>
                )}

                {/* ── Success screen ── */}
                {actionStatus === 'success' && (
                    <div className="rsvp-success-content">
                        <h2>Thank You, {guest.name}! 🎉</h2>
                        <p>Your response has been recorded successfully.</p>

                        {/* Upload only shown to confirmed guests */}
                        {guest.status === 'confirmed' && (
                            <PhotoUpload
                                onUpload={handlePhotoUpload}
                                title="Share a Moment"
                                subtitle="Snap a picture at the event and share it with everyone."
                            />
                        )}

                        <button
                            className="rsvp-btn outline-btn"
                            onClick={() => setActionStatus(null)}
                            style={{ marginTop: '1.5rem' }}
                        >
                            Go Back
                        </button>
                    </div>
                )}

                {/* ── Main RSVP screen ── */}
                {actionStatus !== 'loading' && actionStatus !== 'success' && (
                    <>
                        <h1>Hello, {guest.name}! 👋</h1>
                        <p>We would love for you to join us.</p>

                        {/* Current RSVP badge */}
                        {guest.status !== 'pending' && (
                            <div className="rsvp-status-badge">
                                Your current RSVP:{' '}
                                <strong>
                                    {guest.status.charAt(0).toUpperCase() + guest.status.slice(1)}
                                </strong>
                            </div>
                        )}

                        {/* Event details */}
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

                        {/* RSVP buttons */}
                        <div className="rsvp-buttons">
                            <button
                                className="rsvp-btn confirm"
                                onClick={() => handleResponse('confirmed')}
                                style={guest.status === 'confirmed'
                                    ? { border: '2px solid #10b981', transform: 'scale(1.02)' }
                                    : undefined}
                            >
                                Yes, I'll be there ✓
                            </button>
                            <button
                                className="rsvp-btn decline"
                                onClick={() => handleResponse('cancelled')}
                                style={guest.status === 'cancelled'
                                    ? { border: '2px solid #ef4444', transform: 'scale(1.02)' }
                                    : undefined}
                            >
                                No, I can't make it ✕
                            </button>
                        </div>

                        {/* Photo upload — visible when already confirmed and revisiting the link */}
                        {guest.status === 'confirmed' && (
                            <PhotoUpload
                                onUpload={handlePhotoUpload}
                                title="Share a Moment"
                                subtitle="Already confirmed? Upload a photo from the event!"
                            />
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
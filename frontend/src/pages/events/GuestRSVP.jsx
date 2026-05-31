import React, {useEffect, useState} from 'react';
import { useParams } from 'react-router-dom';
import '../../styles/events/GuestRSVP.css';
import eventService from "../../services/EventService";

const GuestRSVP = () => {
    const { eventId, guestId } = useParams();
    const [status, setStatus] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                const response = await eventService.getById(eventId);
                setEventDetails(response.data.data);
            } catch (error) {
                console.error("Failed to load event details:", error);
            } finally {
                setPageLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    const handleResponse = async (rsvpStatus) => {
        setStatus('loading');
        try {
            await eventService.updateGuestAttendance(eventId, guestId, rsvpStatus);
            setStatus('success');
        } catch (error) {
            console.error("Error updating RSVP:", error);
            setStatus('error');
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

    return (
        <div className="rsvp-page-wrapper">
            <div className="rsvp-card">

                {status === 'loading' && (
                    <div className="rsvp-loading">
                        Updating your response... ⏳
                    </div>
                )}

                {status === 'success' && (
                    <div className="rsvp-success-content">
                        <h2>Thank You! 🎉</h2>
                        <p>Your response has been recorded successfully.<br/>You may safely close this window.</p>
                    </div>
                )}

                {status !== 'loading' && status !== 'success' && (
                    <>
                        <h1>You're Invited! 🥂</h1>
                        <p>We would love for you to join us.</p>

                        {/* Event Details Display */}
                        {pageLoading ? (
                            <div className="rsvp-loading" style={{ padding: '1rem' }}>Loading details...</div>
                        ) : eventDetails ? (
                            <div className="rsvp-event-details">
                                <h3>{eventDetails.title || 'Our Event'}</h3>

                                {eventDetails.date && eventDetails.date !== 'TBD' && (
                                    <div className="detail-item">
                                        <span className="detail-icon">📅</span>
                                        <span>{formatFriendlyDate(eventDetails.date)}</span>
                                    </div>
                                )}

                                {eventDetails.time && eventDetails.time !== 'TBD' && (
                                    <div className="detail-item">
                                        <span className="detail-icon">⏰</span>
                                        <span>{formatFriendlyTime(eventDetails.time)}</span>
                                    </div>
                                )}

                                {eventDetails.location && eventDetails.location !== 'TBD' && (
                                    <div className="detail-item">
                                        <span className="detail-icon">📍</span>
                                        <span>{eventDetails.location}</span>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <div className="rsvp-buttons">
                            <button
                                className="rsvp-btn confirm"
                                onClick={() => handleResponse('confirmed')}
                            >
                                Yes, I'll be there ✓
                            </button>
                            <button
                                className="rsvp-btn decline"
                                onClick={() => handleResponse('cancelled')}
                            >
                                No, I can't make it ✕
                            </button>
                        </div>

                        {status === 'error' && (
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
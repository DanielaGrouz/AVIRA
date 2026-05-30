import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Button from '../../components/Button';
import '../../styles/events/CreateEventPage.css';

const CreateEventPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        creatorId: '', // Note: In a real app, you'd likely get this from the authenticated user context
        title: '',
        date: '',
        time: '',
        location: '',
        eventType: '',
        guestsCount: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { creatorId, title, date, time, location, eventType, guestsCount } = formData;

            await EventService.create(
                creatorId,
                title,
                date,
                time,
                location,
                eventType,
                parseInt(guestsCount, 10) || 0
            );

            // Navigate back to the home page on success
            navigate('/');
        } catch (err) {
            console.error("Error creating event:", err);
            setError(err.response?.data?.error?.message || "Failed to create event. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-event-container">
            <div className="create-event-card">
                <Button variant="text" onClick={() => navigate(-1)} className="back-btn">
                    &larr; Back
                </Button>

                <h2>Create New Event</h2>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} className="event-form">
                    <div className="form-group">
                        <label>Creator ID</label>
                        <input type="text" name="creatorId" value={formData.creatorId} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Event Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Date</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Time</label>
                            <input type="time" name="time" value={formData.time} onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Location</label>
                        <input type="text" name="location" value={formData.location} onChange={handleChange} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Event Type</label>
                            <select name="eventType" value={formData.eventType} onChange={handleChange} required>
                                <option value="" disabled>Select type...</option>
                                <option value="Birthday">Birthday</option>
                                <option value="Wedding">Wedding</option>
                                <option value="Corporate">Corporate</option>
                                <option value="Casual">Casual Gathering</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estimated Guests</label>
                            <input type="number" name="guestsCount" min="1" value={formData.guestsCount} onChange={handleChange} required />
                        </div>
                    </div>

                    <Button variant="primary" type="submit" disabled={loading} className="submit-btn">
                        {loading ? 'Creating...' : 'Create Event'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CreateEventPage;
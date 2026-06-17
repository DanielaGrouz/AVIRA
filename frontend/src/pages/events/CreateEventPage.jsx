import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Button from '../../components/Button';
import InputField from '../../components/InputField';
import CustomSelect from '../../components/CustomSelect';

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import '../../styles/events/CreateEventPage.css';

const CreateEventPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    datetime: null,
    location: '',
    eventType: '',
  });

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const getMinTime = () => {
    const now = new Date();
    if (formData.datetime && formData.datetime.toDateString() === now.toDateString()) {
      return now;
    }
    return new Date(now.setHours(0, 0, 0, 0));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { title, datetime, location, eventType } = formData;

      if (!datetime) {
        setError('Please select a date and time.');
        setLoading(false);
        return;
      }

      if (datetime <= new Date()) {
        setError('Event date and time must be in the future.');
        setLoading(false);
        return;
      }

      if (title.trim().length < 2) {
        setError('Event title must be at least 2 characters long.');
        setLoading(false);
        return;
      }

      if (location.trim().length < 2) {
        setError('Location must be at least 2 characters long.');
        setLoading(false);
        return;
      }

      if (!eventType) {
        setError('Please select an event type.');
        setLoading(false);
        return;
      }

      const year = datetime.getFullYear();
      const month = String(datetime.getMonth() + 1).padStart(2, '0');
      const day = String(datetime.getDate()).padStart(2, '0');
      const datePart = `${year}-${month}-${day}`;

      const hours = String(datetime.getHours()).padStart(2, '0');
      const minutes = String(datetime.getMinutes()).padStart(2, '0');
      const timePart = `${hours}:${minutes}`;

      await EventService.create(title, datePart, timePart, location, eventType);

      navigate('/');
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err.response?.data?.error?.message || 'Failed to create event. Please try again.');
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
          <InputField
            label="Event Title"
            id="title"
            name="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            required
          />

          {/* Custom Wrapper for React DatePicker to match InputField styles */}
          <div className="input-group">
            <div className="input-label-row">
              <label htmlFor="datetime">Date & Time</label>
            </div>
            <DatePicker
              id="datetime"
              selected={formData.datetime}
              onChange={(date) => handleChange('datetime', date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              minTime={getMinTime()}
              maxTime={new Date(new Date().setHours(23, 59, 59, 999))}
              className="modern-input"
              placeholderText="Select date and time"
              required
            />
          </div>

          <InputField
            label="Location"
            id="location"
            name="location"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Rothschild Blvd 12, Tel Aviv"
            required
          />

          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <div className="input-label-row">
                <label htmlFor="eventType">Event Type</label>
              </div>
              <CustomSelect
                name="eventType"
                placement="top"
                value={formData.eventType}
                onChange={(e) => handleChange('eventType', e.target.value)}
                options={[
                  { value: '', label: 'Select type...' },
                  { value: 'Birthday', label: 'Birthday' },
                  { value: 'Wedding', label: 'Wedding' },
                  { value: 'Corporate', label: 'Corporate' },
                  { value: 'Casual', label: 'Casual Gathering' },
                  { value: 'Other', label: 'Other' },
                ]}
              />
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

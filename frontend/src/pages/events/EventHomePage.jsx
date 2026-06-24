import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Pagination from '../../components/Pagination';
import InputField from '../../components/InputField';
import Button from '../../components/Button';
import '../../styles/events/EventHomePage.css';
import AppRoutes from '../../AppRoutesConfig';
import { FiPlus, FiCalendar, FiEdit, FiTrash2, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import CustomSelect from '../../components/CustomSelect';

const EventHomePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('eventId');

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPageCount, setTotalPageCount] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [actionType, setActionType] = useState('');

  const [editFormData, setEditFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
  });

  const [modalMessage, setModalMessage] = useState(null);
  const [originalEditData, setOriginalEditData] = useState(null);
  const navigate = useNavigate();
  const PAGE_SIZE = 6;

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await EventService.getAll(currentPage, sortBy, searchQuery, PAGE_SIZE);
      setTotalPageCount(response.data.data.totalPages || 0);
      setEvents(response.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchQuery, sortBy]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const openModal = (e, event, type) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setActionType(type);
    setModalMessage(null);

    if (type === 'edit') {
      const initialData = {
        title: event.title || '',
        date: event.date !== 'TBD' ? event.date : '',
        time: event.time && event.time !== 'TBD' ? event.time.slice(0, 5) : '',
        location: event.location || '',
      };
      setEditFormData(initialData);
      setOriginalEditData(initialData);
    }

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    setActionType('');
    setModalMessage(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleConfirmAction = async () => {
    if (!selectedEvent) return;
    setModalMessage(null);

    if (actionType === 'delete') {
      try {
        await EventService.delete(selectedEvent.eventId);
        fetchEvents();
        closeModal();
      } catch (error) {
        console.error('Failed to delete event:', error);
      }
      return;
    }

    if (actionType === 'edit') {
      let hasChanges = false;
      if (originalEditData) {
        if (editFormData.title !== originalEditData.title) hasChanges = true;
        if (editFormData.date !== originalEditData.date) hasChanges = true;
        if (editFormData.time !== originalEditData.time) hasChanges = true;
        if (editFormData.location !== originalEditData.location) hasChanges = true;
      }

      if (!hasChanges) {
        setModalMessage({ type: 'info', text: 'No changes detected. Update cancelled.' });
        return;
      }

      if (editFormData.title.trim().length < 2) {
        setModalMessage({ type: 'error', text: 'Event title must be at least 2 characters long.' });
        return;
      }
      if (editFormData.location.trim().length < 2) {
        setModalMessage({ type: 'error', text: 'Location must be at least 2 characters long.' });
        return;
      }

      if (editFormData.date && editFormData.time) {
        const eventDateTime = new Date(`${editFormData.date}T${editFormData.time}`);
        if (eventDateTime <= new Date()) {
          setModalMessage({ type: 'error', text: 'Event date and time must be in the future.' });
          return;
        }
      }

      try {
        const payload = { ...editFormData };
        if (payload.time) {
          payload.time = payload.time.slice(0, 5);
        }

        await EventService.update(selectedEvent.eventId, payload);
        setModalMessage({ type: 'success', text: 'Event updated successfully!' });
        fetchEvents();

        setTimeout(() => {
          closeModal();
        }, 1500);
      } catch (error) {
        console.error('Failed to edit event:', error);
        const errorMsg =
          error.response?.data?.error?.message || error.message || 'Failed to update event.';
        setModalMessage({ type: 'error', text: errorMsg });
      }
    }
  };

  const getBadgeDate = (dateStr) => {
    if (!dateStr || dateStr === 'TBD') return { month: 'TBD', day: '' };
    const d = new Date(dateStr);
    if (isNaN(d)) return { month: 'TBD', day: '' };
    return {
      month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      day: d.getDate(),
      year: d.getFullYear(),
    };
  };

  const formatFriendlyTime = (timeStr) => {
    if (!timeStr || timeStr === 'TBD') return 'TBD';
    const [hour, minute] = timeStr.split(':');
    const d = new Date();
    d.setHours(hour, minute);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const generateGoogleCalendarLink = (event) => {
    const title = encodeURIComponent(event.title || 'New Event');
    const location = encodeURIComponent(event.location || '');
    const details = encodeURIComponent(`Type: ${event.eventType}\nGuests: ${event.guestsCount}`);

    let datesStr = '';
    if (event.date && event.date !== 'TBD') {
      const formatLocalObjToGoogle = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
      };

      const formatDateOnly = (d) => {
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
      };

      if (event.time && event.time !== 'TBD') {
        const startDateTime = new Date(`${event.date}T${event.time}`);
        if (!isNaN(startDateTime.getTime())) {
          const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000);
          datesStr = `&dates=${formatLocalObjToGoogle(startDateTime)}/${formatLocalObjToGoogle(endDateTime)}`;
        }
      } else {
        const startDate = new Date(event.date);
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate);
          endDate.setDate(endDate.getDate() + 1);
          datesStr = `&dates=${formatDateOnly(startDate)}/${formatDateOnly(endDate)}`;
        }
      }
    }
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesStr}`;
  };

  const getMessageStyle = (type) => {
    if (type === 'success') return { color: '#10B981', bg: '#D1FAE5' };
    if (type === 'error') return { color: '#EF4444', bg: '#FEE2E2' };
    if (type === 'info') return { color: '#3B82F6', bg: '#DBEAFE' };
    return { color: 'black', bg: 'transparent' };
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-top-row">
          <h1>My Events</h1>
          <button className="modern-create-btn" onClick={() => navigate(AppRoutes.CREATE_EVENT)}>
            <FiPlus size={20} className="btn-icon" />
            Create Event
          </button>
        </div>

        <div className="home-controls">
          <input
            type="text"
            placeholder="Search events..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <CustomSelect
            value={sortBy}
            onChange={handleSortChange}
            placement={'top'}
            options={[
              { value: 'date', label: 'Sort by Date' },
              { value: 'title', label: 'Sort by Title' },
              { value: 'location', label: 'Sort by Location' },
            ]}
          />
        </div>
      </header>

      <div className="events-grid">
        {isLoading ? <div className="empty-state">Loading...</div> : (events.length > 0 ? (
          events.map((event) => {
            const { month, day, year } = getBadgeDate(event.date);

            return (
              <div
                key={event.eventId}
                className="event-card"
                onClick={() => navigate(AppRoutes.getEventDetails(event.eventId))}
              >
                {/* Card Header: Title and Date Badge */}
                <div className="event-card-header">
                  <div className="event-date-badge">
                    <span className="badge-month">{month}</span>
                    <span className="badge-day">{day}</span>
                    {year && <span className="badge-year">{year}</span>}
                  </div>
                  <div className="event-title-area">
                    <h2 className="event-title">{event.title}</h2>
                    <div className="event-time-guests">
                      <span>
                        <FiClock /> {formatFriendlyTime(event.time)}
                      </span>
                      <span>
                        <FiUsers /> {event.guestsCount || 0} Guests
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Body: Location & Map */}
                <div className="event-card-body">
                  {event.location && event.location !== 'TBD' ? (
                    <a
                      href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="event-map-container"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="map-overlay-text">
                        <FiMapPin /> {event.location}
                      </div>
                      <iframe
                        title={`map-${event.eventId}`}
                        width="100%"
                        height="100%"
                        style={{ border: 0, pointerEvents: 'none' }}
                        loading="lazy"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(event.location)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                      ></iframe>
                    </a>
                  ) : (
                    <div className="no-location-box">
                      <FiMapPin /> No Location Set
                    </div>
                  )}
                </div>

                {/* Card Footer: Actions */}
                <div className="event-actions" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={generateGoogleCalendarLink(event)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="google-calendar-btn"
                  >
                    <FiCalendar size={16} />
                    Add to Calendar
                  </a>

                  <div className="card-icon-actions">
                    <button
                      className="icon-btn edit-btn"
                      onClick={(e) => openModal(e, event, 'edit')}
                      title="Edit Event"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      className="icon-btn delete-btn"
                      onClick={(e) => openModal(e, event, 'delete')}
                      title="Delete Event"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">No events found.</div>
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPageCount={totalPageCount}
        onPageChange={setCurrentPage}
      />

      {/* Modal - Unchanged Logic */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{actionType === 'edit' ? 'Edit Event' : 'Delete Event'}</h2>

            {actionType === 'edit' ? (
              <div className="modal-form">
                {modalMessage && (
                  <div
                    style={{
                      color: getMessageStyle(modalMessage.type).color,
                      backgroundColor: getMessageStyle(modalMessage.type).bg,
                      padding: '10px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      marginBottom: '15px',
                      fontSize: '14px',
                      fontWeight: '500',
                    }}
                  >
                    {modalMessage.text}
                  </div>
                )}
                <InputField
                  id="edit-title"
                  label="Event Title"
                  type="text"
                  name="title"
                  value={editFormData.title}
                  onChange={handleEditFormChange}
                  placeholder="Enter event title"
                />
                <InputField
                  id="edit-date"
                  label="Date"
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditFormChange}
                />
                <InputField
                  id="edit-time"
                  label="Time"
                  type="time"
                  name="time"
                  value={editFormData.time}
                  onChange={handleEditFormChange}
                />
                <InputField
                  id="edit-location"
                  label="Location"
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditFormChange}
                  placeholder="Enter event location"
                />
              </div>
            ) : (
              <p>
                Are you sure you want to delete <strong>{selectedEvent?.title}</strong>?
              </p>
            )}

            <div className="modal-actions">
              <Button variant="secondary" className="cancel-btn" onClick={closeModal}>
                {actionType === 'delete' ? 'No' : 'Cancel'}
              </Button>
              <Button
                variant={actionType === 'delete' ? 'danger' : 'primary'}
                className="confirm-btn"
                onClick={handleConfirmAction}
              >
                {actionType === 'delete' ? 'Yes' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventHomePage;

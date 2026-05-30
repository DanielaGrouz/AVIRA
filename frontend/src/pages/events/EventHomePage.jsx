import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventService from '../../services/EventService';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import '../../styles/events/EventHomePage.css';
import AppRoutes from "../../AppRoutesConfig";
import { FiPlus, FiCalendar } from "react-icons/fi"; // הוספתי את האייקון של היומן
import CustomSelect from "../../components/CustomSelect";

const EventHomePage = () => {
    const [events, setEvents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('id');

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);

    const navigate = useNavigate();
    const PAGE_SIZE = 8;

    const fetchEvents = async () => {
        try {
            const response = await EventService.getAll(currentPage, sortBy, searchQuery, PAGE_SIZE);
            setTotalPageCount(response.data.data.totalPages);
            setEvents(response.data.data.data);
        } catch (error) {
            console.error("Failed to fetch events:", error);
        }
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

    // פונקציה לייצור קישור ליומן גוגל
    const generateGoogleCalendarLink = (event) => {
        const title = encodeURIComponent(event.title || 'New Event');
        const location = encodeURIComponent(event.location || '');
        // ניתן להוסיף כאן עוד פרטים לתיאור
        const details = encodeURIComponent(`Type: ${event.eventType}\nGuests: ${event.guestsCount}`);

        let datesStr = '';
        if (event.date && event.date !== 'TBD') {
            const startDate = new Date(event.date);
            if (!isNaN(startDate.getTime())) {
                // המרת התאריך לפורמט שגוגל דורש (YYYYMMDD)
                const formatDate = (date) => {
                    return date.toISOString().replace(/-|:|\.\d+/g, '');
                };

                // מגדיר אירוע של יום שלם בתור ברירת מחדל
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 1);

                const startStr = formatDate(startDate).substring(0, 8);
                const endStr = formatDate(endDate).substring(0, 8);
                datesStr = `&dates=${startStr}/${endStr}`;
            }
        }

        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}${datesStr}`;
    };

    return (
        <div className="home-container">
            <header className="home-header">
                <div className="header-top-row">
                    <h1>My Events</h1>
                    <button
                        className="modern-create-btn"
                        onClick={() => navigate(AppRoutes.CREATE_EVENT)}
                    >
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
                        options={[
                            { value: 'date', label: 'Sort by Date' },
                            { value: 'title', label: 'Sort by Title' },
                            { value: 'location', label: 'Sort by Location' }
                        ]}
                    />
                </div>
            </header>

            <div className="events-grid">
                {events.length > 0 ? (
                    events.map(event => (
                        <div
                            key={event.eventId}
                            className="event-card"
                            onClick={() => navigate(AppRoutes.getEventDetails(event.eventId))}
                        >
                            <h2 className="event-title">{event.title}</h2>
                            <p className="event-detail">Type: {event.eventType}</p>
                            <p className="event-detail">Guests: {event.guestsCount}</p>
                            <p className="event-detail">Date: {event.date || 'TBD'}</p>
                            <p className="event-detail">Location: {event.location || 'TBD'}</p>

                            {/* --- כפתור הוספה ליומן גוגל --- */}
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
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">No events found.</div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPageCount={totalPageCount}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default EventHomePage;
let events = require('../models/eventModel');
let guests = require('../models/guestModel');
let tasks = require('../models/taskModel');
const guestService = require('./guestService');

// Get all events with pagination and sorting
const getAllEventsLogic = (page = 1, limit = 5, sortBy = 'id') => {
    let sortedEvents = [...events].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return {
        page: page,
        totalPages: Math.ceil(events.length / limit),
        data: sortedEvents.slice(startIndex, endIndex)
    };
};

// Get a specific event using its unique ID
const getEventByIdLogic = (id) => {
    return events.find(e => e.eventId === id) || null;
};

// Create a new event and add it to the database
const createEventLogic = (eventData) => {
    const { creatorId, title, date, time, location, eventType, guestsCount } = eventData;
    const newEvent = {
        eventId: events.length > 0 ? Math.max(...events.map(e => e.eventId)) + 1 : 1,
        creatorId: creatorId,
        title,
        date,
        time,
        location,
        eventType,
        guestsCount: guestsCount || 0
    };
    events.push(newEvent);
    return newEvent;
};

// Remove an existing event from the system by ID
const deleteEventLogic = (id) => {
    const eventIndex = events.findIndex(e => e.eventId === id);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    events.splice(eventIndex, 1);
    return true;
};

// Modify details of an existing event based on user input
const updateEventLogic = (id, updateData) => {
    const eventIndex = events.findIndex(e => e.eventId === id);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    const { title, date, time, location, eventType, guestsCount } = updateData;
    events[eventIndex] = {
        ...events[eventIndex],
        title: (title && title.trim() !== "") ? title : events[eventIndex].title,
        date: (date && date.trim() !== "") ? date : events[eventIndex].date,
        time: (time && time.trim() !== "") ? time : events[eventIndex].time,
        location: (location && location.trim() !== "") ? location : events[eventIndex].location,
        eventType: (eventType && eventType.trim() !== "") ? eventType : events[eventIndex].eventType,
        guestsCount: (guestsCount !== undefined && typeof guestsCount === 'number' && guestsCount >= 0)
            ? guestsCount
            : events[eventIndex].guestsCount
    };
    return events[eventIndex];
};

// Get a list of all guests invited to a specific event
const getAllGuestsByEventLogic = (eventId, page = 1, limit = 5, sortBy = 'id') => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    const eventGuests = guests.filter(g => g.eventId === eventId);
    if (eventGuests.length === 0) {
        return { page: 1, totalPages: 0, data: [] };
    }
    let sortedGuests = [...eventGuests].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return {
        page: page,
        totalPages: Math.ceil(eventGuests.length / limit),
        data: sortedGuests.slice(startIndex, endIndex)
    };
};

// Add a new guest to an event and update the guest count
const addGuestToEventLogic = (eventId, guestData) => {
    const eventIndex = events.findIndex(event => event.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    const newGuest = guestService.createGuestLogic({ ...guestData, eventId });
    events[eventIndex].guestsCount = (events[eventIndex].guestsCount || 0) + 1;
    return newGuest;
};

// Get all tasks associated with a specific event ID
const getTasksByEventIdLogic = (eventId) => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    return tasks.filter(t => t.eventId === eventId);
};

// Get all events created by manager ID
const getEventsByCreatorLogic = (creatorId) => {
    return events.filter(e => e.creatorId === parseInt(creatorId));
};

// Get events where a specific person is invited (by name)
const getEventsByGuestNameLogic = (name) => {
    const guestMatches = guests.filter(g => g.name.toLowerCase().includes(name.toLowerCase()));
    const eventIds = [...new Set(guestMatches.map(g => g.eventId))];
    return events.filter(e => eventIds.includes(e.eventId));
};

// Get events where a specific person is invited (by phone number)
const getEventsByPhoneLogic = (phone) => {
    const guestMatches = guests.filter(g => g.phone === phone);
    const eventIds = [...new Set(guestMatches.map(g => g.eventId))];
    return events.filter(e => eventIds.includes(e.eventId));
};

// Browse events by any field provided in filters
const browseEventsLogic = (filters) => {
    let filteredEvents = [...events];
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            // Match values as strings for flexibility (e.g., eventType, location, creatorId)
            filteredEvents = filteredEvents.filter(e =>
                String(e[key]).toLowerCase() === String(filters[key]).toLowerCase()
            );
        }
    });
    return filteredEvents;
};

// Search for a text string across all fields in the event object
const searchEventsLogic = (query) => {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return events.filter(e =>
        Object.values(e).some(val =>
            String(val).toLowerCase().includes(lowerQuery)
        )
    );
};

module.exports = {
    getAllEventsLogic,
    getEventByIdLogic,
    createEventLogic,
    deleteEventLogic,
    updateEventLogic,
    getAllGuestsByEventLogic,
    addGuestToEventLogic,
    getTasksByEventIdLogic,
    getEventsByCreatorLogic,
    getEventsByGuestNameLogic,
    getEventsByPhoneLogic,
    browseEventsLogic,
    searchEventsLogic

};
let events = require('../models/eventModel');
let guests = require('../models/guestModel');
let tasks = require('../models/taskModel');
const guestService = require('./guestService');

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

const getEventByIdLogic = (id) => {
    return events.find(e => e.eventId === id) || null;
};

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

const deleteEventLogic = (id) => {
    const eventIndex = events.findIndex(e => e.eventId === id);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    events.splice(eventIndex, 1);
    return true;
};

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

const addGuestToEventLogic = (eventId, guestData) => {
    const eventIndex = events.findIndex(event => event.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    const newGuest = guestService.createGuestLogic({ ...guestData, eventId });
    events[eventIndex].guestsCount = (events[eventIndex].guestsCount || 0) + 1;
    return newGuest;
};

const getTasksByEventIdLogic = (eventId) => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    return tasks.filter(t => t.eventId === eventId);
};

module.exports = {
    getAllEventsLogic,
    getEventByIdLogic,
    createEventLogic,
    deleteEventLogic,
    updateEventLogic,
    getAllGuestsByEventLogic,
    addGuestToEventLogic,
    getTasksByEventIdLogic
};
// let events = require('../models/eventModel');
// let guests = require('../models/guestModel');
// let tasks = require('../models/taskModel');
//
// const getAllEvents = (req, res) => {
//     const limit = 5;
//     const page = parseInt(req.query.page) || 1;
//     const sortBy = req.query.sortBy || 'id';
//     let sortedEvents = [...events].sort((a, b) => {
//         if (a[sortBy] < b[sortBy]) return -1;
//         if (a[sortBy] > b[sortBy]) return 1;
//         return 0;
//     });
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
//     res.status(200).json({
//         success: true,
//         data: { page: page, totalPages: Math.ceil(events.length / limit), data: paginatedEvents },
//         error: null
//     });
// }
//
// const getEventById = (req, res) => {
//     const id = parseInt(req.params.id);
//     const event = events.find(e => e.eventId === id);
//     if (!event) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "event with ID ${id} was not found.",
//                 details: {}
//             }
//         });
//     }
//     res.status(200).json({
//         success: true,
//         data: event,
//         error: null
//     });
// }
//
// const createEvent = (req, res) => {
//     const { creatorId, title, date, time, location, eventType, guestsCount } = req.body;
//     const newEvent = {
//         eventId: events.length > 0 ? Math.max(...events.map(e => e.eventId)) + 1 : 1,
//         creatorId: creatorId,
//         title,
//         date,
//         time,
//         location,
//         eventType,
//         guestsCount: guestsCount || 0
//     };
//     events.push(newEvent);
//     res.status(201).json({
//         success: true,
//         data: newEvent,
//         error: null
//     });
// };
//
// const deleteEvent = (req, res) => {
//     const { id } = req.params;
//     const eventIndex = events.findIndex(e => e.eventId === parseInt(id));
//     if (eventIndex === -1) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: { code: "NOT_FOUND", message: "Event not found" }
//         });
//     }
//     events.splice(eventIndex, 1);
//     res.status(200).json({
//         success: true,
//         data: { eventId: parseInt(id) },
//         error: null
//     });
// };
//
// const updateEvent = (req, res) => {
//     const id = parseInt(req.params.id);
//     const { title, date, time, location, eventType, guestsCount } = req.body;
//     const eventIndex = events.findIndex(e => e.eventId === id);
//     if (eventIndex === -1) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "Event not found",
//                 details: {}
//             }
//         });
//     }
//     events[eventIndex] = {
//         ...events[eventIndex],
//         title: (title && title.trim() !== "") ? title : events[eventIndex].title,
//         date: (date && date.trim() !== "") ? date : events[eventIndex].date,
//         time: (time && time.trim() !== "") ? time : events[eventIndex].time,
//         location: (location && location.trim() !== "") ? location : events[eventIndex].location,
//         eventType: (eventType && eventType.trim() !== "") ? eventType : events[eventIndex].eventType,
//         guestsCount: (guestsCount !== undefined && typeof guestsCount === 'number' && guestsCount >= 0)
//             ? guestsCount
//             : events[eventIndex].guestsCount
//     };
//     res.status(200).json({
//         success: true,
//         data: { eventId: id },
//         error: null
//     });
// };
//
// const getAllGuestsByEvent = (req, res) => {
//     const id = parseInt(req.params.id);
//     const eventIndex = events.findIndex(e => e.eventId === id);
//     if (eventIndex === -1) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "Event not found",
//                 details: {}
//             }
//         });
//     }
//     const eventGuests = guests.filter(g => g.eventId === id);
//     res.status(200).json({
//         success: true,
//         data: { guests: eventGuests },
//         error: null
//     });
// };
//
// module.exports = { getAllEvents, getEventById, createEvent, deleteEvent, updateEvent,
//     getAllGuestsByEvent, };
//
const eventService = require('../services/eventService');

const getAllEvents = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'id';

        const result = eventService.getAllEventsLogic(page, limit, sortBy);

        res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const getEventById = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const event = eventService.getEventByIdLogic(id);

        if (!event) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `Event with ID ${id} was not found.`, details : {} }
            });
        }
        res.status(200).json({ success: true, data: event, error: null });
    } catch (error) {
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const createEvent = (req, res) => {
    try {
        const newEvent = eventService.createEventLogic(req.body);
        res.status(201).json({ success: true, data: newEvent, error: null });
    } catch (error) {
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const deleteEvent = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        eventService.deleteEventLogic(id);
        res.status(200).json({ success: true, data: { eventId: id }, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `Event with ID ${id} was not found.`, details : {} }});
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const updateEvent = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedEvent = eventService.updateEventLogic(id, req.body);
        res.status(200).json({ success: true, data: { eventId: id, updatedEvent }, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `Event with ID ${id} was not found.`, details : {} }});
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const getAllGuestsByEvent = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'id';
        const result = eventService.getAllGuestsByEventLogic(id, page, limit, sortBy);
        res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `Event with ID ${id} was not found.`, details : {} }});
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const addGuestToEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const newGuest = eventService.addGuestToEventLogic(eventId, req.body);

        res.status(201).json({ success: true, data: newGuest, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `Event with ID ${eventId} not found`, details:{} } });
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const getTasksByEventId = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const eventTasks = eventService.getTasksByEventIdLogic(eventId);
        res.status(200).json({ success: true, data: eventTasks, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `Event with ID ${id} was not found.`, details : {} }});
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    deleteEvent,
    updateEvent,
    getAllGuestsByEvent,
    addGuestToEvent,
    getTasksByEventId
};
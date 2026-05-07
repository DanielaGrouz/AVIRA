let events = require('../models/eventModel');
let guests = require('../models/guestModel');
let tasks = require('../models/taskModel');

const getAllEvents = (req, res) => {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const sortBy = req.query.sortBy || 'id';
    let sortedEvents = [...events].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
    res.status(200).json({
        success: true,
        data: { page: page, totalPages: Math.ceil(events.length / limit), data: paginatedEvents },
        error: null
    });
}

const getEventById = (req, res) => {
    const id = parseInt(req.params.id);
    const event = events.find(e => e.eventId === id);
    if (!event) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "event with ID ${id} was not found.",
                details: {}
            }
        });
    }
    res.status(200).json({
        success: true,
        data: event,
        error: null
    });
}

const createEvent = (req, res) => {
    const { creatorId, title, date, time, location, eventType, guestsCount } = req.body;
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
    res.status(201).json({
        success: true,
        data: newEvent,
        error: null
    });
};

const deleteEvent = (req, res) => {
    const { id } = req.params;
    const eventIndex = events.findIndex(e => e.eventId === parseInt(id));
    if (eventIndex === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: { code: "NOT_FOUND", message: "Event not found" }
        });
    }
    events.splice(eventIndex, 1);
    res.status(200).json({
        success: true,
        data: { eventId: parseInt(id) },
        error: null
    });
};

const updateEvent = (req, res) => {
    const id = parseInt(req.params.id);
    const { title, date, time, location, eventType, guestsCount } = req.body;
    const eventIndex = events.findIndex(e => e.eventId === id);
    if (eventIndex === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "Event not found",
                details: {}
            }
        });
    }
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
    res.status(200).json({
        success: true,
        data: { eventId: id },
        error: null
    });
};

const getAllGuestsByEvent = (req, res) => {
    const id = parseInt(req.params.id);
    const eventIndex = events.findIndex(e => e.eventId === id);
    if (eventIndex === -1) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: "Event not found",
                details: {}
            }
        });
    }
    const eventGuests = guests.filter(g => g.eventId === id);
    res.status(200).json({
        success: true,
        data: { guests: eventGuests },
        error: null
    });
};

// ייבוא הסרוויס של האירועים
const eventService = require('../services/eventService');

const addGuestToEvent = (req, res) => {
    try {
        // 1. חילוץ הנתונים מהבקשה (HTTP)
        const eventId = parseInt(req.params.id); // ה-ID של האירוע מתוך ה-URL (למשל /api/events/5/guests)
        const guestData = req.body;              // הפרטים של האורח שהגיעו בגוף הבקשה

        // 2. הפעלת הלוגיקה העסקית (קריאה לסרוויס עם נתונים נקיים בלבד)
        const newGuest = eventService.addGuestToEvent(eventId, guestData);

        // 3. החזרת תשובת הצלחה ללקוח
        res.status(201).json({
            success: true,
            message: "Guest successfully added to the event",
            data: newGuest,
            error: null
        });

    } catch (error) {
        // 4. טיפול בשגיאות שנזרקו מהסרוויס
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: `Event with ID ${req.params.id} was not found.`
                }
            });
        }

        // במקרה של שגיאה לא צפויה (באג בקוד, נפילת שרת וכו')
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "An internal server error occurred",
                details: error.message
            }
        });
    }
};

module.exports = { addGuestToEvent };

module.exports = { getAllEvents, getEventById, createEvent, deleteEvent, updateEvent,
    getAllGuestsByEvent, };





// const increaseGuestCount = (eventId) => {
//     const event = events.find(event => event.eventId === parseInt(eventId));
//     if (!event) {
//         return false;
//     }
//     event.guestCount += 1;
//     return true;
// };
//
// const addGuestToEvent = (req, res) => {
//     const { eventId } = req.params;
//     const { name, phone, role, status } = req.body;
//
//     const newGuest = {
//         guestId: guests.length > 0 ? Math.max(...guests.map(g => g.guestId)) + 1 : 1,
//         eventId: parseInt(eventId),
//         name,
//         phone,
//         status: status || 'pending',
//         role: role || 'guest'
//     };
//
//     const increaseSuccess = increaseGuestCount(eventId);
//     if (!increaseSuccess) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "EVENT_NOT_FOUND",
//                 message: `Event with ID ${eventId} was not found`
//             }
//         });
//     }
//
//     guests.push(newGuest);
//
//     res.status(201).json({
//         success: true,
//         data: newGuest,
//         error: null
//     });
// };
//
// const getAllGuestsByEvent = (req, res) => {
//     const { eventId } = req.params;
//     const limit = 5;
//     const page = parseInt(req.query.page) || 1;
//     const sortBy = req.query.sortBy || 'id';
//     const eventGuests = guests.filter(guest => guest.eventId === eventId);
//     if (eventGuests.length === 0) {
//         return res.status(200).json({
//             success: true,
//             data: { page: 1, totalPages: 0, data: [] },
//             error: null
//         });
//     }
//     let sortedGuests = [...eventGuests].sort((a, b) => {
//         if (a[sortBy] < b[sortBy]) return -1;
//         if (a[sortBy] > b[sortBy]) return 1;
//         return 0;
//     });
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedGuests = sortedGuests.slice(startIndex, endIndex);
//     res.status(200).json({
//         success: true,
//         data: {
//             page: page,
//             totalPages: Math.ceil(eventGuests.length / limit),
//             data: paginatedGuests
//         },
//         error: null
//     });
// }
//
// // Get all tasks associated with a specific eventId
// const getTasksByEventId = (req, res) => {
//     const eventId = parseInt(req.params.eventId);
//     const eventTasks = tasks.filter(t => t.eventId === eventId);
//
//     res.status(200).json({
//         success: true,
//         data: eventTasks,
//         error: null
//     });
// };















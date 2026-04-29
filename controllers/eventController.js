let events = require('../models/eventModel');
let guests = require('../models/guestModel');
let tasks = require('../models/taskModel');

const getAllEvents = (req, res) => {
    res.status(200).json({
        success: true,
        data: events,
        error: null
    });
}

const getEventWithDetails = (req, res) => {
    const id = parseInt(req.params.id);
    const event = events.find(e => e.eventId === id);

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    const eventGuests = guests.filter(g => g.eventId === id);
    const eventTasks = tasks.filter(t => t.eventId === id);

    res.status(200).json({
        success: true,
        data: { ...event, guests: eventGuests, tasks: eventTasks },
        error: null
    });
};

const createEvent = (req, res) => {
    const { title, date, time, location, eventType, creatorId } = req.body;
    const creator = users.filter(u => u.userId === parseInt(creatorId));
    if (!creator) {
        return res.status(404).json({
            success: false,
            data: null,
            error: { code: "NOT_FOUND", message: "Creator user not found" }
        });
    }
    const newEvent = {
        eventId: events.length > 0 ? Math.max(...events.map(e => e.eventId)) + 1 : 101,
        creatorId: creator.userId,
        title,
        date,
        time,
        location,
        eventType,
        guestsCount: 1 //the creator of the event (also the manager) is the first guest in the event
    };
    events.push(newEvent);

    const newManager = {
        guestId: guests.length > 1 ? Math.max(...guests.map(g => g.guestId)) + 1 : 1,
        eventId: newEvent.eventId,
        userId: creator.userId,
        name: ${creatorUser.firstName} ${creatorUser.lastName},
        phone: creator.phoneNumber,
        status: "confirmed",
        role: "manager"
    };
    guests.push(newManager);

    res.status(201).json({
        success: true,
        data: { eventId: newEvent.eventId, message: "Event created and manager assigned" },
        error: null
    });
};

const addGuestToEvent = (req, res) => {
    const eventId = parseInt(req.params.id);
    const { firstname, lastName, phone } = req.body;

    const newGuest = {
        guestId: guests.length + 1,
        eventId,
        userId: null,
        name,
        phone,
        status: "pending",
        role: "guest"
    };

    guests.push(newGuest);

    const event = events.find(e => e.eventId === eventId);
    if (event) event.guestsCount++;

    res.status(201).json({ success: true, data: newGuest, error: null });
};

const addTaskToEvent = (req, res) => {
    const eventId = parseInt(req.params.id);
    const { title, priority } = req.body;

    const newTask = {
        taskId: tasks.length + 1,
        eventId,
        title,
        status: "pending",
        priority: priority || "medium"
    };

    tasks.push(newTask);
    res.status(201).json({ success: true, data: newTask, error: null });
};

module.exports = {
    getAllEvents,
    getEventWithDetails,
    generateAIShoppingList,
    createEvent,
    addGuestToEvent,
    addTaskToEvent
};


module.exports = { getAllEvents, getEventWithDetails, generateAIShoppingList };














const generateAIShoppingList = (req, res) => {
    const id = parseInt(req.params.id);
    const event = events.find(e => e.eventId === id);

    if (!event) return res.status(404).json({ success: false, message: "Event not found" });

    // סימולציה של AI מבוסס סוג אירוע וכמות אורחים
    const suggestions = [
        { item: "Champagne Bottles", qty: Math.ceil(event.guestsCount / 4) },
        { item: "Pastel Decorations Set", qty: 1 },
        { item: "Luxury Gift Bags", qty: event.guestsCount }
    ];

    res.status(200).json({
        success: true,
        data: {
            recommendedList: suggestions,
            aiNote: `Generated for a ${event.eventType} event with ${event.guestsCount} guests.`
        },
        error: null
    });
};

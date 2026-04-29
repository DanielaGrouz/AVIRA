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

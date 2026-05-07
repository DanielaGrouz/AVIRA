let events = require('../models/eventModel');
const guestService = require('./guestService');

const addGuestToEvent = (eventId, guestData) => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) {
        throw new Error("EVENT_NOT_FOUND");
    }
    const dataForNewGuest = {
        ...guestData,
        eventId: eventId
    };
    const newGuest = guestService.createGuestLogic(dataForNewGuest);
    events[eventIndex].guestsCount = (events[eventIndex].guestsCount || 0) + 1;
    return newGuest;
};

module.exports = {addGuestToEvent,};
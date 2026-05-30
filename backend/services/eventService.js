let events = require('../models/eventModel');
let guests = require('../models/guestModel');
let tasks = require('../models/taskModel');
const guestService = require('./guestService');
const {getSupermarketList, getEventTaskList, getStoresForEvent} = require("../utils/generateTextClient");
const {generateEventInvite} = require("../utils/generateImageClient");
const taskService = require('./taskService');

// Get all events with pagination and sorting
const getAllEventsLogic = (page, limit,sortBy, searchQuery, userData) => {
    let filteredEvents = [...events];
    if (userData.userRole !== 'admin'){
        filteredEvents = filteredEvents.filter(event => event.creatorId === userData.userId);
    }
    if (searchQuery && searchQuery.trim() !== "") {
        const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/);

        filteredEvents = filteredEvents.filter((event) => {
            const searchableString = [
                event.title,
                event.location,
                event.eventType,
                event.date
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return queryTerms.every(term => searchableString.includes(term));
        });
    }
    let sortedEvents = filteredEvents.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    return {
        page: page,
        totalPages: Math.ceil(filteredEvents.length / limit),
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

// Get all tasks associated with a specific event ID
const getTasksByEventIdLogic = (eventId) => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    return tasks.filter(t => t.eventId === eventId);
};

// Add a new task to a specific event
const addTaskToEventLogic = (eventId, taskData) => {
    const event = events.find(e => e.eventId === eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    return taskService.createTaskLogic({ ...taskData, eventId });
};

// Update an existing task within an event
const updateTaskInEventLogic = (eventId, taskId, updateData) => {
    const event = events.find(e => e.eventId === eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    const task = taskService.getTaskByIdLogic(taskId);
    if (!task || task.eventId !== eventId) throw new Error("TASK_NOT_FOUND_IN_EVENT");
    return taskService.updateTaskLogic(taskId, updateData);
};

// Remove a task from an event
const removeTaskFromEventLogic = (eventId, taskId) => {
    const event = events.find(e => e.eventId === eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    const task = taskService.getTaskByIdLogic(taskId);
    if (!task || task.eventId !== eventId) throw new Error("TASK_NOT_FOUND_IN_EVENT");
    return taskService.deleteTaskLogic(taskId);
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


// Add a new guest to an event and update the guest count
const addGuestToEventLogic = (eventId, guestData) => {
    const eventIndex = events.findIndex(event => event.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    const newGuest = guestService.createGuestLogic({ ...guestData, eventId });
    events[eventIndex].guestsCount = (events[eventIndex].guestsCount || 0) + 1;
    return newGuest;
};

// Remove a guest from an event and update guests count
const removeGuestFromEventLogic = (eventId, guestId) => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    // Verify the guest actually belongs to this specific event
    const guest = guestService.getGuestByIdLogic(guestId);
    if (!guest || guest.eventId !== eventId) throw new Error("GUEST_NOT_FOUND_IN_EVENT");
    // Call the guest service to perform the actual deletion
    guestService.deleteGuestLogic(guestId);
    // Update the event's guest count
    if (events[eventIndex].guestsCount > 0) {
        events[eventIndex].guestsCount -= 1;
    }
    return true;
};

// Update guest details through the event
const updateGuestInEventLogic = (eventId, guestId, updateData) => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    const guest = guestService.getGuestByIdLogic(guestId);
    if (!guest || guest.eventId !== eventId) throw new Error("GUEST_NOT_FOUND_IN_EVENT");
    // Call the guest service to perform the update
    return guestService.updateGuestLogic(guestId, updateData);
};

// Confirm guest attendance
const confirmGuestAttendanceLogic = (eventId, guestId, rsvpStatus) => {
    const eventIndex = events.findIndex(e => e.eventId === eventId);
    if (eventIndex === -1) throw new Error("EVENT_NOT_FOUND");
    const guest = guestService.getGuestByIdLogic(guestId);
    if (!guest || guest.eventId !== eventId) throw new Error("GUEST_NOT_FOUND_IN_EVENT");
    // Update only the status field
    return guestService.updateGuestLogic(guestId, { status: rsvpStatus });
};

const generatePhotoInviteLogic = async (eventId) => {
    const event = events.find(e => e.eventId === parseInt(eventId));
    if (!event) throw new Error("EVENT_NOT_FOUND");
    return await generateEventInvite(event);
};

const saveInvitationLogic = async (eventId, invitePath) => {
    const index = events.findIndex(e => e.eventId === parseInt(eventId));
    if (index === -1) throw new Error("EVENT_NOT_FOUND");
    const event = events[index];
    events[index] = {...event, invitationPath: invitePath};
}

const generateShoppingListLogic = async (eventId) => {
    const index = events.findIndex(e => e.eventId === parseInt(eventId));
    if (index === -1) throw new Error("EVENT_NOT_FOUND");
    const event = events[index];
    return getSupermarketList(event);
    // events[index] = {...event, superMarketList};
    // return superMarketList;
};

const generateTaskListLogic = async (eventId) => {
    const index = events.findIndex(e => e.eventId === parseInt(eventId));
    if (index === -1) throw new Error("EVENT_NOT_FOUND");
    const event = events[index];
    // events[index] = {...event, tasksList};
    return getEventTaskList(event);
};

const findRelevantStores = async (currLocation, eventId) => {
    const event = events.find(e => e.eventId === parseInt(eventId));
    if (!event) throw new Error("EVENT_NOT_FOUND");
    let tasksList = tasks.filter(task => task.eventId === eventId);
    if (tasksList.length === 0) throw new Error("TASKS_LIST_IS_EMPTY");
    tasksList = tasksList.map(task => task.title);
    return getStoresForEvent(currLocation, tasksList);
}

module.exports = {
    saveInvitationLogic,
    generateShoppingListLogic,
    findRelevantStores,
    generatePhotoInviteLogic,
    generateTaskListLogic,
    getAllEventsLogic,
    getEventByIdLogic,
    createEventLogic,
    deleteEventLogic,
    updateEventLogic,
    getAllGuestsByEventLogic,
    getTasksByEventIdLogic,
    addTaskToEventLogic,
    updateTaskInEventLogic,
    removeTaskFromEventLogic,
    getEventsByCreatorLogic,
    getEventsByGuestNameLogic,
    getEventsByPhoneLogic,
    addGuestToEventLogic,
    removeGuestFromEventLogic,
    updateGuestInEventLogic,
    confirmGuestAttendanceLogic
};
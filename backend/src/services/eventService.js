const { Event, User, Guest, Task } = require('../../models');
const { Op } = require('sequelize');
const guestService = require('./guestService');
const {getSupermarketList, getEventTaskList, getStoresForEvent} = require("../utils/generateTextClient");
const {generateEventInvite} = require("../utils/generateImageClient");
const taskService = require('./taskService');

// Get all events with pagination and sorting
const getAllEventsLogic = async (page, limit,sortBy, searchQuery, userData) => {
    const offset = (page - 1) * limit;
    let whereClause = {};

    // Filter by creator if not admin
    if (userData.userRole !== 'admin') {
        whereClause.creatorId = userData.userId;
    }

    // Dynamic Search Query
    if (searchQuery && searchQuery.trim() !== "") {
        const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/);

        // Sequelize Op.and ensures EVERY word typed matches AT LEAST ONE of the fields
        whereClause[Op.and] = queryTerms.map(term => ({
            [Op.or]: [
                { title: { [Op.like]: `%${term}%` } },
                { location: { [Op.like]: `%${term}%` } },
                { eventType: { [Op.like]: `%${term}%` } }
            ]
        }));
    }
    // findAndCountAll is perfect for pagination; it returns { count, rows }
    const { count, rows } = await Event.findAndCountAll({
        where: whereClause,
        order: [[sortBy, 'ASC']], // Defaulting to ASC, modify if you pass sortDirection
        limit: parseInt(limit),
        offset: parseInt(offset)
    });
    return {
        page: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        data: rows
    };
};

// Get a specific event using its unique ID
const getEventByIdLogic = async (id) => {
    return await Event.findByPk(id);
};
const createEventLogic = async (creatorId, eventData) => {
    const { title, date, time, location, eventType } = eventData;

    // 1. Create the event
    const newEvent = await Event.create({
        creatorId,
        title,
        date,
        time,
        location,
        eventType,
        guestsCount: 1 // Default to 1 because the creator is a manager
    });

    // 2. Auto-add the creator as a manager to the guest list
    const creator = await User.findByPk(creatorId);
    if (creator) {
        await guestService.createGuestLogic({
            eventId: newEvent.eventId,
            name: `${creator.firstName} ${creator.lastName}`,
            phone: creator.phoneNumber,
            role: 'manager',
            status: 'confirmed'
        });
    }

    return newEvent;
};

const deleteEventLogic = async (id) => {
    // Because of 'CASCADE' in our model setup, deleting the event deletes its tasks & guests
    const deletedRows = await Event.destroy({ where: { eventId: id } });
    if (deletedRows === 0) throw new Error("EVENT_NOT_FOUND");
    return true;
};

const updateEventLogic = async (id, updateData) => {
    const [updatedRows] = await Event.update(updateData, {
        where: { eventId: id }
    });
    if (updatedRows === 0) throw new Error("EVENT_NOT_FOUND");

    return await Event.findByPk(id);
};


// Replaces processListData by shifting the workload to the database
const getAllGuestsByEventLogic = async (eventId, page , limit, sortBy, sortDirection, searchQuery) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    const offset = (page - 1) * limit;
    let whereClause = { eventId };

    if (searchQuery && searchQuery.trim() !== "") {
        whereClause[Op.or] = [
            { name: { [Op.like]: `%${searchQuery}%` } },
            { phone: { [Op.like]: `%${searchQuery}%` } }
        ];
    }
    const validSortDirection = (sortDirection === '1') ? 'ASC' : 'DESC';

    const { count, rows } = await Guest.findAndCountAll({
        where: whereClause,
        order: [[sortBy, validSortDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    return { page: parseInt(page), totalPages: Math.ceil(count / limit), data: rows };
};

const getTasksByEventIdLogic = async (eventId, page, limit, sortBy, sortDirection, searchQuery = "") => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    const offset = (page - 1) * limit;
    let whereClause = { eventId };

    if (searchQuery && searchQuery.trim() !== "") {
        whereClause.title = { [Op.like]: `%${searchQuery}%` };
    }
    const validSortDirection = (sortDirection === '1') ? 'ASC' : 'DESC';

    const { count, rows } = await Task.findAndCountAll({
        where: whereClause,
        order: [[sortBy, validSortDirection]],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    return { page: parseInt(page), totalPages: Math.ceil(count / limit), data: rows };
};

const addTaskToEventLogic = async (eventId, taskData) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");
    return await taskService.createTaskLogic({ ...taskData, eventId });
};

const updateTaskInEventLogic = async (eventId, taskId, updateData) => {
    const task = await Task.findOne({ where: { taskId, eventId } });
    if (!task) throw new Error("TASK_NOT_FOUND_IN_EVENT");
    return await taskService.updateTaskLogic(taskId, updateData);
};

const removeTaskFromEventLogic = async (eventId, taskId) => {
    const task = await Task.findOne({ where: { taskId, eventId } });
    if (!task) throw new Error("TASK_NOT_FOUND_IN_EVENT");
    return taskService.deleteTaskLogic(taskId);
};


const getEventsByCreatorLogic = async (creatorId) => {
    return await Event.findAll({ where: { creatorId } });
};

// Find events where a guest with a specific name is attending
const getEventsByGuestNameLogic = async (name) => {
    return await Event.findAll({
        include: [{
            model: Guest,
            where: { name: { [Op.like]: `%${name}%` } },
            attributes: [] // We only want the Event data, not the nested guest array here
        }]
    });
};

const getEventsByPhoneLogic = async (phone) => {
    return await Event.findAll({
        include: [{
            model: Guest,
            where: { phone },
            attributes: []
        }]
    });
};

const addGuestToEventLogic = async (eventId, guestData) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    const newGuest = await guestService.createGuestLogic({ ...guestData, eventId });

    // DB Native Increment
    await event.increment('guestsCount');

    return newGuest;
};

const removeGuestFromEventLogic = async (eventId, guestId) => {
    const guest = await Guest.findOne({ where: { guestId, eventId } });
    if (!guest) throw new Error("GUEST_NOT_FOUND_IN_EVENT");

    await guestService.deleteGuestLogic(guestId);

    const event = await Event.findByPk(eventId);
    if (event && event.guestsCount > 0) {
        await event.decrement('guestsCount');
    }

    return true;
};

const updateGuestInEventLogic = async (eventId, guestId, updateData) => {
    const guest = await Guest.findOne({ where: { guestId, eventId } });
    if (!guest) throw new Error("GUEST_NOT_FOUND_IN_EVENT");
    return await guestService.updateGuestLogic(guestId, updateData);
};

const updateGuestRSVPLogic = async (eventId, guestId, rsvpStatus) => {
    const guest = await Guest.findOne({ where: { guestId, eventId } });
    if (!guest) throw new Error("GUEST_NOT_FOUND_IN_EVENT");

    if (!['confirmed', 'cancelled', 'pending'].includes(rsvpStatus)) {
        throw new Error("INVALID_STATUS");
    }
    return await guestService.updateGuestLogic(guestId, { status: rsvpStatus });
};

const generatePhotoInviteLogic = async (eventId) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    // Pass plain JSON object to the AI client, not the Sequelize instance
    return await generateEventInvite(event.get({ plain: true }));
};

const saveInvitationLogic = async (eventId, invitePath) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    event.invitationPath = invitePath;
    await event.save();
    return event;
};

const generateShoppingListLogic = async (eventId) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    return getSupermarketList(event.get({plain: true}));
};

const generateTaskListLogic = async (eventId) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    return getEventTaskList(event.get({plain: true}));
};

const findRelevantStores = async (currLocation, eventId) => {
    const event = await Event.findByPk(eventId);
    if (!event) throw new Error("EVENT_NOT_FOUND");

    const tasksList = await Task.findAll({ where: { eventId } });
    if (!tasksList || tasksList.length === 0) throw new Error("TASKS_LIST_IS_EMPTY");

    const taskTitles = tasksList.map(task => task.title);
    return getStoresForEvent(currLocation, taskTitles);
};

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
    updateGuestRSVPLogic
};
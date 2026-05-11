const eventService = require('../services/eventService');

// Get all events with pagination and sorting
const getAllEvents = (req, res) => {
    try {
        const limit = 5;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'id';

        const result = eventService.getAllEventsLogic(page, limit, sortBy);

        res.status(200).json({
            success: true,
            data: result,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Get a specific event using its ID
const getEventById = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const event = eventService.getEventByIdLogic(id);

        if (!event) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: `event with ID ${id} was not found.`,
                    details: {}
                }
            });
        }

        res.status(200).json({
            success: true,
            data: event,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Create a new event
const createEvent = (req, res) => {
    try {
        const newEvent = eventService.createEventLogic(req.body);

        res.status(201).json({
            success: true,
            data: newEvent,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Delete an existing event
const deleteEvent = (req, res) => {
    try {
        const { id } = req.params;
        eventService.deleteEventLogic(parseInt(id));

        res.status(200).json({
            success: true,
            data: { eventId: parseInt(id) },
            error: null
        });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Update details of an existing event
const updateEvent = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        eventService.updateEventLogic(id, req.body);

        res.status(200).json({
            success: true,
            data: { eventId: id },
            error: null
        });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
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
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Get a list of all guests invited to a specific event
const getAllGuestsByEvent = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const result = eventService.getAllGuestsByEventLogic(id);

        res.status(200).json({
            success: true,
            data: { guests: result.data },
            error: null
        });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
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
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Get all tasks linked to a specific event
const getTasksByEventId = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const eventTasks = eventService.getTasksByEventIdLogic(eventId);

        res.status(200).json({ success: true, data: eventTasks, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Add a task to an event
const addTaskToEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const newTask = eventService.addTaskToEventLogic(eventId, req.body);
        res.status(201).json({ success: true, data: newTask, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Update task details (status, description, etc.)
const updateTaskInEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const taskId = parseInt(req.params.taskId);
        const updatedTask = eventService.updateTaskInEventLogic(eventId, taskId, req.body);
        res.status(200).json({ success: true, data: updatedTask, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "TASK_NOT_FOUND_IN_EVENT" || error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Task or Event not found", details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Remove a task from an event
const removeTaskFromEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const taskId = parseInt(req.params.taskId);
        eventService.removeTaskFromEventLogic(eventId, taskId);
        res.status(200).json({ success: true, data: { eventId, taskId, action: "deleted" }, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "TASK_NOT_FOUND_IN_EVENT" || error.message === "TASK_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Task or Event not found", details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Get events managed by a specific creator
const getEventsByCreator = (req, res) => {
    try {
        const creatorId = req.params.creatorId;
        const data = eventService.getEventsByCreatorLogic(creatorId);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};

// Get events where a specific person is invited (by name)
const getEventsByGuestName = (req, res) => {
    try {
        const name = req.params.name;
        const data = eventService.getEventsByGuestNameLogic(name);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};

// Get events where a specific person is invited (by phone)
const getEventsByPhone = (req, res) => {
    try {
        const phone = req.params.phone;
        const data = eventService.getEventsByPhoneLogic(phone);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};

// Browse events using exact query filters
const browseEvents = (req, res) => {
    try {
        const data = eventService.browseEventsLogic(req.query);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};

// Search events using a free text query across all fields
const searchEvents = (req, res) => {
    try {
        const query = req.query.q;
        const data = eventService.searchEventsLogic(query);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};

// Add a new guest to an event
const addGuestToEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const newGuest = eventService.addGuestToEventLogic(eventId, req.body);

        res.status(201).json({ success: true, data: newGuest, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: `Event with ID ${req.params.id} not found`, details: {} }
            });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: { code: "Internal Server Error", message: "Internal Server Error", details: {} }
        });
    }
};

// Remove a guest from an event
const removeGuestFromEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const guestId = parseInt(req.params.guestId);
        eventService.removeGuestFromEventLogic(eventId, guestId);
        res.status(200).json({ success: true, data: { eventId, guestId, action: "deleted" }, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "GUEST_NOT_FOUND_IN_EVENT" || error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: error.message, details: {} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};

// Update guest details
const updateGuestInEvent = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const guestId = parseInt(req.params.guestId);
        const updatedGuest = eventService.updateGuestInEventLogic(eventId, guestId, req.body);
        res.status(200).json({ success: true, data: updatedGuest, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "GUEST_NOT_FOUND_IN_EVENT" || error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: error.message, details: {} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};

// Confirm guest attendance
const confirmGuestAttendance = (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const guestId = parseInt(req.params.guestId);
        const { status } = req.body;
        const updatedGuest = eventService.confirmGuestAttendanceLogic(eventId, guestId, status);
        res.status(200).json({ success: true, data: updatedGuest, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "GUEST_NOT_FOUND_IN_EVENT" || error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: error.message, details: {} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "Internal Server Error", message: "Internal Server Error", details: {} } });
    }
};



const generateInvite = async (req, res) => {
    try {
        const inviteImage = await eventService.generatePhotoInviteLogic(parseInt(req.params.id));
        res.set('Content-Type', 'image/jpeg');
        res.status(200).send(inviteImage);
    } catch (error) {
        console.error(error);
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        res.status(500).json({ success: false, data: null,
            error: {
                code: "Internal Server Error", message: "Internal Server Error", details: {}
            }});
    }
};

const generateShoppingList = async (req, res) => {
    try {
        const shoppingList = await eventService.generateShoppingListLogic(req.params.id);
        res.status(200).json({ success: true, data: shoppingList, error: null });
    } catch (error) {
        console.error(error);
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        res.status(500).json({ success: false, data: null,
            error: {
                code: "Internal Server Error", message: "Internal Server Error", details: {}
            }});
    }
};

const generateTaskList = async (req, res) => {
    try {
        const taskList = await eventService.generateTaskListLogic(parseInt(req.params.id));
        res.status(200).json({ success: true, data: taskList, error: null });
    } catch (error) {
        console.error(error);
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        res.status(500).json({ success: false, data: null,
            error: {
                code: "Internal Server Error", message: "Internal Server Error", details: {}
            }});
    }
};

const findStores = async (req, res) => {
    try {
        const storesList = await eventService.findRelevantStores(req.body.location, parseInt(req.params.id));
        res.status(200).json({ success: true, data: storesList, error: null });
    } catch (error) {
        console.error(error);
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        else if (error.message === "TASKS_LIST_IS_EMPTY") {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: "BAD_REQUEST", message: "task list was not generated yet", details: {} }
            });
        }
        res.status(500).json({ success: false, data: null,
            error: {
                code: "Internal Server Error", message: "Internal Server Error", details: {}
            }});
    }
};

const saveInvitation = async (req, res) => {
    try {
        const picturePath = `/uploads/${req.file.filename}`;
        await eventService.saveInvitationLogic(parseInt(req.params.id), picturePath);
        res.status(200).json({ success: true, data: {path: picturePath}, error: null });
    } catch (error) {
        console.error(error);
        if (error.message === "EVENT_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: "Event not found", details: {} }
            });
        }
        res.status(500).json({ success: false, data: null,
            error: {
                code: "Internal Server Error", message: "Internal Server Error", details: {}
            }});
    }
}

module.exports = {
    saveInvitation,
    findStores,
    generateInvite,
    generateShoppingList,
    generateTaskList,
    getAllEvents,
    getEventById,
    createEvent,
    deleteEvent,
    updateEvent,
    getAllGuestsByEvent,
    getTasksByEventId,
    addTaskToEvent,
    updateTaskInEvent,
    removeTaskFromEvent,
    getEventsByCreator,
    getEventsByGuestName,
    getEventsByPhone,
    browseEvents,
    searchEvents,
    addGuestToEvent,
    removeGuestFromEvent,
    updateGuestInEvent,
    confirmGuestAttendance
};
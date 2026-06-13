const eventService = require('../services/eventService');
const jwt = require("jsonwebtoken");

// Get all events with pagination and sorting
const getAllEvents = async (req, res) => {
    try {
        const limit = req.query.limit || 5;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'eventId';
        const searchQuery = req.query.searchQuery || null;

        const result = await eventService.getAllEventsLogic(page, limit, sortBy, searchQuery, req.user);

        res.status(200).json({
            success: true,
            data: result,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};


const getEventGallery = async (req, res) => {
    try {
        const limit = req.query.limit || 5;
        const page = parseInt(req.query.page) || 1;
        const eventId = parseInt(req.params.id);

        const result = await eventService.getEventGalleryLogic(eventId, page, limit);

        res.status(200).json({
            success: true,
            data: result,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Get a specific event using its ID
const getEventById = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const event = await eventService.getEventByIdLogic(id);

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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Create a new event
const createEvent = async (req, res) => {
    try {
        const newEvent = await eventService.createEventLogic(req.user.userId, req.body);

        res.status(201).json({
            success: true,
            data: newEvent,
            error: null
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

// Delete an existing event
const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        await eventService.deleteEventLogic(parseInt(id));

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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

// Update details of an existing event
const updateEvent = async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        await eventService.updateEventLogic(id, req.body);

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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Get a list of all guests invited to a specific event
const getAllGuestsByEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const limit = req.query.limit || 5;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'eventId';
        const sortDirection = parseInt(req.query.sortDirection || '1');

        const searchQuery = req.query.searchQuery || null;

        const result = await eventService.getAllGuestsByEventLogic(eventId, page, limit, sortBy, sortDirection, searchQuery);

        res.status(200).json({
            success: true,
            data: result,
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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Get all tasks linked to a specific event
const getTasksByEventId = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const limit = req.query.limit || 5;
        const page = parseInt(req.query.page) || 1;
        const sortBy = req.query.sortBy || 'eventId';
        const sortDirection = parseInt(req.query.sortDirection || '1');
        const searchQuery = req.query.searchQuery || null;
        const result = await eventService.getTasksByEventIdLogic(eventId, page, limit, sortBy, sortDirection, searchQuery);

        res.status(200).json({ success: true, data: result, error: null });
    } catch (error) {
        console.error(error);
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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Add a task to an event
const addTaskToEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const newTask = await eventService.addTaskToEventLogic(eventId, req.body);
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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Update task details (status, description, etc.)
const updateTaskInEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const taskId = parseInt(req.params.taskId);
        const updatedTask = await eventService.updateTaskInEventLogic(eventId, taskId, req.body);
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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Remove a task from an event
const removeTaskFromEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const taskId = parseInt(req.params.taskId);
        await eventService.removeTaskFromEventLogic(eventId, taskId);
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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Get events managed by a specific creator
const getEventsByCreator = async (req, res) => {
    try {
        const creatorId = req.params.creatorId;
        const data = await eventService.getEventsByCreatorLogic(creatorId);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Get events where a specific person is invited (by name)
const getEventsByGuestName = async (req, res) => {
    try {
        const name = req.params.name;
        const data = await eventService.getEventsByGuestNameLogic(name);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

// Get events where a specific person is invited (by phone)
const getEventsByPhone = async (req, res) => {
    try {
        const phone = req.params.phone;
        const data = await eventService.getEventsByPhoneLogic(phone);
        res.status(200).json({ success: true, data, error: null });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

// Add a new guest to an event
const addGuestToEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const newGuest = await eventService.addGuestToEventLogic(eventId, req.body);

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
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

// Remove a guest from an event
const removeGuestFromEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const guestId = parseInt(req.params.guestId);
        await eventService.removeGuestFromEventLogic(eventId, guestId);
        res.status(200).json({ success: true, data: { eventId, guestId, action: "deleted" }, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "GUEST_NOT_FOUND_IN_EVENT" || error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: error.message, details: {} } });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

// Update guest details
const updateGuestInEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const guestId = parseInt(req.params.guestId);
        const updatedGuest = await eventService.updateGuestInEventLogic(eventId, guestId, req.body);
        res.status(200).json({ success: true, data: updatedGuest, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "GUEST_NOT_FOUND_IN_EVENT" || error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: error.message, details: {} } });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

const updateGuestRSVP = async (req, res) => {
    try {
        const { status, token } = req.body;
        const guestData = jwt.verify(token, process.env.JWT_SECRET);

        const eventId = parseInt(guestData.eventId);
        const guestId = parseInt(guestData.guestId);
        const updatedGuest = await eventService.updateGuestRSVPLogic(eventId, guestId, status);
        const io = req.app.get('io');

        io.to(`event_${eventId}`).emit('rsvpUpdated', {
            guestId,
            status,
        });

        res.status(200).json({ success: true, data: updatedGuest, error: null });
    } catch (error) {
        if (error.message === "EVENT_NOT_FOUND" || error.message === "GUEST_NOT_FOUND_IN_EVENT" || error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: error.message, details: {} } });
        }
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};



const getGuestRSVPData = async (req, res) => {
    try {
        const token = req.params.token;
        const data = await eventService.getRsvpData(token)

        res.status(200).json({ success: true, data: data, error: null });
    } catch (error) {
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
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
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
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
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
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
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: error.message
            }
        });
    }
};

const findStores = async (req, res) => {
    try {
        if (!req.query.lat || !req.query.lon) {
            return res.status(400).json({
                success: false,
                data: null,
                error: { code: "BAD_REQUEST", message: "Location (lat and lon) is required", details: {} }
            });
        }

        const locationObj = {
            lat: parseFloat(req.query.lat),
            lon: parseFloat(req.query.lon)
        };

        const storesList = await eventService.findRelevantStores(locationObj, parseInt(req.params.id));

        res.status(200).json({ success: true, data: storesList, error: null });

    } catch (error) {
        console.error("Error in findStores:", error.message);

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
                error: { code: "BAD_REQUEST", message: "There are no tasks for this event" , details: {} }
            });
        }

        const mapErrors = [
            "We couldn't identify the types of stores needed for your tasks.",
            "Map services are temporarily unavailable. Please try again later.",
            "No relevant stores were found within a 2.5km radius of your location.",
            "Stores were found nearby, but none matched your specific event tasks."
        ];

        if (mapErrors.includes(error.message)) {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: error.message, details: {} }
            });
        }

        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
    }
};

const uploadToEventGallery = async(req, res) => {
    const token = req.params.token;
    const {eventId, guestId} = jwt.verify(token, process.env.JWT_SECRET);

    if (!req.file) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "No invitation file uploaded. Please upload an image using form-data.",
                details: {}
            }
        });
    }

    const picturePath = `/uploads/${req.file.filename}`;
    const imageRecord = await eventService.saveToGalleryLogic(eventId, guestId, picturePath);
    res.status(200).json({ success: true, data: imageRecord, error: null });
}

const saveInvitation = async (req, res) => {
    try {
        // Enforcement Check: Ensure a file was actually uploaded via Multer
        if (!req.file) {
            return res.status(400).json({
                success: false,
                data: null,
                error: {
                    code: "VALIDATION_ERROR",
                    message: "No invitation file uploaded. Please upload an image using form-data.",
                    details: {}
                }
            });
        }

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
        res.status(500).json({
            success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details: {}
            }
        });
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
    addGuestToEvent,
    removeGuestFromEvent,
    updateGuestInEvent,
    updateGuestRSVP,
    getGuestRSVPData,
    uploadToEventGallery,
    getEventGallery
};
const { VALID_ROLES } = require('../models/constants');

const validateId = (req, res, next) => {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid ID parameter. ID must be a positive number.",
                details: { param: "id", value: req.params.id }
            }
        });
    }
    next();
};

const validateEventExists = (req, res, next) => {
    const { eventId } = req.body;
    if (!eventId || !Number.isInteger(eventId) || eventId <= 0) {
        return res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "eventId must be a valid positive integer"
            }
        });
    }
    const event = events.find(e => e.eventId === eventId);
    if (!event) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: `Event with ID ${eventId} not found.`,
                details: { eventId: eventId }
            }
        });
    }
    req.event = event;
    next();
};


const validateUserFields = (req, res, next) => {
    const { firstName, lastName, userRole, email, phoneNumber, picturePath } = req.body;
    let errors = [];
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
        errors.push("firstName must be a string (min 2 chars)");
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
        errors.push("lastName must be a string (min 2 chars)");
    }
    if (!userRole || !VALID_ROLES.includes(userRole)) {
        errors.push(`userRole must be one of: ${VALID_ROLES.join(', ')}`);
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push("A valid email address is required");
    }
    const phoneRegex = /^05\d-?\d{7}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
        errors.push("A valid Israeli phone number is required (e.g., 0545368889)");
    }
    if (!picturePath || typeof picturePath !== 'string' || picturePath.trim().length === 0) {
        errors.push("picturePath must be a non-empty string");
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid input data",
                details: { errors }
            }
        });
    }
    next();
};

const validateGuestFields = (req, res, next) => {
    const { name, phone, role, status } = req.body;
    let errors = [];
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
        errors.push("name must be a string (min 2 chars)");
    }
    const phoneRegex = /^05\d-?\d{7}$/;
    if (!phone || !phoneRegex.test(phone)) {
        errors.push("A valid Israeli phone number is required (e.g., 0545368889)");
    }
    const VALID_GUEST_ROLES = ['manager', 'guest'];
    if (!role || !VALID_GUEST_ROLES.includes(role)) {
        errors.push(`role must be one of: ${VALID_GUEST_ROLES.join(', ')}`);
    }
    const VALID_STATUSES = ['confirmed', 'pending', 'cancelled'];
    if (status && !VALID_STATUSES.includes(status)) {
        errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid guest data",
                details: { errors }
            }
        });
    }
    next();
};

const validateTaskFields = (req, res, next) => {
    const { title, status, priority } = req.body;
    let errors = [];
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
        errors.push("title must be a string (min 2 chars)");
    }
    const VALID_TASK_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled'];
    if (status && !VALID_TASK_STATUSES.includes(status)) {
        errors.push(`status must be one of: ${VALID_TASK_STATUSES.join(', ')}`);
    }
    const VALID_PRIORITIES = ['low', 'medium', 'high'];
    if (priority && !VALID_PRIORITIES.includes(priority)) {
        errors.push(`priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid task data",
                details: { errors }
            }
        });
    }

    next();
};

const validateEventFields = (req, res, next) => {
    const { creatorId, title, date, time, location, eventType, guestsCount } = req.body;
    let errors = [];
    if (!title || typeof title !== 'string' || title.trim().length < 2) {
        errors.push("title must be a string (min 2 chars)");
    }
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || typeof date !== 'string' || !dateRegex.test(date)) {
        errors.push("date must be a valid string in YYYY-MM-DD format");
    }
    const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
    if (!time || typeof time !== 'string' || !timeRegex.test(time)) {
        errors.push("time must be a valid string in HH:MM format");
    }
    if (!location || typeof location !== 'string' || location.trim().length < 2) {
        errors.push("location must be a string (min 2 chars)");
    }
    if (!eventType || typeof eventType !== 'string' || eventType.trim().length < 2) {
        errors.push("eventType must be a string (min 2 chars)");
    }
    if (guestsCount === undefined || typeof guestsCount !== 'number' || guestsCount < 0) {
        errors.push("guestsCount must be a non-negative number");
    }
    if (creatorId !== undefined && (typeof creatorId !== 'number' || creatorId <= 0)) {
        errors.push("creatorId must be a positive number");
    }
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid event data",
                details: { errors }
            }
        });
    }
    next();
};

const validateUserExists = (req, res, next) => {
    const { creatorId } = req.body;
    if (!creatorId || !Number.isInteger(creatorId) || creatorId <= 0) {
        return res.status(400).json({
            success: false,
            data: null,
            error: {
                code: "VALIDATION_ERROR",
                message: "creatorId must be a valid positive integer"
            }
        });
    }
    const user = users.find(u => u.userId === creatorId);
    if (!user) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: `User with ID ${creatorId} not found.`,
                details: { userId: creatorId }
            }
        });
    }
    req.user = user;
    next();
};


module.exports = {validateId, validateUserFields, validateGuestFields,
    validateTaskFields, validateEventFields, validateEventExists, validateUserExists};
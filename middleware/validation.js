const { VALID_ROLES } = require('../models/constants');
const events = require('../models/eventModel');
const users = require('../models/userModel');

/**
 * Validates that the 'id' parameter in a URL is a positive integer.
 */
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
    // If valid, move to the next middleware or controller
    next();
};

/**
 * Ensures an eventId exists in the request body and corresponds
 * to an existing event in the system.
 */
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

    // Check if the event actually exists in the data source
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
    // Attach the found event to the request object for easy access in the controller
    req.event = event;
    next();
};

/**
 * Strict validation for User Registration.
 * Checks for mandatory fields: names, password length, email format, and Israeli phone numbers.
 */
const validateUserFields = (req, res, next) => {
    const { firstName, lastName, userRole, password, email, phoneNumber } = req.body;
    let errors = [];

    // Type and length checks
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length < 2) {
        errors.push("firstName must be a string (min 2 chars)");
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length < 2) {
        errors.push("lastName must be a string (min 2 chars)");
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push("password is required and must be at least 6 characters long");
    }

    // RegEx validation for Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push("A valid email address is required");
    }

    // RegEx validation for Israeli Phone Numbers (05X-XXXXXXX)
    const phoneRegex = /^05\d-?\d{7}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
        errors.push("A valid Israeli phone number is required (e.g., 0545368889)");
    }

    // Validate against predefined system roles
    if (userRole !== undefined && !VALID_ROLES.includes(userRole)) {
        errors.push(`userRole must be one of: ${VALID_ROLES.join(', ')}`);
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

/**
 * Validation for User Updates (PATCH).
 * Only validates fields if they are provided in the request body.
 */
const validateOptionalUserFields = (req, res, next) => {
    const { firstName, lastName, userRole, password, email, phoneNumber, picture } = req.body;
    let errors = [];

    // Helper to check if a field is actually being sent in the update
    const isProvided = (value) => value !== undefined && value !== null && value !== "";

    if (isProvided(firstName)) {
        if (typeof firstName !== 'string' || firstName.trim().length < 2) {
            errors.push("firstName must be a string (min 2 chars)");
        }
    }

    if (isProvided(lastName)) {
        if (typeof lastName !== 'string' || lastName.trim().length < 2) {
            errors.push("lastName must be a string (min 2 chars)");
        }
    }

    if (isProvided(password)) {
        if (typeof password !== 'string' || password.length < 6) {
            errors.push("password must be at least 6 characters long");
        }
    }

    if (isProvided(email)) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errors.push("A valid email address is required");
        }
    }

    if (isProvided(phoneNumber)) {
        const phoneRegex = /^05\d-?\d{7}$/;
        if (!phoneRegex.test(phoneNumber)) {
            errors.push("A valid Israeli phone number is required (e.g., 0545368889)");
        }
    }

    if (isProvided(userRole)) {
        if (!VALID_ROLES.includes(userRole)) {
            errors.push(`userRole must be one of: ${VALID_ROLES.join(', ')}`);
        }
    }

    if (isProvided(picture)) {
        if (typeof picture !== 'string') {
            errors.push("picture must be a string");
        }
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

/**
 * Validates Guest data including their specific roles and confirmation statuses.
 */
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

/**
 * Validates Task data, ensuring valid status transitions and priority levels.
 */
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

/**
 * Validates Event creation data.
 * Checks for strict date (YYYY-MM-DD) and time (HH:MM) formatting.
 */
const validateEventFields = (req, res, next) => {
    if (req.body.guestsCount === undefined) {
        req.body.guestsCount = 0;
    }

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

/**
 * Cross-references creatorId with the User "database" to ensure
 * the event is being assigned to a real user.
 */
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

/**
 * Validation for Event Updates (PUT/PATCH).
 * Only validates fields if they are provided in the request body.
 */
const validateOptionalEventFields = (req, res, next) => {
    const { title, date, time, location, eventType, guestsCount } = req.body;
    let errors = [];
    const isProvided = (value) => value !== undefined && value !== null && value !== "";

    if (isProvided(title) && (typeof title !== 'string' || title.trim().length < 2)) {
        errors.push("title must be a string (min 2 chars)");
    }
    if (isProvided(date)) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (typeof date !== 'string' || !dateRegex.test(date)) errors.push("date must be a valid string in YYYY-MM-DD format");
    }
    if (isProvided(time)) {
        const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/;
        if (typeof time !== 'string' || !timeRegex.test(time)) errors.push("time must be a valid string in HH:MM format");
    }
    if (isProvided(location) && (typeof location !== 'string' || location.trim().length < 2)) {
        errors.push("location must be a string (min 2 chars)");
    }
    if (isProvided(eventType) && (typeof eventType !== 'string' || eventType.trim().length < 2)) {
        errors.push("eventType must be a string (min 2 chars)");
    }
    if (isProvided(guestsCount) && (typeof guestsCount !== 'number' || guestsCount < 0)) {
        errors.push("guestsCount must be a non-negative number");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false, data: null,
            error: { code: "VALIDATION_ERROR", message: "Invalid input data", details: { errors } }
        });
    }
    next();
};

module.exports = {
    validateId,
    validateUserFields,
    validateGuestFields,
    validateTaskFields,
    validateEventFields,
    validateEventExists,
    validateUserExists,
    validateOptionalUserFields,
    validateOptionalEventFields
};
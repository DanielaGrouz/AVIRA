const guestService = require('../services/guestService');

/**
 * Retrieves a list of guests with support for pagination and sorting.
 * Query Parameters: page (default: 1), limit (default: 5), sortBy (default: 'id')
 */
const getAllGuests = (req, res) => {
    try {
        // Parse query parameters for pagination and sorting
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'id';

        // Delegate business logic to the service layer
        const result = guestService.getAllGuestsLogic(page, limit, sortBy);

        // Success response
        res.status(200).json({
            success: true,
            data: result,
            error: null
        });
    } catch (error) {
        // Global error handling for unexpected issues
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

/**
 * Retrieves a single guest by their unique ID.
 * Path Parameter: id
 */
const getGuestById = (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const guest = guestService.getGuestByIdLogic(id);

        // Handle case where guest does not exist in the data source
        if (!guest) {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: `Guest with ID ${id} was not found.`,
                    details: {}
                }
            });
        }

        res.status(200).json({
            success: true,
            data: guest,
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

/**
 * Creates a new guest record.
 * Body: { eventId, name, phone, role, status }
 */
const createGuest = (req, res) => {
    try {
        // Pass the request body directly to the service for creation logic
        const newGuest = guestService.createGuestLogic(req.body);

        // 201 Created status for successful resource creation
        res.status(201).json({
            success: true,
            data: newGuest,
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

/**
 * Updates an existing guest's information.
 * Path Parameter: id
 * Body: Partial guest object (name, phone, etc.)
 */
const updateGuest = (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const updatedGuest = guestService.updateGuestLogic(id, req.body);

        res.status(200).json({
            success: true,
            data: { guestId: id, updatedGuest },
            error: null
        });

    } catch (error) {
        // Check for specific error message thrown by the service layer
        if (error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: {
                    code: "NOT_FOUND",
                    message: `Guest with ID ${id} was not found.`,
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

/**
 * Removes a guest record from the system.
 * Path Parameter: id
 */
const deleteGuest = (req, res) => {
    const id = parseInt(req.params.id);
    try {
        guestService.deleteGuestLogic(id);

        res.status(200).json({
            success: true,
            data: { guestId: id },
            error: null
        });

    } catch (error) {
        // Handle specific logic errors vs general server errors
        if (error.message === "GUEST_NOT_FOUND") {
            return res.status(404).json({
                success: false,
                data: null,
                error: { code: "NOT_FOUND", message: `Guest with ID ${id} was not found.`, details : {}}
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

module.exports = { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest };

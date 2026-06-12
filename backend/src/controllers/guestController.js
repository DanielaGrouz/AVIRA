const guestService = require('../services/guestService');

/**
 * Retrieves a list of guests with support for pagination and sorting.
 * Query Parameters: page (default: 1), limit (default: 5), sortBy (default: 'guestId')
 */
const getAllGuests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'guestId'; // Changed default to match DB column

        const result = await guestService.getAllGuestsLogic(page, limit, sortBy);

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
                details: error.message // Good for debugging, remove in production if preferred
            }
        });
    }
};

/**
 * Retrieves a single guest by their unique ID.
 * Path Parameter: id
 */
const getGuestById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const guest = await guestService.getGuestByIdLogic(id);

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
                details: error.message
            }
        });
    }
};

/**
 * Creates a new guest record.
 * Body: { eventId, name, phone, role, status }
 */
const createGuest = async (req, res) => {
    try {
        const newGuest = await guestService.createGuestLogic(req.body);

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
                details: error.message
            }
        });
    }
};

/**
 * Updates an existing guest's information.
 * Path Parameter: id
 * Body: Partial guest object (name, phone, etc.)
 */
const updateGuest = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const updatedGuest = await guestService.updateGuestLogic(id, req.body);

        res.status(200).json({
            success: true,
            data: { guestId: id, updatedGuest },
            error: null
        });

    } catch (error) {
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
                details: error.message
            }
        });
    }
};

/**
 * Removes a guest record from the system.
 * Path Parameter: id
 */
const deleteGuest = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        await guestService.deleteGuestLogic(id);

        res.status(200).json({
            success: true,
            data: { guestId: id },
            error: null
        });

    } catch (error) {
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
                details: error.message
            }
        });
    }
};

module.exports = { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest };
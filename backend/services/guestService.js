let guests = require('../models/guestModel');

/**
 * Handles the logic for retrieving guests with sorting and pagination.
 * Separate from the controller so it can be reused (e.g., in an internal report).
 */
const getAllGuestsLogic = (page = 1, limit = 5, sortBy = 'id') => {
    // Creates a shallow copy to avoid mutating the original array during sort
    let sortedGuests = [...guests].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });

    // Calculates which segment of the array to return
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGuests = sortedGuests.slice(startIndex, endIndex);

    return {
        page,
        totalPages: Math.ceil(guests.length / limit),
        totalItems: guests.length,
        data: paginatedGuests
    };
};

/**
 * Logic to find a specific guest.
 * Returns null if not found, allowing the controller to decide the 404 response.
 */
const getGuestByIdLogic = (id) => {
    return guests.find(g => g.guestId === id) || null;
};

/**
 * Logic for creating a new guest.
 * Includes auto-incrementing the guestId based on the current collection.
 */
const createGuestLogic = (guestData) => {
    const { eventId, name, phone, role, status } = guestData;

    // ID Generation: Finds the current max ID and adds 1
    const newGuest = {
        guestId: guests.length > 0 ? Math.max(...guests.map(g => g.guestId)) + 1 : 1,
        eventId: parseInt(eventId),
        name,
        phone,
        status: status || 'pending', // Default values
        role: role || 'guest'
    };

    guests.push(newGuest);
    return newGuest;
};

/**
 * Logic for updating an existing guest.
 * Throws a specific Error string that the controller catches to send a 404.
 */
const updateGuestLogic = (id, updateData) => {
    const guestIndex = guests.findIndex(g => g.guestId === id);
    if (guestIndex === -1) {
        // This specific error message acts as a signal for the controller
        throw new Error("GUEST_NOT_FOUND");
    }

    const { name, phone, status, role } = updateData;

    // Partial Update Logic: Only updates fields if they are provided and valid
    guests[guestIndex] = {
        ...guests[guestIndex],
        name: (name && name.trim() !== "") ? name : guests[guestIndex].name,
        phone: (phone && phone.trim() !== "") ? phone : guests[guestIndex].phone,
        status: (status && status.trim() !== "") ? status : guests[guestIndex].status,
        role: (role && role.trim() !== "") ? role : guests[guestIndex].role
    };

    return guests[guestIndex];
};

/**
 * Logic for removing a guest record.
 * Returns true on success or throws an error if the guest is missing.
 */
const deleteGuestLogic = (id) => {
    const guestIndex = guests.findIndex(g => g.guestId === id);
    if (guestIndex === -1) {
        throw new Error("GUEST_NOT_FOUND");
    }
    // Remove 1 element at the found index
    guests.splice(guestIndex, 1);
    return true;
};

module.exports = {
    getAllGuestsLogic,
    getGuestByIdLogic,
    createGuestLogic,
    updateGuestLogic,
    deleteGuestLogic
};
let guests = require('../models/guestModel');

const getAllGuestsLogic = (page = 1, limit = 5, sortBy = 'id') => {
    let sortedGuests = [...guests].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedGuests = sortedGuests.slice(startIndex, endIndex);

    return {
        page,
        totalPages: Math.ceil(guests.length / limit),
        data: paginatedGuests
    };
};

const getGuestByIdLogic = (id) => {
    return guests.find(g => g.guestId === id) || null;
};

const createGuestLogic = (guestData) => {
    const { eventId, name, phone, role, status } = guestData;

    const newGuest = {
        guestId: guests.length > 0 ? Math.max(...guests.map(g => g.guestId)) + 1 : 1,
        eventId: parseInt(eventId),
        name,
        phone,
        status: status || 'pending',
        role: role || 'guest'
    };

    guests.push(newGuest);
    return newGuest;
};

const updateGuestLogic = (id, updateData) => {
    const guestIndex = guests.findIndex(g => g.guestId === id);
    if (guestIndex === -1) {
        throw new Error("GUEST_NOT_FOUND");
    }

    const { name, phone, status, role } = updateData;

    guests[guestIndex] = {
        ...guests[guestIndex],
        name: (name && name.trim() !== "") ? name : guests[guestIndex].name,
        phone: (phone && phone.trim() !== "") ? phone : guests[guestIndex].phone,
        status: (status && status.trim() !== "") ? status : guests[guestIndex].status,
        role: (role && role.trim() !== "") ? role : guests[guestIndex].role
    };

    return guests[guestIndex];
};

const deleteGuestLogic = (id) => {
    const guestIndex = guests.findIndex(g => g.guestId === id);
    if (guestIndex === -1) {
        throw new Error("GUEST_NOT_FOUND");
    }
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
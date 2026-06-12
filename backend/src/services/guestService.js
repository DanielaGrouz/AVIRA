const { Guest } = require('../../models');

const getAllGuestsLogic = async (page = 1, limit = 5, sortBy = 'guestId') => {
    const offset = (page - 1) * limit;

    // findAndCountAll handles both fetching the data and calculating the total for pagination
    const { count, rows } = await Guest.findAndCountAll({
        order: [[sortBy, 'ASC']],
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

const getGuestByIdLogic = async (id) => {
    return await Guest.findByPk(id);
};

const createGuestLogic = async (guestData) => {
    // Optionally: You might want to verify the eventId exists here before creating
    return await Guest.create(guestData);
};

const updateGuestLogic = async (id, updateData) => {
    const [updatedRows] = await Guest.update(updateData, {
        where: { guestId: id }
    });

    if (updatedRows === 0) throw new Error("GUEST_NOT_FOUND");

    // Return the fresh data from the database
    return await Guest.findByPk(id);
};

const deleteGuestLogic = async (id) => {
    const deletedRows = await Guest.destroy({
        where: { guestId: id }
    });

    if (deletedRows === 0) throw new Error("GUEST_NOT_FOUND");
    return true;
};

module.exports = {
    getAllGuestsLogic,
    getGuestByIdLogic,
    createGuestLogic,
    updateGuestLogic,
    deleteGuestLogic
};
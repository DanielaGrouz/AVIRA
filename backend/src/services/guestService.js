const { Guest } = require('../../models');
const { NotFoundError } = require('../utils/errors'); // Import custom errors

const getAllGuestsLogic = async (page = 1, limit = 5, sortBy = 'guestId') => {
    const offset = (page - 1) * limit;

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
    const guest = await Guest.findByPk(id);
    if (!guest) {
        throw new NotFoundError(`Guest with ID ${id} was not found.`, "GUEST_NOT_FOUND");
    }
    return guest;
};

const createGuestLogic = async (guestData) => {
    return Guest.create(guestData);
};

const updateGuestLogic = async (id, updateData) => {
    const [updatedRows] = await Guest.update(updateData, {
        where: { guestId: id }
    });

    if (updatedRows === 0) {
        throw new NotFoundError(`Guest with ID ${id} not found.`, "GUEST_NOT_FOUND");
    }

    return await Guest.findByPk(id);
};

const deleteGuestLogic = async (id) => {
    const deletedRows = await Guest.destroy({
        where: { guestId: id }
    });

    if (deletedRows === 0) {
        throw new NotFoundError(`Guest with ID ${id} not found.`, "GUEST_NOT_FOUND");
    }

    return true;
};

module.exports = {
    getAllGuestsLogic,
    getGuestByIdLogic,
    createGuestLogic,
    updateGuestLogic,
    deleteGuestLogic
};
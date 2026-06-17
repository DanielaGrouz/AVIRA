const { Guest } = require('../../models');
const { NotFoundError } = require('../utils/errors');

const createGuestLogic = async (guestData) => {
  return Guest.create(guestData);
};

const updateGuestLogic = async (id, updateData) => {
  const [updatedRows] = await Guest.update(updateData, {
    where: { guestId: id },
  });

  if (updatedRows === 0) {
    throw new NotFoundError(`Guest with ID ${id} not found.`, 'GUEST_NOT_FOUND');
  }

  return await Guest.findByPk(id);
};

const deleteGuestLogic = async (id) => {
  const deletedRows = await Guest.destroy({
    where: { guestId: id },
  });

  if (deletedRows === 0) {
    throw new NotFoundError(`Guest with ID ${id} not found.`, 'GUEST_NOT_FOUND');
  }

  return true;
};

module.exports = {
  createGuestLogic,
  updateGuestLogic,
  deleteGuestLogic,
};

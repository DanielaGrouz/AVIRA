const { Event, User, Guest, Task, EventGallery, EventGuestList } = require('../../models');
const { Op } = require('sequelize');
const guestService = require('./guestService');
const {
  getSupermarketList,
  getEventTaskList,
  getStoresForEvent,
} = require('../utils/generateTextClient');
const { generateEventInvite } = require('../utils/generateImageClient');
const taskService = require('./taskService');
const jwt = require('jsonwebtoken');
const { NotFoundError, BadRequestError, ConflictError } = require('../utils/errors');

const getAllEventsLogic = async (page, limit, sortBy, sortDirection, searchQuery, userData) => {
  const offset = (page - 1) * limit;
  let whereClause = {};

  if (userData.userRole !== 'admin') {
    whereClause.creatorId = userData.userId;
  }

  if (searchQuery && searchQuery.trim() !== '') {
    const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/);
    whereClause[Op.and] = queryTerms.map((term) => ({
      [Op.or]: [
        { title: { [Op.like]: `%${term}%` } },
        { location: { [Op.like]: `%${term}%` } },
        { eventType: { [Op.like]: `%${term}%` } },
      ],
    }));
  }
  const validSortDirection = sortDirection === '1' ? 'ASC' : 'DESC';
  let orderClause = [];

  if (sortBy === 'date') {
    orderClause = [['date', 'ASC'], ['time', 'ASC']];
  } else if (sortBy === 'title' || sortBy === 'location') {
    orderClause = [[sortBy, 'ASC']];
  } else {
    orderClause = [['eventId', 'DESC']];
  }

  const { count, rows } = await Event.findAndCountAll({
    where: whereClause,
    order: orderClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
  return {
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    data: rows,
  };
};

const getEventGalleryLogic = async (eventId, page, limit, sortBy, sortDirection) => {
  const offset = (page - 1) * limit;
  let whereClause = { eventId };
  const validSortDirection = sortDirection === '1' ? 'ASC' : 'DESC';

  const { count, rows } = await EventGallery.findAndCountAll({
    where: whereClause,
    order: [[sortBy, validSortDirection]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });
  return {
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    totalItems: count,
    data: rows,
  };
};

const getEventByIdLogic = async (id) => {
  return await Event.findByPk(id);
};

const createEventLogic = async (creatorId, eventData) => {
  const { title, date, time, location, eventType } = eventData;

  const newEvent = await Event.create({
    creatorId,
    title,
    date,
    time,
    location,
    eventType,
    guestsCount: 1,
  });

  const creator = await User.findByPk(creatorId);
  if (creator) {
    let guest = await Guest.findOne({ where: { phone: creator.phoneNumber, creatorId } });

    if (!guest) {
      guest = await Guest.create({
        name: `${creator.firstName} ${creator.lastName}`,
        phone: creator.phoneNumber,
        creatorId: creatorId,
      });
    }

    await newEvent.addGuest(guest, {
      through: { status: 'confirmed', role: 'manager' },
    });
  }

  return newEvent;
};

const deleteEventLogic = async (id) => {
  const deletedRows = await Event.destroy({ where: { eventId: id } });
  if (deletedRows === 0) {
    throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  }
  return true;
};

const updateEventLogic = async (id, updateData) => {
  const [updatedRows] = await Event.update(updateData, {
    where: { eventId: id },
  });
  if (updatedRows === 0) {
    throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  }
  return await Event.findByPk(id);
};

const getAllGuestsByEventLogic = async (
  eventId,
  page,
  limit,
  sortBy,
  sortDirection,
  searchQuery
) => {
  const event = await Event.findByPk(eventId);
  if (!event) {
    throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  }

  const offset = (page - 1) * limit;
  let whereClause = {};

  if (searchQuery && searchQuery.trim() !== '') {
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${searchQuery}%` } },
      { phone: { [Op.like]: `%${searchQuery}%` } },
    ];
  }

  const validSortDirection = sortDirection === '1' ? 'ASC' : 'DESC';

  let orderClause = [];
  if (sortBy === 'status' || sortBy === 'role') {
    orderClause = [[Event, EventGuestList, sortBy, validSortDirection]];
  } else if (sortBy) {
    orderClause = [[sortBy, validSortDirection]];
  }

  const { count, rows } = await Guest.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: Event,
        where: { eventId: eventId },
        attributes: ['eventId'],
        through: { attributes: ['status', 'role'] },
      },
    ],
    order: orderClause,
    limit: parseInt(limit),
    offset: parseInt(offset),
    distinct: true,
  });

  const formattedData = rows.map((guest) => {
    const plainGuest = guest.get({ plain: true });

    let junctionData = {};
    if (plainGuest.Events && plainGuest.Events.length > 0) {
      junctionData = plainGuest.Events[0].EventGuestList || {};
    }

    delete plainGuest.Events;

    return {
      ...plainGuest,
      status: junctionData.status,
      role: junctionData.role,
    };
  });

  return { page: parseInt(page), totalPages: Math.ceil(count / limit), data: formattedData };
};

const getTasksByEventIdLogic = async (
  eventId,
  page,
  limit,
  sortBy,
  sortDirection,
  searchQuery = ''
) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');

  const offset = (page - 1) * limit;
  let whereClause = { eventId };

  if (searchQuery && searchQuery.trim() !== '') {
    whereClause.title = { [Op.like]: `%${searchQuery}%` };
  }
  const validSortDirection = sortDirection === '1' ? 'ASC' : 'DESC';

  const { count, rows } = await Task.findAndCountAll({
    where: whereClause,
    order: [[sortBy, validSortDirection]],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return { page: parseInt(page), totalPages: Math.ceil(count / limit), data: rows };
};

const addTaskToEventLogic = async (eventId, taskData) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  return await taskService.createTaskLogic({ ...taskData, eventId });
};

const updateTaskInEventLogic = async (eventId, taskId, updateData) => {
  const task = await Task.findOne({ where: { taskId, eventId } });
  if (!task) throw new NotFoundError('Task not found in this event.', 'TASK_NOT_FOUND_IN_EVENT');
  return await taskService.updateTaskLogic(taskId, updateData);
};

const removeTaskFromEventLogic = async (eventId, taskId) => {
  const task = await Task.findOne({ where: { taskId, eventId } });
  if (!task) throw new NotFoundError('Task not found in this event.', 'TASK_NOT_FOUND_IN_EVENT');
  return taskService.deleteTaskLogic(taskId);
};

const getEventsByCreatorLogic = async (creatorId) => {
  return await Event.findAll({ where: { creatorId } });
};

const getEventsByGuestNameLogic = async (name) => {
  return await Event.findAll({
    include: [
      {
        model: Guest,
        where: { name: { [Op.like]: `%${name}%` } },
        attributes: [],
        through: { attributes: [] },
      },
    ],
  });
};

const getEventsByPhoneLogic = async (phone) => {
  return await Event.findAll({
    include: [
      {
        model: Guest,
        where: { phone },
        attributes: [],
        through: { attributes: [] },
      },
    ],
  });
};

const removeGuestFromEventLogic = async (eventId, guestId) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');

  const guest = await Guest.findByPk(guestId);
  if (!guest) throw new NotFoundError('Guest not found.', 'GUEST_NOT_FOUND');

  const hasGuest = await event.hasGuest(guest);
  if (!hasGuest)
    throw new NotFoundError('Guest not found in this event.', 'GUEST_NOT_FOUND_IN_EVENT');

  await event.removeGuest(guest);

  if (event.guestsCount > 0) {
    await event.decrement('guestsCount');
  }

  return true;
};

const updateGuestRSVPLogic = async (eventId, guestId, rsvpStatus) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  const hasGuest = await event.hasGuest(guestId);
  if (!hasGuest) {
    throw new NotFoundError('Guest not found in this event.', 'GUEST_NOT_FOUND_IN_EVENT');
  }
  await EventGuestList.update(
    { status: rsvpStatus },
    { where: { eventId: eventId, guestId: guestId } }
  );

  return { message: 'RSVP updated successfully' };
};

const getGuestsByCreatorIdLogic = async (creatorId, searchQuery, limit = 5) => {
  let whereClause = { creatorId: creatorId };

  if (searchQuery && searchQuery.trim() !== '') {
    const term = searchQuery.trim();
    whereClause[Op.or] = [
      { name: { [Op.like]: `%${term}%` } },
      { phone: { [Op.like]: `%${term}%` } },
    ];
  }

  return await Guest.findAll({
    where: whereClause,
    limit: parseInt(limit),
  });
};

const generatePhotoInviteLogic = async (eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  return await generateEventInvite(event.get({ plain: true }));
};

const saveToGalleryLogic = async (eventId, guestId, imagePath) => {
  console.log(`guest ${guestId} uploaded a new picture to gallery`);
  return EventGallery.create({
    path: imagePath,
    eventId: eventId,
  });
};

const saveInvitationLogic = async (eventId, invitePath) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  event.invitationPath = invitePath;
  await event.save();
  return event;
};

const generateShoppingListLogic = async (eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  return getSupermarketList(event.get({ plain: true }));
};

const generateTaskListLogic = async (eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');
  return getEventTaskList(event.get({ plain: true }));
};

const findRelevantStores = async (currLocation, eventId) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');

  const tasksList = await Task.findAll({ where: { eventId } });
  if (!tasksList || tasksList.length === 0) {
    throw new BadRequestError('There are no tasks for this event.', 'TASKS_LIST_IS_EMPTY');
  }

  const taskTitles = tasksList.map((task) => task.title);
  return getStoresForEvent(currLocation, taskTitles);
};

const addGuestToEventLogic = async (eventId, guestData) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');

  let guest = await Guest.findOne({
    where: { phone: guestData.phone, creatorId: event.creatorId },
  });

  if (!guest) {
    guest = await guestService.createGuestLogic({
      name: guestData.name,
      phone: guestData.phone,
      creatorId: event.creatorId,
    });
  }

  const isAlreadyGuest = await event.hasGuest(guest);
  if (!isAlreadyGuest) {
    await event.addGuest(guest, {
      through: {
        status: guestData.status || 'pending',
        role: guestData.role || 'guest',
      },
    });
    await event.increment('guestsCount');
  } else {
    throw new ConflictError('Guest has already been added');
  }

  const token = jwt.sign({ eventId: eventId, guestId: guest.guestId }, process.env.JWT_SECRET, {
    expiresIn: '24h',
  });

  return {
    ...guest.get({ plain: true }),
    status: guestData.status || 'pending',
    role: guestData.role || 'guest',
    token,
  };
};

const updateGuestInEventLogic = async (eventId, guestId, updateData) => {
  const event = await Event.findByPk(eventId);
  if (!event) throw new NotFoundError('Event not found.', 'EVENT_NOT_FOUND');

  const hasGuest = await event.hasGuest(guestId);
  if (!hasGuest) {
    throw new NotFoundError('Guest not found in this event.', 'GUEST_NOT_FOUND_IN_EVENT');
  }

  const { status, role, ...baseGuestData } = updateData;

  if (status || role) {
    const junctionUpdate = {};
    if (status) junctionUpdate.status = status;
    if (role) junctionUpdate.role = role;

    await EventGuestList.update(junctionUpdate, {
      where: { eventId: eventId, guestId: guestId },
    });
  }

  let updatedGuest;
  if (Object.keys(baseGuestData).length > 0) {
    updatedGuest = await guestService.updateGuestLogic(guestId, baseGuestData);
  } else {
    updatedGuest = await Guest.findByPk(guestId);
  }

  const guests = await event.getGuests({ where: { guestId } });
  const junctionData = guests[0].EventGuestList;

  return {
    ...updatedGuest.get({ plain: true }),
    status: junctionData.status,
    role: junctionData.role,
  };
};

const getRsvpData = async (token) => {
  const { guestId, eventId } = jwt.verify(token, process.env.JWT_SECRET);
  const event = await Event.findByPk(eventId);

  const guests = await event.getGuests({ where: { guestId } });
  let guest = guests.length > 0 ? guests[0] : null;

  if (guest) {
    const plainGuest = guest.get({ plain: true });
    const junctionData = plainGuest.EventGuestList || {};

    delete plainGuest.EventGuestList;

    guest = {
      ...plainGuest,
      status: junctionData.status || 'pending',
      role: junctionData.role || 'guest',
    };
  }

  return { guest, event };
};

module.exports = {
  getGuestsByCreatorIdLogic,
  saveInvitationLogic,
  generateShoppingListLogic,
  findRelevantStores,
  generatePhotoInviteLogic,
  generateTaskListLogic,
  getAllEventsLogic,
  getEventByIdLogic,
  createEventLogic,
  deleteEventLogic,
  updateEventLogic,
  getAllGuestsByEventLogic,
  getTasksByEventIdLogic,
  addTaskToEventLogic,
  updateTaskInEventLogic,
  removeTaskFromEventLogic,
  getEventsByCreatorLogic,
  getEventsByGuestNameLogic,
  getEventsByPhoneLogic,
  addGuestToEventLogic,
  removeGuestFromEventLogic,
  updateGuestInEventLogic,
  updateGuestRSVPLogic,
  saveToGalleryLogic,
  getEventGalleryLogic,
  getRsvpData,
};

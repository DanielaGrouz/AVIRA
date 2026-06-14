const eventService = require('../services/eventService');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorHandler');

const getAllEvents = asyncHandler(async (req, res) => {
  const { page, limit, sortBy, sortDirection, searchQuery } = req.validated.query;
  const result = await eventService.getAllEventsLogic(
    page,
    limit,
    sortBy,
    sortDirection,
    searchQuery,
    req.user
  );

  res.status(200).json({ success: true, data: result, error: null });
});

const getEventGallery = asyncHandler(async (req, res) => {
  const eventId = req.validated.params.id;
  const { page, limit, sortBy, sortDirection } = req.validated.query;

  const result = await eventService.getEventGalleryLogic(
    eventId,
    page,
    limit,
    sortBy,
    sortDirection
  );

  res.status(200).json({ success: true, data: result, error: null });
});

const getEventById = asyncHandler(async (req, res) => {
  const id = parseInt(req.validated.params.id);
  const event = await eventService.getEventByIdLogic(id);

  if (!event) {
    // Instead of returning res.status(404), throw an error. The middleware will catch it.
    throw new Error('EVENT_NOT_FOUND');
  }

  res.status(200).json({ success: true, data: event, error: null });
});

const createEvent = asyncHandler(async (req, res) => {
  const newEvent = await eventService.createEventLogic(req.user.userId, req.validated.body);
  res.status(201).json({ success: true, data: newEvent, error: null });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.validated.params;
  await eventService.deleteEventLogic(parseInt(id));
  res.status(200).json({ success: true, data: { eventId: parseInt(id) }, error: null });
});

const updateEvent = asyncHandler(async (req, res) => {
  const id = parseInt(req.validated.params.id);
  await eventService.updateEventLogic(id, req.validated.body);
  res.status(200).json({ success: true, data: { eventId: id }, error: null });
});

const getAllGuestsByEvent = asyncHandler(async (req, res) => {
  const eventId = req.validated.params.id;
  const { page, limit, sortBy, sortDirection, searchQuery } = req.validated.query;

  const result = await eventService.getAllGuestsByEventLogic(
    eventId,
    page,
    limit,
    sortBy,
    sortDirection,
    searchQuery
  );
  res.status(200).json({ success: true, data: result, error: null });
});

const getTasksByEventId = asyncHandler(async (req, res) => {
  const eventId = req.validated.params.id;
  const { page, limit, sortBy, sortDirection, searchQuery } = req.validated.query;

  const result = await eventService.getTasksByEventIdLogic(
    eventId,
    page,
    limit,
    sortBy,
    sortDirection,
    searchQuery
  );
  res.status(200).json({ success: true, data: result, error: null });
});

const addTaskToEvent = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.validated.params.id);
  const newTask = await eventService.addTaskToEventLogic(eventId, req.validated.body);
  res.status(201).json({ success: true, data: newTask, error: null });
});

const updateTaskInEvent = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.validated.params.id);
  const taskId = parseInt(req.validated.params.taskId);
  const updatedTask = await eventService.updateTaskInEventLogic(
    eventId,
    taskId,
    req.validated.body
  );
  res.status(200).json({ success: true, data: updatedTask, error: null });
});

const removeTaskFromEvent = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.validated.params.id);
  const taskId = parseInt(req.validated.params.taskId);
  await eventService.removeTaskFromEventLogic(eventId, taskId);
  res
    .status(200)
    .json({ success: true, data: { eventId, taskId, action: 'deleted' }, error: null });
});

const getEventsByCreator = asyncHandler(async (req, res) => {
  const data = await eventService.getEventsByCreatorLogic(req.validated.params.creatorId);
  res.status(200).json({ success: true, data, error: null });
});

const getEventsByGuestName = asyncHandler(async (req, res) => {
  const data = await eventService.getEventsByGuestNameLogic(req.validated.params.name);
  res.status(200).json({ success: true, data, error: null });
});

const getEventsByPhone = asyncHandler(async (req, res) => {
  const data = await eventService.getEventsByPhoneLogic(req.validated.params.phone);
  res.status(200).json({ success: true, data, error: null });
});

const addGuestToEvent = asyncHandler(async (req, res) => {
  const newGuest = await eventService.addGuestToEventLogic(
    parseInt(req.validated.params.id),
    req.validated.body
  );
  res.status(201).json({ success: true, data: newGuest, error: null });
});

const removeGuestFromEvent = asyncHandler(async (req, res) => {
  const eventId = parseInt(req.validated.params.id);
  const guestId = parseInt(req.validated.params.guestId);
  await eventService.removeGuestFromEventLogic(eventId, guestId);
  res
    .status(200)
    .json({ success: true, data: { eventId, guestId, action: 'deleted' }, error: null });
});

const updateGuestInEvent = asyncHandler(async (req, res) => {
  const updatedGuest = await eventService.updateGuestInEventLogic(
    parseInt(req.validated.params.id),
    parseInt(req.validated.params.guestId),
    req.validated.body
  );
  res.status(200).json({ success: true, data: updatedGuest, error: null });
});

const updateGuestRSVP = asyncHandler(async (req, res) => {
  const { status, token } = req.validated.body;
  const guestData = jwt.verify(token, process.env.JWT_SECRET);

  const eventId = parseInt(guestData.eventId);
  const guestId = parseInt(guestData.guestId);
  const updatedGuest = await eventService.updateGuestRSVPLogic(eventId, guestId, status);

  const io = req.validated.app.get('io');
  io.to(`event_${eventId}`).emit('rsvpUpdated', { guestId, status });

  res.status(200).json({ success: true, data: updatedGuest, error: null });
});

const getGuestRSVPData = asyncHandler(async (req, res) => {
  const data = await eventService.getRsvpData(req.validated.params.token);
  res.status(200).json({ success: true, data: data, error: null });
});

const generateInvite = asyncHandler(async (req, res) => {
  const inviteImage = await eventService.generatePhotoInviteLogic(
    parseInt(req.validated.params.id)
  );
  res.set('Content-Type', 'image/jpeg');
  res.status(200).send(inviteImage);
});

const generateShoppingList = asyncHandler(async (req, res) => {
  const shoppingList = await eventService.generateShoppingListLogic(req.validated.params.id);
  res.status(200).json({ success: true, data: shoppingList, error: null });
});

const generateTaskList = asyncHandler(async (req, res) => {
  const taskList = await eventService.generateTaskListLogic(parseInt(req.validated.params.id));
  res.status(200).json({ success: true, data: taskList, error: null });
});

const uploadToEventGallery = asyncHandler(async (req, res) => {
  const { eventId, guestId } = jwt.verify(req.validated.params.token, process.env.JWT_SECRET);

  if (!req.file) {
    const err = new Error('No invitation file uploaded. Please upload an image using form-data.');
    err.name = 'ValidationError';
    throw err;
  }

  const picturePath = `/uploads/${req.file.filename}`;
  const imageRecord = await eventService.saveToGalleryLogic(eventId, guestId, picturePath);
  res.status(200).json({ success: true, data: imageRecord, error: null });
});

const saveInvitation = asyncHandler(async (req, res) => {
  if (!req.file) {
    const err = new Error('No invitation file uploaded. Please upload an image using form-data.');
    err.name = 'ValidationError';
    throw err;
  }

  const picturePath = `/uploads/${req.file.filename}`;
  await eventService.saveInvitationLogic(parseInt(req.validated.params.id), picturePath);
  res.status(200).json({ success: true, data: { path: picturePath }, error: null });
});

const findStores = asyncHandler(async (req, res) => {
  if (!req.validated.query.lat || !req.validated.query.lon) {
    const err = new Error('Location (lat and lon) is required');
    err.name = 'ValidationError';
    throw err; // The global handler will catch this as a 400 Bad Request
  }

  const locationObj = {
    lat: parseFloat(req.validated.query.lat),
    lon: parseFloat(req.validated.query.lon),
  };

  const storesList = await eventService.findRelevantStores(
    locationObj,
    parseInt(req.validated.params.id)
  );
  res.status(200).json({ success: true, data: storesList, error: null });
});

module.exports = {
  saveInvitation,
  findStores,
  generateInvite,
  generateShoppingList,
  generateTaskList,
  getAllEvents,
  getEventById,
  createEvent,
  deleteEvent,
  updateEvent,
  getAllGuestsByEvent,
  getTasksByEventId,
  addTaskToEvent,
  updateTaskInEvent,
  removeTaskFromEvent,
  getEventsByCreator,
  getEventsByGuestName,
  getEventsByPhone,
  addGuestToEvent,
  removeGuestFromEvent,
  updateGuestInEvent,
  updateGuestRSVP,
  getGuestRSVPData,
  uploadToEventGallery,
  getEventGallery,
};

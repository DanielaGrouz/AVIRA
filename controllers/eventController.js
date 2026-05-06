// let events = require('../models/eventModel');
// let guests = require('../models/guestModel');
// let tasks = require('../models/taskModel');
//
// const getAllEvents = (req, res) => {
//     const limit = 5;
//     const page = parseInt(req.query.page) || 1;
//     const sortBy = req.query.sortBy || 'id';
//     let sortedEvents = [...events].sort((a, b) => {
//         if (a[sortBy] < b[sortBy]) return -1;
//         if (a[sortBy] > b[sortBy]) return 1;
//         return 0;
//     });
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
//     res.status(200).json({
//         success: true,
//         data: { page: page, totalPages: Math.ceil(events.length / limit), data: paginatedEvents },
//         error: null
//     });
// }
//
// const increaseGuestCount = (eventId) => {
//     const event = events.find(event => event.eventId === parseInt(eventId));
//     if (!event) {
//         return false;
//     }
//     event.guestCount += 1;
//     return true;
// };
//
// const addGuestToEvent = (req, res) => {
//     const { eventId } = req.params;
//     const { name, phone, role, status } = req.body;
//
//     const newGuest = {
//         guestId: guests.length > 0 ? Math.max(...guests.map(g => g.guestId)) + 1 : 1,
//         eventId: parseInt(eventId),
//         name,
//         phone,
//         status: status || 'pending',
//         role: role || 'guest'
//     };
//
//     const increaseSuccess = increaseGuestCount(eventId);
//     if (!increaseSuccess) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "EVENT_NOT_FOUND",
//                 message: `Event with ID ${eventId} was not found`
//             }
//         });
//     }
//
//     guests.push(newGuest);
//
//     res.status(201).json({
//         success: true,
//         data: newGuest,
//         error: null
//     });
// };
//
// const getAllGuestsByEvent = (req, res) => {
//     const { eventId } = req.params;
//     const limit = 5;
//     const page = parseInt(req.query.page) || 1;
//     const sortBy = req.query.sortBy || 'id';
//     const eventGuests = guests.filter(guest => guest.eventId === eventId);
//     if (eventGuests.length === 0) {
//         return res.status(200).json({
//             success: true,
//             data: { page: 1, totalPages: 0, data: [] },
//             error: null
//         });
//     }
//     let sortedGuests = [...eventGuests].sort((a, b) => {
//         if (a[sortBy] < b[sortBy]) return -1;
//         if (a[sortBy] > b[sortBy]) return 1;
//         return 0;
//     });
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedGuests = sortedGuests.slice(startIndex, endIndex);
//     res.status(200).json({
//         success: true,
//         data: {
//             page: page,
//             totalPages: Math.ceil(eventGuests.length / limit),
//             data: paginatedGuests
//         },
//         error: null
//     });
// }
//
//
// module.exports = { getAllEvents };
//
//
//
//
//
//
//
//
//
//
//
//
//
//

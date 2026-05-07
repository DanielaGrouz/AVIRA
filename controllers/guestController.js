// let guests = require('../models/guestModel');
//
// const getAllGuests = (req, res) => {
//     const limit = 5;
//     const page = parseInt(req.query.page) || 1;
//     const sortBy = req.query.sortBy || 'id';
//     let sortedGuests = [...guests].sort((a, b) => {
//         if (a[sortBy] < b[sortBy]) return -1;
//         if (a[sortBy] > b[sortBy]) return 1;
//         return 0;
//     });
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedGuests = sortedGuests.slice(startIndex, endIndex);
//     res.status(200).json({
//         success: true,
//         data: { page: page, totalPages: Math.ceil(guests.length / limit), data: paginatedGuests },
//         error: null
//     });
// }
//
// const getGuestById = (req, res) => {
//     const id = parseInt(req.params.id);
//     const guest = guests.find(g => g.guestId === id);
//     if (!guest) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "guest with ID ${id} was not found.",
//                 details: {}
//             }
//         });
//     }
//     res.status(200).json({
//         success: true,
//         data: guest,
//         error: null
//     });
// }
//
// const createGuest = (req, res) => {
//     const { eventId, name, phone, role, status } = req.body;
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
//     guests.push(newGuest);
//
//     res.status(201).json({
//         success: true,
//         data: newGuest,
//         error: null
//     });
// };
//
// const deleteGuest = (req, res) => {
//     const { id } = req.params;
//     const guestIndex = guests.findIndex(g => g.guestId === parseInt(id));
//     if (guestIndex === -1) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: { code: "NOT_FOUND", message: "Guest not found" }
//         });
//     }
//
//     guests.splice(guestIndex, 1);
//     res.status(200).json({ success: true, data: { guestId: id }, error: null });
// };
//
// const updateGuest = (req, res) => {
//     const id = parseInt(req.params.id);
//     const { name, phone, status, role } = req.body;
//     const guestIndex = guests.findIndex(g => g.guestId === id);
//     if (guestIndex === -1) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "Guest not found",
//                 details: {}
//             }
//         });
//     }
//     guests[guestIndex] = {
//         ...guests[guestIndex],
//         name: (name && name.trim() !== "") ? name : guests[guestIndex].name,
//         phone: (phone && phone.trim() !== "") ? phone : guests[guestIndex].phone,
//         status: (status && status.trim() !== "") ? status : guests[guestIndex].status,
//         role: (role && role.trim() !== "") ? role : guests[guestIndex].role
//     };
//
//     res.status(200).json({
//         success: true,
//         data: { guestId: id },
//         error: null
//     });
// };
//
// module.exports = { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest};

const guestService = require('../services/guestService');

const getAllGuests = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'id';

        const result = guestService.getAllGuestsLogic(page, limit, sortBy);

        res.status(200).json({
            success: true,
            data: result,
            error: null
        });
    } catch (error) {
        res.status(500).json({ success: false,
            data: null,
            error: {
            code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const getGuestById = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const guest = guestService.getGuestByIdLogic(id);

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
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const createGuest = (req, res) => {
    try {
        const newGuest = guestService.createGuestLogic(req.body);

        res.status(201).json({
            success: true,
            data: newGuest,
            error: null
        });
    } catch (error) {
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const updateGuest = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const updatedGuest = guestService.updateGuestLogic(id, req.body);

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
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

const deleteGuest = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        guestService.deleteGuestLogic(id);

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
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "Internal Server Error",
                message: "Internal Server Error",
                details : {}
            }});
    }
};

module.exports = { getAllGuests, getGuestById, createGuest, updateGuest, deleteGuest };













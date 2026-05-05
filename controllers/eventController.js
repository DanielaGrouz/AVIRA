let events = require('../models/eventModel');
let guests = require('../models/guestModel');
let tasks = require('../models/taskModel');

const getAllEvents = (req, res) => {
    const limit = 5;
    const page = parseInt(req.query.page) || 1;
    const sortBy = req.query.sortBy || 'id';
    let sortedEvents = [...events].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedEvents = sortedEvents.slice(startIndex, endIndex);
    res.status(200).json({
        success: true,
        data: { page: page, totalPages: Math.ceil(events.length / limit), data: paginatedEvents },
        error: null
    });
}


module.exports = { getAllEvents };















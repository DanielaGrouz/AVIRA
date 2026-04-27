const users = require('../models/userModel'); // import mock data

const getAllUsers = (req, res) => {
    res.status(200).json({
        success: true,
        data: users,
        error: null
    });
};

const getUserById = (req, res) => {
    const id = parseInt(req.params.id);
    const user = users.find(u => u.userId === id);

    if (!user) {
        return res.status(404).json({
            success: false,
            data: null,
            error: {
                code: "NOT_FOUND",
                message: `User with ID ${id} was not found.`,
                details: {}
            }
        });
    }

    res.status(200).json({
        success: true,
        data: user,
        error: null
    });
};

module.exports = {
    getAllUsers,
    getUserById
};
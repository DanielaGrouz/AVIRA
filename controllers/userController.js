let users = require('../models/userModel'); // import mock data

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
                message: "User with ID ${id} was not found.",
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

const createUser = (req, res) => {
    const { firstName, lastName, userRole } = req.body;
    const newUser = {
        userId: users.length + 1,
        firstName,
        lastName,
        userRole,
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
    };
    users.push(newUser);
    res.status(201).json({ success: true, data: { userId: newUser.userId }, error: null });
};

const updateUser = (req, res) => {
    const id = parseInt(req.params.id);
    const { firstName, lastName, userRole } = req.body;
    const userIndex = users.findIndex(u => u.userId === id);
    if (userIndex === -1) {
        return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User not found", details: {} } });
    }
    users[userIndex] = {
        ...users[userIndex],
        firstName: firstName || users[userIndex].firstName,
        lastName: lastName || users[userIndex].lastName,
        userRole: userRole || users[userIndex].userRole,
        updateDate: new Date().toISOString()
    }
    res.status(200).json({ success: true, data: { userId: id }, error: null });
};

const deleteUser = (req, res) => {
    const id = parseInt(req.params.id);
    const userIndex = users.findIndex(u => u.userId === id);
    if (userIndex === -1) {
        return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User not found", details: {} } });
    }
    //delete user
    users.splice(userIndex, 1);
    res.status(200).json({ success: true, data: { userId: id }, error: null });
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser };

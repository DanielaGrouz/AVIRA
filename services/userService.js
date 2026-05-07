let users = require('../models/userModel');
const bcrypt = require("bcrypt");
const verificationCodes = require("../models/authVerification");
const { sendMail } = require("../utils/emailClient");

const getAllUsersLogic = (page = 1, limit = 5, sortBy = 'id') => {
    let sortedUsers = [...users].sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
    });
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
    return {
        page,
        totalPages: Math.ceil(users.length / limit),
        data: paginatedUsers
    };
};

const getUserByIdLogic = (id) => {
    return users.find(u => u.userId === id) || null;
};

const createUserLogic = async (userData) => {
    const { firstName, lastName, password, phoneNumber, email } = userData;
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        throw new Error("EMAIL_EXISTS");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = {
        userId: users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        userRole: "user",
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString()
    };
    users.push(newUser);
    return newUser;
};

const updateUserLogic = (id, updateData) => {
    const userIndex = users.findIndex(u => u.userId === id);
    if (userIndex === -1) throw new Error("USER_NOT_FOUND");
    const { firstName, lastName, userRole, phoneNumber, email } = updateData;
    users[userIndex] = {
        ...users[userIndex],
        firstName: firstName || users[userIndex].firstName,
        lastName: lastName || users[userIndex].lastName,
        userRole: userRole || users[userIndex].userRole,
        updateDate: new Date().toISOString(),
        phoneNumber: phoneNumber || users[userIndex].phoneNumber,
        email: email || users[userIndex].email
    };
    return users[userIndex];
};

const deleteUserLogic = (id) => {
    const userIndex = users.findIndex(u => u.userId === id);
    if (userIndex === -1) throw new Error("USER_NOT_FOUND");
    users.splice(userIndex, 1);
    return true;
};

const checkVerificationCodeLogic = (email, code) => {
    const recordIndex = verificationCodes.findIndex(
        c => c.email === email && c.code.toString() === code.toString()
    );
    if (recordIndex === -1) return false;
    const record = verificationCodes[recordIndex];
    const now = new Date();
    const codeTime = new Date(record.timeStamp);
    const diffInMinutes = (now - codeTime) / (1000 * 60);
    verificationCodes.splice(recordIndex, 1);
    if (diffInMinutes > 15) return false;
    return true;
};

const completeEmailVerificationLogic = (email, code) => {
    const isValid = checkVerificationCodeLogic(email, code);
    if (!isValid) throw new Error("INVALID_CODE");
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("USER_NOT_FOUND");
    return user;
};

const loginLogic = async (email, password) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("EMAIL_NOT_FOUND");
    const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
    if (!isMatch) throw new Error("INCORRECT_PASSWORD");
    return user;
};

const sendVerificationCodeLogic = async (email) => {
    const user = users.find(u => u.email === email);
    if (!user) throw new Error("USER_NOT_FOUND");
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    verificationCodes.push({ email, code, timeStamp: new Date().toISOString() });
    await sendMail(`your code is: ${code}`, "verify your email", email);
    return true;
};

const resetPasswordLogic = async (userId, newPassword) => {
    const user = users.find(u => u.userId === userId);
    if (!user) throw new Error("USER_NOT_FOUND");
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updateDate = new Date().toISOString();
    return true;
};

module.exports = {
    getAllUsersLogic,
    getUserByIdLogic,
    createUserLogic,
    updateUserLogic,
    deleteUserLogic,
    completeEmailVerificationLogic,
    loginLogic,
    sendVerificationCodeLogic,
    resetPasswordLogic
};
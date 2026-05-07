let users = require('../models/userModel');
const bcrypt = require("bcrypt");
const verificationCodes = require("../models/authVerification");
const { sendMail } = require("../utils/emailClient");
const {generateAvatar} = require("../utils/generateAvatarClient");
const fs = require('fs/promises');
const path = require('path');

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

const generateAvatarPicture = async (firstName, lastName) => {
    const roles = ["cat", "dog", "fox", "robot", "astronaut", "wizard", "ninja", "panda", "owl", "dragon"];
    const traitsList = [
        "wearing stylish glasses",
        "with a big happy smile",
        "in a futuristic cyber suit",
        "wearing a cozy winter scarf",
        "with a cool leather jacket",
        "drinking a cup of coffee",
        "with a cyberpunk aesthetic"
    ];
    const colorThemes = [
        "pastel blue", "mint green", "sunset orange", "lavender purple",
        "neon pink", "warm gold", "monochrome slate", "cherry blossom pink"
    ];

    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const randomRole = getRandom(roles);
    const randomTrait = getRandom(traitsList);
    const randomColor = getRandom(colorThemes);

    const userProfile = {
        role: randomRole,
        traits: `${randomTrait}, looking friendly, representing the vibe of a person named ${firstName} ${lastName}`,
        colorTheme: randomColor
    };
    const buffer = await generateAvatar(userProfile);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    let finalPicture = path.join(__dirname, '../uploads', `avatar_ai_${uniqueSuffix}.jpg`);
    await fs.writeFile(finalPicture, buffer, 'utf8');
    return finalPicture;
}

const createUserLogic = async (userData) => {
    const { firstName, lastName, userRole, password, phoneNumber, email, picturePath} = userData;
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
        throw new Error("EMAIL_EXISTS");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let finalPicture = picturePath;
    if (!picturePath) {
        finalPicture = generateAvatarPicture(firstName, lastName);
    }
    const newUser = {
        userId: users.length > 0 ? Math.max(...users.map(u => u.userId)) + 1 : 1,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phoneNumber,
        userRole: userRole || "user",
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
        picturePath: finalPicture
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
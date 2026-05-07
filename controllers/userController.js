// // require('dotenv').config();
// // const jwt = require("jsonwebtoken");
// // const JWT_SECRET = process.env.JWT_SECRET;
// let users = require('../models/userModel');
// const bcrypt = require("bcrypt");
// const verificationCodes = require("../models/authVerification");
// const {sendMail} = require("../utils/emailClient");
//
//
// const getAllUsers = (req, res) => {
//     const limit = 5;
//     const page = parseInt(req.query.page) || 1;
//     const sortBy = req.query.sortBy || 'id';
//     let sortedUsers = [...users].sort((a, b) => {
//         if (a[sortBy] < b[sortBy]) return -1;
//         if (a[sortBy] > b[sortBy]) return 1;
//         return 0;
//     });
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const paginatedUsers = sortedUsers.slice(startIndex, endIndex);
//     res.status(200).json({
//         success: true,
//         data: { page: page, totalPages: Math.ceil(users.length / limit), data: paginatedUsers },
//         error: null
//     });
// };
//
// const getUserById = (req, res) => {
//     const id = parseInt(req.params.id);
//     const user = users.find(u => u.userId === id);
//     if (!user) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "User with ID ${id} was not found.",
//                 details: {}
//             }
//         });
//     }
//     res.status(200).json({
//         success: true,
//         data: user,
//         error: null
//     });
// };
//
// const createUser = async (req, res) => {
//     const { firstName, lastName, password, phoneNumber, email } = req.body;
//     try {
//         const existingUser = users.find(u => u.email === email);
//         if (existingUser) {
//             return res.status(400).json({
//                 success: false,
//                 data: null,
//                 error: {
//                     code: "EMAIL_EXISTS",
//                     message: "A user with this email already exists",
//                     details: { email }
//                 }
//             });
//         }
//
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
//         const newUser = {
//             userId: users.length + 1,
//             firstName,
//             lastName,
//             email,
//             password: hashedPassword,
//             phoneNumber,
//             userRole: "user",
//             createDate: new Date().toISOString(),
//             updateDate: new Date().toISOString()
//         };
//
//         users.push(newUser);
//         res.status(201).json({
//             success: true,
//             data: {
//                 message: "User registered successfully. Please verify user's email.",
//                 user: { userId: newUser.userId, email: newUser.email }
//             },
//             error: null
//         });
//
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             data: null,
//             error: { code: "SERVER_ERROR", message: error.message }
//         });
//     }
// }
//
// const updateUser = (req, res) => {
//     const id = parseInt(req.params.id);
//     const { firstName, lastName, userRole, phoneNumber, email } = req.body;
//     const userIndex = users.findIndex(u => u.userId === id);
//     if (userIndex === -1) {
//         return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User not found", details: {} } });
//     }
//     users[userIndex] = {
//         ...users[userIndex],
//         firstName: firstName || users[userIndex].firstName,
//         lastName: lastName || users[userIndex].lastName,
//         userRole: userRole || users[userIndex].userRole,
//         updateDate: new Date().toISOString(),
//         phoneNumber: phoneNumber || users[userIndex].phoneNumber,
//         email: email || users[userIndex].email
//     }
//     res.status(200).json({ success: true, data: { userId: id }, error: null });
// };
//
// const deleteUser = (req, res) => {
//     const id = parseInt(req.params.id);
//     const userIndex = users.findIndex(u => u.userId === id);
//     if (userIndex === -1) {
//         return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User not found", details: {} } });
//     }
//     //delete user
//     users.splice(userIndex, 1);
//     res.status(200).json({ success: true, data: { userId: id }, error: null });
// };
//
// const checkVerificationCode = (email, code) => {
//     const recordIndex = verificationCodes.findIndex(
//         c => c.email === email && c.code.toString() === code.toString()
//     );
//     if (recordIndex === -1) {
//         return false;
//     }
//     const record = verificationCodes[recordIndex];
//
//     // Timestamp check
//     const now = new Date();
//     const codeTime = new Date(record.timeStamp);
//     const diffInMinutes = (now - codeTime) / (1000 * 60);
//
//     if (diffInMinutes > 15) {
//         verificationCodes.splice(recordIndex, 1);
//         return false;
//     }
//
//     verificationCodes.splice(recordIndex, 1);
//     return true;
// }
//
// const completeEmailVerification = (req, res) => {
//     const { email, code } = req.body;
//     const isValid = checkVerificationCode(email, code);
//     if (!isValid) {
//         return res.status(400).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "INVALID_CODE",
//                 message: "The verification code is incorrect or expired",
//                 details: {}
//             }
//         });
//     }
//     const user = users.find(u => u.email === email);
//     if (!user) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "User with email ${email} was not found.",
//                 details: {}
//             }
//         });
//     }
//     res.status(200).json({
//         success: true,
//         data: { userId: user.id, message: "users email has been verified." },
//         error: null
//     });
// }
//
// const login = async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = users.find(u => u.email === email);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 data: null,
//                 error: {
//                     code: "NOT FOUND",
//                     message: "Email not exists",
//                     details: { }
//                 }
//             });
//         }
//         const isMatch = await bcrypt.compare(password, user.password).catch(() => password === user.password);
//         if (!isMatch) {
//             return res.status(401).json({
//                 success: false,
//                 data: null,
//                 error: {
//                     code: "UNAUTHORIZED",
//                     message: "Incorrect password",
//                     details: { }
//                 }
//             });
//         }
//         // const token = jwt.sign(
//         //     { userId: user.userId, role: user.userRole },
//         //     JWT_SECRET,
//         //     { expiresIn: '1h' }
//         // );
//         res.status(200).json({
//             success: true,
//             data: { user: { userId: user.id } },
//             error: null
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             data: null,
//             error: { code: "SERVER_ERROR", message: error.message }
//         });
//     }
// }
//
// const sendVerificationCode = async (req, res) => {
//     const { email } = req.body;
//     const user = users.find(u => u.email === email);
//     if (!user) {
//         return res.status(404).json({
//             success: false,
//             data: null,
//             error: {
//                 code: "NOT_FOUND",
//                 message: "User with this email not found",
//                 details: { email }
//             }
//         });
//     }
//     const code = Math.floor(1000 + Math.random() * 9000).toString();
//     verificationCodes.push({ email, code, timeStamp: new Date().toISOString() });
//     try {
//         await sendMail(`your code is: ${code}`, "verify your email", email)
//     }
//     catch (error) {
//       return res.status(500).json({
//           success: false,
//           data: null,
//           error: { code: "SERVER_ERROR", message: error.message }
//       })
//     }
//     res.status(200).json({
//         success: true,
//         data: { message: "Verification code sent to email" },
//         error: null
//     });
// }
//
// const resetPassword = async (req, res) => {
//     const { userId, newPassword } = req.body;
//     try {
//         const user = users.find(u => u.userId === userId);
//         if (!user) {
//             return res.status(404).json({
//                 success: false,
//                 data: null,
//                 error: { code: "NOT_FOUND", message: "User not found" }
//             });
//         }
//
//         const salt = await bcrypt.genSalt(10);
//         user.password = await bcrypt.hash(newPassword, salt);
//         user.updateDate = new Date().toISOString();
//
//         res.status(200).json({
//             success: true,
//             data: { message: "Password updated successfully" },
//             error: null
//         });
//
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             data: null,
//             error: { code: "SERVER_ERROR", message: error.message }
//         });
//     }
// }
//
//
// module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, login, sendVerificationCode , resetPassword, completeEmailVerification};

const userService = require('../services/userService');



const getAllUsers = (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const sortBy = req.query.sortBy || 'id';

        const result = userService.getAllUsersLogic(page, limit, sortBy);

        res.status(200).json({ success: true, data: result, error: null });
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

const getUserById = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        const user = userService.getUserByIdLogic(id);
        if (!user) {
            return res.status(404).json({
                success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with ID ${id} was not found.`, details : {} }
            });
        }
        res.status(200).json({ success: true, data: user, error: null });
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

const createUser = async (req, res) => {
    try {
        let picturePath = null;
        if (req.file){
            picturePath = `/uploads/${req.file.filename}`
        }
        const data = {...req.body, picturePath};
        const newUser = await userService.createUserLogic(data);

        res.status(201).json({
            success: true,
            data: {
                message: "User registered successfully. Please verify user's email.",
                user: { userId: newUser.userId, email: newUser.email }
            },
            error: null
        });
    } catch (error) {
        if (error.message === "EMAIL_EXISTS") {
            return res.status(400).json({
                success: false, data: null,
                error: { code: "EMAIL_EXISTS", message: "A user with this email already exists", details:{}}
            });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message, details: {}} });
    }
};

const updateUser = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        userService.updateUserLogic(id, req.body);

        res.status(200).json({ success: true, data: { userId: id }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with id: ${id} not found.`, details:{} } });
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details : {}
            }
        });
    }
};

const deleteUser = (req, res) => {
    try {
        const id = parseInt(req.params.id);
        userService.deleteUserLogic(id);

        res.status(200).json({ success: true, data: { userId: id }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null,
                error: { code: "NOT_FOUND", message: `User with id: ${id} not found.`, details:{} } });
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details : {}
            }
        });
    }
};

const completeEmailVerification = (req, res) => {
    try {
        const { email, code } = req.body;
        const user = userService.completeEmailVerificationLogic(email, code);

        res.status(200).json({
            success: true,
            data: { userId: user.userId, message: "users email has been verified." },
            error: null
        });
    } catch (error) {
        if (error.message === "INVALID_CODE") {
            return res.status(400).json({ success: false, data: null, error: { code: "INVALID_CODE", message: "The verification code is incorrect or expired", details:{} } });
        }
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with email ${req.body.email} was not found.`, details:{} } });
        }
        res.status(500).json({ success: false,
            data: null,
            error: {
                code: "SERVER_ERROR",
                message: "Internal Server Error",
                details : {}
            }
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userService.loginLogic(email, password);

        res.status(200).json({ success: true, data: { user: { userId: user.userId } }, error: null });
    } catch (error) {
        if (error.message === "EMAIL_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "Email not exists", details:{} } });
        }
        if (error.message === "INCORRECT_PASSWORD") {
            return res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Incorrect password", details:{} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message, details: {} } });
    }
};

const sendVerificationCode = async (req, res) => {
    try {
        const { email } = req.body;
        await userService.sendVerificationCodeLogic(email);

        res.status(200).json({ success: true, data: { message: "Verification code sent to email" }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "User with this email not found" , details:{} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message , details: {} } });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { userId, newPassword } = req.body;
        await userService.resetPasswordLogic(userId, newPassword);

        res.status(200).json({ success: true, data: { message: "Password updated successfully" }, error: null });
    } catch (error) {
        if (error.message === "USER_NOT_FOUND") {
            return res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: `User with id: ${userId} not found.`, details:{} } });
        }
        res.status(500).json({ success: false, data: null, error: { code: "SERVER_ERROR", message: error.message, details: {} } });
    }
};

module.exports = { getAllUsers, getUserById, createUser, updateUser, deleteUser, login, sendVerificationCode, resetPassword, completeEmailVerification };
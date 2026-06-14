//const bcrypt = require("bcrypt");
const users = [
    {
        userId: 1,
        firstName: 'Daniela',
        lastName: 'Levi',
        createDate: '2026-04-27T10:00:00Z',
        updateDate: '2026-04-27T10:00:00Z',
        userRole: 'admin',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6u0oinKIAyjIi/VWdtlbJf2l0XWf2V1rG',
        phoneNumber: '0545368889',
        email: 'danielagrou11z@gmail.com',
        originalPassword: 'Aa12345!',
        picturePath: '/sources/avatar/avatar1.png',
        isEmailVerified: true
    },
    {
        userId: 2,
        firstName: 'Yosef',
        lastName: 'Cohen',
        createDate: '2026-04-27T11:00:00Z',
        updateDate: '2026-04-27T11:30:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6uSuVyCoe.XlmNo2RlK2sTQVIRZMOg9ai',
        phoneNumber: '0501234567',
        email: 'yosef.cohen@example.com',
        originalPassword: 'Password123!',
        picturePath: '/sources/avatar/avatar2.png',
        isEmailVerified: true
    },
    {
        userId: 3,
        firstName: 'Rinat',
        lastName: 'Mizrahi',
        createDate: '2026-04-28T09:15:00Z',
        updateDate: '2026-04-28T09:15:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6ubCmEym3cEyhp1ur.58dYSHrYeqNIZ4y',
        phoneNumber: '0529876543',
        email: 'rinat.m@example.com',
        originalPassword: 'RinatPass4!',
        picturePath: '/sources/avatar/avatar3.png',
        isEmailVerified: true
    },
    {
        userId: 4,
        firstName: 'Omer',
        lastName: 'Peretz',
        createDate: '2026-04-28T14:20:00Z',
        updateDate: '2026-04-28T15:00:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6uTaQa2yU9Cwy/IdsFge8kS3UwKl861dy',
        phoneNumber: '0533344556',
        email: 'omer.peretz@example.com',
        originalPassword: 'OmerP2026!',
        picturePath: '/sources/avatar/avatar4.png',
        isEmailVerified: true
    },
    {
        userId: 5,
        firstName: 'Noa',
        lastName: 'Avraham',
        createDate: '2026-04-29T08:45:00Z',
        updateDate: '2026-04-29T08:45:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6uFNC9/.J8UUjPSL3wvt5erMX89CLniuu',
        phoneNumber: '0587766554',
        email: 'noa.av@example.com',
        originalPassword: 'NoaSecure7!',
        picturePath: '/sources/avatar/avatar5.png',
        isEmailVerified: true
    },
    {
        userId: 6,
        firstName: 'Itay',
        lastName: 'Golan',
        createDate: '2026-04-29T10:05:00Z',
        updateDate: '2026-04-29T12:10:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6utoLeRqV2MBOXSyZFpO51hAhszfneSYy',
        phoneNumber: '0541122334',
        email: 'itay.golan@example.com',
        originalPassword: 'ItayG123!',
        picturePath: '/sources/avatar/avatar6.png',
        isEmailVerified: true
    },
    {
        userId: 7,
        firstName: 'Maya',
        lastName: 'Friedman',
        createDate: '2026-04-29T11:30:00Z',
        updateDate: '2026-04-29T11:30:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6u5CyxzdMt84f0p1kWWZS4OxBUxmR8avi',
        phoneNumber: '0525544332',
        email: 'maya.f@example.com',
        originalPassword: 'MayaPass99!',
        picturePath: '/sources/avatar/avatar8.png',
        isEmailVerified: true
    },
    {
        userId: 8,
        firstName: 'Guy',
        lastName: 'Shapira',
        createDate: '2026-04-29T12:00:00Z',
        updateDate: '2026-04-29T13:45:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6uKR8V1ovW42I6YO6tpq/mFsM4Bf6cIkG',
        phoneNumber: '0509988776',
        email: 'guy.s@example.com',
        originalPassword: 'GuyShapira8!',
        picturePath: '/sources/avatar/avatar9.png',
        isEmailVerified: true
    },
    {
        userId: 9,
        firstName: 'Shir',
        lastName: 'Katz',
        createDate: '2026-04-29T13:15:00Z',
        updateDate: '2026-04-29T13:15:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6u/HAYZXTwrNRy2/sKPC4qOCdF3v..PAO',
        phoneNumber: '0531237890',
        email: 'shir.katz@example.com',
        originalPassword: 'ShirKatz1!',
        picturePath: '/sources/avatar/avatar7.png',
        isEmailVerified: true
    },
    {
        userId: 10,
        firstName: 'Amit',
        lastName: 'Bar',
        createDate: '2026-04-29T13:30:00Z',
        updateDate: '2026-04-29T13:35:00Z',
        userRole: 'user',
        password: '$2b$10$QVLxi8cRPW2GEndQID6k6uXE3ttX.7GDazxD3ygKhr6N5CYk/uFwu',
        phoneNumber: '0546655443',
        email: 'amit.bar@example.com',
        originalPassword: 'amitBar2026!',
        picturePath: '/sources/avatar/avatar10.png',
        isEmailVerified: true
    }
];


// const calcHash = async () => {
//     const salt = await bcrypt.genSalt(10);
//     return await Promise.all(users.map(async (user) => {
//         const hashedPassword = await bcrypt.hash(user.originalPassword, salt);
//         return {
//             ...user,
//             password: hashedPassword
//         };
//     }));
// }
//
// calcHash().then(console.log);

module.exports = users;
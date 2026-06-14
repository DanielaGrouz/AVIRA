// models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize('avira_db', 'username', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3307
});

// 1. User Model
const User = sequelize.define('User', {
    userId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: { type: DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    userRole: DataTypes.STRING,
    picturePath: DataTypes.STRING,
    isEmailVerified: DataTypes.BOOLEAN
}, { timestamps: true, createdAt: 'createDate', updatedAt: 'updateDate' });

// 2. Event Model
const Event = sequelize.define('Event', {
    eventId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    date: DataTypes.DATEONLY,
    time: DataTypes.TIME,
    location: DataTypes.STRING,
    eventType: DataTypes.STRING,
    guestsCount: DataTypes.INTEGER,
    invitationPath: DataTypes.STRING
});

// 3. Guest Model
const Guest = sequelize.define('Guest', {
    guestId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    status: DataTypes.STRING,
    role: DataTypes.STRING
});

// 4. Task Model
const Task = sequelize.define('Task', {
    taskId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    status: DataTypes.STRING,
    priority: DataTypes.STRING
});

// Add this to models/index.js
const VerificationCode = sequelize.define('VerificationCode', {
    email: DataTypes.STRING,
    code: DataTypes.STRING,
    timeStamp: DataTypes.DATE
}, { timestamps: false });
// Export it along with User, Event, etc.

const EventGallery = sequelize.define('eventGallery', {
    path: DataTypes.STRING,
}, { timestamps: true, createdAt: 'createDate' });

// Define Relationships
Event.hasMany(EventGallery, { foreignKey: 'eventId', onDelete: 'CASCADE' });

User.hasMany(Event, { foreignKey: 'creatorId' });
Event.belongsTo(User, { foreignKey: 'creatorId' });

Event.hasMany(Guest, { foreignKey: 'eventId', onDelete: 'CASCADE' });
Guest.belongsTo(Event, { foreignKey: 'eventId' });

Event.hasMany(Task, { foreignKey: 'eventId', onDelete: 'CASCADE' });
Task.belongsTo(Event, { foreignKey: 'eventId' });

module.exports = { sequelize, User, Event, Guest, Task, VerificationCode, EventGallery };
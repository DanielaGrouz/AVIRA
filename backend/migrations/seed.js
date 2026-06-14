const { sequelize, User, Event, Guest, Task } = require('../models/index.js');
const usersMock = require('./userData.js');
const eventsMock = require('./eventData.js');
const guestsMock = require('./guestData.js');
const tasksMock = require('./taskData.js');

const runSeeder = async () => {
  try {
    await sequelize.authenticate();

    // force: true drops existing tables and recreates them from scratch
    await sequelize.sync({ force: true });

    const now = new Date();

    const usersToInsert = usersMock.map((user) => {
      const { originalPassword, ...dbUser } = user;
      return {
        ...dbUser,
        createDate: user.createDate || now,
        updateDate: user.updateDate || now,
      };
    });

    const eventsToInsert = eventsMock.map((event) => ({
      ...event,
      createdAt: now,
      updatedAt: now,
    }));

    const guestsToInsert = guestsMock.map((guest) => ({
      ...guest,
      createdAt: now,
      updatedAt: now,
    }));

    const tasksToInsert = tasksMock.map((task) => ({
      ...task,
      createdAt: now,
      updatedAt: now,
    }));

    await User.bulkCreate(usersToInsert);

    await Event.bulkCreate(eventsToInsert);

    await Guest.bulkCreate(guestsToInsert);

    await Task.bulkCreate(tasksToInsert);

    console.log('Database successfully seeded');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

runSeeder();

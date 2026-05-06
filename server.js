const express = require('express');
const logger = require('./middleware/logger');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const taskRoutes = require('./routes/tasksRoutes');
const app = express();
const port = 3000;

app.use(express.json());
app.use(logger);

app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/tasks', taskRoutes);

//default
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        data: { message: "Welcome to AVIRA API" },
        error: null
    });
});

app.listen(port, () => {
    console.log(`AVIRA server is running at http://localhost:${port}`);
});
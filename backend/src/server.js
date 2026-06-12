const express = require('express');
const logger = require('./middleware/logger');
const cors = require('cors'); // 1. Import cors
const userRoutes = require('./routes/userRoutes');
const guestsRoutes = require('./routes/guestsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const taskRoutes = require('./routes/tasksRoutes');
const aiRoutes = require('./routes/aiRoutes');

const {uploadDir} = require("./middleware/fileUpload");
const app = express();
const port = 3000;

app.use(cors());
app.use('/uploads', express.static(uploadDir));
app.use(express.json());
app.use(logger);

app.use('/events', aiRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/events', taskRoutes);
app.use('/events', guestsRoutes);


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
const express = require('express');
const logger = require('./middleware/logger');
const userRoutes = require('./routes/userRoutes');
const app = express();
const port = 3000;

app.use(express.json());
app.use(logger);

app.use('/users', userRoutes);

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
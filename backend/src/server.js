const express = require('express');
const logger = require('./middleware/logger');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const guestsRoutes = require('./routes/guestsRoutes');
const eventRoutes = require('./routes/eventRoutes');
const taskRoutes = require('./routes/tasksRoutes');
const aiRoutes = require('./routes/aiRoutes');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const { uploadDir } = require('./middleware/fileUpload');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('./middleware/errorHandler');
const app = express();
const port = 3000;

app.use(cors());
app.use('/sources', express.static(path.join(__dirname, './sources')));
app.use('/uploads', express.static(uploadDir));
app.use(express.json());
app.use(logger);

app.use('/events', aiRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/events', taskRoutes);
app.use('/events', guestsRoutes);
app.use(errorHandler);

//default
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    data: { message: 'Welcome to AVIRA API' },
    error: null,
  });
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinEventRoom', (eventId) => {
    socket.join(`event_${eventId}`);
    console.log(`Socket ${socket.id} joined room: event_${eventId}`);
  });

  socket.on('imageUploaded', (data) => {
    try {
      console.log('Image uploaded data:', data);
      const { token } = data;

      const guestData = jwt.verify(token, process.env.JWT_SECRET);

      io.to(`event_${guestData.eventId}`).emit('newImageBroadcast', {
        guestId: guestData.guestId,
        eventId: guestData.eventId,
        ...data,
      });
    } catch (error) {
      console.error('Socket error: Invalid or expired token during image upload', error.message);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

app.listen(port, () => {
  console.log(`AVIRA server is running at http://localhost:${port}`);
});

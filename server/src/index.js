const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { RoomManager } = require('./game/RoomManager');
const { setupSocketHandlers } = require('./socket/handlers');

const app = express();
const server = http.createServer(app);

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Room Manager (shared state)
const roomManager = new RoomManager();

// Setup socket handlers
setupSocketHandlers(io, roomManager);

// REST endpoints
app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: Object.keys(roomManager.rooms).length });
});

app.get('/rooms', (req, res) => {
  res.json(roomManager.getAvailableRooms());
});

server.listen(PORT, () => {
  console.log(`\n🃏 Bhabhi Thulla Server running on port ${PORT}`);
  console.log(`   Client URL: ${CLIENT_URL}`);
  console.log(`   Health: http://localhost:${PORT}/health\n`);
});

module.exports = { app, server };

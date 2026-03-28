const { v4: uuidv4 } = require('uuid');
const { GAME_STATES } = require('../game/GameManager');

function setupSocketHandlers(io, roomManager) {

  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Send available rooms on connect
    socket.emit('availableRooms', roomManager.getAvailableRooms());

    // ─── JOIN ROOM ────────────────────────────────────────────────
    socket.on('joinRoom', ({ roomId, playerName }) => {
      if (!roomId || !playerName) {
        return socket.emit('joinError', { error: 'Room ID and player name are required' });
      }

      const playerId = uuidv4();
      const playerInfo = {
        id: playerId,
        name: playerName.trim().substring(0, 20),
        socketId: socket.id
      };

      const result = roomManager.joinRoom(roomId, socket.id, playerInfo);
      if (!result.success) {
        return socket.emit('joinError', { error: result.error });
      }

      socket.join(roomId);
      socket.playerId = playerId;
      socket.roomId = roomId;

      const room = roomManager.getRoom(roomId);

      // Tell the joining player their ID
      socket.emit('joined', {
        playerId,
        roomId,
        playerName: playerInfo.name
      });

      // Broadcast room update to all in room
      io.to(roomId).emit('roomUpdate', {
        roomId,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        playerCount: room.players.length,
        maxPlayers: 4,
        canStart: room.canStart()
      });

      // Update available rooms for everyone in lobby
      io.emit('availableRooms', roomManager.getAvailableRooms());

      console.log(`[Room ${roomId}] ${playerName} joined (${room.players.length}/4)`);

      // Auto-start if 4 players
      if (room.canStart()) {
        startGame(io, roomManager, roomId);
      }
    });

    // ─── PLAY CARD ────────────────────────────────────────────────
    socket.on('playCard', ({ cardId }) => {
      const roomId = socket.roomId;
      const playerId = socket.playerId;

      if (!roomId || !playerId) {
        return socket.emit('playError', { error: 'Not in a room' });
      }

      const room = roomManager.getRoom(roomId);
      if (!room) {
        return socket.emit('playError', { error: 'Room not found' });
      }

      const result = room.playCard(playerId, cardId);

      if (!result.success) {
        return socket.emit('playError', { error: result.error });
      }

      // Send updated private hands to each player
      sendPrivateHands(io, room, roomId);

      if (result.roundComplete) {
        // Broadcast round result
        io.to(roomId).emit('roundResult', result.roundResult);

        if (result.gameOver) {
          room.state = GAME_STATES.GAME_OVER;
          io.to(roomId).emit('gameOver', {
            loserId: result.loserId,
            loserName: result.loserName,
            finalScores: result.finalScores,
            message: `${result.loserName} is the Bhabhi (loser)!`
          });
        } else {
          // Send updated game state after short delay (for animation)
          setTimeout(() => {
            io.to(roomId).emit('gameState', room.getPublicState());
          }, 2500);
        }
      }

      // Broadcast updated game state
      io.to(roomId).emit('gameState', room.getPublicState());
    });

    // ─── REQUEST STATE (reconnect) ────────────────────────────────
    socket.on('requestState', () => {
      const roomId = socket.roomId;
      const playerId = socket.playerId;
      if (!roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room) return;

      socket.emit('gameState', room.getPublicState());
      if (playerId && room.state === GAME_STATES.PLAYING) {
        socket.emit('yourCards', { hand: room.getPrivateState(playerId).hand });
      }
    });

    // ─── RESTART GAME ─────────────────────────────────────────────
    socket.on('restartGame', () => {
      const roomId = socket.roomId;
      if (!roomId) return;

      const room = roomManager.getRoom(roomId);
      if (!room || room.state !== GAME_STATES.GAME_OVER) return;

      // Reset game state
      room.hands = {};
      room.scores = {};
      room.state = GAME_STATES.WAITING;
      room.currentRound = [];
      room.leadingSuit = null;
      room.currentPlayerIndex = 0;
      room.roundNumber = 0;
      room.finishedPlayers = [];
      room.collectedCards = {};
      room.thullaCount = {};
      room.turnOrder = [];
      room.lastRoundResult = null;
      room.roundHistory = [];

      io.to(roomId).emit('roomUpdate', {
        roomId,
        players: room.players.map(p => ({ id: p.id, name: p.name })),
        playerCount: room.players.length,
        maxPlayers: 4,
        canStart: room.canStart()
      });

      if (room.canStart()) {
        startGame(io, roomManager, roomId);
      }
    });

    // ─── DISCONNECT ───────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
      const roomId = roomManager.leaveRoom(socket.id);

      if (roomId) {
        const room = roomManager.getRoom(roomId);
        if (room) {
          io.to(roomId).emit('roomUpdate', {
            roomId,
            players: room.players.map(p => ({ id: p.id, name: p.name })),
            playerCount: room.players.length,
            maxPlayers: 4,
            canStart: room.canStart()
          });
          io.to(roomId).emit('playerLeft', {
            message: 'A player has left the game'
          });
        }
        io.emit('availableRooms', roomManager.getAvailableRooms());
      }
    });
  });
}

function startGame(io, roomManager, roomId) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const result = room.startGame();
  if (!result.success) {
    io.to(roomId).emit('gameError', { error: result.error });
    return;
  }

  console.log(`[Room ${roomId}] Game started!`);

  // Emit game start with public state
  io.to(roomId).emit('gameStart', {
    message: 'Game started! Player with Ace of Spades goes first.',
    publicState: room.getPublicState()
  });

  // Send private hands
  sendPrivateHands(io, room, roomId);

  // Send initial game state
  io.to(roomId).emit('gameState', room.getPublicState());
}

function sendPrivateHands(io, room, roomId) {
  const socketsInRoom = io.sockets.adapter.rooms.get(roomId);
  if (!socketsInRoom) return;

  socketsInRoom.forEach(socketId => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket && socket.playerId) {
      const privateState = room.getPrivateState(socket.playerId);
      socket.emit('yourCards', { hand: privateState.hand });
    }
  });
}

module.exports = { setupSocketHandlers };

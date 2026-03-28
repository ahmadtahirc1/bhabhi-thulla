const { GameManager } = require('./GameManager');

class RoomManager {
  constructor() {
    this.rooms = {}; // roomId -> GameManager
    this.playerRooms = {}; // socketId -> roomId
  }

  createRoom(roomId) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = new GameManager(roomId);
    }
    return this.rooms[roomId];
  }

  getRoom(roomId) {
    return this.rooms[roomId] || null;
  }

  getRoomForSocket(socketId) {
    const roomId = this.playerRooms[socketId];
    return roomId ? this.rooms[roomId] : null;
  }

  getRoomIdForSocket(socketId) {
    return this.playerRooms[socketId] || null;
  }

  joinRoom(roomId, socketId, playerInfo) {
    let room = this.rooms[roomId];
    if (!room) {
      room = this.createRoom(roomId);
    }

    const result = room.addPlayer(playerInfo);
    if (result.success) {
      this.playerRooms[socketId] = roomId;
    }
    return result;
  }

  leaveRoom(socketId) {
    const roomId = this.playerRooms[socketId];
    if (!roomId) return null;

    const room = this.rooms[roomId];
    if (room) {
      const player = room.players.find(p => p.socketId === socketId);
      if (player) {
        room.removePlayer(player.id);
      }
      // Clean up empty rooms
      if (room.players.length === 0) {
        delete this.rooms[roomId];
      }
    }

    delete this.playerRooms[socketId];
    return roomId;
  }

  getAvailableRooms() {
    return Object.entries(this.rooms)
      .filter(([_, room]) => room.players.length < 4 && room.state === 'waiting')
      .map(([id, room]) => ({
        id,
        playerCount: room.players.length,
        players: room.players.map(p => p.name)
      }));
  }

  cleanupRoom(roomId) {
    delete this.rooms[roomId];
    // Remove all player-room mappings for this room
    Object.keys(this.playerRooms).forEach(socketId => {
      if (this.playerRooms[socketId] === roomId) {
        delete this.playerRooms[socketId];
      }
    });
  }
}

module.exports = { RoomManager };

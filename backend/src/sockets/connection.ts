import { Server, Socket } from 'socket.io';
import { GameRoom } from '../types';
import { createGameRoom } from '../game/room';
import { io } from '../server';
import { GAME_CONFIG } from '../config';

export function setupConnectionHandlers(
  io: Server,
  waitingPlayers: string[],
  gameRooms: Map<string, GameRoom>
) {
  return (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    socket.on('joinGame', () => handleJoinGame(socket, waitingPlayers, gameRooms));
    socket.on('disconnect', () => handleDisconnect(socket, waitingPlayers, gameRooms));
  };
}

function handleJoinGame(
  socket: Socket,
  waitingPlayers: string[],
  gameRooms: Map<string, GameRoom>
) {
  if (waitingPlayers.length === 0) {
    waitingPlayers.push(socket.id);
    socket.emit('waiting');
  } else {
    const player1Id = waitingPlayers.shift()!;
    const player2Id = socket.id;
    
    const room = createGameRoom(player1Id, player2Id);
    gameRooms.set(room.id, room);
    
    socket.join(room.id);
    io.sockets.sockets.get(player1Id)?.join(room.id);
    
    const gameData = {
      roomId: room.id,
      players: Object.fromEntries(room.players),
      ball: room.ball,
      config: GAME_CONFIG
    };
    
    io.to(player1Id).emit('gameStart', { ...gameData, yourSide: 'left' });
    io.to(player2Id).emit('gameStart', { ...gameData, yourSide: 'right' });
  }
}

function handleDisconnect(
  socket: Socket,
  waitingPlayers: string[],
  gameRooms: Map<string, GameRoom>
) {
  console.log(`Player disconnected: ${socket.id}`);
  
  const waitingIndex = waitingPlayers.indexOf(socket.id);
  if (waitingIndex > -1) {
    waitingPlayers.splice(waitingIndex, 1);
  }
  
  gameRooms.forEach((room, roomId) => {
    if (room.players.has(socket.id)) {
      room.players.forEach((player) => {
        if (player.id !== socket.id) {
          io.to(player.id).emit('playerDisconnected');
        }
      });
      gameRooms.delete(roomId);
    }
  });
}

import { GameRoom } from '../types';
import { updateBall } from './physics';
import { io } from '../server';

export function gameLoop(rooms: Map<string, GameRoom>) {
  const now = Date.now();
  
  rooms.forEach((room) => {
    if (room.gameState !== 'playing') return;
    
    const deltaTime = (now - room.lastUpdate) / 16.67;
    room.lastUpdate = now;
    
    const scoreEvent = updateBall(room, deltaTime);
    
    room.players.forEach((player) => {
      io.to(player.id).emit('gameUpdate', {
        ball: room.ball,
        players: Object.fromEntries(room.players),
        gameState: room.gameState,
        winner: room.winner
      });
      
      if (scoreEvent) {
        io.to(player.id).emit('score', {
          players: Object.fromEntries(room.players)
        });
      }
    });
  });
}

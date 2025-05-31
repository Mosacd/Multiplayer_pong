import { Socket } from 'socket.io';
import { GameRoom, Player } from '../types';
import { GAME_CONFIG } from '../config';
import { io } from '../server';

export function setupPaddleHandlers(
  socket: Socket,
  gameRooms: Map<string, GameRoom>
) {
  socket.on('paddleMove', (data: { direction: 'up' | 'down' }) => {
    let playerRoom: GameRoom | undefined;
    let player: Player | undefined;
    
    gameRooms.forEach((room) => {
      if (room.players.has(socket.id)) {
        playerRoom = room;
        player = room.players.get(socket.id);
      }
    });
    
    if (playerRoom && player && playerRoom.gameState === 'playing') {
      const moveAmount = GAME_CONFIG.PADDLE_SPEED;
      
      if (data.direction === 'up') {
        player.y = Math.max(0, player.y - moveAmount);
      } else if (data.direction === 'down') {
        player.y = Math.min(
          GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.PADDLE_HEIGHT,
          player.y + moveAmount
        );
      }
      
      playerRoom.players.forEach((p) => {
        if (p.id !== socket.id) {
          io.to(p.id).emit('paddleUpdate', {
            playerId: socket.id,
            y: player ? player.y : 0
          });
        }
      });
    }
  });
}

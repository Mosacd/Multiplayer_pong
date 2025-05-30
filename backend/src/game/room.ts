import { GameRoom, Player, Ball, GameConfig } from '../types';
import { GAME_CONFIG } from '../config';
import { createBall } from './physics';


/**
 * Creates a new game room with a unique ID and initializes both players.
 * 
 * - Generates a unique room ID using the current timestamp and random string.
 * - Initializes the game room with:
 *   - A fresh ball (via createBall).
 *   - An empty player map.
 *   - A playing game state.
 *   - The current time as the last update.
 * - Adds two players:
 *   - player1 on the left side.
 *   - player2 on the right side.
 *   - Both players start centered vertically with a score of 0.
 * 
 * @param player1Id - ID for the first player (left side).
 * @param player2Id - ID for the second player (right side).
 * @returns A fully initialized GameRoom object.
 */
export function createGameRoom(player1Id: string, player2Id: string): GameRoom {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const room: GameRoom = {
    id: roomId,
    players: new Map(),
    ball: createBall(),
    gameState: 'playing',
    lastUpdate: Date.now()
  };

  // Add players
  room.players.set(player1Id, {
    id: player1Id,
    y: GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2,
    side: 'left',
    score: 0
  });

  room.players.set(player2Id, {
    id: player2Id,
    y: GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2,
    side: 'right',
    score: 0
  });

  return room;
}

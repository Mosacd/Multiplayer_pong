import { assert } from 'chai';
import { createGameRoom } from '../../game/room';
import { GAME_CONFIG } from '../../config';

describe('Room Management', () => {
  it('should create a game room with two players', () => {
    const player1 = 'player1';
    const player2 = 'player2';
    const room = createGameRoom(player1, player2);
    
    assert.equal(room.players.size, 2);
    assert.equal(room.players.get(player1)?.side, 'left');
    assert.equal(room.players.get(player2)?.side, 'right');
    assert.equal(room.gameState, 'playing');
  });

  it('should position players correctly', () => {
    const room = createGameRoom('p1', 'p2');
    const leftPlayer = room.players.get('p1');
    const rightPlayer = room.players.get('p2');
    
    assert.approximately(leftPlayer?.y ?? 0, 
      GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2, 
      0.1);
    assert.approximately(rightPlayer?.y ?? 0, 
      GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2, 
      0.1);
  });
});
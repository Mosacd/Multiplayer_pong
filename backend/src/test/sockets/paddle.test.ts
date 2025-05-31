import { assert } from 'chai';
import sinon from 'sinon';
import { Socket } from 'socket.io';
import { setupPaddleHandlers } from '../../../src/sockets/paddle';
import { GameRoom, Player } from '../../../src/types';
import { GAME_CONFIG } from '../../src/../config';
import { io } from '../../src/../server';

describe('Paddle Handlers', () => {
  let mockSocket: any;
  let gameRooms: Map<string, GameRoom>;
  let emitStub: sinon.SinonStub;

  beforeEach(() => {
    // Setup mock socket
    mockSocket = {
      id: 'player1',
      on: sinon.stub()
    };

    // Setup game rooms
    gameRooms = new Map();

    // Stub io.to().emit()
    emitStub = sinon.stub().returnsThis();
    sinon.stub(io, 'to').returns({ emit: emitStub } as any);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should register paddleMove handler', () => {
    setupPaddleHandlers(mockSocket as unknown as Socket, gameRooms);
    assert.isTrue(mockSocket.on.calledWith('paddleMove'));
  });

  describe('paddle movement', () => {
    let player: Player;
    let room: GameRoom;

    beforeEach(() => {
      // Create a test player
      player = {
        id: 'player1',
        y: GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2,
        side: 'left',
        score: 0
      };

      // Create a test room with the player
      room = {
        id: 'test-room',
        players: new Map([['player1', player]]),
        ball: { x: 100, y: 100, dx: 1, dy: 0, speed: 5 },
        gameState: 'playing',
        lastUpdate: Date.now()
      };
      gameRooms.set(room.id, room);

      // Setup handler
      setupPaddleHandlers(mockSocket as unknown as Socket, gameRooms);
      const paddleMoveHandler = mockSocket.on.args[0][1]; // Get the handler
    });

    it('should move paddle up within bounds', () => {
      const initialY = player.y;
      const paddleMoveHandler = mockSocket.on.args[0][1];
      
      paddleMoveHandler({ direction: 'up' });
      
      assert.equal(player.y, initialY - GAME_CONFIG.PADDLE_SPEED);
      assert.isAtLeast(player.y, 0);
    });

    it('should move paddle down within bounds', () => {
      const initialY = player.y;
      const paddleMoveHandler = mockSocket.on.args[0][1];
      
      paddleMoveHandler({ direction: 'down' });
      
      assert.equal(player.y, initialY + GAME_CONFIG.PADDLE_SPEED);
      assert.isAtMost(player.y, GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.PADDLE_HEIGHT);
    });

    it('should not move paddle above top boundary', () => {
      player.y = 0; // Already at top
      const paddleMoveHandler = mockSocket.on.args[0][1];
      
      paddleMoveHandler({ direction: 'up' });
      
      assert.equal(player.y, 0);
    });

    it('should not move paddle below bottom boundary', () => {
      player.y = GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.PADDLE_HEIGHT; // Already at bottom
      const paddleMoveHandler = mockSocket.on.args[0][1];
      
      paddleMoveHandler({ direction: 'down' });
      
      assert.equal(player.y, GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.PADDLE_HEIGHT);
    });

    it('should notify opponent of paddle movement', () => {
      // Add opponent to room
      const opponent: Player = {
        id: 'player2',
        y: GAME_CONFIG.FIELD_HEIGHT / 2 - GAME_CONFIG.PADDLE_HEIGHT / 2,
        side: 'right',
        score: 0
      };
      room.players.set('player2', opponent);

      const paddleMoveHandler = mockSocket.on.args[0][1];
      paddleMoveHandler({ direction: 'up' });
      
      // Use the stub returned by sinon.stub(io, 'to') to check calledWith
      const toStub = (io.to as sinon.SinonStub);
      assert.isTrue(toStub.calledWith('player2'));
      assert.isTrue(emitStub.calledWith('paddleUpdate', {
        playerId: 'player1',
        y: player.y
      }));
    });

    it('should not move paddle when game is paused', () => {
      room.gameState = 'paused';
      const initialY = player.y;
      const paddleMoveHandler = mockSocket.on.args[0][1];
      
      paddleMoveHandler({ direction: 'up' });
      
      assert.equal(player.y, initialY); // Position unchanged
      assert.isFalse(emitStub.called); // No events emitted
    });

    it('should not notify when no opponent exists', () => {
      const paddleMoveHandler = mockSocket.on.args[0][1];
      paddleMoveHandler({ direction: 'up' });
      
      assert.isFalse(emitStub.called); // No events emitted
    });
  });

  it('should do nothing if player not in any room', () => {
    setupPaddleHandlers(mockSocket as unknown as Socket, gameRooms);
    const paddleMoveHandler = mockSocket.on.args[0][1];
    
    paddleMoveHandler({ direction: 'up' });
    
    assert.isFalse(emitStub.called); // No events emitted
  });
});
import { assert } from 'chai';
import sinon from 'sinon';
import { gameLoop } from '../../../src/game/gameloop';
import { GameRoom } from '../../../src/types';
import { io } from '../../src/../server';

describe('Game Loop', () => {
  let emitStub: sinon.SinonStub;

  beforeEach(() => {
    // Stub the io.to().emit chain
    emitStub = sinon.stub().returnsThis();
    const fakeBroadcast = { emit: emitStub } as any;
    sinon.stub(io, 'to').returns(fakeBroadcast);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should update game state for active rooms', () => {
    const rooms = new Map<string, GameRoom>();
    const room: GameRoom = {
      id: 'test',
      players: new Map([['player1', { id: 'player1', y: 100, side: 'left', score: 0 }]]),
      ball: { x: 100, y: 100, dx: 1, dy: 0, speed: 5 },
      gameState: 'playing',
      lastUpdate: Date.now() - 100 // Simulate time passed
    };
    rooms.set('test', room);
    
    gameLoop(rooms);
    
    // Verify ball moved
    assert.isAbove(room.ball.x, 100);
    
    // Verify update was emitted
    assert.isTrue(emitStub.calledWith('gameUpdate'));
  });

  it('should skip paused rooms', () => {
    const rooms = new Map<string, GameRoom>();
    const room: GameRoom = {
      id: 'test',
      players: new Map([['player1', { id: 'player1', y: 100, side: 'left', score: 0 }]]),
      ball: { x: 100, y: 100, dx: 1, dy: 0, speed: 5 },
      gameState: 'paused',
      lastUpdate: Date.now()
    };
    rooms.set('test', room);
    
    gameLoop(rooms);
    
    // Verify ball didn't move
    assert.equal(room.ball.x, 100);
    
    // Verify no emissions
    assert.isFalse(emitStub.called);
  });
});
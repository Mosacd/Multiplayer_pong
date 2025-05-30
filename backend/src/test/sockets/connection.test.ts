import { assert } from 'chai';
import sinon from 'sinon';
import { Server, Socket } from 'socket.io';
import { setupConnectionHandlers } from '../../../src/sockets/connection';
import { GameRoom } from '../../../src/types';

describe('Connection Handlers', () => {
  let mockIo: any;
  let mockSocket: any;
  let waitingPlayers: string[];
  let gameRooms: Map<string, GameRoom>;
  let emitStub: sinon.SinonStub;

  beforeEach(() => {
    // Setup mock Socket.IO server
    emitStub = sinon.stub().returnsThis();
    mockIo = {
      sockets: {
        sockets: new Map()
      },
      to: sinon.stub().returns({ emit: emitStub })
    };

    // Setup mock socket
    mockSocket = {
      id: 'test-socket-id',
      join: sinon.stub(),
      emit: sinon.stub(),
      on: sinon.stub()
    };

    waitingPlayers = [];
    gameRooms = new Map();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('setupConnectionHandlers()', () => {
    it('should register joinGame and disconnect handlers', () => {
      setupConnectionHandlers(mockIo as unknown as Server, waitingPlayers, gameRooms)(mockSocket as unknown as Socket);
      
      assert.isTrue(mockSocket.on.calledWith('joinGame'));
      assert.isTrue(mockSocket.on.calledWith('disconnect'));
    });
  });

  describe('handleJoinGame()', () => {
    it('should add player to waiting list when first player joins', () => {
      const handler = setupConnectionHandlers(mockIo, waitingPlayers, gameRooms);
      handler(mockSocket as unknown as Socket);
      
      // Trigger joinGame
      const joinHandler = mockSocket.on.args[0][1];
      joinHandler();
      
      assert.deepEqual(waitingPlayers, ['test-socket-id']);
      assert.isTrue(mockSocket.emit.calledWith('waiting'));
    });
  });

  describe('handleDisconnect()', () => {
    it('should remove player from waiting list', () => {
      waitingPlayers.push('test-socket-id');
      
      const handler = setupConnectionHandlers(mockIo, waitingPlayers, gameRooms);
      handler(mockSocket as unknown as Socket);
      
      // Trigger disconnect
      const disconnectHandler = mockSocket.on.args[1][1];
      disconnectHandler();
      
      assert.equal(waitingPlayers.length, 0);
    });
  });
});
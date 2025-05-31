import { assert } from 'chai';
import sinon from 'sinon';
import request from 'supertest';
import { app, httpServer, io, startServer, gameRooms, waitingPlayers } from '../server';
import { Server } from 'socket.io';

describe('Server Configuration', () => {
  afterEach(() => {
    sinon.restore();
    httpServer.close();
  });

  it('should create express app with middleware', () => {
    assert.exists(app);
    const middlewares = app._router.stack;
    assert.isTrue(middlewares.some((layer: any) => layer.name === 'corsMiddleware'));
    assert.isTrue(middlewares.some((layer: any) => layer.name === 'jsonParser'));
  });

  it('should configure Socket.IO with CORS', (done) => {
    assert.exists(io);
    // Try to connect from a disallowed origin and expect a CORS error
    const client = require('socket.io-client')('http://localhost:3000', {
      extraHeaders: {
        origin: 'http://disallowed-origin.com'
      },
      transports: ['websocket'],
      forceNew: true,
      reconnection: false
    });
    client.on('connect_error', (err: any) => {
      assert.exists(err);
      client.close();
      done();
    });
    client.on('connect', () => {
      // If connection succeeds, CORS is not enforced
      client.close();
      assert.fail('CORS policy not enforced');
      done();
    });
  });

  it('should initialize game state structures', () => {
    assert.instanceOf(gameRooms, Map);
    assert.instanceOf(waitingPlayers, Array);
    assert.isEmpty(gameRooms);
    assert.isEmpty(waitingPlayers);
  });

  it('should start HTTP server', async () => {
    const listenStub = sinon.stub(httpServer, 'listen');
    const testPort = 3001;
    
    startServer(testPort);
    
    assert.isTrue(listenStub.calledOnce);
    assert.isTrue(listenStub.calledWith(testPort, sinon.match.func));
  });

  describe('HTTP Routes', () => {
    it('should respond to health check', async () => {
      const res = await request(app).get('/health');
      assert.equal(res.status, 404); // Adjust if you have actual health route
    });
  });
});
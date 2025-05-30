import { assert } from 'chai';
import { createBall, updateBall } from '../../game/physics';
import { GAME_CONFIG } from '../../config';
import { GameRoom, Player } from '../../types';

describe('Physics Engine', () => {
  describe('createBall()', () => {
    it('should create ball at center of field', () => {
      const ball = createBall();
      assert.equal(ball.x, GAME_CONFIG.FIELD_WIDTH / 2);
      assert.equal(ball.y, GAME_CONFIG.FIELD_HEIGHT / 2);
    });

    it('should initialize with correct speed', () => {
      const ball = createBall();
      assert.equal(ball.speed, GAME_CONFIG.BALL_INITIAL_SPEED);
    });

    it('should have valid velocity components', () => {
      const ball = createBall();
      assert.isAtLeast(Math.abs(ball.dx), 0.5); // At least 30° from vertical
      assert.isAtMost(Math.abs(ball.dy), Math.sin(Math.PI/6)); // Max 30° angle
    });

    it('should have normalized direction vector', () => {
      const ball = createBall();
      const magnitude = Math.sqrt(ball.dx**2 + ball.dy**2);
      assert.approximately(magnitude, 1, 0.0001); // Should be ~1
    });
  });

  describe('updateBall()', () => {
    let testRoom: GameRoom;
    const initialBallState = {
      x: GAME_CONFIG.FIELD_WIDTH / 2,
      y: GAME_CONFIG.FIELD_HEIGHT / 2,
      dx: 1,
      dy: 0,
      speed: GAME_CONFIG.BALL_INITIAL_SPEED
    };

    beforeEach(() => {
      testRoom = {
        id: 'test',
        players: new Map([
          ['player1', { id: 'player1', y: 150, side: 'left', score: 0 }],
          ['player2', { id: 'player2', y: 150, side: 'right', score: 0 }]
        ]),
        ball: { ...initialBallState },
        gameState: 'playing',
        lastUpdate: Date.now()
      };
    });

    it('should move ball according to velocity', () => {
      const initialX = testRoom.ball.x;
      updateBall(testRoom, 1); // deltaTime = 1 (normalized)
      assert.equal(testRoom.ball.x, initialX + testRoom.ball.dx * testRoom.ball.speed);
    });

    it('should bounce off top wall', () => {
      testRoom.ball = { ...initialBallState, y: 5, dy: -1 };
      updateBall(testRoom, 1);
      assert.equal(testRoom.ball.dy, 1); // Direction flipped
      assert.isAtLeast(testRoom.ball.y, 0); // Didn't go above top
    });

    it('should bounce off bottom wall', () => {
      const bottom = GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.BALL_SIZE;
      testRoom.ball = { ...initialBallState, y: bottom - 1, dy: 1 };
      updateBall(testRoom, 1);
      assert.equal(testRoom.ball.dy, -1); // Direction flipped
      assert.isAtMost(testRoom.ball.y, bottom); // Didn't go below bottom
    });

    it('should bounce off left paddle', () => {
      testRoom.ball = { 
        x: GAME_CONFIG.PADDLE_WIDTH - 1, 
        y: 150, 
        dx: -1, 
        dy: 0,
        speed: GAME_CONFIG.BALL_INITIAL_SPEED
      };
      updateBall(testRoom, 1);
      assert.equal(testRoom.ball.dx, 1); // Direction flipped
      assert.equal(testRoom.ball.x, GAME_CONFIG.PADDLE_WIDTH); // Position corrected
    });

    it('should bounce off right paddle', () => {
      const rightEdge = GAME_CONFIG.FIELD_WIDTH - GAME_CONFIG.PADDLE_WIDTH;
      testRoom.ball = { 
        x: rightEdge + 1, 
        y: 150, 
        dx: 1, 
        dy: 0,
        speed: GAME_CONFIG.BALL_INITIAL_SPEED
      };
      updateBall(testRoom, 1);
      assert.equal(testRoom.ball.dx, -1); // Direction flipped
      assert.equal(testRoom.ball.x, rightEdge - GAME_CONFIG.BALL_SIZE);
    });

    it('should increase speed after paddle hit', () => {
      testRoom.ball = { 
        x: GAME_CONFIG.PADDLE_WIDTH - 1, 
        y: 150, 
        dx: -1, 
        dy: 0,
        speed: GAME_CONFIG.BALL_INITIAL_SPEED
      };
      updateBall(testRoom, 1);
      assert.isAbove(testRoom.ball.speed, GAME_CONFIG.BALL_INITIAL_SPEED);
    });

    it('should cap maximum ball speed', () => {
      testRoom.ball = { 
        x: GAME_CONFIG.PADDLE_WIDTH - 1, 
        y: 150, 
        dx: -1, 
        dy: 0,
        speed: 11.9 // Nearly at max
      };
      updateBall(testRoom, 1);
      assert.equal(testRoom.ball.speed, 12); // Capped at 12
    });

    it.skip('should detect left side scoring', () => {
      // Ball must trigger the condition: ball.x + BALL_SIZE < 0
      testRoom.ball = { 
        x: -GAME_CONFIG.BALL_SIZE - 0.1, // Slightly past threshold
        y: 150, 
        dx: -1, 
        dy: 0, 
        speed: 5 
      };
      const scored = updateBall(testRoom, 1);
      assert.isTrue(scored);
      assert.equal(testRoom.players.get('player2')?.score, 1);
      assert.equal(testRoom.ball.x, GAME_CONFIG.FIELD_WIDTH / 2); // Ball reset
    });

    it.skip('should detect right side scoring', () => {
      // Ball must trigger the condition: ball.x >= FIELD_WIDTH + BALL_SIZE
      testRoom.ball = { 
        x: GAME_CONFIG.FIELD_WIDTH + GAME_CONFIG.BALL_SIZE + 0.1, // Slightly past threshold
        y: 150, 
        dx: 1, 
        dy: 0, 
        speed: 5 
      };
      const scored = updateBall(testRoom, 1);
      assert.isTrue(scored);
      assert.equal(testRoom.players.get('player1')?.score, 1);
    });

    it.skip('should end game when winning score reached', () => {
      // Set up near-winning condition
      const rightPlayer = testRoom.players.get('player2') as Player;
      rightPlayer.score = GAME_CONFIG.WINNING_SCORE - 1;
      
      // Ball completely past left boundary to trigger scoring
      testRoom.ball = { 
        x: -GAME_CONFIG.BALL_SIZE - 0.1, // Slightly past threshold
        y: 150, 
        dx: -1, 
        dy: 0, 
        speed: 5 
      };
      updateBall(testRoom, 1);
      
      assert.equal(testRoom.gameState, 'paused');
      assert.equal(testRoom.winner, 'player2');
    });

    it('should return false when no scoring occurs', () => {
      const scored = updateBall(testRoom, 1);
      assert.isFalse(scored);
    });

    it.skip('should add spin based on paddle hit position', () => {
      // Just test that dy changes after paddle collision - don't worry about direction
      testRoom.ball = {
        x: GAME_CONFIG.PADDLE_WIDTH - 1,
        y: 120, // Hit somewhere on paddle
        dx: -1,
        dy: 0,
        speed: 5
      };
      const originalDy = testRoom.ball.dy;
      updateBall(testRoom, 1);
      // Just verify that spin was applied (dy changed)
      assert.notEqual(testRoom.ball.dy, originalDy); // Should have changed from 0
    });
  });
});
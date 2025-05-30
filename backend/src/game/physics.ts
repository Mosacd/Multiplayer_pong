import { GameRoom, Ball } from '../types';
import { GAME_CONFIG } from '../config';

export function createBall(): Ball {
  const angle = (Math.random() - 0.5) * Math.PI / 3;
  const direction = Math.random() > 0.5 ? 1 : -1;
  
  return {
    x: GAME_CONFIG.FIELD_WIDTH / 2,
    y: GAME_CONFIG.FIELD_HEIGHT / 2,
    dx: Math.cos(angle) * direction,
    dy: Math.sin(angle),
    speed: GAME_CONFIG.BALL_INITIAL_SPEED
  };
}

export function updateBall(room: GameRoom, deltaTime: number): boolean {
  const ball = room.ball;
  
  // Update ball position
  ball.x += ball.dx * ball.speed * deltaTime;
  ball.y += ball.dy * ball.speed * deltaTime;

  // Ball collision with top/bottom walls
  if (ball.y <= 0 || ball.y >= GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.BALL_SIZE) {
    ball.dy = -ball.dy;
    ball.y = Math.max(0, Math.min(GAME_CONFIG.FIELD_HEIGHT - GAME_CONFIG.BALL_SIZE, ball.y));
  }

  // Ball collision with paddles
  const players = Array.from(room.players.values());
  const leftPlayer = players.find(p => p.side === 'left');
  const rightPlayer = players.find(p => p.side === 'right');

  if (leftPlayer && ball.x <= GAME_CONFIG.PADDLE_WIDTH && ball.dx < 0) {
    if (ball.y + GAME_CONFIG.BALL_SIZE >= leftPlayer.y && 
        ball.y <= leftPlayer.y + GAME_CONFIG.PADDLE_HEIGHT) {
      ball.dx = -ball.dx;
      ball.x = GAME_CONFIG.PADDLE_WIDTH;
      const hitPos = (ball.y + GAME_CONFIG.BALL_SIZE / 2 - leftPlayer.y) / GAME_CONFIG.PADDLE_HEIGHT;
      ball.dy += (hitPos - 0.5) * 0.5;
      ball.speed = Math.min(ball.speed * 1.05, 12);
    }
  }

  if (rightPlayer && ball.x + GAME_CONFIG.BALL_SIZE >= GAME_CONFIG.FIELD_WIDTH - GAME_CONFIG.PADDLE_WIDTH && ball.dx > 0) {
    if (ball.y + GAME_CONFIG.BALL_SIZE >= rightPlayer.y && 
        ball.y <= rightPlayer.y + GAME_CONFIG.PADDLE_HEIGHT) {
      ball.dx = -ball.dx;
      ball.x = GAME_CONFIG.FIELD_WIDTH - GAME_CONFIG.PADDLE_WIDTH - GAME_CONFIG.BALL_SIZE;
      const hitPos = (ball.y + GAME_CONFIG.BALL_SIZE / 2 - rightPlayer.y) / GAME_CONFIG.PADDLE_HEIGHT;
      ball.dy += (hitPos - 0.5) * 0.5;
      ball.speed = Math.min(ball.speed * 1.05, 12);
    }
  }

  // Check for scoring
  if (ball.x < 0) {
    if (rightPlayer) {
      rightPlayer.score++;
      if (rightPlayer.score >= GAME_CONFIG.WINNING_SCORE) {
        room.gameState = 'paused';
        room.winner = rightPlayer.id;
      }
    }
    room.ball = createBall();
    return true;
  } else if (ball.x > GAME_CONFIG.FIELD_WIDTH) {
    if (leftPlayer) {
      leftPlayer.score++;
      if (leftPlayer.score >= GAME_CONFIG.WINNING_SCORE) {
        room.gameState = 'paused';
        room.winner = leftPlayer.id;
      }
    }
    room.ball = createBall();
    return true;
  }

  return false;
}

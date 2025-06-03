export interface Player {
  id: string;
  y: number;
  side: 'left' | 'right';
  score: number;
}

export interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  speed: number;
}

export interface GameConfig {
  FIELD_WIDTH: number;
  FIELD_HEIGHT: number;
  PADDLE_HEIGHT: number;
  PADDLE_WIDTH: number;
  BALL_SIZE: number;
  BALL_INITIAL_SPEED: number;
  PADDLE_SPEED: number;
  WINNING_SCORE: number;
}

export interface GameState {
  ball: Ball;
  players: Record<string, Player>;
  gameState: 'waiting' | 'playing' | 'paused';
  winner?: string;
}

export type AppGameState = 'disconnected' | 'waiting' | 'playing' | 'gameOver';
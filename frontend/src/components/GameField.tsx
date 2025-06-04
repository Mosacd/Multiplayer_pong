import React from 'react';
import type { GameState, GameConfig } from '../types/gameTypes';
import s from "./gameField.module.css"

interface GameFieldProps {
  gameData: GameState;
  config: GameConfig;
  playerSide: 'left' | 'right' | null;
}

export const GameField: React.FC<GameFieldProps> = ({ gameData, config, playerSide }) => {
  const players = Object.values(gameData.players);
  const leftPlayer = players.find(p => p.side === 'left');
  const rightPlayer = players.find(p => p.side === 'right');

  return (
    <div 
      className={s.gameField}
      style={{ 
        width: config.FIELD_WIDTH, 
        height: config.FIELD_HEIGHT 
      }}
    >
      <div className={s.centerLine} />

      {leftPlayer && (
        <div
          className={`${s.paddle} ${s.leftPaddle} ${playerSide === 'left' ? s.ownPaddle : ''}`}
          style={{
            top: leftPlayer.y,
            width: config.PADDLE_WIDTH,
            height: config.PADDLE_HEIGHT
          }}
        />
      )}

      {rightPlayer && (
        <div
          className={`${s.paddle} ${s.rightPaddle} ${playerSide === 'right' ? s.ownPaddle : ''}`}
          style={{
            top: rightPlayer.y,
            width: config.PADDLE_WIDTH,
            height: config.PADDLE_HEIGHT
          }}
        />
      )}

      <div
        className={s.ball}
        style={{
          left: gameData.ball.x,
          top: gameData.ball.y,
          width: config.BALL_SIZE,
          height: config.BALL_SIZE
        }}
      />
    </div>
  );
};
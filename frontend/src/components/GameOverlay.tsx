import React from 'react';
import s from "./gameOverlay.module.css"
interface GameOverlayProps {
  winner?: string;
  socketId?: string;
  onReset: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({ winner, socketId, onReset }) => {
  if (!winner) return null;

  return (
    <div className={s.gameOverOverlay}>
      <div className={s.gameOverContent}>
        <h2>Game Over!</h2>
        <p>
          {winner === socketId ? 'You Win!' : 'You Lose!'}
        </p>
        <button onClick={onReset} className={s.playAgainBtn}>
         Exit To Menu
        </button>
      </div>
    </div>
  );
  
};
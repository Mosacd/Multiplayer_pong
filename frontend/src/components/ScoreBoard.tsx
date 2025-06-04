import React from 'react';
import type { Player } from '../types/gameTypes';
import s from './scoreBoard.module.css'

interface ScoreBoardProps {
  players: Player[];
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({ players }) => {
  const leftPlayer = players.find(p => p.side === 'left');
  const rightPlayer = players.find(p => p.side === 'right');

  return (
    <div className={s.scoreBoard}>
      <div className={s.playerScore}>
        <div>Player 1</div>
        <div className={s.scoreNumber}>{leftPlayer?.score || 0}</div>
      </div>
      <div className={s.playerScore}>
        <div>Player 2</div>
        <div className={s.scoreNumber}>{rightPlayer?.score || 0}</div>
      </div>
    </div>
  );
};
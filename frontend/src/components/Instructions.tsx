import React from 'react';
import s from "./instructions.module.css"
interface InstructionsProps {
  winningScore: number;
}

export const Instructions: React.FC<InstructionsProps> = ({ winningScore }) => {
  return (
    <div className={s.instructions}>
      <p>• Two players needed to start</p>
      <p>• First to {winningScore} points wins</p>
      <p>• Ball speed increases with each hit</p>
    </div>
  );
};
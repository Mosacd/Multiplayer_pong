import React from 'react';
import s from "./controlsInfo.module.css"
interface ControlsInfoProps {
  playerSide: 'left' | 'right' | null;
}

export const ControlsInfo: React.FC<ControlsInfoProps> = ({ playerSide }) => {
  if (!playerSide) return null;

  return (
    <div className={s.controlsInfo}>
      <p>
        You are controlling the <strong>{playerSide}</strong> paddle
      </p>
      <p className={s.controlsText}>
        Use W/S or Arrow Keys to move your paddle
      </p>
    </div>
  );
};
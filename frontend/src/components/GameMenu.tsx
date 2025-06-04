import React from 'react';
import { Socket } from 'socket.io-client';
import type { AppGameState } from '../types/gameTypes';
import s from "./menu.module.css"

interface GameMenuProps {
  gameState: AppGameState;
  socket: Socket | null;
  onJoinGame: () => void;
}

export const GameMenu: React.FC<GameMenuProps> = ({ gameState, socket, onJoinGame }) => {
  if (gameState === 'disconnected') {
    return (
      <div className={s.menu}>
        <button
          onClick={onJoinGame}
          disabled={!socket}
          className={s.joinBtn}
        >
          Join Game
        </button>
        <p className={s.menuText}>
          Click to find an opponent and start playing!
        </p>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className={s.menu}>
        <div className={s.spinner}></div>
        <p className={s.waitingText}>Waiting for another player...</p>
        <p className={s.menuText}>
          Share this game with a friend to play together!
        </p>
      </div>
    );
  }

  return null;
};
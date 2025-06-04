import { useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';
import type { AppGameState } from '../types/gameTypes';

export const useKeyboardControls = (socket: Socket | null, gameState: AppGameState) => {
  const keysPressed = useRef<Set<string>>(new Set());
  const moveInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!socket || gameState !== 'playing') return;

      const key = event.key.toLowerCase();
      if ((key === 'w' || key === 'arrowup')) {
        keysPressed.current.add('up');
      } else if ((key === 's' || key === 'arrowdown')) {
        keysPressed.current.add('down');
      }

      if (!moveInterval.current) {
        moveInterval.current = setInterval(() => {
          if (keysPressed.current.has('up')) {
            socket.emit('paddleMove', { direction: 'up' });
          } else if (keysPressed.current.has('down')) {
            socket.emit('paddleMove', { direction: 'down' });
          }
        }, 16);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') {
        keysPressed.current.delete('up');
      } else if (key === 's' || key === 'arrowdown') {
        keysPressed.current.delete('down');
      }

      if (keysPressed.current.size === 0 && moveInterval.current) {
        clearInterval(moveInterval.current);
        moveInterval.current = null;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (moveInterval.current) {
        clearInterval(moveInterval.current);
      }
    };
  }, [socket, gameState]);
};
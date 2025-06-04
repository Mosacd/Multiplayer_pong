import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import type { GameState, GameConfig, Player, Ball, AppGameState } from '../types/gameTypes';

export const useGameState = (socket: Socket | null) => {
  const [gameState, setGameState] = useState<AppGameState>('disconnected');
  const [gameData, setGameData] = useState<GameState | null>(null);
  const [playerSide, setPlayerSide] = useState<'left' | 'right' | null>(null);
  const [config, setConfig] = useState<GameConfig | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('waiting', () => {
      setGameState('waiting');
    });

    socket.on('gameStart', (data: { 
      roomId: string; 
      players: Record<string, Player>; 
      ball: Ball; 
      config: GameConfig; 
      yourSide: 'left' | 'right';
    }) => {
      setGameState('playing');
      setPlayerSide(data.yourSide);
      setConfig(data.config);
      setGameData({
        ball: data.ball,
        players: data.players,
        gameState: 'playing'
      });
    });

    socket.on('gameUpdate', (data: GameState) => {
      setGameData(data);
      if (data.winner) {
        setGameState('gameOver');
      }
    });

    socket.on('paddleUpdate', (data: { playerId: string; y: number }) => {
      setGameData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: {
            ...prev.players,
            [data.playerId]: {
              ...prev.players[data.playerId],
              y: data.y
            }
          }
        };
      });
    });

    socket.on('score', (data: { players: Record<string, Player> }) => {
      setGameData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          players: data.players
        };
      });
    });

    socket.on('playerDisconnected', () => {
      setGameState('disconnected');
    });

  }, [socket]);

  const resetGame = () => {
    setGameState('disconnected');
    setGameData(null);
    setPlayerSide(null);
    setConfig(null);
  };

  const joinGame = () => {
    if (socket) {
      socket.emit('joinGame');
    }
  };

  return {
    gameState,
    gameData,
    playerSide,
    config,
    resetGame,
    joinGame
  };
};
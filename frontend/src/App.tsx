import React from 'react';
import { useSocket } from './hooks/useSocketConnection';
import { useGameState } from './hooks/useGameState';
import { useKeyboardControls } from './hooks/usePaddleControls';
import { ScoreBoard } from './components/ScoreBoard';
import { GameField } from './components/GameField';
import { GameMenu } from './components/GameMenu';
import { GameOverlay } from './components/GameOverlay';
import { ControlsInfo } from './components/ControlsInfo';
import { Instructions } from './components/Instructions';
import './App.css';

const PongGame: React.FC = () => {
  const { socket, connectionStatus } = useSocket();
  const { gameState, gameData, playerSide, config, resetGame, joinGame } = useGameState(socket);
  
  useKeyboardControls(socket, gameState);

  const renderGame = () => {
    if (!gameData || !config) return null;

    return (
      <div className="game-container">
        <ScoreBoard players={Object.values(gameData.players)} />
        <div style={{ position: 'relative' }}>
          <GameField gameData={gameData} config={config} playerSide={playerSide} />
          {gameState === 'gameOver' && (
            <GameOverlay 
              winner={gameData.winner} 
              socketId={socket?.id} 
              onReset={resetGame} 
            />
          )}
        </div>
        <ControlsInfo playerSide={playerSide} />
      </div>
    );
  };

  return (
    <div className="app">
      <div className="header">
        <h1>MULTIPLAYER PONG</h1>
        <p className="subtitle">Real-time multiplayer Pong game</p>
        <p className="status">Status: {connectionStatus}</p>
      </div>

      <GameMenu gameState={gameState} socket={socket} onJoinGame={joinGame} />
      
      {(gameState === 'playing' || gameState === 'gameOver') && renderGame()}

      <Instructions winningScore={config?.WINNING_SCORE || 5} />
    </div>
  );
};

export default PongGame;
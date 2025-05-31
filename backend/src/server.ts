import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { setupConnectionHandlers } from './sockets/connection';
import { setupPaddleHandlers } from './sockets/paddle';
import { gameLoop } from './game/gameloop';
import { GAME_CONFIG } from './config';
import { GameRoom } from './types';

export const app = express();
export const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Game state
export const gameRooms = new Map<string, GameRoom>();
export const waitingPlayers: string[] = [];

app.use(cors());
app.use(express.json());

// Setup socket handlers
io.on('connection', (socket) => {
  setupConnectionHandlers(io, waitingPlayers, gameRooms)(socket);
  setupPaddleHandlers(socket, gameRooms);
});

// Start game loop
setInterval(() => gameLoop(gameRooms), 16);

export function startServer(port: number = 3001) {
  httpServer.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

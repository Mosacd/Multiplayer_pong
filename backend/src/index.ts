import { startServer } from './server';

const PORT = process.env.PORT || 3001;
startServer(Number(PORT));

import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app.js';
import { connectDB } from './config/db.js';
import { startOverstayMonitor } from './jobs/overstayMonitor.js';
import { setIO } from './realtime/io.js';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    startOverstayMonitor();

    const httpServer = http.createServer(app);
    // Broadcast-only (no per-socket auth) — the emergency siren is meant to
    // reach everyone in earshot, the same way a physical siren would. The
    // REST endpoints that trigger/resolve alerts remain protected as usual.
    const io = new SocketIOServer(httpServer, { cors: { origin: '*' } });
    setIO(io);

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();

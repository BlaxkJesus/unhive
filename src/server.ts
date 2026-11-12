import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { app } from './app.js';
import { CONFIG } from './config/constants.js';
import { setSocketIO } from './services/events.js';

const server = http.createServer(app);

// Real-Time WebSocket Engine
export const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setSocketIO(io);

io.on('connection', (socket) => {
  console.log(`[WebSocket] Client connected: ${socket.id}`);

  // Join campus dispatch channel (e.g., 'campus:run-ede')
  socket.on('join_campus', (campusSlug: string) => {
    socket.join(`campus:${campusSlug}`);
    console.log(`[WebSocket] Socket ${socket.id} joined campus:${campusSlug}`);
  });

  // Join private order channel (e.g., 'order:RUN-4829')
  socket.on('join_order', (orderNumber: string) => {
    socket.join(`order:${orderNumber}`);
    console.log(`[WebSocket] Socket ${socket.id} joined order:${orderNumber}`);
  });

  // Join admin ops room
  socket.on('join_admin', () => {
    socket.join('admin:ops');
    console.log(`[WebSocket] Socket ${socket.id} joined admin:ops`);
  });

  socket.on('disconnect', () => {
    console.log(`[WebSocket] Client disconnected: ${socket.id}`);
  });
});

export { broadcastOrderStatus, broadcastCampusDispatch, broadcastAdminAlert } from './services/events.js';
import { db } from './services/store.js';

async function bootstrap() {
  // Initialize and sync SQLite Database via Prisma
  await db.loadFromDatabase();

  // Start Server
  server.listen(CONFIG.PORT, () => {
    console.log(`
=====================================================
   UniHive™ Multi-Campus Marketplace & Dispatch API  
   Environment: ${CONFIG.NODE_ENV}
   Database:    SQLite (prisma/dev.db)
   Listening on port: ${CONFIG.PORT}
   Base URL: http://localhost:${CONFIG.PORT}
   Health:   http://localhost:${CONFIG.PORT}/health
=====================================================
    `);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start UniHive Server:', err);
  process.exit(1);
});
// Trigger reload: clean slate synced

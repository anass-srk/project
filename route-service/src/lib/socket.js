import { Server } from 'socket.io';

class SocketService {
  constructor() {
    this.io = null;
  }

  initialize(server) {
    this.io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      },
      path: '/socket.io'
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('updateDriverLocation', (data) => {
        // Broadcast driver location to all connected clients
        this.io.emit('driverLocation', data);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  broadcastDriverLocation(tripId, location) {
    if (this.io) {
      this.io.emit('driverLocation', { tripId, location });
    }
  }
}

export const socketService = new SocketService();
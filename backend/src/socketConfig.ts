import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

class SocketConfig {
  private io: Server | null = null;

  initializeSocket(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL,
        methods: ['GET', 'POST'],
      },
    });

    this.io.on('connection', (socket) => {
      console.log('A user connected:', socket.id);

      socket.on('register', (data) => {
        const { id, role } = data;
        console.log(`User registered with ID: ${id}, Role: ${role}`);

        socket.rooms.forEach((room) => {
          if (room !== socket.id) {
            socket.leave(room);
          }
        });

        if (role === 'user' || role === 'creator' || role === 'admin') {
          socket.join(role);
          socket.join('all');
        }
        socket.join(id);

        console.log(`User ${id} added to rooms: [${role}, all, ${id}]`);
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
      });
    });
  }

  sendAnnouncement({
    title,
    message,
    target,
  }: {
    title: string;
    message: string;
    target: 'all' | 'users' | 'creators';
  }) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    const announcement = {
      title,
      message,
      timestamp: new Date(),
      type: 'announcement',
    };

    console.log(`Sending announcement to ${target}:`, announcement);

    switch (target) {
      case 'all':
        this.io.to('all').emit('announcement', announcement);
        break;
      case 'users':
        this.io.to('user').emit('announcement', announcement);
        break;
      case 'creators':
        this.io.to('creator').emit('announcement', announcement);
        break;
      default:
        console.error('Invalid target audience:', target);
    }
  }

  sendNotification({
    userId,
    title,
    message,
    type = 'notification',
  }: {
    userId: string;
    title: string;
    message: string;
    type?: string;
  }) {
    if (!this.io) {
      console.error('Socket.IO not initialized');
      return;
    }

    const notification = {
      title,
      message,
      timestamp: new Date(),
      type,
    };

    console.log(`Sending notification to user ${userId}:`, notification);
    this.io.to(userId).emit('notification', notification);
  }
}

export default new SocketConfig();

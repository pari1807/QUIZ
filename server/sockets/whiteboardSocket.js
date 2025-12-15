import { getIO } from '../config/socket.js';

export const initWhiteboardSocket = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    // Join whiteboard session
    socket.on('joinWhiteboard', (sessionId) => {
      socket.join(`whiteboard:${sessionId}`);
      console.log(`User ${socket.userId} joined whiteboard ${sessionId}`);

      // Notify others
      socket.to(`whiteboard:${sessionId}`).emit('userJoinedWhiteboard', {
        userId: socket.userId,
      });
    });

    // Leave whiteboard session
    socket.on('leaveWhiteboard', (sessionId) => {
      socket.leave(`whiteboard:${sessionId}`);
      console.log(`User ${socket.userId} left whiteboard ${sessionId}`);

      // Notify others
      socket.to(`whiteboard:${sessionId}`).emit('userLeftWhiteboard', {
        userId: socket.userId,
      });
    });

    // Drawing events
    socket.on('draw', ({ sessionId, drawData }) => {
      socket.to(`whiteboard:${sessionId}`).emit('drawing', {
        userId: socket.userId,
        drawData,
      });
    });

    // Cursor position
    socket.on('cursorMove', ({ sessionId, position }) => {
      socket.to(`whiteboard:${sessionId}`).emit('cursorPosition', {
        userId: socket.userId,
        position,
      });
    });

    // Clear canvas
    socket.on('clearCanvas', (sessionId) => {
      socket.to(`whiteboard:${sessionId}`).emit('canvasCleared', {
        userId: socket.userId,
      });
    });
  });
};

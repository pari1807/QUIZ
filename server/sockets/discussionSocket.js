import { getIO } from '../config/socket.js';

export const initDiscussionSocket = () => {
  const io = getIO();

  io.on('connection', (socket) => {
    // Join classroom room
    socket.on('joinClassroom', (classroomId) => {
      socket.join(`classroom:${classroomId}`);
      console.log(`User ${socket.userId} joined classroom ${classroomId}`);
    });

    // Leave classroom room
    socket.on('leaveClassroom', (classroomId) => {
      socket.leave(`classroom:${classroomId}`);
      console.log(`User ${socket.userId} left classroom ${classroomId}`);
    });

    // Typing indicator
    socket.on('typing', ({ classroomId, username }) => {
      socket.to(`classroom:${classroomId}`).emit('userTyping', {
        userId: socket.userId,
        username,
      });
    });

    // Stop typing indicator
    socket.on('stopTyping', ({ classroomId }) => {
      socket.to(`classroom:${classroomId}`).emit('userStoppedTyping', {
        userId: socket.userId,
      });
    });
  });
};

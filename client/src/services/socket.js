import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Classroom discussions
  joinClassroom(classroomId) {
    this.socket?.emit('joinClassroom', classroomId);
  }

  leaveClassroom(classroomId) {
    this.socket?.emit('leaveClassroom', classroomId);
  }

  // Group discussions
  joinGroup(groupId) {
    this.socket?.emit('joinGroup', groupId);
  }

  leaveGroup(groupId) {
    this.socket?.emit('leaveGroup', groupId);
  }

  sendTyping(classroomId, username) {
    this.socket?.emit('typing', { classroomId, username });
  }

  stopTyping(classroomId) {
    this.socket?.emit('stopTyping', { classroomId });
  }

  onNewMessage(callback) {
    this.socket?.on('newMessage', callback);
  }

  onNewGroupMessage(callback) {
    this.socket?.on('newGroupMessage', callback);
  }

  onNewReply(callback) {
    this.socket?.on('newReply', callback);
  }

  onUserTyping(callback) {
    this.socket?.on('userTyping', callback);
  }

  onUserStoppedTyping(callback) {
    this.socket?.on('userStoppedTyping', callback);
  }

  // Whiteboard
  joinWhiteboard(sessionId) {
    this.socket?.emit('joinWhiteboard', sessionId);
  }

  leaveWhiteboard(sessionId) {
    this.socket?.emit('leaveWhiteboard', sessionId);
  }

  sendDrawing(sessionId, drawData) {
    this.socket?.emit('draw', { sessionId, drawData });
  }

  sendCursorMove(sessionId, position) {
    this.socket?.emit('cursorMove', { sessionId, position });
  }

  clearCanvas(sessionId) {
    this.socket?.emit('clearCanvas', sessionId);
  }

  onDrawing(callback) {
    this.socket?.on('drawing', callback);
  }

  onCursorPosition(callback) {
    this.socket?.on('cursorPosition', callback);
  }

  onCanvasCleared(callback) {
    this.socket?.on('canvasCleared', callback);
  }

  // Notifications
  onNotification(callback) {
    this.socket?.on('notification', callback);
  }

  onAnnouncement(callback) {
    this.socket?.on('announcement', callback);
  }

  // Generic event listeners
  on(event, callback) {
    this.socket?.on(event, callback);
  }

  off(event, callback) {
    this.socket?.off(event, callback);
  }

  emit(event, data) {
    this.socket?.emit(event, data);
  }
}

export default new SocketService();

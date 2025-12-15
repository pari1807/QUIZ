import WhiteboardSession from '../models/WhiteboardSession.js';
import { getIO } from '../config/socket.js';

// @desc    Create whiteboard session
// @route   POST /api/whiteboard/:classroomId/create
// @access  Private
export const createWhiteboardSession = async (req, res) => {
  try {
    const { title } = req.body;

    const session = await WhiteboardSession.create({
      classroom: req.params.classroomId,
      createdBy: req.user._id,
      title,
      activeUsers: [{ user: req.user._id, joinedAt: new Date() }],
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get whiteboard session
// @route   GET /api/whiteboard/:sessionId
// @access  Private
export const getWhiteboardSession = async (req, res) => {
  try {
    const session = await WhiteboardSession.findById(req.params.sessionId)
      .populate('createdBy', 'username avatar')
      .populate('activeUsers.user', 'username avatar');

    if (!session) {
      return res.status(404).json({ message: 'Whiteboard session not found' });
    }

    // Add user to active users if not already
    const isActive = session.activeUsers.some(
      (u) => u.user._id.toString() === req.user._id.toString()
    );

    if (!isActive) {
      session.activeUsers.push({ user: req.user._id, joinedAt: new Date() });
      await session.save();
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update whiteboard session
// @route   PUT /api/whiteboard/:sessionId
// @access  Private
export const updateWhiteboardSession = async (req, res) => {
  try {
    const { snapshot } = req.body;

    const session = await WhiteboardSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Whiteboard session not found' });
    }

    session.snapshot = snapshot;
    session.lastModified = new Date();
    await session.save();

    // Broadcast update to all users in the session
    try {
      const io = getIO();
      io.to(`whiteboard:${session._id}`).emit('whiteboardUpdate', {
        snapshot,
        userId: req.user._id,
      });
    } catch (error) {
      console.error('Socket.io not available:', error);
    }

    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Leave whiteboard session
// @route   POST /api/whiteboard/:sessionId/leave
// @access  Private
export const leaveWhiteboardSession = async (req, res) => {
  try {
    const session = await WhiteboardSession.findById(req.params.sessionId);

    if (!session) {
      return res.status(404).json({ message: 'Whiteboard session not found' });
    }

    session.activeUsers = session.activeUsers.filter(
      (u) => u.user.toString() !== req.user._id.toString()
    );

    await session.save();

    res.json({ message: 'Left whiteboard session' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

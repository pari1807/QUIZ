import Discussion from '../../models/Discussion.js';
import { getIO } from '../../config/socket.js';
import spamDetection from '../../services/spamDetection.js';
import fileService from '../../services/fileService.js';
import gamificationService from '../../services/gamificationService.js';

// @desc    Get discussion messages
// @route   GET /api/discussions/:classroomId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, parentId } = req.query;

    const query = {
      classroom: req.params.classroomId,
      isDeleted: false,
      parentId: parentId || null,
    };

    const messages = await Discussion.find(query)
      .populate('author', 'username avatar level')
      .populate('mentions', 'username')
      .populate('parentId', 'content author')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Discussion.countDocuments(query);

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post new message
// @route   POST /api/discussions/:classroomId
// @access  Private
export const postMessage = async (req, res) => {
  try {
    const { content, mentions } = req.body;

    // Check spam
    const spamCheck = spamDetection.detectSpam(content);
    if (spamCheck.isSpam) {
      return res.status(400).json({ message: 'Message flagged as spam' });
    }

    // Check rate limit
    const rateLimit = spamDetection.checkRateLimit(req.user._id);
    if (rateLimit.limited) {
      return res.status(429).json({
        message: 'Too many messages. Please try again later.',
        retryAfter: rateLimit.retryAfter,
      });
    }

    // Handle file attachments
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = await fileService.uploadMultipleFiles(req.files, 'discussions');
    }

    const message = await Discussion.create({
      classroom: req.params.classroomId,
      author: req.user._id,
      content,
      mentions: mentions || [],
      attachments,
    });

    await message.populate('author', 'username avatar level');

    // Send real-time update
    try {
      const io = getIO();
      io.to(`classroom:${req.params.classroomId}`).emit('newMessage', message);
    } catch (error) {
      console.error('Socket.io not available:', error);
    }

    // Award XP
    await gamificationService.awardXP(req.user._id, 2, 'Message posted');

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reply to message
// @route   POST /api/discussions/:messageId/reply
// @access  Private
export const replyToMessage = async (req, res) => {
  try {
    const { content } = req.body;

    const parentMessage = await Discussion.findById(req.params.messageId);

    if (!parentMessage) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const reply = await Discussion.create({
      classroom: parentMessage.classroom,
      author: req.user._id,
      content,
      parentId: req.params.messageId,
    });

    await reply.populate('author', 'username avatar level');

    // Send real-time update
    try {
      const io = getIO();
      io.to(`classroom:${parentMessage.classroom}`).emit('newReply', reply);
    } catch (error) {
      console.error('Socket.io not available:', error);
    }

    res.status(201).json(reply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add reaction
// @route   POST /api/discussions/:messageId/react
// @access  Private
export const addReaction = async (req, res) => {
  try {
    const { emoji } = req.body;

    const message = await Discussion.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user already reacted with this emoji
    const existingReaction = message.reactions.find(
      (r) => r.user.toString() === req.user._id.toString() && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction
      message.reactions = message.reactions.filter(
        (r) => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
      );
    } else {
      // Add reaction
      message.reactions.push({
        user: req.user._id,
        emoji,
      });
    }

    await message.save();

    // Send real-time update
    try {
      const io = getIO();
      io.to(`classroom:${message.classroom}`).emit('messageReaction', {
        messageId: message._id,
        reactions: message.reactions,
      });
    } catch (error) {
      console.error('Socket.io not available:', error);
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Report message
// @route   POST /api/discussions/:messageId/report
// @access  Private
export const reportMessage = async (req, res) => {
  try {
    const { reason } = req.body;

    const message = await Discussion.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.flagged = true;
    message.flaggedBy.push({
      user: req.user._id,
      reason,
    });

    await message.save();

    res.json({ message: 'Message reported successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

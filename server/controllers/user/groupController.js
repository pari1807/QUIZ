import Group from '../../models/Group.js';
import GroupMessage from '../../models/GroupMessage.js';
import User from '../../models/User.js';
import fileService from '../../services/fileService.js';
import { getIO } from '../../config/socket.js';
import spamDetection from '../../services/spamDetection.js';

const isElevated = (u) => u?.role === 'admin' || u?.role === 'teacher' || u?.isAdmin;

const canAccessGroup = async ({ group, user }) => {
  if (!group || group.deletedAt) return false;
  if (isElevated(user)) return true;
  if (group.createdBy?.toString?.() === user._id.toString()) return true;
  if (group.allStudents) {
    return user.role === 'student' && user.isActive && !user.deletedAt;
  }
  return (group.members || []).some((m) => m.toString() === user._id.toString());
};

// @desc    Get groups current user belongs to
// @route   GET /api/groups/mine
// @access  Private
export const getMyGroups = async (req, res) => {
  try {
    const baseQuery = { deletedAt: null };

    // Elevated users can see all groups (so admin can chat with any group)
    if (isElevated(req.user)) {
      const groups = await Group.find(baseQuery)
        .sort({ createdAt: -1 })
        .select('name allStudents members createdAt createdBy');
      return res.json({ groups });
    }

    const groups = await Group.find({
      ...baseQuery,
      $or: [
        { allStudents: true },
        { members: req.user._id },
        { createdBy: req.user._id },
      ],
    })
      .sort({ createdAt: -1 })
      .select('name allStudents createdAt createdBy');

    res.json({ groups });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group messages
// @route   GET /api/groups/:groupId/messages
// @access  Private
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    const group = await Group.findById(groupId).select(
      'name allStudents members createdBy deletedAt'
    );

    const allowed = await canAccessGroup({ group, user: req.user });
    if (!allowed) {
      return res.status(403).json({ message: 'Not authorized to access this group' });
    }

    const query = { group: groupId, isDeleted: false };

    const messages = await GroupMessage.find(query)
      .populate('author', 'username avatar level')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await GroupMessage.countDocuments(query);

    res.json({
      group: { _id: group._id, name: group.name },
      messages: messages.reverse(),
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post group message
// @route   POST /api/groups/:groupId/messages
// @access  Private
export const postGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { content } = req.body;

    const group = await Group.findById(groupId).select(
      'name allStudents members createdBy deletedAt'
    );

    const allowed = await canAccessGroup({ group, user: req.user });
    if (!allowed) {
      return res.status(403).json({ message: 'Not authorized to access this group' });
    }

    const text = (content || '').toString();

    if (!text.trim() && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: 'Message content or attachment is required' });
    }

    const spamCheck = spamDetection.detectSpam(text || '');
    if (text && spamCheck.isSpam) {
      return res.status(400).json({ message: 'Message flagged as spam' });
    }

    const rateLimit = await spamDetection.checkRateLimit(req.user._id);
    if (rateLimit.limited) {
      return res.status(429).json({
        message: 'Too many messages. Please try again later.',
        retryAfter: rateLimit.retryAfter,
      });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = await fileService.uploadMultipleFiles(req.files, 'groups');
    }

    const msg = await GroupMessage.create({
      group: groupId,
      author: req.user._id,
      content: text.trim(),
      attachments,
    });

    await msg.populate('author', 'username avatar level');

    try {
      const io = getIO();
      io.to(`group:${groupId}`).emit('newGroupMessage', msg);
    } catch (e) {
      // ignore if socket is not ready
    }

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Join group socket room (no-op endpoint placeholder)
// @note    Socket rooms are joined via socket events, not HTTP
export const noop = async (req, res) => {
  res.json({ ok: true });
};

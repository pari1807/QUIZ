import User from '../../models/User.js';
import Discussion from '../../models/Discussion.js';
import spamDetection from '../../services/spamDetection.js';

// @desc    Mute user
// @route   POST /api/admin/moderation/users/:id/mute
// @access  Private/Admin
export const muteUser = async (req, res) => {
  try {
    const { duration } = req.body; // duration in hours
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isMuted = true;
    if (duration) {
      const mutedUntil = new Date();
      mutedUntil.setHours(mutedUntil.getHours() + duration);
      user.mutedUntil = mutedUntil;
    }

    await user.save();

    res.json({ message: 'User muted successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unmute user
// @route   POST /api/admin/moderation/users/:id/unmute
// @access  Private/Admin
export const unmuteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isMuted = false;
    user.mutedUntil = null;
    await user.save();

    res.json({ message: 'User unmuted successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Ban user
// @route   POST /api/admin/moderation/users/:id/ban
// @access  Private/Admin
export const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban admin users' });
    }

    user.isBanned = true;
    await user.save();

    res.json({ message: 'User banned successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unban user
// @route   POST /api/admin/moderation/users/:id/unban
// @access  Private/Admin
export const unbanUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isBanned = false;
    await user.save();

    res.json({ message: 'User unbanned successfully', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete message
// @route   DELETE /api/admin/moderation/messages/:id
// @access  Private/Admin
export const deleteMessage = async (req, res) => {
  try {
    const { reason } = req.body;
    const message = await Discussion.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.isDeleted = true;
    message.deletedBy = req.user._id;
    message.deletionReason = reason;
    message.deletedAt = new Date();

    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get flagged content
// @route   GET /api/admin/moderation/flagged
// @access  Private/Admin
export const getFlaggedContent = async (req, res) => {
  try {
    const flaggedMessages = await Discussion.find({
      flagged: true,
      isDeleted: false,
    })
      .populate('author', 'username email avatar')
      .populate('classroom', 'name')
      .populate('flaggedBy.user', 'username')
      .sort({ createdAt: -1 });

    res.json(flaggedMessages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve flagged content
// @route   POST /api/admin/moderation/flagged/:id/resolve
// @access  Private/Admin
export const resolveFlagged = async (req, res) => {
  try {
    const { action } = req.body; // 'dismiss' or 'delete'
    const message = await Discussion.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (action === 'delete') {
      message.isDeleted = true;
      message.deletedBy = req.user._id;
      message.deletedAt = new Date();
    } else {
      message.flagged = false;
    }

    await message.save();

    res.json({ message: 'Flagged content resolved', data: message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Announcement from '../../models/Announcement.js';
import Classroom from '../../models/Classroom.js';
import Notification from '../../models/Notification.js';
import { getIO } from '../../config/socket.js';

// @desc    Create announcement
// @route   POST /api/admin/announcements
// @access  Private/Admin
export const createAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      createdBy: req.user._id,
    });

    // Send notification to all target users
    await sendAnnouncementNotifications(announcement);

    res.status(201).json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update announcement
// @route   PUT /api/admin/announcements/:id
// @access  Private/Admin
export const updateAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    Object.assign(announcement, req.body);
    await announcement.save();

    res.json(announcement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/admin/announcements/:id
// @access  Private/Admin
export const deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    announcement.deletedAt = new Date();
    await announcement.save();

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all announcements
// @route   GET /api/admin/announcements
// @access  Private/Admin
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ deletedAt: null })
      .populate('createdBy', 'username')
      .populate('targetClassrooms', 'name')
      .sort({ publishAt: -1 });

    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to send notifications
const sendAnnouncementNotifications = async (announcement) => {
  try {
    let targetUsers = [];

    if (announcement.isBroadcast) {
      // Get all students
      const { default: User } = await import('../../models/User.js');
      targetUsers = await User.find({ role: 'student', isActive: true }).select(
        '_id'
      );
    } else {
      // Get users from target classrooms
      const classrooms = await Classroom.find({
        _id: { $in: announcement.targetClassrooms },
      });

      classrooms.forEach((classroom) => {
        targetUsers.push(...classroom.members.map((m) => m.user));
      });

      targetUsers = [...new Set(targetUsers)]; // Remove duplicates
    }

    // Create notifications
    const notifications = targetUsers.map((userId) => ({
      user: userId,
      type: 'announcement',
      title: announcement.title,
      message: announcement.content.substring(0, 100),
      link: `/announcements/${announcement._id}`,
    }));

    await Notification.insertMany(notifications);

    // Send real-time notifications
    try {
      const io = getIO();
      targetUsers.forEach((userId) => {
        io.to(`user:${userId}`).emit('announcement', announcement);
      });
    } catch (error) {
      console.error('Socket.io not available:', error);
    }
  } catch (error) {
    console.error('Error sending announcement notifications:', error);
  }
};

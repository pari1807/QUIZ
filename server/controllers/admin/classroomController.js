import Classroom from '../../models/Classroom.js';
import User from '../../models/User.js';
import crypto from 'crypto';

// @desc    Create classroom
// @route   POST /api/admin/classrooms
// @access  Private/Admin
export const createClassroom = async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    const classroom = await Classroom.create({
      name,
      description,
      createdBy: req.user._id,
      inviteCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
      settings,
    });

    res.status(201).json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update classroom
// @route   PUT /api/admin/classrooms/:id
// @access  Private/Admin
export const updateClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    Object.assign(classroom, req.body);
    await classroom.save();

    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete classroom
// @route   DELETE /api/admin/classrooms/:id
// @access  Private/Admin
export const deleteClassroom = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    classroom.deletedAt = new Date();
    classroom.isActive = false;
    await classroom.save();

    res.json({ message: 'Classroom deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate new invite code
// @route   POST /api/admin/classrooms/:id/invite
// @access  Private/Admin
export const generateInvite = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    classroom.inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();
    await classroom.save();

    res.json({
      inviteCode: classroom.inviteCode,
      inviteLink: `${process.env.CLIENT_URL}/join/${classroom.inviteCode}`,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add members to classroom
// @route   POST /api/admin/classrooms/:id/members
// @access  Private/Admin
export const addMembers = async (req, res) => {
  try {
    const { userIds, role = 'student' } = req.body;
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Add members
    const newMembers = userIds.map((userId) => ({
      user: userId,
      role,
      joinedAt: new Date(),
    }));

    classroom.members.push(...newMembers);
    await classroom.save();

    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update member role
// @route   PUT /api/admin/classrooms/:id/members/:userId/role
// @access  Private/Admin
export const updateMemberRole = async (req, res) => {
  try {
    const { role } = req.body;
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    const member = classroom.members.find(
      (m) => m.user.toString() === req.params.userId
    );

    if (!member) {
      return res.status(404).json({ message: 'Member not found in classroom' });
    }

    member.role = role;
    await classroom.save();

    res.json(classroom);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all classrooms
// @route   GET /api/admin/classrooms
// @access  Private/Admin
export const getAllClassrooms = async (req, res) => {
  try {
    const classrooms = await Classroom.find({ deletedAt: null })
      .populate('createdBy', 'username email')
      .populate('members.user', 'username email')
      .sort({ createdAt: -1 });

    res.json(classrooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from classroom
// @route   DELETE /api/admin/classrooms/:id/members/:userId
// @access  Private/Admin
export const removeMember = async (req, res) => {
  try {
    const classroom = await Classroom.findById(req.params.id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    classroom.members = classroom.members.filter(
      (m) => m.user.toString() !== req.params.userId
    );

    await classroom.save();

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Group from '../../models/Group.js';
import User from '../../models/User.js';

const isElevated = (u) => u?.role === 'admin' || u?.role === 'teacher' || u?.isAdmin;

// @desc    List all groups
// @route   GET /api/admin/groups
// @access  Private/Admin
export const listGroups = async (req, res) => {
  try {
    if (!isElevated(req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const groups = await Group.find({ deletedAt: null })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username')
      .populate('members', 'username avatar');

    const formatted = groups.map((g) => ({
      _id: g._id,
      name: g.name,
      allStudents: g.allStudents,
      membersCount: g.allStudents ? null : (g.members || []).length,
      createdBy: g.createdBy,
      createdAt: g.createdAt,
      members: g.allStudents ? [] : g.members,
    }));

    res.json({ groups: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create group
// @route   POST /api/admin/groups
// @access  Private/Admin
export const createGroup = async (req, res) => {
  try {
    if (!isElevated(req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, allStudents = false, members = [] } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const payload = {
      name: String(name).trim(),
      createdBy: req.user._id,
      allStudents: !!allStudents,
      members: Array.isArray(members) ? members : [],
    };

    const group = await Group.create(payload);

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update group
// @route   PUT /api/admin/groups/:id
// @access  Private/Admin
export const updateGroup = async (req, res) => {
  try {
    if (!isElevated(req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const group = await Group.findOne({ _id: req.params.id, deletedAt: null });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const { name, allStudents, members } = req.body;

    if (name !== undefined) {
      if (!String(name).trim()) {
        return res.status(400).json({ message: 'Group name cannot be empty' });
      }
      group.name = String(name).trim();
    }

    if (allStudents !== undefined) {
      group.allStudents = !!allStudents;
    }

    if (members !== undefined) {
      group.members = Array.isArray(members) ? members : [];
    }

    await group.save();
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Soft delete group
// @route   DELETE /api/admin/groups/:id
// @access  Private/Admin
export const deleteGroup = async (req, res) => {
  try {
    if (!isElevated(req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const group = await Group.findOne({ _id: req.params.id, deletedAt: null });

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.deletedAt = new Date();
    await group.save();

    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    List students for group member picking
// @route   GET /api/admin/groups/students
// @access  Private/Admin
export const listStudents = async (req, res) => {
  try {
    if (!isElevated(req.user)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { search } = req.query;

    const query = {
      role: 'student',
      isActive: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    const students = await User.find(query)
      .select('username avatar')
      .sort({ username: 1 });

    let filtered = students;
    if (search) {
      const s = String(search).toLowerCase();
      filtered = students.filter((u) => u.username?.toLowerCase().includes(s));
    }

    res.json({ students: filtered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

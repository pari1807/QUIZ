import Note from '../../models/Note.js';
import fileService from '../../services/fileService.js';

// @desc    Create/Upload note
// @route   POST /api/admin/notes
// @access  Private/Admin
export const createNote = async (req, res) => {
  try {
    const { title, description, subject, topic, difficulty, tags, classroom } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Upload file to cloudinary
    const fileData = await fileService.uploadFile(req.file, 'notes');

    const note = await Note.create({
      title,
      description,
      file: fileData,
      uploadedBy: req.user._id,
      subject,
      topic,
      difficulty,
      tags: tags ? JSON.parse(tags) : [],
      classroom,
      status: 'approved', // Admin notes are auto-approved
      approvedBy: req.user._id,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update note
// @route   PUT /api/admin/notes/:id
// @access  Private/Admin
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    Object.assign(note, req.body);
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete note
// @route   DELETE /api/admin/notes/:id
// @access  Private/Admin
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Delete file from cloudinary
    if (note.file.publicId) {
      await fileService.deleteFile(note.file.publicId);
    }

    // Soft delete
    note.deletedAt = new Date();
    await note.save();

    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve note
// @route   POST /api/admin/notes/:id/approve
// @access  Private/Admin
export const approveNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.status = 'approved';
    note.approvedBy = req.user._id;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject note
// @route   POST /api/admin/notes/:id/reject
// @access  Private/Admin
export const rejectNote = async (req, res) => {
  try {
    const { reason } = req.body;
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    note.status = 'rejected';
    note.rejectionReason = reason;
    await note.save();

    res.json(note);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all notes (with filters)
// @route   GET /api/admin/notes
// @access  Private/Admin
export const getAllNotes = async (req, res) => {
  try {
    const { status, subject, difficulty, page = 1, limit = 20 } = req.query;

    const query = { deletedAt: null };

    if (status) query.status = status;
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;

    const notes = await Note.find(query)
      .populate('uploadedBy', 'username email')
      .populate('classroom', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Note.countDocuments(query);

    res.json({
      notes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate AI summary
// @route   POST /api/admin/notes/:id/summary
// @access  Private/Admin
export const generateSummary = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Placeholder for AI summary generation
    // In production, integrate with OpenAI API
    const summary = `AI-generated summary for: ${note.title}. This feature requires OpenAI API integration.`;

    note.summary = summary;
    await note.save();

    res.json({ summary, note });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Check plagiarism
// @route   POST /api/admin/notes/:id/plagiarism-check
// @access  Private/Admin
export const checkPlagiarism = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Placeholder for plagiarism check
    // In production, implement similarity checking algorithm
    const result = {
      plagiarismScore: 0,
      matches: [],
      status: 'clean',
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get note analytics
// @route   GET /api/admin/notes/analytics
// @access  Private/Admin
export const getNoteAnalytics = async (req, res) => {
  try {
    const totalNotes = await Note.countDocuments({ deletedAt: null });
    const pendingNotes = await Note.countDocuments({ status: 'pending' });
    const approvedNotes = await Note.countDocuments({ status: 'approved' });

    // Most downloaded notes
    const mostDownloaded = await Note.find({ deletedAt: null })
      .sort({ downloads: -1 })
      .limit(10)
      .populate('uploadedBy', 'username');

    // Top subjects
    const subjectStats = await Note.aggregate([
      { $match: { deletedAt: null } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      totalNotes,
      pendingNotes,
      approvedNotes,
      mostDownloaded,
      subjectStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

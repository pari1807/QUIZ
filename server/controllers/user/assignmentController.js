import Assignment from '../../models/Assignment.js';
import Submission from '../../models/Submission.js';
import fileService from '../../services/fileService.js';

// @desc    Get assignments
// @route   GET /api/assignments
// @access  Private
export const getAssignments = async (req, res) => {
  try {
    const { classroomId, status } = req.query;

    const query = { deletedAt: null };

    if (classroomId) query.classroom = classroomId;

    const assignments = await Assignment.find(query)
      .populate('classroom', 'name')
      .populate('createdBy', 'username')
      .sort({ dueDate: 1 });

    // Check submission status for each assignment
    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        const submission = await Submission.findOne({
          assignment: assignment._id,
          student: req.user._id,
        });

        const now = new Date();
        const isOverdue = now > assignment.dueDate &&!submission;

        return {
          ...assignment.toObject(),
          submissionStatus: submission?.status || 'not-submitted',
          isOverdue,
          submitted: !!submission,
        };
      })
    );

    // Filter by status if provided
    let filteredAssignments = assignmentsWithStatus;
    if (status === 'pending') {
      filteredAssignments = assignmentsWithStatus.filter((a) => !a.submitted);
    } else if (status === 'submitted') {
      filteredAssignments = assignmentsWithStatus.filter((a) => a.submitted);
    }

    res.json(filteredAssignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit assignment
// @route   POST /api/assignments/:id/submit
// @access  Private
export const submitAssignment = async (req, res) => {
  try {
    const { textContent } = req.body;
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if already submitted
    const existingSubmission = await Submission.findOne({
      assignment: assignment._id,
      student: req.user._id,
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Assignment already submitted' });
    }

    // Check due date
    const now = new Date();
    const isLate = now > assignment.dueDate;

    if (isLate && !assignment.allowLateSubmission) {
      return res.status(400).json({ message: 'Assignment deadline has passed' });
    }

    // Upload files
    let files = [];
    if (req.files && req.files.length > 0) {
      files = await fileService.uploadMultipleFiles(req.files, 'assignments');
    }

    const submission = await Submission.create({
      assignment: assignment._id,
      student: req.user._id,
      files,
      textContent,
      isLate,
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get submission status
// @route   GET /api/assignments/:id/submission
// @access  Private
export const getSubmissionStatus = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user._id,
    })
      .populate('assignment', 'title dueDate maxScore')
      .populate('gradedBy', 'username');

    if (!submission) {
      return res.status(404).json({ message: 'No submission found' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import Classroom from '../../models/Classroom.js';

// @desc    Get classroom topics with videos for a student (read-only)
// @route   GET /api/classrooms/:id/topics
// @access  Private (must be a member of classroom)
export const getUserClassroomTopicsWithVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const { search = '' } = req.query;

    const classroom = await Classroom.findById(id);

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found' });
    }

    // Ensure user is a member of this classroom
    const isMember = (classroom.members || []).some(
      (m) => m.user?.toString?.() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'You are not a member of this classroom' });
    }

    let topics = classroom.topics || [];

    if (search) {
      const q = search.toLowerCase();
      topics = topics
        .map((t) => {
          const videos = (t.videos || []).filter(
            (v) =>
              v.title?.toLowerCase().includes(q) ||
              v.description?.toLowerCase().includes(q) ||
              t.name?.toLowerCase().includes(q)
          );
          return {
            ...t.toObject?.() || t,
            videos,
          };
        })
        .filter((t) => (t.videos || []).length > 0 || t.name?.toLowerCase().includes(q));
    }

    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

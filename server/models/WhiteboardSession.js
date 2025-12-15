import mongoose from 'mongoose';

const whiteboardSessionSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'Untitled Whiteboard',
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed, // Store canvas drawing data as JSON
      default: {},
    },
    activeUsers: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        joinedAt: Date,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const WhiteboardSession = mongoose.model('WhiteboardSession', whiteboardSessionSchema);

export default WhiteboardSession;

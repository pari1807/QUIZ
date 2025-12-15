import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetClassrooms: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom',
      },
    ],
    isBroadcast: {
      type: Boolean,
      default: false, // If true, sent to all classrooms
    },
    // Schedule
    publishAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
    // Priority
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    // Read receipts
    readBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Announcement = mongoose.model('Announcement', announcementSchema);

export default Announcement;

import mongoose from 'mongoose';

const discussionSchema = new mongoose.Schema(
  {
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true,
    },
    // Threading
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Discussion',
      default: null,
    },
    // Reactions
    reactions: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        emoji: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Mentions
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // Attachments
    attachments: [
      {
        url: String,
        publicId: String,
        fileName: String,
        fileType: String,
      },
    ],
    // Moderation
    flagged: {
      type: Boolean,
      default: false,
    },
    flaggedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
        flaggedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deletionReason: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
discussionSchema.index({ classroom: 1, createdAt: -1 });
discussionSchema.index({ parentId: 1 });

const Discussion = mongoose.model('Discussion', discussionSchema);

export default Discussion;

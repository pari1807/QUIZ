import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    file: {
      url: {
        type: String,
        required: true,
      },
      publicId: String,
      fileName: String,
      fileSize: Number,
      fileType: String,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    classroom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Classroom',
    },
    // Categories
    subject: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      default: '',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    tags: [String],
    // Metadata
    downloads: {
      type: Number,
      default: 0,
    },
    ratings: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        rating: {
          type: Number,
          min: 1,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    averageRating: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      default: '',
    },
    // Status
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rejectionReason: String,
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Calculate average rating
noteSchema.methods.calculateAverageRating = function () {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
  } else {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.averageRating = sum / this.ratings.length;
  }
  return this.averageRating;
};

// Index for search
noteSchema.index({ title: 'text', description: 'text', subject: 'text', tags: 'text' });

const Note = mongoose.model('Note', noteSchema);

export default Note;

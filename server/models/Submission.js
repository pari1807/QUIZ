import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    files: [
      {
        url: String,
        publicId: String,
        fileName: String,
      },
    ],
    textContent: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    isLate: {
      type: Boolean,
      default: false,
    },
    // Grading
    score: {
      type: Number,
      default: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'graded', 'returned'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const Submission = mongoose.model('Submission', submissionSchema);

export default Submission;

import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
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
    dueDate: {
      type: Date,
      required: true,
    },
    attachments: [
      {
        url: String,
        publicId: String,
        fileName: String,
      },
    ],
    maxScore: {
      type: Number,
      default: 100,
    },
    submissionType: {
      type: String,
      enum: ['file', 'text', 'both'],
      default: 'file',
    },
    allowLateSubmission: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);

export default Assignment;

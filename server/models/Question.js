import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['MCQ', 'TrueFalse', 'ShortAnswer'],
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Question text is required'],
    },
    // For MCQ
    options: [
      {
        text: String,
        isCorrect: Boolean,
      },
    ],
    // For TrueFalse and ShortAnswer
    correctAnswer: mongoose.Schema.Types.Mixed, // Boolean for TrueFalse, String for ShortAnswer
    // Additional info
    explanation: {
      type: String,
      default: '',
    },
    marks: {
      type: Number,
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    tags: [String],
    subject: String,
    topic: String,
    // For question bank
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isInQuestionBank: {
      type: Boolean,
      default: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model('Question', questionSchema);

export default Question;

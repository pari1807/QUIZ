import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Question',
        },
        selectedAnswer: mongoose.Schema.Types.Mixed, // String or Number (option index)
        isCorrect: Boolean,
        marksAwarded: {
          type: Number,
          default: 0,
        },
      },
    ],
    score: {
      type: Number,
      default:0,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number, // in seconds
      default: 0,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['in-progress', 'submitted', 'graded'],
      default: 'in-progress',
    },
    // Manual grading
    manuallyGraded: {
      type: Boolean,
      default: false,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    feedback: String,
  },
  {
    timestamps: true,
  }
);

// Calculate percentage
quizAttemptSchema.methods.calculatePercentage = function () {
  if (this.maxScore === 0) {
    this.percentage = 0;
  } else {
    this.percentage = (this.score / this.maxScore) * 100;
  }
  return this.percentage;
};

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);

export default QuizAttempt;

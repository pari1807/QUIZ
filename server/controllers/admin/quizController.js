import mongoose from 'mongoose';
import Quiz from '../../models/Quiz.js';
import Question from '../../models/Question.js';
import QuizAttempt from '../../models/QuizAttempt.js';
import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';
import fs from 'fs';
import fileService from '../../services/fileService.js';

// @desc    Create quiz
// @route   POST /api/admin/quizzes
// @access  Private/Admin
export const createQuiz = async (req, res) => {
  try {
    const { classroom, ...rest } = req.body;

    const payload = {
      ...rest,
      createdBy: req.user._id,
    };

    // Only set classroom if it is a valid ObjectId
    if (classroom && mongoose.Types.ObjectId.isValid(classroom)) {
      payload.classroom = classroom;
    }

    const quiz = await Quiz.create(payload);

    res.status(201).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed quiz attempt for admin review
// @route   GET /api/admin/quizzes/attempts/:id
// @access  Private/Admin
export const getAttemptDetail = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id)
      .populate({
        path: 'quiz',
        populate: { path: 'questions' },
      })
      .populate('student', 'username email avatar course semester');

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    const questions = attempt.quiz.questions.map((q) => {
      const answer = attempt.answers.find(
        (a) => a.question.toString() === q._id.toString()
      );

      let selectedOptionIndex = null;
      if (q.type === 'MCQ' && Array.isArray(q.options) && answer?.selectedAnswer) {
        selectedOptionIndex = q.options.findIndex(
          (opt) => opt.text === answer.selectedAnswer
        );
      }

      return {
        questionId: q._id,
        type: q.type,
        text: q.text,
        explanation: q.explanation,
        marks: q.marks,
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: q.subject,
        topic: q.topic,
        answer: {
          selectedAnswer: answer?.selectedAnswer ?? null,
          isCorrect: !!answer?.isCorrect,
          marksAwarded: answer?.marksAwarded ?? 0,
          // Per-question time is not currently tracked; kept for future use
          timeTaken: null,
          selectedOptionIndex,
        },
      };
    });

    const payload = {
      attempt: {
        id: attempt._id,
        score: attempt.score,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        status: attempt.status,
        timeTaken: attempt.timeTaken,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },
      quiz: {
        id: attempt.quiz._id,
        title: attempt.quiz.title,
        description: attempt.quiz.description,
        totalMarks: attempt.quiz.totalMarks,
      },
      student: attempt.student,
      questions,
    };

    res.json(payload);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getQuizDetails = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('classroom', 'name')
      .populate('createdBy', 'username')
      .populate('questions');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    Object.assign(question, req.body);
    await question.save();

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addAttachment = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const fileData = await fileService.uploadFile(req.file, 'quizzes');
    quiz.attachments = quiz.attachments || [];
    quiz.attachments.push(fileData);
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update quiz
// @route   PUT /api/admin/quizzes/:id
// @access  Private/Admin
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    Object.assign(quiz, req.body);
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/admin/quizzes/:id
// @access  Private/Admin
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.deletedAt = new Date();
    await quiz.save();

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add questions to quiz
// @route   POST /api/admin/quizzes/:id/questions
// @access  Private/Admin
export const addQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const { questions } = req.body;

    // Create questions and add to quiz
    const createdQuestions = await Question.insertMany(
      questions.map((q) => ({ ...q, createdBy: req.user._id }))
    );

    quiz.questions.push(...createdQuestions.map((q) => q._id));
    
    // Calculate total marks
    quiz.totalMarks = createdQuestions.reduce((sum, q) => sum + q.marks, quiz.totalMarks || 0);
    
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Publish quiz
// @route   POST /api/admin/quizzes/:id/publish
// @access  Private/Admin
export const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot publish quiz without questions' });
    }

    quiz.status = 'published';
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Import questions from CSV
// @route   POST /api/admin/quizzes/import
// @access  Private/Admin
export const importQuestions = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a CSV file' });
    }

    const questions = [];

    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (row) => {
        // Parse CSV row to question format
        const question = {
          type: row.type,
          text: row.text,
          createdBy: req.user._id,
        };

        if (row.type === 'MCQ') {
          question.options = JSON.parse(row.options);
        } else if (row.type === 'TrueFalse') {
          question.correctAnswer = row.correctAnswer === 'true';
        } else if (row.type === 'ShortAnswer') {
          question.correctAnswer = row.correctAnswer;
        }

        questions.push(question);
      })
      .on('end', async () => {
        const createdQuestions = await Question.insertMany(questions);
        
        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json({
          message: 'Questions imported successfully',
          count: createdQuestions.length,
          questions: createdQuestions,
        });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export quiz to CSV
// @route   GET /api/admin/quizzes/export/:id
// @access  Private/Admin
export const exportQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('questions');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const csvWriter = createObjectCsvWriter({
      path: `./uploads/quiz-${quiz._id}.csv`,
      header: [
        { id: 'type', title: 'Type' },
        { id: 'text', title: 'Question' },
        { id: 'options', title: 'Options' },
        { id: 'correctAnswer', title: 'Correct Answer' },
      ],
    });

    const records = quiz.questions.map((q) => ({
      type: q.type,
      text: q.text,
      options: q.type === 'MCQ' ? JSON.stringify(q.options) : '',
      correctAnswer: q.correctAnswer || '',
    }));

    await csvWriter.writeRecords(records);

    res.download(`./uploads/quiz-${quiz._id}.csv`, () => {
      fs.unlinkSync(`./uploads/quiz-${quiz._id}.csv`);
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes
// @route   GET /api/admin/quizzes
// @access  Private/Admin
export const getAllQuizzes = async (req, res) => {
  try {
    const { status, classroom, page = 1, limit = 20 } = req.query;

    const query = { deletedAt: null };

    if (status) query.status = status;
    if (classroom) query.classroom = classroom;

    const quizzes = await Quiz.find(query)
      .populate('classroom', 'name')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Quiz.countDocuments(query);

    res.json({
      quizzes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Manual grade override
// @route   PUT /api/admin/quizzes/attempts/:id/grade
// @access  Private/Admin
export const manualGrade = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const attempt = await QuizAttempt.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }

    attempt.score = score;
    attempt.feedback = feedback;
    attempt.manuallyGraded = true;
    attempt.gradedBy = req.user._id;
    attempt.status = 'graded';
    attempt.calculatePercentage();

    await attempt.save();

    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

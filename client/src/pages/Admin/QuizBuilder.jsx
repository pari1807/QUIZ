import { useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const initialState = {
  title: '',
  description: '',
  classroom: '',
  type: 'practice',
  timeLimit: 30,
};

const QuizBuilder = () => {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [quizId, setQuizId] = useState(null);
  const [quizMeta, setQuizMeta] = useState(null);
  const [question, setQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    marks: 1,
  });
  const [attachmentFile, setAttachmentFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) {
      toast.error('Title is required');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        settings: {
          timeLimit: Number(form.timeLimit) || 30,
          showSolutions: false,
        },
      };

      // Only include classroom if it looks like a valid ObjectId (24 hex chars)
      const classroomTrimmed = form.classroom.trim();
      if (/^[0-9a-fA-F]{24}$/.test(classroomTrimmed)) {
        payload.classroom = classroomTrimmed;
      }

      const created = await adminAPI.createQuiz(payload);

      const createdId = created.data?._id;
      if (!createdId) {
        toast.error('Quiz created but id missing');
        return;
      }

      setQuizId(createdId);
      setQuizMeta(created.data);
      toast.success('Quiz created. Now upload PDF/Image or add MCQ questions, then publish.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (idx, value) => {
    setQuestion((prev) => {
      const nextOptions = [...prev.options];
      nextOptions[idx] = value;
      return { ...prev, options: nextOptions };
    });
  };

  const handleAddQuestion = async () => {
    if (!quizId) return;
    const trimmedText = question.text.trim();
    if (!trimmedText) {
      toast.error('Question is required');
      return;
    }
    const opts = question.options.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) {
      toast.error('At least 2 options are required');
      return;
    }
    if (question.correctIndex < 0 || question.correctIndex >= question.options.length) {
      toast.error('Select a valid correct option');
      return;
    }
    if (!question.options[question.correctIndex]?.trim()) {
      toast.error('Correct option cannot be empty');
      return;
    }

    const payload = {
      questions: [
        {
          type: 'MCQ',
          text: trimmedText,
          marks: Number(question.marks) || 1,
          options: question.options.map((opt, index) => ({
            text: opt,
            isCorrect: index === Number(question.correctIndex),
          })),
        },
      ],
    };

    try {
      setLoading(true);
      const res = await adminAPI.addQuizQuestions(quizId, payload);
      setQuizMeta(res.data);
      toast.success('Question added');
      setQuestion({ text: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAttachment = async () => {
    if (!quizId) return;
    if (!attachmentFile) {
      toast.error('Please select a PDF or image');
      return;
    }

    const formData = new FormData();
    formData.append('file', attachmentFile);

    try {
      setLoading(true);
      const res = await adminAPI.uploadQuizAttachment(quizId, formData);
      setQuizMeta(res.data);
      setAttachmentFile(null);
      toast.success('Attachment uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload attachment');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!quizId) return;
    try {
      setLoading(true);
      await adminAPI.publishQuiz(quizId);
      toast.success('Quiz published');
      setForm(initialState);
      setQuizId(null);
      setQuizMeta(null);
      setQuestion({ text: '', options: ['', '', '', ''], correctIndex: 0, marks: 1 });
      setAttachmentFile(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to publish quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-1">Quiz Builder</h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Create quizzes for your classrooms. Published quizzes will automatically appear in the student quiz list.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Quiz title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input-field"
              placeholder="Midterm – DBMS"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Classroom ID (optional)</label>
            <input
              name="classroom"
              value={form.classroom}
              onChange={handleChange}
              className="input-field"
              placeholder="Paste classroom ObjectId (optional)"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="Short description for students..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Type</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className="input-field"
            >
              <option value="practice">Practice</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Time limit (minutes)</label>
            <input
              type="number"
              min={1}
              name="timeLimit"
              value={form.timeLimit}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !!quizId}
            className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : quizId ? 'Quiz Created' : 'Create Quiz'}
          </button>
        </div>
      </form>

      {quizId && (
        <div className="card space-y-6 max-w-2xl">
          <div className="flex flex-col gap-1">
            <p className="text-xs text-slate-400">Quiz ID</p>
            <p className="text-sm font-medium text-slate-100 break-all">{quizId}</p>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">Upload PDF / Image</h2>
            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              <input
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                className="input-field"
              />
              <button
                type="button"
                disabled={loading}
                onClick={handleUploadAttachment}
                className="btn-secondary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
            {!!quizMeta?.attachments?.length && (
              <div className="space-y-2">
                <p className="text-xs text-slate-400">Attachments</p>
                <ul className="space-y-1 text-sm text-slate-200">
                  {quizMeta.attachments.map((a) => (
                    <li key={a.publicId || a.url}>
                      <a href={a.url} target="_blank" rel="noreferrer" className="text-primary-200 hover:underline">
                        {a.fileName || a.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-50">Add MCQ Question</h2>
            <div className="space-y-1">
              <label className="text-xs text-slate-400">Question</label>
              <textarea
                value={question.text}
                onChange={(e) => setQuestion((p) => ({ ...p, text: e.target.value }))}
                rows={3}
                className="input-field resize-none"
                placeholder="Type your question..."
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {question.options.map((opt, idx) => (
                <div key={idx} className="space-y-1">
                  <label className="text-xs text-slate-400">Option {idx + 1}</label>
                  <input
                    value={opt}
                    onChange={(e) => handleQuestionChange(idx, e.target.value)}
                    className="input-field"
                    placeholder={`Option ${idx + 1}`}
                  />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Correct option</label>
                <select
                  value={question.correctIndex}
                  onChange={(e) => setQuestion((p) => ({ ...p, correctIndex: Number(e.target.value) }))}
                  className="input-field"
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-400">Marks</label>
                <input
                  type="number"
                  min={1}
                  value={question.marks}
                  onChange={(e) => setQuestion((p) => ({ ...p, marks: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleAddQuestion}
                  className="btn-primary text-sm w-full disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Saving...' : 'Add Question'}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={loading}
              onClick={handlePublish}
              className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Publishing...' : 'Publish Quiz'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizBuilder;

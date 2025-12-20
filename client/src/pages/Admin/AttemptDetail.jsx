import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const AttemptDetail = () => {
  const { attemptId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await adminAPI.getAttemptDetail(attemptId);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attempt');
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) {
      load();
    }
  }, [attemptId]);

  if (loading) {
    return <div className="text-sm text-slate-400">Loading attempt...</div>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-rose-400">{error}</div>
        <Link to="/admin/analytics" className="text-xs text-primary-300 hover:underline">
          Back to analytics
        </Link>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-slate-400">Attempt not found.</div>
        <Link to="/admin/analytics" className="text-xs text-primary-300 hover:underline">
          Back to analytics
        </Link>
      </div>
    );
  }

  const { quiz, student, attempt, questions } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-1">
            Quiz Attempt Detail
          </h1>
          <p className="text-sm text-slate-400">
            Review each question, selected options, and correctness for this attempt.
          </p>
        </div>
        <Link
          to="/admin/analytics"
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200 hover:border-primary-500 hover:text-primary-200"
        >
          Back to analytics
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-linear-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-sm font-semibold">
            {student?.username?.[0]?.toUpperCase?.() || '?'}
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">{student?.username}</p>
            <p className="text-xs text-slate-400">{student?.email}</p>
            <p className="text-[11px] text-slate-500">
              {student?.course && student?.semester
                ? `${student.course} • ${student.semester}`
                : student?.course || student?.semester || 'No course info'}
            </p>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400">Quiz</p>
          <p className="text-sm font-semibold text-slate-50">{quiz?.title || 'Quiz'}</p>
          <p className="text-[11px] text-slate-500 mt-1">Total marks: {quiz?.totalMarks}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-slate-400">Score</p>
            <p className="font-semibold text-slate-50">
              {attempt?.score} / {attempt?.maxScore}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Percentage</p>
            <p className="font-semibold text-slate-50">
              {Number(attempt?.percentage ?? 0).toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-slate-400">Time taken</p>
            <p className="font-semibold text-slate-50">{attempt?.timeTaken || 0}s</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-50">Questions</h2>
          <p className="text-xs text-slate-400">
            Correct answers shown in green, incorrect in red.
          </p>
        </div>

        <div className="space-y-4">
          {questions?.map((q, index) => {
            const isCorrect = q.answer?.isCorrect;
            const selected = q.answer?.selectedAnswer;

            return (
              <div
                key={q.questionId}
                className={`rounded-lg border p-4 text-sm ${
                  isCorrect
                    ? 'border-emerald-600/70 bg-emerald-900/10'
                    : 'border-rose-600/70 bg-rose-900/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="text-xs text-slate-400 mb-0.5">Question {index + 1}</p>
                    <p className="text-slate-50">{q.text}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="text-slate-400">Marks</p>
                    <p className="font-semibold text-slate-50">{q.marks}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Awarded: {q.answer?.marksAwarded ?? 0}
                    </p>
                  </div>
                </div>

                {q.type === 'MCQ' && Array.isArray(q.options) && (
                  <div className="space-y-1 mt-2">
                    {q.options.map((opt, idx) => {
                      const isCorrectOpt = !!opt.isCorrect;
                      const isSelected =
                        q.answer?.selectedOptionIndex != null &&
                        q.answer.selectedOptionIndex === idx;

                      const base = 'w-full text-left text-xs px-3 py-2 rounded-md border';
                      let style = 'border-slate-700 bg-slate-950/60 text-slate-200';

                      if (isCorrectOpt) {
                        style = 'border-emerald-500/70 bg-emerald-900/40 text-emerald-50';
                      } else if (isSelected && !isCorrectOpt) {
                        style = 'border-rose-500/70 bg-rose-900/40 text-rose-50';
                      }

                      return (
                        <button
                          key={opt._id || idx}
                          type="button"
                          className={`${base} ${style}`}
                        >
                          <span className="mr-2 text-[10px] text-slate-400">
                            {String.fromCharCode(65 + idx)}.
                          </span>
                          {opt.text}
                          {isSelected && (
                            <span className="ml-2 text-[10px] text-slate-300">
                              (selected)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {q.type !== 'MCQ' && (
                  <div className="mt-2 text-xs space-y-1">
                    <p>
                      <span className="text-slate-400">Correct answer: </span>
                      <span className="text-emerald-300">{String(q.correctAnswer)}</span>
                    </p>
                    <p>
                      <span className="text-slate-400">Student answer: </span>
                      <span className={isCorrect ? 'text-emerald-300' : 'text-rose-300'}>
                        {selected != null ? String(selected) : 'Not answered'}
                      </span>
                    </p>
                  </div>
                )}

                {q.explanation && (
                  <p className="mt-3 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Explanation: </span>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AttemptDetail;

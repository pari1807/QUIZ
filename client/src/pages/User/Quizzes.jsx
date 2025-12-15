import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await userAPI.getAvailableQuizzes();
        setQuizzes(data);
      } catch (error) {
        console.error('Failed to load quizzes', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-1">Available Quizzes</h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Join live quizzes or practice sets created by your teachers.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading quizzes...</p>
      ) : quizzes.length === 0 ? (
        <p className="text-sm text-slate-400">No quizzes available yet. Check back later.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz._id}
              className="card flex flex-col justify-between gap-3"
            >
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  {quiz.type === 'live' ? 'Live quiz' : 'Practice set'} • {quiz.classroom?.name || 'Classroom'}
                </p>
                <h2 className="text-lg font-semibold text-slate-50">{quiz.title}</h2>
                {quiz.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Time limit: {quiz.settings?.timeLimit || 30} min</span>
                <span>Status: <span className="text-emerald-300">{quiz.status}</span></span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  Created by {quiz.createdBy?.username || 'Instructor'}
                </span>
                <Link
                  to={`/quizzes/${quiz._id}/take`}
                  className="btn-primary text-[11px] px-4 py-2"
                >
                  Start
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quizzes;

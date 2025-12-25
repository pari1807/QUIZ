import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getLiveStatus = (quiz) => {
    if (quiz.type !== 'live') return null;
    
    const startTime = new Date(quiz.startTime);
    const windowEnd = new Date(startTime.getTime() + 30 * 60 * 1000);

    if (currentTime < startTime) {
      const diff = startTime - currentTime;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      return { 
        status: 'UPCOMING', 
        label: `Starts in ${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s` 
      };
    }
    
    if (currentTime >= startTime && currentTime <= windowEnd) {
      return { status: 'LIVE_NOW', label: 'JOIN NOW' };
    }
    
    return { status: 'EXPIRED', label: 'MISSED' };
  };

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
          {quizzes.map((quiz) => {
            const attempts = quiz.userStats?.attemptCount || 0;
            const latestPercentage = quiz.userStats?.latestPercentage;
            const latestAttemptId = quiz.userStats?.latestAttemptId;
            const hasAttempts = attempts > 0 && latestAttemptId;
            const liveInfo = getLiveStatus(quiz);
            const isLive = quiz.type === 'live';

            return (
              <div
                key={quiz._id}
                className={`card flex flex-col justify-between gap-3 relative overflow-hidden ${
                  liveInfo?.status === 'LIVE_NOW' ? 'ring-2 ring-primary-500/50 bg-primary-500/5' : ''
                }`}
              >
                {isLive && (
                   <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-lg ${
                     liveInfo?.status === 'UPCOMING' ? 'bg-amber-500/20 text-amber-400' :
                     liveInfo?.status === 'LIVE_NOW' ? 'bg-emerald-500 text-slate-900 animate-pulse' :
                     'bg-slate-800 text-slate-500'
                   }`}>
                     {liveInfo?.status === 'LIVE_NOW' ? 'LIVE NOW' : isLive ? 'LIVE EVENT' : ''}
                   </div>
                )}

                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                    {isLive ? (
                      <span className="flex items-center gap-1.5">
                        <span className={`h-1.5 w-1.5 rounded-full ${liveInfo?.status === 'LIVE_NOW' ? 'bg-emerald-500' : 'bg-slate-600'}`} />
                        {liveInfo?.label || 'Live Quiz'}
                      </span>
                    ) : (
                      `Practice set • ${quiz.classroom?.name || 'General'}`
                    )}
                  </p>
                  <h2 className="text-lg font-semibold text-slate-50">{quiz.title}</h2>
                  {quiz.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{quiz.description}</p>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex flex-col">
                    <span>{quiz.settings?.timeLimit || 30} min limit</span>
                    {isLive && (
                       <span className="text-[10px] text-primary-300 font-medium">
                         🎁 +50 Bonus XP
                       </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase text-slate-500 font-bold">Status</p>
                    <span className={hasAttempts ? 'text-emerald-300' : 'text-slate-400 font-medium'}>
                      {hasAttempts ? 'Attempted' : 'Not started'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-800/50 pt-2">
                  <span>
                    By {quiz.createdBy?.username || 'Instructor'}
                  </span>
                  {hasAttempts && (
                    <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                      {Number(latestPercentage ?? 0).toFixed(0)}%
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  {hasAttempts ? (
                    <Link
                      to={`/quizzes/${quiz._id}/results?attemptId=${latestAttemptId}`}
                      className="btn-secondary w-full text-[11px] py-2 flex items-center justify-center"
                    >
                      View Result
                    </Link>
                  ) : (
                    <div className="w-full">
                      {isLive ? (
                        <>
                          {liveInfo?.status === 'UPCOMING' ? (
                            <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed text-[11px] py-2">
                              Waiting...
                            </button>
                          ) : liveInfo?.status === 'LIVE_NOW' ? (
                            <Link
                              to={`/quizzes/${quiz._id}/take`}
                              className="btn-primary w-full text-[11px] py-2 flex items-center justify-center shadow-lg shadow-primary-500/20"
                            >
                              Join Live Event
                            </Link>
                          ) : (
                            <button disabled className="btn-secondary w-full opacity-50 cursor-not-allowed text-[11px] py-2 italic">
                              Opportunity Missed
                            </button>
                          )}
                        </>
                      ) : (
                        <Link
                          to={`/quizzes/${quiz._id}/take`}
                          className="btn-primary w-full text-[11px] py-2 flex items-center justify-center"
                        >
                          Start Practice
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Quizzes;

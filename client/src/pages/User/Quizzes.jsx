import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../../services/api';
import { Link } from 'react-router-dom';

const Quizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const { data } = await userAPI.getAvailableQuizzes();
      setQuizzes(data);
    } catch (error) {
      console.error('Failed to load quizzes', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
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
        label: `T-minus ${hours > 0 ? `${hours}h ` : ''}${mins}m ${secs}s` 
      };
    }
    
    if (currentTime >= startTime && currentTime <= windowEnd) {
      return { status: 'LIVE_NOW', label: 'JOIN NOW' };
    }
    
    return { status: 'EXPIRED', label: 'MISSED' };
  };

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4">
      {/* Immersive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/60 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-2 w-10 bg-primary-500 rounded-full" />
             <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Knowledge Arena</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-50 tracking-tighter">Available Quizzes</h1>
          <p className="text-sm text-slate-500 font-bold uppercase tracking-widest max-w-xl">
             Sharpen your skills with practice sets or compete in live timed events
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-900/40 p-2 rounded-2xl border border-slate-800">
           <div className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Quizzes</p>
              <p className="text-lg font-black text-slate-50">{quizzes.length}</p>
           </div>
           <button 
             onClick={fetchQuizzes} 
             disabled={loading}
             className="h-full px-6 py-2 rounded-xl bg-primary-600 hover:bg-primary-500 text-slate-900 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/10 active:scale-95 disabled:opacity-50"
           >
             {loading ? 'Refreshing...' : 'Refresh List 🔄'}
           </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
           <div className="h-12 w-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
           <p className="text-xs font-black text-slate-600 uppercase tracking-[0.2em] animate-pulse">Scanning Data Banks...</p>
        </div>
      ) : quizzes.length === 0 ? (
        <div className="py-24 text-center rounded-[60px] bg-slate-900/10 border border-dashed border-slate-800/50 max-w-2xl mx-auto">
           <div className="text-6xl mb-6 grayscale opacity-20">📊</div>
           <p className="text-sm font-black text-slate-600 uppercase tracking-[0.2em]">No Quizzes Detected</p>
           <p className="text-[10px] text-slate-700 font-bold uppercase mt-2 italic">Teachers are preparing fresh challenges for you</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {quizzes.map((quiz, i) => {
              const attempts = quiz.userStats?.attemptCount || 0;
              const latestPercentage = quiz.userStats?.latestPercentage;
              const latestAttemptId = quiz.userStats?.latestAttemptId;
              const hasAttempts = attempts > 0 && latestAttemptId;
              const liveInfo = getLiveStatus(quiz);
              const isLive = quiz.type === 'live';

              return (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  className={`group relative flex flex-col justify-between h-full bg-slate-900/40 border border-slate-800 p-6 rounded-[32px] backdrop-blur-xl transition-all hover:border-slate-700 hover:shadow-2xl hover:shadow-black/40 ${
                    liveInfo?.status === 'LIVE_NOW' ? 'ring-2 ring-primary-500/30 bg-primary-500/5' : ''
                  }`}
                >
                  {/* Badge & Type */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex flex-col gap-1">
                       <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                         isLive 
                          ? liveInfo?.status === 'LIVE_NOW' ? 'bg-emerald-500 text-slate-900 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                       }`}>
                         {isLive ? `⚡ ${liveInfo?.label}` : '🧩 Practice Set'}
                       </span>
                       <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-1">
                          {quiz.classroom?.name || 'Public Access'}
                       </span>
                    </div>

                    {hasAttempts && (
                       <div className="flex flex-col items-end">
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">Best Rank</p>
                          <span className="text-xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]">
                             {Number(latestPercentage ?? 0).toFixed(0)}%
                          </span>
                       </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="mb-6 space-y-2">
                    <h2 className="text-xl font-black text-slate-50 tracking-tight group-hover:text-primary-400 transition-colors">{quiz.title}</h2>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed italic">
                       {quiz.description || 'No description provided by the instructor.'}
                    </p>
                  </div>

                  {/* Features / Meta */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                     <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 flex flex-col justify-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Duration</p>
                        <p className="text-xs font-black text-slate-300">{quiz.settings?.timeLimit || 30} Minutes</p>
                     </div>
                     <div className="bg-slate-950/40 p-3 rounded-2xl border border-slate-800/50 flex flex-col justify-center">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Rewards</p>
                        <p className="text-xs font-black text-primary-400">+{isLive ? '150' : '50'} XP</p>
                     </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    {isLive ? (
                       <div className="w-full">
                          {liveInfo?.status === 'UPCOMING' ? (
                             <div className="w-full h-11 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Awaiting Signal...</span>
                             </div>
                          ) : liveInfo?.status === 'LIVE_NOW' ? (
                             <Link
                               to={`/quizzes/${quiz._id}/take`}
                               className="w-full h-11 bg-primary-600 hover:bg-primary-500 text-slate-900 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
                             >
                               Engage Now ⚡
                             </Link>
                          ) : (
                             <div className="w-full h-11 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-center opacity-50 grayscale">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Transmission Closed</span>
                             </div>
                          )}
                       </div>
                    ) : (
                       <div className="flex flex-col gap-2">
                          {hasAttempts ? (
                             <>
                                <Link
                                  to={`/quizzes/${quiz._id}/take`}
                                  className="w-full h-11 bg-slate-50 text-slate-900 hover:bg-white rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                                >
                                  Retake Practice 🧩
                                </Link>
                                <Link
                                  to={`/quizzes/${quiz._id}/results?attemptId=${latestAttemptId}`}
                                  className="w-full h-11 bg-slate-800/40 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest transition-all"
                                >
                                  Review Result
                                </Link>
                             </>
                          ) : (
                             <Link
                               to={`/quizzes/${quiz._id}/take`}
                               className="w-full h-11 bg-primary-600 hover:bg-primary-500 text-slate-900 rounded-2xl flex items-center justify-center text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
                             >
                               Initialize Practice ⚙️
                             </Link>
                          )}
                       </div>
                    )}
                  </div>

                  {/* Footer Meta */}
                  <div className="mt-6 pt-4 border-t border-slate-800/50 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                           {quiz.createdBy?.username ? quiz.createdBy.username[0] : 'I'}
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Creator: {quiz.createdBy?.username || 'Instructor'}</span>
                     </div>
                     <span className="text-[9px] font-black text-slate-700 uppercase">{attempts} Attempts</span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-soft {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
      `}} />
    </div>
  );
};

export default Quizzes;

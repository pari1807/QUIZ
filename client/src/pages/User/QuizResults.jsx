import { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const QuizResults = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!attemptId) {
        setLoading(false);
        return;
      }

      try {
        const res = await userAPI.getQuizResults(id, attemptId);
        if (mounted) setResults(res.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load results');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [attemptId, id]);

  if (loading) {
    return <div className="text-sm text-slate-400">Loading results...</div>;
  }

  if (!attemptId) {
    return (
      <div className="card">
        <p className="text-sm text-slate-400">Missing attempt id.</p>
        <div className="pt-3">
          <Link to="/quizzes" className="btn-secondary text-sm">Back to quizzes</Link>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="card">
        <p className="text-sm text-slate-400">Results not available.</p>
        <div className="pt-3">
          <Link to="/quizzes" className="btn-secondary text-sm">Back to quizzes</Link>
        </div>
      </div>
    );
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 80) return 'text-emerald-400';
    if (percentage >= 60) return 'text-primary-400';
    return 'text-rose-400';
  };

  const isPassed = (results.percentage || 0) >= 60;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Quiz Performance</h1>
          <p className="text-sm text-slate-400 mt-1">Detailed breakdown of your session</p>
        </div>
        <Link 
          to="/quizzes" 
          className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/50 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          ← Back to Quizzes
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Score Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/40 p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-primary-500/10 blur-[80px]" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-[80px]" />

          <div className="relative flex-shrink-0">
             <svg className="h-40 w-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={440}
                  initial={{ strokeDashoffset: 440 }}
                  animate={{ strokeDashoffset: 440 - (440 * (results.percentage || 0)) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={`${getGradeColor(results.percentage)} drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]`}
                />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: 1 }}
                   transition={{ delay: 1 }}
                   className="text-4xl font-black text-slate-50"
                >
                  {Math.round(results.percentage || 0)}%
                </motion.span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Score</span>
             </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
             <div>
                <h2 className="text-2xl font-bold text-slate-50">{results.quiz?.title || 'Quiz Complete!'}</h2>
                <p className="text-sm text-slate-400 mt-1 line-clamp-1">{results.quiz?.subject || 'Assessment'}</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Marks Obtained</p>
                   <p className="text-xl font-bold text-slate-50">{results.score} <span className="text-sm font-normal text-slate-500">/ {results.quiz?.totalMarks}</span></p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5">
                   <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Status</p>
                   <p className={`text-xl font-bold ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPassed ? 'PASSED 🎯' : 'FAILED 👎'}
                   </p>
                </div>
             </div>

             <div className="pt-2">
                <p className="text-xs text-slate-400 italic">
                   {isPassed ? "Excellent work! You've mastered this set." : "Keep practicing. You'll get it next time!"}
                </p>
             </div>
          </div>
        </motion.div>

        {/* Quick Stats Column */}
        <div className="space-y-6">
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.2 }}
             className="p-6 rounded-3xl border border-slate-800 bg-slate-900/40"
           >
              <div className="flex items-center gap-4 mb-4">
                 <div className="h-10 w-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                 </div>
                 <div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Time Efficiency</p>
                    <p className="text-lg font-bold text-slate-50">{results.timeTaken || 0}s <span className="text-xs font-normal text-slate-400">total</span></p>
                 </div>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className="h-full bg-primary-500"
                 />
              </div>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.3 }}
             className="p-6 rounded-3xl border border-emerald-500/10 bg-emerald-500/5 relative overflow-hidden"
           >
              <div className="absolute -right-4 -top-4 opacity-10">
                 <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0l-1.18-4.455L6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
              </div>
              <p className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest mb-1">Rewards</p>
              <p className="text-xl font-bold text-emerald-400">+ {Math.floor(results.percentage / 10)} XP</p>
              <p className="text-xs text-emerald-500/60 mt-2 font-medium">Added to your global rank</p>
           </motion.div>
        </div>
      </div>

      {/* Attempt History Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card !p-0 overflow-hidden border border-slate-800 shadow-xl"
      >
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between">
           <h3 className="text-sm font-bold text-slate-50 uppercase tracking-wider">Session History</h3>
           <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {results.attemptsHistory?.length || 0} Attempts
           </span>
        </div>
        
        <div className="p-4 space-y-3">
          {Array.isArray(results.attemptsHistory) && results.attemptsHistory.map((a) => (
            <div
              key={a.attemptId}
              className={`group flex items-center justify-between p-4 rounded-2xl border transition-all ${
                a.isCurrent
                  ? 'border-primary-500/40 bg-primary-500/5'
                  : 'border-slate-800 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center gap-4">
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center font-black text-xs ${
                    a.isCurrent ? 'bg-primary-500 text-slate-900' : 'bg-slate-800 text-slate-400'
                 }`}>
                    {a.attemptNumber}
                 </div>
                 <div>
                    <p className="text-sm font-bold text-slate-100 flex items-center gap-2">
                       Attempt #{a.attemptNumber}
                       {a.isCurrent && <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-primary-500 text-slate-950 font-black uppercase">Current</span>}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium">
                       {a.submittedAt ? new Date(a.submittedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Date missing'}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-sm font-bold text-slate-100">{a.score} / {a.maxScore}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{a.timeTaken || 0}s Duration</p>
                 </div>
                 <div className="hidden sm:block">
                    <div className={`h-8 w-16 rounded-xl flex items-center justify-center font-black text-xs ${getGradeColor(a.percentage)} bg-white/5`}>
                       {Math.round(a.percentage)}%
                    </div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div 
         initial={{ opacity: 0 }}
         animate={{ opacity: 1 }}
         transition={{ delay: 0.6 }}
         className="flex justify-center pt-4"
      >
         <Link 
            to="/quizzes" 
            className="group flex items-center gap-2 px-8 py-3 rounded-2xl bg-primary-500 text-slate-900 font-black text-sm hover:bg-primary-400 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary-500/20"
         >
            BACK TO QUIZZES
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
         </Link>
      </motion.div>
    </div>
  );
};

export default QuizResults;

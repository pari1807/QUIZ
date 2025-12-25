import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <div className="h-10 w-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Parsing Session Data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-4 p-8">
        <div className="text-sm text-rose-400 font-bold">Analysis Error: {error || 'Attempt not found'}</div>
        <Link to="/admin/analytics" className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 transition-colors inline-block">
          ← Back to Analytics
        </Link>
      </div>
    );
  }

  const { quiz, student, attempt, questions } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-black text-slate-50 tracking-tight">Session Analysis</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Attempt ID: {attemptId.slice(-8)}</span>
             <span className="h-1 w-1 rounded-full bg-slate-700" />
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{quiz?.title}</span>
          </div>
        </div>
        <Link
          to="/admin/analytics"
          className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          ← ANALYTICS
        </Link>
      </motion.div>

      {/* Profile & Quiz Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* Student Profile Card */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 flex items-center gap-4 relative overflow-hidden"
         >
            <div className="absolute top-0 right-0 h-20 w-20 bg-primary-500/5 blur-3xl rounded-full" />
            <div className="h-16 w-16 rounded-2xl bg-linear-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-xl font-black text-white shadow-xl shadow-primary-500/20">
               {student?.username?.[0]?.toUpperCase?.() || '?'}
            </div>
            <div>
               <p className="text-lg font-black text-slate-50 leading-tight">{student?.username}</p>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{student?.email}</p>
               <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                     {student?.course || 'GENERAL'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                     SEM: {student?.semester || 'N/A'}
                  </span>
               </div>
            </div>
         </motion.div>

         {/* Performance Matrix Card */}
         <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 grid grid-cols-3 gap-6"
         >
             <PerformanceMiniCard 
               label="Accuracy" 
               value={`${Number(attempt?.percentage ?? 0).toFixed(1)}%`} 
               color={attempt?.percentage >= 60 ? "emerald" : "rose"}
             />
             <PerformanceMiniCard 
               label="Score Breakdown" 
               value={`${attempt?.score} / ${attempt?.maxScore}`} 
               color="primary"
             />
             <PerformanceMiniCard 
               label="Session Duration" 
               value={`${attempt?.timeTaken || 0}s`} 
               color="amber"
             />
         </motion.div>
      </div>

      {/* Detailed Question Review */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Question Correlation Analysis</h3>
           <p className="text-[10px] text-slate-500 italic">Legend: <span className="text-emerald-500 font-bold">●</span> Correct / <span className="text-rose-500 font-bold">●</span> Missed</p>
        </div>

        <div className="space-y-4">
          {questions?.map((q, index) => {
            const isCorrect = q.answer?.isCorrect;
            const selected = q.answer?.selectedAnswer;

            return (
              <motion.div
                key={q.questionId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
                  isCorrect
                    ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
                    : 'border-rose-500/20 bg-rose-500/5 hover:border-rose-500/40'
                }`}
              >
                <div className="absolute top-0 left-0 w-1 h-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
                
                <div className="p-6">
                   <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex gap-4">
                         <div className={`h-10 w-10 flex-shrink-0 rounded-2xl flex items-center justify-center font-black text-sm ${
                            isCorrect ? 'bg-emerald-500 text-slate-900' : 'bg-rose-500 text-slate-900'
                         }`}>
                            {index + 1}
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Question Segment</p>
                            <p className="text-slate-100 font-bold leading-relaxed">{q.text}</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] text-slate-500 font-black uppercase mb-1 tracking-widest">Marks</p>
                         <p className={`text-xl font-black ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {q.answer?.marksAwarded ?? 0} <span className="text-xs text-slate-600">/ {q.marks}</span>
                         </p>
                      </div>
                   </div>

                   {q.type === 'MCQ' && Array.isArray(q.options) && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-0 md:pl-14">
                       {q.options.map((opt, idx) => {
                         const isCorrectOpt = !!opt.isCorrect;
                         const isSelected = q.answer?.selectedOptionIndex === idx;

                         return (
                           <div
                             key={opt._id || idx}
                             className={`relative p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                                isCorrectOpt 
                                 ? 'bg-emerald-500/10 border-emerald-500/30' 
                                 : isSelected 
                                   ? 'bg-rose-500/10 border-rose-500/30' 
                                   : 'bg-slate-950/20 border-slate-800'
                             }`}
                           >
                             <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                                isCorrectOpt 
                                 ? 'bg-emerald-400 text-slate-900' 
                                 : isSelected 
                                   ? 'bg-rose-400 text-slate-900' 
                                   : 'bg-slate-800 text-slate-500'
                             }`}>
                                {String.fromCharCode(65 + idx)}
                             </div>
                             <p className={`text-xs font-bold ${isCorrectOpt ? 'text-emerald-100' : isSelected ? 'text-rose-100' : 'text-slate-400'}`}>
                                {opt.text}
                             </p>
                             {isSelected && (
                                <div className="absolute right-3">
                                   <span className={`text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded bg-white/10 ${isCorrectOpt ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      Selected
                                   </span>
                                </div>
                             )}
                           </div>
                         );
                       })}
                     </div>
                   )}

                   {q.type !== 'MCQ' && (
                     <div className="md:ml-14 space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/50">
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-bold uppercase tracking-widest">Expected Protocol:</span>
                           <span className="text-emerald-400 font-black">{String(q.correctAnswer)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                           <span className="text-slate-500 font-bold uppercase tracking-widest">Student Response:</span>
                           <span className={isCorrect ? 'text-emerald-400 font-black' : 'text-rose-400 font-black text-decoration-line: line-through'}>
                             {selected != null ? String(selected) : 'NOT ANSWERED'}
                           </span>
                        </div>
                     </div>
                   )}

                   {q.explanation && (
                     <div className="mt-6 md:ml-14 p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10">
                        <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1">Pedagogical Explanation</p>
                        <p className="text-xs text-slate-300 leading-relaxed italic">{q.explanation}</p>
                     </div>
                   )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PerformanceMiniCard = ({ label, value, color }) => {
   const themes = {
      primary: 'text-primary-400',
      emerald: 'text-emerald-400',
      rose: 'text-rose-400',
      amber: 'text-amber-400',
   };
   return (
      <div className="flex flex-col">
         <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 leading-none">{label}</p>
         <p className={`text-xl font-black ${themes[color] || 'text-slate-50'}`}>{value}</p>
      </div>
   );
};

export default AttemptDetail;

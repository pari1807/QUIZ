import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const QuizTaking = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [startedAt, setStartedAt] = useState(null);
  const [remainingMs, setRemainingMs] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByQuestionId, setAnswersByQuestionId] = useState({});

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const res = await userAPI.startQuiz(id);
        if (!mounted) return;
        setAttemptId(res.data?.attemptId || null);
        setQuiz(res.data?.quiz || null);
        setQuestions(res.data?.questions || []);
        setStartedAt(res.data?.startedAt ? new Date(res.data.startedAt) : new Date());
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to start quiz');
        navigate('/quizzes');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    start();
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  useEffect(() => {
    if (!quiz?.timeLimit || !startedAt) return;

    const totalMs = Number(quiz.timeLimit) * 60 * 1000;
    const end = startedAt.getTime() + totalMs;

    const tick = () => {
      const ms = end - Date.now();
      setRemainingMs(ms);
      if (ms <= 0) {
        setRemainingMs(0);
      }
    };

    tick();
    const timerId = setInterval(tick, 1000);
    return () => clearInterval(timerId);
  }, [quiz?.timeLimit, startedAt]);

  useEffect(() => {
    if (remainingMs === null) return;
    if (remainingMs > 0) return;
    if (submitting) return;
    if (!attemptId) return;

    handleSubmit();
  }, [remainingMs, submitting, attemptId]);

  const formatRemaining = (ms) => {
    if (ms === null || ms === undefined) return '--:--';
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
  };

  const currentQuestion = questions[currentIndex];
  const currentSelected = currentQuestion ? answersByQuestionId[currentQuestion._id] : null;

  const progress = useMemo(() => {
    if (!questions.length) return { answered: 0, total: 0, percent: 0 };
    const answered = Object.values(answersByQuestionId).filter((v) => v !== null && v !== undefined && v !== '').length;
    return { answered, total: questions.length, percent: (answered / questions.length) * 100 };
  }, [answersByQuestionId, questions.length]);

  const handleSelect = (questionId, optionText) => {
    setAnswersByQuestionId((prev) => ({ ...prev, [questionId]: optionText }));
  };

  const handleSubmit = async () => {
    if (!attemptId) return;
    if (!questions.length) {
      toast.error('No questions in this quiz');
      return;
    }

    const answers = questions.map((q) => ({
      questionId: q._id,
      answer: answersByQuestionId[q._id] ?? null,
    }));

    try {
      setSubmitting(true);
      await userAPI.submitQuiz(id, { attemptId, answers });
      navigate(`/quizzes/${id}/results?attemptId=${attemptId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
         <div className="h-14 w-14 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] animate-pulse">Synchronizing Assessment Protocol...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="py-20 text-center">
         <div className="text-5xl mb-4 grayscale opacity-20">📡</div>
         <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Protocol Sync Failure</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 max-w-7xl mx-auto px-4">
      {/* Immersive HUD Header */}
      <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-2xl border-b border-slate-800/60 -mx-4 px-4 py-4 mb-10 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
             <button 
               onClick={() => navigate('/quizzes')}
               className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-slate-400 font-bold"
             >
               ‹
             </button>
             <div>
                <h1 className="text-xl font-black text-slate-50 tracking-tight leading-none">{quiz.title}</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                   <span className="h-1.5 w-1.5 rounded-full bg-primary-500 animate-pulse" />
                   Session Active • {remainingMs < 60000 ? 'TIME CRITICAL' : 'Secure Protocol'}
                </p>
             </div>
          </div>

          <div className="flex items-center gap-6">
             <div className="text-right hidden md:block">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Response Progress</p>
                <div className="h-2 w-32 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress.percent}%` }}
                     className="h-full bg-primary-500" 
                   />
                </div>
             </div>

             <div className={`px-5 py-2.5 rounded-2xl border ${remainingMs < 60000 ? 'bg-rose-500/10 border-rose-500/30 text-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.2)]' : 'bg-slate-900/60 border-slate-800 text-slate-50'}`}>
                <p className="text-[8px] font-black opacity-60 uppercase tracking-widest text-center mb-0.5">Time Remaining</p>
                <p className="text-xl font-black tabular-nums tracking-tighter">{formatRemaining(remainingMs)}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Navigation Grid */}
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-[28px] backdrop-blur-xl sticky top-28">
             <div className="flex items-center justify-between mb-4 px-1">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Navigator</h3>
                <span className="text-[10px] font-black text-slate-300">{progress.answered}/{progress.total}</span>
             </div>
             <div className="grid grid-cols-5 md:grid-cols-3 gap-2 text-center">
                {questions.map((q, index) => {
                  const answered = answersByQuestionId[q._id];
                  const isCurrent = index === currentIndex;
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentIndex(index)}
                      className={`h-9 w-full rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                        isCurrent 
                        ? 'bg-primary-500 text-slate-900 scale-105 shadow-xl shadow-primary-500/30' 
                        : answered 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                          : 'bg-slate-800/40 text-slate-500 border border-slate-800/50 hover:border-slate-700'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
             </div>

             {!!quiz.attachments?.length && (
                <div className="mt-8 pt-6 border-t border-slate-800/80">
                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-3">Resources</p>
                   <div className="space-y-2">
                     {quiz.attachments.map((a, i) => (
                       <a
                         key={i}
                         href={a.url}
                         target="_blank"
                         rel="noreferrer"
                         className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/40 border border-slate-800 hover:border-slate-700 hover:text-primary-400 transition-all group"
                       >
                         <span className="text-[10px] grayscale group-hover:grayscale-0">📎</span>
                         <span className="text-[10px] font-black text-slate-400 truncate uppercase tracking-tighter">
                            {a.fileName || 'Archive-01'}
                         </span>
                       </a>
                     ))}
                   </div>
                </div>
             )}
          </div>
        </div>

        {/* Question Terminal */}
        <div className="md:col-span-9 lg:col-span-10">
           <AnimatePresence mode="wait">
             <motion.div
               key={currentIndex}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.3 }}
               className="bg-slate-900/40 border border-slate-800 p-8 md:p-12 rounded-[40px] backdrop-blur-xl shadow-2xl shadow-black/40 min-h-[500px] flex flex-col justify-between"
             >
                <div className="space-y-10">
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <span className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">
                            {currentIndex + 1}
                         </span>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Question Segment</p>
                      </div>
                      <div className="px-3 py-1 rounded-lg bg-slate-950 border border-slate-800/80">
                         <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Marks: {currentQuestion.marks || 1}</p>
                      </div>
                   </div>

                   <h2 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight leading-tight max-w-4xl">
                      {currentQuestion.text}
                   </h2>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                      {(currentQuestion.options || []).map((opt, i) => {
                        const isSelected = currentSelected === opt.text;
                        const label = String.fromCharCode(65 + i);
                        return (
                          <motion.button
                            key={opt._id || opt.text}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect(currentQuestion._id, opt.text)}
                            className={`flex items-start gap-4 p-5 rounded-3xl border text-left transition-all relative overflow-hidden group ${
                              isSelected 
                              ? 'bg-primary-500/10 border-primary-500 shadow-[0_0_30px_rgba(6,174,214,0.15)] text-primary-50' 
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:bg-slate-900/40'
                            }`}
                          >
                            <div className={`h-8 w-8 min-w-[32px] rounded-xl flex items-center justify-center text-[11px] font-black transition-all ${
                               isSelected ? 'bg-primary-500 text-slate-900' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'
                            }`}>
                               {label}
                            </div>
                            <span className="text-[13px] md:text-sm font-black leading-relaxed tracking-tight py-1">{opt.text}</span>
                            
                            {isSelected && (
                               <motion.div 
                                 layoutId="selection-glow" 
                                 className="absolute bottom-0 right-0 w-16 h-16 bg-primary-500/10 rounded-full -mb-8 -mr-8 blur-xl" 
                               />
                            )}
                          </motion.button>
                        );
                      })}
                   </div>
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between mt-12 pt-10 border-t border-slate-800/50">
                   <button
                     disabled={currentIndex === 0}
                     onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                     className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-slate-300 hover:border-slate-700 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                   >
                     Previous Phase
                   </button>

                   <div className="flex items-center gap-3">
                     {currentIndex < questions.length - 1 ? (
                        <button
                          onClick={() => setCurrentIndex(i => Math.min(questions.length - 1, i + 1))}
                          className="px-10 py-3 rounded-2xl bg-slate-50 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-white active:scale-95 transition-all shadow-xl shadow-white/5"
                        >
                          Next Segment
                        </button>
                     ) : (
                        <button
                          disabled={submitting}
                          onClick={handleSubmit}
                          className="px-12 py-3 rounded-2xl bg-primary-600 text-slate-900 text-[10px] font-black uppercase tracking-widest hover:bg-primary-500 active:scale-95 transition-all shadow-xl shadow-primary-500/20"
                        >
                          {submitting ? 'Finalizing Sync...' : 'Final Submission 🚀'}
                        </button>
                     )}
                   </div>
                </div>
             </motion.div>
           </AnimatePresence>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .hud-text { text-shadow: 0 0 10px rgba(6,174,214,0.3); }
      `}} />
    </div>
  );
};

export default QuizTaking;

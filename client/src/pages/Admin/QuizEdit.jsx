import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const emptyQuestion = {
  _id: null,
  text: '',
  options: ['', '', '', ''],
  correctIndex: 0,
  marks: 1,
  isNew: true,
};

const QuizEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [savingIndex, setSavingIndex] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getQuizDetails(id);
      const qz = res.data;
      setQuiz(qz);
      const qs = qz.questions || [];
      setQuestions(
        qs.length
          ? qs.map((q) => {
              const baseOptions = (q.options || []).map((o) => o.text);
              while (baseOptions.length < 4) baseOptions.push('');
              const correctIdx = (q.options || []).findIndex((o) => o.isCorrect);
              return {
                _id: q._id,
                text: q.text || '',
                options: baseOptions.slice(0, 4),
                correctIndex: correctIdx >= 0 ? correctIdx : 0,
                marks: q.marks || 1,
                isNew: false,
              };
            })
          : [emptyQuestion]
      );
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadQuiz();
  }, [id]);

  const updateField = (index, field, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const updateOption = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const next = [...prev];
      const q = next[qIndex];
      const opts = [...q.options];
      opts[optIndex] = value;
      next[qIndex] = { ...q, options: opts };
      return next;
    });
  };

  const buildPayloadQuestion = (q) => {
    const trimmedText = q.text.trim();
    if (!trimmedText) {
      toast.error('Question is required');
      return null;
    }
    const opts = q.options.map((o) => o.trim()).filter(Boolean);
    if (opts.length < 2) {
      toast.error('At least 2 options are required');
      return null;
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      toast.error('Select a valid correct option');
      return null;
    }
    if (!q.options[q.correctIndex]?.trim()) {
      toast.error('Correct option cannot be empty');
      return null;
    }

    return {
      type: 'MCQ',
      text: trimmedText,
      marks: Number(q.marks) || 1,
      options: q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === Number(q.correctIndex),
      })),
    };
  };

  const handleSave = async (q, index) => {
    if (!id) return;

    const payloadQuestion = buildPayloadQuestion(q);
    if (!payloadQuestion) return;

    try {
      setSavingIndex(index);
      if (q._id && !q.isNew) {
        await adminAPI.updateQuizQuestion(q._id, payloadQuestion);
        toast.success(`Question ${index + 1} updated`);
      } else {
        await adminAPI.addQuizQuestions(id, { questions: [payloadQuestion] });
        toast.success(`Question ${index + 1} added`);
      }
      await loadQuiz();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save question');
    } finally {
      setSavingIndex(null);
    }
  };

  const handleAddBlock = () => {
    setQuestions((prev) => [...prev, { ...emptyQuestion, _id: null, isNew: true }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async () => {
    if (!id) return;
    try {
      setPublishing(true);

      if (!questions.length) {
        toast.error('Add at least one question before publishing');
        return;
      }

      // Save all questions (update existing + add new)
      for (let index = 0; index < questions.length; index += 1) {
        const q = questions[index];
        const payloadQuestion = buildPayloadQuestion(q);
        if (!payloadQuestion) {
          return; // validation error already shown
        }

        if (q._id && !q.isNew) {
          await adminAPI.updateQuizQuestion(q._id, payloadQuestion);
        } else {
          await adminAPI.addQuizQuestions(id, { questions: [payloadQuestion] });
        }
      }

      await adminAPI.publishQuiz(id);
      toast.success('Quiz published');
      navigate('/admin/quizzes');
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to publish quiz');
    } finally {
      setPublishing(false);
    }
  };

  if (loading && !quiz) {
    return <div className="text-sm text-slate-400 p-8">Loading current quiz parameters...</div>;
  }

  if (!quiz) {
    return <div className="text-sm text-slate-400 p-8">Quiz context not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header / Breadcrumb */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
           <button 
             onClick={() => navigate('/admin/quizzes')}
             className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
           >
              ←
           </button>
           <div>
              <h1 className="text-2xl font-black text-slate-50 tracking-tight">Question Editor</h1>
              <div className="flex items-center gap-2 mt-0.5">
                 <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{quiz.title}</span>
                 <span className="h-1 w-1 rounded-full bg-slate-700" />
                 <span className="text-[10px] font-bold text-slate-500 uppercase">{quiz.type} • {quiz.settings?.timeLimit || 0}m</span>
              </div>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <p className="hidden lg:block text-[10px] text-slate-500 font-bold uppercase mr-2">
              Status: <span className={quiz.status === 'published' ? 'text-emerald-500' : 'text-amber-500'}>{quiz.status}</span>
           </p>
           <button
             type="button"
             onClick={handleAddBlock}
             className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-700 transition-all border border-slate-700"
           >
             + Add Block
           </button>
           <button
             type="button"
             disabled={publishing}
             onClick={handlePublish}
             className="px-6 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 active:scale-95 transition-all disabled:opacity-50"
           >
             {publishing ? 'Synchronizing...' : 'Sync & Publish'}
           </button>
        </div>
      </motion.div>

      {/* Editor Main Area */}
      <div className="space-y-6">
        {questions.map((q, index) => (
          <motion.div 
            key={q._id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative"
          >
             {/* Large Index indicator */}
             <div className="absolute -left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-500 z-10 hidden lg:flex shadow-xl">
                {index + 1}
             </div>

             <div className="card space-y-6 border border-slate-800/80 hover:border-primary-500/30 transition-all duration-300 bg-slate-900/40">
                <div className="flex flex-col md:flex-row gap-6">
                   {/* Question Meta column */}
                   <div className="w-full md:w-1/3 space-y-4">
                      <div className="space-y-2">
                         <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Question Narrative</label>
                         <textarea
                           value={q.text}
                           onChange={(e) => updateField(index, 'text', e.target.value)}
                           rows={6}
                           className="input-field !bg-slate-950/40 !border-slate-800 text-sm focus:!border-primary-500/50 resize-none"
                           placeholder="Type your question statement here..."
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                         <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Correct Solution</label>
                            <select
                              value={q.correctIndex}
                              onChange={(e) => updateField(index, 'correctIndex', Number(e.target.value))}
                              className="input-field !bg-slate-950/40 !border-slate-800 text-xs"
                            >
                              {[0, 1, 2, 3].map(i => (
                                <option key={i} value={i}>Option {i + 1}</option>
                              ))}
                            </select>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Marks Allocation</label>
                            <input
                              type="number"
                              min={1}
                              value={q.marks}
                              onChange={(e) => updateField(index, 'marks', e.target.value)}
                              className="input-field !bg-slate-950/40 !border-slate-800 text-sm font-bold text-primary-400"
                            />
                         </div>
                      </div>
                   </div>

                   {/* Options column */}
                   <div className="flex-1 space-y-4">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Response Scenarios</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {q.options.map((opt, idx) => (
                          <div key={idx} className={`relative p-1 rounded-2xl transition-all ${q.correctIndex === idx ? 'bg-primary-500/10 ring-1 ring-primary-500/50' : 'bg-slate-950/20 ring-1 ring-slate-800'}`}>
                             <div className="flex items-center gap-3 p-1">
                                <div className={`h-6 w-6 rounded-lg flex items-center justify-center text-[10px] font-black ${q.correctIndex === idx ? 'bg-primary-500 text-slate-900' : 'bg-slate-800 text-slate-500'}`}>
                                   {idx + 1}
                                </div>
                                <input
                                  value={opt}
                                  onChange={(e) => updateOption(index, idx, e.target.value)}
                                  className="flex-1 bg-transparent border-none text-slate-200 text-sm focus:ring-0 placeholder:text-slate-600"
                                  placeholder={`Detailed option ${idx + 1}...`}
                                />
                             </div>
                          </div>
                        ))}
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-800/50">
                         <p className="text-[9px] text-slate-600 font-medium">Auto-saving currently disabled. Hit sync to commit all changes.</p>
                         <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveQuestion(index)}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest px-2 py-0.5 rounded border border-rose-500/20 hover:border-rose-500/40 transition-all"
                            >
                              Remove Block
                            </button>
                            <span className="text-[10px] font-bold text-slate-500 px-2 py-0.5 rounded-full bg-slate-800 uppercase tracking-widest">
                               MCQ Type
                            </span>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        ))}

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={handleAddBlock}
          className="w-full py-8 border-2 border-dashed border-slate-800 rounded-3xl text-slate-500 hover:text-primary-400 hover:border-primary-500/40 hover:bg-primary-500/5 transition-all flex flex-col items-center justify-center gap-2 group"
        >
           <span className="h-10 w-10 rounded-full border border-slate-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">+</span>
           <span className="text-xs font-black uppercase tracking-widest">Append New Question Block</span>
        </motion.button>
      </div>

      {/* Persistence Bar */}
      <motion.div 
         initial={{ y: 100 }}
         animate={{ y: 0 }}
         className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-sm px-4"
      >
         <div className="card !p-4 border-slate-700 bg-slate-900/90 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-4">
            <div>
               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Session Summary</p>
               <p className="text-sm font-bold text-slate-100">{questions.length} Questions <span className="text-primary-400">Total</span></p>
            </div>
            <button
               onClick={handlePublish}
               disabled={publishing}
               className="px-6 py-2.5 rounded-xl bg-primary-500 text-slate-900 font-black text-xs uppercase tracking-tighter hover:bg-primary-400 transition-all active:scale-95 disabled:opacity-50"
            >
               {publishing ? 'Syncing...' : 'Sync & Save'}
            </button>
         </div>
      </motion.div>
    </div>
  );
};

export default QuizEdit;

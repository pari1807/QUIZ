import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { userAPI } from '../../services/api';

const savedNotes = [
  { title: 'DSA – Graphs Cheatsheet', subject: 'Data Structures', rating: 4.8 },
  { title: 'Operating Systems – Deadlocks', subject: 'OS', rating: 4.5 },
];

const recentQuizzes = [
  { title: 'DBMS Weekly Quiz', score: '18 / 20', trend: '+8%', status: 'Improved' },
  { title: 'JavaScript Fundamentals', score: '15 / 20', trend: '-5%', status: 'Retry' },
];

const Dashboard = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const res = await userAPI.getAvailableQuizzes();
        if (!mounted) return;
        setAvailableQuizzes(res.data || []);
      } finally {
        if (mounted) setLoadingQuizzes(false);
      }
    };

    load();
    return () => {
      mounted = false;
      const now = new Date().toISOString();
      localStorage.setItem('lastQuizSeenAt', now);
    };
  }, []);

  const newQuizCount = useMemo(() => {
    const lastSeen = localStorage.getItem('lastQuizSeenAt');
    if (!lastSeen) return 0;
    const last = new Date(lastSeen).getTime();
    return (availableQuizzes || []).filter((q) => new Date(q.createdAt).getTime() > last).length;
  }, [availableQuizzes]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">Student Overview</p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">
            Welcome back, let&apos;s continue your streak
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Quickly jump into notes, quizzes, and assignments while tracking your learning progress.
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/quizzes" className="btn-primary text-xs md:text-sm">
            Continue Quiz
          </Link>
          <Link to="/notes" className="btn-secondary text-xs md:text-sm">
            Browse Notes
          </Link>
        </div>
      </div>

      {/* XP + streak row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="card col-span-2 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">XP Progress</p>
              <p className="text-lg font-semibold text-slate-50">Level 7 – Active Learner</p>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">
              +220 XP this week
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full w-2/3 bg-gradient-to-r from-primary-500 to-secondary-500" />
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Next badge: Top Scorer</span>
            <span>230 XP to go</span>
          </div>
        </div>
        <div className="card flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-400 mb-1">Weekly streak</p>
            <p className="text-2xl font-semibold text-slate-50">5 days</p>
          </div>
          <p className="text-xs text-primary-300 mt-2">
            {loadingQuizzes ? 'Checking new quizzes...' : `${newQuizCount} new quizzes added`}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Saved notes */}
        <motion.div
          className="xl:col-span-2 card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-50">Saved notes</h2>
              <p className="text-xs text-slate-400">Your bookmarked notes for quick revision.</p>
            </div>
            <Link to="/notes" className="text-[11px] text-primary-200 hover:text-primary-100">
              View all →
            </Link>
          </div>
          <div className="space-y-2">
            {savedNotes.map((note) => (
              <div
                key={note.title}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
              >
                <div>
                  <p className="font-medium text-slate-50">{note.title}</p>
                  <p className="text-[11px] text-slate-400">{note.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] text-amber-300">★ {note.rating}</p>
                  <button className="mt-1 px-2 py-0.5 rounded-lg bg-primary-500/10 text-[11px] text-primary-200">
                    Open
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent quizzes */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.35 }}
        >
          <div className="card">
            <h2 className="text-sm font-semibold text-slate-50 mb-3">Recent quizzes</h2>
            <div className="space-y-2 text-xs text-slate-300">
              {recentQuizzes.map((quiz) => (
                <div key={quiz.title} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-50">{quiz.title}</p>
                    <p className="text-[11px] text-slate-400">Score: {quiz.score}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-[11px] ${
                        quiz.status === 'Improved' ? 'text-emerald-300' : 'text-amber-300'
                      }`}
                    >
                      {quiz.trend} ({quiz.status})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-sm font-semibold text-slate-50 mb-3">Upcoming</h2>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center justify-between">
                <span>DBMS quiz – Module 3</span>
                <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 text-[11px]">Tomorrow • 7 PM</span>
              </li>
              <li className="flex items-center justify-between">
                <span>OS assignment submission</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px]">In 3 days</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Announcements</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px]">2 unread</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;

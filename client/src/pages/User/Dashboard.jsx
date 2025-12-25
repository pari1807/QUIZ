import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { userAPI } from '../../services/api';
import socketService from '../../services/socket';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [savedNotes, setSavedNotes] = useState([]);
  const [topPerformers, setTopPerformers] = useState([]);
  const [isDailyLeaderboard, setIsDailyLeaderboard] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [viewerLoading, setViewerLoading] = useState(false);

  useEffect(() => {
    socketService.joinRankings();
    socketService.onTopPerformersUpdate(({ topPerformers, isDaily }) => {
      setTopPerformers(topPerformers);
      if (isDaily !== undefined) setIsDailyLeaderboard(isDaily);
    });
    return () => {
      socketService.leaveRankings();
      socketService.offTopPerformersUpdate();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [quizzesRes, dashboardRes, savedNotesRes, upcomingRes] = await Promise.all([
          userAPI.getAvailableQuizzes(),
          userAPI.getDashboardOverview(),
          userAPI.getSavedNotes(),
          userAPI.getUpcomingEvents()
        ]);
        
        if (!mounted) return;
        setAvailableQuizzes(quizzesRes.data || []);
        setDashboardData({
            ...dashboardRes.data,
            upcomingEvents: upcomingRes.data
        });
        setSavedNotes(savedNotesRes.data || []);
        if (dashboardRes.data?.topPerformers) {
          setTopPerformers(dashboardRes.data.topPerformers);
        }
        if (dashboardRes.data?.isDailyLeaderboard !== undefined) {
          setIsDailyLeaderboard(dashboardRes.data.isDailyLeaderboard);
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error);
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

  const handleOpenViewer = async (note) => {
    try {
      setViewerLoading(true);
      const { data } = await userAPI.downloadNote(note._id);
      if (data.url) {
        setSelectedNote({ ...note, viewUrl: data.url });
      } else {
        toast.error("Resource URL not found");
      }
    } catch (error) {
      toast.error("Failed to retrieve document stream");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 space-y-6">
      {/* Compact Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="flex items-center gap-2">
             <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded-lg">Operational Status: Online</span>
             {dashboardData?.upcomingEvents?.activeLiveQuizzes?.length > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/10 px-2 py-0.5 rounded-lg animate-pulse">
                   Live Quiz Active
                </span>
             )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight">
            Greetings, {dashboardData?.user?.username || 'Student'}
          </h1>
          <p className="text-xs text-slate-400 font-medium">Continue your academic progression and reach new milestones.</p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
           <Link to="/quizzes" className="flex-1 md:flex-none px-6 py-2.5 bg-slate-50 text-slate-900 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-xl shadow-white/5 active:scale-95 text-center">
              Continue Quiz
           </Link>
           <Link to="/notes" className="flex-1 md:flex-none px-6 py-2.5 bg-slate-800 text-slate-300 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all active:scale-95 text-center">
              Browse Notes
           </Link>
        </div>

        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
      </div>

      {/* Unified Stats Command Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         {[
           { label: 'Academic Level', value: `LVL ${dashboardData?.user?.level || 1}`, sub: `${dashboardData?.user?.xpPoints || 0} Total XP`, icon: '💎', color: 'from-blue-500/20 to-indigo-500/20' },
           { label: 'Activity Streak', value: `${dashboardData?.stats?.streak || 0} Days`, sub: 'Current Consistency', icon: '🔥', color: 'from-orange-500/20 to-rose-500/20' },
           { label: 'Course Progress', value: `${dashboardData?.stats?.progressPercentage || 0}%`, sub: `${dashboardData?.stats?.userContent || 0} Items Logged`, icon: '📈', color: 'from-emerald-500/20 to-teal-500/20' },
           { label: 'Global Standing', value: `#${dashboardData?.user?.globalRank || '...'}`, sub: 'Among all students', icon: '🌍', color: 'from-purple-500/20 to-pink-500/20' }
         ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative overflow-hidden bg-slate-900/40 border border-slate-800 p-4 rounded-3xl backdrop-blur-md group hover:border-slate-700 transition-colors`}
            >
               <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${stat.color} blur-2xl opacity-40 group-hover:opacity-60 transition-opacity`} />
               <div className="relative z-10 flex flex-col gap-0.5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                     <span className="text-[10px]">{stat.icon}</span> {stat.label}
                  </span>
                  <p className="text-xl font-black text-slate-50 tracking-tighter leading-none py-1">{stat.value}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{stat.sub}</p>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Left Column: Saved Notes (High Density) */}
         <div className="lg:col-span-8 space-y-6">
            <motion.div 
              className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
               <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-black text-slate-50 uppercase tracking-widest flex items-center gap-2">
                       <span className="h-2 w-2 rounded-full bg-primary-500" />
                       Saved Archives
                    </h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">Recently bookmarked academic material</p>
                  </div>
                  <Link to="/notes" className="text-[10px] font-black text-primary-400 hover:text-primary-300 uppercase tracking-widest border-b border-primary-500/20 transition-all hover:border-primary-400">
                     Access All →
                  </Link>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {savedNotes.length === 0 ? (
                    <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-slate-800">
                       <p className="text-xs font-bold text-slate-500 uppercase tracking-widest italic">No synced archives found</p>
                    </div>
                  ) : (
                    savedNotes.slice(0, 4).map((note) => (
                      <div key={note._id} className="group flex items-center justify-between bg-slate-950/40 border border-slate-800 rounded-2xl px-4 py-3 hover:border-slate-700 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-xl bg-slate-900 flex items-center justify-center text-xs shadow-inner">📄</div>
                           <div>
                              <p className="text-xs font-bold text-slate-50 group-hover:text-primary-400 transition-colors line-clamp-1">{note.title}</p>
                              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{note.subject}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <button 
                             onClick={() => handleOpenViewer(note)}
                             className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-slate-100 transition-all border border-slate-800 hover:border-slate-600 active:scale-95"
                           >
                              <span className="text-[10px] font-black uppercase tracking-widest px-2">Open</span>
                           </button>
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </motion.div>

            {/* Recent Activities Section */}
            <motion.div 
               className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 backdrop-blur-xl"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 0.1 }}
            >
               <h2 className="text-sm font-black text-slate-50 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Recent Assessments
               </h2>
               <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black text-slate-600 uppercase tracking-widest border-b border-slate-800">
                       <tr>
                          <th className="pb-4 px-2">Quiz Archive</th>
                          <th className="pb-4 px-2">Performance</th>
                          <th className="pb-4 px-2 text-right">Status</th>
                       </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-slate-300">
                       {!dashboardData?.recentQuizzes?.length ? (
                          <tr><td colSpan="3" className="py-8 text-center text-slate-600 uppercase italic text-[10px] tracking-widest">No recent attempts logged</td></tr>
                       ) : (
                          dashboardData.recentQuizzes.slice(0, 5).map((quiz) => (
                             <tr key={quiz._id} className="border-b border-slate-800/50 hover:bg-slate-800/10 transition-colors">
                                <td className="py-4 px-2">
                                   <p className="text-slate-100 tracking-tight">{quiz.title}</p>
                                   <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{quiz.subject || 'Core module'}</p>
                                </td>
                                <td className="py-4 px-2">
                                   <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-16 bg-slate-800 rounded-full overflow-hidden">
                                         <div className={`h-full ${quiz.isPassed ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: quiz.percentage }} />
                                      </div>
                                      <span className="text-[10px] tracking-tighter">{quiz.percentage}</span>
                                   </div>
                                </td>
                                <td className="py-4 px-2 text-right">
                                   <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${quiz.isPassed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                      {quiz.status}
                                   </span>
                                </td>
                             </tr>
                          ))
                       )}
                    </tbody>
                 </table>
               </div>
            </motion.div>
         </div>

         {/* Right Column: Mini Leaderboard & Live Status */}
         <div className="lg:col-span-4 space-y-6">
            <motion.div 
               className="bg-slate-900 border border-primary-500/20 rounded-[32px] p-6 shadow-2xl shadow-primary-500/5"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
            >
               <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm font-black text-slate-50 uppercase tracking-widest">Global Elite</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">{isDailyLeaderboard ? 'Daily Rank' : 'Hall of Fame'}</p>
                  </div>
                  <span className="flex items-center gap-1 text-[9px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">
                     <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     Live sync
                  </span>
               </div>

               <div className="space-y-3">
                  {topPerformers.slice(0, 3).map((performer, idx) => (
                    <div key={performer.userId} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800 group hover:border-primary-500/30 transition-all">
                       <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm relative ${
                            idx === 0 ? 'bg-amber-400 text-slate-900' : idx === 1 ? 'bg-slate-300 text-slate-900' : 'bg-amber-700 text-slate-100'
                          }`}>
                             {performer.username[0].toUpperCase()}
                             <div className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px]">
                                {idx + 1}
                             </div>
                          </div>
                          <div>
                             <p className="text-xs font-black text-slate-50 uppercase group-hover:text-primary-400 transition-colors tracking-tight">{performer.username}</p>
                             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{performer.score} XP</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <span className="text-lg">
                             {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
                          </span>
                       </div>
                    </div>
                  ))}
               </div>
            </motion.div>

            {/* Daily Challenge Card */}
            <motion.div 
               className="bg-gradient-to-br from-primary-600/20 to-indigo-600/20 border border-primary-500/30 rounded-[32px] p-6 relative overflow-hidden group"
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
            >
               <div className="relative z-10 flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-black text-primary-300 uppercase tracking-widest">Active Challenge</span>
                    <h3 className="text-lg font-black text-slate-50 tracking-tight leading-tight mt-1">Strengthen your streak to unlock Elite perks.</h3>
                  </div>
                  <Link to="/quizzes" className="w-full py-2.5 bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-400 transition-all shadow-lg shadow-primary-500/20 text-center active:scale-95">
                     Initiate Session
                  </Link>
               </div>
               <div className="absolute -bottom-12 -right-12 h-32 w-32 bg-primary-500/20 blur-[40px] rounded-full group-hover:bg-primary-500/30 transition-all" />
            </motion.div>
         </div>
      </div>

      {/* Internal PDF Viewer HUD */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/98 flex flex-col items-center justify-center"
          >
             <div className="w-full h-full flex flex-col bg-slate-900 shadow-2xl overflow-hidden text-left">
                {/* Viewer Header */}
                <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between z-20">
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => {
                          setSelectedNote(null);
                          setViewerLoading(false);
                        }}
                        className="group h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-800 hover:bg-primary-500/20 text-slate-400 hover:text-primary-400 transition-all border border-slate-700 hover:border-primary-500/30"
                      >
                        <span className="text-xl rotate-180 group-active:translate-x-1 transition-transform">→</span>
                      </button>
                      <div>
                         <h3 className="text-sm font-black text-slate-50 tracking-tight uppercase leading-none">{selectedNote.title}</h3>
                         <div className="flex items-center gap-2.5 mt-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                               Secure Document View • {selectedNote.subject}
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <a 
                        href={selectedNote.viewUrl} 
                        download
                        className="hidden md:flex px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20"
                      >
                         DOWNLOAD
                      </a>
                      <button 
                        onClick={() => {
                          setSelectedNote(null);
                          setViewerLoading(false);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 hover:border-rose-500/30"
                      >
                         TERMINATE
                      </button>
                   </div>
                </div>

                {/* Secure Iframe Stream */}
                <div className="flex-1 bg-slate-100 relative overflow-auto flex items-center justify-center p-4">
                   {viewerLoading && (
                     <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initialising Stream...</p>
                     </div>
                   )}
                   <iframe 
                     src={selectedNote.viewUrl} 
                     onLoad={() => setViewerLoading(false)}
                     className="w-full h-full max-w-5xl bg-white shadow-2xl rounded-sm border-none z-0"
                     title={selectedNote.title}
                   />
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;

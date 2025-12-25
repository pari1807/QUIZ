import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../../services/api';
import socketService from '../../services/socket';

const quickLinks = [
  { to: '/admin/quizzes', label: 'Quiz Engine', desc: 'Create and manage quiz sessions', badge: 'Quizzes', icon: '📝' },
  { to: '/admin/notes', label: 'Moderation Hub', desc: 'Review and approve content', badge: 'Notes', icon: '📎' },
  { to: '/admin/classrooms', label: 'Access Control', desc: 'Manage students and roles', badge: 'Users', icon: '🛡️' },
  { to: '/admin/analytics', label: 'Metric Insight', desc: 'Performance and engagement data', badge: 'Analytics', icon: '📊' },
];

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState([]);
  const [isDailyLeaderboard, setIsDailyLeaderboard] = useState(true);
  const [recentActivity, setRecentActivity] = useState(null);

  useEffect(() => {
    socketService.joinAdminDashboard();
    socketService.onTopPerformersUpdate(({ topPerformers, recentActivity, isDaily }) => {
      setTopPerformers(topPerformers);
      if (isDaily !== undefined) setIsDailyLeaderboard(isDaily);
      if (recentActivity) {
        setRecentActivity(recentActivity);
        setTimeout(() => setRecentActivity(null), 5000);
      }
    });

    return () => {
      socketService.leaveAdminDashboard();
      socketService.offTopPerformersUpdate();
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const response = await adminAPI.getDashboardStats();
        if (mounted) {
          setDashboardStats(response.data?.stats || null);
          if (response.data?.topPerformers) {
            setTopPerformers(response.data.topPerformers);
          }
          if (response.data?.isDailyLeaderboard !== undefined) {
            setIsDailyLeaderboard(response.data.isDailyLeaderboard);
          }
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 30000);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const monitorItems = useMemo(() => [
    { label: 'Total Students', value: dashboardStats?.totalStudents || 0, sub: `${dashboardStats?.activeUsersNow || 0} active now`, icon: '👥' },
    { label: 'Live Quizzes', value: dashboardStats?.activeQuizzesNow || 0, sub: 'Currently active', icon: '🎯' },
    { label: 'Pending Notes', value: dashboardStats?.totalNotes || 0, sub: 'Awaiting review', icon: '🛡️' },
  ], [dashboardStats]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-2 space-y-6">
      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 backdrop-blur-xl">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded-lg w-fit">Admin Portal</p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-50 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-medium italic">Overview of your learning platform performance.</p>
        </div>

        <div className="flex items-center gap-3">
           <Link to="/admin/quizzes" className="px-6 py-2.5 bg-primary-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary-500 transition-all shadow-xl shadow-primary-500/10 active:scale-95">
              Create Quiz
           </Link>
           <Link to="/admin/announcements" className="px-6 py-2.5 bg-slate-800 text-slate-300 text-[11px] font-black uppercase tracking-widest rounded-2xl border border-slate-700 hover:bg-slate-700 transition-all active:scale-95">
              New Announcement
           </Link>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         {monitorItems.map((item, i) => {
            const isStudents = item.label === 'Total Students';
            const CardWrapper = isStudents ? Link : 'div';
            const wrapperProps = isStudents ? { to: '/admin/students', className: "block group" } : { className: "group" };

            return (
               <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-md relative hover:border-slate-700 transition-all"
               >
                  <CardWrapper {...wrapperProps}>
                     <div className="p-5 flex flex-col gap-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                           <span className="text-[14px]">{item.icon}</span> {item.label}
                        </span>
                        <p className="text-2xl font-black text-slate-50 tracking-tighter leading-none py-1">
                           {loading ? '...' : item.value}
                        </p>
                        <p className="text-[10px] font-black uppercase tracking-tight text-primary-500">{item.sub}</p>
                     </div>
                  </CardWrapper>
               </motion.div>
            );
         })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Main Workflows */}
         <div className="lg:col-span-8">
            <motion.div 
               className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 backdrop-blur-xl h-full"
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
            >
               <h2 className="text-sm font-black text-slate-50 uppercase tracking-widest flex items-center gap-2 mb-6">
                   <span className="h-2 w-2 rounded-full bg-primary-500" />
                   Quick Actions
               </h2>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {quickLinks.map((link, i) => (
                    <Link key={i} to={link.to} className="group p-5 bg-slate-950/40 border border-slate-800 rounded-2xl flex flex-col gap-2 hover:border-primary-500/40 transition-all">
                       <div className="flex items-center justify-between font-black">
                          <span className="text-[16px]">{link.icon}</span>
                          <span className="text-[9px] text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-lg uppercase tracking-widest">{link.badge}</span>
                       </div>
                       <div>
                          <p className="text-xs font-black text-slate-50 uppercase tracking-tight group-hover:text-primary-400 transition-colors">{link.label}</p>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{link.desc}</p>
                       </div>
                    </Link>
                  ))}
               </div>
            </motion.div>
         </div>

         {/* Leaderboard Monitor */}
         <div className="lg:col-span-4">
            <motion.div 
               className="bg-slate-900 border border-primary-500/20 rounded-[32px] p-6 shadow-2xl shadow-primary-500/10 h-full"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
            >
               <h2 className="text-sm font-black text-slate-50 uppercase tracking-widest mb-6">Student Rankings</h2>

               <div className="space-y-3">
                  {topPerformers.length === 0 ? (
                    <p className="text-center py-12 text-[10px] text-slate-600 font-black uppercase italic tracking-widest">No data available...</p>
                  ) : (
                    topPerformers.slice(0, 5).map((performer, idx) => (
                      <div key={performer.userId} className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/40 border border-slate-800/60 transition-all">
                         <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center font-black text-[10px] ${
                              idx === 0 ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-slate-400'
                            }`}>
                               {performer.username[0].toUpperCase()}
                            </div>
                            <div>
                               <p className="text-[11px] font-black text-slate-100 uppercase tracking-tight">{performer.username}</p>
                               <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">{performer.score} XP</p>
                            </div>
                         </div>
                         <div className="text-[14px]">
                            {idx === 0 ? '🏆' : idx === 1 ? '🥇' : idx === 2 ? '🥈' : '🎖️'}
                         </div>
                      </div>
                    ))
                  )}
               </div>
            </motion.div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;

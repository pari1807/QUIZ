import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../../services/api';

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await userAPI.getUserClassrooms();
        setClassrooms(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load classrooms');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">My Classrooms</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            All classrooms you are part of. Open a classroom to view playlists and videos added by your teacher.
          </p>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/30 rounded-lg px-4 py-3"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-50">Available Classrooms</h2>
          {loading && (
            <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
          )}
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
            <p className="text-sm text-slate-400 mt-2">Loading classrooms...</p>
          </div>
        )}

        {classrooms.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-xl"
          >
            <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-sm text-slate-400 mt-3">You are not part of any classrooms yet</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {classrooms.map((c, idx) => (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="group bg-slate-950/80 border border-slate-800 rounded-lg p-4 hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
              >
                <div className="flex flex-col h-full">
                  <div className="flex-1 mb-3">
                    <h3 className="text-base font-semibold text-slate-50 mb-1 truncate">{c.name || 'Classroom'}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2">
                      {c.description || 'No description provided.'}
                    </p>
                  </div>
                  <Link
                    to={`/classrooms/${c._id}/videos`}
                    className="block w-full text-center text-sm px-4 py-2 rounded-lg bg-primary-600/20 border border-primary-500/50 text-primary-200 hover:bg-primary-500/30 transition-all"
                  >
                    View Playlists
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Classrooms;

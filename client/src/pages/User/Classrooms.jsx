import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">Classrooms</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            All classrooms you are part of. Open a classroom to view topic-wise videos added by your
            teacher (YouTube / Google Drive links or uploaded videos).
          </p>
        </div>
      </div>

      {error && (
        <div className="text-[11px] text-rose-400 bg-rose-500/5 border border-rose-500/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-slate-50">My classrooms</h2>
          {loading && <span className="text-[11px] text-slate-400">Loading...</span>}
        </div>
        <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
          {classrooms.length === 0 && !loading && (
            <p className="text-xs text-slate-500">You are not part of any classrooms yet.</p>
          )}
          {classrooms.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between gap-3 border border-slate-800 rounded-lg bg-slate-950/70 px-3 py-2 text-xs"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-50 truncate">{c.name || 'Classroom'}</p>
                <p className="text-[11px] text-slate-400 truncate">
                  {c.description || 'No description provided.'}
                </p>
              </div>
              <Link
                to={`/classrooms/${c._id}/videos`}
                className="text-[11px] px-2.5 py-1 rounded-lg border border-primary-500/70 text-primary-200 hover:bg-primary-500/10 whitespace-nowrap"
              >
                View videos
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Classrooms;

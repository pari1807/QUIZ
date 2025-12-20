import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';

const Analytics = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setError('');
      const { data } = await adminAPI.getUserPerformanceSummary(
        search ? { search } : undefined
      );
      setUsers(data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDetail = async (userId) => {
    try {
      setLoadingDetail(true);
      setError('');
      const { data } = await adminAPI.getUserPerformanceDetail(userId);
      setDetail(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user performance');
    } finally {
      setLoadingDetail(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchDetail(selectedUserId);
    }
  }, [selectedUserId]);

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            View quiz performance of all students and drill down into individual profiles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Students</h2>
              {loadingUsers && (
                <span className="text-xs text-slate-400">Loading...</span>
              )}
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 mb-3"
            >
              <input
                type="text"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-slate-950/70 border border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary-600 hover:bg-primary-500 text-white"
              >
                Search
              </button>
            </form>

            <div className="border-t border-slate-800 mt-3 -mx-4" />

            <div className="mt-3 max-h-[420px] overflow-y-auto pr-1 space-y-1">
              {users.length === 0 && !loadingUsers && (
                <p className="text-xs text-slate-500">No quiz attempts yet.</p>
              )}

              {users.map((u) => (
                <button
                  key={u.userId}
                  onClick={() => handleSelectUser(u.userId)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-sm transition-colors border ${
                    selectedUserId === u.userId
                      ? 'bg-slate-900 border-primary-500/70 text-primary-100'
                      : 'bg-slate-950/60 border-slate-800 hover:bg-slate-900/80'
                  }`}
                >
                  <div>
                    <p className="font-medium">{u.username}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-300">
                    <p>
                      Attempts: <span className="font-semibold">{u.attemptsCount}</span>
                    </p>
                    <p>
                      Avg: <span className="font-semibold">{u.avgPercentage?.toFixed?.(2) ?? u.avgPercentage}%</span>
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Student Performance</h2>
              {loadingDetail && selectedUserId && (
                <span className="text-xs text-slate-400">Loading details...</span>
              )}
            </div>

            {error && (
              <div className="mb-3 text-xs text-rose-400 bg-rose-900/30 border border-rose-700/50 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            {!selectedUserId && (
              <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
                Select a student from the left to view detailed quiz performance.
              </div>
            )}

            {selectedUserId && detail && (
              <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-sm font-semibold">
                      {detail.user?.username?.[0]?.toUpperCase?.() || '?'}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">
                        {detail.user?.username}
                      </p>
                      <p className="text-xs text-slate-400">{detail.user?.email}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {detail.user?.course && detail.user?.semester
                          ? `${detail.user.course} • ${detail.user.semester}`
                          : detail.user?.course || detail.user?.semester || 'No course info'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
                      <p className="text-slate-400">Attempts</p>
                      <p className="font-semibold text-sm">
                        {detail.summary?.totalAttempts || 0}
                      </p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
                      <p className="text-slate-400">Avg %</p>
                      <p className="font-semibold text-sm">
                        {detail.summary?.avgPercentage ?? 0}%
                      </p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
                      <p className="text-slate-400">Best %</p>
                      <p className="font-semibold text-sm">
                        {detail.summary?.bestPercentage ?? 0}%
                      </p>
                    </div>
                    <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2">
                      <p className="text-slate-400">XP / Level</p>
                      <p className="font-semibold text-sm">
                        {detail.user?.xpPoints ?? 0} XP • L{detail.user?.level ?? 1}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-800 -mx-4" />

                <div className="flex-1 overflow-y-auto -mx-2 px-2">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead className="sticky top-0 bg-slate-900">
                      <tr className="text-slate-400 border-b border-slate-800">
                        <th className="py-2 px-2 font-medium">Quiz</th>
                        <th className="py-2 px-2 font-medium">Subject</th>
                        <th className="py-2 px-2 font-medium text-right">Score</th>
                        <th className="py-2 px-2 font-medium text-right">%</th>
                        <th className="py-2 px-2 font-medium text-right">Attempted At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.attempts?.length === 0 && (
                        <tr>
                          <td
                            colSpan={5}
                            className="py-4 text-center text-slate-500"
                          >
                            No graded quiz attempts yet.
                          </td>
                        </tr>
                      )}

                      {detail.attempts?.map((attempt) => (
                        <tr
                          key={attempt._id}
                          onClick={() => navigate(`/admin/attempts/${attempt._id}`)}
                          className="border-b border-slate-800/70 hover:bg-slate-900/60 cursor-pointer"
                        >
                          <td className="py-2 px-2">
                            {attempt.quiz?.title || 'Untitled Quiz'}
                          </td>
                          <td className="py-2 px-2 text-slate-300">
                            {attempt.quiz?.subject || '-'}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {attempt.score} / {attempt.maxScore}
                          </td>
                          <td className="py-2 px-2 text-right">
                            {attempt.percentage?.toFixed?.(2) ?? attempt.percentage}%
                          </td>
                          <td className="py-2 px-2 text-right text-slate-400">
                            {attempt.submittedAt
                              ? new Date(attempt.submittedAt).toLocaleString()
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

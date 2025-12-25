import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';

const VIDEO_KINDS = [
  { value: 'url', label: 'Link (YouTube / Drive / any URL)' },
  { value: 'upload', label: 'Upload video file' },
];

const Classrooms = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [selectedClassroomId, setSelectedClassroomId] = useState('');

  const [topics, setTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);

  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoKind, setVideoKind] = useState('url');
  const [videoFile, setVideoFile] = useState(null);
  const [addingVideoForTopicId, setAddingVideoForTopicId] = useState('');

  const [editingTopicId, setEditingTopicId] = useState('');
  const [editingTopicName, setEditingTopicName] = useState('');
  const [editingTopicDescription, setEditingTopicDescription] = useState('');

  const [expandedTopicId, setExpandedTopicId] = useState('');

  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const selectedClassroom = classrooms.find((c) => c._id === selectedClassroomId);

  useEffect(() => {
    const loadClassrooms = async () => {
      try {
        setError('');
        const res = await adminAPI.getAllClassrooms();
        const data = res.data || [];
        setClassrooms(data);
        // Auto-select first classroom
        if (data.length > 0 && !selectedClassroomId) {
          setSelectedClassroomId(data[0]._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load classrooms');
      }
    };

    loadClassrooms();
  }, []);

  const handleAddAllUsers = async () => {
    if (!selectedClassroomId) {
      setError('Please select a classroom first');
      return;
    }
    
    if (!confirm('Add all registered users to this classroom as students?')) return;
    
    try {
      setError('');
      // This will add all users - you may want to customize this
      await adminAPI.addAllUsersToClassroom(selectedClassroomId);
      alert('All users have been added to the classroom!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add users');
    }
  };

  useEffect(() => {
    if (!selectedClassroomId) {
      setTopics([]);
      return;
    }

    const loadTopics = async () => {
      try {
        setLoadingTopics(true);
        setError('');
        const res = await adminAPI.getClassroomTopics(selectedClassroomId);
        setTopics(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load topics');
      } finally {
        setLoadingTopics(false);
      }
    };

    loadTopics();
  }, [selectedClassroomId]);

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!selectedClassroomId || !newTopicName.trim()) return;

    try {
      setCreatingTopic(true);
      setError('');
      const res = await adminAPI.createClassroomTopic(selectedClassroomId, {
        name: newTopicName.trim(),
        description: newTopicDescription.trim(),
      });
      setTopics((prev) => [res.data, ...prev]);
      setNewTopicName('');
      setNewTopicDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic');
    } finally {
      setCreatingTopic(false);
    }
  };

  const handleVideoFileChange = (e) => {
    const file = e.target.files?.[0];
    setVideoFile(file || null);
  };

  const handleAddVideo = async (e, topicId) => {
    e.preventDefault();
    if (!selectedClassroomId || !topicId || !videoTitle.trim()) return;
    if (videoKind === 'url' && !videoUrl.trim()) return;
    if (videoKind === 'upload' && !videoFile) return;

    try {
      setAddingVideoForTopicId(topicId);
      setError('');
      const formData = new FormData();
      formData.append('title', videoTitle.trim());
      formData.append('description', videoDescription.trim());
      formData.append('kind', videoKind);
      if (videoKind === 'url') {
        formData.append('url', videoUrl.trim());
      } else if (videoKind === 'upload' && videoFile) {
        formData.append('file', videoFile);
      }

      const res = await adminAPI.addClassroomTopicVideo(
        selectedClassroomId,
        topicId,
        formData
      );

      setTopics((prev) =>
        prev.map((t) =>
          (t._id || t.id) === topicId
            ? { ...t, videos: [res.data, ...(t.videos || [])] }
            : t
        )
      );

      setVideoTitle('');
      setVideoDescription('');
      setVideoUrl('');
      setVideoFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add video');
      console.error('Video upload error:', err);
    } finally {
      setAddingVideoForTopicId('');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!selectedClassroomId || !confirm('Are you sure you want to delete this topic?')) return;
    try {
      setError('');
      await adminAPI.deleteClassroomTopic(selectedClassroomId, topicId);
      setTopics((prev) => prev.filter((t) => (t._id || t.id) !== topicId));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete topic');
    }
  };

  const handleRemoveVideo = async (topicId, videoId) => {
    if (!selectedClassroomId || !confirm('Are you sure you want to remove this video?')) return;
    try {
      setError('');
      await adminAPI.removeClassroomTopicVideo(selectedClassroomId, topicId, videoId);
      setTopics((prev) =>
        prev.map((t) =>
          (t._id || t.id) === topicId
            ? { ...t, videos: (t.videos || []).filter((v) => (v._id || v.id) !== videoId) }
            : t
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove video');
    }
  };

  const handlePublishTopic = async (topicId, currentlyPublished) => {
    if (!selectedClassroomId) return;
    try {
      setError('');
      const newPublishedState = !currentlyPublished;
      await adminAPI.publishClassroomTopic(selectedClassroomId, topicId, newPublishedState);
      setTopics((prev) =>
        prev.map((t) =>
          (t._id || t.id) === topicId
            ? { ...t, published: newPublishedState }
            : t
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to publish/unpublish topic');
    }
  };

  const startEditTopic = (topic) => {
    const id = topic._id || topic.id;
    setEditingTopicId(id);
    setEditingTopicName(topic.name || '');
    setEditingTopicDescription(topic.description || '');
  };

  const cancelEditTopic = () => {
    setEditingTopicId('');
    setEditingTopicName('');
    setEditingTopicDescription('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-50">Course Manager</h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Organize your content into topics and playlists. Add videos via links or direct uploads.
          </p>
        </div>
        {selectedClassroom && (
          <button
            onClick={handleAddAllUsers}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
          >
            + Add All Users
          </button>
        )}
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

      <div className="space-y-6">
        {!selectedClassroom && (
          <p className="text-sm text-slate-500">Select a classroom to manage its playlists.</p>
        )}

        {selectedClassroom && (
          <motion.div layout className="space-y-6">
            {/* Create New Topic Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 rounded-xl p-5 backdrop-blur-sm"
            >
              <h2 className="text-sm font-semibold text-slate-50 mb-3">Create New Playlist</h2>
              <form onSubmit={handleCreateTopic} className="space-y-3">
                <input
                  type="text"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  placeholder="Playlist name (e.g. JavaScript Fundamentals)"
                  className="w-full rounded-lg bg-slate-950/70 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70 transition-all"
                />
                <textarea
                  rows={2}
                  value={newTopicDescription}
                  onChange={(e) => setNewTopicDescription(e.target.value)}
                  placeholder="Short description (optional)"
                  className="w-full rounded-lg bg-slate-950/70 border border-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70 resize-none transition-all"
                />
                <button
                  type="submit"
                  disabled={creatingTopic || !newTopicName.trim()}
                  className="inline-flex items-center justify-center rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium px-5 py-2.5 text-white transition-all shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
                >
                  {creatingTopic ? (
                    <><svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating...</>
                  ) : (
                    '+ Add Playlist'
                  )}
                </button>
              </form>
            </motion.div>

            {/* Topics/Playlists List */}
            <div className="space-y-4">
              {loadingTopics && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                  <p className="text-sm text-slate-400 mt-2">Loading playlists...</p>
                </div>
              )}

              {topics.length === 0 && !loadingTopics && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-xl"
                >
                  <svg className="mx-auto h-12 w-12 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-sm text-slate-400 mt-3">No playlists yet. Create one to get started!</p>
                </motion.div>
              )}

              <AnimatePresence>
                {topics.map((t, topicIdx) => {
                  const id = t._id || t.id;
                  const isExpanded = expandedTopicId === id;
                  return (
                    <motion.div
                      key={id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: topicIdx * 0.05 }}
                      className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800 rounded-xl overflow-hidden backdrop-blur-sm hover:border-slate-700 transition-all"
                    >
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1 min-w-0">
                            {editingTopicId === id ? (
                              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                                <input
                                  type="text"
                                  value={editingTopicName}
                                  onChange={(e) => setEditingTopicName(e.target.value)}
                                  className="w-full rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70"
                                />
                                <textarea
                                  rows={2}
                                  value={editingTopicDescription}
                                  onChange={(e) => setEditingTopicDescription(e.target.value)}
                                  className="w-full rounded-lg bg-slate-950/70 border border-slate-800 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70"
                                />
                              </motion.div>
                            ) : (
                              <>
                                <h3 className="text-lg font-semibold text-slate-50 truncate">{t.name}</h3>
                                {t.description && (
                                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                                )}
                              </>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2">
                              <span className="px-3 py-1 rounded-full text-xs bg-slate-800/80 border border-slate-700 text-slate-300">
                                {(t.videos || []).length} {(t.videos || []).length === 1 ? 'video' : 'videos'}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs border ${
                                t.published
                                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                                  : 'bg-amber-500/10 border-amber-500/50 text-amber-400'
                              }`}>
                                {t.published ? '✓ Published' : 'Draft'}
                              </span>
                            </div>
                            <div className="flex gap-2">
                              {editingTopicId === id ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={cancelEditTopic}
                                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-800/80 transition-all"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!editingTopicName.trim()}
                                    className="px-3 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-500 text-xs text-white disabled:opacity-60 transition-all"
                                  >
                                    Save
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTopic(id)}
                                    className="px-3 py-1.5 rounded-lg border border-red-500/30 text-xs text-red-400 hover:bg-red-500/10 transition-all"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startEditTopic(t)}
                                    className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-800/80 transition-all"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handlePublishTopic(id, t.published)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                      t.published
                                        ? 'bg-amber-500/10 border border-amber-500/50 text-amber-400 hover:bg-amber-500/20'
                                        : 'bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/20'
                                    }`}
                                    title={t.published ? 'Hide this playlist from users' : 'Make this playlist visible to users'}
                                  >
                                    {t.published 
                                      ? '🔒 Unpublish' 
                                      : (t.videos && t.videos.length > 0) 
                                        ? '✓ Publish Playlist' 
                                        : '📝 Publish (Empty)'
                                    }
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedTopicId(isExpanded ? '' : id)}
                                    className="px-3 py-1.5 rounded-lg bg-primary-600/20 border border-primary-500/50 text-xs text-primary-200 hover:bg-primary-500/30 transition-all"
                                  >
                                    {isExpanded ? '− Collapse' : '+ Manage Videos'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="space-y-4 border-t border-slate-800 pt-4 mt-4"
                            >
                              {/* Add Video Form */}
                              <div className="bg-slate-950/50 rounded-lg p-4 border border-slate-800/50">
                                <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Add Video</h4>
                                <form onSubmit={(e) => handleAddVideo(e, id)} className="space-y-3">
                                  <input
                                    type="text"
                                    value={videoTitle}
                                    onChange={(e) => setVideoTitle(e.target.value)}
                                    placeholder="Video title"
                                    className="w-full rounded-lg bg-slate-900/70 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70"
                                  />
                                  
                                  <div className="flex gap-2">
                                    <select
                                      value={videoKind}
                                      onChange={(e) => {
                                        setVideoKind(e.target.value);
                                        setVideoUrl('');
                                        setVideoFile(null);
                                      }}
                                      className="flex-1 rounded-lg bg-slate-900/70 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70"
                                    >
                                      {VIDEO_KINDS.map((k) => (
                                        <option key={k.value} value={k.value}>
                                          {k.label}
                                        </option>
                                      ))}
                                    </select>
                                    <button
                                      type="submit"
                                      disabled={
                                        addingVideoForTopicId === id ||
                                        !videoTitle.trim() ||
                                        (videoKind === 'url' && !videoUrl.trim()) ||
                                        (videoKind === 'upload' && !videoFile)
                                      }
                                      className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 disabled:opacity-60 disabled:cursor-not-allowed text-sm font-medium text-white transition-all"
                                    >
                                      {addingVideoForTopicId === id ? 'Adding...' : '+ Add'}
                                    </button>
                                  </div>

                                  {videoKind === 'url' && (
                                    <input
                                      type="text"
                                      value={videoUrl}
                                      onChange={(e) => setVideoUrl(e.target.value)}
                                      placeholder="Paste YouTube / Drive / any video link here"
                                      className="w-full rounded-lg bg-slate-900/70 border border-slate-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70"
                                    />
                                  )}

                                  {videoKind === 'upload' && (
                                    <input
                                      ref={fileInputRef}
                                      type="file"
                                      accept="video/*"
                                      onChange={handleVideoFileChange}
                                      className="w-full rounded-lg bg-slate-900/70 border border-slate-800 px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-600 file:text-white hover:file:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/60 focus:border-primary-500/70"
                                    />
                                  )}
                                </form>
                              </div>

                              {/* Videos Grid */}
                              <div>
                                <h4 className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wide">Videos</h4>
                                {(t.videos || []).length === 0 ? (
                                  <div className="text-center py-8 bg-slate-950/30 border border-dashed border-slate-700 rounded-lg">
                                    <svg className="mx-auto h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-xs text-slate-500 mt-2">No videos yet</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                    <AnimatePresence>
                                      {(t.videos || []).map((v, idx) => (
                                        <motion.div
                                          key={v._id || v.id || idx}
                                          layout
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.9 }}
                                          transition={{ duration: 0.2 }}
                                          className="group relative bg-slate-950/80 border border-slate-800 rounded-lg overflow-hidden hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10 transition-all"
                                        >
                                          {/* Video Thumbnail/Placeholder */}
                                          <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center relative overflow-hidden">
                                            <svg className="w-12 h-12 text-slate-600 group-hover:text-primary-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                                              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                            </svg>
                                            <div className="absolute top-2 right-2">
                                              <span className="px-2 py-1 rounded-md text-[10px] bg-slate-950/80 border border-slate-700 text-slate-300">
                                                {v.kind === 'upload' ? 'Uploaded' : 'Link'}
                                              </span>
                                            </div>
                                            <div className="absolute top-2 left-2">
                                              <span className="px-2 py-1 rounded-md text-[10px] bg-slate-950/80 border border-slate-700 text-slate-300 font-medium">
                                                #{idx + 1}
                                              </span>
                                            </div>
                                          </div>

                                          {/* Video Info */}
                                          <div className="p-3">
                                            <h5 className="text-sm font-medium text-slate-100 truncate mb-2">{v.title}</h5>
                                            <div className="flex items-center justify-between gap-2">
                                              <a
                                                href={v.url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex-1 text-center text-xs px-3 py-1.5 rounded-lg bg-primary-600/20 border border-primary-500/50 text-primary-200 hover:bg-primary-500/30 transition-all"
                                              >
                                                Watch
                                              </a>
                                              <button
                                                type="button"
                                                onClick={() => handleRemoveVideo(id, v._id || v.id)}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                                                title="Remove video"
                                              >
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                                  <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                                                </svg>
                                              </button>
                                            </div>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </AnimatePresence>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default Classrooms;

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NotesManagement = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    difficulty: 'beginner',
    classroom: '',
    tags: '',
    file: null,
  });

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.getAllNotes(
        statusFilter ? { status: statusFilter } : undefined
      );
      setNotes(data.notes || []);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [statusFilter]);

  const stats = useMemo(() => {
    return {
      total: notes.length,
      approved: notes.filter(n => n.status === 'approved').length,
      pending: notes.filter(n => n.status === 'pending').length,
      rejected: notes.filter(n => n.status === 'rejected').length,
    };
  }, [notes]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file }));
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      subject: '',
      topic: '',
      difficulty: 'beginner',
      classroom: '',
      tags: '',
      file: null,
    });
    setEditingId(null);
  };

  const handleEdit = (note) => {
    setEditingId(note._id);
    setForm({
      title: note.title || '',
      description: note.description || '',
      subject: note.subject || '',
      topic: note.topic || '',
      difficulty: note.difficulty || 'beginner',
      classroom: note.classroom || '',
      tags: Array.isArray(note.tags) ? note.tags.join(', ') : '',
      file: null, // Don't reset file unless they choose a new one
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || (!form.file && !editingId)) {
      toast.error('Title, subject and file are required');
      return;
    }

    try {
      setUploading(true);
      
      if (editingId) {
        // Handle Update (Note: backend updateNote usually takes JSON if no file, or formData if file)
        const payload = { ...form };
        if (payload.tags) payload.tags = payload.tags.split(',').map(t => t.trim());
        
        // If there's a file, we might need FormData, but if only text is changed, JSON is cleaner.
        // Let's check if the API handles both. Usually it does.
        if (form.file) {
          const formData = new FormData();
          Object.keys(payload).forEach(key => {
            if (key === 'tags') formData.append(key, JSON.stringify(payload[key]));
            else if (payload[key] !== null) formData.append(key, payload[key]);
          });
          await adminAPI.updateNote(editingId, formData);
        } else {
          await adminAPI.updateNote(editingId, payload);
        }
        toast.success('Note updated successfully');
      } else {
        // Handle Create
        const formData = new FormData();
        formData.append('title', form.title);
        formData.append('description', form.description);
        formData.append('subject', form.subject);
        formData.append('topic', form.topic);
        formData.append('difficulty', form.difficulty);
        formData.append('classroom', form.classroom);
        if (form.tags) formData.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim())));
        formData.append('file', form.file);

        await adminAPI.createNote(formData);
        toast.success('Note uploaded & approved');
      }

      resetForm();
      await fetchNotes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'upload'} note`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await adminAPI.deleteNote(id);
      toast.success('Note deleted');
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete note');
    }
  };

  const statusColor = (status) => {
    if (status === 'approved') return 'emerald';
    if (status === 'pending') return 'amber';
    if (status === 'rejected') return 'rose';
    return 'slate';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-400 border border-primary-500/20 shadow-lg shadow-primary-500/5">
              📚
            </div>
            <h1 className="text-3xl font-black text-slate-50 tracking-tight">Notes Library</h1>
          </div>
          <p className="text-sm text-slate-400 max-w-xl font-medium">
            Manage your curated educational resources. Effortlessly upload, review, and organize classroom materials.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field !w-auto min-w-[140px] !py-2 !text-xs !bg-slate-900/50 !border-slate-800 focus:!border-primary-500/50"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Library', value: stats.total, color: 'primary', icon: '📁' },
          { label: 'Live Assets', value: stats.approved, color: 'emerald', icon: '✅' },
          { label: 'Pending Review', value: stats.pending, color: 'amber', icon: '⏳' },
          { label: 'Archived/Rejected', value: stats.rejected, color: 'rose', icon: '🚫' },
        ].map((s, idx) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`card !p-5 border-${s.color}-500/20 bg-slate-900/40 relative overflow-hidden group`}
          >
            <div className={`absolute top-0 right-0 h-24 w-24 bg-${s.color}-500/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110`} />
            <div className="flex items-center justify-between mb-3 relative z-10">
               <span className="text-xl">{s.icon}</span>
               <span className={`h-2 w-2 rounded-full bg-${s.color}-500 shadow-[0_0_8px] shadow-${s.color}-500`} />
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest relative z-10">{s.label}</p>
            <p className="text-2xl font-black text-slate-50 relative z-10">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        {/* Form Column */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 space-y-6"
        >
          <div className={`card !p-6 border-slate-800/80 bg-slate-900/60 shadow-2xl transition-all duration-500 ${editingId ? 'ring-2 ring-primary-500/30' : ''}`}>
            <h2 className="text-lg font-bold text-slate-50 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-8 w-8 rounded-lg ${editingId ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'} flex items-center justify-center text-sm border`}>
                  {editingId ? '✎' : '⊕'}
                </span>
                {editingId ? 'Edit Resource' : 'Upload Resource'}
              </div>
              {editingId && (
                <button 
                  onClick={resetForm}
                  className="text-[10px] font-black text-slate-500 hover:text-slate-300 uppercase underline"
                >
                  Cancel Edit
                </button>
              )}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Document Title</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className="input-field !bg-slate-950/40 !border-slate-800 text-sm focus:!border-primary-500/50"
                  placeholder="e.g. Advanced SQL Optimization"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Subject</label>
                  <input
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="input-field !bg-slate-950/40 !border-slate-800 text-sm focus:!border-primary-500/50"
                    placeholder="DBMS"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Topic</label>
                  <input
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    className="input-field !bg-slate-950/40 !border-slate-800 text-sm focus:!border-primary-500/50"
                    placeholder="Indexing"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Difficulty</label>
                  <select
                    name="difficulty"
                    value={form.difficulty}
                    onChange={handleChange}
                    className="input-field !bg-slate-950/40 !border-slate-800 text-sm focus:!border-primary-500/50"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Classroom ID</label>
                  <input
                    name="classroom"
                    value={form.classroom}
                    onChange={handleChange}
                    className="input-field !bg-slate-950/40 !border-slate-800 text-sm focus:!border-primary-500/50"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  className="input-field !bg-slate-950/40 !border-slate-800 text-sm focus:!border-primary-500/50 resize-none"
                  placeholder="Summary of the content..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest">File Selection {editingId ? '(Optional)' : ''}</label>
                <label className="relative group cursor-pointer block">
                  <div className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-6 transition-all ${form.file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 bg-slate-950/20 group-hover:border-primary-500/40 group-hover:bg-primary-500/5'}`}>
                    <span className="text-2xl mb-2">{form.file ? '📄' : '📤'}</span>
                    <span className="text-[11px] font-bold text-slate-300 truncate max-w-full px-4">
                      {form.file ? form.file.name : editingId ? 'Leave empty to keep existing' : 'Click to Browse Files'}
                    </span>
                    <span className="text-[9px] text-slate-500 mt-1 uppercase font-black">PDF, Images allowed</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className={`w-full py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest shadow-xl transition-all disabled:opacity-50 active:scale-95 ${
                  editingId 
                    ? 'bg-primary-600 shadow-primary-600/20 hover:bg-primary-500' 
                    : 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500'
                }`}
              >
                {uploading ? 'Processing...' : editingId ? 'Update Resource Details' : 'Upload & Approve Asset'}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Inventory Column */}
        <div className="xl:col-span-3 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-bold text-slate-50">Content Inventory</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Showing {notes.length} Assets</p>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                 {[1, 2, 3].map(i => (
                   <div key={i} className="h-20 w-full animate-pulse bg-slate-800/20 rounded-2xl border border-slate-800" />
                 ))}
              </div>
            ) : notes.length === 0 ? (
              <div className="card !p-12 text-center border-dashed border-slate-800 bg-transparent">
                <p className="text-sm text-slate-500 font-medium italic">No assets matches the current criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {notes.map((note, index) => (
                  <motion.div
                    key={note._id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group card !p-4 border-slate-800/80 bg-slate-900/40 hover:border-primary-500/30 hover:bg-slate-900/60 transition-all flex items-center justify-between gap-4 ${editingId === note._id ? 'ring-1 ring-primary-500/50 border-primary-500/50 bg-slate-900/80' : ''}`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg border transition-colors ${
                        note.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                        note.status === 'pending' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      }`}>
                         {note.fileType?.includes('pdf') || note.title.toLowerCase().includes('.pdf') ? '📄' : '🖼️'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                           <h3 className="text-sm font-bold text-slate-50 truncate group-hover:text-primary-400 transition-colors">{note.title}</h3>
                           <span className={`h-1.5 w-1.5 rounded-full bg-${statusColor(note.status)}-500`} />
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {note.subject} <span className="opacity-30">•</span> {note.topic || 'General'} <span className="opacity-30">•</span> <span className="text-primary-500/70">{note.difficulty}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`hidden sm:block text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded-md bg-${statusColor(note.status)}-500/10 text-${statusColor(note.status)}-400 border border-${statusColor(note.status)}-500/20`}>
                        {note.status}
                      </span>
                      <button
                        onClick={() => handleEdit(note)}
                        className={`h-8 w-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                          editingId === note._id 
                            ? 'bg-primary-500 text-white' 
                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-primary-400'
                        }`}
                        title="Edit Details"
                      >
                         ✎
                      </button>
                      <button
                        onClick={() => handleDelete(note._id)}
                        className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center text-sm"
                        title="Delete Asset"
                      >
                        ×
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesManagement;



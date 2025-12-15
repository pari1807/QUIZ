import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NotesManagement = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    subject: '',
    topic: '',
    difficulty: 'easy',
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file }));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!form.title || !form.subject || !form.file) {
      toast.error('Title, subject and file are required');
      return;
    }

    try {
      setUploading(true);
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
      setForm({
        title: '',
        description: '',
        subject: '',
        topic: '',
        difficulty: 'easy',
        classroom: '',
        tags: '',
        file: null,
      });
      await fetchNotes();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to upload note');
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
    if (status === 'approved') return 'bg-emerald-500/10 text-emerald-300';
    if (status === 'pending') return 'bg-amber-500/10 text-amber-300';
    if (status === 'rejected') return 'bg-rose-500/10 text-rose-300';
    return 'bg-slate-500/10 text-slate-300';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-1">Notes Management</h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Upload curated notes as admin and review student submissions. Approved notes appear in the student notes library.
        </p>
      </div>

      {/* Upload form */}
      <form onSubmit={handleUpload} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input-field"
              placeholder="DBMS – Indexing cheatsheet"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Subject</label>
            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              className="input-field"
              placeholder="DBMS"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Topic</label>
            <input
              name="topic"
              value={form.topic}
              onChange={handleChange}
              className="input-field"
              placeholder="Indexing & Hashing"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Difficulty</label>
            <select
              name="difficulty"
              value={form.difficulty}
              onChange={handleChange}
              className="input-field"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Classroom ID (optional)</label>
            <input
              name="classroom"
              value={form.classroom}
              onChange={handleChange}
              className="input-field"
              placeholder="Classroom ObjectId"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-slate-400">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="input-field resize-none"
            placeholder="Short description for students..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs text-slate-400">Tags (comma separated)</label>
            <input
              name="tags"
              value={form.tags}
              onChange={handleChange}
              className="input-field"
              placeholder="semester 4, exam, important"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-slate-400">File (PDF / Image)</label>
            <label className="flex items-center justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs text-slate-300 cursor-pointer hover:border-primary-500/70 hover:text-primary-100 transition-colors">
              <span className="truncate">
                {form.file ? form.file.name : 'Choose file to upload'}
              </span>
              <span className="px-2 py-1 rounded-md bg-primary-500/20 text-primary-200 text-[11px]">
                Browse
              </span>
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={uploading}
            className="btn-primary text-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload & Approve Note'}
          </button>
        </div>
      </form>

      {/* Notes list */}
      <div className="card space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-50">All notes</h2>
            <p className="text-xs text-slate-400">Filter and manage notes across classrooms.</p>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field max-w-[160px] text-xs"
          >
            <option value="">All statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-xs text-slate-400">No notes found for this filter.</p>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {notes.map((note) => (
              <div
                key={note._id}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-200"
              >
                <div className="min-w-0">
                  <p className="font-medium text-slate-50 truncate">{note.title}</p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {note.subject} • {note.topic || 'General'} • {note.difficulty || 'n/a'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-0.5 rounded-full text-[11px] ${statusColor(note.status)}`}>
                    {note.status}
                  </span>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="px-2 py-0.5 rounded-lg bg-rose-500/10 text-rose-300 text-[11px] hover:bg-rose-500/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesManagement;

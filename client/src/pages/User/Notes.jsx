import { useEffect, useState } from 'react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [savedNoteIds, setSavedNoteIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const [notesRes, savedRes] = await Promise.all([
          userAPI.browseNotes(),
          userAPI.getSavedNotes()
        ]);
        
        setNotes(notesRes.data.notes || []);
        // getSavedNotes returns full note objects, map to IDs
        setSavedNoteIds((savedRes.data || []).map(n => n._id));
      } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleDownload = async (id) => {
    try {
      const { data } = await userAPI.downloadNote(id);
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to download note');
    }
  };

  const handleSave = async (id) => {
    try {
      if (savedNoteIds.includes(id)) {
        await userAPI.unsaveNote(id);
        setSavedNoteIds(prev => prev.filter(savedId => savedId !== id));
        toast.success("Note removed from saved list");
      } else {
        await userAPI.saveNote(id);
        setSavedNoteIds(prev => [...prev, id]);
        toast.success("Note saved to dashboard");
      }
    } catch (error) {
       toast.error(error.response?.data?.message || 'Failed to update note status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-50 mb-1">Smart Notes Library</h1>
        <p className="text-sm text-slate-400 max-w-xl">
          Browse curated notes uploaded by admins and students. Only approved notes are visible here.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="text-sm text-slate-400">No notes available yet. Check back later.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {notes.map((note) => (
            <div key={note._id} className="card flex flex-col justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                  {note.subject || 'General'} • {note.difficulty || 'n/a'}
                </p>
                <h2 className="text-lg font-semibold text-slate-50 line-clamp-2">{note.title}</h2>
                {note.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-3">{note.description}</p>
                )}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Uploaded by {note.uploadedBy?.username || 'Unknown'}
                </span>
                <span>
                  ★ {Number(note.averageRating || 0).toFixed(1)} • {note.downloads || 0} downloads
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {note.classroom?.name || 'All classrooms'}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(note._id)}
                    disabled={savedNoteIds.includes(note._id)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition-colors ${
                      savedNoteIds.includes(note._id)
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 cursor-default'
                        : 'border-slate-700 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    {savedNoteIds.includes(note._id) ? 'Saved' : 'Bookmark'}
                  </button>
                  <button
                    onClick={() => handleDownload(note._id)}
                    className="btn-primary text-[11px] px-4 py-2"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notes;

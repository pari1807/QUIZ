import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const SUBJECT_COLORS = {
  Mathematics: 'from-blue-500 to-indigo-600',
  Science: 'from-emerald-500 to-teal-600',
  Physics: 'from-purple-500 to-pink-600',
  Chemistry: 'from-orange-500 to-amber-600',
  Biology: 'from-green-500 to-emerald-600',
  English: 'from-rose-500 to-red-600',
  History: 'from-amber-600 to-orange-700',
  Geography: 'from-cyan-500 to-blue-600',
  Default: 'from-slate-500 to-slate-700'
};

const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [savedNoteIds, setSavedNoteIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewerLoading, setViewerLoading] = useState(false);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const [notesRes, savedRes] = await Promise.all([
          userAPI.browseNotes(),
          userAPI.getSavedNotes()
        ]);
        
        setNotes(notesRes.data.notes || []);
        setSavedNoteIds((savedRes.data || []).map(n => n._id));
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
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
    } finally {
      // We don't set viewerLoading to false here yet, 
      // we'll handle it when the iframe finishes loading or manually
    }
  };

  const handleSave = async (id) => {
    try {
      if (savedNoteIds.includes(id)) {
        await userAPI.unsaveNote(id);
        setSavedNoteIds(prev => prev.filter(savedId => savedId !== id));
        toast.success("Archive updated: Note removed");
      } else {
        await userAPI.saveNote(id);
        setSavedNoteIds(prev => [...prev, id]);
        toast.success("Note synchronized to your dashboard");
      }
    } catch (error) {
       toast.error('Protocol synchronization failure');
    }
  };

  const filteredNotes = notes.filter(n => 
    n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-10">
      {/* Immersive Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-slate-800 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
             <div className="h-2 w-12 bg-primary-500 rounded-full" />
             <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em]">Resource Repository</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-50 tracking-tighter">Smart Notes Library</h1>
          <p className="text-sm text-slate-400 font-medium max-w-xl leading-relaxed">
            Access curated academic archives synchronized across your classrooms. Professional-grade study materials at your fingertips.
          </p>
        </div>

        <div className="relative group w-full md:w-80">
           <input 
             type="text" 
             placeholder="Search archives..."
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl px-5 py-3 text-sm text-slate-300 focus:outline-none focus:border-primary-500/50 transition-all pl-12"
           />
           <span className="absolute left-5 top-1/2 -translate-y-1/2 grayscale opacity-40 group-focus-within:grayscale-0 group-focus-within:opacity-100 transition-all">🔍</span>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 bg-slate-900/40 rounded-[40px] border border-slate-800 animate-pulse" />
           ))}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="py-40 text-center rounded-[60px] bg-slate-900/10 border border-dashed border-slate-800/50">
           <div className="text-7xl mb-6 grayscale opacity-20">📂</div>
           <p className="text-sm font-black text-slate-600 uppercase tracking-[0.2em]">No archives found in this sector</p>
           <p className="text-[10px] text-slate-700 font-bold uppercase mt-2 italic">Try a different search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNotes.map((note, i) => {
            const color = SUBJECT_COLORS[note.subject] || SUBJECT_COLORS.Default;
            const isSaved = savedNoteIds.includes(note._id);

            return (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group relative bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 backdrop-blur-xl hover:border-slate-700 transition-all hover:shadow-2xl hover:shadow-black/40 overflow-hidden"
              >
                {/* Background Accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 blur-3xl -mr-16 -mt-16 group-hover:opacity-20 transition-opacity`} />

                <div className="flex flex-col h-full justify-between gap-6 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-gradient-to-r ${color} text-white shadow-lg`}>
                          {note.subject || 'GENERAL'}
                       </span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 px-2 py-1 rounded-lg">
                          {note.difficulty || 'CORE'}
                       </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-slate-50 tracking-tight leading-tight group-hover:text-primary-400 transition-colors line-clamp-2">
                       {note.title}
                    </h2>

                    <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-3">
                       {note.description || 'Access full notes for detailed analysis and study.'}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                       <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center text-sm shadow-inner">👤</div>
                          <div>
                             <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Curated By</p>
                             <p className="text-[10px] font-bold text-slate-400">{note.uploadedBy?.username || 'Admin'}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-slate-100">★ {Number(note.averageRating || 0).toFixed(1)}</p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Global Review</p>
                       </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleSave(note._id)}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isSaved 
                          ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                          : 'bg-slate-950 border border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {isSaved ? 'BOOKMARKED' : 'BOOKMARK'}
                      </button>
                      <button
                        onClick={() => handleOpenViewer(note)}
                        className="flex-1 py-3 rounded-2xl bg-slate-50 text-slate-900 border border-white text-[10px] font-black uppercase tracking-widest hover:bg-white active:scale-95 transition-all shadow-xl shadow-white/5"
                      >
                        OPEN ARCHIVE
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Internal PDF Viewer HUD */}
      <AnimatePresence>
        {selectedNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-950/98 flex flex-col items-center justify-center"
          >
             <div className="w-full h-full flex flex-col bg-slate-900 shadow-2xl overflow-hidden">
                {/* Viewer Header - Minimal & Clean */}
                <div className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20">
                   <div className="flex items-center gap-5">
                      <button 
                        onClick={() => {
                          setSelectedNote(null);
                          setViewerLoading(false);
                        }}
                        className="group h-10 w-10 flex items-center justify-center rounded-2xl bg-slate-800 hover:bg-primary-500/20 text-slate-400 hover:text-primary-400 transition-all border border-slate-700 hover:border-primary-500/30"
                      >
                         <span className="text-xl group-active:scale-75 transition-transform">←</span>
                      </button>
                      <div>
                         <h3 className="text-sm font-black text-slate-50 tracking-tight uppercase">{selectedNote.title}</h3>
                         <div className="flex items-center gap-2.5 mt-1">
                            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.15em]">
                               Verified Academic Resource • {selectedNote.subject}
                            </p>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-4">
                      <a 
                        href={selectedNote.viewUrl} 
                        download
                        className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20 active:scale-95"
                      >
                         <span>↓</span> DOWNLOAD ARCHIVE
                      </a>
                      <button 
                        onClick={() => {
                          setSelectedNote(null);
                          setViewerLoading(false);
                        }}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700 hover:border-rose-500/30"
                      >
                         TERMINATE VIEW
                      </button>
                   </div>
                </div>

                {/* Secure Content Area */}
                <div className="flex-1 bg-slate-100 relative overflow-auto flex items-center justify-center p-4">
                   {viewerLoading && (
                     <div className="absolute inset-0 z-10 bg-slate-900 flex flex-col items-center justify-center gap-4">
                        <div className="h-10 w-10 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Decrypting Secure Stream...</p>
                     </div>
                   )}
                   
                   <iframe 
                     src={selectedNote.viewUrl} 
                     onLoad={() => setViewerLoading(false)}
                     className="w-full h-full max-w-5xl bg-white shadow-2xl rounded-sm border-none pointer-events-auto"
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

export default Notes;

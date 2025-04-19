import { Trash2, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

interface Note {
  id: string;
  title: string;
  content: string;
}

export default function NotesHub() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const addNote = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter both title and content.");
      return;
    }

    const newNote: Note = {
      id: crypto.randomUUID(),
      title,
      content,
    };

    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
    toast.success("Note added!");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
    toast.success("Note deleted.");
  };

  const clearAllNotes = () => {
    setNotes([]);
    toast.success("All notes cleared.");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📝 Notes Hub</h1>
          {notes.length > 0 && (
            <button
              onClick={clearAllNotes}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={20} />
              Clear All
            </button>
          )}
        </div>

        <div className="bg-white shadow p-4 rounded-lg mb-6">
          <input
            type="text"
            placeholder="Note Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full mb-2 px-3 py-2 border rounded-md text-sm"
          />
          <textarea
            placeholder="Write your note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            className="w-full mb-3 px-3 py-2 border rounded-md text-sm resize-none"
          />
          <button
            onClick={addNote}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Add Note
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-yellow-100 p-4 rounded-lg shadow-sm relative">
              <h3 className="text-lg font-semibold mb-2">{note.title}</h3>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
              <button
                onClick={() => deleteNote(note.id)}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                title="Delete"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

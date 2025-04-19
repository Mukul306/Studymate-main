import { useEffect, useState } from 'react';
import { Subject } from '../types';
import { X, Edit2, Trash2, Clock, Play, StopCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubjectManagerProps {
  subjects: Subject[];
  onAddSubject: (subject: Omit<Subject, 'id'>) => void;
  onEditSubject: (id: string, subject: Omit<Subject, 'id'>) => void;
  onDeleteSubject: (id: string) => void;
  onClose: () => void;
}

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
  '#D4A5A5', '#9E9E9E', '#58B19F', '#FFB6B9', '#BAD7DF'
];

interface SubjectProgress {
  [id: string]: number; // progress in hours
}

export default function SubjectManager({
  subjects,
  onAddSubject,
  onEditSubject,
  onDeleteSubject,
  onClose
}: SubjectManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: COLORS[0],
    goalHoursPerWeek: 5
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<Set<string>>(new Set());
  const [deletedSubjects, setDeletedSubjects] = useState<Subject[]>([]);
  const [timers, setTimers] = useState<{ [id: string]: number | null }>({});
  const [startTimes, setStartTimes] = useState<{ [id: string]: number }>({});
  const [progressMap, setProgressMap] = useState<SubjectProgress>({});

  // Force re-render for live timer
  const [, forceRender] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      forceRender(prev => !prev); // re-renders every second
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatElapsed = (id: string) => {
    if (!startTimes[id]) return null;
    const elapsed = Date.now() - startTimes[id];
    const totalSeconds = Math.floor(elapsed / 1000);
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const toggleSubjectSelection = (subjectId: string) => {
    const newSelection = new Set(selectedSubjects);
    newSelection.has(subjectId) ? newSelection.delete(subjectId) : newSelection.add(subjectId);
    setSelectedSubjects(newSelection);
  };

  const toggleSelectAll = () => {
    setSelectedSubjects(
      selectedSubjects.size === subjects.length ? new Set() : new Set(subjects.map(s => s.id))
    );
  };

  const handleBulkDelete = async () => {
    try {
      const toDelete = subjects.filter(subject => selectedSubjects.has(subject.id));
      setDeletedSubjects(toDelete);
      await Promise.all([...selectedSubjects].map(id => onDeleteSubject(id)));
      toast.success(
        <div className="flex items-center space-x-2">
          <span>{selectedSubjects.size} subjects deleted</span>
          <button
            onClick={handleUndoBulkDelete}
            className="px-2 py-1 text-sm bg-white rounded-md shadow-sm hover:bg-gray-50"
          >
            Undo
          </button>
        </div>,
        { duration: 5000 }
      );
      setSelectedSubjects(new Set());
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete subjects');
    }
  };

  const handleUndoBulkDelete = async () => {
    if (!deletedSubjects.length) return;
    try {
      await Promise.all(deletedSubjects.map(subject => onAddSubject(subject)));
      toast.success('Subjects restored');
      setDeletedSubjects([]);
    } catch (err) {
      console.error(err);
      toast.error('Failed to restore subjects');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter a subject name');
      return;
    }

    if (editingId) {
      onEditSubject(editingId, formData);
      toast.success('Subject updated');
      setEditingId(null);
    } else {
      onAddSubject(formData);
      toast.success('Subject added');
    }

    setFormData({ name: '', description: '', color: COLORS[0], goalHoursPerWeek: 5 });
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({
      name: subject.name,
      description: subject.description || '',
      color: subject.color,
      goalHoursPerWeek: subject.goalHoursPerWeek
    });
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(id);
      await onDeleteSubject(id);
      toast.success('Subject deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete subject');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleStart = (id: string) => {
    setStartTimes((prev) => ({ ...prev, [id]: Date.now() }));
    setTimers((prev) => ({ ...prev, [id]: 0 }));
  };

  const handleStop = (id: string) => {
    const start = startTimes[id];
    if (!start) return;
    const elapsedMs = Date.now() - start;
    const elapsedHours = elapsedMs / (1000 * 60 * 60);
    setProgressMap((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + elapsedHours
    }));
    delete startTimes[id];
    delete timers[id];
    setStartTimes({ ...startTimes });
    setTimers({ ...timers });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Manage Subjects</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Subject Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter subject name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Short description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, color }))}
                  className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-black' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Weekly Goal (hours)</label>
            <input
              type="number"
              value={formData.goalHoursPerWeek}
              onChange={e =>
                setFormData(p => ({
                  ...p,
                  goalHoursPerWeek: Math.max(0, parseInt(e.target.value) || 0)
                }))
              }
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              min="0"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            {editingId ? 'Update Subject' : 'Add Subject'}
          </button>
        </form>

        {/* Subject Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map(subject => {
            const progress = progressMap[subject.id] || 0;
            const percent = Math.min((progress / subject.goalHoursPerWeek) * 100, 100);

            return (
              <div
                key={subject.id}
                className="bg-white rounded-xl shadow-md border overflow-hidden flex flex-col"
              >
                <div className="h-24" style={{ backgroundColor: subject.color }} />
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{subject.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(subject)}
                        className="text-gray-500 hover:text-indigo-600 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        disabled={isDeleting === subject.id}
                        className={`text-gray-500 hover:text-red-600 transition ${isDeleting === subject.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3 flex-1">
                    {subject.description || 'No description provided.'}
                  </p>

                  {/* Time tracker display */}
                  <p className="text-xs mb-2 text-gray-700">
                    ⏱ {startTimes[subject.id] ? `Studying: ${formatElapsed(subject.id)}` : `Tracked: ${(progressMap[subject.id] || 0).toFixed(2)}h`}
                  </p>

                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{progress.toFixed(1)} / {subject.goalHoursPerWeek}h</span>
                    </div>
                    <span>{Math.round(percent)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-indigo-500" style={{ width: `${percent}%` }} />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStart(subject.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm px-2 py-1 rounded-md"
                      disabled={!!startTimes[subject.id]}
                    >
                      <Play size={14} className="inline mr-1" />
                      Start
                    </button>
                    <button
                      onClick={() => handleStop(subject.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white text-sm px-2 py-1 rounded-md"
                      disabled={!startTimes[subject.id]}
                    >
                      <StopCircle size={14} className="inline mr-1" />
                      End
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

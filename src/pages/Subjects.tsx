import { useState, useEffect } from 'react';
import { Subject, StudySession } from '../types';
import SubjectManager from '../components/SubjectManager';
import { Book, Plus, Clock, Filter, SortAsc } from 'lucide-react';
import { startOfWeek, endOfWeek } from 'date-fns';
import toast from 'react-hot-toast';

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const studySessions = useState<StudySession[]>(() => {
    const saved = localStorage.getItem('studyTime');
    return saved ? JSON.parse(saved) : [];
  })[0];

  const [showManager, setShowManager] = useState(false);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'progress'>('progress');

  useEffect(() => {
    localStorage.setItem('subjects', JSON.stringify(subjects));
  }, [subjects]);

  const getWeeklyProgress = (subjectName: string) => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = endOfWeek(now);

    const weeklyMinutes = studySessions
      .filter(session => {
        const sessionDate = new Date(session.date);
        return (
          session.subject === subjectName &&
          sessionDate >= weekStart &&
          sessionDate <= weekEnd
        );
      })
      .reduce((acc, session) => acc + session.durationMinutes, 0);

    return weeklyMinutes / 60;
  };

  const handleAddSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: crypto.randomUUID(),
    };
    setSubjects([...subjects, newSubject]);
    toast.success('Subject added successfully');
  };

  const handleEditSubject = (id: string, subjectData: Omit<Subject, 'id'>) => {
    setSubjects(subjects.map(subject =>
      subject.id === id ? { ...subject, ...subjectData } : subject
    ));
    toast.success('Subject updated successfully');
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
    toast.success('Subject deleted');
  };

  const totalWeeklyHours = subjects.reduce(
    (total, subject) => total + getWeeklyProgress(subject.name),
    0
  );

  const sortedSubjects = [...subjects]
    .filter(subject => !filterColor || subject.color === filterColor)
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      const aProgress = getWeeklyProgress(a.name) / a.goalHoursPerWeek;
      const bProgress = getWeeklyProgress(b.name) / b.goalHoursPerWeek;
      return bProgress - aProgress;
    });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Book className="text-indigo-600" size={28} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Subjects</h1>
              <p className="text-sm text-gray-500">{totalWeeklyHours.toFixed(1)} total hours studied this week</p>
            </div>
          </div>
          <button
            onClick={() => setShowManager(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            Add Subject
          </button>
        </div>

        {/* Filters & Sorting */}
        <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <select
              value={filterColor || ''}
              onChange={e => setFilterColor(e.target.value || null)}
              className="border border-gray-300 px-2 py-1 rounded-lg text-sm"
            >
              <option value="">All Colors</option>
              {Array.from(new Set(subjects.map(s => s.color))).map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <SortAsc size={16} />
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="border border-gray-300 px-2 py-1 rounded-lg text-sm"
            >
              <option value="progress">Sort by Progress</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Subject Cards */}
        <div className="grid gap-4">
          {sortedSubjects.map(subject => {
            const weeklyHours = getWeeklyProgress(subject.name);
            const progress = (weeklyHours / subject.goalHoursPerWeek) * 100;

            return (
              <div key={subject.id} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full" style={{ backgroundColor: subject.color }} />
                    <h3 className="font-semibold text-lg text-gray-800">{subject.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Clock size={14} />
                    {weeklyHours.toFixed(1)} / {subject.goalHoursPerWeek}h
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, progress)}%`,
                        backgroundColor: subject.color,
                        transition: 'width 0.6s ease-in-out'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {subjects.length === 0 && (
          <div className="text-center mt-16 p-8 bg-white rounded-xl shadow-sm border border-gray-200">
            <Book className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects yet</h3>
            <p className="text-gray-500 mb-4">Start tracking your study progress by adding subjects</p>
            <button
              onClick={() => setShowManager(true)}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Add your first subject
            </button>
          </div>
        )}

        {/* Modal */}
        {showManager && (
          <SubjectManager
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onEditSubject={handleEditSubject}
            onDeleteSubject={handleDeleteSubject}
            onClose={() => setShowManager(false)}
          />
        )}
      </div>
    </div>
  );
}

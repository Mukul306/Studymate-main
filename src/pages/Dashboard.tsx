import { useState, useEffect } from 'react';
import { StudySession, StudyStreak, Subject } from '../types';
import PomodoroTimer from '../components/PomodoroTimer';
import StudyStreakComponent from '../components/StudyStreak';
import FocusMode from '../components/FocusMode';
import LoadingSpinner from '../components/LoadingSpinner';
import { GraduationCap, Calendar } from 'lucide-react';
import { getFromStorage, setToStorage } from '../utils/storage';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyTime, setStudyTime] = useState<StudySession[]>([]);
  const [isStudyActive, setIsStudyActive] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [streak, setStreak] = useState<StudyStreak>({
    currentStreak: 0,
    bestStreak: 0,
    lastStudyDate: new Date().toISOString(),
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [loadedSubjects, loadedStudyTime, loadedStreak] = await Promise.all([
          getFromStorage<Subject[]>('subjects', []),
          getFromStorage<StudySession[]>('studyTime', []),
          getFromStorage<StudyStreak>('streak', {
            currentStreak: 0,
            bestStreak: 0,
            lastStudyDate: new Date().toISOString(),
          }),
        ]);

        setSubjects(loadedSubjects || []);
        setStudyTime(loadedStudyTime || []);
        setStreak(loadedStreak);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load data. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      setToStorage('studyTime', studyTime).catch(console.error);
    }
  }, [studyTime, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      setToStorage('streak', streak).catch(console.error);
    }
  }, [streak, isLoading]);

  const handleStudySessionComplete = (minutes: number) => {
    if (minutes <= 0) {
      console.error('Invalid study session duration');
      return;
    }

    try {
      const newSession: StudySession = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        durationMinutes: minutes,
        subject: selectedSubject || 'General',
      };
      setStudyTime((prev) => [...prev, newSession]);

      const today = new Date();
      const lastStudy = new Date(streak.lastStudyDate);
      today.setHours(0, 0, 0, 0);
      lastStudy.setHours(0, 0, 0, 0);

      const timeDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

      if (timeDiff <= 1) {
        setStreak((prev) => ({
          currentStreak: prev.currentStreak + 1,
          bestStreak: Math.max(prev.bestStreak, prev.currentStreak + 1),
          lastStudyDate: today.toISOString(),
        }));
      } else {
        setStreak({
          currentStreak: 1,
          bestStreak: streak.bestStreak,
          lastStudyDate: today.toISOString(),
        });
      }
    } catch (error) {
      console.error('Failed to handle study session completion:', error);
    } finally {
      setIsStudyActive(false);
      setSelectedSubject('');
    }
  };

  const renderWeeklyStreak = () => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const dailyStudyMap: boolean[] = Array(7).fill(false);

    studyTime.forEach((session) => {
      const sessionDate = new Date(session.date);
      const dayIndex = sessionDate.getDay();
      if (
        sessionDate >= startOfWeek &&
        sessionDate <= today &&
        !dailyStudyMap[dayIndex]
      ) {
        dailyStudyMap[dayIndex] = true;
      }
    });

    // Ensure today's session is marked if one was completed
    const todayIndex = today.getDay();
    if (
      studyTime.some(
        (session) =>
          new Date(session.date).toDateString() === today.toDateString()
      )
    ) {
      dailyStudyMap[todayIndex] = true;
    }

    return (
      <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="text-indigo-600" size={20} />
          Weekly Streak
        </h2>
        <div className="grid grid-cols-7 text-center gap-3">
          {dailyStudyMap.map((didStudy, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-sm text-gray-500">{dayLabels[idx]}</span>
              <div
                className={`w-8 h-8 mt-1 rounded-full flex items-center justify-center text-white text-sm ${
                  didStudy ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {didStudy ? '✓' : '✗'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-indigo-600" size={28} />
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        </div>
        <FocusMode isStudyActive={isStudyActive} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <StudyStreakComponent streak={streak} />
          {renderWeeklyStreak()}
        </div>
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-indigo-600 mb-4">Study Timer</h2>
            {subjects.length > 0 && (
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 mb-4"
                aria-label="Select study subject"
              >
                <option value="">Select Subject</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            )}
            <PomodoroTimer
              onSessionComplete={handleStudySessionComplete}
              onStart={() => setIsStudyActive(true)}
              onStop={() => setIsStudyActive(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

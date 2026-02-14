import { StudyStreak } from '../types';
import { Flame, Award, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface StudyStreakProps {
  streak: StudyStreak;
}

export default function StudyStreakComponent({ streak }: StudyStreakProps) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-red-500 text-white p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Flame className="text-yellow-300" size={24} />
        <h3 className="text-xl font-semibold">Study Streak</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Current Streak */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Calendar size={16} className="text-blue-200" />
            <span className="text-sm text-blue-200">Current Streak</span>
          </div>
          <p className="text-4xl font-bold">{streak.currentStreak} days</p>
        </div>

        {/* Best Streak */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-blue-200" />
            <span className="text-sm text-red-200">Best Streak</span>
          </div>
          <p className="text-4xl font-bold">{streak.bestStreak} days</p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-blue-400/30">
        <p className="text-sm text-blue-200">
          Last studied {formatDistanceToNow(new Date(streak.lastStudyDate))} ago
        </p>
      </div>
    </div>
  );
}

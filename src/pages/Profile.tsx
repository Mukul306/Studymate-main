import { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { Trophy, User, Bell, Volume2, Save, Plus, Trash2, Edit, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

// Enhanced storage functions
const storage = {
  get: async <T,>(key: string, defaultValue: T): Promise<T> => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return defaultValue;
    }
  },
  set: async (key: string, value: any): Promise<void> => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error writing to storage:', error);
      throw error;
    }
  }
};

const defaultProfile: StudentProfile = {
  name: '',
  email: '',
  bio: '',
  avatar: '',
  studyPreferences: {
    preferredStudyTime: 'morning',
    focusSessionDuration: 25,
    breakDuration: 5,
    dailyGoalHours: 4,
    notifications: true,
    soundEffects: true,
  },
  achievements: [],
};

export default function Profile() {
  const [profile, setProfile] = useState<StudentProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newAchievement, setNewAchievement] = useState({ title: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const loadedProfile = await storage.get<StudentProfile>('profile', defaultProfile);
        setProfile(loadedProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
        setError('Failed to load profile. Please try refreshing the page.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Save profile when changes occur
  const saveProfile = async (updatedProfile: StudentProfile) => {
    try {
      await storage.set('profile', updatedProfile);
      toast.success('Profile saved successfully!', {
        icon: <Check className="text-green-500" />,
        style: {
          background: '#f0fdf4',
          color: '#166534',
        },
      });
      return true;
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile changes', {
        style: {
          background: '#fef2f2',
          color: '#b91c1c',
        },
      });
      return false;
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedProfile = {
          ...profile,
          avatar: reader.result as string
        };
        setProfile(updatedProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileChange = (updates: Partial<StudentProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const handleStudyPrefChange = (updates: Partial<StudentProfile['studyPreferences']>) => {
    setProfile(prev => ({
      ...prev,
      studyPreferences: {
        ...prev.studyPreferences,
        ...updates
      }
    }));
  };

  const addAchievement = () => {
    if (newAchievement.title.trim() && newAchievement.description.trim()) {
      setProfile(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement]
      }));
      setNewAchievement({ title: '', description: '' });
    }
  };

  const removeAchievement = (index: number) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const handleSaveChanges = async () => {
    const success = await saveProfile(profile);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    storage.get<StudentProfile>('profile', defaultProfile).then(loadedProfile => {
      setProfile(loadedProfile);
      setIsEditing(false);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-200">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information and study preferences</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              <Edit size={18} />
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
              >
                <Save size={18} />
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 p-2 rounded-full">
                  <User className="text-indigo-600" size={20} />
                </span>
                Personal Information
              </h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-2 border-indigo-100">
                    {profile.avatar ? (
                      <img 
                        src={profile.avatar} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User size={32} />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-1 bg-indigo-600 rounded-full cursor-pointer text-white hover:bg-indigo-700 transition-colors shadow-md">
                      <Edit size={16} />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarChange}
                      />
                    </label>
                  )}
                </div>

                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => handleProfileChange({ name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => handleProfileChange({ email: e.target.value })}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">About Me</label>
                <textarea
                  value={profile.bio}
                  onChange={e => handleProfileChange({ bio: e.target.value })}
                  placeholder="Tell us about yourself, your goals, and interests..."
                  className="w-full h-32 px-3 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Study Preferences */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="bg-indigo-100 p-2 rounded-full">
                  <Bell className="text-indigo-600" size={20} />
                </span>
                Study Preferences
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Study Time
                  </label>
                  <select
                    value={profile.studyPreferences.preferredStudyTime}
                    onChange={e => handleStudyPrefChange({ preferredStudyTime: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!isEditing}
                  >
                    <option value="morning">🌅 Morning (6am - 12pm)</option>
                    <option value="afternoon">🌞 Afternoon (12pm - 5pm)</option>
                    <option value="evening">🌆 Evening (5pm - 9pm)</option>
                    <option value="night">🌙 Night (9pm - 6am)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Focus Session Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={profile.studyPreferences.focusSessionDuration}
                      onChange={e => handleStudyPrefChange({ 
                        focusSessionDuration: parseInt(e.target.value) || 25 
                      })}
                      min="5"
                      max="120"
                      step="5"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!isEditing}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Break Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={profile.studyPreferences.breakDuration}
                      onChange={e => handleStudyPrefChange({ 
                        breakDuration: parseInt(e.target.value) || 5 
                      })}
                      min="1"
                      max="30"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Daily Study Goal (hours)
                  </label>
                  <input
                    type="number"
                    value={profile.studyPreferences.dailyGoalHours}
                    onChange={e => handleStudyPrefChange({ 
                      dailyGoalHours: parseInt(e.target.value) || 4 
                    })}
                    min="1"
                    max="12"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Bell size={20} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Notifications</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.studyPreferences.notifications}
                        onChange={e => handleStudyPrefChange({ 
                          notifications: e.target.checked 
                        })}
                        className="sr-only peer"
                        disabled={!isEditing}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Volume2 size={20} className="text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Sound Effects</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={profile.studyPreferences.soundEffects}
                        onChange={e => handleStudyPrefChange({ 
                          soundEffects: e.target.checked 
                        })}
                        className="sr-only peer"
                        disabled={!isEditing}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 h-fit sticky top-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-indigo-100 p-2 rounded-full">
                <Trophy className="text-indigo-600" size={20} />
              </span>
              Achievements
            </h2>
            <div className="space-y-4">
              {profile.achievements.length > 0 ? (
                profile.achievements.map((achievement, index) => (
                  <div key={index} className="flex items-start gap-3 group relative p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="bg-indigo-100 p-2 rounded-full">
                      <Trophy className="text-indigo-600 flex-shrink-0" size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{achievement.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{achievement.description}</p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeAchievement(index)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove achievement"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <Trophy className="mx-auto text-gray-300" size={40} />
                  <p className="text-gray-500 mt-2">No achievements yet</p>
                  <p className="text-sm text-gray-400">Complete study sessions to earn achievements</p>
                </div>
              )}

              {isEditing && (
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium text-gray-700 mb-2">Add New Achievement</h3>
                  <input
                    type="text"
                    value={newAchievement.title}
                    onChange={e => setNewAchievement({...newAchievement, title: e.target.value})}
                    placeholder="Achievement title"
                    className="w-full px-3 py-2 border rounded-lg mb-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <textarea
                    value={newAchievement.description}
                    onChange={e => setNewAchievement({...newAchievement, description: e.target.value})}
                    placeholder="Description"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={2}
                  />
                  <button
                    onClick={addAchievement}
                    disabled={!newAchievement.title.trim() || !newAchievement.description.trim()}
                    className="mt-2 w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-md"
                  >
                    <Plus size={16} />
                    Add Achievement
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
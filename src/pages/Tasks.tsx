import { useState, useEffect } from 'react';
import { Task } from '../types';
import TaskList from '../components/TaskList';
import TaskForm from '../components/TaskForm';
import { Plus, ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, isPast, isToday } from 'date-fns';

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleCreateTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...taskData,
      id: crypto.randomUUID(),
      completed: false,
    };
    setTasks([...tasks, newTask]);
    toast.success('Task created successfully');
  };

  const handleUpdateTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (!editingTask) return;
    setTasks(tasks.map(task =>
      task.id === editingTask.id
        ? { ...task, ...taskData, completed: task.completed }
        : task
    ));
    toast.success('Task updated successfully');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    toast.success('Task deleted');
  };

  const filteredTasks = tasks
    .filter(task => {
      if (filter === 'completed') return task.completed;
      if (filter === 'pending') return !task.completed;
      return true;
    })
    .filter(task => task.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <ClipboardList size={32} className="text-indigo-600" />
            <div>
              <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">
                Task Tracker
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {tasks.length} total task{tasks.length !== 1 && 's'} — {completedCount} completed ✅
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingTask(null);
              setShowForm(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-5 py-2 rounded-lg flex items-center gap-2 shadow-md"
          >
            <Plus size={20} />
            New Task
          </button>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex gap-2">
            {['all', 'completed', 'pending'].map(key => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-1.5 rounded-full border text-sm font-medium ${
                  filter === key
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search tasks..."
            className="border border-gray-300 px-4 py-2 rounded-lg w-full sm:w-64 shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Task List */}
        <div className="bg-white p-6 rounded-xl shadow-lg transition-all">
          {filteredTasks.length > 0 ? (
            <ul className="space-y-4">
              {filteredTasks.map(task => {
                const isOverdue = !task.completed && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate));
                return (
                  <li
                    key={task.id}
                    className={`p-4 rounded-lg border flex justify-between items-center hover:shadow-md transition-all duration-150 ${
                      isOverdue ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div>
                      <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-500">{task.description}</p>
                      {task.dueDate && (
                        <span
                          className={`inline-block mt-2 px-2 py-0.5 text-xs rounded-full font-medium ${
                            isOverdue
                              ? 'bg-red-100 text-red-700'
                              : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          Due: {format(new Date(task.dueDate), 'PPP')}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => handleTaskComplete(task.id)}
                        className={`text-sm px-3 py-1 rounded-full transition font-medium ${
                          task.completed
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {task.completed ? 'Undo' : 'Complete'}
                      </button>
                      <button
                        onClick={() => handleEditTask(task)}
                        className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-sm px-3 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="text-center py-16 opacity-80">
              <ClipboardList size={50} className="mx-auto text-gray-300 mb-3 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
              <p className="text-gray-500 text-sm">Try adding a new task or adjusting your filters/search.</p>
            </div>
          )}
        </div>

        {/* Task Form Modal */}
        {showForm && (
          <TaskForm
            onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
            onClose={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
            initialData={editingTask || undefined}
          />
        )}
      </div>
    </div>
  );
}

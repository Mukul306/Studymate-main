import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  CheckSquare,
  Home,
  Book,
  Pencil,
  User,
  LogOut,
  Power,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showConfirm, setShowConfirm] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  const navItems = [
    { to: "/", icon: <Home className="text-blue-500" />, label: "Dashboard" },
    { to: "/tasks", icon: <CheckSquare className="text-green-500" />, label: "Tasks" },
    { to: "/subjects", icon: <Book className="text-purple-500" />, label: "Subjects" },
    { to: "/analytics", icon: <BarChart2 className="text-orange-500" />, label: "Analytics" },
    { to: "/ai-assistant", icon: <Pencil className="text-pink-500" />, label: "Notes Hub" },
    { to: "/profile", icon: <User className="text-yellow-500" />, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-2 md:top-0 md:bottom-auto md:right-auto md:h-screen md:w-64 md:border-t-0 md:border-r">
      <div className="hidden md:flex items-center h-20 px-4">
        <div className="flex items-center gap-3 text-2xl font-bold text-teal-800 border border-teal-200 rounded-xl px-4 py-2 hover:border-teal-500 hover:shadow-md transition-all duration-300">
          <span className="text-4xl">🎓</span>
          <span>STUDY TRACKER</span>
        </div>
      </div>

      {user && (
        <div className="hidden md:block px-4 py-4 border-b">
          <div className="font-medium">{user.user_metadata.name}</div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )}

      <ul className="flex justify-around md:flex-col md:space-y-2 md:mt-8">
        {navItems.map(({ to, icon, label }) => (
          <NavItem
            key={to}
            to={to}
            icon={icon}
            label={label}
            isActive={isActive(to)}
          />
        ))}
      </ul>

      {/* Updated Logout Button */}
      {user && (
        <div className="hidden md:block absolute bottom-8 left-0 right-0 px-4">
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-3 w-full p-3 text-white bg-gradient-to-r from-teal-500 to-teal-700 rounded-lg hover:from-teal-600 hover:to-teal-800 transition-all duration-300 shadow-lg"
          >
            <Power className="text-white" />
            <span>Log Out</span>
          </button>
        </div>
      )}

      {/* Updated Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-teal-50 rounded-lg p-6 shadow-lg">
            <p className="text-center mb-4 text-gray-700">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  setShowConfirm(false);
                  handleLogout();
                }}
                className="bg-gradient-to-r from-teal-500 to-teal-700 text-white px-4 py-2 rounded-lg hover:from-teal-600 hover:to-teal-800 transition-all"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavItem({ to, icon, label, isActive }) {
  return (
    <li>
      <Link
        to={to}
        className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
          isActive ? "text-teal-600 bg-teal-50" : "text-gray-600 hover:bg-gray-100"
        }`}
      >
        {icon}
        <span className="hidden md:inline">{label}</span>
      </Link>
    </li>
  );
}

import { Bell } from "lucide-react"; // Icon for notification
import { useState } from "react";

export default function NotificationWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState([
    "You have a new message!",
    "Update your profile to get more visibility.",
    "Check out our latest features!"
  ]);

  return (
    <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="Toggle notifications"
      >
        <Bell
          className={`w-6 h-6 transition-transform duration-300 ${
            isOpen ? "rotate-180 scale-90" : "hover:rotate-12"
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border p-4 min-w-48 animate-slide-up">
          <div className="flex flex-col gap-3">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className="text-gray-700 hover:text-indigo-600 transition-all duration-300 hover:translate-x-1"
              >
                {notification}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

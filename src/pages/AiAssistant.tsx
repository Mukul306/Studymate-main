import { useState } from "react";
import { Send, Bot } from "lucide-react";

export default function AIAssistant() {
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "👋 Hi! I’m your AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);

    // Mock AI response – replace with API later
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `You said: "${input}" 🤖` },
      ]);
    }, 800);

    setInput("");
  };

  return (
    <div className="flex flex-col h-[650px] w-full bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      {/* Header */}
      <div className="p-4 bg-white flex items-center gap-2 font-semibold text-lg text-black border-b border-gray-200 shadow-sm">
        <Bot className="w-6 h-6 text-gray-700" />
        AI Assistant
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-indigo-400/70 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`px-4 py-2 rounded-2xl max-w-[75%] shadow-lg text-sm transition ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input area */}
      <div className="p-3 bg-white flex items-center gap-2 border-t border-gray-200">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md transition-transform"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}

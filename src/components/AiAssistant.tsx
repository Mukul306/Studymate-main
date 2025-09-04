import React, { useState } from "react";
import { Send, Bot, User } from "lucide-react";

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Hi 👋 I’m your AI Assistant. How can I help you today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { sender: "user", text: input }]);

    // Mock AI response (replace this with API call)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `You said: "${input}" (AI response here 🤖)` },
      ]);
    }, 800);

    setInput("");
  };

  return (
    <div className="flex flex-col h-[600px] w-full max-w-lg mx-auto bg-gradient-to-br from-purple-700 via-blue-500 to-purple-700 text-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-black/30 flex items-center gap-2 font-semibold text-lg">
        <Bot className="w-6 h-6 text-cyan-300" />
        AI Assistant
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-transparent">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-2 ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender === "bot" && (
              <div className="p-2 bg-purple-800 rounded-xl shadow-md max-w-[75%]">
                <p className="text-sm">{msg.text}</p>
              </div>
            )}
            {msg.sender === "user" && (
              <div className="p-2 bg-cyan-600 rounded-xl shadow-md max-w-[75%]">
                <p className="text-sm">{msg.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 bg-black/40 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything..."
          className="flex-1 bg-transparent border border-purple-500 rounded-xl px-3 py-2 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        <button
          onClick={handleSend}
          className="p-2 bg-cyan-500 hover:bg-cyan-600 rounded-xl shadow-lg transition"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};

export default AIAssistant;

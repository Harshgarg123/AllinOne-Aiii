import { useState, useEffect } from "react";
import RagMode from "./components/modes/RagMode";
import ChatMode from "./components/modes/ChatMode";
import BlogMode from "./components/modes/BlogMode";
import CodeMode from "./components/modes/CodeMode";

import {
  FileText,
  MessageSquare,
  PenTool,
  Code2,
  Sparkles,
  Key,
  Menu,
  X,
} from "lucide-react";

type Mode = "rag" | "chat" | "blog" | "code";

function App() {
  const [activeMode, setActiveMode] = useState<Mode>("chat");
  const [apiKey, setApiKey] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("user_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      alert("Please enter a valid Groq API key.");
      return;
    }

    localStorage.setItem("user_api_key", apiKey.trim());
    alert("API key saved successfully!");
  };

  const modes = [
    { id: "chat" as Mode, name: "Chat", icon: MessageSquare },
    { id: "rag" as Mode, name: "RAG", icon: FileText },
    { id: "blog" as Mode, name: "Blog", icon: PenTool },
    { id: "code" as Mode, name: "Code", icon: Code2 },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* Left Section */}
          <div className="flex items-center gap-3">
            
            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <Sparkles className="text-white" size={18} />
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                AI Assistant Hub
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                Powered by Groq
              </p>
            </div>
          </div>

          {/* API Key Input */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Key size={16} className="text-gray-500" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Groq API Key"
                className="bg-transparent outline-none text-sm w-40 md:w-64"
              />
            </div>

            <button
              onClick={handleSaveKey}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-xs md:text-sm"
            >
              Save
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside
          className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r p-4 z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          {/* Close button for mobile */}
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h2 className="font-semibold">Menu</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => {
                    setActiveMode(mode.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-sm
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-500"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    }`}
                >
                  <Icon size={18} />
                  {mode.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 text-xs">
            <h3 className="font-semibold text-blue-900 mb-2">
              Quick Guide
            </h3>
            <ul className="text-blue-800 space-y-1">
              <li><strong>Chat:</strong> General AI assistant</li>
              <li><strong>RAG:</strong> Upload & query docs</li>
              <li><strong>Blog:</strong> Blog generation</li>
              <li><strong>Code:</strong> Code assistant</li>
            </ul>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          {activeMode === "rag" && <RagMode />}
          {activeMode === "chat" && <ChatMode />}
          {activeMode === "blog" && <BlogMode />}
          {activeMode === "code" && <CodeMode />}
        </main>
      </div>
    </div>
  );
}

export default App;

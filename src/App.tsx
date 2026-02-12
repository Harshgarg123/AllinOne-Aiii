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
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

type Mode = "rag" | "chat" | "blog" | "code";

function App() {
  const [activeMode, setActiveMode] = useState<Mode>("chat");
  const [apiKey, setApiKey] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [keyStatus, setKeyStatus] = useState<"unknown" | "valid" | "invalid">("unknown");

  useEffect(() => {
    const savedKey = localStorage.getItem("user_api_key");
    if (savedKey) {
      setApiKey(savedKey);
      // Optional: auto-validate on load if you want
      // validateKey(savedKey);
    }
  }, []);

  const validateKey = async (keyToTest: string) => {
    if (!keyToTest.trim()) return false;

    setIsValidating(true);
    setKeyStatus("unknown");

    try {
      const response = await fetch("https://api.groq.com/openai/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${keyToTest.trim()}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // 200 → valid key (we got models list)
        setKeyStatus("valid");
        return true;
      } else if (response.status === 401 || response.status === 403) {
        // Unauthorized / Forbidden → invalid key
        setKeyStatus("invalid");
        alert("Invalid Groq API key. Please check and try again.");
        return false;
      } else {
        // Other errors (rate limit, network, etc.)
        const errorData = await response.json().catch(() => ({}));
        alert(`Validation failed: ${response.status} - ${errorData.error?.message || "Unknown error"}`);
        setKeyStatus("invalid");
        return false;
      }
    } catch (err) {
      console.error("Validation error:", err);
      alert("Network error while validating key. Check your internet.");
      setKeyStatus("invalid");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const handleSaveKey = async () => {
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      alert("Please enter a valid Groq API key.");
      return;
    }

    const isValid = await validateKey(trimmedKey);

    if (isValid) {
      localStorage.setItem("user_api_key", trimmedKey);
      alert("API key is valid and saved successfully! ✅");
    }
    // If invalid, alert already shown in validateKey
  };

  const modes = [
    { id: "chat" as Mode, name: "Chat", icon: MessageSquare },
    { id: "rag" as Mode, name: "RAG", icon: FileText },
    { id: "blog" as Mode, name: "Blog", icon: PenTool },
    { id: "code" as Mode, name: "Code", icon: Code2 },
  ];

  const hasKey = !!apiKey.trim();
  const isKeyValid = keyStatus === "valid";

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      {/* HEADER */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu size={22} />
            </button>
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <Sparkles className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">AI Assistant Hub</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Powered by Groq</p>
            </div>
          </div>

          {/* Key Status */}
          <div className="flex items-center gap-2 text-sm">
            {isValidating ? (
              <div className="flex items-center gap-1.5 text-blue-600">
                <Loader2 size={16} className="animate-spin" />
                <span className="hidden sm:inline">Validating...</span>
              </div>
            ) : isKeyValid ? (
              <div className="flex items-center gap-1.5 text-green-600">
                <CheckCircle2 size={16} />
                <span className="hidden sm:inline">Key valid</span>
              </div>
            ) : hasKey ? (
              <div className="flex items-center gap-1.5 text-red-600">
                <AlertCircle size={16} />
                <span className="hidden sm:inline">Invalid key</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-amber-600">
                <AlertCircle size={16} />
                <span className="hidden sm:inline">Set API key</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside
          className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r p-4 z-50 transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
        >
          <div className="flex justify-between items-center mb-6 md:hidden">
            <h2 className="font-semibold text-lg">Menu</h2>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={24} />
            </button>
          </div>

          <nav className="space-y-2 mb-8">
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
                    ${isActive ? "bg-blue-50 text-blue-700 border border-blue-500" : "text-gray-700 hover:bg-gray-50 border border-transparent"}`}
                >
                  <Icon size={18} />
                  {mode.name}
                </button>
              );
            })}
          </nav>

          {/* API Key Section */}
          <div className="space-y-4 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Key size={16} />
              Groq API Key
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  setKeyStatus("unknown"); // Reset status on change
                }}
                placeholder="gsk_..."
                className="w-full bg-transparent outline-none text-sm placeholder-gray-400"
              />
            </div>

            <button
              onClick={handleSaveKey}
              disabled={isValidating || !apiKey.trim()}
              className={`w-full py-2.5 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2
                ${apiKey.trim() && !isValidating
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
            >
              {isValidating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Validating...
                </>
              ) : (
                "Save & Validate Key"
              )}
            </button>

            {hasKey && keyStatus === "valid" && (
              <p className="text-xs text-center text-green-600">Key is valid and ready to use ✅</p>
            )}
            {hasKey && keyStatus === "invalid" && (
              <p className="text-xs text-center text-red-600">Key appears invalid – please correct it</p>
            )}
          </div>

          {/* Quick Guide */}
          <div className="mt-10 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 text-xs">
            <h3 className="font-semibold text-blue-900 mb-2.5">Quick Guide</h3>
            <ul className="text-blue-800 space-y-1.5">
              <li><strong>Chat:</strong> General conversation</li>
              <li><strong>RAG:</strong> Ask questions about your documents</li>
              <li><strong>Blog:</strong> Generate blog posts</li>
              <li><strong>Code:</strong> Code help & generation</li>
            </ul>
          </div>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 md:hidden z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

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
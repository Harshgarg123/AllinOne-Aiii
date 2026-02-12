import { useState, useEffect } from 'react';
import RagMode from './components/modes/RagMode';
import ChatMode from './components/modes/ChatMode';
import BlogMode from './components/modes/BlogMode';
import CodeMode from './components/modes/CodeMode';


import {
  FileText,
  MessageSquare,
  PenTool,
  Code2,
  Sparkles,
  Key,
} from 'lucide-react';

type Mode = 'rag' | 'chat' | 'blog' | 'code';

function App() {
  const [activeMode, setActiveMode] = useState<Mode>('chat');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const savedKey = localStorage.getItem('user_api_key');
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  const handleSaveKey = () => {
    if (!apiKey.trim()) {
      alert('Please enter a valid Groq API key.');
      return;
    }

    localStorage.setItem('user_api_key', apiKey.trim());
    alert('API key saved successfully!');
  };

  const modes = [
    { id: 'chat' as Mode, name: 'Chat', icon: MessageSquare },
    { id: 'rag' as Mode, name: 'RAG', icon: FileText },
    { id: 'blog' as Mode, name: 'Blog', icon: PenTool },
    { id: 'code' as Mode, name: 'Code', icon: Code2 },
   

  ];

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                AI Assistant Hub
              </h1>
              <p className="text-xs text-gray-500">
                Powered by Groq 
              </p>
            </div>
          </div>

          {/* API Key Input */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
              <Key size={16} className="text-gray-500" />
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter Groq API Key"
                className="bg-transparent outline-none text-sm w-64"
              />
            </div>
            <button
              onClick={handleSaveKey}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Save Key
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-2">
            {modes.map((mode) => {
              const Icon = mode.icon;
              const isActive = activeMode === mode.id;

              return (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-2 border-blue-500'
                      : 'text-gray-700 hover:bg-gray-50 border-2 border-transparent'
                  }`}
                >
                  <Icon size={20} />
                  {mode.name}
                </button>
              );
            })}
          </nav>

          <div className="mt-8 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2 text-sm">
              Quick Guide
            </h3>
            <ul className="text-xs text-blue-800 space-y-2">
              <li><strong>Chat:</strong> General AI assistant</li>
              <li><strong>RAG:</strong> Upload & query docs</li>
              <li><strong>Blog:</strong> Generate blog posts</li>
              <li><strong>Code:</strong> AI code assistant</li>
              
            </ul>
          </div>
        </aside>

        <main className="flex-1 p-6 overflow-hidden">
          {activeMode === 'rag' && <RagMode />}
          {activeMode === 'chat' && <ChatMode />}
          {activeMode === 'blog' && <BlogMode />}
          {activeMode === 'code' && <CodeMode />}
          

        </main>
      </div>
    </div>
  );
}

export default App;

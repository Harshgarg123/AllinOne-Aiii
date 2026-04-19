
import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Plus, Trash2, Menu, RefreshCw } from 'lucide-react';

interface ImageMessage {
  id: string;
  role: 'user' | 'image';
  image: string;
  prompt?: string;
  status?: 'loading' | 'done';
}

interface ImageConversation {
  id: string;
  title: string;
  messages: ImageMessage[];
}

// ⚡ FAST + CONSISTENT IMAGE
function generateImage(prompt: string, randomize = false): string {
  const style = "ultra realistic, 4k, sharp focus";

  let seed = 0;
  for (let i = 0; i < prompt.length; i++) {
    seed += prompt.charCodeAt(i);
  }

  if (randomize) seed = Math.floor(Math.random() * 999999);

  return `https://image.pollinations.ai/prompt/${encodeURIComponent(
    `${style}, ${prompt}`
  )}?width=512&height=512&model=flux&seed=${seed}&nologo=true&nocache=${Date.now()}-${Math.random()}`;
}

export default function ImageMode() {
  const [conversations, setConversations] = useState<ImageConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('image_conversations');
    if (saved) setConversations(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('image_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const selectedConv = conversations.find(c => c.id === selectedId);

  const createNewConversation = () => {
    const newConv: ImageConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    };
    setConversations([newConv, ...conversations]);
    setSelectedId(newConv.id);
    setShowSidebar(false);
  };

  const deleteConversation = (id: string) => {
    if (!confirm('Delete this conversation?')) return;
    setConversations(prev => prev.filter(c => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleGenerate = () => {
    if (!input.trim() || !selectedConv) return;

    const prompt = input.trim();
    const imgUrl = generateImage(prompt);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      image: '',
      prompt,
    };

    const imgMsgId = Date.now().toString() + '-img';

    const imgMsg = {
      id: imgMsgId,
      role: 'image',
      image: imgUrl,
      prompt,
      status: 'done',
    };

    setConversations(prev =>
      prev.map(c =>
        c.id === selectedConv.id
          ? {
              ...c,
              messages: [...c.messages, userMsg, imgMsg],
              title: c.messages.length === 0 ? prompt : c.title,
            }
          : c
      )
    );

    setInput('');
  };

  const regenerate = (msgId: string, prompt: string) => {
    const newUrl = generateImage(prompt, true);

    setConversations(prev =>
      prev.map(c => ({
        ...c,
        messages: c.messages.map(m =>
          m.id === msgId
            ? { ...m, image: newUrl }
            : m
        ),
      }))
    );
  };

  return (
    <div className="h-full flex bg-gray-50">

      {/* MOBILE OVERLAY */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed md:static z-30 md:z-auto
        top-0 left-0 h-full w-72 bg-white border-r border-gray-200
        transform transition-transform duration-300
        ${showSidebar ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 flex flex-col`}
      >
        <div className="p-4 border-b">
          <button
            onClick={createNewConversation}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium shadow-sm"
          >
            <Plus size={18} />
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => {
                setSelectedId(conv.id);
                setShowSidebar(false);
              }}
              className={`p-3 rounded-xl cursor-pointer transition group ${
                selectedId === conv.id
                  ? 'bg-blue-50 border border-blue-400'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium line-clamp-2">
                  {conv.title}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 ml-2"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN IMAGE AREA */}
      <div className="flex-1 flex flex-col">

        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-white">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <Menu size={22} />
            </button>
            <h2 className="font-semibold text-lg">
              {selectedConv?.title || 'Image Generation'}
            </h2>
          </div>
        </div>

        {selectedConv ? (
          <>
            {/* IMAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {selectedConv.messages.map(msg => {
                if (msg.role === 'user') {
                  return (
                    <div key={msg.id} className="flex justify-end">
                      <div className="max-w-[85%] md:max-w-[65%] rounded-2xl px-5 py-3 text-sm shadow-sm bg-blue-600 text-white">
                        <p className="whitespace-pre-wrap leading-relaxed">
                          {msg.prompt}
                        </p>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className="flex justify-start">
                    <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm max-w-[85%] md:max-w-[65%]">
                      {msg.status === 'loading' && (
                        <div className="flex items-center gap-2">
                          <Loader2 className="animate-spin" />
                          Generating...
                        </div>
                      )}

                      {msg.status === 'done' && (
                        <>
                          <img
                            key={msg.image}
                            src={msg.image}
                            className="max-w-xs md:max-w-sm rounded-lg mx-auto shadow"
                            referrerPolicy="no-referrer"
                            alt={msg.prompt}
                          />

                          <div className="flex justify-between items-center mt-3 text-xs">
                            <span className="text-gray-500 truncate max-w-[200px]">
                              {msg.prompt}
                            </span>

                            <button
                              onClick={() => regenerate(msg.id, msg.prompt!)}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition"
                            >
                              <RefreshCw size={14} />
                              Regenerate
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="border-t bg-white p-4">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                  placeholder="Enter prompt to generate image..."
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            Select or create a conversation to start generating images
          </div>
        )}
      </div>
    </div>
  );
}

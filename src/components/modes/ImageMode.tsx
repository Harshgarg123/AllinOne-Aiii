
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

  const handleGenerate = async () => {
    if (!input.trim() || !selectedConv || loading) return;

    const prompt = input.trim();
    setLoading(true);

    // Add user message with loading state
    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      image: '',
      prompt,
    };

    const imgMsgId = Date.now().toString() + '-img';
    const imgMsg: ImageMessage = {
      id: imgMsgId,
      role: 'image' as const,
      image: '',
      prompt,
      status: 'loading' as const,
    };

    // Add messages with loading state
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

    // Simulate async image generation
    setTimeout(() => {
      const imgUrl = generateImage(prompt);
      
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConv.id
            ? {
                ...c,
                messages: c.messages.map(m =>
                  m.id === imgMsgId
                    ? { ...m, image: imgUrl, status: 'done' as const }
                    : m
                ),
              }
            : c
        )
      );
      setLoading(false);
    }, 1500);
  };

  const regenerate = (msgId: string, prompt: string) => {
    const newUrl = generateImage(prompt, true);
    
    // Show loading state on regenerate
    setConversations(prev =>
      prev.map(c => ({
        ...c,
        messages: c.messages.map(m =>
          m.id === msgId
            ? { ...m, image: '', status: 'loading' as const }
            : m
        ),
      }))
    );

    // Simulate async regeneration
    setTimeout(() => {
      setConversations(prev =>
        prev.map(c => ({
          ...c,
          messages: c.messages.map(m =>
            m.id === msgId
              ? { ...m, image: newUrl, status: 'done' as const }
              : m
          ),
        }))
      );
    }, 1000);
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP HEADER */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b bg-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setShowSidebar(true)}
            >
              <Menu size={22} />
            </button>
            <h2 className="font-semibold text-lg truncate">
              {selectedConv?.title || 'Image Generation'}
            </h2>
          </div>
        </div>

        {selectedConv ? (
          <>
            {/* IMAGES AREA */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {selectedConv.messages.map(msg => {
                  if (msg.role === 'user') {
                    return (
                      <div key={msg.id} className="flex justify-end">
                        <div className="max-w-[85%] md:max-w-[75%] lg:max-w-[65%] rounded-2xl px-5 py-3 text-sm shadow-sm bg-blue-600 text-white break-words">
                          <p className="whitespace-pre-wrap leading-relaxed">
                            {msg.prompt}
                          </p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm w-full md:w-auto max-w-full md:max-w-[75%] lg:max-w-[65%]">
                        {msg.status === 'loading' && (
                          <div className="flex items-center justify-center gap-2 py-8">
                            <Loader2 className="animate-spin" size={24} />
                            <span>Generating image...</span>
                          </div>
                        )}

                        {msg.status === 'done' && msg.image && (
                          <>
                            <div className="flex justify-center">
                              <img
                                key={msg.image}
                                src={msg.image}
                                className="w-full h-auto max-w-full rounded-lg shadow object-contain"
                                referrerPolicy="no-referrer"
                                alt={msg.prompt}
                                style={{ maxHeight: '512px' }}
                              />
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-3 text-xs">
                              <span className="text-gray-500 truncate w-full sm:max-w-[200px] md:max-w-[300px]">
                                {msg.prompt}
                              </span>

                              <button
                                onClick={() => regenerate(msg.id, msg.prompt!)}
                                disabled={loading}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
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
            </div>

            {/* INPUT AREA */}
            <div className="border-t bg-white p-4 shrink-0">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !loading && handleGenerate()}
                  placeholder="Enter prompt to generate image..."
                  className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm md:text-base"
                  disabled={loading}
                />
                <button
                  onClick={handleGenerate}
                  disabled={loading || !input.trim()}
                  className="px-4 md:px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center shadow-sm shrink-0"
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
          <div className="flex-1 flex items-center justify-center text-gray-400 p-4 text-center">
            Select or create a conversation to start generating images
          </div>
        )}
      </div>
    </div>
  );
}

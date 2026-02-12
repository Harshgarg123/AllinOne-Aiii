import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Plus, Trash2, Menu } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
}

export default function ChatMode() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat_conversations');
    if (saved) {
      setConversations(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('chat_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedId]);

  const selectedConv = conversations.find((c) => c.id === selectedId);

  const createNewConversation = () => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    };

    setConversations((prev) => [newConv, ...prev]);
    setSelectedId(newConv.id);
    setShowSidebar(false);
  };

  const deleteConversation = (id: string) => {
    if (!confirm('Delete this conversation?')) return;

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateConversation = (id: string, updated: Conversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? updated : c))
    );
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedConv) return;

    const apiKey = localStorage.getItem('user_api_key');
    if (!apiKey) {
      alert('Please enter your Groq API key first.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    const updatedMessages = [...selectedConv.messages, userMessage];

    updateConversation(selectedConv.id, {
      ...selectedConv,
      messages: updatedMessages,
    });

    setInput('');
    setLoading(true);

    try {
      const response = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: updatedMessages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API error');
      }

      const assistantMessage: Message = {
        id: Date.now().toString() + '-ai',
        role: 'assistant',
        content: data.choices[0].message.content,
      };

      updateConversation(selectedConv.id, {
        ...selectedConv,
        title:
          selectedConv.messages.length === 0
            ? userMessage.content.slice(0, 40)
            : selectedConv.title,
        messages: [...updatedMessages, assistantMessage],
      });
    } catch (err) {
      alert(
        'Error: ' + (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
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

    {/* CHAT AREA */}
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
            {selectedConv?.title || 'Chat'}
          </h2>
        </div>
      </div>

      {selectedConv ? (
        <>
          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {selectedConv.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === 'user'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[65%] rounded-2xl px-5 py-3 text-sm shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* INPUT AREA */}
          <div className="border-t bg-white p-4">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && !loading && handleSend()
                }
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button
                onClick={handleSend}
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
          Select or create a conversation
        </div>
      )}
    </div>
  </div>
);


}

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, Plus, Trash2 } from 'lucide-react';

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

    setConversations([newConv, ...conversations]);
    setSelectedId(newConv.id);
  };

  const deleteConversation = (id: string) => {
    if (!confirm('Delete this conversation?')) return;

    setConversations(conversations.filter((c) => c.id !== id));
    if (selectedId === id) setSelectedId(null);
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

      const finalMessages = [...updatedMessages, assistantMessage];

      updateConversation(selectedConv.id, {
        ...selectedConv,
        title:
          selectedConv.messages.length === 0
            ? userMessage.content.slice(0, 40)
            : selectedConv.title,
        messages: finalMessages,
      });
    } catch (err) {
      alert(
        'Error: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const updateConversation = (id: string, updated: Conversation) => {
    setConversations(
      conversations.map((c) => (c.id === id ? updated : c))
    );
  };

  return (
    <div className="h-full flex gap-4">
      <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
        <button
          onClick={createNewConversation}
          className="w-full mb-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
        >
          <Plus size={20} />
          New Chat
        </button>

        <div className="flex-1 overflow-y-auto space-y-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setSelectedId(conv.id)}
              className={`p-3 rounded-lg cursor-pointer transition group ${
                selectedId === conv.id
                  ? 'bg-blue-50 border-2 border-blue-500'
                  : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
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

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        {selectedConv ? (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-gray-200 p-4">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === 'Enter' && !loading && handleSend()
                  }
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center"
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

import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Search,
  Trash2,
  Loader2,
  Menu,
} from 'lucide-react';
import { extractTextFromPDF } from '../../lib/pdf';

interface Document {
  id: string;
  filename: string;
  content: string;
  summary: string | null;
  created_at: string;
}

export default function RagMode() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Load documents
  useEffect(() => {
    const savedDocs = localStorage.getItem('rag_documents');
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    }
  }, []);

  // Save documents
  useEffect(() => {
    localStorage.setItem('rag_documents', JSON.stringify(documents));
  }, [documents]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      let text = '';

      if (file.type === 'application/pdf') {
        text = await extractTextFromPDF(file);
      } else {
        text = await file.text();
      }

      if (!text.trim()) {
        throw new Error('No readable text found');
      }

      const newDoc: Document = {
        id: crypto.randomUUID(),
        filename: file.name,
        content: text,
        summary: null,
        created_at: new Date().toISOString(),
      };

      // ✅ FIXED: functional update prevents duplicates
      setDocuments((prev) => [newDoc, ...prev]);
      setSelectedDoc(newDoc);
      setAnswer('');
      setShowSidebar(false);
    } catch (err) {
      alert(
        'Error uploading file: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setUploading(false);
      e.target.value = ''; // reset input
    }
  };

  const handleSummarize = async () => {
    if (!selectedDoc) return;

    const apiKey = localStorage.getItem('user_api_key');
    if (!apiKey) {
      alert('Please add your Groq API key first.');
      return;
    }

    setSummarizing(true);

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
            messages: [
              {
                role: 'system',
                content: 'Summarize clearly and concisely.',
              },
              {
                role: 'user',
                content: selectedDoc.content.slice(0, 12000),
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API error');
      }

      const summary = data.choices[0].message.content;

      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id ? { ...doc, summary } : doc
        )
      );

      setSelectedDoc({ ...selectedDoc, summary });
    } catch {
      alert('Error summarizing document');
    } finally {
      setSummarizing(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!selectedDoc || !question.trim()) return;

    const apiKey = localStorage.getItem('user_api_key');
    if (!apiKey) {
      alert('Please add your Groq API key first.');
      return;
    }

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
            messages: [
              {
                role: 'system',
                content:
                  'Answer only using the provided document context.',
              },
              {
                role: 'user',
                content: `Document:\n${selectedDoc.content.slice(
                  0,
                  12000
                )}\n\nQuestion: ${question}`,
              },
            ],
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API error');
      }

      setAnswer(data.choices[0].message.content);
      setQuestion('');
    } catch {
      alert('Error getting answer');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = (id: string) => {
    if (!confirm('Delete this document?')) return;

    setDocuments((prev) => prev.filter((doc) => doc.id !== id));

    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
      setAnswer('');
    }
  };

  return (
  <div className="h-full flex gap-4">

    {/* SIDEBAR */}
    <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Your Documents
      </h3>

      <div className="flex-1 overflow-y-auto space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`p-3 rounded-lg cursor-pointer transition group ${
              selectedDoc?.id === doc.id
                ? 'bg-blue-50 border-2 border-blue-500'
                : 'bg-gray-50 border-2 border-transparent hover:border-gray-300'
            }`}
            onClick={() => setSelectedDoc(doc)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm font-medium text-gray-700 truncate">
                  {doc.filename}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* MAIN CONTENT */}
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col overflow-hidden">

      {/* UPLOAD SECTION AT TOP */}
      <div className="mb-6">
        <label className="block w-full cursor-pointer">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-500 hover:bg-blue-50 transition text-center">
            <Upload className="mx-auto mb-2 text-gray-400" size={32} />
            <p className="text-sm text-gray-600">
              {uploading ? 'Uploading...' : 'Click to upload document'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              TXT, MD, JSON, CSV, PDF
            </p>
          </div>
          <input
            type="file"
            accept=".txt,.md,.json,.csv,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {/* DOCUMENT VIEW */}
      {selectedDoc ? (
        <>
          <div className="mb-4 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {selectedDoc.filename}
            </h2>
            <button
              onClick={handleSummarize}
              disabled={summarizing}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50"
            >
              {summarizing ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <Sparkles size={16} />
              )}
              {summarizing ? 'Summarizing...' : 'Summarize'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {selectedDoc.summary && (
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2">
                  Summary
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {selectedDoc.summary}
                </p>
              </div>
            )}

            {answer && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-2">
                  Answer
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {answer}
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                onClick={handleAskQuestion}
                disabled={loading || !question.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Search size={16} />
                )}
                Ask
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <p>Upload or select a document to get started</p>
        </div>
      )}
    </div>
  </div>
);

}

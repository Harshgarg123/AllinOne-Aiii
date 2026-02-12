import { useState } from 'react';
import { Code2, Loader2, Copy, Check } from 'lucide-react';

export default function CodeMode() {
  const [language, setLanguage] = useState('javascript');
  const [task, setTask] = useState('');
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!task.trim()) return;

    const apiKey = localStorage.getItem('user_api_key');

    if (!apiKey) {
      alert('Please enter your Groq API key first.');
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
                content: `You are an expert programmer. Generate clean, efficient, and well-commented code in ${language}. Always provide the code inside triple backticks first, then a brief explanation.`,
              },
              {
                role: 'user',
                content: task,
              },
            ],
            temperature: 0.5,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Groq API error');
      }

      const aiResponse = data.choices[0].message.content;

      // Extract code block
      const codeMatch = aiResponse.match(/```[\w]*\n([\s\S]*?)```/);

      if (codeMatch) {
        setCode(codeMatch[1].trim());
        setExplanation(
          aiResponse.replace(/```[\w]*\n[\s\S]*?```/, '').trim()
        );
      } else {
        setCode(aiResponse);
        setExplanation('');
      }
    } catch (err) {
      alert(
        'Error: ' +
          (err instanceof Error ? err.message : 'Unknown error')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex gap-4">
      <div className="w-96 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Code Assistant
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Programming Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-white"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="go">Go</option>
              <option value="rust">Rust</option>
              <option value="php">PHP</option>
              <option value="ruby">Ruby</option>
              <option value="swift">Swift</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What do you want to code?
            </label>
            <textarea
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="e.g., Create a function that sorts an array of objects by a specific property"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
              rows={6}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !task.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Code2 size={20} />
                Generate Code
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
        {code ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Generated Code
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-gray-100">
                  <code>{code}</code>
                </pre>
              </div>

              {explanation && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Explanation
                  </h4>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {explanation}
                  </p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Code2 size={64} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Your AI Coding Assistant</p>
              <p className="text-sm">
                Describe what you want to build and get instant code
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

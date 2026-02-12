import { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";

export default function BlogMode() {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("medium");
  const [blogContent, setBlogContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    const apiKey = localStorage.getItem("user_api_key");

    if (!apiKey) {
      alert("Please enter your Groq API key first.");
      return;
    }

    setLoading(true);

    try {
      const lengthGuide =
        length === "short"
          ? "300-500 words"
          : length === "medium"
          ? "700-1000 words"
          : "1500-2000 words";

      const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content:
                  "You are a professional blog writer who writes structured, engaging, SEO-friendly blog posts with headings and proper formatting.",
              },
              {
                role: "user",
                content: `Write a ${tone} blog about "${topic}" in ${lengthGuide}. Use clear headings, subheadings, and proper paragraph formatting.`,
              },
            ],
            temperature: 0.7,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Groq API error");
      }

      setBlogContent(data.choices[0].message.content);
    } catch (err) {
      alert(
        "Error generating blog: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(blogContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-4">
      
      {/* LEFT PANEL */}
      <div className="w-full lg:w-96 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
          Blog Generator
        </h2>

        <div className="space-y-4">
          
          {/* Topic */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Blog Topic
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The Future of AI in Healthcare"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="humorous">Humorous</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>

          {/* Length */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none bg-white"
            >
              <option value="short">Short (300-500 words)</option>
              <option value="medium">Medium (700-1000 words)</option>
              <option value="long">Long (1500-2000 words)</option>
            </select>
          </div>

          {/* Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !topic.trim()}
            className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Blog
              </>
            )}
          </button>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex flex-col min-h-[300px]">
        {blogContent ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Generated Blog
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm"
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

            <div className="flex-1 overflow-y-auto pr-2">
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                {blogContent}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center px-4">
              <Sparkles size={56} className="mx-auto mb-4 opacity-40" />
              <p className="text-base md:text-lg mb-2">
                Ready to create amazing content?
              </p>
              <p className="text-sm">
                Enter a topic and generate your blog post
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

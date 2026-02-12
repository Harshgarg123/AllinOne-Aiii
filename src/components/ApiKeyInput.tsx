import { useState } from "react";
import { useApiKey } from "../contexts/ApiKeyManager";

export default function ApiKeyInput() {
  const { apiKey, setApiKey } = useApiKey();
  const [tempKey, setTempKey] = useState(apiKey);

  const handleSave = () => {
    if (!tempKey.trim()) return;
    setApiKey(tempKey);
    alert("Groq API Key Saved Successfully!");
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow border mb-4">
      <h2 className="font-semibold mb-2">Groq API Key</h2>
      <input
        type="password"
        value={tempKey}
        onChange={(e) => setTempKey(e.target.value)}
        placeholder="Enter your Groq API key"
        className="w-full px-4 py-2 border rounded-lg"
      />
      <button
        onClick={handleSave}
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Save Key
      </button>
    </div>
  );
}

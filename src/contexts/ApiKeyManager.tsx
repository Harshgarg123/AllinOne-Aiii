import { createContext, useContext, useEffect, useState } from "react";

interface ApiKeyContextType {
  apiKey: string;
  setApiKey: (key: string) => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKeyState] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user_api_key");
    if (saved) setApiKeyState(saved);
  }, []);

  const setApiKey = (key: string) => {
    setApiKeyState(key);
    localStorage.setItem("user_api_key", key);
  };

  return (
    <ApiKeyContext.Provider value={{ apiKey, setApiKey }}>
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  if (!context) throw new Error("useApiKey must be used inside ApiKeyProvider");
  return context;
};

import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Sparkles, MessageSquare, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
}

interface ChatAssistantProps {
  currentCity: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ currentCity }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am your AI Public Health Assistant. I am currently monitoring health advisories and active outbreaks in **${currentCity}**. \n\nHow can I help you today? You can ask me about regional risk levels, preventative tips, or symptom checks.`,
      sources: ["Health Guardian Agent Default"]
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions based on requirements
  const quickQuestions = [
    `Is it safe to travel to ${currentCity}?`,
    `What infectious diseases are common in ${currentCity}?`,
    "What should I do if I start having a high fever and body aches?",
    "How can I prevent contracting Dengue or Malaria?"
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Restart chat if city changes to update context
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: `Hello! I am your AI Public Health Assistant. I am currently monitoring health advisories and active outbreaks in **${currentCity}**. \n\nHow can I help you today? You can ask me about regional risk levels, preventative tips, or symptom checks.`,
        sources: ["Health Guardian Agent Default"]
      }
    ]);
  }, [currentCity]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Map frontend state to backend requirements
      // Translate 'assistant' to 'model' for Gemini
      const formattedHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        content: m.content
      }));

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          location: currentCity,
          history: formattedHistory
        })
      });

      if (!response.ok) {
        throw new Error('API server returned error status');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.reply,
        sources: data.sources || ["Health Advisory Databases"]
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "⚠️ I'm sorry, I'm having trouble connecting to the public health advisory server right now. Please verify that the backend is running locally and try again.",
        sources: ["System Connection Diagnostics"]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-[600px] md:h-[650px]">
      {/* Bot Chat Header */}
      <div className="p-4 bg-sky-600 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="w-5 h-5 text-sky-100" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Health Assistant</h3>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-sky-100 font-medium">Monitoring {currentCity}</span>
            </div>
          </div>
        </div>
        <div className="text-[10px] bg-sky-700 text-sky-100 px-2 py-1 rounded-full border border-sky-500/30">
          Gemini Agent Active
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/40 flex items-start gap-2 text-[10px] text-amber-700 dark:text-amber-300">
        <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
        <p>
          <strong>Notice:</strong> This assistant does not diagnose diseases or prescribe treatments. Cites CDC/WHO guidelines. Consult medical clinics for healthcare diagnosis.
        </p>
      </div>

      {/* Message Screen */}
      <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-900/40">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-sky-600 text-white' 
                : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
            }`}>
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Message Bubble */}
            <div className="flex flex-col">
              <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white border-sky-600 rounded-tr-none'
                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border-slate-100 dark:border-slate-700 rounded-tl-none'
              }`}>
                {msg.content}
              </div>
              
              {/* Citations / Sources */}
              {msg.role === 'assistant' && msg.sources && (
                <div className="mt-1 text-[9px] text-slate-400 dark:text-slate-500 pl-1 flex flex-wrap gap-1 items-center">
                  <span className="font-semibold">References:</span>
                  {msg.sources.map((s, idx) => (
                    <span key={idx} className="bg-slate-100 dark:bg-slate-700/60 px-1 rounded">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-200 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Grid */}
      {messages.length === 1 && (
        <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-700">
          <p className="text-[10px] text-slate-500 font-semibold mb-1.5 px-1 flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5 text-sky-500" /> Click to ask the agent:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-left text-[10px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-sky-500 hover:text-sky-600 dark:hover:border-sky-500 dark:hover:text-sky-400 p-2 rounded-xl transition font-medium truncate"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask about disease outbreaks, safety, or symptoms in ${currentCity}...`}
          disabled={isLoading}
          className="flex-grow text-xs px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-800 text-slate-800 dark:text-slate-100 border border-transparent focus:border-slate-200 dark:focus:border-slate-600 transition"
        />
        <button
          type="submit"
          disabled={isLoading || !inputValue.trim()}
          className="bg-sky-600 hover:bg-sky-700 text-white disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-400 dark:disabled:text-slate-500 w-10 h-10 rounded-xl flex items-center justify-center transition flex-shrink-0 shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

import React, { useState, useRef, useEffect } from "react";
import { chatAPI } from "../utils/api";
import { Send, Bot, User, ShieldCheck, Terminal, HelpCircle } from "lucide-react";

const CyberAssistant = () => {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: (
        "### Welcome Agent! 👋\n\n" +
        "I am your **PhishGuard AI Assistant**. I can help you decode cybersecurity concepts, " +
        "spot social engineering tactics, or walk you through an incident mitigation checklist.\n\n" +
        "Try asking me one of the quick questions below or paste a suspicious message and prefix it with **'Scan:'**!"
      )
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    // Add user message
    const userMsg = { sender: "user", text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    
    setLoading(true);
    try {
      const data = await chatAPI.sendMessage(textToSend);
      // Add bot message
      setMessages(prev => [...prev, { sender: "bot", text: data.response }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: "⚠️ **Connection Error**: I could not reach my local AI core. Please confirm the Flask backend server is running." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render markdown-like structures manually for cleanliness (safe render)
  const formatMarkdown = (text) => {
    if (typeof text !== "string") return text;
    
    return text.split("\n").map((line, idx) => {
      // Headers
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="text-sm font-bold text-cyber-teal uppercase tracking-wider mt-4 mb-2 first:mt-0">{line.substring(4)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="text-base font-extrabold text-white mt-4 mb-2 first:mt-0">{line.substring(3)}</h2>;
      }
      // Bullet lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        const item = line.substring(2);
        // Highlight bold in line
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-disc mb-1 leading-relaxed">
            {parseInlineStyles(item)}
          </li>
        );
      }
      // Numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+\.\s)(.*)/);
        return (
          <li key={idx} className="text-xs text-slate-300 ml-4 list-decimal mb-1 leading-relaxed">
            {parseInlineStyles(match[2])}
          </li>
        );
      }
      
      // Regular line with inline formatting
      return <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2 last:mb-0">{parseInlineStyles(line)}</p>;
    });
  };

  // Parse **bold** tags inline
  const parseInlineStyles = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white font-bold">{part.substring(2, part.length - 2)}</strong>;
      }
      return part;
    });
  };

  const quickQuestions = [
    "How can I identify phishing?",
    "I clicked a suspicious link, what should I do?",
    "Why does PhishGuard mark a URL as high-risk?",
    "What are common SMS/WhatsApp scam indicators?"
  ];

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col justify-between bg-cyber-bg border border-slate-800/80 rounded-3xl overflow-hidden glass-card shadow-blue-glow">
      {/* Terminal Header */}
      <div className="p-4 bg-slate-950 border-b border-slate-900 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4.5 w-4.5 text-cyber-teal" />
          <span className="text-xs font-mono font-bold text-slate-400 tracking-wider">PG_COGNITIVE_CORE // SEC_AGENT</span>
        </div>
        <div className="flex items-center gap-1.5 bg-cyber-teal/5 border border-cyber-teal/20 rounded px-2 py-0.5 text-[9px] font-bold text-cyber-teal uppercase tracking-widest">
          <span className="h-1.5 w-1.5 bg-cyber-teal rounded-full animate-ping"></span>
          Ready
        </div>
      </div>

      {/* Messages View Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, idx) => {
          const isBot = msg.sender === "bot";
          return (
            <div 
              key={idx} 
              className={`flex items-start gap-3 max-w-[80%] ${isBot ? "" : "ml-auto flex-row-reverse"}`}
            >
              {/* Avatar Icon */}
              <div className={`p-2 rounded-xl border shrink-0 ${
                isBot 
                  ? "bg-slate-900 border-slate-800 text-cyber-teal" 
                  : "bg-cyber-blue/10 border-cyber-blue/20 text-cyber-blue shadow-blue-glow"
              }`}>
                {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Message bubble card */}
              <div className={`p-4 rounded-2xl border text-slate-300 text-sm leading-relaxed ${
                isBot 
                  ? "bg-slate-900/60 border-slate-800/80 rounded-tl-sm shadow-sm" 
                  : "bg-slate-950 border-slate-850 rounded-tr-sm"
              }`}>
                {formatMarkdown(msg.text)}
              </div>
            </div>
          );
        })}

        {/* Typing loader */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-850 text-cyber-teal shrink-0">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
              <span className="w-1.5 h-1.5 bg-cyber-teal rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-cyber-teal rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-cyber-teal rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer input block */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-900 space-y-3">
        {/* Quick selections */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pb-1">
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="text-[10px] font-bold text-slate-400 bg-slate-900 border border-slate-850 hover:border-cyber-teal hover:text-white px-2.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
              >
                <HelpCircle className="h-3 w-3 text-cyber-teal" />
                {q}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(input); }}
            placeholder="Ask a security question, or paste text prefixing with 'Scan:'..."
            className="flex-1 bg-slate-950 border border-slate-850 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyber-teal focus:ring-1 focus:ring-cyber-teal transition-all"
          />
          <button
            onClick={() => handleSendMessage(input)}
            className="p-3 bg-gradient-to-tr from-cyber-blue to-cyber-teal text-white rounded-xl hover:opacity-90 transition-all cursor-pointer shadow-cyan-glow"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CyberAssistant;

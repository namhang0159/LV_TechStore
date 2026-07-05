"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, User, Sparkles } from "lucide-react";
import { sendMessageToAI } from "@/util/api";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "model";
  content: string;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: "Chào bạn! Mình là AI tư vấn viên của TechStore. Mình có thể giúp gì cho bạn hôm nay? (Ví dụ: 'Laptop học tập dưới 15 triệu')",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setIsTyping(true);

    try {
      const response = await sendMessageToAI(messages, userMessage);
      if (response.success) {
        setMessages([...newMessages, { role: "model", content: response.reply }]);
      } else {
        setMessages([...newMessages, { role: "model", content: "Xin lỗi, hiện tại mình không thể trả lời. Vui lòng thử lại sau!" }]);
      }
    } catch (error) {
      setMessages([...newMessages, { role: "model", content: "Xin lỗi, đã có lỗi kết nối đến máy chủ." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const parseMessage = (text: string) => {
    // Basic markdown link parser [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 font-semibold hover:underline bg-blue-50 px-1 rounded"
        >
          {match[1]}
        </a>
      );
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    // Handle newlines
    return parts.map((part, i) => {
      if (typeof part === 'string') {
        return <span key={i}>{part.split('\n').map((line, j) => (
          <span key={j}>
            {line}
            {j !== part.split('\n').length - 1 && <br />}
          </span>
        ))}</span>;
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={cn(
          "bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl w-[350px] sm:w-[400px] mb-4 overflow-hidden flex flex-col transition-all duration-300 transform origin-bottom-right",
          isOpen ? "scale-100 opacity-100 h-[500px]" : "scale-0 opacity-0 h-0"
        )}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1">
                TechStore AI <Sparkles className="w-3 h-3 text-yellow-300" />
              </h3>
              <p className="text-xs text-blue-100 opacity-90">Sẵn sàng tư vấn 24/7</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 custom-scrollbar">
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={cn(
                "flex max-w-[85%] gap-2 animate-in fade-in slide-in-from-bottom-2",
                msg.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-auto",
                msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-gradient-to-br from-blue-500 to-indigo-500 text-white"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              
              <div className={cn(
                "px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm",
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-br-sm" 
                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm"
              )}>
                {parseMessage(msg.content)}
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex max-w-[85%] mr-auto gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center shrink-0 mt-auto">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-slate-100 shrink-0">
          <div className="flex items-center gap-2 bg-slate-100/80 rounded-full p-1.5 border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Hỏi về sản phẩm, giá cả..."
              className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-slate-700 placeholder:text-slate-400"
              disabled={isTyping}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 group z-50",
          isOpen 
            ? "bg-slate-800 hover:bg-slate-900 rotate-90" 
            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:-translate-y-1"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <div className="relative">
             <MessageSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
             <span className="absolute -top-1 -right-2 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
          </div>
        )}
      </button>
    </div>
  );
}

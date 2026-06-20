"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageCircle, Bot, BotMessageSquare } from "lucide-react";

export function ChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      {/* Chat Widgets */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
        <Link href="https://www.messenger.com/t/100086047046911">
          <button className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors">
            <MessageCircle className="w-6 h-6" />
          </button>
        </Link>
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="bg-black text-white rounded-full p-4 shadow-lg hover:bg-gray-800 transition-colors"
        >
          <BotMessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-[400px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 flex flex-col overflow-hidden">
          <div className="bg-black text-white p-3 font-bold flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <span>RIU STORE Bot</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-gray-300 hover:text-white">✕</button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            <div className="bg-gray-200 text-gray-800 p-3 rounded-lg rounded-tl-none inline-block max-w-[85%] text-sm self-start">
              Xin chào! Mình là trợ lý ảo của RIU STORE. Mình có thể giúp gì cho bạn?
            </div>
          </div>
          <div className="p-3 bg-white border-t border-gray-200 flex gap-2">
            <input 
              type="text" 
              placeholder="Nhập tin nhắn..." 
              className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
}

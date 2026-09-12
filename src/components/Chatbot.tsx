import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, HelpCircle, User, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ChatMessage } from "../types";

import { OFFLINE_AI_RESPONSES } from "../mockData";

interface ChatbotProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  footerVisibleHeight: number;
}

export default function Chatbot({ isOpen, setIsOpen, footerVisibleHeight }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "নমস্কার! স্বাগত মেধা অন্বেষা (Medha Anwesha) পোর্টালে। আমি আপনাকে পরীক্ষার তারিখ, সিলেবাস এবং ফলাফল চেক করতে সাহায্য করতে পারি।\n\nHello! Welcome to Medha Anwesha Portal. How can I help you with the exam details, syllabus, or checking results today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const getSmartOfflineReply = (query: string): string => {
    const q = query.toLowerCase();
    if (q.includes("date") || q.includes("তারিখ") || q.includes("when") || q.includes("schedule") || q.includes("কখন")) {
      return OFFLINE_AI_RESPONSES.exam_date;
    }
    if (q.includes("syllabus") || q.includes("সিলেবাস") || q.includes("subject") || q.includes("mark") || q.includes("নম্বর")) {
      return OFFLINE_AI_RESPONSES.syllabus;
    }
    if (q.includes("result") || q.includes("ফলাফল") || q.includes("check") || q.includes("roll") || q.includes("certificate") || q.includes("রোল")) {
      return OFFLINE_AI_RESPONSES.results;
    }
    if (q.includes("who") || q.includes("developer") || q.includes("design") || q.includes("sudip") || q.includes("কে বানিয়ে")) {
      return OFFLINE_AI_RESPONSES.developer;
    }
    return `নমস্কার! মেধা অন্বেষা ২০২৬ পরীক্ষার বিস্তারিত তথ্য:\n- 📅 **পরীক্ষার তারিখ:** ২৯শে নভেম্বর, ২০২৬\n- 🔍 **ফলাফল:** হোমপেজে রোল নম্বর দিয়ে সার্চ করুন\n- 📚 **সিলেবাস:** আর্কাইভ সেকশন থেকে ডাউনলোড করুন\n- 💡 সহায়তার জন্য: **sudipkhatua808@gmail.com**\n\n*(Active Assistant Mode)*`;
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ sender: m.sender, text: m.text }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: textToSend, history })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          const botMessage: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages((prev) => [...prev, botMessage]);
          return;
        }
      }

      // Offline smart fallback
      const smartReply = getSmartOfflineReply(textToSend);
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: smartReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      const smartReply = getSmartOfflineReply(textToSend);
      const errorMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text: smartReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const SUGGESTIONS = [
    { label: "Syllabus (সিলেবাস)", text: "What is the exam syllabus detail?" },
    { label: "Exam Date (পরীক্ষার তারিখ)", text: "When is the Medha Anwesha exam date?" },
    { label: "How to check Result (ফলাফল)", text: "How do I check my exam result and ranks?" },
    { label: "Who designed this website?", text: "Who designed this website and built this portal?" }
  ];

  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div
          id="chatbot-window"
          className="fixed right-4 sm:right-6 w-[380px] max-w-[calc(100vw-2rem)] h-[460px] sm:h-[500px] bg-white rounded-2xl shadow-3xl border border-orange-100 flex flex-col overflow-hidden z-40 font-sans animate-fade-in"
          style={{ bottom: `${80 + footerVisibleHeight}px` }}
        >
          {/* Header */}
          <div className="bg-indigo-950 p-4 text-white flex items-center justify-between border-b border-indigo-900">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-950 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">মেধা অন্বেষা সহকারী</h3>
                <p className="text-[10px] text-amber-400">Bilingual Active AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-300 hover:text-white p-1 rounded-full hover:bg-indigo-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/30">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {m.sender !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs shadow-sm leading-relaxed ${
                    m.sender === "user"
                      ? "bg-amber-500 text-indigo-950 font-medium rounded-tr-none"
                      : "bg-white text-gray-800 border border-amber-100 rounded-tl-none"
                  }`}
                >
                  <div className="markdown-body prose max-w-none text-left">
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                  <span className={`block text-[8px] mt-1 text-right font-mono ${m.sender === "user" ? "text-indigo-950/60" : "text-gray-400"}`}>
                    {m.timestamp}
                  </span>
                </div>
                {m.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-amber-500 border border-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm animate-fade-in">
                    <User className="w-4 h-4 text-indigo-950" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2 justify-start items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-800 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400/20" />
                </div>
                <div className="bg-white border border-amber-100 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          <div className="p-2 border-t border-amber-100 bg-amber-50 flex gap-1.5 overflow-x-auto scrollbar-hide">
            {SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s.text)}
                className="whitespace-nowrap text-[10px] px-2.5 py-1.5 bg-white border border-amber-200 text-indigo-900 rounded-full hover:bg-amber-100 transition-colors flex-shrink-0 font-medium shadow-sm"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 bg-white border-t border-gray-100 flex gap-2 items-center"
          >
            <input
              type="text"
              placeholder="প্রশ্ন টাইপ করুন... Ask a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50 focus:bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-full bg-indigo-900 text-white hover:bg-indigo-800 disabled:bg-gray-200 disabled:text-gray-400 transition-all flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

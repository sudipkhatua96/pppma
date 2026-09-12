import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Copy, Check, Facebook, Twitter, MessageCircle } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
  text?: string;
}

export default function ShareModal({ isOpen, onClose, url, title, text = "মেধা অন্বেষা ২০২৬ পোর্টালে ভিজিট করুন এবং ফলাফল ও আপডেট জানুন!" }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const platforms = [
    {
      name: "WhatsApp",
      banglaName: "হোয়াটসঅ্যাপ",
      icon: MessageCircle,
      color: "bg-green-600 hover:bg-green-500 shadow-green-900/30",
      textColor: "text-white",
      getUrl: () => `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`,
    },
    {
      name: "Facebook",
      banglaName: "ফেসবুক",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-500 shadow-blue-900/30",
      textColor: "text-white",
      getUrl: () => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
      name: "Twitter",
      banglaName: "টুইটার (X)",
      icon: Twitter,
      color: "bg-gray-900 hover:bg-gray-800 shadow-gray-950/30",
      textColor: "text-white",
      getUrl: () => `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
    },
    {
      name: "Telegram",
      banglaName: "টেলিগ্রাম",
      icon: Send,
      color: "bg-sky-500 hover:bg-sky-400 shadow-sky-900/30",
      textColor: "text-white",
      getUrl: () => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
    }
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy path: ", err);
    }
  };

  // Close with Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="share-modal-container">
          {/* Transparent-blur backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-950 to-slate-950 p-6 border border-indigo-800/80 shadow-2xl shadow-indigo-500/10"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-amber-400 font-sans tracking-wide uppercase">
                শেয়ার পোর্টাল (Share Portal)
              </h3>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-gray-400 hover:bg-indigo-900/50 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Share Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-300 mb-5 leading-relaxed">
              যেকোনো সামাজিক মাধ্যমে দ্রুত মেধা অন্বেষা পোর্টাল বা প্রবেশ লিঙ্ক শেয়ার করুন:
            </p>

            {/* Grid of sharing networks */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {platforms.map((p) => {
                const IconComponent = p.icon;
                return (
                  <a
                    key={p.name}
                    href={p.getUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      setTimeout(onClose, 800); // short delay to allow clicking
                    }}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border border-white/5 active:scale-95 hover:scale-[1.03] transition-all duration-200 cursor-pointer text-left shadow-md ${p.color} ${p.textColor}`}
                  >
                    <div className="p-1.5 bg-white/10 rounded-lg">
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col leading-tight">
                      <span className="text-[11px] font-extrabold font-sans">{p.name}</span>
                      <span className="text-[10px] text-white/70">{p.banglaName}</span>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* Copy Link input and button */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                লিঙ্ক কপি করুন (Link)
              </span>
              <div className="flex items-center gap-1.5 bg-indigo-950/60 p-1.5 rounded-xl border border-indigo-900/85">
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="flex-1 bg-transparent px-2 text-[11px] font-mono text-gray-300 outline-none select-all"
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                />
                <button
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-1.5 px-3 py-1.5 font-sans font-bold text-[10px] rounded-lg transition-all duration-200 cursor-pointer shadow-md ${
                    copied
                      ? "bg-green-600 text-white"
                      : "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-amber-500/20 active:scale-95"
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Ambient gold glow highlight inside dialog */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-40 h-20 bg-amber-500/10 blur-xl rounded-full pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

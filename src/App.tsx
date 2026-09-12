import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Award, CheckCircle, HelpCircle, Calendar, GraduationCap, ChevronRight, UserCheck, Phone, Mail, Clock, Sun, Moon, Eye, Sparkles, X, Bot, Share2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Chatbot from "./components/Chatbot";
import PortalView from "./components/PortalView";
import ArchiveView from "./components/ArchiveView";
import AdminDashboard from "./components/AdminDashboard";
import ShareModal from "./components/ShareModal";
import ParticleTrail from "./components/ParticleTrail";
import CustomCursor from "./components/CustomCursor";
import InteractiveBackdrop from "./components/InteractiveBackdrop";
import { PortalSettings } from "./types";

const INITIAL_SETTINGS: PortalSettings = {
  websiteName: "Medha Anwesha Portal (মেধা অন্বেষা)",
  logoText: "মেধা অন্বেষা",
  primaryColor: "#1a1464", // Indigo
  accentColor: "#f5a623",  // Saffron Gold
  themeStyle: "traditional",
  heroHeading: "মেধা অন্বেষা ২০২৬",
  heroSubtitle: "Illuminating, recognizing, and fostering local academic excellence in Bengal's villages",
  examDate: "Sunday, November 29, 2026",
  syllabusDetails: "Class V-VIII: Bengali Grammar & Literature (20%), Mathematics & Logical Reasoning (30%), General Science & Environment (30%), General Knowledge & Local Heritage (20%). Total MCQ Marks: 50. Duration: 2 Hours.",
  bgSlideshowUrls: [
    "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200", 
    "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200",
    "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=1200"
  ],
  bgVideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-sunlight-through-the-leaves-of-a-tree-4357-large.mp4",
  useVideoBg: false,
  adminPasscode: "",
  allowCommitteeModifications: false,
  footerCopyright: "© 2026 Medha Anwesha Committee",
  footerPhone: "+91 9876543210",
  footerEmail: "committee@medhaanwesha.org",
  footerDevName: "Sudip Khatua",
  footerDevEmail: "sudipkhatua808@gmail.com",
  footerSocial: "https://facebook.com/medhaanwesha",
  footerCompany: "Medha Labs Solutions",
  heroImageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200",
  officialLogo: "",
  developerLogo: "",
  scrolling_ticker_label: "সরাসরি খবর / LATEST NEWS",
  is_results_live: true
};

type ViewState = "portal" | "archive" | "admin";

export default function App() {
  const [settings, setSettings] = useState<PortalSettings>(INITIAL_SETTINGS);
  const [toasts, setToasts] = useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  const [activeView, setActiveView] = useState<ViewState>("portal");
  const [bgIndex, setBgIndex] = useState(0);
  const [time, setTime] = useState(new Date());

  // Persistent Theme Mode State
  const [themeMode, setThemeMode] = useState<"normal" | "dark" | "eye-comfort">(() => {
    const saved = localStorage.getItem("medha-theme-mode");
    if (saved === "dark" || saved === "eye-comfort") {
      return saved as "dark" | "eye-comfort";
    }
    return "normal";
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [footerVisibleHeight, setFooterVisibleHeight] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  // Disable browser inspection tricks (Right clicks, F12, Ctrl+Shift+I, Ctrl+U)
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j")) {
        e.preventDefault();
        return false;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.key === "U")) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Monitor scroll height to calculate exact footer overlap safe-zone
  useEffect(() => {
    const footerElement = document.querySelector("footer");
    if (!footerElement) return;

    let scrollScheduled = false;

    const handleScroll = () => {
      if (scrollScheduled) return;
      scrollScheduled = true;
      requestAnimationFrame(() => {
        const rect = footerElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.top < viewportHeight) {
          // Footer is partially or fully visible in viewport
          const visibleHeight = viewportHeight - rect.top;
          setFooterVisibleHeight(visibleHeight);
        } else {
          setFooterVisibleHeight(0);
        }
        scrollScheduled = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll(); // Trigger once on mount

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Sync theme mode to localStorage
  useEffect(() => {
    localStorage.setItem("medha-theme-mode", themeMode);
  }, [themeMode]);

  // Real-time ticking clock
  useEffect(() => {
    const clockTimer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(clockTimer);
  }, []);

  const loadSettingsData = useCallback(async () => {
    try {
      const res = await fetch("/api/public/settings");
      const contentType = res.headers.get("content-type");
      
      if (res.ok && contentType && contentType.includes("application/json")) {
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings((prev) => ({ ...prev, ...data.settings }));
        } else if (data.websiteName) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } else {
        const fallbackRes = await fetch("/api/settings");
        const fallbackContentType = fallbackRes.headers.get("content-type");
        if (fallbackRes.ok && fallbackContentType && fallbackContentType.includes("application/json")) {
          const data = await fallbackRes.json();
          setSettings((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.warn("Express API unreachable. Falling back to local/default configuration.");
    }
  }, []);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  // Slideshow interval timer
  useEffect(() => {
    if (!settings.bgSlideshowUrls || settings.bgSlideshowUrls.length <= 1) return;
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % settings.bgSlideshowUrls.length);
    }, 7500);
    return () => clearInterval(interval);
  }, [settings.bgSlideshowUrls]);

  // Dynamic Font Theme definitions
  const fontClass = () => {
    if (settings.themeStyle === "traditional") {
      return {
        heading: "font-serif tracking-normal font-bold",
        body: "font-sans leading-relaxed"
      };
    }
    if (settings.themeStyle === "academic") {
      return {
        heading: "font-mono font-extrabold tracking-tight",
        body: "font-sans leading-loose"
      };
    }
    // modern
    return {
      heading: "font-sans font-black tracking-tight",
      body: "font-sans leading-normal"
    };
  };

  const fonts = fontClass();

  // Custom styles dynamically matching custom admin database colors
  const primaryStyle = { color: settings.primaryColor };
  const borderPrimaryStyle = { borderColor: settings.primaryColor };
  const bgPrimaryStyle = { backgroundColor: settings.primaryColor };
  const bgAccentStyle = { backgroundColor: settings.accentColor };

  return (
    <div className={`min-h-screen bg-[#faf8f5] text-gray-800 ${fonts.body} relative overflow-hidden flex flex-col justify-between theme-${themeMode}`}>
      {/* 2. Style Tags for theme-safe settings */}
      <style>{`
        :root {
          --primary-brand-color: ${settings.primaryColor};
          --accent-brand-color: ${settings.accentColor};
        }
        .btn-active-tab {
          background-color: var(--accent-brand-color) !important;
          color: #111827 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          padding-left: 100%;
          animation: marquee 30s linear infinite;
        }
      `}</style>

      {/* 2. Interactive Lotus/Rangoli Mouse particle trail & Custom Trailing Cursor */}
      <ParticleTrail />
      <CustomCursor />
      <InteractiveBackdrop />

      {/* 3. Media background slideshow / video overlay behind views */}
      <div id="media-ambient-background" className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {settings.useVideoBg && settings.bgVideoUrl ? (
          <video
            src={settings.bgVideoUrl}
            autoPlay
            loop
            muted
            className="absolute inset-0 w-full h-full object-cover opacity-8"
            style={{ opacity: 0.08 }}
          />
        ) : (
          settings.bgSlideshowUrls.map((url, i) => (
            <div
              key={i}
              className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]"
              style={{
                backgroundImage: `url(${url})`,
                opacity: i === bgIndex ? 0.07 : 0,
              }}
            />
          ))
        )}
        {/* Subtle radial gradient overlay to make things eye-safe */}
        <div className="absolute inset-0 bg-radial from-transparent to-[#faf8f5]/80" />
      </div>

      {/* Scrolling Text Ticker for urgent news */}
      {settings.scrolling_ticker && (
        <div className="bg-amber-500 text-indigo-950 py-2 px-4 shadow-sm border-b border-amber-600/35 relative z-40 overflow-hidden flex items-center select-none font-sans font-bold text-xs">
          <div className="bg-indigo-950 text-amber-400 text-[10px] uppercase font-black px-2 py-0.5 rounded mr-3 shrink-0 tracking-wider">
            {settings.scrolling_ticker_label || "সরাসরি খবর / LATEST NEWS"}
          </div>
          <div className="overflow-hidden w-full relative">
            <div className="animate-marquee whitespace-nowrap hover:[animation-play-state:paused] cursor-pointer">
              {settings.scrolling_ticker}
            </div>
          </div>
        </div>
      )}

      {/* 4. MAIN LAYOUT HEADER */}
      <header className="sticky top-0 z-30 bg-white border-b border-orange-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap gap-4 items-center justify-between">
          
          {/* Logo brand */}
          <div className="flex items-center gap-3">
            {settings.officialLogo ? (
              <img 
                src={settings.officialLogo} 
                alt="Medha Anwesha Official Logo" 
                className="w-10 h-10 object-contain rounded-xl shadow-lg border border-indigo-100 bg-white"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div 
                style={bgPrimaryStyle}
                className="w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transform rotate-3"
              >
                <GraduationCap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            )}
            <div>
              <span className={`text-base font-black uppercase text-indigo-950 block ${fonts.heading}`} style={primaryStyle}>
                {settings.logoText}
              </span>
              <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest font-mono">
                Village Talent Examination
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Realtime clocks */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-orange-200 text-indigo-950 font-mono text-[10px] font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>UTC Local: {time.toLocaleTimeString()}</span>
            </div>

            {/* Premium Theme Switcher Toolbar */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-gray-200 shadow-inner">
              <button
                onClick={() => setThemeMode("normal")}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  themeMode === "normal"
                    ? "bg-amber-100 text-amber-600 shadow-xs scale-105"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Normal Blue-safe Theme"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode("dark")}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  themeMode === "dark"
                    ? "bg-zinc-800 text-amber-400 shadow-xs scale-105"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Comfort Charcoal Mode"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setThemeMode("eye-comfort")}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                  themeMode === "eye-comfort"
                    ? "bg-amber-600 text-white shadow-xs scale-105"
                    : "text-gray-400 hover:text-gray-600"
                }`}
                title="Eye Saver Sepia Mode"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Navigation selectors */}
          <nav className="flex items-center gap-0.5 sm:gap-1 bg-slate-100 p-1 rounded-xl shadow-inner border border-gray-200">
            <button
              onClick={() => setActiveView("portal")}
              className={`px-2 sm:px-3.5 py-1.5 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${
                activeView === "portal" ? "btn-active-tab font-black" : "text-gray-500 hover:text-indigo-950"
              }`}
            >
              ফলাফল পোর্টাল (Results)
            </button>
            <button
              onClick={() => setActiveView("archive")}
              className={`px-2 sm:px-3.5 py-1.5 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${
                activeView === "archive" ? "btn-active-tab font-black" : "text-gray-500 hover:text-indigo-950"
              }`}
            >
              পরীক্ষা আর্কাইভ (Archive)
            </button>
            <button
              onClick={() => setActiveView("admin")}
              className={`px-2 sm:px-3.5 py-1.5 text-[10px] sm:text-xs font-extrabold rounded-lg transition-all ${
                activeView === "admin" ? "btn-active-tab font-black" : "text-gray-500 hover:text-indigo-950"
              }`}
            >
              এডমিন অফিস (Admin)
            </button>
          </nav>

        </div>
      </header>

      {/* Dynamic prestigious Hero Banner - Dynamic Full-Bleed Edge-to-Edge Hero Banner */}
      {activeView === "portal" && (
        <section 
          id="medha-presidential-banner" 
          className="relative w-full h-auto min-h-[300px] max-h-[420px] flex items-center bg-indigo-950 overflow-hidden shadow-xl border-b-4 border-amber-500"
        >
          {/* High-res campaign image using object-fit: cover to fill beautiful containers dynamically */}
          <img 
            src={settings.heroImageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200"} 
            alt="Medha Anwesha Campaign Banner" 
            className="absolute inset-0 w-full h-full object-cover select-none filter brightness-[0.75] contrast-[1.1]"
            referrerPolicy="no-referrer"
          />

          {/* Rich semi-transparent dark indigo gradient backdrop layer for text high contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-indigo-900/90 to-black/60 mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 bg-black/45 pointer-events-none" />
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden md:block">
            <GraduationCap className="w-64 h-64 text-white" />
          </div>

          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10">
            <div className="max-w-2xl space-y-3 text-left">
              <span 
                style={bgAccentStyle}
                className="inline-block px-3 py-1 rounded-full text-indigo-950 text-[10px] uppercase font-black tracking-widest font-sans shadow-lg"
              >
                Pindrui Purba Para Medha Anwesha Committee
              </span>
              
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl text-amber-400 tracking-normal !leading-tight font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] ${fonts.heading}`}>
                {settings.heroHeading}
              </h1>
              
              <p className="text-xs sm:text-sm text-white font-black leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] max-w-xl">
                {settings.heroSubtitle}
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Event date */}
                <div className="flex items-center gap-3 bg-indigo-950 p-2.5 rounded-xl border border-indigo-800">
                  <div className="w-8.5 h-8.5 bg-amber-500 flex items-center justify-center rounded-lg flex-shrink-0">
                    <Calendar className="w-4.5 h-4.5 text-indigo-950" />
                  </div>
                  <div>
                    <p className="text-[8px] uppercase tracking-wider text-amber-300 font-extrabold font-sans">Exam Scheduled On</p>
                    <p className="text-[11px] font-black text-white">{settings.examDate}</p>
                  </div>
                </div>

                {/* Quick Syllabus */}
                <div id="quick-syllabus-card" className={`flex items-start gap-3 p-2.5 rounded-xl border-2 ${
                  themeMode !== "dark"
                    ? "bg-white border-amber-500 text-indigo-950"
                    : "bg-indigo-950 border-indigo-800 text-white"
                }`}>
                  <div className={`w-8.5 h-8.5 flex items-center justify-center rounded-lg flex-shrink-0 mt-0.5 ${
                    themeMode !== "dark"
                      ? "bg-indigo-950 text-amber-400"
                      : "bg-amber-500 text-indigo-950"
                  }`}>
                    <BookOpen className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className={`text-[8px] uppercase tracking-wider font-extrabold font-sans ${
                      themeMode !== "dark" ? "text-indigo-900" : "text-indigo-200"
                    }`}>
                      Syllabus details
                    </p>
                    <p className={`text-[10px] leading-relaxed font-black line-clamp-2 ${
                      themeMode !== "dark" ? "text-[#0F172A]" : "text-white"
                    }`}>
                       {settings.syllabusDetails}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 5. MAIN CORE CONTEXT */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-32 md:pb-24 relative z-10 flex flex-col justify-start gap-12">
        {/* Core dynamic body view */}
        <section id="portal-dynamic-stage" className="w-full relative z-10">
          <AnimatePresence mode="wait">
            {activeView === "portal" && (
              <motion.div
                key="portal"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full"
              >
                <PortalView 
                  primaryColor={settings.primaryColor} 
                  accentColor={settings.accentColor} 
                  searchHelpText={settings.searchHelpText}
                  isResultsLive={settings.is_results_live}
                  showToast={showToast}
                  settings={settings}
                  themeMode={themeMode}
                />
              </motion.div>
            )}

            {activeView === "archive" && (
              <motion.div
                key="archive"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full"
              >
                <ArchiveView />
              </motion.div>
            )}

            {activeView === "admin" && (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="w-full"
              >
                <AdminDashboard settings={settings} onRefreshSettings={loadSettingsData} showToast={showToast} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

      </main>

      {/* 6. EXPANDABLE CHATBOT WIDGET */}
      <Chatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} footerVisibleHeight={footerVisibleHeight} />

      {/* Sticky Floating AI Assistant Widget - strictly fixed to lower dynamic right corner with footer avoidance */}
      <button
        id="chatbot-toggle-btn"
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed z-50 rounded-full shadow-2xl transition-all transform active:scale-95 group neon-spinning-border font-sans text-xs font-black cursor-pointer"
        style={{ bottom: `${24 + footerVisibleHeight}px`, right: "24px" }}
        title="মেধা অন্বেষা সহকারী (Bilingual Chatbot Help)"
      >
        {isChatOpen ? (
          <div className="flex items-center gap-2 px-5 py-3 relative z-10 text-rose-400">
            <X className="w-4 h-4 text-rose-400 stroke-[2.5px]" />
            <span className="font-extrabold uppercase">বন্ধ করুন (Close)</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-5 py-3 relative z-10 text-amber-400 group-hover:text-amber-300">
            <Bot className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform duration-300 stroke-[2px]" />
            <span className="font-extrabold uppercase">AI সহায়ক / Ask AI</span>
          </div>
        )}
      </button>

      {/* 7. SECURE FOOTER */}
      <footer className="bg-indigo-950 text-white pt-10 pb-6 border-t border-indigo-900 mt-10 relative z-10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top segment with Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start pb-8 border-b border-indigo-900/60 text-left">
            {/* Column 1: Institution & Copyright */}
            <div className="space-y-3">
              <span className="font-extrabold text-amber-400 font-sans tracking-wide text-sm block">
                {settings.footerCopyright || "© 2026 Medha Anwesha Committee"}
              </span>
              <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                Organized annually across block levels to inspire rural village boys and girls to master primary and secondary school knowledge safely. Checked with strict auditing.
              </p>
              {settings.footerSocial && (
                <div className="text-[11px] text-gray-300 pt-1">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500 block">Official Social Media / Handles</span>
                  <a 
                    href={settings.footerSocial.startsWith('http') ? settings.footerSocial : `https://${settings.footerSocial}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline text-amber-400 font-bold font-sans hover:text-amber-300"
                  >
                    {settings.footerSocial}
                  </a>
                </div>
              )}
            </div>

            {/* Column 2: Helpdesk Contacts */}
            <div className="flex flex-col gap-2 items-start">
              <span className="font-bold text-gray-200 text-xs uppercase tracking-wide">যোগাযোগ ও সাহায্য (Helpdesk)</span>
              {settings.footerPhone && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5 font-mono font-semibold">
                  <Phone className="w-3.5 h-3.5 text-amber-500" /> {settings.footerPhone}
                </p>
              )}
              {settings.footerEmail && (
                <p className="text-xs text-gray-400 flex items-center gap-1.5 font-mono font-semibold">
                  <Mail className="w-3.5 h-3.5 text-amber-500" /> {settings.footerEmail}
                </p>
              )}
              <div className="mt-2 text-[11px] text-gray-400 font-sans">
                <span className="font-bold text-gray-300 block mb-0.5">Institution Agency</span>
                <p className="font-sans font-semibold text-gray-300">Pindrui Purba Para Medha Anwesha Committee</p>
                <p className="font-sans text-amber-400 font-bold mt-0.5">Medha Labs Solutions</p>
              </div>
            </div>

            {/* Column 3: Share & Scan Zone */}
            <div className="space-y-3 bg-indigo-900/30 p-4 rounded-2xl border border-indigo-900/50 flex flex-col items-center md:items-start w-full">
              <span className="text-[10px] text-amber-400 font-extrabold uppercase block tracking-wider font-sans">
                Share & Scan (শেয়ার ও স্ক্যান)
              </span>
              <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
                {/* White background card box for exceptional contrast and smartphone scan precision */}
                <div className="p-1.5 bg-white rounded-xl inline-block shadow-lg shrink-0">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${(() => {
                      try {
                        return encodeURIComponent(window.location.href);
                      } catch (e) {
                        return encodeURIComponent("https://medhaanwesha.org");
                      }
                    })()}`}
                    alt="QR Code"
                    className="w-[68px] h-[68px] block rounded"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col gap-1.5 w-full">
                  <button
                    onClick={async () => {
                      const currentUrl = (() => {
                        try {
                          return window.location.href;
                        } catch (e) {
                          return "https://medhaanwesha.org";
                        }
                      })();
                      const shareData = {
                        title: "মেধা অন্বেষা ২০২৬ (Medha Anwesha)",
                        text: "মেধা অন্বেষা ২০২৬ পোর্টালে ভিজিট করুন এবং ফলাফল ও আপডেট জানুন!",
                        url: currentUrl,
                      };
                      
                      if (navigator.share) {
                        try {
                          await navigator.share(shareData);
                        } catch (err) {
                          if (err instanceof Error && err.name !== "AbortError") {
                            setShowShareModal(true);
                          }
                        }
                      } else {
                        setShowShareModal(true);
                      }
                    }}
                    id="universal-share-btn"
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-sans text-[11px] font-bold rounded-lg transition-all duration-200 cursor-pointer text-center w-full"
                  >
                    <Share2 className="w-3 h-3 shrink-0 text-slate-950" />
                    <span>পোর্টাল শেয়ার (Share Portal)</span>
                  </button>
                  
                  {/* WhatsApp Quick Link */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${(() => {
                      try {
                        return encodeURIComponent("মেধা অন্বেষা ২০২৬ পোর্টালে আপনার ফলাফল দেখুন: " + window.location.href);
                      } catch (e) {
                        return encodeURIComponent("মেধা অন্বেষা ২০২৬ পোর্টালে আপনার ফলাফল দেখুন: https://medhaanwesha.org");
                      }
                    })()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 text-[11px] font-extrabold rounded-lg transition-all duration-200 cursor-pointer text-center w-full shadow-md"
                  >
                    <span>💬 WhatsApp-এ শেয়ার করুন</span>
                  </a>

                  <button
                    onClick={() => {
                      try {
                        navigator.clipboard.writeText(window.location.href);
                        alert("লিঙ্কটি কপি করা হয়েছে! (URL Copied to clipboard!)");
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="text-[9px] font-bold bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 py-1 px-2 rounded-md text-center cursor-pointer w-full text-amber-400 transition-colors"
                  >
                    কপি লিঙ্ক (Copy Link)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Bottom Developer & Institution Alignment Row */}
          <div className="mt-8 pt-6 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 border-t border-indigo-900/30">
            {/* Developer branding elements */}
            <div className="text-center lg:text-left space-y-2 flex flex-col lg:items-start items-center">
              <span className="text-[10px] text-amber-500 font-extrabold uppercase block tracking-wider font-sans">
                DEVELOPED BY (ডিজাইন ও ডেভেলপমেন্ট)
              </span>
              
              <div className="flex items-center gap-4">
                {settings.developerLogo && (
                  <img 
                    src={settings.developerLogo} 
                    alt="Brand Logo" 
                    referrerPolicy="no-referrer"
                    className="h-12 w-auto max-h-[48px] object-contain shrink-0 filter drop-shadow-md bg-transparent select-none"
                  />
                )}
                <div className="text-left">
                  <span className="font-extrabold block text-lg text-white tracking-tight font-sans">
                    Sudip Khatua
                  </span>
                  <p className="text-[10px] text-amber-400 font-extrabold font-sans leading-none">
                    www.xestus.in
                  </p>
                </div>
              </div>

              {/* Dual emails in side-by-side row with horizontal gap and email icon */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 mt-3 text-xs text-gray-300 font-mono">
                <a 
                  href="mailto:xestus.office@gmail.com" 
                  className="flex items-center gap-2 hover:text-amber-400 font-bold transition-colors py-1 px-3 bg-indigo-900/40 rounded-xl border border-indigo-800/30"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>xestus.office@gmail.com</span>
                </a>
                <a 
                  href="mailto:sudipkhatua808@gmail.com" 
                  className="flex items-center gap-2 hover:text-amber-400 font-bold transition-colors py-1 px-3 bg-indigo-900/40 rounded-xl border border-indigo-800/30"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-500" />
                  <span>sudipkhatua808@gmail.com</span>
                </a>
              </div>
            </div>

            {/* Institution Brand & Legal rights */}
            <div className="text-center lg:text-right space-y-1 w-full lg:w-auto border-t lg:border-t-0 border-indigo-900/40 pt-6 lg:pt-0 flex flex-col lg:items-end items-center">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-gray-500 block">
                ADMIN AGENCY & TECHNOLOGY PARTNER
              </span>
              <p className="font-black text-xs sm:text-sm text-gray-200 tracking-tight">
                Pindrui Purba Para Medha Anwesha Committee
              </p>
              <p className="text-[10px] text-gray-400 mt-2">
                © 2026 Medha Anwesha Committee. All Public Rights Reserved.
              </p>
            </div>
          </div>

        </div>
      </footer>

      {/* Universal Share Modal Fallback */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={(() => {
          try {
            return window.location.href;
          } catch(e) {
            return "https://medhaanwesha.org";
          }
        })()}
        title="মেধা অন্বেষা ২০২৬ পোর্টালে আপনার ফলাফল দেখুন!"
      />

      {/* Slide-in Animated Toast Notifications Container */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none md:max-w-md">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            id={`toast-card-${toast.id}`}
            style={{
              animation: "slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards",
              boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
            }}
            className={`pointer-events-auto p-4 rounded-2xl border flex items-start gap-3 transition-all duration-300 ${
              toast.type === "success" 
                ? "bg-indigo-950 text-indigo-50 border-indigo-800/80" 
                : toast.type === "error" 
                ? "bg-rose-950 text-rose-50 border-rose-800/80" 
                : "bg-amber-950 text-amber-50 border-amber-800/80"
            }`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
              toast.type === "success" 
                ? "bg-indigo-900 text-amber-400"
                : toast.type === "error"
                ? "bg-rose-900 text-rose-200"
                : "bg-amber-900 text-amber-200"
            }`}>
              {toast.type === "success" ? (
                <CheckCircle className="w-5 h-5 text-amber-300" />
              ) : toast.type === "error" ? (
                <X className="w-5 h-5 text-rose-300" />
              ) : (
                <HelpCircle className="w-5 h-5 text-amber-300" />
              )}
            </div>
            <div className="flex-1 min-w-0 pr-1 text-left">
              <span className="text-[10px] font-extrabold uppercase tracking-widest block opacity-75">
                {toast.type === "success" ? "সফলাফল অবগতি (Success)" : toast.type === "error" ? "ত্রুটি অবগতি (Error)" : "তথ্য অবগতি (Notice)"}
              </span>
              <p className="text-[13px] font-bold leading-normal mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

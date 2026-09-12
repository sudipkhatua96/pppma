import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Trophy, Award, Medal, Sparkles, Star, Search, Filter, Quote, School, CheckCircle2, ChevronRight } from "lucide-react";
import { DEFAULT_HALL_OF_FAME, DEFAULT_TESTIMONIALS, HallOfFameMember } from "../mockData";

export default function HallOfFameView() {
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [members, setMembers] = useState<HallOfFameMember[]>(DEFAULT_HALL_OF_FAME);

  useEffect(() => {
    const fetchToppers = async () => {
      try {
        const res = await fetch("/api/hall-of-fame");
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.toppers) && data.toppers.length > 0) {
            setMembers(data.toppers);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch remote hall of fame, using default dataset.", err);
      }
      const saved = localStorage.getItem("medha_hall_of_fame");
      if (saved) {
        try { setMembers(JSON.parse(saved)); } catch(e) {}
      }
    };
    fetchToppers();
  }, []);

  const classes = ["All", "Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"];

  const filteredMembers = members.filter(m => {
    const matchesYear = m.year === selectedYear;
    const matchesClass = selectedClass === "All" || m.classLevel === selectedClass;
    const matchesQuery = searchQuery === "" || 
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      m.school.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesClass && matchesQuery;
  });

  const getTrophyBadge = (type: "gold" | "silver" | "bronze") => {
    switch (type) {
      case "gold":
        return {
          bg: "bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-500 text-indigo-950 border-amber-300",
          icon: Trophy,
          label: "১ম স্থান (Rank 1 • Gold)",
          glow: "shadow-amber-500/30"
        };
      case "silver":
        return {
          bg: "bg-gradient-to-br from-slate-200 via-slate-100 to-slate-300 text-slate-900 border-slate-300",
          icon: Medal,
          label: "২য় স্থান (Rank 2 • Silver)",
          glow: "shadow-slate-400/30"
        };
      case "bronze":
        return {
          bg: "bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 text-white border-amber-600",
          icon: Award,
          label: "৩য় স্থান (Rank 3 • Bronze)",
          glow: "shadow-amber-800/30"
        };
    }
  };

  return (
    <div id="hall-of-fame-container" className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-950 p-6 sm:p-10 text-white shadow-2xl border border-amber-500/40 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-400 text-xs font-black uppercase tracking-widest shadow-inner">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>মেধা অন্বেষা সম্মাননা গ্যালারি</span>
        </div>
        
        <h2 className="text-2xl sm:text-4xl font-black text-amber-400 font-display">
          মেধা হল অফ ফেম (HALL OF FAME)
        </h2>
        <p className="text-xs sm:text-sm text-gray-200 max-w-2xl mx-auto leading-relaxed">
          গ্রাম বাংলার কৃতি শিক্ষার্থীদের অসাধারণ মেধা, নিষ্ঠা ও সফলতাকে সম্মান জানিয়ে আমাদের টপার্স গ্যালারি।
        </p>

        {/* Ambient background glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-32 bg-amber-500/15 blur-3xl pointer-events-none rounded-full" />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl shadow-lg border border-amber-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Year Buttons */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedYear(2025)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedYear === 2025
                  ? "bg-indigo-950 text-amber-400 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🏆 ২০২৫ সালের টপার্স
            </button>
            <button
              type="button"
              onClick={() => setSelectedYear(2026)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedYear === 2026
                  ? "bg-indigo-950 text-amber-400 shadow-md"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🌟 ২০২৬ কৃতি তালিকা
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="শিক্ষার্থী বা স্কুলের নাম খুঁজুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Class Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide pt-2">
          {classes.map((cls) => (
            <button
              key={cls}
              type="button"
              onClick={() => setSelectedClass(cls)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedClass === cls
                  ? "bg-amber-500 text-indigo-950 border-amber-500 shadow-sm font-black scale-102"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* HALL OF FAME GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => {
          const badge = getTrophyBadge(member.trophyType);
          const IconComp = badge.icon;

          return (
            <motion.div
              key={member.id}
              whileHover={{ y: -4, scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className={`relative overflow-hidden bg-white rounded-3xl shadow-xl border-2 p-6 flex flex-col justify-between space-y-4 ${
                member.trophyType === "gold" ? "border-amber-400" : member.trophyType === "silver" ? "border-slate-300" : "border-amber-600"
              }`}
            >
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-md ${badge.bg} ${badge.glow}`}>
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </span>
                <span className="text-[11px] font-mono font-bold text-slate-500">
                  {member.classLevel}
                </span>
              </div>

              {/* Student Details */}
              <div className="space-y-1">
                <h3 className="text-lg font-black text-indigo-950 font-display">
                  {member.name}
                </h3>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <School className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{member.school}</span>
                </div>
              </div>

              {/* Scorecard Badge */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">প্রাপ্ত নম্বর (Score)</span>
                  <span className="text-base font-black text-indigo-950 font-mono">
                    {member.score} / {member.maxScore}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold block">কৃতিত্ব</span>
                  <span className="text-xs font-black text-emerald-700">
                    {member.achievementBadge}
                  </span>
                </div>
              </div>

              {/* Quote */}
              {member.quoteBn && (
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200/80 text-xs text-slate-800 italic leading-relaxed flex gap-2">
                  <Quote className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>"{member.quoteBn}"</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {filteredMembers.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-2">
          <Trophy className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-base font-bold text-slate-800">কোনো রেকর্ড পাওয়া যায়নি</h4>
          <p className="text-xs text-slate-500">অনুগ্রহ করে ফিল্টার পরিবর্তন করুন অথবা অন্য ক্লাসের তালিকা দেখুন।</p>
        </div>
      )}

      {/* Inspirational Bottom Testimonial Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 rounded-3xl p-6 sm:p-8 text-indigo-950 shadow-xl border border-amber-300 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="text-xl font-black font-display">আপনিও হতে পারেন মেধা অন্বেষার পরবর্তী টপার!</h3>
          <p className="text-xs text-indigo-900 font-semibold max-w-xl">
            আজই সিলেবাস দেখে প্রস্তুতি নিন এবং অনলাইন মক টেস্টের মাধ্যমে নিজের প্রস্তুতি যাচাই করুন।
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="px-6 py-3 bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-black text-xs rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            উপরে যান (Back to Top)
          </button>
        </div>
      </div>
    </div>
  );
}

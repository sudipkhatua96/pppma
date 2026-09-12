import { useState, useEffect } from "react";
import { Download, FileText, Calendar, Filter, Search, Award, HelpCircle, ArrowRight } from "lucide-react";
import { NoticeOrArchive } from "../types";
import { DEFAULT_ARCHIVES } from "../mockData";

export default function ArchiveView() {
  const [archives, setArchives] = useState<NoticeOrArchive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "question" | "notice" | "syllabus">("all");
  const [selectedYear, setSelectedYear] = useState<string>("All");
  const [selectedClass, setSelectedClass] = useState<string>("All");

  const fetchArchives = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/archives");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setArchives(data);
          return;
        }
      }
      setArchives(DEFAULT_ARCHIVES);
    } catch (err) {
      setArchives(DEFAULT_ARCHIVES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchives();
  }, []);

  const handleDownload = async (id: string, title: string) => {
    try {
      // call server to increment download count
      const res = await fetch(`/api/archives/${id}/download`, { method: "POST" });
      if (res.ok) {
        // update local count
        setArchives(prev => 
          prev.map(a => a.id === id ? { ...a, downloadCount: (a.downloadCount || 0) + 1 } : a)
        );
      }
      
      // Simulate physical file download of a beautifully formatted textual document
      const docContent = `
========================================
MEDHA ANWESHA (মেধা অন্বেষা) EXAM ARCHIVE
========================================
Title: ${title}
Downloaded on: ${new Date().toLocaleDateString()}
Contact Support: Web Developer Email: sudipkhatua808@gmail.com
========================================

The requested syllabus detail and material has been downloaded from 
the official Medha Anwesha talent exam servers. 
Please refer to the exam schedule in your syllabus card. 
Wishing candidates all the very best of success!

All rights reserved @ Medha Anwesha Committee.
      `.trim();

      const blob = new Blob([docContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title.toLowerCase().replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredArchives = archives.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || item.type === activeCategory;
    const matchesYear = selectedYear === "All" || item.year.toString() === selectedYear;
    const matchesClass = selectedClass === "All" || item.classLevel === selectedClass || item.classLevel === "All";
    
    return matchesSearch && matchesCategory && matchesYear && matchesClass;
  });

  const categoryLabels = {
    all: "সব ধরণের (All)",
    question: "প্রশ্নপত্র (Questions)",
    notice: "বিজ্ঞপ্তি (Notices)",
    syllabus: "সিলেবাস (Syllabus)"
  };

  return (
    <div id="archives-search-view" className="w-full space-y-6 animate-fade-in">
      <div className="text-center max-w-xl mx-auto">
        <h3 className="text-lg font-extrabold text-indigo-950 font-display">সরকারি নোটিশ ও অতীত প্রশ্নপত্র আর্কাইভ</h3>
        <p className="text-xs text-gray-500 mt-1">
          Search past questions, syllabus guidelines, and official committee announcements. Highly structured to maintain equal prep guidelines.
        </p>
      </div>

      {/* Filter and search panels */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 bg-slate-50 p-1 rounded-xl w-full md:w-auto">
            {(["all", "question", "notice", "syllabus"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all capitalize whitespace-nowrap ${
                  activeCategory === cat
                    ? "bg-amber-500 text-indigo-950 shadow-sm"
                    : "text-gray-500 hover:text-indigo-900"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>

          {/* Quick Year & Class selectors */}
          <div className="flex gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 bg-gray-50 px-2 rounded-lg border border-gray-100">
              <span className="text-[10px] uppercase font-bold text-gray-400 font-sans">Year</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="text-xs py-1.5 focus:outline-none bg-transparent font-semibold text-gray-700"
              >
                <option value="All">All Years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 px-2.5 rounded-lg border border-gray-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 font-sans">Class</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="text-xs py-2 focus:outline-none bg-transparent font-semibold text-indigo-950 font-sans cursor-pointer leading-none"
              >
                <option value="All">All Classes</option>
                <option value="Class I">Class I</option>
                <option value="Class II">Class II</option>
                <option value="Class III">Class III</option>
                <option value="Class IV">Class IV</option>
                <option value="Class V">Class V</option>
                <option value="Class VI">Class VI</option>
                <option value="Class VII">Class VII</option>
                <option value="Class VIII">Class VIII</option>
                <option value="Class IX">Class IX</option>
                <option value="Class X">Class X</option>
              </select>
            </div>
          </div>

        </div>

        {/* Input Text BoxSearch */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="আর্কাইভ উপাদান খুঁজুন... Search questions or notices content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Grid listing */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-[3px] border-amber-500 border-t-indigo-950 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-xs text-gray-400">পত্রাবলী লোড হচ্ছে... Syncing Archives...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredArchives.length === 0 ? (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-dashed border-gray-200">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400 font-medium">আর্কাইভে কোনো উপাদান পাওয়া যায়নি বর্তমান ফিল্টারিং-এ।</p>
              <p className="text-[10px] text-gray-400">Try changing your year/class filters or clear the search query.</p>
            </div>
          ) : (
            filteredArchives.map((archive) => (
              <div
                key={archive.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2 justify-between">
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded border ${
                      archive.type === "question" ? "bg-indigo-50 border-indigo-200 text-indigo-800" :
                      archive.type === "notice" ? "bg-rose-50 border-rose-200 text-rose-800" : "bg-amber-50 border-amber-200 text-amber-800"
                    }`}>
                      {archive.type}
                    </span>
                    <span className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-400" /> {archive.year}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-indigo-950 hover:text-indigo-800 line-clamp-1 transition-colors">
                      {archive.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5">TARGET LEVEL: {archive.classLevel}</p>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                      {archive.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50 flex-wrap-reverse gap-2">
                  <span className="text-[9px] font-bold text-gray-400">
                    Downloaded {archive.downloadCount || 0} times
                  </span>
                  
                  <button
                    onClick={() => handleDownload(archive.id, archive.title)}
                    className="px-3.5 py-2 text-[10px] font-bold bg-amber-500 hover:bg-amber-600 active:scale-95 text-indigo-950 font-sans rounded-lg transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span>Download Materials</span>
                    <Download className="w-3.5 h-3.5 text-indigo-950" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

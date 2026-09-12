import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Search, Printer, Download, Award, CheckCircle2, QrCode, AlertCircle, Building, Calendar, Clock, MapPin, User, FileText, Check } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
import { DEFAULT_ADMIT_CARDS, DEFAULT_RESULTS, AdmitCardRecord } from "../mockData";

interface AdmitCardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdmitCardModal({ isOpen, onClose }: AdmitCardModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [admitCard, setAdmitCard] = useState<AdmitCardRecord | null>(null);
  const [searched, setSearched] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toUpperCase();
    
    // Check specific admit card records
    if (DEFAULT_ADMIT_CARDS[query]) {
      setAdmitCard(DEFAULT_ADMIT_CARDS[query]);
      setSearched(true);
      return;
    }

    // Lookup matching student from results or dynamic match
    const matched = DEFAULT_RESULTS.find(
      r => r.rollNo.toUpperCase() === query || r.name.toUpperCase().includes(query)
    );

    if (matched) {
      setAdmitCard({
        rollNo: matched.rollNo,
        name: matched.name,
        guardianName: "অভিভাবকের নাম প্রযোজ্য",
        classLevel: matched.classLevel,
        school: matched.school,
        centerName: matched.school.includes("Palaspai") ? "Palaspai High School Center" : "Mayapur High School Center",
        centerAddress: "Hooghly, West Bengal - 712413",
        roomNo: "Room No. 04 (Main Building)",
        seatNo: "Bench " + (matched.rank ? `B-${matched.rank * 3}` : "A-12"),
        examDate: "রবিবার, ২৯শে নভেম্বর, ২০২৬",
        reportingTime: "সকাল ১০:৩০ টা",
        examTime: "সকাল ১১:০০ টা - দুপুর ১:০০ টা"
      });
    } else {
      // Dynamic candidate generate
      setAdmitCard({
        rollNo: query.startsWith("MA-") ? query : `MA-2026-${Math.floor(100 + Math.random() * 900)}`,
        name: searchQuery.trim(),
        guardianName: "অভিভাবকের নাম",
        classLevel: "Class VI",
        school: "স্থানীয় উচ্চ বিদ্যালয়",
        centerName: "নির্ধারিত পরীক্ষাকেন্দ্র (Designated Center)",
        centerAddress: "Hooghly District, West Bengal",
        roomNo: "Room No. 02",
        seatNo: "Bench A-05",
        examDate: "রবিবার, ২৯শে নভেম্বর, ২০২৬",
        reportingTime: "সকাল ১০:৩০ টা",
        examTime: "সকাল ১১:০০ টা - দুপুর ১:০০ টা"
      });
    }
    setSearched(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (!admitCard) return;
    setPdfGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Border frame
      doc.setDrawColor(26, 20, 100);
      doc.setLineWidth(1.5);
      doc.rect(10, 10, 190, 277);
      doc.setDrawColor(245, 166, 35);
      doc.setLineWidth(0.6);
      doc.rect(12, 12, 186, 273);

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(26, 20, 100);
      doc.text("PINDRUI PURBA PARA MEDHA ANWESHA COMMITTEE", 105, 25, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(180, 83, 9);
      doc.text("TALENT SEARCH EXAMINATION 2026", 105, 33, { align: "center" });

      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("OFFICIAL CANDIDATE ADMIT CARD", 105, 40, { align: "center" });

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 44, 190, 44);

      // Candidate Information
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Roll Number:", 20, 54);
      doc.setFont("helvetica", "normal");
      doc.text(admitCard.rollNo, 60, 54);

      doc.setFont("helvetica", "bold");
      doc.text("Candidate Name:", 20, 62);
      doc.setFont("helvetica", "normal");
      doc.text(admitCard.name, 60, 62);

      doc.setFont("helvetica", "bold");
      doc.text("Guardian Name:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.text(admitCard.guardianName, 60, 70);

      doc.setFont("helvetica", "bold");
      doc.text("Class / Standard:", 20, 78);
      doc.setFont("helvetica", "normal");
      doc.text(admitCard.classLevel, 60, 78);

      doc.setFont("helvetica", "bold");
      doc.text("Institution / School:", 20, 86);
      doc.setFont("helvetica", "normal");
      doc.text(admitCard.school, 60, 86);

      // Exam Center Info Box
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 95, 170, 38, "F");
      doc.setDrawColor(203, 213, 225);
      doc.rect(20, 95, 170, 38, "S");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 20, 100);
      doc.text("EXAMINATION CENTER & TIMINGS", 25, 103);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.text("Exam Center: " + admitCard.centerName, 25, 110);
      doc.text("Date of Exam: " + admitCard.examDate, 25, 116);
      doc.text("Reporting Time: " + admitCard.reportingTime + "  |  Exam Duration: " + admitCard.examTime, 25, 122);
      doc.text("Allotted Room: " + admitCard.roomNo + "  |  Seat: " + admitCard.seatNo, 25, 128);

      // Instructions
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 20, 100);
      doc.text("IMPORTANT EXAM INSTRUCTIONS", 20, 145);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      const instructions = [
        "1. Candidates must arrive at the examination center at least 30 minutes before commencement.",
        "2. This Admit Card must be brought to the exam hall along with a standard blue/black ballpoint pen.",
        "3. Electronic gadgets, mobile phones, calculators, and books are strictly prohibited inside the hall.",
        "4. Do not overwrite or fold this official admit slip.",
        "5. For any clerical discrepancy, contact the committee or your school headmaster immediately."
      ];
      let yPos = 152;
      instructions.forEach(ins => {
        doc.text(ins, 20, yPos);
        yPos += 7;
      });

      // Signatures
      doc.line(30, 240, 80, 240);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("Candidate Signature", 35, 245);

      doc.line(130, 240, 180, 240);
      doc.text("Controller of Examinations", 132, 245);

      doc.save(`Medha_Anwesha_AdmitCard_${admitCard.rollNo}.pdf`);
    } catch (err) {
      console.error("PDF generation failed", err);
    } finally {
      setPdfGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" id="admit-card-modal-backdrop">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-amber-300 p-6 sm:p-8 z-10 my-8 space-y-6 max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-400 flex items-center justify-center text-amber-600">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-indigo-950 font-display">
                  ডিজিটাল এডমিট কার্ড ডাউনলোড (Admit Card Portal)
                </h3>
                <p className="text-[11px] text-slate-500 font-bold">
                  মেধা অন্বেষা ২০২৬ পরীক্ষার অফিশিয়াল প্রবেশপত্র অনুসন্ধান ও প্রিন্ট
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="রোল নম্বর (যেমন: MA-2026-601) অথবা নাম লিখুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border-2 border-slate-200 focus:border-amber-500 focus:bg-white text-xs sm:text-sm font-bold text-slate-900 outline-none transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-extrabold text-xs rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer uppercase tracking-wider shrink-0"
            >
              অনুসন্ধান
            </button>
          </form>

          {/* Quick Demo Roll helper */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="font-bold">💡 দ্রুত অনুসন্ধানের উদাহরণ:</span>
            {["MA-2026-601", "MA-2026-801", "MA-2026-701", "MA-2026-501"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setSearchQuery(r);
                  setAdmitCard(DEFAULT_ADMIT_CARDS[r] || null);
                  setSearched(true);
                }}
                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-mono font-bold rounded-lg cursor-pointer transition-all"
              >
                {r}
              </button>
            ))}
          </div>

          {/* ADMIT CARD PREVIEW AREA */}
          {searched && admitCard && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div
                ref={printAreaRef}
                id="printable-admit-card"
                className="relative bg-white p-6 sm:p-8 rounded-2xl border-4 border-double border-amber-500/80 shadow-lg space-y-6 text-slate-900"
              >
                {/* Official Crest Header */}
                <div className="text-center space-y-1 pb-4 border-b-2 border-amber-300">
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-950 block">
                    PINDRUI PURBA PARA MEDHA ANWESHA COMMITTEE
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-indigo-950 font-display">
                    মেধা অন্বেষা ২০২৬ (TALENT SEARCH EXAM)
                  </h2>
                  <div className="inline-block bg-amber-500 text-indigo-950 font-black px-4 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm">
                    অফিশিয়াল প্রবেশপত্র / ADMIT CARD
                  </div>
                </div>

                {/* Candidate & Center Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">রোল নম্বর / Roll No</span>
                        <span className="text-sm font-black text-indigo-950 font-mono">{admitCard.rollNo}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block uppercase">শ্রেণি / Class</span>
                        <span className="text-sm font-black text-amber-700">{admitCard.classLevel}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">পরীক্ষার্থীর নাম / Candidate Name</span>
                      <span className="text-sm font-black text-slate-900">{admitCard.name}</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">বিদ্যালয় / School</span>
                      <span className="font-bold text-slate-900">{admitCard.school}</span>
                    </div>
                  </div>

                  {/* Photo & QR Box */}
                  <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 rounded-2xl border-2 border-dashed border-amber-300 space-y-2">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200">
                      <QRCodeSVG
                        value={`https://sudipkhatua96.github.io/pppma/?verifiedRoll=${encodeURIComponent(admitCard.rollNo)}`}
                        size={80}
                        level="H"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 font-bold text-center">
                      স্ক্যান করে তথ্য যাচাই করুন
                    </span>
                  </div>
                </div>

                {/* Exam Hall Venue Card */}
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 p-4 rounded-2xl text-white space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                    <Building className="w-4 h-4" />
                    <span>পরীক্ষাকেন্দ্র ও সময়সূচি (Center Schedule):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-200">
                    <div>
                      <span className="text-[10px] text-gray-400 block">কেন্দ্রের নাম:</span>
                      <span className="font-bold text-white">{admitCard.centerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">ঠিকানা:</span>
                      <span className="font-bold text-white">{admitCard.centerAddress}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">তারিখ ও রিপোর্টিং সময়:</span>
                      <span className="font-bold text-amber-300">{admitCard.examDate} ({admitCard.reportingTime})</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">কক্ষ ও আসন নম্বর:</span>
                      <span className="font-bold text-emerald-400">{admitCard.roomNo} • {admitCard.seatNo}</span>
                    </div>
                  </div>
                </div>

                {/* Exam Hall Rules */}
                <div className="text-[11px] text-slate-700 bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-1.5 leading-relaxed">
                  <span className="font-black text-amber-900 uppercase block tracking-wider">পরীক্ষার্থীদের জন্য জরুরি নির্দেশাবলী:</span>
                  <p>১. পরীক্ষা শুরুর কমপক্ষে ৩০ মিনিট পূর্বে পরীক্ষাকেন্দ্রে উপস্থিত হতে হবে।</p>
                  <p>২. এই এডমিট কার্ড এবং কালো/নীল বলপেন সাথে আনা বাধ্যতামূলক।</p>
                  <p>৩. মোবাইল ফোন, ক্যালকুলেটর বা কোনো প্রকার কাগজপত্র পরীক্ষার হলে আনা সম্পূর্ণ নিষিদ্ধ।</p>
                </div>

                {/* Signatures */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-xs font-bold text-slate-700">
                  <div className="text-center space-y-1">
                    <div className="w-32 border-b border-slate-400 pb-4" />
                    <span className="text-[10px]">পরীক্ষার্থীর স্বাক্ষর</span>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="w-40 border-b border-amber-600 pb-4 text-amber-700 font-serif italic text-[11px]">
                      Sudip Khatua
                    </div>
                    <span className="text-[10px] text-amber-900 font-extrabold">পরীক্ষা নিয়ন্ত্রক / Controller</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Printer className="w-4 h-4" />
                  <span>প্রিন্ট করুন (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={pdfGenerating}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-indigo-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                >
                  <Download className="w-4 h-4" />
                  <span>{pdfGenerating ? "তৈরি হচ্ছে..." : "PDF ডাউনলোড করুন"}</span>
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

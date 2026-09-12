import { useState, useRef } from "react";
import { motion } from "motion/react";
import { UserCheck, FileText, CheckCircle2, Download, Printer, Phone, School, MapPin, Calendar, Sparkles, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";

export default function RegistrationView() {
  const [candidateName, setCandidateName] = useState("");
  const [guardianName, setGuardianName] = useState("");
  const [classLevel, setClassLevel] = useState("Class VI");
  const [schoolName, setSchoolName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("ছাত্র (Boy)");
  const [address, setAddress] = useState("");
  
  const [submitted, setSubmitted] = useState(false);
  const [appId, setAppId] = useState("");
  const [submittedDate, setSubmittedDate] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);

  const printAreaRef = useRef<HTMLDivElement>(null);

  const classes = ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateName.trim() || !guardianName.trim() || !schoolName.trim() || !phone.trim()) {
      alert("অনুগ্রহ করে সব প্রয়োজনীয় তথ্য সঠিকভাবে পূরণ করুন।");
      return;
    }

    const generatedId = `MEDHA-2026-REG-${Math.floor(1000 + Math.random() * 9000)}`;
    setAppId(generatedId);
    setSubmittedDate(new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' }));
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleReset = () => {
    setCandidateName("");
    setGuardianName("");
    setSchoolName("");
    setPhone("");
    setDob("");
    setAddress("");
    setSubmitted(false);
  };

  const handleDownloadPdf = () => {
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
      doc.setFontSize(15);
      doc.setTextColor(26, 20, 100);
      doc.text("PINDRUI PURBA PARA MEDHA ANWESHA COMMITTEE", 105, 25, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(180, 83, 9);
      doc.text("TALENT SEARCH EXAMINATION 2026", 105, 33, { align: "center" });

      doc.setFontSize(10.5);
      doc.setTextColor(15, 23, 42);
      doc.text("ONLINE REGISTRATION ACKNOWLEDGMENT SLIP", 105, 40, { align: "center" });

      doc.setDrawColor(200, 200, 200);
      doc.line(20, 44, 190, 44);

      // App Details
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Application ID:", 20, 54);
      doc.setFont("helvetica", "normal");
      doc.text(appId, 65, 54);

      doc.setFont("helvetica", "bold");
      doc.text("Candidate Name:", 20, 62);
      doc.setFont("helvetica", "normal");
      doc.text(candidateName, 65, 62);

      doc.setFont("helvetica", "bold");
      doc.text("Guardian Name:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.text(guardianName, 65, 70);

      doc.setFont("helvetica", "bold");
      doc.text("Class / Standard:", 20, 78);
      doc.setFont("helvetica", "normal");
      doc.text(classLevel, 65, 78);

      doc.setFont("helvetica", "bold");
      doc.text("School / Institution:", 20, 86);
      doc.setFont("helvetica", "normal");
      doc.text(schoolName, 65, 86);

      doc.setFont("helvetica", "bold");
      doc.text("Contact Number:", 20, 94);
      doc.setFont("helvetica", "normal");
      doc.text(phone, 65, 94);

      if (dob) {
        doc.setFont("helvetica", "bold");
        doc.text("Date of Birth:", 20, 102);
        doc.setFont("helvetica", "normal");
        doc.text(dob, 65, 102);
      }

      if (address) {
        doc.setFont("helvetica", "bold");
        doc.text("Address:", 20, 110);
        doc.setFont("helvetica", "normal");
        doc.text(address, 65, 110);
      }

      // Submission Notice Box
      doc.setFillColor(254, 243, 199);
      doc.rect(20, 125, 170, 32, "F");
      doc.setDrawColor(245, 158, 11);
      doc.rect(20, 125, 170, 32, "S");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(146, 64, 14);
      doc.text("IMPORTANT SUBMISSION INSTRUCTIONS", 25, 133);

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(69, 26, 3);
      doc.text("1. Print this acknowledgment slip and submit it to your School Headmaster.", 25, 140);
      doc.text("2. Pay the official registration fee of Rs. 50 to your school coordinator.", 25, 146);
      doc.text("3. Official Admit Card will be released online prior to the examination.", 25, 152);

      // Signatures
      doc.line(30, 230, 80, 230);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Guardian's Signature", 35, 235);

      doc.line(130, 230, 180, 230);
      doc.text("Headmaster / Coordinator Seal", 132, 235);

      doc.save(`Medha_Anwesha_Application_${appId}.pdf`);
    } catch (err) {
      console.error(err);
    } finally {
      setPdfGenerating(false);
    }
  };

  return (
    <div id="registration-view-container" className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-slate-950 to-indigo-900 p-6 sm:p-8 text-white shadow-xl border border-indigo-800/80">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>অনলাইন আবেদন ও নিবন্ধন পোর্টাল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              মেধা অন্বেষা ২০২৬ প্রাক-নিবন্ধন স্লিপ
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
              অনলাইনে প্রাথমিক তথ্য পূরণ করে অফিসিয়াল অ্যাপ্লিকেশন স্লিপ তৈরি করুন এবং আপনার বিদ্যালয় প্রধানের কাছে জমা দিন।
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center shrink-0 space-y-1">
            <span className="text-[10px] text-gray-300 font-bold block uppercase tracking-wider">পরীক্ষার প্রবেশমূল্য</span>
            <span className="text-2xl font-black text-amber-400 font-mono">৫০/- টাকা</span>
            <span className="text-[10px] text-emerald-400 block font-bold">শেষ তারিখ: ১৫ই অক্টোবর, ২০২৬</span>
          </div>
        </div>
      </div>

      {!submitted ? (
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-amber-200/80 p-6 sm:p-8 space-y-6"
        >
          <div className="pb-3 border-b border-slate-200">
            <h3 className="text-base font-black text-indigo-950 font-display">
              পরীক্ষার্থীর প্রয়োজনীয় বিবরণ (Candidate Registration Details)
            </h3>
            <p className="text-xs text-slate-500 font-semibold">সবগুলো ফিল্ড বাংলায় বা ইংরেজিতে পূরণ করতে পারেন।</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candidate Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                পরীক্ষার্থীর নাম (Student Full Name) *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: Rahul Khatua"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Guardian Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                পিতা/মাতা/অভিভাবকের নাম (Guardian Name) *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: Santanu Khatua"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Class Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                শ্রেণি (Class Level) *
              </label>
              <select
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
              >
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* School Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                বিদ্যালয়ের নাম (School Name) *
              </label>
              <input
                type="text"
                required
                placeholder="যেমন: Mayapur High School"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                যোগাযোগের মোবাইল নম্বর (Mobile Number) *
              </label>
              <input
                type="tel"
                required
                placeholder="১০ সংখ্যার মোবাইল নম্বর"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
              />
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                লিঙ্গ (Gender)
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
              >
                <option value="ছাত্র (Boy)">ছাত্র (Boy)</option>
                <option value="ছাত্রী (Girl)">ছাত্রী (Girl)</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
              সম্পূর্ণ ঠিকানা (Village, P.O., P.S., District)
            </label>
            <textarea
              rows={2}
              placeholder="গ্রাম, ডাকঘর, থানা ও জেলা..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-900 outline-none focus:border-amber-500 focus:bg-white transition-all"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-indigo-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer uppercase tracking-wider"
            >
              <span>রেজিস্ট্রেশন স্লিপ তৈরি করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.form>
      ) : (
        /* SUBMITTED ACKNOWLEDGMENT SLIP VIEW */
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div
            ref={printAreaRef}
            className="bg-white rounded-3xl p-6 sm:p-8 border-4 border-double border-amber-500 shadow-2xl space-y-6 text-slate-900"
          >
            {/* Crest Header */}
            <div className="text-center space-y-1 pb-4 border-b-2 border-amber-300">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-950 block">
                PINDRUI PURBA PARA MEDHA ANWESHA COMMITTEE
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-indigo-950 font-display">
                মেধা অন্বেষা ২০২৬ (TALENT SEARCH EXAM)
              </h2>
              <div className="inline-block bg-indigo-950 text-amber-400 font-black px-4 py-1 rounded-full text-xs uppercase tracking-wider shadow-sm">
                অনলাইন আবেদন স্লিপ / REGISTRATION SLIP
              </div>
            </div>

            {/* Application ID Badge */}
            <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-[10px] text-amber-900 font-bold block uppercase">অ্যাপ্লিকেশন ট্র্যাকিং আইডি</span>
                <span className="text-lg font-black text-indigo-950 font-mono">{appId}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-amber-900 font-bold block uppercase">আবেদনের তারিখ</span>
                <span className="text-xs font-bold text-slate-800">{submittedDate}</span>
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2.5 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">পরীক্ষার্থীর নাম:</span>
                  <span className="font-black text-slate-900 text-sm">{candidateName}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">অভিভাবকের নাম:</span>
                  <span className="font-bold text-slate-900">{guardianName}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">শ্রেণি:</span>
                    <span className="font-black text-amber-700">{classLevel}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">মোবাইল:</span>
                    <span className="font-bold text-slate-900 font-mono">{phone}</span>
                  </div>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold block">বিদ্যালয়:</span>
                  <span className="font-bold text-slate-900">{schoolName}</span>
                </div>
              </div>

              {/* QR Verification */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <QRCodeSVG
                  value={`MEDHA-ANWESHA-2026:${appId}:${candidateName}:${classLevel}`}
                  size={90}
                />
                <span className="text-[9px] font-mono text-slate-500 text-center">
                  ভেরিফিকেশন কিউআর কোড
                </span>
              </div>
            </div>

            {/* Submission Checklist */}
            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 text-xs text-slate-800 space-y-1.5 leading-relaxed">
              <span className="font-black text-amber-900 uppercase block tracking-wider">জমা দেওয়ার নির্দেশিকা:</span>
              <p>১. এই স্লিপটি প্রিন্ট করুন এবং স্বাক্ষর করে আপনার বিদ্যালয়ের প্রধান শিক্ষক মহাশয়ের নিকট জমা দিন।</p>
              <p>২. নির্ধারিত প্রবেশমূল্য ৫০/- টাকা বিদ্যালয়ে জমা দিয়ে রসিদ সংগ্রহ করুন।</p>
              <p>৩. পরীক্ষার পূর্বে অফিসিয়াল এডমিট কার্ড এই পোর্টাল থেকে ডাউনলোড করতে পারবেন।</p>
            </div>

            {/* Signatures */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 text-xs font-bold text-slate-700">
              <div className="text-center space-y-1">
                <div className="w-32 border-b border-slate-400 pb-4" />
                <span className="text-[10px]">অভিভাবকের স্বাক্ষর</span>
              </div>
              <div className="text-center space-y-1">
                <div className="w-40 border-b border-slate-400 pb-4" />
                <span className="text-[10px]">বিদ্যালয়ের প্রধান শিক্ষকের সীল ও স্বাক্ষর</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>নতুন আবেদন করুন</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                onClick={handleDownloadPdf}
                disabled={pdfGenerating}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-indigo-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <Download className="w-4 h-4" />
                <span>{pdfGenerating ? "তৈরি হচ্ছে..." : "PDF স্লিপ ডাউনলোড"}</span>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Award, CheckCircle2, XCircle, Clock, RotateCcw, ChevronRight, ChevronLeft, BookOpen, Sparkles, HelpCircle, FileText, Check, Trophy, Play } from "lucide-react";
import { DEFAULT_MOCK_QUESTIONS, MockQuestion } from "../mockData";

export default function MockTestView() {
  const [selectedClass, setSelectedClass] = useState<string>("Class V");
  const [testState, setTestState] = useState<"intro" | "active" | "completed">("intro");
  
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [timeSpent, setTimeSpent] = useState<number>(0);

  const classes = ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"];

  // Filter or randomize questions for selected class
  const startTest = () => {
    // Get questions matching selected class, or fallback to general questions
    let classQuestions = DEFAULT_MOCK_QUESTIONS.filter(q => q.classLevel === selectedClass);
    if (classQuestions.length < 5) {
      classQuestions = [...classQuestions, ...DEFAULT_MOCK_QUESTIONS.filter(q => q.classLevel !== selectedClass)];
    }
    // Shuffle questions
    const shuffled = [...classQuestions].sort(() => 0.5 - Math.random()).slice(0, 10);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setUserAnswers({});
    setTimeLeft(600);
    setTimeSpent(0);
    setTestState("active");
  };

  // Timer effect
  useEffect(() => {
    if (testState !== "active") return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [testState]);

  const selectAnswer = (optionIdx: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const finishTest = () => {
    setTestState("completed");
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const totalScore = calculateScore();
  const percentage = questions.length > 0 ? Math.round((totalScore / questions.length) * 100) : 0;

  return (
    <div id="mock-test-container" className="w-full max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl border border-indigo-800/80">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-400 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>মেধা অন্বেষা অনলাইন মক টেস্ট পোর্টাল</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
              ইন্টারেক্টিভ প্র্যাকটিস কুইজ সিমুলেটর
            </h2>
            <p className="text-xs sm:text-sm text-gray-200 max-w-xl leading-relaxed">
              মেধা অন্বেষা ২০২৬ পরীক্ষার জন্য প্রস্তুত হন! বিষয়ভিত্তিক এমসিকিউ সমাধান করুন এবং তাৎক্ষণিক ফলাফল ও ব্যাখ্যা জানুন।
            </p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/15 shrink-0">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <span className="block text-[11px] text-gray-300 font-bold uppercase tracking-wider">পূর্ণমান / সময়</span>
              <span className="text-base font-black text-white font-mono">১০ প্রশ্ন • ১০ মিনিট</span>
            </div>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* STATE 1: INTRO & CLASS SELECTOR */}
      {testState === "intro" && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-amber-200/80 p-6 sm:p-8 space-y-6"
        >
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-gray-700 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>আপনার শ্রেণি (Class) নির্বাচন করুন:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {classes.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedClass(c)}
                  className={`py-3 px-3 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer flex flex-col items-center gap-1 border ${
                    selectedClass === c
                      ? "bg-indigo-950 text-amber-400 border-amber-400 shadow-md scale-102"
                      : "bg-slate-50 hover:bg-amber-50/60 text-slate-800 border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <span className="text-xs font-extrabold">{c}</span>
                  <span className="text-[10px] opacity-75">{c === "Class I" || c === "Class II" || c === "Class III" || c === "Class IV" ? "প্রাথমিক বিভাগ" : "মাধ্যমিক বিভাগ"}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Test Guidelines */}
          <div className="bg-indigo-50/70 rounded-2xl p-5 border border-indigo-150 space-y-3">
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-700" />
              <span>মক টেস্টের নিয়মাবলী (Guidelines):</span>
            </h4>
            <ul className="text-xs text-slate-700 space-y-2 leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>মোট <strong>১০টি বহুনির্বাচনী প্রশ্ন (MCQ)</strong> থাকবে (বাংলা, গণিত, বিজ্ঞান ও সাধারণ জ্ঞান)।</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>পরীক্ষার সময়সীমা <strong>১০ মিনিট (৬০০ সেকেন্ড)</strong>। সময় শেষ হলে স্বয়ংক্রিয়ভাবে জমা হয়ে যাবে।</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>প্রতিটি সঠিক উত্তরের জন্য ১ নম্বর যোগ হবে। ভুল উত্তরের জন্য কোনো নেগেটিভ মার্ক নেই।</span>
              </li>
            </ul>
          </div>

          <div className="flex justify-center pt-2">
            <button
              onClick={startTest}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-indigo-950 font-black text-sm rounded-2xl shadow-lg hover:shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2.5 cursor-pointer uppercase tracking-wider"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>মক টেস্ট শুরু করুন ({selectedClass})</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* STATE 2: ACTIVE EXAM SIMULATOR */}
      {testState === "active" && questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          {/* Header Progress and Timer */}
          <div className="bg-white rounded-2xl shadow-md p-4 sm:p-5 border border-amber-200/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-indigo-950 text-amber-400 font-extrabold text-xs rounded-xl">
                প্রশ্ন {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-xs font-bold text-slate-600">
                বিষয়: <span className="text-indigo-900 font-extrabold">{questions[currentIdx]?.subject}</span>
              </span>
            </div>

            {/* Countdown Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-black border ${
              timeLeft < 60 
                ? "bg-rose-50 border-rose-300 text-rose-600 animate-pulse"
                : "bg-amber-50 border-amber-300 text-amber-900"
            }`}>
              <Clock className="w-4 h-4" />
              <span>অবশিষ্ট সময়: {formatTime(timeLeft)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full transition-all duration-300 rounded-full"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl shadow-xl border-2 border-amber-200 p-6 sm:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-700 block">
                QUESTION #{currentIdx + 1} ({selectedClass})
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                {questions[currentIdx]?.questionBn}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-3">
              {questions[currentIdx]?.options.map((opt, oIdx) => {
                const isSelected = userAnswers[currentIdx] === oIdx;
                const optLabels = ["ক", "খ", "গ", "ঘ"];
                return (
                  <button
                    key={oIdx}
                    type="button"
                    onClick={() => selectAnswer(oIdx)}
                    className={`w-full p-4 rounded-2xl font-bold text-sm text-left transition-all duration-200 cursor-pointer flex items-center gap-3.5 border ${
                      isSelected
                        ? "bg-indigo-950 text-white border-amber-400 shadow-md scale-[1.01]"
                        : "bg-slate-50 hover:bg-amber-50/70 text-slate-900 border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                      isSelected
                        ? "bg-amber-500 text-indigo-950"
                        : "bg-white border border-slate-300 text-slate-700"
                    }`}>
                      {optLabels[oIdx]}
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-150">
              <button
                type="button"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>পূর্ববর্তী (Previous)</span>
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIdx(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-5 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-amber-400 text-xs font-extrabold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>পরবর্তী (Next)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={finishTest}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <Check className="w-4 h-4" />
                  <span>পরীক্ষা জমা দিন (Finish Test)</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* STATE 3: COMPLETED SCORECARD & EXPLANATION */}
      {testState === "completed" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          {/* Scorecard Hero Card */}
          <div className="bg-gradient-to-b from-indigo-950 to-slate-950 rounded-3xl p-8 text-center text-white border-2 border-amber-400/80 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 mx-auto flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/20">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">মক টেস্ট ফলাফল রিপোর্ট</span>
              <h3 className="text-3xl font-black font-display text-white">
                {percentage >= 80 ? "অসাধারণ ফলাফল! (Outstanding)" : percentage >= 50 ? "ভালো হয়েছে! (Well Done)" : "আরো অনুশীলনের প্রয়োজন (Keep Practicing)"}
              </h3>
              <p className="text-xs text-gray-300">{selectedClass} • মেধা অন্বেষা ২০২৬ প্রস্তুতি</p>
            </div>

            {/* Score Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-300 uppercase block font-bold">প্রাপ্ত নম্বর</span>
                <span className="text-2xl font-black text-amber-400 font-mono">{totalScore} / {questions.length}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-300 uppercase block font-bold">শতাংশ</span>
                <span className="text-2xl font-black text-emerald-400 font-mono">{percentage}%</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <span className="text-[10px] text-gray-300 uppercase block font-bold">ব্যয়িত সময়</span>
                <span className="text-2xl font-black text-sky-400 font-mono">{formatTime(timeSpent)}</span>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={startTest}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-indigo-950 font-extrabold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>পুনরায় টেস্ট দিন (Retake Test)</span>
              </button>
              <button
                onClick={() => setTestState("intro")}
                className="px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl transition-all border border-white/20 cursor-pointer"
              >
                <span>অন্য ক্লাস নির্বাচন করুন</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Explanations */}
          <div className="bg-white rounded-3xl shadow-lg border border-amber-200/80 p-6 sm:p-8 space-y-6">
            <h4 className="text-base font-black text-slate-950 font-display flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-600" />
              <span>প্রশ্ন পর্যালোচনা ও সঠিক উত্তরের ব্যাখ্যা (Detailed Solutions):</span>
            </h4>

            <div className="space-y-4">
              {questions.map((q, idx) => {
                const userAns = userAnswers[idx];
                const isCorrect = userAns === q.correctIndex;
                const isSkipped = userAns === undefined;

                return (
                  <div
                    key={q.id}
                    className={`p-5 rounded-2xl border-2 transition-all space-y-3 ${
                      isCorrect
                        ? "bg-emerald-50/50 border-emerald-300"
                        : "bg-rose-50/50 border-rose-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-black text-slate-900 leading-snug">
                        {idx + 1}. {q.questionBn}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black shrink-0 ${
                        isCorrect
                          ? "bg-emerald-600 text-white"
                          : "bg-rose-600 text-white"
                      }`}>
                        {isCorrect ? "✓ সঠিক" : isSkipped ? "উপেক্ষিত" : "✗ ভুল"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">আপনার উত্তর:</span>
                        <span className={`font-bold ${isCorrect ? "text-emerald-700" : "text-rose-700"}`}>
                          {userAns !== undefined ? q.options[userAns] : "কোনো উত্তর দেওয়া হয়নি"}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200">
                        <span className="text-[10px] text-slate-500 font-bold block">সঠিক উত্তর:</span>
                        <span className="font-bold text-emerald-700">
                          {q.options[q.correctIndex]}
                        </span>
                      </div>
                    </div>

                    {q.explanationBn && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-slate-800 leading-relaxed">
                        <span className="font-black text-amber-900 block mb-0.5">💡 ব্যাখ্যা:</span>
                        {q.explanationBn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { StudentResult, NoticeOrArchive, PortalSettings } from "./types";

export interface Testimonial {
  id: string;
  name: string;
  classLevel: string;
  score: string;
  rank: string;
  school: string;
  quoteBn: string;
  quoteEn: string;
  avatarSeed: string;
}

export const DEFAULT_RESULTS: StudentResult[] = [
  // Class I
  { id: "i-1", rollNo: "MA-2026-101", name: "Anish Roy", school: "Mayapur Primary School", classLevel: "Class I", marks: 48, rank: 1, status: "Passed", phone: "9876543201" },
  { id: "i-2", rollNo: "MA-2026-102", name: "Aditi Sheet", school: "Palaspai Primary School", classLevel: "Class I", marks: 45, rank: 2, status: "Passed", phone: "" },
  // Class II
  { id: "ii-1", rollNo: "MA-2026-201", name: "Shamik Das", school: "Radhanagar Primary School", classLevel: "Class II", marks: 47, rank: 1, status: "Passed", phone: "9876543202" },
  { id: "ii-2", rollNo: "MA-2026-202", name: "Sonia Mandal", school: "Khanakul Primary School", classLevel: "Class II", marks: 44, rank: 2, status: "Passed", phone: "" },
  // Class III
  { id: "iii-1", rollNo: "MA-2026-301", name: "Subhasree Patra", school: "Mayapur Primary School", classLevel: "Class III", marks: 47, rank: 1, status: "Passed", phone: "9876543203" },
  { id: "iii-2", rollNo: "MA-2026-302", name: "Debasis Jana", school: "Palaspai Primary School", classLevel: "Class III", marks: 44, rank: 2, status: "Passed", phone: "" },
  // Class IV
  { id: "iv-1", rollNo: "MA-2026-401", name: "Arpan Samanta", school: "Arambagh Primary School", classLevel: "Class IV", marks: 48, rank: 1, status: "Passed", phone: "9876543204" },
  { id: "iv-2", rollNo: "MA-2026-402", name: "Ananya Ghosh", school: "Radhanagar Primary School", classLevel: "Class IV", marks: 45, rank: 2, status: "Passed", phone: "" },
  // Class V
  { id: "v-1", rollNo: "MA-2026-501", name: "Sourav Das", school: "Palaspai High School", classLevel: "Class V", marks: 46, rank: 1, status: "Passed", phone: "9876543210" },
  { id: "v-2", rollNo: "MA-2026-502", name: "Priyanka Sen", school: "Khanakul Krishnanagar High School", classLevel: "Class V", marks: 45, rank: 2, status: "Passed", phone: "9876543211" },
  { id: "v-3", rollNo: "MA-2026-503", name: "Aniket Mandal", school: "Radhanagar High School", classLevel: "Class V", marks: 44, rank: 3, status: "Passed", phone: "9876543212" },
  { id: "v-4", rollNo: "MA-2026-504", name: "Shreya Samanta", school: "Palaspai High School", classLevel: "Class V", marks: 37, rank: 4, status: "Passed", phone: "" },
  { id: "v-5", rollNo: "MA-2026-505", name: "Rishav Dutta", school: "Mayapur High School", classLevel: "Class V", marks: 34, rank: 5, status: "Passed", phone: "" },
  // Class VI
  { id: "vi-1", rollNo: "MA-2026-601", name: "Rahul Khatua", school: "Mayapur High School", classLevel: "Class VI", marks: 48, rank: 1, status: "Passed", phone: "9876543214" },
  { id: "vi-2", rollNo: "MA-2026-602", name: "Moumita Ghosh", school: "Arambagh Girls High School", classLevel: "Class VI", marks: 46, rank: 2, status: "Passed", phone: "9876543215" },
  { id: "vi-3", rollNo: "MA-2026-603", name: "Debabrata Patra", school: "Mayapur High School", classLevel: "Class VI", marks: 45, rank: 3, status: "Passed", phone: "9876543216" },
  { id: "vi-4", rollNo: "MA-2026-604", name: "Suman Banerjee", school: "Radhanagar High School", classLevel: "Class VI", marks: 21, rank: 4, status: "Passed", phone: "" },
  // Class VII
  { id: "vii-1", rollNo: "MA-2026-701", name: "Subhadip Dutta", school: "Harinkhola High School", classLevel: "Class VII", marks: 48, rank: 1, status: "Passed", phone: "9876543218" },
  { id: "vii-2", rollNo: "MA-2026-702", name: "Tanaya Adhikari", school: "Arambagh Girls High School", classLevel: "Class VII", marks: 47, rank: 2, status: "Passed", phone: "9876543219" },
  { id: "vii-3", rollNo: "MA-2026-703", name: "Srijan Roy", school: "Radhanagar High School", classLevel: "Class VII", marks: 46, rank: 3, status: "Passed", phone: "" },
  { id: "vii-4", rollNo: "MA-2026-704", name: "Dipali Adhikary", school: "Palaspai High School", classLevel: "Class VII", marks: 41, rank: 4, status: "Passed", phone: "" },
  // Class VIII
  { id: "viii-1", rollNo: "MA-2026-801", name: "Arpita Maiti", school: "Palaspai High School", classLevel: "Class VIII", marks: 49, rank: 1, status: "Passed", phone: "9876543221" },
  { id: "viii-2", rollNo: "MA-2026-802", name: "Souvik Hazra", school: "Khanakul Krishnanagar High School", classLevel: "Class VIII", marks: 48, rank: 2, status: "Passed", phone: "9876543222" },
  { id: "viii-3", rollNo: "MA-2026-803", name: "Sneha Pal", school: "Arambagh Girls High School", classLevel: "Class VIII", marks: 47, rank: 3, status: "Passed", phone: "9876543223" },
  { id: "viii-4", rollNo: "MA-2026-804", name: "Rana Mondal", school: "Mayapur High School", classLevel: "Class VIII", marks: 8, rank: 4, status: "Failed", phone: "" },
  { id: "viii-5", rollNo: "MA-2026-805", name: "Sayan Samanta", school: "Harinkhola High School", classLevel: "Class VIII", marks: 0, rank: 5, status: "Absent", phone: "" },
  // Class IX
  { id: "ix-1", rollNo: "MA-2026-901", name: "Prasenjit Sheet", school: "Khanakul High School", classLevel: "Class IX", marks: 47, rank: 1, status: "Passed", phone: "9876543209" },
  { id: "ix-2", rollNo: "MA-2026-902", name: "Tania Banerjee", school: "Arambagh High School", classLevel: "Class IX", marks: 44, rank: 2, status: "Passed", phone: "" },
  // Class X
  { id: "x-1", rollNo: "MA-2026-1001", name: "Kushal Sen", school: "Mayapur High School", classLevel: "Class X", marks: 49, rank: 1, status: "Passed", phone: "9876543217" },
  { id: "x-2", rollNo: "MA-2026-1002", name: "Sudipa Midya", school: "Harinkhola High School", classLevel: "Class X", marks: 46, rank: 2, status: "Passed", phone: "" }
];

export const DEFAULT_ARCHIVES: NoticeOrArchive[] = [
  { id: "arch-c1", title: "Medha Anwesha 2025 - Class I Mathematics Syllabus", type: "syllabus", year: 2025, classLevel: "Class I", content: "Primary stage guidelines: General arithmetic, basic shape matching, patterns, numbers 1-100 addition and counting tests.", downloadCount: 94 },
  { id: "arch-c2", title: "Medha Anwesha 2025 - Class II Science & Env syllabus", type: "syllabus", year: 2025, classLevel: "Class II", content: "Introductory environmental concepts, local weather and flora, community awareness, and health guidelines for primary grade candidates.", downloadCount: 82 },
  { id: "arch-c3", title: "Medha Anwesha 2025 - Class III Bengali Question Paper", type: "question", year: 2025, classLevel: "Class III", content: "Previous year Bengali language question paper comprising simple grammar, prose comprehension, and vocabulary spelling tests.", downloadCount: 115 },
  { id: "arch-c4", title: "Medha Anwesha 2025 - Class IV Mental Logic Question Paper", type: "question", year: 2025, classLevel: "Class IV", content: "Class IV standard logical reasoning assessment, sequence completion, diagram pattern matching, and analytical puzzles.", downloadCount: 120 },
  { id: "arch-1", title: "Medha Anwesha 2025 - Class V Question Paper", type: "question", year: 2025, classLevel: "Class V", content: "Syllabus, Grammar, and general questions. 80 marks written exam, 20 marks oral exam. Click download for pdf archive.", downloadCount: 145 },
  { id: "arch-c6", title: "Medha Anwesha 2025 - Class VI Science Question Paper", type: "question", year: 2025, classLevel: "Class VI", content: "Introductory Physics and Biology concepts: Plants parts, animal classification, simple forces, states of matter from past exams.", downloadCount: 139 },
  { id: "arch-c7", title: "Medha Anwesha 2025 - Class VII English Syllabus Guide", type: "syllabus", year: 2025, classLevel: "Class VII", content: "Guidelines for English reading comprehension, basic prose, poetry, articles/prepositions, tense structures, and synonyms/antonyms.", downloadCount: 164 },
  { id: "arch-2", title: "Medha Anwesha 2025 - Class VIII Question Paper", type: "question", year: 2025, classLevel: "Class VIII", content: "Advanced Science, Mathematics, Bengali Literature sample papers from prior year examination papers.", downloadCount: 182 },
  { id: "arch-c9", title: "Medha Anwesha 2025 - Class IX General Knowledge Question", type: "question", year: 2025, classLevel: "Class IX", content: "Curriculum testing over Indian Constitution history, famous scientists, Nobel Prize winners, geography, and local heritage facts.", downloadCount: 156 },
  { id: "arch-c10", title: "Medha Anwesha 2025 - Class X Life Science & Mathematics", type: "question", year: 2025, classLevel: "Class X", content: "Secondary school level testing over algebra formulas, quadratic equations, cell respiration, genetics, and environment systems.", downloadCount: 204 },
  { id: "arch-3", title: "Medha Anwesha 2026 - Registration Notice & Guidelines", type: "notice", year: 2026, classLevel: "All", content: "Registration for Medha Anwesha Talent Search Exam is now open! Last date to apply is October 15, 2026. Submit documents and Rs. 50 entry fee to your school headmaster.", downloadCount: 310 },
  { id: "arch-4", title: "Official Exam Syllabus Class I - X (Bilingual)", type: "syllabus", year: 2026, classLevel: "All", content: "Syllabus and Breakdown of the 100-mark assessment. Formats cover MCQs, short questions, and basic puzzles.", downloadCount: 220 }
];

export const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "test-1",
    name: "Arpita Maiti",
    classLevel: "Class VIII",
    score: "49/50",
    rank: "Rank 1",
    school: "Palaspai High School",
    quoteBn: "মেধা অন্বেষা পরীক্ষা আমার আত্মবিশ্বাস বাড়িয়ে দিয়েছে। প্রত্যন্ত গ্রামের ছাত্রছাত্রীদের জন্য এটি একটি অসাধারণ সুযোগ।",
    quoteEn: "Medha Anwesha boosted my confidence immensely. It is a fantastic platform for village students to showcase academic excellence.",
    avatarSeed: "arpita"
  },
  {
    id: "test-2",
    name: "Rahul Khatua",
    classLevel: "Class VI",
    score: "48/50",
    rank: "Rank 1",
    school: "Mayapur High School",
    quoteBn: "সিলেবাস অনুযায়ী নিয়মিত অনুশীলন করলে এই পরীক্ষায় খুব ভালো ফলাফল করা সম্ভব। কমিটির শিক্ষকদের ধন্যবাদ।",
    quoteEn: "With consistent preparation using the official syllabus, achieving top ranks is possible. Sincere thanks to the committee.",
    avatarSeed: "rahul"
  },
  {
    id: "test-3",
    name: "Subhadip Dutta",
    classLevel: "Class VII",
    score: "48/50",
    rank: "Rank 1",
    school: "Harinkhola High School",
    quoteBn: "ডিজিটাল সার্টিফিকেট এবং তাৎক্ষণিক ফলাফল দেখার সুবিধা খুব চমৎকার হয়েছে।",
    quoteEn: "The digital certificate download and instant result search make the portal extremely helpful for candidates and parents.",
    avatarSeed: "subhadip"
  }
];

export const OFFLINE_AI_RESPONSES: Record<string, string> = {
  exam_date: "📅 **মেধা অন্বেষা ২০২৬ পরীক্ষার সময়সূচি (Exam Schedule):**\n- **তারিখ:** রবিবার, ২৯শে নভেম্বর, ২০২৬ (Sunday, November 29, 2026)\n- **সময়:** সকাল ১১:০০ টা থেকে দুপুর ১:০০ টা (২ ঘণ্টা)\n- **পরীক্ষাকেন্দ্র:** সংশ্লিষ্ট নির্ধারিত বিদ্যালয় ও কেন্দ্রসমূহ।",
  syllabus: "📚 **মেধা অন্বেষা ২০২৬ সিলেবাস ও মানবণ্টন (Syllabus & Marks Distribution):**\n- **বাংলা ব্যাকরণ ও সাহিত্য:** ২০%\n- **গণিত ও লজিক্যাল রিজনিং:** ৩০%\n- **সাধারণ বিজ্ঞান ও পরিবেশ:** ৩০%\n- **সাধারণ জ্ঞান ও স্থানীয় ঐতিহ্য:** ২০%\n- **মোট পূর্ণমান:** ৫০ নম্বর (MCQ)\n- **সময়কাল:** ২ ঘণ্টা",
  results: "🔍 **ফলাফল দেখার নিয়ম (How to Check Results):**\n১. ফলাফল অনুসন্ধান বক্সে আপনার **রোল নম্বর (যেমন: `MA-2026-601`)** অথবা আপনার **নাম** লিখুন।\n২. 'ফলাফল অনুসন্ধান' বাটনে ক্লিক করুন।\n৩. আপনার ডিজিটাল সার্টিফিকেট ও নম্বরপত্র দেখতে পাবেন এবং PDF ডাউনলোড করতে পারবেন।",
  developer: "👨‍💻 **ওয়েবসাইট ডিজাইন ও প্রযুক্তি অংশীদার:**\n- **ডেভেলপার:** Sudip Khatua ([www.xestus.in](https://www.xestus.in))\n- **যোগাযোগ:** sudipkhatua808@gmail.com / xestus.office@gmail.com\n- **সংস্থা:** Pindrui Purba Para Medha Anwesha Committee"
};

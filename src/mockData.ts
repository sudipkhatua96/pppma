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

export interface MockQuestion {
  id: string;
  classLevel: string;
  subject: "Bengali" | "Mathematics" | "Science" | "General Knowledge";
  questionBn: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanationBn: string;
}

export interface HallOfFameMember {
  id: string;
  name: string;
  year: number;
  classLevel: string;
  rank: 1 | 2 | 3;
  score: number;
  maxScore: number;
  school: string;
  trophyType: "gold" | "silver" | "bronze";
  quoteBn: string;
  achievementBadge: string;
}

export interface AdmitCardRecord {
  rollNo: string;
  name: string;
  guardianName: string;
  classLevel: string;
  school: string;
  centerName: string;
  centerAddress: string;
  roomNo: string;
  seatNo: string;
  examDate: string;
  reportingTime: string;
  examTime: string;
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

export const DEFAULT_HALL_OF_FAME: HallOfFameMember[] = [
  {
    id: "hof-1",
    name: "Arpita Maiti",
    year: 2025,
    classLevel: "Class VIII",
    rank: 1,
    score: 49,
    maxScore: 50,
    school: "Palaspai High School",
    trophyType: "gold",
    quoteBn: "নিয়মিত অনুশীলন এবং সিলেবাস ভিত্তিক অধ্যয়নই সাফল্যের চাবিকাঠি।",
    achievementBadge: "Gold Medalist (98% Score)"
  },
  {
    id: "hof-2",
    name: "Rahul Khatua",
    year: 2025,
    classLevel: "Class VI",
    rank: 1,
    score: 48,
    maxScore: 50,
    school: "Mayapur High School",
    trophyType: "gold",
    quoteBn: "বিজ্ঞান ও গণিতের লজিক্যাল সমস্যা সমাধানের আনন্দ অতুলনীয়।",
    achievementBadge: "Champion Scholar"
  },
  {
    id: "hof-3",
    name: "Kushal Sen",
    year: 2025,
    classLevel: "Class X",
    rank: 1,
    score: 49,
    maxScore: 50,
    school: "Mayapur High School",
    trophyType: "gold",
    quoteBn: "কমিটির প্রশ্নপত্র অত্যন্ত মানসম্মত এবং মেধা বিকাশে দারুণ সহায়ক।",
    achievementBadge: "Senior Category Topper"
  },
  {
    id: "hof-4",
    name: "Souvik Hazra",
    year: 2025,
    classLevel: "Class VIII",
    rank: 2,
    score: 48,
    maxScore: 50,
    school: "Khanakul Krishnanagar High School",
    trophyType: "silver",
    quoteBn: "পরবর্তী বছরগুলোতেও এই পরীক্ষায় অংশগ্রহণ করার ইচ্ছা আছে।",
    achievementBadge: "Silver Medalist"
  },
  {
    id: "hof-5",
    name: "Tanaya Adhikari",
    year: 2025,
    classLevel: "Class VII",
    rank: 2,
    score: 47,
    maxScore: 50,
    school: "Arambagh Girls High School",
    trophyType: "silver",
    quoteBn: "মেয়েরা পড়াশোনায় কোনো অংশে কম নয়, মেধা অন্বেষা তার প্রমাণ দিয়েছে।",
    achievementBadge: "Silver Medalist"
  },
  {
    id: "hof-6",
    name: "Sneha Pal",
    year: 2025,
    classLevel: "Class VIII",
    rank: 3,
    score: 47,
    maxScore: 50,
    school: "Arambagh Girls High School",
    trophyType: "bronze",
    quoteBn: "কমিটির অনুপ্রেরণায় ভবিষ্যতে বড় কিছু করার স্বপ্ন দেখছি।",
    achievementBadge: "Bronze Medalist"
  },
  {
    id: "hof-7",
    name: "Anish Roy",
    year: 2025,
    classLevel: "Class I",
    rank: 1,
    score: 48,
    maxScore: 50,
    school: "Mayapur Primary School",
    trophyType: "gold",
    quoteBn: "ছোট বয়সে মেধা অন্বেষার মঞ্চে পুরস্কৃত হওয়া দারুণ অভিজ্ঞতা।",
    achievementBadge: "Primary Star Award"
  }
];

export const DEFAULT_MOCK_QUESTIONS: MockQuestion[] = [
  // Class V - VIII
  {
    id: "mq-1",
    classLevel: "Class V",
    subject: "Bengali",
    questionBn: "নিচের কোন বানানটি সঠিক?",
    options: ["পুরষ্কার", "পুরস্কার", "পুরুস্কার", "পুরসকার"],
    correctIndex: 1,
    explanationBn: "সন্ধিজাত ও ব্যাকরণগত নিয়মে 'পুরস্কার' (দন্ত্য-স) বানানটি সঠিক।"
  },
  {
    id: "mq-2",
    classLevel: "Class V",
    subject: "Mathematics",
    questionBn: "একটি সমকোণী ত্রিভুজের একটি কোণ ৯০° হলে অপর দুটি কোণের সমষ্টি কত?",
    options: ["৪৫°", "৬০°", "৯০°", "১৮০°"],
    correctIndex: 2,
    explanationBn: "ত্রিভুজের তিনটি কোণের সমষ্টি ১৮০°। একটি কোণ ৯০° হলে অপর দুটির সমষ্টি (১৮০° - ৯০°) = ৯০°।"
  },
  {
    id: "mq-3",
    classLevel: "Class V",
    subject: "Science",
    questionBn: "উদ্ভিদের খাদ্য তৈরির প্রক্রিয়ার নাম কী?",
    options: ["শ্বসন", "সালোকসংশ্লেষ", "বাষ্পমোচন", "অঙ্কুরোদ্গম"],
    correctIndex: 1,
    explanationBn: "সূর্যালোকের উপস্থিতিতে ক্লোরোফিলের সাহায্যে উদ্ভিদের খাদ্য তৈরির প্রক্রিয়াকে সালোকসংশ্লেষ (Photosynthesis) বলে।"
  },
  {
    id: "mq-4",
    classLevel: "Class V",
    subject: "General Knowledge",
    questionBn: "পশ্চিমবঙ্গের রাজ্য পশুর নাম কী?",
    options: ["রয়্যাল বেঙ্গল টাইগার", "মেছো বিড়াল (Fishing Cat)", "একশৃঙ্গ গণ্ডার", "হাতি"],
    correctIndex: 1,
    explanationBn: "পশ্চিমবঙ্গের সরকারি রাজ্য পশু হলো মেছো বিড়াল বা বাঘরোল।"
  },
  {
    id: "mq-5",
    classLevel: "Class VI",
    subject: "Bengali",
    questionBn: "'সূর্য' শব্দের একটি সমার্থক শব্দ কোনটি?",
    options: ["শশী", "মার্তণ্ড", "অম্বু", "পবন"],
    correctIndex: 1,
    explanationBn: "'মার্তণ্ড' অর্থ সূর্য। 'শশী' হলো চাঁদ, 'অম্বু' হলো জল এবং 'পবন' হলো বাতাস।"
  },
  {
    id: "mq-6",
    classLevel: "Class VI",
    subject: "Mathematics",
    questionBn: "২, ৩, ৫, ৭, ১১, ১৩ — পরবর্তী মৌলিক সংখ্যাটি কোনটি?",
    options: ["১৫", "১৭", "১৯", "২১"],
    correctIndex: 1,
    explanationBn: "১৩-এর পরবর্তী মৌলিক সংখ্যা হলো ১৭।"
  },
  {
    id: "mq-7",
    classLevel: "Class VI",
    subject: "Science",
    questionBn: "মানবদেহের বৃহত্তম গ্রন্থি (Gland) কোনটি?",
    options: ["অগ্ন্যাশয়", "যকৃৎ (Liver)", "থাইরয়েড", "পিটুইটারি"],
    correctIndex: 1,
    explanationBn: "যকৃৎ (Liver) মানবদেহের বৃহত্তম পরিপাক গ্রন্থি।"
  },
  {
    id: "mq-8",
    classLevel: "Class VII",
    subject: "Bengali",
    questionBn: "'বিদ্যালয়' শব্দের সঠিক সন্ধি বিচ্ছেদ কোনটি?",
    options: ["বিদ্যা + আলয়", "বিদ্য + আলয়", "বিদ্যা + লয়", "বিদ + আলয়"],
    correctIndex: 0,
    explanationBn: "বিদ্যা + আলয় = বিদ্যালয় (আ + আ = আ)।"
  },
  {
    id: "mq-9",
    classLevel: "Class VII",
    subject: "Mathematics",
    questionBn: "একটি বৃত্তের ব্যাসার্ধ ৭ সেমি হলে তার পরিধি কত? (ধরি π = ২২/৭)",
    options: ["২২ সেমি", "৪৪ সেমি", "৮৮ সেমি", "১৫৪ সেমি"],
    correctIndex: 1,
    explanationBn: "পরিধি = ২ × π × r = ২ × (২২/৭) × ৭ = ৪৪ সেমি।"
  },
  {
    id: "mq-10",
    classLevel: "Class VII",
    subject: "Science",
    questionBn: "বায়ুমণ্ডলে কোন গ্যাসের পরিমাণ সবচেয়ে বেশি?",
    options: ["অক্সিজেন", "নাইট্রোজেন", "কার্বন ডাই অক্সাইড", "আর্গন"],
    correctIndex: 1,
    explanationBn: "বায়ুমণ্ডলে নাইট্রোজেনের পরিমাণ প্রায় ৭৮.০৮%।"
  },
  {
    id: "mq-11",
    classLevel: "Class VIII",
    subject: "Mathematics",
    questionBn: "যদি x + 1/x = 3 হয়, তবে x² + 1/x² এর মান কত?",
    options: ["৭", "৯", "১১", "৬"],
    correctIndex: 0,
    explanationBn: "x² + 1/x² = (x + 1/x)² - 2 = 3² - 2 = 9 - 2 = 7।"
  },
  {
    id: "mq-12",
    classLevel: "Class VIII",
    subject: "Science",
    questionBn: "শব্দের গতিবেগ কোন মাধ্যমে সর্বাধিক?",
    options: ["বায়ু", "জল", "কঠিন লোহা", "শূন্যস্থান"],
    correctIndex: 2,
    explanationBn: "কঠিন মাধ্যমে (যেমন লোহা বা ইস্পাত) শব্দের গতিবেগ সর্বাধিক (প্রায় ৫০০০+ মি/সে)।"
  },
  {
    id: "mq-13",
    classLevel: "Class VIII",
    subject: "General Knowledge",
    questionBn: "রামমোহন রায়কে 'রাজা' উপাধি কে দিয়েছিলেন?",
    options: ["মুঘল সম্রাট দ্বিতীয় আকবর", "লর্ড বেন্টিঙ্ক", "রবীন্দ্রনাথ ঠাকুর", "বিদ্যাসাগর"],
    correctIndex: 0,
    explanationBn: "১৮৩১ সালে দিল্লির মুঘল সম্রাট দ্বিতীয় আকবর রামমোহন রায়কে 'রাজা' উপাধি প্রদান করেন।"
  },
  {
    id: "mq-14",
    classLevel: "Class IX",
    subject: "Science",
    questionBn: "বলের একক এস.আই (S.I) পদ্ধতিতে কী?",
    options: ["ডাইন", "নিউটন", "জুল", "ওয়াট"],
    correctIndex: 1,
    explanationBn: "S.I পদ্ধতিতে বলের একক নিউটন (Newton) এবং C.G.S পদ্ধতিতে ডাইন।"
  },
  {
    id: "mq-15",
    classLevel: "Class X",
    subject: "Mathematics",
    questionBn: "দ্বিঘাত সমীকরণ ax² + bx + c = 0 এর বীজদ্বয় সমান হওয়ার শর্ত কী?",
    options: ["b² - 4ac > 0", "b² - 4ac = 0", "b² - 4ac < 0", "b = 0"],
    correctIndex: 1,
    explanationBn: "নিরূপক (Discriminant) b² - 4ac = 0 হলে দ্বিঘাত সমীকরণের বীজদ্বয় বাস্তব ও সমান হয়।"
  }
];

export const DEFAULT_ADMIT_CARDS: Record<string, AdmitCardRecord> = {
  "MA-2026-601": {
    rollNo: "MA-2026-601",
    name: "Rahul Khatua",
    guardianName: "Santanu Khatua",
    classLevel: "Class VI",
    school: "Mayapur High School",
    centerName: "Mayapur High School Center",
    centerAddress: "Mayapur, Hooghly, West Bengal - 712413",
    roomNo: "Room No. 04 (First Floor)",
    seatNo: "Bench B-12",
    examDate: "রবিবার, ২৯শে নভেম্বর, ২০২৬",
    reportingTime: "সকাল ১০:৩০ টা",
    examTime: "সকাল ১১:০০ টা - দুপুর ১:০০ টা"
  },
  "MA-2026-801": {
    rollNo: "MA-2026-801",
    name: "Arpita Maiti",
    guardianName: "Bimal Maiti",
    classLevel: "Class VIII",
    school: "Palaspai High School",
    centerName: "Palaspai High School Campus",
    centerAddress: "Palaspai, Khanakul, Hooghly - 712417",
    roomNo: "Room No. 08 (Main Block)",
    seatNo: "Bench A-03",
    examDate: "রবিবার, ২৯শে নভেম্বর, ২০২৬",
    reportingTime: "সকাল ১০:৩০ টা",
    examTime: "সকাল ১১:০০ টা - দুপুর ১:০০ টা"
  },
  "MA-2026-701": {
    rollNo: "MA-2026-701",
    name: "Subhadip Dutta",
    guardianName: "Prabir Dutta",
    classLevel: "Class VII",
    school: "Harinkhola High School",
    centerName: "Harinkhola High School Center",
    centerAddress: "Harinkhola, Arambagh, Hooghly - 712412",
    roomNo: "Room No. 02",
    seatNo: "Bench C-05",
    examDate: "রবিবার, ২৯শে নভেম্বর, ২০২৬",
    reportingTime: "সকাল ১০:৩০ টা",
    examTime: "সকাল ১১:০০ টা - দুপুর ১:০০ টা"
  },
  "MA-2026-501": {
    rollNo: "MA-2026-501",
    name: "Sourav Das",
    guardianName: "Ashok Das",
    classLevel: "Class V",
    school: "Palaspai High School",
    centerName: "Palaspai High School Campus",
    centerAddress: "Palaspai, Khanakul, Hooghly - 712417",
    roomNo: "Room No. 01 (Ground Floor)",
    seatNo: "Bench A-08",
    examDate: "রবিবার, ২৯শে নভেম্বর, ২০২৬",
    reportingTime: "সকাল ১০:৩০ টা",
    examTime: "সকাল ১১:০০ টা - দুপুর ১:০০ টা"
  }
};

export const OFFLINE_AI_RESPONSES: Record<string, string> = {
  exam_date: "📅 **মেধা অন্বেষা ২০২৬ পরীক্ষার সময়সূচি (Exam Schedule):**\n- **তারিখ:** রবিবার, ২৯শে নভেম্বর, ২০২৬ (Sunday, November 29, 2026)\n- **সময়:** সকাল ১১:০০ টা থেকে দুপুর ১:০০ টা (২ ঘণ্টা)\n- **পরীক্ষাকেন্দ্র:** সংশ্লিষ্ট নির্ধারিত বিদ্যালয় ও কেন্দ্রসমূহ।",
  syllabus: "📚 **মেধা অন্বেষা ২০২৬ সিলেবাস ও মানবণ্টন (Syllabus & Marks Distribution):**\n- **বাংলা ব্যাকরণ ও সাহিত্য:** ২০%\n- **গণিত ও লজিক্যাল রিজনিং:** ৩০%\n- **সাধারণ বিজ্ঞান ও পরিবেশ:** ৩০%\n- **সাধারণ জ্ঞান ও স্থানীয় ঐতিহ্য:** ২০%\n- **মোট পূর্ণমান:** ৫০ নম্বর (MCQ)\n- **সময়কাল:** ২ ঘণ্টা",
  results: "🔍 **ফলাফল দেখার নিয়ম (How to Check Results):**\n১. ফলাফল অনুসন্ধান বক্সে আপনার **রোল নম্বর (যেমন: `MA-2026-601`)** অথবা আপনার **নাম** লিখুন।\n২. 'ফলাফল অনুসন্ধান' বাটনে ক্লিক করুন।\n৩. আপনার ডিজিটাল সার্টিফিকেট ও নম্বরপত্র দেখতে পাবেন এবং PDF ডাউনলোড করতে পারবেন।",
  admit_card: "🎫 **ডিজিটাল এডমিট কার্ড ডাউনলোড (Admit Card):**\n১. উপরের 'এডমিট কার্ড' ট্যাবে ক্লিক করুন।\n২. আপনার রোল নম্বর (যেমন: `MA-2026-601`) বা নাম লিখে সার্চ করুন।\n৩. আপনার পরীক্ষাকেন্দ্র, আসন নম্বর ও নির্দেশাবলী সহ এডমিট কার্ডটি ডাউনলোড বা প্রিন্ট করে নিন।",
  mock_test: "📝 **অনলাইন মক টেস্ট (Mock Test Practice):**\n১. 'মক টেস্ট' ট্যাবে যান এবং আপনার ক্লাস সিলেক্ট করুন।\n২. ১০ মিনিটের টাইমারযুক্ত এমসিকিউ কুইজে অংশ নিন।\n৩. তাৎক্ষণিক স্কোর, সঠিক উত্তর এবং ব্যাখ্যা দেখতে পাবেন।",
  developer: "👨‍💻 **ওয়েবসাইট ডিজাইন ও প্রযুক্তি অংশীদার:**\n- **ডেভেলপার:** Sudip Khatua ([www.xestus.in](https://www.xestus.in))\n- **যোগাযোগ:** sudipkhatua808@gmail.com / xestus.office@gmail.com\n- **সংস্থা:** Pindrui Purba Para Medha Anwesha Committee"
};

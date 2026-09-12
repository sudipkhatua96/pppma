import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Trophy, Medal, AlertCircle, BookOpen, School, UserCheck, Eye, EyeOff, Quote, ChevronLeft, ChevronRight, GraduationCap, Star, Download, Printer } from "lucide-react";
import { StudentResult } from "../types";
import { jsPDF } from "jspdf";
import { QRCodeSVG } from "qrcode.react";

interface Testimonial {
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

interface PortalViewProps {
  primaryColor: string;
  accentColor: string;
  searchHelpText?: string;
  isResultsLive?: boolean;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
  settings?: any;
  themeMode?: "normal" | "dark" | "eye-comfort";
}

export default function PortalView({ 
  primaryColor, 
  accentColor, 
  isResultsLive = false,
  searchHelpText = "পরীক্ষার্থীর নাম অথবা রোল নম্বর (যেমন: MA-2026-601) দিয়ে ফলাফল অনুসন্ধান করুন।",
  showToast,
  settings,
  themeMode = "normal"
}: PortalViewProps) {
  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (showToast) {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  const [results, setResults] = useState<StudentResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchClass, setSearchClass] = useState("All");
  const [activeTab, setActiveTab] = useState<"search" | "leaderboard" | "all">("search");
  const [individualSearch, setIndividualSearch] = useState("");
  const [foundStudent, setFoundStudent] = useState<StudentResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parent Dispute & Clerical Feedback States
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackPhone, setFeedbackPhone] = useState("");
  const [feedbackAddress, setFeedbackAddress] = useState("");
  const [feedbackSubject, setFeedbackSubject] = useState("Clerical Error Report");
  const [feedbackDesc, setFeedbackDesc] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackScreenshot, setFeedbackScreenshot] = useState<string | null>(null);

  // OTP Validation system states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [userInputOtp, setUserInputOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [formSubmittedSuccessfully, setFormSubmittedSuccessfully] = useState(false);

  // Drawing canvas modal states
  const [showCanvasModal, setShowCanvasModal] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [lastX, setLastX] = useState(0);
  const [lastY, setLastY] = useState(0);

  // Support Ticket Helpline Form States
  const [supportRollNo, setSupportRollNo] = useState("");
  const [supportStudentName, setSupportStudentName] = useState("");
  const [supportIssue, setSupportIssue] = useState("");
  const [supportContact, setSupportContact] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [ticketSuccessInfo, setTicketSuccessInfo] = useState<{ id: string; msg: string } | null>(null);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportIssue.trim() || !supportContact.trim()) {
      triggerToast("অভিযোগের বিবরণ এবং যোগাযোগের নম্বর দেওয়া আবশ্যক!", "error");
      return;
    }
    
    try {
      setSupportSubmitting(true);
      const res = await fetch("/api/support-tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: supportRollNo,
          studentName: supportStudentName,
          issueDescription: supportIssue,
          contactNumber: supportContact
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast("আপনার আবেদনটি সফলভাবে জমা নেওয়া হয়েছে!", "success");
        setTicketSuccessInfo({ id: data.ticketId, msg: data.message });
        // Reset form
        setSupportRollNo("");
        setSupportStudentName("");
        setSupportIssue("");
        setSupportContact("");
      } else {
        triggerToast(data.message || "জমা দিতে সমস্যা হয়েছে, অনুগ্রহ করে আবার চেষ্টা করুন।", "error");
      }
    } catch (err: any) {
      console.error(err);
      triggerToast("সার্ভার সংযোগে ত্রুটি ঘটেছে।", "error");
    } finally {
      setSupportSubmitting(false);
    }
  };

  // Star spark click particles
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isStarShowerActive, setIsStarShowerActive] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  
  const dismissMaintenanceModal = () => {
    sessionStorage.setItem('bypassStagingPopup', 'true');
    setIsMaintenanceModalOpen(false);
  };

  useEffect(() => {
    if (isMaintenanceModalOpen && sessionStorage.getItem('bypassStagingPopup') === 'true') {
      setIsMaintenanceModalOpen(false);
    }
  }, [isMaintenanceModalOpen]);

  const starShowerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Star Shower animation neutralized for ultra-high FPS scrolling on low-spec hardware
  useEffect(() => {
    // Disabled to preserve local rendering resources
  }, [isStarShowerActive]);

  // Advanced Digital Certificate, Verification & Stage Lock States
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [certificateStudent, setCertificateStudent] = useState<StudentResult | null>(null);
  const [showDraftPortalModal, setShowDraftPortalModal] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState<StudentResult | null>(null);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);

  // Parse verifiedRoll URL parameter on mount and when results change
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vRoll = params.get("verifiedRoll");
    if (vRoll && results.length > 0) {
      const student = results.find(
        (r) => r.rollNo.trim().toUpperCase() === vRoll.trim().toUpperCase()
      );
      if (student) {
        setVerifiedStudent(student);
        setShowVerifiedModal(true);
      }
    }
  }, [results]);

  // Fetch results from Express API
  const fetchResults = async (showPopupOnLock = false) => {
    try {
      setLoading(true);
      const res = await fetch("/api/results");
      const contentType = res.headers.get("content-type");
      
      let data: any = null;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(`Non-JSON response received (${res.status})`);
      }
      
      if (res.status === 403 || (data && data.error === "Locked")) {
        const bypass = sessionStorage.getItem('bypassStagingPopup') === 'true';
        if (showPopupOnLock && !bypass) {
          setIsMaintenanceModalOpen(true);
        }
        setMaintenanceMessage(data.message || "ফলাফল তৈরির কাজ চলছে। মেধা অন্বেষা কমিটি কর্তৃক চূড়ান্ত অনুমোদনের পর খুব শীঘ্রই সমস্ত ফলাফল একযোগে এই পোর্টালে প্রকাশ করা হবে। আমাদের সাথে থাকার জন্য ধন্যবাদ।");
        setResults([]);
        return;
      }

      if (Array.isArray(data)) {
        setResults(data);
        setIsMaintenanceModalOpen(false);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data);
      }
    } catch (err) {
      console.warn("Could not retrieve testimonials from active database. Switched to fallback helper.");
    }
  };

  useEffect(() => {
    fetchResults(false);
    fetchTestimonials();
  }, []);

  // Slide rotation logic (every 7 seconds if active, resets on manual change to allow comfortable reading)
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 7000);
    return () => clearInterval(slideTimer);
  }, [testimonials, currentSlide]);

  const downloadResultPDF = (student: StudentResult) => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    // 1. Draw outer gold decorative border
    doc.setDrawColor(245, 166, 35); // Golden / Saffron
    doc.setLineWidth(1.5);
    doc.rect(10, 10, 190, 277);

    // 2. Draw inner indigo decorative border
    doc.setDrawColor(26, 20, 100); // Navy Indigo
    doc.setLineWidth(0.5);
    doc.rect(13, 13, 184, 271);

    // 3. Draw elegant gold corner accents
    const corners = [
      { x: 13, y: 13, dx: 1, dy: 1 },
      { x: 197, y: 13, dx: -1, dy: 1 },
      { x: 13, y: 284, dx: 1, dy: -1 },
      { x: 197, y: 284, dx: -1, dy: -1 }
    ];
    doc.setFillColor(245, 166, 35);
    corners.forEach(c => {
      doc.triangle(
        c.x, c.y,
        c.x + c.dx * 8, c.y,
        c.x, c.y + c.dy * 8,
        "F"
      );
    });

    // 4. Header Background Banner
    doc.setFillColor(26, 20, 100); // Deep Navy Indigo
    doc.rect(15, 16, 180, 30, "F");

    // Header Texts
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("PINDRUI PURBA PARA MEDHA ANWESHA COMMITTEE", 105, 23, { align: "center" });

    doc.setTextColor(245, 166, 35); // Accent Golden
    doc.setFontSize(9);
    doc.text("ESTD: 2011 | ANNUAL VILLAGE SCHOLARSHIP & TALENT SEARCH EXAM", 105, 29, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Pindrui, Pingla, Paschim Medinipur, West Bengal - 721131", 105, 34, { align: "center" });

    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.4);
    doc.line(15, 46, 195, 46);

    // 5. Document Type Title Badge
    doc.setFillColor(243, 244, 246); // Light gray highlight
    doc.rect(55, 52, 100, 10, "F");
    doc.setDrawColor(229, 231, 235);
    doc.rect(55, 52, 100, 10, "S");
    
    doc.setTextColor(26, 20, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("OFFICIAL ACHIEVEMENT REPORT CARD", 105, 58.5, { align: "center" });

    // 6. Candidate Information Section Heading
    doc.setTextColor(26, 20, 100);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("CANDIDATE PROFILE", 20, 72);
    doc.line(20, 74, 80, 74);

    // Information rows helper
    const drawRow = (label: string, value: string, yPos: number) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Gray label
      doc.text(label, 20, yPos);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(17, 24, 39); // Dark slate value
      doc.text(value || "N/A", 65, yPos);

      // Light underline
      doc.setDrawColor(241, 245, 249);
      doc.setLineWidth(0.3);
      doc.line(20, yPos + 3, 190, yPos + 3);
    };

    drawRow("Student Name", student.name, 82);
    drawRow("Roll Number", student.rollNo, 92);
    drawRow("Class Level", student.classLevel, 102);
    drawRow("Assigned School", student.school, 112);
    drawRow("Examination Year", "2026 (Annual Intake)", 122);
    drawRow("Evaluation Center", "Pindrui Primary School Campus", 132);

    // 7. Exam Performance Layout (Bento Blocks)
    doc.setTextColor(26, 20, 100);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("PERFORMANCE SCORECARD", 20, 149);
    doc.line(20, 151, 80, 151);

    // Left Block: Marks Scored
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 157, 75, 36, "F");
    doc.rect(20, 157, 75, 36, "S");

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL MARKS OBTAINED", 57.5, 164, { align: "center" });

    doc.setTextColor(26, 20, 100);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(`${student.marks} / 50`, 57.5, 178, { align: "center" });

    doc.setTextColor(71, 85, 105);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("Passing Standard: 20 Marks", 57.5, 187, { align: "center" });

    // Right Block: Official Rank
    doc.setFillColor(255, 251, 235);
    doc.setDrawColor(253, 230, 138);
    doc.rect(115, 157, 75, 36, "F");
    doc.rect(115, 157, 75, 36, "S");

    doc.setTextColor(180, 83, 9);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("MERIT / CLASS RANK", 152.5, 164, { align: "center" });

    doc.setTextColor(146, 64, 14);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text(student.status === "Absent" ? "ABS" : `# ${student.rank}`, 152.5, 178, { align: "center" });

    doc.setTextColor(180, 83, 9);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("Relative standing in class level", 152.5, 187, { align: "center" });

    // 8. Dynamic Status Ribbon
    let statusText = "CONGRATULATIONS! QUALIFIED FOR EXCELENCE AWARD";
    let statusColor = [16, 185, 129]; // Emerald Green
    if (student.status === "Absent") {
      statusText = "ABSENT FROM EXAMINATION";
      statusColor = [100, 116, 139]; // Slate Gray
    } else if (student.status === "Failed") {
      statusText = "NOT QUALIFIED FOR PARALLEL MERIT";
      statusColor = [239, 68, 68]; // Red
    }

    doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
    doc.rect(20, 194, 170, 9, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(statusText, 105, 200, { align: "center" });

    // 9. Details of Assessment & Curriculum
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      "Assessment Protocol: Evaluated transparently by external board coordinators. This digital report card is valid and equivalent to printed physical copies. Result archives are stored securely. Carry this output with verified ID to collect awards or general certificates.",
      20,
      209,
      { maxWidth: 170, align: "justify" }
    );

    // 10. Warm Wishes & Inspiring Motivational Message (Centered, beautifully typeset)
    doc.setTextColor(26, 20, 100); // Navy Indigo
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(10);
    doc.text(
      "Wishing you a bright future filled with continuous learning, excellence, and success!",
      105,
      222,
      { maxWidth: 160, align: "center" }
    );

    doc.setTextColor(180, 83, 9); // Gold / Amber accent tone
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text(
      "Keep shining and reaching new heights.",
      105,
      229,
      { align: "center" }
    );

    // 11. Custom Golden Seal & Double Signature Block
    // Horizontal separator
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.4);
    doc.line(20, 235, 190, 235);

    // Cursive / digital signature placeholders
    doc.setFont("courier", "bolditalic");
    doc.setFontSize(9);
    doc.setTextColor(26, 20, 100);
    doc.text("S. Khatua", 47.5, 249, { align: "center" }); // Exam Coordinator signature
    doc.text("A. Mandal", 162.5, 249, { align: "center" }); // President signature

    // Signature lines
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.4);
    doc.line(25, 252, 70, 252);
    doc.line(140, 252, 185, 252);

    // Signature labels
    doc.setTextColor(51, 65, 85);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("S. Khatua", 47.5, 256, { align: "center" });
    doc.text("A. Mandal", 162.5, 256, { align: "center" });

    doc.setTextColor(148, 163, 184);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Exam Coordinator", 47.5, 260, { align: "center" });
    doc.text("President, PMAC", 162.5, 260, { align: "center" });

    // Official Golden Seal in between
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.4);
    doc.circle(105, 248, 8, "S");
    doc.circle(105, 248, 7.2, "S");
    
    doc.setFontSize(4.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(245, 166, 35);
    doc.text("VERIFIED", 105, 247, { align: "center" });
    doc.text("M.A.C.", 105, 250, { align: "center" });

    // Bottom Badge Ribbon
    doc.setDrawColor(245, 166, 35);
    doc.setLineWidth(0.5);
    doc.line(15, 273, 195, 273);
    
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.text(`Official Generated Report ID: MA-2026-${student.id || student.rollNo} • Verified by Pindrui Medha Anwesha Committee`, 105, 279, { align: "center" });

    // Save PDF
    doc.save(`Medha_Anwesha_Result_${student.rollNo}.pdf`);
  };

  const handleIndividualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isResultsLive) {
      const bypass = sessionStorage.getItem('bypassStagingPopup') === 'true';
      if (!bypass) {
        setIsMaintenanceModalOpen(true);
        return;
      }
    }
    if (isSearching) return;

    setIsSearching(true);
    setHasSearched(false);

    // Transparently log search query to backend audit log
    if (individualSearch.trim()) {
      fetch(`/api/results/search?q=${encodeURIComponent(individualSearch.trim())}`).catch((err) => {
        console.warn("Telemetry search log failed (benign):", err);
      });
    }

    try {
      // 1. Fetch fresh results directly from API for dynamic checks
      const res = await fetch("/api/results");
      const contentType = res.headers.get("content-type");
      
      let data: any = null;
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        throw new Error(`Non-JSON response received (${res.status})`);
      }
      
      if (res.status === 403 || (data && data.error === "Locked")) {
        const bypass = sessionStorage.getItem('bypassStagingPopup') === 'true';
        if (!bypass) {
          setIsMaintenanceModalOpen(true);
          setMaintenanceMessage(data.message || "ফলাফল তৈরির কাজ চলছে। মেধা অন্বেষা কমিটি কর্তৃক চূড়ান্ত অনুমোদনের পর খুব শীঘ্রই সমস্ত ফলাফল একযোগে এই পোর্টালে প্রকাশ করা হবে। আমাদের সাথে থাকার জন্য ধন্যবাদ।");
        }
        setResults([]);
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || `Server communication failed with status ${res.status}`);
      }

      if (Array.isArray(data)) {
        setResults(data);
        setIsMaintenanceModalOpen(false);

        const searchLower = individualSearch.trim().toLowerCase();
        if (!searchLower) {
          setFoundStudent(null);
          setSearchSuggestions([]);
          return;
        }

        // Try finding exact Roll Number or matching Name precisely
        const student = data.find(
          (r) => 
            r.rollNo.toLowerCase() === searchLower ||
            r.name.toLowerCase() === searchLower
        );

        setFoundStudent(student || null);

        if (!student) {
          // Find partial matches to offer as friendly suggestions
          const partials = data.filter(
            (r) => 
              r.name.toLowerCase().includes(searchLower) ||
              r.rollNo.toLowerCase().includes(searchLower) ||
              r.school.toLowerCase().includes(searchLower)
          ).slice(0, 5);
          setSearchSuggestions(partials);
        } else {
          setSearchSuggestions([]);
        }
      }
      setHasSearched(true);
    } catch (err: any) {
      console.error("Search API Error:", err);
      // Fallback to searching the local state results if offline or transient server error
      const searchLower = individualSearch.trim().toLowerCase();
      if (searchLower && results.length > 0) {
        const student = results.find(
          (r) => 
            r.rollNo.toLowerCase() === searchLower ||
            r.name.toLowerCase() === searchLower
        );
        setFoundStudent(student || null);
        if (!student) {
          const partials = results.filter(
            (r) => 
              r.name.toLowerCase().includes(searchLower) ||
              r.rollNo.toLowerCase().includes(searchLower) ||
              r.school.toLowerCase().includes(searchLower)
          ).slice(0, 5);
          setSearchSuggestions(partials);
        } else {
          setSearchSuggestions([]);
        }
        setHasSearched(true);
      } else {
        triggerToast("ফলাফল অনুসন্ধান সার্ভার যোগাযোগ ব্যর্থ হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।", "error");
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Filter students for master list transparency
  const filteredAllStudents = results.filter((student) => {
    const matchesSearch = 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.school.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = searchClass === "All" || student.classLevel === searchClass;
    
    return matchesSearch && matchesClass;
  }).sort((a, b) => a.classLevel.localeCompare(b.classLevel) || a.rank - b.rank);

  // Group by class for Leaderboards (Top 3 only)
  const classLevels = [
    "Class I", "Class II", "Class III", "Class IV", "Class V",
    "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"
  ];
   const getLeaderboardData = (clLevel: string) => {
    if (!isResultsLive) return [];
    return results
      .filter((r) => r.classLevel === clLevel && r.status === "Passed" && r.rank <= 3)
      .sort((a, b) => a.rank - b.rank);
  };

  const badgeStyles = (rank: number) => {
    if (rank === 1) return { bg: "bg-amber-100 text-amber-800 border-amber-300", label: "1st Merit Rank", icon: <Trophy className="w-4 h-4 text-amber-500 fill-amber-300" /> };
    if (rank === 2) return { bg: "bg-slate-100 text-slate-800 border-slate-300", label: "2nd Merit Rank", icon: <Medal className="w-4 h-4 text-slate-400 fill-slate-200" /> };
    if (rank === 3) return { bg: "bg-orange-100 text-orange-850 border-orange-300", label: "3rd Merit Rank", icon: <Medal className="w-4 h-4 text-orange-400 fill-orange-200" /> };
    return { bg: "bg-gray-50 text-gray-700 border-gray-200", label: `Rank ${rank}`, icon: null };
  };

  const getAnalytics = () => {
    const total = results.length;
    if (total === 0) return { total: 0, passRate: 0, average: 0 };
    const passed = results.filter(r => r.status === "Passed").length;
    const sumMarks = results.reduce((sum, r) => sum + r.marks, 0);
    const avg = (sumMarks / total).toFixed(2);
    const rate = ((passed / total) * 100).toFixed(2);
    return {
      total,
      passRate: rate,
      average: avg
    };
  };

  const handleStarSelection = (star: number) => {
    setFeedbackRating(star);
    
    // Trigger magical diagonal full-viewport shooting star shower
    setIsStarShowerActive(true);
    setTimeout(() => {
      setIsStarShowerActive(false);
    }, 4500);

    // Also generate traditional click sparkle particles
    const newParticles = Array.from({ length: 12 }).map((_, idx) => ({
      id: Date.now() + idx,
      x: Math.random() * 100 - 50,
      y: Math.random() * -70 - 25
    }));
    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 1800);
  };

  const handleTriggerOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackName.trim() || !feedbackPhone.trim() || !feedbackDesc.trim()) {
      triggerToast("দয়া করে নাম, মোবাইল নম্বর এবং ফিডব্যাক বিবরণ সম্পূর্ণ করুন!", "error");
      return;
    }
    
    setOtpLoading(true);
    setOtpError("");
    
    try {
      const res = await fetch("/api/feedback/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: feedbackPhone })
      });
      
      const data = await res.json();
      setOtpLoading(false);
      
      if (res.ok && data.success) {
        setGeneratedOtp(data.otp);
        setUserInputOtp("");
        setShowOtpModal(true);
        triggerToast("একটি ওটিপি (OTP) ওয়ান-টাইম পাসকোড তৈরি হয়েছে!", "success");
      } else {
        triggerToast(data.error || "ওটিপি পাঠাতে সমস্যা হয়েছে। সঠিক মোবাইল নম্বর দিন।", "error");
      }
    } catch (err) {
      setOtpLoading(false);
      triggerToast("সার্ভার সার্ভিস অফলাইনে রয়েছে। অনুগ্রহ করে একটু পর চেষ্টা করুন।", "error");
    }
  };

  const handleConfirmOtpAndSubmit = async () => {
    if (!userInputOtp.trim()) {
      setOtpError("অনুগ্রহ করে প্রাপ্ত ওটিপি প্রবেশ করুন।");
      return;
    }
    
    setOtpLoading(true);
    setOtpError("");
    
    try {
      const response = await fetch("/api/feedback/verify-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: feedbackName,
          phone: feedbackPhone,
          address: feedbackAddress,
          subject: feedbackSubject,
          description: feedbackDesc,
          rating: feedbackRating,
          screenshot: feedbackScreenshot,
          otp: userInputOtp
        })
      });
      
      const data = await response.json();
      setOtpLoading(false);
      
      if (response.ok && data.success) {
        setShowOtpModal(false);
        setFormSubmittedSuccessfully(true);
        // Reset full feedback form
        setFeedbackName("");
        setFeedbackPhone("");
        setFeedbackAddress("");
        setFeedbackSubject("Clerical Error Report");
        setFeedbackDesc("");
        setFeedbackRating(5);
        setFeedbackScreenshot(null);
        setTimeout(() => setFormSubmittedSuccessfully(false), 9000);
      } else {
        setOtpError(data.error || "প্রদত্ত ওটিপিটি সঠিক নয় বা মেয়াদউত্তীর্ণ হয়েছে!");
      }
    } catch (err) {
      setOtpLoading(false);
      setOtpError("নেটওয়ার্ক সমস্যার কারণে ফিডব্যাক জমা দেওয়া ব্যর্থ হয়েছে।");
    }
  };

  const handleImageUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            canvas.width = 500;
            canvas.height = 400;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, 500, 400);
            ctx.drawImage(img, 0, 0, 500, 400);
          }
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = "#ef4444"; // Vivid Red
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);

    setLastX(x);
    setLastY(y);
    setDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const canvas = e.currentTarget;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();

    setLastX(x);
    setLastY(y);
  };

  const stopDraw = () => {
    setDrawing(false);
  };

  const saveDrawing = () => {
    const canvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/jpeg");
      setFeedbackScreenshot(dataUrl);
      setShowCanvasModal(false);
    }
  };

  const clearDrawing = () => {
    const canvas = document.getElementById("drawing-canvas") as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setFeedbackScreenshot(null);
      }
    }
  };

  const analytics = getAnalytics();

  const renderStarSelector = () => {
    return (
      <div className="relative flex items-center gap-1.5 py-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarSelection(star)}
            className="relative transition-transform duration-105 active:scale-90 hover:scale-110"
          >
            <Star 
              className={`w-5 h-5 transition-all ${
                star <= feedbackRating 
                  ? "text-amber-500 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" 
                  : "text-gray-300 hover:text-amber-250"
              }`} 
            />
          </button>
        ))}

        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute text-amber-500 font-extrabold animate-ping text-[10px]"
            style={{
              left: "50%",
              top: `${p.y}px`,
              marginLeft: `${p.x}px`,
              pointerEvents: "none"
            }}
          >
            ✦
          </span>
        ))}
      </div>
    );
  };

  const renderFeedbackForm = () => {
    return (
      <div id="parent-dispute-feedback-box" className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 mt-8 max-w-2xl mx-auto text-left">
        <div className="border-b pb-4 border-gray-100">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600 block">Feedback & Dispute Helpdesk</span>
          <h4 className="text-base font-black text-indigo-950 mt-1 flex items-center gap-1.5 font-sans">
            <span>ফলাফল সংশোধন ও ফিডব্যাক ফর্ম (Feedback & Inquiry Form)</span>
          </h4>
          <p className="text-[11px] text-gray-500 mt-1">
            If you have any feedback or notice discrepancies, please fill out the form below. Students, guardians, and guests are welcome to contact us.
          </p>
        </div>

        {formSubmittedSuccessfully && (
          <div className="bg-emerald-100 text-emerald-950 p-4 rounded-xl border border-emerald-300 text-xs font-bold text-center mt-4">
            🎉 আপনার ফিডব্যাক সফলভাবে জমা দেওয়া হয়েছে! (Feedback submitted successfully!)
          </div>
        )}

        <form onSubmit={handleTriggerOtp} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-indigo-950 font-bold uppercase mb-1">Your Name (আপনার নাম) *</label>
              <input
                type="text"
                required
                placeholder="যেমন: রাম দাস"
                value={feedbackName}
                onChange={(e) => setFeedbackName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none text-gray-800"
              />
            </div>
            <div>
              <label className="block text-[10px] text-indigo-950 font-bold uppercase mb-1">Your Role (আপনার ভূমিকা) *</label>
              <select
                value={feedbackSubject}
                onChange={(e) => setFeedbackSubject(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none text-gray-800 font-sans cursor-pointer"
              >
                <option value="Student">Student (ছাত্র/ছাত্রী)</option>
                <option value="Guardian">Guardian (অভিভাবক)</option>
                <option value="Guest">Guest (অতিথি/অন্যান্য)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-indigo-950 font-bold uppercase mb-1">Mobile Number (মোবাইল নম্বর) *</label>
              <input
                type="tel"
                required
                placeholder="১০ ডিজিটের মোবাইল নম্বর"
                value={feedbackPhone}
                onChange={(e) => setFeedbackPhone(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none text-gray-800 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] text-indigo-950 font-bold uppercase mb-1">Postal Address (ঠিকানা)</label>
              <input
                type="text"
                placeholder="গ্রাম, পোস্ট, জেলা ইত্যাদি"
                value={feedbackAddress}
                onChange={(e) => setFeedbackAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none text-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-indigo-950 font-bold uppercase mb-1">Feedback Message (মতামত বা বার্তা) *</label>
            <textarea
              required
              rows={3}
              placeholder="আপনার মতামত বা সমস্যাটি বিস্তারিত লিখুন..."
              value={feedbackDesc}
              onChange={(e) => setFeedbackDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-white rounded-lg border border-gray-300 focus:outline-none text-gray-800"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <span className="block text-[10px] text-indigo-950 font-bold uppercase">Feedback Star Rating (মূল্যায়ন)</span>
              <p className="text-[10px] text-gray-500 mt-0.5">Rate your portal experience</p>
            </div>
            {renderStarSelector()}
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <span className="block text-[10px] text-amber-800 font-bold uppercase">Attach Marked Report Card (চ্ছবি সংযুক্ত করুন) (ঐচ্ছিক)</span>
                <p className="text-[10px] text-gray-600 mt-0.5">Identify clerical faults instantly by highlighting directly on a card canvas.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowCanvasModal(true);
                }}
                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-indigo-950 flex items-center gap-1 cursor-pointer"
              >
                <span>🎨 Launch Drawing Tool</span>
              </button>
            </div>

            {feedbackScreenshot && (
              <div className="relative w-36 h-28 border rounded-lg bg-white overflow-hidden">
                <img src={feedbackScreenshot} alt="Clerical error highlighted" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setFeedbackScreenshot(null)}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                  title="Remove graphic"
                >
                  <span className="text-[9px] font-bold px-1 uppercase">Clear</span>
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={otpLoading}
            className="w-full py-3 rounded-lg text-xs font-bold text-white bg-indigo-950 hover:bg-indigo-900 transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {otpLoading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {otpLoading ? "অনুগ্রহ করে অপেক্ষা করুন..." : "ওটিপি পাঠান ও ফিডব্যাক জমা দিন / Verify Mobile & Submit"}
          </button>
        </form>
      </div>
    );
  };

  return (
    <div id="results-portal-container" className="w-full relative">
      {/* Sub tabs */}
      <div className="flex border border-indigo-100 mb-6 bg-white p-1.5 rounded-xl gap-2 max-w-md mx-auto">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "search"
              ? "bg-indigo-900 text-white shadow-md"
              : "text-gray-500 hover:text-indigo-900 hover:bg-gray-50"
          }`}
        >
          Check Result
        </button>
         <button
          onClick={() => {
            setActiveTab("leaderboard");
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "leaderboard"
              ? "bg-indigo-900 text-white shadow-md"
              : "text-gray-500 hover:text-indigo-900 hover:bg-gray-50"
          }`}
        >
          Leaderboards (Top 3)
        </button>
        <button
          onClick={() => {
            setActiveTab("all");
          }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "all"
              ? "bg-indigo-900 text-white shadow-md"
              : "text-gray-500 hover:text-indigo-900 hover:bg-gray-50"
          }`}
        >
          Transparency List
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-indigo-900 rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">ফলাফল সংকলিত হচ্ছে... Loading Marks Database...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: INDIVIDUAL SEARCH */}
          {activeTab === "search" && (
            <div id="individual-result-search" className="max-w-2xl mx-auto space-y-6">
              
              {!isResultsLive && (
                <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6 shadow-xl text-white relative overflow-hidden animate-fade-in">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none z-0 decorative-watermark">
                    <UserCheck className="w-32 h-32 text-white/5" />
                  </div>
                  
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 border border-amber-400/30 rounded-xl flex items-center justify-center text-amber-400 shrink-0">
                        <EyeOff className="w-5 h-5 text-amber-400 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wider font-sans">খসড়া ফলাফল যাচাইকরণ পর্যায় • Verification Mode</h4>
                        <p className="text-[10px] text-gray-300 font-bold">Pindrui Purba Para Talent Search Examination</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-200 leading-relaxed font-semibold">
                      পরীক্ষার খসড়া ফলাফল বর্তমানে এডমিন কমিটির দ্বারা যাচাই করা হচ্ছে। আপনি আপনার সাময়িক পরীক্ষার খসড়া নম্বর সাধারণ সার্চের মাধ্যমে রোল নং টাইপ করে দেখতে পারেন। চূড়ান্ত যাচাইকরণের পর মেধা তালিকা ও সার্টিফিকেট ডাউনলোড সচল করা হবে।
                    </p>
                    <p className="text-[10px] text-gray-400 leading-normal font-sans">
                      The draft marks are currently being compiled and validated by the council members. Official verified rankings, final top rankings, and print-ready certificates are locked until vetting concludes. Thank you for your cooperation!
                    </p>

                    <div className="pt-2 border-t border-white/5 flex gap-4 text-[9px] font-semibold text-amber-300 font-mono">
                      <span>📍 Center: Pindrui Purba Para</span>
                      <span>⏱️ Vetting Status: Vetting active</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100">
                <h3 className="text-lg font-bold text-indigo-950 mb-2 font-display text-center">ফলাফল অনুসন্ধান পোর্টাল</h3>
                <p className="text-xs text-gray-500 mb-6 text-center leading-relaxed max-w-lg mx-auto">
                  {searchHelpText}
                </p>

                <form onSubmit={handleIndividualSearch} className="flex gap-2 max-w-md mx-auto mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="রোল নম্বর অথবা নাম লিখুন..."
                      value={individualSearch}
                      onChange={(e) => setIndividualSearch(e.target.value)}
                      disabled={isSearching}
                      className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold font-sans text-indigo-950 bg-amber-500 hover:bg-amber-600 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    style={{ backgroundColor: isSearching ? "#d1d5db" : accentColor }}
                  >
                    {isSearching ? (
                      <span className="flex items-center gap-1.5 font-bold">
                        <svg className="animate-spin h-3.5 w-3.5 text-indigo-950 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        অনুগ্রহ করে অপেক্ষা করুন...
                      </span>
                    ) : (
                      "খুঁজুন / Search"
                    )}
                  </button>
                </form>

                {hasSearched && (
                  <div className="mt-8 pt-6 border-t border-gray-100">
                    {foundStudent ? (
                      <div className="bg-gradient-to-br from-amber-50/50 to-orange-100/30 rounded-2xl p-6 border border-amber-100 relative overflow-hidden">
                        {foundStudent.rank <= 3 && foundStudent.status === "Passed" && (
                          <div className="absolute top-0 right-0 p-3 flex gap-1 bg-amber-200 text-amber-900 rounded-bl-2xl font-semibold text-[10px] items-center">
                            <Trophy className="w-3.5 h-3.5" /> MEDHA LIST
                          </div>
                        )}
                        
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-2">
                            <span className="inline-block px-2.5 py-1 text-[10px] bg-indigo-900 text-white rounded-full font-bold">
                              {foundStudent.classLevel}
                            </span>
                            <h4 className="text-xl font-black text-indigo-950">{foundStudent.name}</h4>
                            <div className="flex flex-col gap-1 text-xs text-gray-600 font-medium">
                              <p className="flex items-center gap-1.5"><School className="w-3.5 h-3.5 text-indigo-900" /> {foundStudent.school}</p>
                              <p className="font-mono">রোল নং: {foundStudent.rollNo}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 self-start md:self-center">
                            <div className="text-center bg-white px-5 py-3 rounded-xl shadow-sm border border-orange-50">
                              <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Marks</p>
                              <p className="text-2xl font-black text-indigo-900">{foundStudent.marks}</p>
                            </div>
                            
                            <div className="text-center bg-white px-5 py-3 rounded-xl shadow-sm border border-orange-50">
                              <p className="text-[10px] text-gray-500 font-semibold uppercase">Class Rank</p>
                              <p className="text-2xl font-black text-amber-600">
                                {foundStudent.status === "Absent" ? "—" : `#${foundStudent.rank}`}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-[10px] text-gray-400 font-medium">Status</p>
                              <span className={`inline-block mt-1.5 px-3 py-1 rounded-full text-[10px] font-bold ${
                                foundStudent.status === "Passed" ? "bg-emerald-100 text-emerald-800" :
                                foundStudent.status === "Absent" ? "bg-gray-100 text-gray-800" : "bg-rose-100 text-rose-800"
                              }`}>
                                {foundStudent.status === "Passed" ? "কৃতকার্য / Pass" : foundStudent.status === "Absent" ? "অনুপস্থিত / Absent" : "অকৃতকার্য / Fail"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {foundStudent.status === "Passed" && (
                          <div className="mt-6 p-3 bg-white/70 border border-amber-100 rounded-xl flex items-start gap-2.5">
                            <UserCheck className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[11px] font-bold text-gray-800">অফিসিয়াল সার্টিফিকেট ও মেধা পুরস্কার সংগ্রহ করুন</p>
                              <p className="text-[10px] text-gray-500">
                                This candidate scored high marks. Ranks are compiled with strict fairness across participating schools. Carry your ID card to collect your certificate from the Medha Anwesha Committee.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Download Report Card Button Section */}
                        <div className="mt-6 pt-5 border-t border-amber-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <p className="text-[10px] text-gray-500 font-medium max-w-sm">
                            * মেধা সংশাপত্র প্রিন্ট অথবা পিডিএফ সেভ করার জন্য "Save Rank Card" নির্বাচন করুন। সরাসরি PDF ডাউনলোডের সুবিধাও রয়েছে।
                          </p>
                          <div className="flex flex-wrap gap-2.5">
                            <button
                              onClick={() => {
                                setCertificateStudent(foundStudent);
                                setShowCertificateModal(true);
                              }}
                              className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-indigo-950 font-black text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer font-sans"
                            >
                              <Printer className="w-4 h-4 text-indigo-950" />
                              Save Rank Card / প্রিন্ট করুন
                            </button>
                            <button
                              onClick={() => downloadResultPDF(foundStudent)}
                              className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer font-sans"
                            >
                              <Download className="w-4 h-4 text-amber-400" />
                              ডাউনলোড রেজাল্ট (PDF)
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 text-center max-w-lg mx-auto space-y-4">
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 border border-amber-100 mx-auto animate-pulse">
                          <Search className="w-6 h-6" />
                        </div>
                        
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-indigo-950">ফলাফল পাওয়া যায়নি / Result Not Found</h4>
                          <p className="text-[11px] text-gray-500 font-medium">পরীক্ষার্থীর নাম অথবা রোল নম্বর আমাদের সচল মেধা তালিকায় খুঁজে পাওয়া যায়নি।</p>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-gray-200 text-left space-y-2 max-w-sm mx-auto text-xs text-gray-700">
                          <p className="font-extrabold text-[10px] text-gray-400 uppercase tracking-wider border-b pb-1">Troubleshooting Checklist</p>
                          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed text-gray-600">
                            <li>Check uppercase syntax (e.g. use <span className="font-bold text-gray-800">MA-2026-611</span> instead of small lowercase words).</li>
                            <li>Make sure full name spelling matches your exact registration certificate.</li>
                            <li>Filter by the designated Class leaders using leaderboard view if searching is difficult.</li>
                          </ul>
                        </div>

                        {searchSuggestions.length > 0 && (
                          <div className="space-y-2 text-left max-w-sm mx-auto pt-2">
                            <p className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-widest">সম্ভাবনা সমূহ (Suggestions):</p>
                            <div className="divide-y divide-gray-100 rounded-xl border border-indigo-50 bg-indigo-50/20 p-2 space-y-1.5">
                              {searchSuggestions.map((candidate) => (
                                <button
                                  key={candidate.id}
                                  type="button"
                                  onClick={() => {
                                    setIndividualSearch(candidate.rollNo);
                                    setFoundStudent(candidate);
                                    setSearchSuggestions([]);
                                  }}
                                  className="w-full font-sans text-left text-xs p-2 hover:bg-white rounded-lg transition-all flex justify-between items-center cursor-pointer group"
                                >
                                  <div className="pr-2 truncate">
                                    <p className="font-bold text-indigo-950 group-hover:text-amber-600 truncate">{candidate.name}</p>
                                    <p className="text-[9px] text-gray-400 font-medium truncate">{candidate.classLevel} • {candidate.school}</p>
                                  </div>
                                  <span className="text-[10px] font-mono text-indigo-900 bg-indigo-100/65 px-2 py-0.5 rounded-md font-bold group-hover:bg-amber-500 group-hover:text-white shrink-0">
                                    {candidate.rollNo}
                                  </span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* General Highlights Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                  <p className="text-xs text-gray-500 font-medium">মোট পরীক্ষার্থী (Registered Pupils)</p>
                  <p className="text-xl font-extrabold text-indigo-950 mt-1">{analytics.total}</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                  <p className="text-xs text-gray-500 font-medium">গড় নম্বর (Average Exam Mark)</p>
                  <p className="text-xl font-extrabold text-indigo-950 mt-1">{analytics.average} / 50</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 text-center shadow-sm">
                  <p className="text-xs text-gray-500 font-medium">মেধা পাশের হার (Success Rate)</p>
                  <p className="text-xl font-extrabold text-emerald-600 mt-1">{analytics.passRate}%</p>
                </div>
              </div>

              {/* Student Success Stories Testimonial Slider */}
              {testimonials.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 border border-indigo-800 shadow-xl relative overflow-hidden mt-6">
                  {/* Decorative background gradients */}
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-3 mb-5 relative z-10 border-b border-indigo-800 pb-4 justify-between">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                      <div>
                        <h4 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-400 font-sans">
                          সফলতার গল্প • Topper Success Stories
                        </h4>
                        <p className="text-[9px] text-indigo-200">Motivating thoughts and quotes from previous high performers</p>
                      </div>
                    </div>
                    {/* Star design decor */}
                    <div className="hidden sm:flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
                    </div>
                  </div>

                  {/* Slider Body with responsive layout */}
                  <div className="relative min-h-[145px] flex flex-col justify-between z-10">
                    <div className="relative">
                      {/* Animated Content for Topper Item */}
                      <div key={currentSlide} className="animate-slide-fade">
                        <div className="space-y-3.5">
                          {/* Quote layout with custom quote icon style */}
                          <div className="flex gap-3 items-start">
                            <Quote className="w-8 h-8 text-amber-400/20 flex-shrink-0 transform rotate-180" />
                            <div className="space-y-2.5">
                              <p className="text-xs sm:text-sm md:text-base font-bold text-amber-100 italic leading-relaxed">
                                "{testimonials[currentSlide].quoteBn}"
                              </p>
                              <p className="text-[11px] sm:text-xs text-indigo-200 leading-relaxed font-sans italic font-medium">
                                "{testimonials[currentSlide].quoteEn}"
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Author info and performance metadata */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-5 border-t border-indigo-800/50 mt-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 p-0.5 shadow-md">
                              <div className="w-full h-full rounded-full bg-indigo-950 flex items-center justify-center font-black text-amber-400 text-xs font-sans">
                                {testimonials[currentSlide].name.split(" ").map(w => w[0]).join("")}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs sm:text-sm text-white">{testimonials[currentSlide].name}</span>
                                <span className="text-[8px] font-black bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase font-sans">
                                  {testimonials[currentSlide].classLevel}
                                </span>
                              </div>
                              <p className="text-[10px] text-indigo-200 mt-0.5 flex items-center gap-1">
                                <School className="w-3.5 h-3.5 text-amber-400" /> {testimonials[currentSlide].school}
                              </p>
                            </div>
                          </div>

                          {/* Performance tag layout */}
                          <div className="flex items-center justify-between sm:justify-end gap-6 sm:mr-24">
                            <div className="text-right bg-indigo-900/40 px-3.5 py-1.5 rounded-xl border border-indigo-800/40">
                              <p className="text-[8px] uppercase tracking-wider text-amber-300 font-extrabold font-sans">Annual Performance</p>
                              <p className="text-[10px] font-black font-sans text-white mt-0.5">
                                Marks: {testimonials[currentSlide].score} <span className="text-[9px] text-amber-400/90">({testimonials[currentSlide].rank})</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Static controls fixed at bottom right of desktop */}
                      <div className="absolute bottom-1.5 right-0 hidden sm:flex items-center gap-1 z-20" id="student-success-manual-controls">
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                          className="w-7.5 h-7.5 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 rounded-lg flex items-center justify-center transition-all cursor-pointer text-white hover:text-amber-400 active:scale-95"
                          title="Previous Testimonial"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                          className="w-7.5 h-7.5 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 rounded-lg flex items-center justify-center transition-all cursor-pointer text-white hover:text-amber-400 active:scale-95"
                          title="Next Testimonial"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Mobile-only visible manual controls to prevent any absolute layout overlapping issues */}
                    <div className="flex sm:hidden items-center justify-center gap-3 mt-4 border-t border-indigo-800/30 pt-3">
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                        className="w-8.5 h-8.5 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 rounded-lg flex items-center justify-center transition-all cursor-pointer text-white hover:text-amber-400 active:scale-95"
                        title="Previous Testimonial"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-[10px] text-indigo-300 font-sans tracking-wider">
                        {currentSlide + 1} / {testimonials.length}
                      </span>
                      <button
                        onClick={() => setCurrentSlide((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))}
                        className="w-8.5 h-8.5 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-700 rounded-lg flex items-center justify-center transition-all cursor-pointer text-white hover:text-amber-400 active:scale-95"
                        title="Next Testimonial"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Small round slider indicators */}
                  <div className="flex justify-center gap-1.5 mt-4 relative z-10">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                          idx === currentSlide ? "bg-amber-400 w-4 shadow" : "bg-indigo-700 hover:bg-indigo-600"
                        }`}
                        title={`Go to testimonial slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}



              {/* Dynamic Prize Winner Showcase (Flexible Merit List) */}
              {results.some(student => student.is_prize_winner === 1 || student.is_prize_winner === true) && (
                <div id="prize-winners-showcase" className="bg-gradient-to-br from-indigo-950 to-indigo-900 text-white rounded-2xl p-6 sm:p-8 border-2 border-amber-500/30 text-left shadow-xl relative overflow-hidden mt-8">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none select-none z-0 decorative-watermark">
                    <Trophy className="w-48 h-48 text-white/5" />
                  </div>
                  <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center rounded-xl font-bold text-xl animate-pulse">
                        🏆
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-black text-amber-400 font-sans tracking-wide">মেধাতালিকা ও পুরস্কার প্রাপকগণ (Merit List & Prize Winners)</h4>
                        <p className="text-[10px] text-gray-300 font-bold">Inspirational young achievers recognized for extreme merit</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8 relative z-10">
                    {(() => {
                      const classesOrder = [
                        "Class I", "Class II", "Class III", "Class IV", "Class V", 
                        "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"
                      ];
                      
                      const prizeWinners = results.filter(
                        student => student.is_prize_winner === 1 || student.is_prize_winner === true
                      );

                      // Group prize winners by class level
                      const grouped: { [key: string]: typeof prizeWinners } = {};
                      prizeWinners.forEach(student => {
                        const lvl = student.classLevel || "Other";
                        if (!grouped[lvl]) grouped[lvl] = [];
                        grouped[lvl].push(student);
                      });

                      // Sort classes based on classesOrder
                      const sortedClasses = Object.keys(grouped).sort((a, b) => {
                        const idxA = classesOrder.indexOf(a);
                        const idxB = classesOrder.indexOf(b);
                        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                        if (idxA === -1) return 1;
                        if (idxB === -1) return -1;
                        return idxA - idxB;
                      });

                      return sortedClasses.map(clsLevel => {
                        // Sort students in this class based on marks descending
                        const classStudents = grouped[clsLevel].sort((a, b) => b.marks - a.marks);

                        return (
                          <div key={clsLevel} className="space-y-3.5">
                            <span className="inline-block px-3 py-1 font-sans font-black text-[10px] uppercase bg-amber-500 text-indigo-950 rounded-md tracking-wider">
                              {clsLevel} (শ্রেণী খণ্ড)
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-sans">
                              {classStudents.map((child, idx) => (
                                <div 
                                  key={child.id} 
                                  className="bg-indigo-900/40 p-4 rounded-xl border border-white/10 hover:border-amber-400/30 hover:bg-indigo-900/60 transition-all shadow-sm"
                                >
                                  <div className="flex justify-between items-start mb-2.5">
                                    <div className="space-y-1 truncate max-w-[70%]">
                                      <p className="text-xs font-bold text-gray-100 truncate">{child.name}</p>
                                      <p className="text-[10px] text-gray-400 truncate">{child.school}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                      <span className="bg-amber-400 text-indigo-950 font-extrabold text-[9px] px-1.5 py-0.5 rounded-full select-none inline-flex items-center gap-1.5">
                                        ⭐ Rank #{child.rank}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center text-[10px] font-mono text-gray-300 pt-2 border-t border-white/5">
                                    <span>রোল: {child.rollNo}</span>
                                    <span className="text-amber-400 font-extrabold">নম্বর: {child.marks}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LEADERBOARDS */}
          {activeTab === "leaderboard" && (
            <div id="results-leaderboards" className="space-y-8 animate-fade-in">
              <div className="text-center max-w-md mx-auto mb-6">
                <h3 className="text-lg font-bold text-indigo-950 font-display">শীর্ষ মেধা তালিকা (Medha Ranks)</h3>
                <p className="text-xs text-gray-550 mt-1 font-semibold leading-relaxed">
                  Classes I through X dynamic champions. Ranks are catalogued according to standard, verified marks and tie breakers on local databases.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {classLevels.map((cls) => {
                  const toppers = getLeaderboardData(cls);
                  return (
                    <div key={cls} className="bg-white rounded-2xl shadow-lg border border-orange-50/70 p-5 space-y-4">
                      <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                        <span className="font-bold text-indigo-950 font-sans text-sm inline-flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-amber-500" /> {cls} Toppers List
                        </span>
                        <span className="text-[10px] font-extrabold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full font-sans uppercase">
                          Highest Score
                        </span>
                      </div>

                      {toppers.length === 0 ? (
                        <p className="text-xs text-gray-400 italic text-center py-6">মেধা তালিকা শীঘ্রই আপলোড করা হবে... Top ranks pending compilation.</p>
                      ) : (
                        <div className="space-y-3">
                          {toppers.map((student) => {
                            const badge = badgeStyles(student.rank);
                            return (
                              <div
                                key={student.id}
                                className="flex items-center justify-between p-3 rounded-xl border hover:shadow-md transition-all border-amber-100/50 hover:border-amber-200"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-300 flex items-center justify-center flex-shrink-0">
                                    {badge.icon || <span className="text-xs font-bold text-amber-600">{student.rank}</span>}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-xs text-indigo-950">{student.name}</h4>
                                    <p className="text-[9px] text-gray-500">{student.school}</p>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <p className="text-xs font-black text-indigo-900">{student.marks} <span className="text-[9px] text-gray-400 font-normal">marks</span></p>
                                  <span className={`inline-block mt-0.5 text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border ${badge.bg}`}>
                                    {badge.label}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TRANSPARENCY LIST (ALL STUDENTS MARKS LIST) */}
          {activeTab === "all" && (
            <div id="transparency-master-list" className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-indigo-950 text-sm font-sans">স্বচ্ছতা ও সত্যতা যাচাই তালিকা (Transparency Board)</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Any teacher, guardian, or student is free to search, audit, and compare student results to ensure high ethical exam conducts.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={searchClass}
                    onChange={(e) => setSearchClass(e.target.value)}
                    className="text-xs px-2.5 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-indigo-950 bg-white font-sans font-semibold cursor-pointer"
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

                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="স্কুল বা নাম খুঁজুন..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 w-44"
                    />
                  </div>
                </div>
              </div>

              {/* Table rendering */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-indigo-950 text-white font-semibold font-sans">
                      <th className="p-3.5 pl-5">Class</th>
                      <th className="p-3.5">Roll No</th>
                      <th className="p-3.5">Student Name</th>
                      <th className="p-3.5">School</th>
                      <th className="p-3.5 text-center">Marks (50)</th>
                      <th className="p-3.5 text-center">Class Rank</th>
                      <th className="p-3.5 pr-5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAllStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-gray-400 italic">No students match your filtered criterion.</td>
                      </tr>
                    ) : (
                      filteredAllStudents.map((student) => {
                        const isMedalCandidate = student.rank <= 3 && student.status === "Passed";
                        return (
                          <tr key={student.id} className="hover:bg-amber-50/20 transition-colors">
                            <td className="p-3 pl-5 font-bold text-indigo-900">{student.classLevel}</td>
                            <td className="p-3 font-mono text-gray-500">{student.rollNo}</td>
                            <td className="p-3 font-bold text-gray-800">{student.name}</td>
                            <td className="p-3 text-gray-600">{student.school}</td>
                            <td className="p-3 text-center font-bold text-gray-900">{student.marks}</td>
                            <td className="p-3 text-center">
                              {student.status === "Absent" ? (
                                <span className="text-gray-300 font-mono">—</span>
                              ) : (
                                <span className={`inline-flex items-center gap-1 font-bold ${isMedalCandidate ? "text-amber-600" : "text-gray-600"}`}>
                                  {isMedalCandidate && <Trophy className="w-3 h-3 text-amber-500" />} #{student.rank}
                                </span>
                              )}
                            </td>
                            <td className="p-3 pr-5 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                student.status === "Passed" ? "bg-emerald-50 text-emerald-800" :
                                student.status === "Absent" ? "bg-gray-50 text-gray-400 font-medium" : "bg-rose-50 text-rose-800"
                              }`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50 text-[10px] text-gray-500">
                School marks are validated by respective invigilators. If there is a dispute regarding rankings or clerical errors, school high command is requested to submit application directly to Medha Anwesha Committee.
              </div>
            </div>
          )}

          {/* Public Dispute & Clerical Feedback Portal (shown beneath checking result board) */}
          {renderFeedbackForm()}

          {/* Real-time paint and annotation Canvas Modal overlay */}
          {showCanvasModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-left">
              <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b pb-3 border-gray-200">
                  <h4 className="font-extrabold text-indigo-950 text-sm font-display">ত্রুটি চিহ্নিতকরণ ক্যানভাস (Highlight Card Error)</h4>
                  <button onClick={() => setShowCanvasModal(false)} className="text-gray-400 hover:text-gray-700 text-xs font-black p-1">Close</button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 font-bold uppercase mb-1">1. Select card image to annotate (ছবি নির্বাচন করুন)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUploaded}
                      className="text-xs text-gray-500 file:mr-4 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>

                  <div className="relative border border-orange-200 rounded-xl overflow-hidden bg-slate-100 flex justify-center items-center h-[320px]">
                    <canvas
                      id="drawing-canvas"
                      onMouseDown={startDraw}
                      onMouseMove={draw}
                      onMouseUp={stopDraw}
                      onMouseLeave={stopDraw}
                      className="bg-white shadow-inner cursor-crosshair border border-gray-200"
                      style={{ touchAction: "none" }}
                    />
                    <span className="absolute bottom-2 left-2 text-[8px] bg-indigo-950/70 text-white px-2 py-0.5 rounded-md uppercase font-sans tracking-wider pointer-events-none">
                      🔴 Pen active: Drag to mark errors
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={clearDrawing}
                      className="px-4 py-2 border rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border-rose-200 cursor-pointer"
                    >
                      ক্যানভাস পরিষ্কার / Reset Canvas
                    </button>
                    <button
                      type="button"
                      onClick={saveDrawing}
                      className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-900 hover:bg-indigo-950 cursor-pointer"
                    >
                      Apply Highlight
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secure anti-spammer Verification OTP popup */}
          {showOtpModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-left">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-3 shadow-2xl border-t-4 border-amber-500">
                <div className="text-center space-y-1">
                  <span className="text-[8px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase block tracking-wider w-max mx-auto">
                    🔒 Verification Required 
                  </span>
                  <h4 className="font-bold text-indigo-950 text-sm">মোবাইল নম্বর যাচাইকরণ (Security Check)</h4>
                  <p className="text-[9px] text-gray-500">আমরা আপনার মোবাইল নম্বরে +91 ({feedbackPhone.slice(-4) || "XXXX"}) একটি সুরক্ষিত ৬-সংখ্যার ওটিপি পাঠিয়েছি। বিবরণ:</p>
                </div>

                <div className="bg-amber-50 p-2 rounded-xl border border-amber-200 text-center text-xs">
                  <span className="text-[8px] uppercase font-bold text-amber-600 block font-display">DEMO SIMULATOR OTP CODE</span>
                  <span className="text-lg font-black text-indigo-950 tracking-widest">{generatedOtp}</span>
                </div>

                <div className="space-y-4 pt-1">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={userInputOtp}
                      onChange={(e) => {
                        setUserInputOtp(e.target.value);
                        setOtpError("");
                      }}
                      className="w-full px-4 py-2 bg-gray-50 border rounded-xl text-center text-lg font-mono font-black tracking-widest focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {otpError && (
                    <p className="text-[9px] text-rose-600 font-bold bg-rose-50 p-2 rounded-lg text-center leading-normal">{otpError}</p>
                  )}

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      type="button"
                      disabled={otpLoading}
                      onClick={() => setShowOtpModal(false)}
                      className="py-2.5 rounded-xl text-xs font-semibold border text-gray-500 hover:bg-gray-50 cursor-pointer"
                    >
                      বাতিল / Cancel
                    </button>
                    <button
                      type="button"
                      disabled={otpLoading}
                      onClick={handleConfirmOtpAndSubmit}
                      className="py-2.5 rounded-xl text-xs font-black text-indigo-950 bg-amber-500 hover:bg-amber-600 transition-all cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                    >
                      {otpLoading && (
                        <svg className="animate-spin h-3.5 w-3.5 text-indigo-950" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      <span>{otpLoading ? "যাচাই হচ্ছে..." : "Confirm Verify"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Draft Portal Modal */}
          {showDraftPortalModal && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-left">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border-t-4 border-amber-500">
                <div className="flex justify-between items-center border-b pb-3 border-gray-200">
                  <h4 className="font-extrabold text-indigo-950 text-sm font-display">খসবড়া ফলাফল যাচাইকরণ (Verification Mode)</h4>
                  <button onClick={() => setShowDraftPortalModal(false)} className="text-gray-400 hover:text-gray-700 text-xs font-black p-1 cursor-pointer">✕</button>
                </div>
                <div className="space-y-3 text-sm text-gray-700">
                  <div className="inline-flex w-12 h-12 bg-amber-500/10 border border-amber-400/30 rounded-full items-center justify-center text-amber-500 mb-1">
                    <EyeOff className="w-6 h-6 text-amber-500" />
                  </div>
                  <p className="font-bold text-gray-900">পরীক্ষার খসড়া ফলাফল বর্তমানে এডমিনদের দ্বারা যাচাই করা হচ্ছে।</p>
                  <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                    The draft marks are currently being compiled and verified by the committee members. Official final rankings, top achievements, and downloadable verified report cards will be released here dynamically as soon as validation concludes.
                  </p>
                </div>
                <button
                  onClick={() => setShowDraftPortalModal(false)}
                  className="w-full py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  ঠিক আছে / Close
                </button>
              </div>
            </div>
          )}

          {/* Maintenance Lock Dialog Modal */}
          {isMaintenanceModalOpen && (
            <div className="fixed inset-0 bg-black/85 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in text-left">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl border-t-8 border-amber-500 relative overflow-hidden">
                {/* Decorative Saffron Background Glow */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex justify-between items-start">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-amber-500/10 border border-amber-400 rounded-2xl flex items-center justify-center text-amber-500 shrink-0">
                      <AlertCircle className="w-6 h-6 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-black text-amber-600 block tracking-widest">System Maintenance Lock</span>
                      <h4 className="font-extrabold text-indigo-950 text-base font-display mt-0.5">ফলাফল সাময়িকভাবে প্রিটেইন্ড / খসড়া মোড</h4>
                    </div>
                  </div>
                  <button onClick={dismissMaintenanceModal} className="text-gray-400 hover:text-gray-700 text-sm font-black p-1 cursor-pointer">✕</button>
                </div>

                <div className="space-y-4 text-xs sm:text-sm text-gray-700 font-sans">
                  <div className="p-4 bg-amber-50/70 border border-amber-200/50 rounded-2xl text-amber-900 leading-relaxed font-bold font-sans">
                    {maintenanceMessage || "ফলাফল তৈরির কাজ চলছে। মেধা অন্বেষা কমিটি কর্তৃক চূড়ান্ত অনুমোদনের পর খুব শীঘ্রই সমস্ত ফলাফল একযোগে এই পোর্টালে প্রকাশ করা হবে। আমাদের সাথে থাকার জন্য ধন্যবাদ।"}
                  </div>
                  <div className="text-[11px] text-gray-500 space-y-1.5 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="font-bold text-gray-700">📌 সম্মানিত অভিভাবকদের জন্য নোটিশ:</p>
                    <p>মেধা অন্বেষা পরীক্ষা কমিটি বর্তমানে খসড়া নম্বর যাচাই করছেন। উত্তরপত্রের শতভাগ স্বচ্ছতা বজায় রেখে ক্রমানুসারে মেধা তালিকা ও স্কুল ভিত্তিক ফলাফল প্রস্তুত করা হচ্ছে। ফলাফল চূড়ান্ত অনুমোদন পাওয়ার সাথে সাথে এই গেটওয়ে দিয়ে আপনার ফলাফল চেক করতে পারবেন।</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={dismissMaintenanceModal}
                    className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer text-center"
                  >
                    বন্ধ করুন / Close
                  </button>
                  <button
                    onClick={() => fetchResults()}
                    className="w-full py-3 bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-[0.98] cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89H18" />
                    </svg>
                    পুনরায় চেক করুন / Re-check Status
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Verified Student Parameter Query Modal */}
          {showVerifiedModal && verifiedStudent && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-left">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border-2 border-amber-500 relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-500 text-indigo-950 font-sans font-black text-[10px] px-3.5 py-1.5 rounded-full uppercase tracking-wider shadow-md border-2 border-white flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current text-indigo-950 animate-spin" />
                  OFFICIALLY VERIFIED CANDIDATE
                </div>
                <div className="flex justify-between items-center border-b pb-3 border-gray-200 pt-3">
                  <h4 className="font-extrabold text-indigo-950 text-sm font-display">ডিজিটাল ভেরিফিকেশন কার্ড</h4>
                  <button onClick={() => setShowVerifiedModal(false)} className="text-gray-400 hover:text-gray-700 text-xs font-black p-1 cursor-pointer">✕</button>
                </div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-indigo-950 to-indigo-900 p-4 rounded-xl text-white space-y-3 border border-amber-500/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-amber-400 font-sans">Name of Candidate</p>
                        <p className="text-base font-black tracking-tight">{verifiedStudent.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-indigo-200 font-sans">Roll Number</p>
                        <p className="text-xs font-extrabold font-mono text-white">{verifiedStudent.rollNo}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs">
                      <div>
                        <p className="text-[9px] text-indigo-200 font-bold uppercase">Class Level</p>
                        <p className="font-extrabold text-white">{verifiedStudent.classLevel}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-indigo-200 font-bold uppercase">Marks Secured</p>
                        <p className="font-extrabold text-amber-400 font-mono text-sm">{verifiedStudent.marks}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10 text-xs">
                      <div>
                        <p className="text-[9px] text-indigo-200 font-bold uppercase">State Rank</p>
                        <p className="font-extrabold text-white flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-amber-500" /> #{verifiedStudent.rank}
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] text-indigo-200 font-bold uppercase">Result Status</p>
                        <p className="font-bold text-emerald-400">{verifiedStudent.status}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border">
                    <div className="flex-shrink-0 bg-white p-1.5 rounded-lg border">
                      <QRCodeSVG
                        value={`${window.location.origin}${window.location.pathname}?verifiedRoll=${verifiedStudent.rollNo}`}
                        size={60}
                        includeMargin={false}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-sans font-extrabold text-indigo-950 uppercase tracking-widest">DIGITAL AUTHENTICATION</p>
                      <p className="text-[9px] text-gray-500 leading-normal">
                        This record is validated from the Medha Anwesha core result database. Scanning the QR code verifies this report is 100% genuine and unaltered.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setCertificateStudent(verifiedStudent);
                      setShowCertificateModal(true);
                      setShowVerifiedModal(false);
                    }}
                    className="py-2.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-indigo-950 shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Printer className="w-3.5 h-3.5" /> Save Certificate
                  </button>
                  <button
                    onClick={() => downloadResultPDF(verifiedStudent)}
                    className="py-2.5 rounded-xl text-xs font-bold bg-indigo-950 hover:bg-indigo-900 text-white shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Certificate Print Preview Modal */}
          {showCertificateModal && certificateStudent && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in text-left">
              <div id="print-certificate-modal" className="bg-white rounded-2xl p-6 max-w-xl w-full space-y-6 shadow-2xl relative">
                <div className="flex justify-between items-center border-b pb-2 border-gray-200 print:hidden">
                  <h4 className="font-extrabold text-indigo-950 text-sm font-display">সম্মাননা সংশাপত্র (Academics Rank Certificate)</h4>
                  <button onClick={() => {
                    setShowCertificateModal(false);
                    setCertificateStudent(null);
                  }} className="text-gray-400 hover:text-gray-700 text-xs font-black p-1 cursor-pointer">✕</button>
                </div>

                {/* Printable Certificate Frame */}
                <div 
                  id="printable-certificate-area" 
                  className="bg-amber-50/15 border-8 border-double border-amber-500/50 p-6 sm:p-10 rounded-xl relative text-center space-y-6 select-none overflow-hidden"
                >
                  {/* Watermark Logo */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                    <GraduationCap className="w-72 h-72 text-indigo-950" />
                  </div>

                  {/* Top Header */}
                  <div className="space-y-1 relative z-10">
                    <p className="text-[10px] sm:text-xs font-sans font-black tracking-widest text-indigo-950 uppercase opacity-90">PINDRUI PURBA PARA MEDHA ANWESHA COMMITTEE</p>
                    <h2 className="text-xl sm:text-2xl font-black text-amber-600 tracking-normal font-display">মেধা অন্বেষা সম্মাননা সংশাপত্র</h2>
                    <div className="w-24 h-0.5 bg-amber-500 mx-auto" />
                  </div>

                  {/* Body Copy */}
                  <div className="space-y-4 relative z-10 text-gray-800">
                    <p className="text-xs font-semibold italic text-gray-500">This is to officially certify that</p>
                    <p className="text-lg sm:text-xl font-bold font-display text-indigo-950 underline decoration-amber-500/50 decoration-2 underline-offset-4">{certificateStudent.name}</p>
                    
                    <p className="text-xs leading-relaxed max-w-md mx-auto">
                      has successfully appeared and achieved outstanding performance in the prestigious <strong>Medha Anwesha Talent Search Examination</strong> from center <strong>Pindrui Purba Para</strong>.
                    </p>

                    {/* Result Matrix */}
                    <div className="grid grid-cols-3 bg-white border border-amber-200/50 rounded-xl p-3 shadow-inner text-center max-w-sm mx-auto text-xs font-semibold divide-x divide-amber-100">
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase font-sans">Class Level</p>
                        <p className="font-extrabold text-indigo-950 mt-0.5">{certificateStudent.classLevel}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase font-sans">Marks Obtained</p>
                        <p className="font-mono text-amber-600 font-black mt-0.5">{certificateStudent.marks}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-gray-400 uppercase font-sans">State Rank</p>
                        <p className="font-extrabold text-indigo-900 mt-0.5 flex items-center justify-center gap-0.5">
                          <Trophy className="w-3 h-3 text-amber-500" /> #{certificateStudent.rank}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Signatures & Physical Signing Zone */}
                  <div className="grid grid-cols-3 items-end gap-4 pt-6 max-w-lg mx-auto border-t border-amber-200/30">
                    {/* Left Box: Signature of Authority */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-36 h-14 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/25 relative" />
                      <span className="text-[8px] font-black text-indigo-950 uppercase tracking-wider text-center">
                        Signature of the Authority
                      </span>
                    </div>
                    
                    {/* Center Box: Authenticity QR Verification */}
                    <div className="flex flex-col items-center justify-center pb-0.5">
                      <div className="p-1 bg-white border border-amber-200 rounded-lg shadow-sm">
                        <QRCodeSVG
                          value={`${window.location.origin}${window.location.pathname}?verifiedRoll=${certificateStudent.rollNo}`}
                          size={46}
                          includeMargin={false}
                        />
                      </div>
                      <span className="text-[7.5px] font-extrabold text-amber-600 uppercase tracking-widest pt-1 text-center animate-pulse">
                        Scan with Phone
                      </span>
                    </div>

                    {/* Right Box: Official Stamp */}
                    <div className="flex flex-col items-center space-y-1">
                      <div className="w-36 h-14 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/25 relative" />
                      <span className="text-[8px] font-black text-indigo-950 uppercase tracking-wider text-center">
                        Official Committee Stamp
                      </span>
                    </div>
                  </div>
                </div>

                {/* Print button controls */}
                <div className="flex justify-end gap-2 pt-2 print:hidden">
                  <button
                    onClick={() => {
                      setShowCertificateModal(false);
                      setCertificateStudent(null);
                    }}
                    className="px-4 py-2 text-xs font-semibold border rounded-xl text-gray-500 hover:bg-gray-50 cursor-pointer animate-pulse"
                  >
                    বন্ধ করুন / Close
                  </button>
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-indigo-950 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Printer className="w-4 h-4 text-indigo-950 animate-bounce" />
                    প্রিন্ট করুন (Print Document)
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

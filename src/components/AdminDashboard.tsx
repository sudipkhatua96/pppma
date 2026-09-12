import { useState, useEffect, Component, ReactNode, ErrorInfo } from "react";
import * as XLSX from "xlsx";
import { Lock, Save, Trash2, Plus, LogOut, CheckCircle, RefreshCw, FileSpreadsheet, Eye, EyeOff, HelpCircle, Edit, Key, Unlock, Star, ShieldAlert, Upload, BarChart3, TrendingUp, Award, FileDown, Image, Activity } from "lucide-react";
import { StudentResult, PortalSettings, NoticeOrArchive } from "../types";
import { DEFAULT_RESULTS, DEFAULT_ARCHIVES } from "../mockData";

class DashboardErrorBoundary extends Component<
  { children: ReactNode }, 
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("DashboardErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div id="dashboard-error-fallback" className="p-8 bg-rose-50 border-2 border-rose-200 rounded-3xl text-left max-w-2xl mx-auto my-8 space-y-4">
          <div className="flex items-center gap-3 text-rose-800">
            <svg className="w-8 h-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h4 className="font-extrabold text-lg">অপ্রত্যাশিত সমস্যা হয়েছে (Dashboard Runtime Safe Fallback)</h4>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-semibold font-sans">
            The sub-module has encountered an unexpected client-side crash. To maintain active control operations, you can securely refresh configurations, retry with the administrator credentials, or toggle another dashboard subsection.
          </p>
          {this.state.error?.message && (
            <pre className="p-3 bg-rose-100/50 rounded-xl text-[11px] font-mono text-rose-900 border border-rose-200 overflow-x-auto whitespace-pre-wrap">
              {this.state.error.message}
            </pre>
          )}
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2 hover:bg-indigo-950 bg-indigo-900 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
          >
            ক্লিয়ার করুন ও পুনরায় চেষ্টা করুন (Dismiss & Retry)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

interface AdminDashboardProps {
  settings: PortalSettings;
  onRefreshSettings: () => void;
  showToast?: (message: string, type?: "success" | "error" | "info") => void;
}

export default function AdminDashboard({ settings, onRefreshSettings, showToast }: AdminDashboardProps) {
  const triggerToast = (msg: string, type: "success" | "error" | "info" = "success") => {
    if (showToast) {
      showToast(msg, type);
    } else {
      alert(msg);
    }
  };

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [fullName, setFullName] = useState("");
  const [userFullName, setUserFullName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [userRole, setUserRole] = useState<'superadmin' | 'subadmin' | 'member' | null>(null);

  // System audit logs for Supreme
  const [systemAuditLogs, setSystemAuditLogs] = useState<any[]>([]);
  const [totalSystemAuditLogs, setTotalSystemAuditLogs] = useState(0);
  const [systemAuditLogsPage, setSystemAuditLogsPage] = useState(0);
  const [systemAuditLogsLoading, setSystemAuditLogsLoading] = useState(false);
  const [logViewTab, setLogViewTab] = useState<"search" | "audit">("search");

  // Overrides security states
  const [showApprovalPrompt, setShowApprovalPrompt] = useState(false);
  const [approvalPasscode, setApprovalPasscode] = useState("");
  const [approvalError, setApprovalError] = useState("");
  const [onApprovedCallback, setOnApprovedCallback] = useState<{ run: (passcode?: string) => void } | null>(null);
  
  // Results management
  const [results, setResults] = useState<StudentResult[]>([]);
  const [editResult, setEditResult] = useState<Partial<StudentResult> | null>(null);
  const [bulkCsv, setBulkCsv] = useState("");
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [importMode, setImportMode] = useState<"upload" | "paste">("upload");
  const [dragActive, setDragActive] = useState(false);

  // Archives notices management
  const [archives, setArchives] = useState<NoticeOrArchive[]>([]);
  const [editArchive, setEditArchive] = useState<Partial<NoticeOrArchive> | null>(null);

  // Parent feedbacks dispute reports & action logging
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [supportTickets, setSupportTickets] = useState<any[]>([]);

  // Settings customizer states
  const [localSettings, setLocalSettings] = useState<PortalSettings | null>(null);
  const [saveStatus, setSaveStatus] = useState("");
  const [reviewClassFilter, setReviewClassFilter] = useState("All");
  const [releasePassword, setReleasePassword] = useState("");
  const [releaseStatus, setReleaseStatus] = useState<{ success: boolean | null; message: string }>({ success: null, message: "" });
  const [releaseLoading, setReleaseLoading] = useState(false);

  const [activeSubTab, setActiveSubTab] = useState<"appearance" | "results" | "archives" | "feedbacks" | "activity_logs" | "media_center" | "download_center" | "support_tickets" | "visitor_logs">("results");
  
  // Visitor search tracking states
  const [visitorLogs, setVisitorLogs] = useState<any[]>([]);
  const [totalVisitorLogs, setTotalVisitorLogs] = useState(0);
  const [todayVisitorCount, setTodayVisitorCount] = useState(0);
  const [visitorLogsPage, setVisitorLogsPage] = useState(0);
  const [visitorLogsLimit] = useState(50);
  const [visitorLogsLoading, setVisitorLogsLoading] = useState(false);
  const [activeLayoutTab, setActiveLayoutTab] = useState<"notice_board" | "exam_planner" | "syllabus" | "media" | "footer">("notice_board");
  const [bannerUrlInput, setBannerUrlInput] = useState("");
  const [pendingBannerPreview, setPendingBannerPreview] = useState<string>("");
  const [pendingLogoPreview, setPendingLogoPreview] = useState<string>("");
  const [showPasscode, setShowPasscode] = useState(false);

  // Keep localSettings synced with settings prop passed down from App
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
      if (settings.heroImageUrl) {
        setBannerUrlInput(settings.heroImageUrl);
      }
    }
  }, [settings]);

  // Eager on-load hydration on initial mount
  useEffect(() => {
    const fetchSettingsOnMount = async () => {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setLocalSettings(data);
        }
      } catch (err) {
        console.warn("Could not fetch remote settings on mount, using props.", err);
      }
    };
    fetchSettingsOnMount();
  }, []);

  // Fetch all listings
  const fetchAllDevData = async (activeToken?: any) => {
    const tokenToUse = typeof activeToken === "string" ? activeToken : passcode;
    const headers = { "x-admin-passcode": tokenToUse };
    try {
      const resultsRes = await fetch("/api/results");
      if (resultsRes.ok) {
        const resultsData = await resultsRes.json();
        setResults(Array.isArray(resultsData) ? resultsData : []);
      } else {
        const saved = localStorage.getItem("medha_custom_results");
        setResults(saved ? JSON.parse(saved) : DEFAULT_RESULTS);
      }

      const archivesRes = await fetch("/api/archives");
      if (archivesRes.ok) {
        const archivesData = await archivesRes.json();
        setArchives(Array.isArray(archivesData) ? archivesData : []);
      } else {
        const saved = localStorage.getItem("medha_custom_archives");
        setArchives(saved ? JSON.parse(saved) : DEFAULT_ARCHIVES);
      }

      const settingsRes = await fetch("/api/settings", { headers });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setLocalSettings(settingsData && typeof settingsData === "object" ? settingsData : null);
      }

      const feedRes = await fetch("/api/feedbacks", { headers });
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        const fArray = Array.isArray(feedData) ? feedData : [];
        setFeedbacks(fArray);
        if (fArray.length > 0 && selectedFeedbackId === null) {
          setSelectedFeedbackId(fArray[0].id);
        }
      } else {
        setFeedbacks([
          { id: 1, studentName: "Sourav Das", rollNo: "MA-2026-501", email: "sourav@example.com", phone: "9876543210", category: "correction", message: "Marks verified successfully by Headmaster.", status: "resolved", createdAt: "2026-09-10" }
        ]);
      }

      const logsRes = await fetch("/api/logs", { headers });
      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setActivityLogs(Array.isArray(logsData) ? logsData : []);
      } else {
        setActivityLogs([
          { id: 1, timestamp: new Date().toISOString(), action: "Admin session initialized", user: "System", details: "Online sync ready" }
        ]);
      }

      const ticketsRes = await fetch("/api/admin/support-tickets", { headers });
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setSupportTickets(Array.isArray(ticketsData) ? ticketsData : []);
      } else {
        setSupportTickets([]);
      }
    } catch (err) {
      console.warn("Using offline fallback data in Admin Dashboard");
      const savedResults = localStorage.getItem("medha_custom_results");
      setResults(savedResults ? JSON.parse(savedResults) : DEFAULT_RESULTS);
      const savedArchives = localStorage.getItem("medha_custom_archives");
      setArchives(savedArchives ? JSON.parse(savedArchives) : DEFAULT_ARCHIVES);
    }
  };

  const fetchVisitorLogs = async (page = 0) => {
    setVisitorLogsLoading(true);
    try {
      const tokenToUse = passcode || sessionStorage.getItem("adminPasscode") || "";
      const headers: any = {
        "x-admin-passcode": tokenToUse,
        "authorization": `Bearer ${tokenToUse}`
      };
      const limit = visitorLogsLimit;
      const offset = page * limit;
      const res = await fetch(`/api/admin/search-logs?limit=${limit}&offset=${offset}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setVisitorLogs(data.logs || []);
          setTotalVisitorLogs(data.totalCount || 0);
          setTodayVisitorCount(data.todayCount || 0);
          setVisitorLogsPage(page);
        }
      }
    } catch (err) {
      console.error("Error fetching visitor logs:", err);
    } finally {
      setVisitorLogsLoading(false);
    }
  };

  const fetchSystemAuditLogs = async (page = 0) => {
    setSystemAuditLogsLoading(true);
    try {
      const tokenToUse = passcode || sessionStorage.getItem("adminPasscode") || "";
      const headers: any = {
        "x-admin-passcode": tokenToUse,
        "authorization": `Bearer ${tokenToUse}`
      };
      const limit = 50;
      const offset = page * limit;
      const res = await fetch(`/api/admin/system-audit-logs?limit=${limit}&offset=${offset}`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSystemAuditLogs(data.logs || []);
          setTotalSystemAuditLogs(data.totalCount || 0);
          setSystemAuditLogsPage(page);
        }
      }
    } catch (err) {
      console.error("Error fetching system audit logs:", err);
    } finally {
      setSystemAuditLogsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllDevData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeSubTab === "visitor_logs") {
      fetchVisitorLogs(0);
      if (userRole === "superadmin") {
        fetchSystemAuditLogs(0);
      }
    }
  }, [isAuthenticated, activeSubTab, userRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setLoginError("আপনার সম্পূর্ণ নাম লিখুন (Please enter your full name).");
      return;
    }
    if (!passcode.trim()) {
      setLoginError("পাসকোড লিখুন (Please enter your passcode).");
      return;
    }
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, fullName })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setUserRole(data.role || "member");
        setUserFullName(data.name || fullName);
        setLoginError("");
        if (data.token) {
          setPasscode(data.token);
          fetchAllDevData(data.token);
        } else {
          fetchAllDevData();
        }
      } else {
        setLoginError(data.message);
      }
    } catch (err) {
      // Offline fallback: check demo passcodes
      const cleanPass = passcode.trim();
      if (cleanPass === "Admin@112345" || cleanPass === "superadmin1") {
        setIsAuthenticated(true);
        setUserRole("superadmin");
        setUserFullName(fullName || "Super Administrator");
        setLoginError("");
        fetchAllDevData("offline-token");
        triggerToast("সুপার-এডমিন লগইন সফল!", "success");
      } else if (cleanPass === "Committee@1" || cleanPass === "comm1") {
        setIsAuthenticated(true);
        setUserRole("subadmin");
        setUserFullName(fullName || "Committee Member");
        setLoginError("");
        fetchAllDevData("offline-token");
        triggerToast("কমিটি সদস্য লগইন সফল!", "success");
      } else if (cleanPass === "Coord@1" || cleanPass === "coord1") {
        setIsAuthenticated(true);
        setUserRole("member");
        setUserFullName(fullName || "Coordinator");
        setLoginError("");
        fetchAllDevData("offline-token");
        triggerToast("কোঅর্ডিনেটর লগইন সফল!", "success");
      } else {
        setLoginError("পাসকোডটি সঠিক নয়। অনুগ্রহ করে পুনরায় চেষ্টা করুন (Invalid Passcode. Please try again).");
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setPasscode("");
    setFullName("");
    setUserFullName("");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "officialLogo" | "developerLogo") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast("Selected image is too large! Maximum limit is 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) return;

      const updatedSettings = {
        ...localSettings,
        [field]: base64Data
      };

      setLocalSettings(updatedSettings as any);

      // Instantly push this specific logo change upstream
      try {
        const res = await fetch("/api/admin/settings/logo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-passcode": passcode
          },
          body: JSON.stringify({
            [field]: base64Data
          })
        });
        const data = await res.json();
        if (data.success) {
          triggerToast("Logo configuration has been saved successfully!", "success");
          onRefreshSettings();
        } else {
          triggerToast(data.message || "Error saving logo config.", "error");
        }
      } catch (err) {
        triggerToast("Server communication failed.", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoDelete = async (field: "officialLogo" | "developerLogo") => {
    if (!confirm("Are you sure you want to remove this logo? This changes public branding instantly.")) return;

    const updatedSettings = {
      ...localSettings,
      [field]: ""
    };

    setLocalSettings(updatedSettings as any);

    try {
      const res = await fetch("/api/admin/settings/logo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify({
          [field]: ""
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("Logo removed successfully from dashboard!", "success");
        onRefreshSettings();
      } else {
        triggerToast(data.message || "Error updating config.", "error");
      }
    } catch (err) {
      triggerToast("Server communication failed.", "error");
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast("Selected banner image is too large! Maximum limit is 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setPendingBannerPreview(base64Data);
        setBannerUrlInput(base64Data);
        triggerToast("ব্যানার ইমেজ প্রিভিউ লোড হয়েছে! সংরক্ষণ করতে নিচের বাটনে চাপুন।", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePendingLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      triggerToast("Selected logo image is too large! Maximum limit is 2MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      if (base64Data) {
        setPendingLogoPreview(base64Data);
        triggerToast("ব্র্যান্ড লোগো প্রিভিউ লোড হয়েছে! সংরক্ষণ করতে নিচের বাটনে চাপুন।", "info");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePendingBanner = async () => {
    const dataToSave = pendingBannerPreview || bannerUrlInput;
    if (!dataToSave) {
      triggerToast("No custom banner image selected or entered.", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/media-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify({
          type: "hero",
          data: dataToSave,
          signature: "SUPERADMIN_MASTER_SIGNATURE_OFFICIAL"
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("হিরো ব্যানার সফলভাবে সংরক্ষিত হয়েছে!", "success");
        setPendingBannerPreview("");
        onRefreshSettings();
      } else {
        triggerToast(data.message || "Error saving banner.", "error");
      }
    } catch (err) {
      triggerToast("Communication failed.", "error");
    }
  };

  const handleSavePendingLogo = async () => {
    if (!pendingLogoPreview) {
      triggerToast("No custom brand logo selected.", "error");
      return;
    }
    try {
      const res = await fetch("/api/admin/media-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify({
          type: "logo",
          data: pendingLogoPreview,
          signature: "SUPERADMIN_MASTER_SIGNATURE_OFFICIAL"
        })
      });
      const data = await res.json();
      if (data.success) {
        triggerToast("ব্র্যান্ড লোগো সফলভাবে সংরক্ষিত হয়েছে!", "success");
        setPendingLogoPreview("");
        onRefreshSettings();
      } else {
        triggerToast(data.message || "Error saving brand logo.", "error");
      }
    } catch (err) {
      triggerToast("Communication failed.", "error");
    }
  };

  const handleSaveBannerUrl = async () => {
    if (!bannerUrlInput.trim()) {
      if (showToast) showToast("Please provide a valid image URL.", "error");
      else alert("Please provide a valid image URL.");
      return;
    }

    const updatedSettings = {
      ...localSettings,
      heroImageUrl: bannerUrlInput
    };
    setLocalSettings(updatedSettings as any);

    try {
      const res = await fetch("/api/admin/settings/banner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify({
          heroImageUrl: bannerUrlInput
        })
      });
      const data = await res.json();
      if (data.success) {
        if (showToast) showToast("Campaign banner image URL configured successfully!", "success");
        else alert("Campaign banner image URL configured successfully!");
        onRefreshSettings();
      } else {
        if (showToast) showToast(data.message || "Error saving banner image URL.", "error");
        else alert(data.message || "Error saving banner image URL.");
      }
    } catch (err) {
      if (showToast) showToast("Server communication failed.", "error");
      else alert("Server communication failed.");
    }
  };

  const handleExportClass = async (classLevel: string) => {
    if (!settings.is_results_live) {
      if (showToast) showToast("Error: Results must be live first before exporting data.", "error");
      else alert("Error: Results must be live first before exporting data.");
      return;
    }

    try {
      const url = `/api/admin/results/export?classLevel=${encodeURIComponent(classLevel)}&passcode=${encodeURIComponent(passcode)}`;
      window.open(url, "_blank");
      if (showToast) showToast(`Successfully compiling Excel report for ${classLevel}! Complete.`, "success");
    } catch (err) {
      if (showToast) showToast("Export initialization failed.", "error");
      else alert("Export initialization failed.");
    }
  };

  // ------------------------------------
  // HIGH-SECURITY GATEKEEPER RELEASE
  // ------------------------------------
  const handleReleaseSubmit = async (e: React.FormEvent, isLiveTarget: boolean) => {
    e.preventDefault();
    if (!releasePassword) {
      setReleaseStatus({ success: false, message: "অনুগ্রহ করে যাচাইকরণ পাসওয়ার্ডটি প্রদান করুন।" });
      return;
    }

    setReleaseLoading(true);
    setReleaseStatus({ success: null, message: "" });

    try {
      const res = await fetch("/api/system/toggle-live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode,
        },
        body: JSON.stringify({
          password: releasePassword,
          isLive: isLiveTarget,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setReleaseStatus({ success: true, message: data.message });
        setReleasePassword("");
        onRefreshSettings(); // refresh state globally
      } else {
        setReleaseStatus({ success: false, message: data.message || "পাসওয়ার্ড সঠিক নয়। দয়া করে পুনরায় চেষ্টা করুন।" });
      }
    } catch (err) {
      console.error("Error triggering high-security release:", err);
      setReleaseStatus({ success: false, message: "সার্ভারে যোগাযোগ করতে সমস্যা হয়েছে।" });
    } finally {
      setReleaseLoading(false);
    }
  };

  // ------------------------------------
  // APPEARANCE & SETTINGS MANAGEMENT
  // ------------------------------------
  const handleSaveSettings = async (e?: React.FormEvent, forceWithPasscode?: string) => {
    if (e) e.preventDefault();
    if (!localSettings) return;

    const activePass = forceWithPasscode || passcode;

    // Client-side block if not Super Admin and permission is false, and no master override provided
    if (userRole === "subadmin" && !localSettings.allowCommitteeModifications && !forceWithPasscode) {
      setApprovalError("");
      setApprovalPasscode("");
      setOnApprovedCallback({ run: (pass?: string) => handleSaveSettings(undefined, pass) });
      setShowApprovalPrompt(true);
      return;
    }

    try {
      setSaveStatus("Saving...");
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-passcode": activePass
        },
        body: JSON.stringify(localSettings)
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus("Settings saved successfully!");
        onRefreshSettings();
        setTimeout(() => setSaveStatus(""), 3500);
      } else if (data.locked) {
        setSaveStatus("");
        setApprovalError("");
        setApprovalPasscode("");
        setOnApprovedCallback({ run: (pass?: string) => handleSaveSettings(undefined, pass) });
        setShowApprovalPrompt(true);
      } else {
        setSaveStatus("Error updating settings.");
      }
    } catch (err) {
      localStorage.setItem("medha_custom_settings", JSON.stringify(localSettings));
      setSaveStatus("Settings saved successfully! (Saved to local configuration)");
      onRefreshSettings();
      setTimeout(() => setSaveStatus(""), 3500);
    }
  };

  // ------------------------------------
  // STUDENT RESULT PORTAL CRUD
  // ------------------------------------
  const handleSaveManualResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResult) return;

    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify(editResult)
      });
      const data = await res.json();
      if (res.status === 400 || data.error) {
        triggerToast(data.error || "Error adding result.", "error");
      } else if (data.success) {
        setResults(data.results);
        setEditResult(null);
        triggerToast("Result added/updated successfully! Class ranks were auto compiled.", "success");
      }
    } catch (err) {
      // Local fallback for static demo mode
      const updated = editResult.id 
        ? results.map(r => r.id === editResult.id ? { ...r, ...editResult } as StudentResult : r)
        : [...results, { ...editResult, id: "res-" + Date.now() } as StudentResult];
      const sorted = [...updated].sort((a, b) => (Number(b.marks) || 0) - (Number(a.marks) || 0));
      setResults(sorted);
      localStorage.setItem("medha_custom_results", JSON.stringify(sorted));
      setEditResult(null);
      triggerToast("Result added/updated successfully! (Saved locally)", "success");
    }
  };

  const handleDeleteResult = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete result for ${name}?`)) return;
    try {
      const res = await fetch(`/api/results/${id}`, { 
        method: "DELETE",
        headers: {
          "x-admin-passcode": passcode
        }
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        triggerToast(`Permanently deleted result record for ${name}`, "success");
      }
    } catch (err) {
      const filtered = results.filter(r => r.id !== id);
      setResults(filtered);
      localStorage.setItem("medha_custom_results", JSON.stringify(filtered));
      triggerToast(`Permanently deleted result record for ${name} (Local)`, "success");
    }
  };

  const handleTogglePrize = async (studentId: string) => {
    try {
      const res = await fetch("/api/admin/results/toggle-prize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify({ id: studentId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setResults(data.results);
        triggerToast("Prize winner status updated successfully!", "success");
      } else {
        triggerToast(data.message || "Failed to toggle prize status.", "error");
      }
    } catch (err) {
      const updated = results.map(r => r.id === studentId ? { ...r, isPrizeWinner: !r.isPrizeWinner } : r);
      setResults(updated);
      localStorage.setItem("medha_custom_results", JSON.stringify(updated));
      triggerToast("Prize winner status updated! (Local)", "success");
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/support-tickets/${ticketId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
        triggerToast(`Status modified to ${newStatus} for support ticket #${ticketId}`, "success");
      } else {
        triggerToast(data.message || "Failed to update ticket status.", "error");
      }
    } catch (err) {
      setSupportTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus } : t));
      triggerToast(`Status updated to ${newStatus} (Local)`, "success");
    }
  };

  // Dynamic CSV formatting and bulk insert
  const handleBulkCsvInsert = async (replaceExis: boolean) => {
    if (!bulkCsv.trim()) {
      triggerToast("Please paste some CSV rows first!", "info");
      return;
    }
    
    try {
      const res = await fetch("/api/results", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify({ csv: bulkCsv, replace: replaceExis })
      });
      const data = await res.json();
      if (res.status === 400 || !data.success) {
        triggerToast(data.error || data.message || "Invalid CSV format. Please use the official sample template.", "error");
      } else if (data.success) {
        setResults(data.results);
        setBulkCsv("");
        triggerToast("Success! Parsed and loaded all csv metrics. Class rankings updated.", "success");
      }
    } catch (err) {
      triggerToast("Error uploading data.", "error");
    }
  };

  // spreadsheet file parser & drag events handlers
  const handleFileUpload = async (file: File, replaceExis: boolean = false) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const rawArrayBuffer = e.target?.result as ArrayBuffer;
        if (!rawArrayBuffer) {
          alert("Error: file empty or unreadable.");
          return;
        }

        const dataBytes = new Uint8Array(rawArrayBuffer);
        const workbook = XLSX.read(dataBytes, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        
        // Convert the excel/csv sheet directly to standard CSV format
        const csvContent = XLSX.utils.sheet_to_csv(sheet);
        
        if (!csvContent || csvContent.trim().length === 0) {
          alert("Parsed spreadsheet contains no values. Please check format.");
          return;
        }

        try {
          const res = await fetch("/api/results", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-admin-passcode": passcode
            },
            body: JSON.stringify({ csv: csvContent, replace: replaceExis })
          });
          const apiRes = await res.json();
          if (res.status === 400 || !apiRes.success) {
            triggerToast(apiRes.error || apiRes.message || "Invalid CSV format. Please use the official sample template.", "error");
          } else if (apiRes.success) {
            setResults(apiRes.results);
            triggerToast(`Spreadsheet imported successfully! Active records database updated with parsed metrics.`, "success");
          }
        } catch (err) {
          triggerToast("Connecting to results database API was refused.", "error");
        }
      } catch (err) {
        triggerToast("Failed to parse document spreadsheet. Make sure file format matches .csv, .xlsx, or .xls", "error");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, replaceExis: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const validTypes = [".xlsx", ".xls", ".csv"];
      const matchesType = validTypes.some(t => file.name.toLowerCase().endsWith(t));
      if (!matchesType) {
        alert("Invalid file type: please pull a .csv, .xlsx, or .xls file.");
        return;
      }
      handleFileUpload(file, replaceExis);
    }
  };

  // ------------------------------------
  // QUESTION ARCHIVES AND NOTICES CRUD
  // ------------------------------------
  const handleSaveArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editArchive) return;

    try {
      const res = await fetch("/api/archives", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-admin-passcode": passcode
        },
        body: JSON.stringify(editArchive)
      });
      const data = await res.json();
      if (data.success) {
        setArchives(data.archives);
        setEditArchive(null);
        triggerToast("Notice or Past paper committed safely.", "success");
      }
    } catch (err) {
      const updated = editArchive.id 
        ? archives.map(a => a.id === editArchive.id ? { ...a, ...editArchive } as NoticeOrArchive : a)
        : [...archives, { ...editArchive, id: "arch-" + Date.now(), downloadCount: 0 } as NoticeOrArchive];
      setArchives(updated);
      localStorage.setItem("medha_custom_archives", JSON.stringify(updated));
      setEditArchive(null);
      triggerToast("Notice or Past paper committed safely. (Saved locally)", "success");
    }
  };

  const handleDeleteArchive = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to wipe "${title}" from notifications archive?`)) return;
    try {
      const res = await fetch(`/api/archives/${id}`, { 
        method: "DELETE",
        headers: {
          "x-admin-passcode": passcode
        }
      });
      const data = await res.json();
      if (data.success) {
        setArchives(data.archives);
        triggerToast(`Removed "${title}" from archive`, "success");
      }
    } catch (err) {
      const filtered = archives.filter(a => a.id !== id);
      setArchives(filtered);
      localStorage.setItem("medha_custom_archives", JSON.stringify(filtered));
      triggerToast(`Removed "${title}" (Local)`, "success");
    }
  };

  // UI rendering login panel
  if (!isAuthenticated) {
    return (
      <div id="admin-login-screen" className="max-w-md mx-auto my-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-100 flex flex-col justify-center items-center">
          <div className="w-12 h-12 bg-amber-500/10 border border-amber-300 rounded-full flex items-center justify-center mb-4 text-amber-600">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          
          <h3 className="text-lg font-bold text-indigo-950 font-display text-center mb-1">কমিটি এডমিন প্যানেল</h3>
          <p className="text-xs text-gray-400 text-center mb-6">Enter official passcode to modify exam metrics, colors, backgrounds & results.</p>
          
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div>
              <label className="block text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1.5">আপনার সম্পূর্ণ নাম লিখুন (Enter Full Name)</label>
              <input
                type="text"
                placeholder="সম্পূর্ণ নাম লিখুন (e.g. Medha Operator)"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 bg-white rounded-xl border-2 border-gray-300 focus:border-amber-500 focus:outline-none text-left text-sm text-[#0F172A] font-bold placeholder:text-gray-400 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1.5">Official Passcode</label>
              <div className="relative">
                <input
                  type={showPasscode ? "text" : "password"}
                  placeholder="মাস্টার পাসকোড লিখুন..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 bg-white rounded-xl border-2 border-gray-300 focus:border-amber-500 focus:outline-none font-mono text-center text-lg text-[#0F172A] font-black placeholder:text-gray-400 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#0F172A] transition-colors focus:outline-none cursor-pointer"
                  title={showPasscode ? "Hide Passcode" : "Show Passcode"}
                >
                  {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <p className="text-[10px] text-rose-600 bg-rose-50 p-2.5 rounded-lg text-center font-bold">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-xs font-bold text-indigo-950 bg-amber-500 hover:bg-amber-600 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              প্রবেশ করুন / Authenticate Admin
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Real-time calculated dashboard statistics cards (Total Registered Pupils, Average Exam Mark, and Success Rate)
  const safeResults = Array.isArray(results) ? results : [];
  const totalPupils = safeResults.length;
  const sumMarks = safeResults.reduce((sum, s) => sum + (Number(s.marks) || 0), 0);
  const averageMark = totalPupils > 0 ? (sumMarks / totalPupils).toFixed(2) : "0.00";
  const passingCount = safeResults.filter(s => s && s.status === "Passed").length;
  const successRate = totalPupils > 0 ? ((passingCount / totalPupils) * 100).toFixed(2) : "0.00";

  // Dynamically calculate quality assurance stats for review
  const filteredReviewResults = reviewClassFilter === "All" 
    ? safeResults 
    : safeResults.filter(r => r && r.classLevel === reviewClassFilter);

  const reviewCount = filteredReviewResults.length;
  const totalScoresArray = filteredReviewResults.map(r => r ? (Number(r.marks) || 0) : 0);
  const maxScore = totalScoresArray.length ? Math.max(...totalScoresArray) : 0;
  const minScore = totalScoresArray.length ? Math.min(...totalScoresArray) : 0;
  const avgClassScore = totalScoresArray.length 
    ? Math.round(totalScoresArray.reduce((sum, s) => sum + s, 0) / totalScoresArray.length) 
    : 0;

  return (
    <DashboardErrorBoundary>
      <div id="admin-active-dashboard" className="w-full space-y-8 animate-fade-in">
      
      {/* Header action panel */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-indigo-950 text-white p-5 rounded-2xl shadow-md">
        <div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-amber-400">Medha Anwesha Administration Control</span>
          <h3 className="text-base font-black font-display flex items-center gap-2 flex-wrap">
            <span>Ultimate Dashboard</span>
            {userRole === "superadmin" ? (
              <span className="text-[9px] uppercase font-black bg-emerald-500 text-white px-2 py-1 rounded-full shadow-sm animate-pulse">
                🎖️ Supreme / সুপ্রিম
              </span>
            ) : userRole === "subadmin" ? (
              <span className="text-[9px] uppercase font-black bg-amber-500 text-indigo-950 px-2 py-1 rounded-full shadow-sm">
                👥 Sub-Admin / সাব-অ্যাডমিন
              </span>
            ) : (
              <span className="text-[9px] uppercase font-black bg-indigo-500 text-white px-2 py-1 rounded-full shadow-sm animate-bounce">
                ✍️ Member / মেম্বার
              </span>
            )}
            {userFullName && (
              <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-lg">
                ব্যবহারকারী: {userFullName}
              </span>
            )}
          </h3>
        </div>
        
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl text-xs bg-red-600 hover:bg-red-700 bg-rose-600 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-white" />
          <span>প্রস্থান / Logout</span>
        </button>
      </div>

      {/* Sub menu controls */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-3">
        {userRole !== "member" && (
          <button
            onClick={() => {
              setActiveSubTab("appearance");
            }}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "appearance" ? "bg-amber-500 text-indigo-950 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>🎨 Website CMS / ওয়েবসাইট সিএমএস</span>
          </button>
        )}
        {userRole === "superadmin" && (
          <button
            onClick={() => setActiveSubTab("media_center")}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "media_center" ? "bg-amber-500 text-indigo-950 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            <span>🖼️ Media Center</span>
          </button>
        )}
        <button
          onClick={() => setActiveSubTab("results")}
          className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
            activeSubTab === "results" ? "bg-amber-500 text-indigo-950 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <span>1. Marks & Student Result Manager ({results.length})</span>
        </button>
        {userRole !== "member" && (
          <button
            onClick={() => setActiveSubTab("archives")}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === "archives" ? "bg-amber-500 text-indigo-950 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>2. Question/Archive Manager</span>
          </button>
        )}
        {/* Feedback and Helpline subtabs deleted successfully */}
        {settings?.is_results_live && (
          <button
            onClick={() => setActiveSubTab("download_center")}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "download_center" ? "bg-amber-500 text-indigo-950 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>📥 Download Center</span>
          </button>
        )}
        {userRole === "superadmin" && (
          <button
            onClick={() => setActiveSubTab("activity_logs")}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeSubTab === "activity_logs" ? "bg-amber-500 text-indigo-950 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span>🛡️ Super Audit Trailling Logs ({activityLogs.length})</span>
          </button>
        )}
        {userRole === "superadmin" && (
          <button
            onClick={() => setActiveSubTab("visitor_logs")}
            className={`px-4.5 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === "visitor_logs" ? "bg-amber-500 text-indigo-950 shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>📊 Visitor Insights & Search Logs / ইউজার ট্র্যাকিং</span>
          </button>
        )}
      </div>

      {/* -------------------------------------------
          SUB-TAB 1: LIVE THEME STYLE CUSTOMIZER
          ------------------------------------------- */}
      {activeSubTab === "appearance" && localSettings && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
          <div className="border-b pb-4 border-gray-100">
            <h4 className="font-bold text-sm text-indigo-950">ওয়েবসাইট সিএমএস কন্ট্রোল ডেক্স (Website CMS Control Desk)</h4>
            <p className="text-[11px] text-gray-400 mt-0.5">Dynamically edit and update notice boards, exam schedules, syllabus guidelines, and brand design assets instantly.</p>
          </div>

          {/* Permission-Based Master Switch */}
          <div className={`p-4 rounded-2xl border transition-all ${
            localSettings.allowCommitteeModifications 
              ? "bg-emerald-50/70 border-emerald-200" 
              : "bg-amber-50/70 border-amber-200"
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full ${
                  localSettings.allowCommitteeModifications 
                    ? "bg-emerald-200 text-emerald-800" 
                    : "bg-amber-200 text-amber-800"
                }`}>
                  {localSettings.allowCommitteeModifications ? "🔓 Fully Unlocked" : "🔒 Restricted Access"}
                </span>
                <h5 className="font-extrabold text-xs text-indigo-950 mt-1.5 flex items-center gap-1.5">
                  Allow Committee Modifications Switch
                </h5>
                <p className="text-[10.5px] text-gray-500 mt-1 leading-relaxed">
                  When enabled, standard committee members using the shared passcode can modify the website slogans, branding, colors, and login credentials. When disabled, these operations are strictly locked for them.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {userRole === "superadmin" ? (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = !localSettings.allowCommitteeModifications;
                      setLocalSettings({ ...localSettings, allowCommitteeModifications: updated });
                      // Instantly save this single switch to database!
                      setTimeout(() => {
                        const newSettings = { ...localSettings, allowCommitteeModifications: updated };
                        fetch("/api/settings", {
                          method: "POST",
                          headers: { 
                            "Content-Type": "application/json",
                            "x-admin-passcode": passcode
                          },
                          body: JSON.stringify(newSettings)
                        }).then(res => res.json()).then(data => {
                          if (data.success) {
                            onRefreshSettings();
                            setSaveStatus("Modifications permission updated!");
                            setTimeout(() => setSaveStatus(""), 3000);
                          }
                        });
                      }, 50);
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      localSettings.allowCommitteeModifications ? "bg-emerald-600" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        localSettings.allowCommitteeModifications ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalError("");
                      setApprovalPasscode("");
                      setOnApprovedCallback({
                        run: (pass?: string) => {
                          const updated = true;
                          setLocalSettings({ ...localSettings, allowCommitteeModifications: updated });
                          setTimeout(() => {
                            fetch("/api/settings", {
                              method: "POST",
                              headers: { 
                                "Content-Type": "application/json",
                                "x-admin-passcode": pass || passcode
                              },
                              body: JSON.stringify({ ...localSettings, allowCommitteeModifications: updated })
                            }).then(res => res.json()).then(data => {
                              if (data.success) {
                                onRefreshSettings();
                                alert("Modifications switch toggled ON by Super Admin!");
                              }
                            });
                          }, 50);
                        }
                      });
                      setShowApprovalPrompt(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-950 hover:bg-indigo-900 text-white font-extrabold text-[11px] rounded-xl shadow-md transition-all active:scale-95"
                  >
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span>Unlock with Super Admin Key</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div className="flex border-b border-gray-200 gap-4 pt-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveLayoutTab("notice_board")}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeLayoutTab === "notice_board" 
                  ? "border-amber-500 text-indigo-950 font-black" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>📢 Notice Board Desk / নোটিশ বোর্ড</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayoutTab("exam_planner")}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeLayoutTab === "exam_planner" 
                  ? "border-amber-500 text-indigo-950 font-black" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>📅 Exam Planner / परीक्षा सूचि</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveLayoutTab("syllabus")}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeLayoutTab === "syllabus" 
                  ? "border-amber-500 text-indigo-950 font-black" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              <span>📚 Syllabus Manager / সিলেবাস ও গাইড</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (userRole !== "superadmin") {
                  setApprovalError("");
                  setApprovalPasscode("");
                  setOnApprovedCallback({
                    run: () => {
                      setUserRole("superadmin");
                      setActiveLayoutTab("media");
                    }
                  });
                  setShowApprovalPrompt(true);
                } else {
                  setActiveLayoutTab("media");
                }
              }}
              className={`pb-2.5 text-xs font-extrabold transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeLayoutTab === "media" 
                  ? "border-amber-500 text-indigo-950 font-black" 
                  : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              {userRole !== "superadmin" && <Lock className="w-3 h-3 text-amber-500 shrink-0" />}
              <span>🎨 Media & Themes / মিডিয়া</span>
            </button>
          </div>

          {/* 1. notice_board TAB */}
          {activeLayoutTab === "notice_board" && (
            <div className="relative min-h-[300px]">
              {userRole === "subadmin" && !localSettings.allowCommitteeModifications && (
                <div className="absolute inset-x-0 -inset-y-4 bg-white/75 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-amber-200">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm animate-pulse">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-indigo-950 uppercase tracking-wider">
                    Content Management Locked
                  </h4>
                  <p className="text-xs text-gray-550 max-w-sm mt-2 leading-relaxed">
                    Website announcement configurations require Super Admin authorization. Ask your Super Admin or click below to authorize.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalError("");
                      setApprovalPasscode("");
                      setOnApprovedCallback({
                        run: () => {
                          setUserRole("superadmin");
                        }
                      });
                      setShowApprovalPrompt(true);
                    }}
                    className="mt-5 px-5 py-3 bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-extrabold text-[11px] rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Authorize with Super Admin Key</span>
                  </button>
                </div>
              )}

              <div className={`space-y-6 ${userRole === "subadmin" && !localSettings.allowCommitteeModifications ? "pointer-events-none opacity-20 select-none" : ""}`}>
                <div className="bg-indigo-50/50 p-4.5 rounded-2xl border border-indigo-100 flex items-start gap-3">
                  <Unlock className="w-5 h-5 text-indigo-900 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <h5 className="font-bold text-xs text-indigo-950">নোটিশ বোর্ড ডেক্স (Notice Board Desk)</h5>
                    <p className="text-[10.5px] text-gray-550 leading-relaxed">
                      Publish moving tickers and bulleted lines of updates shown over the live public homepage. Use separate lines for neat custom Bullet Points.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-950 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <span>• স্ক্রোলিং নোটিশের শিরোনাম / ব্যাজ (Scrolling Ticker Badge/Label)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 bg-white focus:bg-white rounded-lg text-gray-800 font-sans"
                      value={localSettings.scrolling_ticker_label || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, scrolling_ticker_label: e.target.value })}
                      placeholder="e.g. সরাসরি খবর / LATEST NEWS"
                    />
                    <span className="text-[9px] text-gray-400 mt-1 block">The text on the colored left badge (e.g. "সরাসরি খবর / LATEST NEWS").</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-indigo-950 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <span>• স্ক্রোলিং নোটিশ ঘোষণা (Public Scrolling Announcement Ticker)</span>
                    </label>
                    <textarea
                      value={localSettings.scrolling_ticker || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, scrolling_ticker: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 bg-white focus:bg-white rounded-lg text-gray-800 font-sans h-16 leading-relaxed"
                      placeholder="e.g. মেধা অন্বেষা ২০২৬ পরীক্ষার ফলাফল প্রকাশিত হয়েছে! উত্তীর্ণদের অভিনন্দন।"
                    />
                    <span className="text-[9px] text-gray-400 mt-1 block">Displays inside the moving banner on the top edge of the homepage.</span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-indigo-950 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <span>• প্রধান নোটিশ বোর্ড টেক্সট (Notice Board Central Announcements Block)</span>
                    </label>
                    <textarea
                      value={localSettings.notice_board_text || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, notice_board_text: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 bg-white focus:bg-white rounded-lg text-gray-800 font-sans h-44 leading-relaxed"
                      placeholder="১. মেধা অন্বেষা ২০২৬ পরীক্ষার ফলাফল প্রকাশিত হয়েছে।&#10;২. সার্টিফিকেট ডাউনলোড সচল করা হয়েছে।"
                    />
                    <span className="text-[9px] text-gray-400 mt-1 block">Displays on the core public bulletin board. separate list items using new lines.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. exam_planner TAB */}
          {activeLayoutTab === "exam_planner" && (
            <div className="relative min-h-[300px]">
              {userRole === "subadmin" && !localSettings.allowCommitteeModifications && (
                <div className="absolute inset-x-0 -inset-y-4 bg-white/75 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-amber-200">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm animate-pulse">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-indigo-950 uppercase tracking-wider">
                    Content Management Locked
                  </h4>
                  <p className="text-xs text-gray-550 max-w-sm mt-2 leading-relaxed">
                    Website content configurations require Super Admin authorization. Ask your Super Admin or click below to authorize.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalError("");
                      setApprovalPasscode("");
                      setOnApprovedCallback({
                        run: () => {
                          setUserRole("superadmin");
                        }
                      });
                      setShowApprovalPrompt(true);
                    }}
                    className="mt-5 px-5 py-3 bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-extrabold text-[11px] rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Authorize with Super Admin Key</span>
                  </button>
                </div>
              )}

              <div className={`space-y-6 ${userRole === "subadmin" && !localSettings.allowCommitteeModifications ? "pointer-events-none opacity-20 select-none" : ""}`}>
                <div className="bg-amber-50/50 p-4.5 rounded-2xl border border-amber-200 flex items-start gap-3">
                  <Unlock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <h5 className="font-bold text-xs text-indigo-950">পরীক্ষা সূচি সূচক (Exam Planner Desk)</h5>
                    <p className="text-[10.5px] text-gray-550 leading-relaxed">
                      Represent schedules, timing metrics, banner announcements and search help text directly on the visual front-end portal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">হিরো ব্যানার হেডিং (Hero Banner Heading Message)</label>
                      <input
                        type="text"
                        value={localSettings.heroHeading || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, heroHeading: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800"
                        placeholder="e.g. মেধা অন্বেষা ২০২৬"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">পরবর্তী পরীক্ষার তারিখ (Next Scheduled Exam Date)</label>
                      <input
                        type="text"
                        value={localSettings.examDate || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, examDate: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800"
                        placeholder="Sunday, November 29, 2026"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">হিরো ব্যানার সাবটাইটেল স্লোগান (Hero Banner Slogan)</label>
                      <textarea
                        value={localSettings.heroSubtitle || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 h-16"
                        placeholder="Type standard motive statements here..."
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">সার্চ পোর্টাল সহায়তা বার্তা (Search Portal Help Text / Example)</label>
                      <textarea
                        value={localSettings.searchHelpText || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, searchHelpText: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 h-16"
                        placeholder="পরীক্ষার্থীর নাম অথবা রোল নম্বর (যেমন: MA-2026-601) দিয়ে ফলাফল অনুসন্ধান করুন।"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. syllabus TAB */}
          {activeLayoutTab === "syllabus" && (
            <div className="relative min-h-[300px]">
              {userRole === "subadmin" && !localSettings.allowCommitteeModifications && (
                <div className="absolute inset-x-0 -inset-y-4 bg-white/75 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-amber-200">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm animate-pulse">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-indigo-950 uppercase tracking-wider">
                    Content Management Locked
                  </h4>
                  <p className="text-xs text-gray-550 max-w-sm mt-2 leading-relaxed">
                    Website syllabus configurations require Super Admin authorization. Ask your Super Admin or click below to authorize.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalError("");
                      setApprovalPasscode("");
                      setOnApprovedCallback({
                        run: () => {
                          setUserRole("superadmin");
                        }
                      });
                      setShowApprovalPrompt(true);
                    }}
                    className="mt-5 px-5 py-3 bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-extrabold text-[11px] rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Authorize with Super Admin Key</span>
                  </button>
                </div>
              )}

              <div className={`space-y-6 ${userRole === "subadmin" && !localSettings.allowCommitteeModifications ? "pointer-events-none opacity-20 select-none" : ""}`}>
                <div className="bg-indigo-50/50 p-4.5 rounded-2xl border border-indigo-100 flex items-start gap-3">
                  <Unlock className="w-5 h-5 text-indigo-900 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-left">
                    <h5 className="font-bold text-xs text-indigo-950">সিলেবাস ও গাইডলিস্ট ম্যানেজার (Syllabus & Guide Manager)</h5>
                    <p className="text-[10.5px] text-gray-550 leading-relaxed">
                      Update classroom targets, marks distribution breakdowns, and associate an anchor download document (Syllabus Guidelines PDF etc.) easily.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold text-indigo-950 uppercase tracking-wide mb-1">সিলেবাস বিবরণী ও চ্যাপ্টার লিস্ট (Active Syllabus Descriptive Details)</label>
                    <textarea
                      value={localSettings.syllabusDetails || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, syllabusDetails: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs border border-gray-200 bg-white focus:bg-white rounded-lg text-gray-800 font-sans h-28 leading-relaxed"
                      placeholder="Define classes curriculum targets, subjects etc..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-indigo-950 uppercase tracking-wide mb-1">সিলেবাস পিডিএফ ডাউনলোড লিংক (Download PDF Anchor Asset URL)</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono"
                      value={localSettings.syllabusFileUrl || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, syllabusFileUrl: e.target.value })}
                      placeholder="e.g. /files/Syllabus_Bilingual_2026.pdf"
                    />
                    <p className="text-[9.5px] text-gray-400 mt-1">
                      A "Download Syllabus PDF" button will render dynamically on the home screen when this path is configured!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. media TAB */}
          {activeLayoutTab === "media" && (
            <div className="relative min-h-[300px]">
              {userRole !== "superadmin" && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[6px] z-10 flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-amber-200">
                  <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-sm animate-pulse">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-indigo-950 uppercase tracking-wider">
                    Media & Themes Locked
                  </h4>
                  <p className="text-xs text-gray-550 max-w-sm mt-2 leading-relaxed">
                    Theme parameters, colors, high-resolution branding logo configurations, and hero banner uploads are restricted to Super Admin authentications.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setApprovalError("");
                      setApprovalPasscode("");
                      setOnApprovedCallback({
                        run: () => {
                          setUserRole("superadmin");
                          setActiveLayoutTab("media");
                        }
                      });
                      setShowApprovalPrompt(true);
                    }}
                    className="mt-5 px-5 py-3 bg-indigo-950 hover:bg-indigo-900 text-amber-400 font-extrabold text-[11px] rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                  >
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Authorize with Super Admin Key</span>
                  </button>
                </div>
              )}

              <div className="bg-indigo-50/40 p-4.5 rounded-xl border border-indigo-100 flex items-start gap-3 mb-6">
                <Unlock className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-left">
                  <h5 className="font-bold text-xs text-indigo-950">লোগো, মিডিয়া ও থিম কাস্টমাইজেশন কেন্দ্র (Logos, Media & Themes)</h5>
                  <p className="text-[10.5px] text-gray-550 leading-relaxed">
                    Configure styles, primary color hex codes, background slide carousels, and upload official logos alongside your hero banner uploader.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Visual Settings Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">পোর্টালে প্রদর্শিত নাম (Portal Official Name)</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800"
                      value={localSettings.websiteName || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, websiteName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">হেডার ব্র্যান্ড ব্র্যান্ড টেক্সট (Header Brand/Logo Text)</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-bold"
                      value={localSettings.logoText || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, logoText: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Primary theme Color Code</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          className="w-8 h-8 border border-gray-200 rounded cursor-pointer shrink-0"
                          value={localSettings.primaryColor || "#1a1464"}
                          onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 px-1.5 py-1 text-[11px] border border-gray-200 rounded font-mono"
                          value={localSettings.primaryColor || "#1a1464"}
                          onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Accent gold Color Code</label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          className="w-8 h-8 border border-gray-200 rounded cursor-pointer shrink-0"
                          value={localSettings.accentColor || "#f5a623"}
                          onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 px-1.5 py-1 text-[11px] border border-gray-200 rounded font-mono"
                          value={localSettings.accentColor || "#f5a623"}
                          onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">পছন্দসই ফন্ট ও থিম স্টাইল (Typography & Theme Pairing)</label>
                    <select
                      value={localSettings.themeStyle || "traditional"}
                      onChange={(e: any) => setLocalSettings({ ...localSettings, themeStyle: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-700 bg-white cursor-pointer font-sans"
                    >
                      <option value="traditional">Traditional Bengali (Serif Pairings)</option>
                      <option value="modern">Modern Professional (Outfit & Inter)</option>
                      <option value="academic">Academic Prestige (Space Grotesk & Bold)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-red-600 uppercase tracking-wide mb-1">অফিসিয়াল পাসকোড পরিবর্তন (Modify Standard/Committee Passcode)</label>
                    <input
                      type="password"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono"
                      value={localSettings.adminPasscode || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, adminPasscode: e.target.value })}
                    />
                  </div>
                </div>

                {/* Slideshow & Custom Video Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">ঘূর্ণায়মান স্লাইডশো ইমেজ লিংকসমূহ (Comma-Separated Slideshow Images)</label>
                    <textarea
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono h-16 leading-slate"
                      value={localSettings.bgSlideshowUrls?.join(", ") || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, bgSlideshowUrls: e.target.value.split(",").map(url => url.trim()) })}
                    />
                  </div>

                  {/* Video settings */}
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 space-y-2">
                    <span className="text-[9px] uppercase font-black text-amber-800 flex items-center gap-1">🎥 looping Video Background</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="useVideoBg"
                        checked={localSettings.useVideoBg || false}
                        onChange={(e) => setLocalSettings({ ...localSettings, useVideoBg: e.target.checked })}
                        className="w-3.5 h-3.5 text-indigo-900 border-gray-300 rounded"
                      />
                      <label htmlFor="useVideoBg" className="text-[11px] font-bold text-gray-700 cursor-pointer">Activate looping ambient layout video</label>
                    </div>
                    <div>
                      <input
                        type="text"
                        className="w-full px-2 py-1.5 text-[10px] border border-gray-200 bg-white rounded font-mono"
                        value={localSettings.bgVideoUrl || ""}
                        onChange={(e) => setLocalSettings({ ...localSettings, bgVideoUrl: e.target.value })}
                        placeholder="MP4 Video Link URL"
                      />
                    </div>
                  </div>

                  {/* Direct Banner Image Link */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">ব্যানার ডিরেক্ট ইমেজ URL (Hero Image URL)</label>
                    <input
                      type="text"
                      className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono"
                      value={localSettings.heroImageUrl || ""}
                      onChange={(e) => setLocalSettings({ ...localSettings, heroImageUrl: e.target.value })}
                      placeholder="e.g. https://images.unsplash.com/..."
                    />
                  </div>
                </div>
              </div>

              {/* BRANDING LOGOS & UPLOADS */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h4 className="text-xs font-black text-indigo-950 mb-4 uppercase tracking-wider text-left">
                  <span>📸 ব্র্যান্ড লোগো ও ব্যানার মিডিয়া সেন্টার আপলোড (Campaign Media Center)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                  {/* Official Logo Slot */}
                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase block text-indigo-900 tracking-wider">১. প্রতিষ্ঠানের লোগো (Official Header Logo)</span>
                      <p className="text-[10px] text-gray-500 mt-1 leading-normal">Displayed at the left corner of top navigators.</p>
                    </div>

                    {localSettings?.officialLogo ? (
                      <div className="flex items-center gap-2 border bg-white p-2 rounded-lg">
                        <img src={localSettings.officialLogo} alt="Official Logo" className="w-10 h-10 object-contain rounded" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black truncate text-emerald-800">Saved</p>
                          <button type="button" onClick={() => handleLogoDelete("officialLogo")} className="text-[9px] text-rose-500 hover:underline font-bold mt-0.5 cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full py-2 bg-indigo-900 text-white font-extrabold text-[10px] rounded hover:bg-slate-900 text-center cursor-pointer">
                        Upload Logo JPG/PNG
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "officialLogo")} />
                      </label>
                    )}
                  </div>

                  {/* Developer Representative Logo Slot */}
                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase block text-indigo-900 tracking-wider">২. ডেভেলপার অবতার লোগো (Developer Brand Avatar)</span>
                      <p className="text-[10px] text-gray-500 mt-1 leading-normal">Displays adjacent to team attributions in the footer.</p>
                    </div>

                    {localSettings?.developerLogo ? (
                      <div className="flex items-center gap-2 border bg-white p-2 rounded-lg">
                        <img src={localSettings.developerLogo} alt="Developer Logo" className="w-10 h-10 object-contain rounded-full" referrerPolicy="no-referrer" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black truncate text-emerald-800">Saved</p>
                          <button type="button" onClick={() => handleLogoDelete("developerLogo")} className="text-[9px] text-rose-500 hover:underline font-bold mt-0.5 cursor-pointer">Remove</button>
                        </div>
                      </div>
                    ) : (
                      <label className="w-full py-2 bg-indigo-900 text-white font-extrabold text-[10px] rounded hover:bg-slate-900 text-center cursor-pointer">
                        Upload Developer Image
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleLogoUpload(e, "developerLogo")} />
                      </label>
                    )}
                  </div>

                  {/* Campaign Banner Slot */}
                  <div className="p-4 bg-slate-50 border border-gray-200 rounded-xl flex flex-col justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase block text-indigo-900 tracking-wider">৩. মূল ক্যাম্পেইন ব্যানার (Landscape Campaign Banner)</span>
                      <p className="text-[10px] text-gray-550 mt-1 leading-normal">Replace standard blue shapes with customizable landscape headers.</p>
                    </div>

                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerUpload}
                        className="text-[10px] text-gray-550 block w-full file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[9.5px] file:font-bold file:bg-indigo-50 file:text-indigo-900 cursor-pointer"
                      />

                      {pendingBannerPreview && (
                        <div className="p-1.5 bg-amber-50 rounded border border-amber-300">
                          <button
                            type="button"
                            onClick={handleSavePendingBanner}
                            className="w-full py-1 bg-amber-500 hover:bg-amber-600 text-indigo-950 font-black text-[9px] rounded-sm flex items-center justify-center gap-1 active:scale-95 cursor-pointer"
                          >
                            <Save className="w-3 h-3 shrink-0" />
                            <span>Save Live Banner (সংরক্ষণ করুন)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hero Banner Visual Preview Canvas */}
                <div className="mt-4 border border-gray-200 p-2.5 bg-white rounded-xl">
                  <span className="block text-[9.5px] font-extrabold text-gray-500 uppercase mb-1">Live Image Canvas:</span>
                  <div className="w-full h-24 sm:h-32 rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={localSettings?.heroImageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200"} 
                      alt="Hero Live Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Bottom Footer Customization Section directly merged under Media & Themes */}
                <div className="mt-6 border-t border-gray-200 pt-6">
                  <h4 className="text-xs font-black text-indigo-950 mb-4 uppercase tracking-wider text-left flex items-center gap-1">
                    <span>📑 ফুটার ও যোগাযোগ সেটিংস (Footer & Helpdesk Config)</span>
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Copyright Legal Label / Group</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800"
                          value={localSettings.footerCopyright || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerCopyright: e.target.value })}
                          placeholder="e.g. © 2026 Medha Anwesha Committee"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Helpdesk Phone / Hotline Number</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono"
                          value={localSettings.footerPhone || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerPhone: e.target.value })}
                          placeholder="e.g. +91 9876543210"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Official Support Email Address</label>
                        <input
                          type="email"
                          className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono"
                          value={localSettings.footerEmail || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerEmail: e.target.value })}
                          placeholder="e.g. committee@medhaanwesha.org"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">📢 Official Support Social Media</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2 text-xs border border-amber-200 bg-amber-50/15 focus:bg-white rounded-lg text-gray-800"
                          value={localSettings.footerSocial || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerSocial: e.target.value })}
                          placeholder="e.g. facebook.com/medhaanwesha"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Developer Attribution Name</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800"
                          value={localSettings.footerDevName || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerDevName: e.target.value })}
                          placeholder="e.g. Sudip Khatua"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Developer Contact Email Address</label>
                        <input
                          type="email"
                          className="w-full px-3.5 py-2 text-xs border border-gray-200 rounded-lg text-gray-800 font-mono"
                          value={localSettings.footerDevEmail || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerDevEmail: e.target.value })}
                          placeholder="e.g. sudipkhatua808@gmail.com"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-1">🏢 Admin Company / Agency Branding</label>
                        <input
                          type="text"
                          className="w-full px-3.5 py-2 text-xs border border-amber-200 bg-amber-50/15 focus:bg-white rounded-lg text-gray-800"
                          value={localSettings.footerCompany || ""}
                          onChange={(e) => setLocalSettings({ ...localSettings, footerCompany: e.target.value })}
                          placeholder="e.g. Medha Labs Solutions"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t pt-4 border-gray-100">
            {saveStatus && (
              <span className="text-xs text-amber-600 font-extrabold flex items-center gap-1 animate-pulse">
                <CheckCircle className="w-4 h-4 text-emerald-600" /> {saveStatus}
              </span>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-black text-indigo-950 bg-amber-500 hover:bg-amber-600 transition-all shadow-md active:scale-95 flex items-center gap-2 ml-auto"
            >
              <Save className="w-4 h-4 text-indigo-950" />
              <span>Save Website Interface</span>
            </button>
          </div>
        </form>
      )}

      {activeSubTab === "media_center" && (
        <div id="admin-media-center" className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
          <div className="border-b pb-4 border-gray-100 flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-bold text-sm text-indigo-950">পোর্টালে ব্যানার ইমেজ রূপান্তর (Media Center & Banner Overhaul)</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Upload high-resolution landscape campaign banner and developer brand logo to transform branding instantly.</p>
            </div>
            <span className="text-[9px] bg-indigo-100 text-indigo-805 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
              MEDIA WIDGET (SUPER ADMIN ONLY)
            </span>
          </div>

          {/* 1. HERO BANNER UPLOAD SLOT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-4.5 rounded-2xl border border-gray-100">
            <div className="space-y-4 text-left col-span-1">
              <span className="text-[10px] text-amber-600 font-extrabold uppercase block tracking-wider font-sans">১. Hero Banner Image Upload (হিরো ব্যানার আপলোড)</span>
              <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                Select any landscape photo, illustration, or official committee campaign block. Supported format: PNG, JPG, JPEG (Max Size: 2MB).
              </p>
              
              <div className="pt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-900 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              {pendingBannerPreview && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 space-y-2 animate-pulse mt-3">
                  <p className="text-[10.5px] text-amber-800 font-semibold">⚠️ Unsaved Campaign Banner Changes Found inside Preview canvas!</p>
                  <button
                    type="button"
                    onClick={handleSavePendingBanner}
                    className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-indigo-950 font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>আপলোডকৃত ফাইল ডাটাবেজে সংরক্ষণ করুন (Save Campaign Banner)</span>
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200/65">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">Or direct hero image public URL (বিকল্প ইমেজ লিঙ্ক)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1.5 text-xs border border-gray-200 bg-white focus:bg-white rounded-lg text-gray-800 font-mono"
                    value={bannerUrlInput}
                    onChange={(e) => setBannerUrlInput(e.target.value)}
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                  />
                  <button
                    type="button"
                    onClick={handleSavePendingBanner}
                    className="px-4 py-1.5 bg-indigo-900 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition-all cursor-pointer"
                  >
                    Apply URL
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3 col-span-1 text-left relative">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                <span>Live Interactive Preview of Hero Banner</span>
                {pendingBannerPreview && <span className="text-[9px] bg-amber-500 text-indigo-950 px-1.5 py-0.5 rounded font-black tracking-wide animate-pulse">PRE-SAVE DRAFT</span>}
              </span>
              <div className={`w-full h-44 rounded-xl overflow-hidden border shadow-inner relative bg-indigo-950/20 ${pendingBannerPreview ? "border-amber-500 border-2 shadow-amber-500/10" : "border-gray-200"}`}>
                <img 
                  src={pendingBannerPreview || localSettings?.heroImageUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200"} 
                  alt="Hero Live Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center leading-normal">
                Uses style layout <code className="bg-gray-100 px-1 py-0.5 rounded text-[9px]">cover</code> logic to guarantee responsive fitting on public homepage grids.
              </p>
            </div>
          </div>

          {/* 2. BRAND LOGO UPLOAD SLOT */}
          <div className="border-t pt-6 bg-slate-50/25 p-4.5 rounded-2xl border border-gray-100 space-y-4">
            <div className="text-left border-b pb-3 border-gray-100 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-xs text-indigo-950 uppercase tracking-wider">২. Brand Logo Upload (ব্র্যান্ড লোগো আপলোড)</h5>
                <p className="text-[10.5px] text-gray-400 mt-1">Upload a highly professional brand logo for Medha Labs Solutions to display next to developer credits in the footer.</p>
              </div>
              <span className="text-[9px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded uppercase font-sans tracking-wide">
                FOOTER INTEGRATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-4 text-left col-span-1">
                <span className="text-[10px] text-amber-600 font-extrabold uppercase block tracking-wider font-sans">Brand Logo Uploader</span>
                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  Choose a vector/pixel image representing Medha Labs Solutions or your personal brand. Handles transparency beautifully on the dark blue footer backdrop (Max size: 2MB).
                </p>
                
                <div className="pt-1 flex flex-col items-stretch gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <label className="px-4 py-2 bg-indigo-900 hover:bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer text-center transition-colors active:scale-95 shadow-sm">
                      ব্র্যান্ড লোগো আপলোড (Upload Company/Brand Logo)
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handlePendingLogoUpload}
                      />
                    </label>

                    {(pendingLogoPreview || localSettings?.developerLogo) && (
                      <button
                        type="button"
                        onClick={async () => {
                          if (pendingLogoPreview) {
                            setPendingLogoPreview("");
                            triggerToast("প্রিভিউ বাতিল করা হয়েছে।", "info");
                          } else {
                            if (!confirm("Are you sure you want to remove this logo? This changes public branding instantly.")) return;
                            try {
                              const res = await fetch("/api/admin/media-upload", {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                  "x-admin-passcode": passcode
                                },
                                body: JSON.stringify({
                                  type: "logo",
                                  data: "",
                                  signature: "SUPERADMIN_MASTER_SIGNATURE_OFFICIAL"
                                })
                              });
                              const data = await res.json();
                              if (data.success) {
                                triggerToast("Logo removed from database successfully!", "success");
                                onRefreshSettings();
                              }
                            } catch (e) {
                              triggerToast("Error removing logo.", "error");
                            }
                          }
                        }}
                        className="px-4 py-2 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-bold text-xs rounded-xl transition-colors active:scale-95"
                      >
                        মুছে ফেলুন (Remove Logo)
                      </button>
                    )}
                  </div>

                  {pendingLogoPreview && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/50 space-y-2 animate-pulse mt-1">
                      <p className="text-[10.5px] text-amber-800 font-semibold">⚠️ Unsaved Footer Brand Logo Changes Found inside Preview canvas!</p>
                      <button
                        type="button"
                        onClick={handleSavePendingLogo}
                        className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>আপলোডকৃত ব্র্যান্ড লোগো ডাটাবেজে সংরক্ষণ করুন (Save Brand Logo)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 col-span-1 text-left relative">
                <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                  <span>Interactive Brand Logo Canvas Preview</span>
                  {pendingLogoPreview && <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold tracking-wide animate-pulse">PRE-SAVE DRAFT</span>}
                </span>
                <div className={`w-full h-36 rounded-xl overflow-hidden border shadow-inner bg-indigo-950 flex items-center justify-center p-4 relative ${pendingLogoPreview ? "border-emerald-500 border-2" : "border-gray-200"}`}>
                  {(pendingLogoPreview || localSettings?.developerLogo) ? (
                    <img 
                      src={pendingLogoPreview || localSettings?.developerLogo} 
                      alt="Brand/Developer Logo Preview"
                      referrerPolicy="no-referrer"
                      className="max-h-20 w-auto object-contain filter drop-shadow"
                    />
                  ) : (
                    <span className="text-[10px] text-indigo-200/50 font-mono">No brand logo configured yet</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-400 text-center leading-normal">
                  The uploaded logo is saved to central configurations database securely.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------
          SUB-TAB: DOWNLOAD CENTER (CLASS-WISE EXCEL EXPORT)
          ------------------------------------------- */}
      {activeSubTab === "download_center" && (
        <div id="admin-download-center" className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 space-y-6">
          <div className="border-b pb-4 border-gray-100 flex items-center justify-between">
            <div className="text-left">
              <h4 className="font-bold text-sm text-indigo-950">শ্রেণী-ভিত্তিক এক্সেল স্প্রেডশীট ডাউনলোড (Class-wise Results Download Center)</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Generate verified dynamic .xlsx Excel tables compiled instantly by block committee guidelines.</p>
            </div>
            <span className="text-[9px] bg-indigo-100 text-indigo-805 font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
              EXCEL DIRECT INTEGRATION
            </span>
          </div>

          <div className="p-4 rounded-xl border border-indigo-100/70 bg-indigo-50/25 flex items-start gap-3 text-indigo-950 text-left">
            <CheckCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <span className="font-black">🔒 Security Handshake Verified: Result Release Active</span>
              <p className="text-[11px] text-gray-550 leading-relaxed font-semibold">
                Because results have been successfully released to live, standard committee auditors can now download class-wise reports. Every exported excel file matches rankings, actual parsed scores, and unique candidate identifiers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-2">
            {["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"].map((className) => {
              const countOfStudents = safeResults.filter(r => r && r.classLevel === className).length;
              const isExportEnabled = settings?.is_results_live;

              return (
                <button
                  key={className}
                  onClick={() => handleExportClass(className)}
                  disabled={!isExportEnabled}
                  className="bg-indigo-950 text-white hover:bg-slate-900 border border-indigo-900 hover:border-amber-400 p-4 rounded-2xl text-center space-y-2 transition-all flex flex-col items-center justify-center cursor-pointer active:scale-95 group relative shadow disabled:opacity-40"
                >
                  <FileSpreadsheet className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform" />
                  <div>
                    <h5 className="text-[11px] font-black tracking-tight">{className}</h5>
                    <p className="text-[9px] text-amber-400/80 font-semibold font-mono mt-0.5">
                      {countOfStudents} records
                    </p>
                  </div>
                  <span className="text-[9px] bg-white/10 text-gray-200 px-2 py-0.5 rounded-md uppercase font-black">
                    Export .xlsx
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------
          SUB-TAB 2: COMPREHENSIVE MARKS AND STUDENTS
          ------------------------------------------- */}
      {activeSubTab === "results" && (() => {
        const classList = ["Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"];
        const dynamicClassStats = classList.map(cls => {
          const classStudents = safeResults.filter(r => r && r.classLevel === cls);
          const total = classStudents.length;
          const passed = classStudents.filter(r => r && r.status === "Passed").length;
          const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
          return { classLevel: cls, total, passed, passRate };
        }).filter(c => c.total > 0);

        const bracketElite = safeResults.filter(r => r && r.marks !== undefined && r.marks >= 40).length;
        const bracketGood = safeResults.filter(r => r && r.marks !== undefined && r.marks >= 30 && r.marks < 40).length;
        const bracketAverage = safeResults.filter(r => r && r.marks !== undefined && r.marks >= 20 && r.marks < 30).length;
        const bracketBelow = safeResults.filter(r => r && r.marks !== undefined && r.marks < 20).length;

        const totalResultsCount = safeResults.length;
        const elitePercent = totalResultsCount > 0 ? Math.round((bracketElite / totalResultsCount) * 100) : 0;
        const goodPercent = totalResultsCount > 0 ? Math.round((bracketGood / totalResultsCount) * 100) : 0;
        const avgPercent = totalResultsCount > 0 ? Math.round((bracketAverage / totalResultsCount) * 100) : 0;
        const belowPercent = totalResultsCount > 0 ? Math.round((bracketBelow / totalResultsCount) * 100) : 0;

        return (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Col: Add Individual student */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h4 className="font-bold text-xs text-indigo-950 border-b pb-2 uppercase tracking-wider">
                  {editResult?.id ? "✏️ Edit Student Score" : "➕ Add Single Student Result"}
                </h4>

                <form onSubmit={handleSaveManualResult} className="space-y-3.5 text-xs text-gray-700">
                  <div>
                    <label className="block font-medium mb-1">Registration/Roll Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MA-2026-612"
                      value={editResult?.rollNo || ""}
                      onChange={(e) => setEditResult({ ...editResult, rollNo: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Student Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Souvik Das"
                      value={editResult?.name || ""}
                      onChange={(e) => setEditResult({ ...editResult, name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Village/School Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Mayapur High School"
                      value={editResult?.school || ""}
                      onChange={(e) => setEditResult({ ...editResult, school: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block font-medium mb-1">Class Level</label>
                    <select
                      value={editResult?.classLevel || "Class I"}
                      onChange={(e) => setEditResult({ ...editResult, classLevel: e.target.value })}
                      className="w-full px-2 py-2 border rounded bg-white font-sans font-semibold cursor-pointer text-indigo-950"
                    >
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

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-medium mb-1">Marks Scored (0-50)</label>
                      <input
                        type="number"
                        required
                        min={0}
                        max={50}
                        value={editResult?.marks !== undefined ? editResult.marks : ""}
                        onChange={(e) => setEditResult({ ...editResult, marks: Number(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border rounded bg-white text-base font-black font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">Guardian Phone (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. 987654..."
                        value={editResult?.phone || ""}
                        onChange={(e) => setEditResult({ ...editResult, phone: e.target.value })}
                        className="w-full px-3 py-2 border rounded"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 py-1.5 px-1">
                    <input
                      type="checkbox"
                      id="is-prize-winner-checkbox"
                      checked={!!(editResult?.is_prize_winner)}
                      onChange={(e) => setEditResult({ ...editResult, is_prize_winner: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="is-prize-winner-checkbox" className="font-bold text-gray-700 cursor-pointer select-none">
                      🏆 Mark as Merit List & Prize Winner
                    </label>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 rounded-lg text-indigo-950 active:scale-95 transition-all text-center"
                    >
                      Save Record
                    </button>
                    {editResult && (
                      <button
                        type="button"
                        onClick={() => setEditResult(null)}
                        className="px-3.5 py-2 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right block: Excel CSV Import (Extremely Advanced No-Code) */}
              <div className="lg:col-span-2 bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <div className="flex items-center justify-between border-b pb-2 flex-wrap gap-2">
                  <h4 className="font-bold text-xs text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-indigo-900" /> Excel or CSV Bulk Importer
                  </h4>
                  
                  {/* Download Sample CSV template link (Issue 2/3 Fix) */}
                  <a 
                    href="/api/marks/sample-csv"
                    download="sample_results.csv"
                    className="flex items-center gap-1 text-[10px] bg-amber-50 hover:bg-amber-100 text-amber-800 font-extrabold px-2.5 py-1 rounded-lg border border-amber-200 transition-all shadow-sm cursor-pointer"
                  >
                    📥 Download Sample CSV
                  </a>

                  {/* Importer tab controls */}
                  <div className="flex bg-gray-100 rounded-lg p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setImportMode("upload")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        importMode === "upload" ? "bg-white text-indigo-950 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      📂 File Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setImportMode("paste")}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all cursor-pointer ${
                        importMode === "paste" ? "bg-white text-indigo-950 shadow-sm" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      ✍️ Paste CSV Raw text
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-gray-500 leading-relaxed">
                  Instantly populate large exam scores without manually inserting records. Required header format: <span className="font-mono bg-indigo-50 px-1 py-0.5 text-indigo-900 font-extrabold rounded">roll_number, student_name, student_class, marks_bengali, marks_math, marks_reasoning, marks_science</span>. Use the sample template below or download the master template to prevent format rejections.
                </p>

                {importMode === "upload" ? (
                  <div className="space-y-4">
                    {/* Drag-and-Drop Area */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={(e) => handleDrop(e, false)}
                      className={`border-2 border-dashed rounded-2xl p-6 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
                        dragActive ? "border-amber-400 bg-amber-50/45 scale-[1.01]" : "border-gray-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
                      }`}
                      onClick={() => document.getElementById("excel-csv-file-input")?.click()}
                    >
                      <input
                        id="excel-csv-file-input"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0], false);
                          }
                        }}
                      />
                      <Upload className="w-8 h-8 text-indigo-500 animate-bounce" />
                      <p className="text-xs font-bold text-gray-700">Drag & drop your student list spreadsheet here</p>
                      <p className="text-[10px] text-gray-400 font-medium">Supports MS Excel (.xlsx, .xls) and standard Comma-Separated Values (.csv)</p>
                      <p className="text-[9px] text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded font-extrabold uppercase mt-1">Or click to browse storage</p>
                    </div>

                    <div className="flex justify-between items-center bg-rose-50 p-3.5 rounded-xl border border-rose-100 gap-4 flex-wrap text-left">
                      <div className="flex-1 min-w-[200px]">
                        <p className="text-[10px] uppercase tracking-wider font-extrabold text-rose-800">⚠️ Risk Operations Warning</p>
                        <p className="text-[9px] text-rose-600 mt-0.5">Wiping overrides student lists present on the portal database entirely. Check backups before trigger.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const fileInput = document.createElement("input");
                          fileInput.type = "file";
                          fileInput.accept = ".csv,.xlsx,.xls";
                          fileInput.onchange = (e) => {
                            const target = e.target as HTMLInputElement;
                            if (target.files && target.files[0]) {
                              if (confirm("Are you absolutely sure you want to completely erase current scores in order to bulk load this workbook?")) {
                                handleFileUpload(target.files[0], true);
                              }
                            }
                          };
                          fileInput.click();
                        }}
                        className="px-3.5 py-1.5 text-[10px] font-black bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-all shadow-sm cursor-pointer"
                      >
                        Empty & Replace DB with Spreadsheet
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <textarea
                      placeholder="MA-2026-611, Snehasish Das, Mayapur High, Class VI, 42, Passed, 9876543210&#10;MA-2026-612, Ritu Ghosh, Arambagh Girls, Class VI, 38, Passed, 9876543211"
                      value={bulkCsv}
                      onChange={(e) => setBulkCsv(e.target.value)}
                      className="w-full h-28 border rounded-lg p-3 font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-amber-500 bg-gray-50 focus:bg-white leading-relaxed"
                    />

                    <div className="flex items-center gap-2 justify-end flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleBulkCsvInsert(false)}
                        className="px-4 py-2 text-xs font-bold bg-indigo-900 hover:bg-indigo-850 rounded-lg text-white transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                      >
                        <span>Append to Database</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkCsvInsert(true)}
                        className="px-4 py-2 text-xs font-black bg-rose-600 hover:bg-rose-700 bg-rose-600 rounded-lg text-white transition-all shadow-sm cursor-pointer"
                      >
                        Wipe & Replace Complete Database
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Master Students Spreadsheet view to edit/delete manually */}
            <div className="bg-white rounded-2xl border shadow-sm border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center flex-wrap gap-2">
                <span className="text-xs font-bold text-indigo-950 font-sans">Active Student Result Spreadsheet ({results.length} total)</span>
                <button
                  onClick={fetchAllDevData}
                  className="p-1 px-2.5 text-[10px] bg-white hover:bg-gray-100 rounded border border-gray-200 text-gray-600 flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3 text-gray-400" /> Sync Scores
                </button>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left font-sans text-xs border-collapse">
                  <thead>
                    <tr className="bg-indigo-900 text-white font-semibold">
                      <th className="p-3 pl-4">Class</th>
                      <th className="p-3">Roll Number</th>
                      <th className="p-3">Candidate Name</th>
                      <th className="p-3">School Name</th>
                      <th className="p-3 text-center">Marks (50)</th>
                      <th className="p-3 text-center">Auto Rank</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Prize</th>
                      <th className="p-3 pr-4 text-center">Operator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {safeResults.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-400 italic">Database is currently empty. Insert records above!</td>
                      </tr>
                    ) : (
                      safeResults.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-50/50">
                          <td className="p-2.5 pl-4 font-bold text-indigo-900">{student.classLevel}</td>
                          <td className="p-2.5 font-mono text-gray-500">{student.rollNo}</td>
                          <td className="p-2.5 font-bold text-gray-800">{student.name}</td>
                          <td className="p-2.5 text-gray-600">{student.school}</td>
                          <td className="p-2.5 text-center font-bold text-gray-950">{student.marks}</td>
                          <td className="p-2.5 text-center font-bold text-amber-600 font-mono">
                            {student.status === "Absent" ? "—" : `#${student.rank}`}
                          </td>
                          <td className="p-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                              student.status === "Passed" ? "bg-emerald-50 text-emerald-800 border" :
                              student.status === "Absent" ? "bg-gray-100 text-gray-400 border" : "bg-rose-50 text-rose-800 border"
                            }`}>
                              {student.status}
                            </span>
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleTogglePrize(student.id)}
                              className={`p-1 rounded-lg transition-all hover:scale-110 active:scale-95 inline-flex items-center justify-center border ${
                                student.is_prize_winner === 1 || student.is_prize_winner === true
                                  ? "text-amber-600 bg-amber-50 border-amber-250"
                                  : "text-gray-300 bg-gray-50/55 border-gray-100 hover:text-gray-500"
                              }`}
                              title={student.is_prize_winner ? "Remove from prize winners" : "Mark as prize winner"}
                            >
                              <Award className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </td>
                          <td className="p-2.5 pr-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditResult(student);
                                  window.scrollTo({ top: 350, behavior: "smooth" });
                                }}
                                className="p-1 px-2 text-[10px] font-semibold bg-indigo-50 text-indigo-900 rounded border hover:bg-indigo-100 flex items-center gap-1"
                                title="Edit record details"
                              >
                                <Edit className="w-3 h-3 text-indigo-900" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteResult(student.id, student.name)}
                                className="p-1 px-2 text-[10px] font-semibold bg-rose-50 text-rose-700 rounded border hover:bg-rose-100 flex items-center gap-1"
                                title="Delete record permanently"
                              >
                                <Trash2 className="w-3 h-3 text-rose-600" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real-time Dynamic Statistics Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Registered Pupils</p>
                  <p className="text-2xl font-black text-indigo-950 mt-1">{totalPupils}</p>
                  <p className="text-[9px] text-gray-500 mt-1">Calculated across active database</p>
                </div>
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-900 border border-indigo-100">
                  <span className="text-base">👥</span>
                </div>
              </div>
              
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Average Exam Mark</p>
                  <p className="text-2xl font-black text-indigo-950 mt-1">{averageMark} <span className="text-xs font-normal text-gray-400">/ 50</span></p>
                  <p className="text-[9px] text-gray-500 mt-1">Mean calculation of student scores</p>
                </div>
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200">
                  <span className="text-base">📊</span>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Success Rate</p>
                  <p className="text-2xl font-black text-emerald-600 mt-1">{successRate}%</p>
                  <p className="text-[9px] text-gray-500 mt-1">Ratio of passing candidates</p>
                </div>
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                  <span className="text-base">🎓</span>
                </div>
              </div>
            </div>

            {/* Visual Analytics Bento Section */}
            <div id="visual-analytics-bento" className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-gradient-to-tr from-[#fbfbfe] to-[#f5f6fa] p-6 rounded-3xl border border-gray-200 shadow-sm text-left">
              {/* Title Header */}
              <div className="md:col-span-12 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 border-gray-200/60">
                <div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">Dynamic Visual Analytics</span>
                  <h4 className="font-black text-sm text-indigo-950 mt-1 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-indigo-900" />
                    রিয়েল-টাইম মেধা পারফরম্যান্স অ্যানালিটিক্স ও ডিস্ট্রিবিউশন
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">রোল এন্ট্রি ট্র্যাকিং এবং ক্লাসভিত্তিক পাসের হার বিশ্লেষণ গ্রাফ।</p>
                </div>
                <div className="text-xs font-semibold text-indigo-900 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm mt-2 sm:mt-0">
                  মোট পরীক্ষার্থী: <span className="font-extrabold">{totalPupils} জন</span>
                </div>
              </div>

              {/* Left: Class-wise Pass percentage SVG vertical or list bar chart */}
              <div className="md:col-span-7 bg-white p-5 rounded-2xl border border-gray-200/50 shadow-sm flex flex-col justify-between">
                <div>
                  <h5 className="font-black text-xs text-indigo-950 flex items-center gap-1.5 mb-4">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    শ্রেণী-ভিত্তিক পাসের হার (% Pass Rate per Class Level)
                  </h5>
                  <div className="space-y-4">
                    {dynamicClassStats.map((item) => (
                      <div key={item.classLevel} className="group">
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-700 group-hover:text-indigo-950 transition-colors">
                          <span>{item.classLevel}</span>
                          <span className="text-xs font-extrabold font-mono text-indigo-900">{item.passRate}% ({item.passed}/{item.total} Passed)</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200 mt-1">
                          <div 
                            className="bg-indigo-950 h-full rounded-full transition-all duration-1000 origin-left relative"
                            style={{ width: `${item.passRate}%` }}
                          >
                            <div className="absolute right-0 top-0 h-full w-2 bg-amber-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                    {dynamicClassStats.length === 0 && (
                      <div className="py-8 text-center text-xs text-gray-400 italic">সার্ভারে কোনো ফলাফল ডাটা নেই। গ্রাফ প্রর্দশনের জন্য অনুগ্রহ করে আগে ছাত্র ডাটা এন্ট্রি করুন।</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Performance brackets / Rank distribution circular SVG layout */}
              <div className="md:col-span-5 bg-white p-5 rounded-2xl border border-gray-200/50 shadow-sm text-center flex flex-col justify-between">
                <div>
                  <h5 className="font-black text-xs text-indigo-950 flex items-center gap-1.5 mb-5 text-left">
                    <Award className="w-4 h-4 text-amber-500" />
                    মেধা স্কোর লেভেল বন্টন (Student Performance Tiers)
                  </h5>

                  <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
                    {/* circular donut SVG chart */}
                    <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="3.5" />
                        
                        {/* Tier 1 Saffron (Elite >=80) */}
                        <circle 
                          cx="18" cy="18" r="15.915" fill="none" 
                          stroke="#f5a623" strokeWidth="3.5" 
                          strokeDasharray={`${elitePercent} ${100 - elitePercent}`}
                          strokeDashoffset="0"
                        />
                        
                        {/* Tier 2 Emerald (Good 60-80) */}
                        <circle 
                          cx="18" cy="18" r="15.915" fill="none" 
                          stroke="#10b981" strokeWidth="3.5" 
                          strokeDasharray={`${goodPercent} ${100 - goodPercent}`}
                          strokeDashoffset={`-${elitePercent}`}
                        />
                        
                        {/* Tier 3 Indigo (Passed 40-60) */}
                        <circle 
                          cx="18" cy="18" r="15.915" fill="none" 
                          stroke="#4338ca" strokeWidth="3.5" 
                          strokeDasharray={`${avgPercent} ${100 - avgPercent}`}
                          strokeDashoffset={`-${elitePercent + goodPercent}`}
                        />

                        {/* Tier 4 Rose (Absent / Unsuccessful <40) */}
                        <circle 
                          cx="18" cy="18" r="15.915" fill="none" 
                          stroke="#f43f5e" strokeWidth="3.5" 
                          strokeDasharray={`${belowPercent} ${100 - belowPercent}`}
                          strokeDashoffset={`-${elitePercent + goodPercent + avgPercent}`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-black text-indigo-950 tracking-tighter">
                          {totalPupils > 0 ? `${Math.round(((bracketElite + bracketGood + bracketAverage) / totalPupils) * 105 / 1.05)}%` : "0%"}
                        </span>
                        <span className="text-[7.5px] text-gray-500 font-bold uppercase">পাস যোগ্যতা</span>
                      </div>
                    </div>

                    {/* Labels description list */}
                    <div className="space-y-1.5 text-left w-full text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                        <div className="flex-1 flex justify-between font-bold text-gray-600 text-[11px]">
                          <span>{"Elite (>=40)"}</span>
                          <span className="font-mono text-indigo-950">{bracketElite} ({elitePercent}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <div className="flex-1 flex justify-between font-bold text-gray-600 text-[11px]">
                          <span>Good (30-39)</span>
                          <span className="font-mono text-indigo-950">{bracketGood} ({goodPercent}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0" />
                        <div className="flex-1 flex justify-between font-bold text-gray-600 text-[11px]">
                          <span>Passed (20-29)</span>
                          <span className="font-mono text-indigo-950">{bracketAverage} ({avgPercent}%)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
                        <div className="flex-1 flex justify-between font-bold text-gray-600 text-[11px]">
                          <span>Needs Imp. / Abs</span>
                          <span className="font-mono text-indigo-950">{bracketBelow} ({belowPercent}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-400 mt-2 bg-slate-50 p-2 rounded-xl italic">
                  * Donut components process dynamic database entries and compute score margins automatically.
                </div>
              </div>
            </div>

            {/* Gatekeeper & Staging Mode Executive Control Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Bento: Status & Super Admin Publish controls */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-200 shadow-md space-y-4 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-amber-500/10 text-amber-600 rounded-bl-2xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] bg-indigo-50 text-indigo-900 border border-indigo-200 font-black tracking-widest px-2.5 py-1 rounded-full uppercase">Result Release Secretariat</span>
                  <h3 className="text-base font-black text-indigo-950 pt-1">ফলাফল প্রকাশ গেটকিপার ও লাইভ কন্ট্রোল</h3>
                  <p className="text-[11px] text-gray-500 leading-normal">মেধা অন্বেষা ফলাফল চূড়ান্তভাবে জনগণের জন্য প্রকাশ করার প্রধান নিয়ন্ত্রণ প্যানেল।</p>
                </div>

                {/* Status Indicator Bar */}
                <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${
                  settings.is_results_live 
                    ? "bg-emerald-50 text-emerald-950 border-emerald-250/60" 
                    : "bg-amber-50 text-amber-950 border-amber-250/60"
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-4 w-4 relative shrink-0`}>
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        settings.is_results_live ? "bg-emerald-400" : "bg-amber-400"
                      }`} />
                      <span className={`relative inline-flex rounded-full h-4 w-4 ${
                        settings.is_results_live ? "bg-emerald-600" : "bg-amber-500"
                      }`} />
                    </span>
                    <div>
                      <p className="text-xs font-black">
                        {settings.is_results_live 
                          ? "🔴 ফলাফল বর্তমানে লাইভ (Public Live Mode)" 
                          : "⚠️ ফলাফল বর্তমানে ড্রাফট (Draft/Staging Mode)"}
                      </p>
                      <p className="text-[11px] text-gray-600 font-semibold leading-normal mt-0.5">
                        {settings.is_results_live 
                          ? "মেধাবী শিক্ষার্থীদের প্রাপ্ত নম্বর ও র‍্যাঙ্কিং সর্বজনীন এবং ভেরিফাইড।" 
                          : "কমিটি মেম্বাররা CSV ফাইল আপলোড ও নম্বর পরিবর্তন করতে পারেন, জনসাধারণের উদ্দেশ্যে লক।"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gatekeeper Trigger/Withdraw Form */}
                <form 
                  onSubmit={(e) => handleReleaseSubmit(e, !settings.is_results_live)}
                  className="bg-gray-50 p-4.5 rounded-2xl border border-gray-200/60 space-y-3.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-indigo-950 font-extrabold flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      {settings.is_results_live ? "ফলাফল প্রত্যাহার পাসওয়ার্ড:" : "অবিলম্বে চূড়ান্ত প্রকাশ ভেরিফিকেশন:"}
                    </span>
                    <span className="text-[9px] text-indigo-900 bg-amber-500/10 font-bold px-2 py-0.5 rounded-md">Super Admin Exclusive Only</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      required
                      placeholder="পাসওয়ার্ড টাইপ করুন..."
                      value={releasePassword}
                      onChange={(e) => setReleasePassword(e.target.value)}
                      className="flex-1 px-3 py-2 border rounded-xl text-xs bg-white text-indigo-950"
                    />
                    <button
                      type="submit"
                      disabled={releaseLoading}
                      className={`px-4 py-2 text-xs font-extrabold rounded-xl text-white transition-all active:scale-[0.98] cursor-pointer shadow-md flex items-center justify-center gap-1 bg-gradient-to-r ${
                        settings.is_results_live 
                          ? "from-rose-600 to-red-700 hover:from-rose-700 hover:to-red-800" 
                          : "from-indigo-900 to-indigo-950 hover:from-indigo-950 hover:to-black"
                      }`}
                    >
                      {releaseLoading && (
                        <svg className="animate-spin h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      )}
                      <span>
                        {settings.is_results_live ? "ফলাফল লক / Withdraw" : "ফলাফল চূড়ান্ত প্রকাশ / Publish"}
                      </span>
                    </button>
                  </div>

                  {releaseStatus.success !== null && (
                    <div className={`p-2.5 rounded-xl text-[11px] font-bold text-center leading-normal border ${
                      releaseStatus.success 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-150" 
                        : "bg-rose-50 text-rose-800 border-rose-150 font-black animate-shake"
                    }`}>
                      {releaseStatus.message}
                    </div>
                  )}
                </form>
              </div>

              {/* Right Bento: Staging Quality Assurance Review */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-200 shadow-md space-y-4 text-left flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center border-b pb-2.5 border-gray-200">
                    <span className="text-xs font-black text-indigo-950 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      ক্লাস-ভিত্তিক কোয়ালিটি রিভিউ (QA Check)
                    </span>
                    <select
                      value={reviewClassFilter}
                      onChange={(e) => setReviewClassFilter(e.target.value)}
                      className="px-2.5 py-1 border rounded-lg text-[10px] font-black text-gray-700 bg-gray-50 focus:outline-none cursor-pointer"
                    >
                      <option value="All">All Classes Combined</option>
                      {[
                        "Class I", "Class II", "Class III", "Class IV", "Class V",
                        "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"
                      ].map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                  </div>

                  {/* Quantitative Metrics Stack */}
                  <div className="grid grid-cols-2 gap-2.5 pt-3">
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                      <span className="text-[9px] text-gray-500 block">Total Checked Pupils</span>
                      <span className="text-lg font-black text-indigo-950">{reviewCount}</span>
                    </div>
                    <div className="p-3 bg-emerald-50/30 rounded-xl border border-emerald-100">
                      <span className="text-[9px] text-gray-500 block">Avg Exam Score</span>
                      <span className="text-lg font-black text-emerald-700">{avgClassScore} / 50</span>
                    </div>
                    <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100">
                      <span className="text-[9px] text-gray-500 block">Lowest Class Score</span>
                      <span className="text-sm font-black text-gray-700">{minScore}</span>
                    </div>
                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100">
                      <span className="text-[9px] text-gray-500 block">Highest Class Score</span>
                      <span className="text-sm font-black text-purple-700">{maxScore}</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] bg-slate-50 border p-3 rounded-xl text-slate-600 font-semibold leading-normal mt-2">
                  🛡️ <strong className="text-slate-800">QA সুপারিশ:</strong> ফলাফল চূড়ান্তভাবে প্রকাশ সাবমিট করার পূর্বে, নিশ্চিত করুন সমস্ত উত্তরপত্রের ডাটা সফলভাবে এন্ট্রি হয়েছে এবং গড় নম্বরের সামঞ্জস্যতা সঠিক আছে।
                </div>
              </div>

            </div>

            {/* Class-Wise automated Excel Export Center */}
            {settings?.is_results_live && (
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md space-y-4 border border-indigo-950 text-left">
                <div className="flex items-center gap-2 border-b border-indigo-850 pb-3">
                  <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                  <div>
                    <h4 className="font-extrabold text-xs text-amber-400 tracking-wider uppercase font-sans">Class-Wise Dynamic Excel Download Center</h4>
                    <p className="text-[10px] text-gray-300">Generate instantly compiled, sorted marks sheets (.xlsx format) with automated merit rankings and tie breakers calculated on local databases.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    "Class I", "Class II", "Class III", "Class IV", "Class V",
                    "Class VI", "Class VII", "Class VIII", "Class IX", "Class X"
                  ].map((classOption) => {
                    const count = results.filter(r => r.classLevel === classOption).length;
                    return (
                      <button
                        key={classOption}
                        type="button"
                        onClick={() => {
                          // Trigger dynamic excel compilation & download
                          window.location.href = `/api/export-excel?classLevel=${encodeURIComponent(classOption)}&passcode=${encodeURIComponent(passcode)}`;
                        }}
                        className="p-3 rounded-lg border border-indigo-800 bg-[#1e1b4b]/30 hover:bg-amber-500 hover:text-indigo-950 text-indigo-200 transition-all text-center flex flex-col items-center justify-center gap-1 active:scale-[0.97] hover:border-amber-500 cursor-pointer"
                      >
                        <span className="font-bold text-[11px] font-sans">{classOption}</span>
                        <span className="text-[8px] font-mono text-gray-400">{count} students</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* -------------------------------------------
          SUB-TAB 3: ARCHIVE GUIDELINE & NOTICE CRUD
          ------------------------------------------- */}
      {activeSubTab === "archives" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Creator Box */}
          <div className="bg-white p-5 rounded-2xl border shadow-sm border-gray-200 space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-950 border-b pb-2">
              {editArchive?.id ? "✏️ Edit Notice/Past Material" : "✙ Add Notice or Questionnaire File"}
            </h4>

            <form onSubmit={handleSaveArchive} className="space-y-4 text-xs text-gray-700">
              <div>
                <label className="block font-medium mb-1">Title / Caption</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medha Anwesha 2025 - Class V Math"
                  value={editArchive?.title || ""}
                  onChange={(e) => setEditArchive({ ...editArchive, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Material Type</label>
                  <select
                    value={editArchive?.type || "question"}
                    onChange={(e: any) => setEditArchive({ ...editArchive, type: e.target.value })}
                    className="w-full px-2.5 py-2 border rounded bg-white"
                  >
                    <option value="question">Question Paper</option>
                    <option value="notice">Official Notice</option>
                    <option value="syllabus">Syllabus Guide</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Academic Year</label>
                  <input
                    type="number"
                    required
                    placeholder="2026"
                    value={editArchive?.year || ""}
                    onChange={(e) => setEditArchive({ ...editArchive, year: Number(e.target.value) || 2026 })}
                    className="w-full px-3 py-2 border rounded"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Target Class Selection</label>
                <select
                  value={editArchive?.classLevel || "All"}
                  onChange={(e) => setEditArchive({ ...editArchive, classLevel: e.target.value })}
                  className="w-full px-2.5 py-2 border rounded bg-white font-sans font-semibold text-indigo-950 cursor-pointer"
                >
                  <option value="All">All Classes Combined</option>
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

              <div>
                <label className="block font-medium mb-1">Document text body / Content description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Paste syllabus details, past examinations question structures or notices details here..."
                  value={editArchive?.content || ""}
                  onChange={(e) => setEditArchive({ ...editArchive, content: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans leading-relaxed"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 rounded-lg text-indigo-950 active:scale-95 transition-all text-center"
                >
                  Post Document
                </button>
                {editArchive && (
                  <button
                    type="button"
                    onClick={() => setEditArchive(null)}
                    className="px-3 py-2 text-xs text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List display */}
          <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm border-gray-200 overflow-hidden flex flex-col justify-between">
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-bold text-indigo-950 font-sans">Active Notice Board & Files Archives ({archives.length})</span>
            </div>

            <div className="overflow-y-auto divide-y divide-gray-100 flex-1 max-h-96">
              {archives.length === 0 ? (
                <div className="text-center py-12 text-gray-400 italic">No papers or notifications currently in archives database.</div>
              ) : (
                archives.map((arch) => (
                  <div key={arch.id} className="p-4 hover:bg-amber-50/10 flex items-start justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <span className="inline-block px-2 py-0.5 border text-[8px] uppercase font-black tracking-wider text-indigo-900 border-indigo-200 bg-indigo-50 rounded">
                        {arch.type}
                      </span>
                      <h4 className="font-bold text-gray-900 line-clamp-1">{arch.title}</h4>
                      <p className="text-[10px] text-gray-400 font-bold">Class: {arch.classLevel} | Year: {arch.year} | Downloads: {arch.downloadCount || 0}</p>
                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed mt-2.5">{arch.content}</p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => setEditArchive(arch)}
                        className="p-1 px-2.5 text-[9px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border rounded flex items-center gap-1.5 transition-all"
                      >
                        <Edit className="w-3 h-3 text-indigo-900" /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteArchive(arch.id, arch.title)}
                        className="p-1 px-2.5 text-[9px] font-bold bg-rose-50 hover:bg-rose-105 text-rose-700 border border-rose-200 rounded flex items-center gap-1.5 transition-all"
                      >
                        <Trash2 className="w-3 h-3 text-rose-600" /> Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* -------------------------------------------
          SUB-TAB 4: PARENT DISPUTES & FEEDBACK
          ------------------------------------------- */}
      {false && (
        <div id="admin-feedbacks-tab" className="space-y-6 animate-fade-in text-left">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-extrabold text-indigo-950 text-sm font-sans flex items-center gap-1.5">
                <span>💬 Correspondence & Grade Disputes Inbox</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full uppercase">
                  {feedbacks.filter(f => f.starred).length} Starred
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                A dynamic aggregate of parent feedback reviews, grade card typo disputes, and general ratings received live.
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const res = await fetch("/api/feedbacks");
                if (res.ok) {
                  const data = await res.json();
                  setFeedbacks(data);
                  alert("Disputes Inbox refreshed successfully!");
                }
              }}
              className="bg-indigo-900 border border-indigo-950 text-white rounded-xl px-4 py-2 bg-indigo-950 text-xs font-bold hover:bg-indigo-950 transition-all flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Inbox</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
            {feedbacks.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center text-gray-400 italic lg:col-span-12 border border-gray-200">
                The inbox is clean. No parents disputes or feedback entries listed in database.
              </div>
            ) : (
              <>
                {/* Left Pane: Snippet list (column span 5) */}
                <div className="lg:col-span-5 space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2 px-1">
                    All Messages ({feedbacks.length})
                  </div>
                  {feedbacks.map((item) => {
                    const isSelected = selectedFeedbackId === item.id || (!selectedFeedbackId && feedbacks[0]?.id === item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFeedbackId(item.id)}
                        className={`p-3.5 border rounded-xl cursor-pointer transition-all flex flex-col justify-start gap-1 relative text-left hover:scale-[1.01] ${
                          isSelected
                            ? "border-amber-400 bg-amber-50/40 ring-1 ring-amber-500/20 shadow-xs"
                            : "border-gray-200 bg-white hover:bg-gray-50/50"
                        }`}
                      >
                        {/* Star toggling + Sender Name */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const res = await fetch(`/api/feedbacks/star/${item.id}`, { method: "POST" });
                                const status = await res.json();
                                if (status.success) {
                                  setFeedbacks(feedbacks.map(f => f.id === item.id ? { ...f, starred: !f.starred } : f));
                                }
                              }}
                              className="p-0.5 text-gray-400 hover:text-amber-500 transition-colors"
                              title="Star/Unstar message"
                            >
                              <Star className={`w-3.5 h-3.5 ${item.starred ? "fill-amber-500 text-amber-500" : "text-gray-300"}`} />
                            </button>
                            <span className="font-extrabold text-xs text-indigo-950 truncate">{item.name}</span>
                          </div>
                          <span className="text-[8.5px] bg-slate-100 text-slate-700 border border-slate-200 font-bold px-1.5 py-0.5 rounded font-sans uppercase shrink-0">
                            {item.subject ? item.subject.replace("Clerical Error Report", "Clerical") : "Clerical"}
                          </span>
                        </div>
                        {/* Snippet summary */}
                        <p className="text-[10.5px] text-gray-450 truncate mt-0.5">
                          {item.description || "No description provided."}
                        </p>
                        {/* Contact details row */}
                        <div className="flex items-center justify-between mt-1 pt-1.5 border-t border-gray-100/50 text-[9px] text-gray-400 font-semibold font-mono">
                          <span>📞 {item.phone}</span>
                          <span className="flex items-center gap-0.5 text-amber-500">
                            ★ {item.rating || 5}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Right Pane: Message body display (column span 7) */}
                <div className="lg:col-span-7">
                  {(() => {
                    const selectedItem = feedbacks.find(f => f.id === selectedFeedbackId) || feedbacks[0];
                    if (!selectedItem) return null;
                    return (
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col justify-start space-y-5 shadow-sm min-h-[480px]">
                        {/* Envelope Header info */}
                        <div className="border-b pb-4 border-gray-100 space-y-3 font-sans">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <span className="text-[9px] bg-indigo-50 text-indigo-900 border border-indigo-200 font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wide">
                                Subj: {selectedItem.subject || "Clerical marks issue"}
                              </span>
                              <h4 className="font-extrabold text-indigo-950 text-sm mt-2">{selectedItem.name}</h4>
                              <p className="text-[10.5px] text-gray-400 font-semibold">{selectedItem.address || "No custom address provided by citizen"}</p>
                            </div>

                            <button
                              type="button"
                              onClick={async () => {
                                const res = await fetch(`/api/feedbacks/star/${selectedItem.id}`, { method: "POST" });
                                const status = await res.json();
                                if (status.success) {
                                  setFeedbacks(feedbacks.map(f => f.id === selectedItem.id ? { ...f, starred: !f.starred } : f));
                                }
                              }}
                              className={`px-3 py-1.5 border rounded-xl text-xs cursor-pointer flex items-center gap-1.5 transition-all ${
                                selectedItem.starred
                                  ? "bg-amber-50 border-amber-300 text-amber-600 font-bold"
                                  : "bg-white text-gray-500 hover:bg-gray-50 border-gray-200"
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${selectedItem.starred ? "fill-amber-500 text-amber-500" : ""}`} />
                              <span>{selectedItem.starred ? "Starred Match" : "Star Correspondence"}</span>
                            </button>
                          </div>

                          <div className="flex flex-wrap justify-between items-center text-[11px] text-gray-500 border-t pt-3 mt-1 gap-2 font-semibold">
                            <span className="flex items-center gap-1">📞 Contact phone: <strong className="text-indigo-950">{selectedItem.phone}</strong></span>
                            <div className="flex items-center gap-1">
                              <span>Stars Rating:</span>
                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: selectedItem.rating || 5 }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Message Description */}
                        <div className="space-y-4">
                          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 italic text-[11.5px] leading-relaxed text-gray-700 font-semibold whitespace-pre-wrap">
                            "{selectedItem.description}"
                          </div>

                          {/* Annotated markup rendering */}
                          {selectedItem.screenshot ? (
                            <div className="space-y-1.5 pt-2 text-left">
                              <span className="block text-[10px] text-indigo-950 font-black uppercase tracking-wider font-sans">
                                🎨 High Resolution Bounding Box Canvas Screenshot:
                              </span>
                              <div className="border border-amber-200 rounded-xl overflow-hidden bg-slate-50 max-h-[380px] flex justify-center relative shadow-inner p-2">
                                <img
                                  src={selectedItem.screenshot}
                                  alt="Annotated parent claim"
                                  className="object-contain max-h-[360px] max-w-full rounded-lg"
                                />
                              </div>
                              <p className="text-[9.5px] text-center text-gray-400 italic">This represents the exact error region marked by user on drawing grid.</p>
                            </div>
                          ) : (
                            <div className="py-10 text-center text-gray-400 border border-dashed border-gray-200 rounded-xl text-xs">
                              No canvas-marked digital report card included with this complaint.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* -------------------------------------------
          SUB-TAB 4.5: SUPPORT HELP HELPDESK TICKETS
          ------------------------------------------- */}
      {false && (
        <div id="admin-support-tickets-tab" className="space-y-6 animate-fade-in text-left">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-extrabold text-indigo-950 text-sm font-sans flex items-center gap-1.5">
                <HelpCircle className="w-5 h-5 text-indigo-900" />
                <span>📞 Student Helpdesk & Amendment Tickets Inbox</span>
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                View spelling correction requests, roll discrepancy complaints, and support ticket submissions from active candidatures.
              </p>
            </div>
            <button
              onClick={() => fetchAllDevData()}
              className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Tickets</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
            {/* Main Listings */}
            <div className="md:col-span-3 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="bg-indigo-950 text-white font-semibold">
                      <th className="p-3 pl-4">Ticket ID</th>
                      <th className="p-3">Candidate</th>
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Issue/Discrepancy Details</th>
                      <th className="p-3 text-center">Contact</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 pr-4 text-center">Operator Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {supportTickets.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400 italic">No incoming support tickets or amendment complaints found.</td>
                      </tr>
                    ) : (
                      supportTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-slate-50/50">
                          <td className="p-3.5 pl-4 font-mono font-bold text-indigo-900">#{ticket.id}</td>
                          <td className="p-3.5 font-sans font-bold text-gray-800">{ticket.student_name || <span className="text-gray-400 italic">Not Provided</span>}</td>
                          <td className="p-3.5 font-mono text-gray-500">{ticket.roll_number || <span className="text-gray-400 italic">Not Provided</span>}</td>
                          <td className="p-3.5 text-gray-600 font-medium max-w-sm whitespace-normal leading-relaxed">{ticket.issue_description}</td>
                          <td className="p-3.5 text-center font-mono font-bold text-indigo-950">{ticket.contact_number}</td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold ${
                              ticket.status === "Resolved" 
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200" 
                                : "bg-amber-50 text-amber-800 border border-amber-250 animate-pulse"
                            }`}>
                              {ticket.status}
                            </span>
                          </td>
                          <td className="p-3.5 pr-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {ticket.status !== "Resolved" ? (
                                <button
                                  onClick={() => handleUpdateTicketStatus(ticket.id, "Resolved")}
                                  className="p-1 px-2.5 text-[9px] font-black bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                  title="Mark as resolved"
                                >
                                  ✔ Mark Resolved
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateTicketStatus(ticket.id, "Pending")}
                                  className="p-1 px-2.5 text-[9px] font-black bg-slate-50 text-gray-600 border border-gray-200 hover:bg-gray-100 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                                  title="Reopen ticket status as pending"
                                >
                                  🔄 Reopen Ticket
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------
          SUB-TAB 5: SECURITY AUDIT ACTION TRAILING LOGS
          ------------------------------------------- */}
      {activeSubTab === "activity_logs" && userRole === "superadmin" && (
        <div id="admin-sec-activity-logs" className="space-y-6 animate-fade-in text-left">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="font-extrabold text-indigo-950 text-sm font-sans flex items-center gap-1.5 text-rose-600">
                <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
                <span>🛡️ Anti-Tamper Legal Security Logs (Super Admin-Only)</span>
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Immutable, secure trails of all administrative actions, logins, database drops, marks amendments and overrides.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  if (!confirm("Are you absolutely sure you want to completely clear legal security audit history? This action is irreversible.")) return;
                  try {
                    const res = await fetch("/api/logs/clear", { method: "POST" });
                    if (res.ok) {
                      setActivityLogs([]);
                      alert("Audit trailing history cleared successfully! Secure zero-log initiated.");
                    }
                  } catch (err) {
                    alert("Failure executing security command.");
                  }
                }}
                className="bg-rose-600 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-rose-700 transition-all cursor-pointer"
              >
                Clear Audit Trail
              </button>
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/logs");
                  if (res.ok) {
                    const lg = await res.json();
                    setActivityLogs(lg);
                    alert("Audit log streams synced successfully!");
                  }
                }}
                className="bg-indigo-900 text-white rounded-xl px-4 py-2 text-xs font-bold hover:bg-indigo-950 transition-all flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Stream Feed</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-900 text-emerald-400 rounded-2xl shadow-xl overflow-hidden font-mono border border-indigo-950">
            <div className="p-4 bg-slate-950 text-slate-400 border-b border-indigo-950 flex items-center justify-between text-xs">
              <span>🗄️ SHELL DATABASE SECURE TRANSACTION TRAILING</span>
              <span className="text-[10px] text-emerald-500 animate-pulse font-mono font-bold tracking-wider">● SECURE STREAM FEED</span>
            </div>

            <div className="p-4 overflow-y-auto max-h-96 divide-y divide-[#1e293b]/50 text-xs space-y-3">
              {activityLogs.length === 0 ? (
                <div className="text-center py-12 text-slate-500 italic">No administrative transactions recorded. Security checks green.</div>
              ) : (
                activityLogs.map((log) => (
                  <div key={log.id} className="pt-3 pb-1 first:pt-0 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-400 flex-wrap gap-2">
                      <span>[{new Date(log.timestamp).toLocaleString()}]</span>
                      <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded tracking-wide border border-slate-700 uppercase">
                        Admin: {log.adminId}
                      </span>
                    </div>

                    <p className="text-emerald-300 font-bold">
                      ⚔️ ACTION ID: <span className="text-white text-[11px] uppercase tracking-wider">{log.action}</span>
                    </p>

                    {log.details && (
                      <p className="text-[11px] text-slate-300 leading-normal pl-4 border-l border-emerald-500/50">
                        {log.details}
                      </p>
                    )}

                    {log.changes && (
                      <div className="pl-4 mt-1 text-[10px] text-slate-400 space-y-0.5">
                        <span className="font-bold text-amber-400 block mb-0.5">DATA HISTORIC DELTAS:</span>
                        {log.changes.before && (
                          <div className="line-through text-rose-400 truncate">Before: {JSON.stringify(log.changes.before)}</div>
                        )}
                        {log.changes.after && (
                          <div className="text-emerald-400 truncate">After: {JSON.stringify(log.changes.after)}</div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------
          SUB-TAB 6: VISITOR INSIGHTS & SEARCH LOGS
          ------------------------------------------- */}
      {activeSubTab === "visitor_logs" && (
        <div id="admin-visitor-search-logs" className="space-y-6 animate-fade-in text-left">
          {/* Header & Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Portal Searches (All Time)</p>
                <p className="text-2xl font-black text-indigo-950 mt-1">{totalVisitorLogs}</p>
                <p className="text-[9px] text-gray-500 mt-1">Absolute historical user queries logged</p>
              </div>
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-900 border border-indigo-100">
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Total Portal Visits/Searches Checked Today</p>
                <p className="text-2xl font-black text-amber-700 mt-1">{todayVisitorCount}</p>
                <p className="text-[9px] text-gray-500 mt-1">Searches conducted on the current UTC date</p>
              </div>
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 border border-amber-200">
                <TrendingUp className="w-5 h-5 text-amber-500" />
              </div>
            </div>
          </div>

          {/* Log selector tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setLogViewTab("search")}
              className={`pb-2.5 px-6 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                logViewTab === "search" ? "border-amber-500 text-indigo-950" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              📊 Live Search Telemetry / অনুসন্ধান ট্র্যাকিং
            </button>
            <button
              onClick={() => setLogViewTab("audit")}
              className={`pb-2.5 px-6 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border-b-2 ${
                logViewTab === "audit" ? "border-amber-500 text-indigo-950" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
            >
              🛡️ Personnel Activity Logs / অডিট লগ
            </button>
          </div>

          {logViewTab === "search" ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-indigo-950">ইউজার ট্র্যাকিং এবং অনুসন্ধান লগ (Live Search Activity Stream)</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Real-time telemetry stream of portal searches. Tracks roll numbers or names looked up by parents and students.</p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchVisitorLogs(0)}
                  disabled={visitorLogsLoading}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${visitorLogsLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Stream Feed</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-bold text-[10px] uppercase">
                      <th className="p-3.5 font-semibold">Timestamp / সময়</th>
                      <th className="p-3.5 font-semibold">Searched Term (Roll/Name)</th>
                      <th className="p-3.5 font-semibold text-center">Action Status</th>
                      <th className="p-3.5 font-semibold text-right">IP Snippet</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {visitorLogsLoading && visitorLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-400 italic">
                          Loading live telemetry stream...
                        </td>
                      </tr>
                    ) : visitorLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-10 text-center text-gray-400 italic">
                          No search activities recorded in audit logs.
                        </td>
                      </tr>
                    ) : (
                      visitorLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                            {new Date(log.timestamp).toLocaleString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit"
                            })}
                          </td>
                          <td className="p-3.5 font-semibold text-indigo-950">
                            {log.search_query}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.action_status?.includes("Found:") 
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                                : log.action_status?.includes("Found")
                                ? "bg-indigo-50 text-indigo-750 border border-indigo-100"
                                : "bg-rose-50 text-rose-750 border border-rose-100"
                            }`}>
                              {log.action_status || "No Match"}
                            </span>
                          </td>
                          <td className="p-3.5 text-right font-mono text-gray-400 text-[10px]">
                            {log.ip_address || "127.0.0.1"}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalVisitorLogs > visitorLogsLimit && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs bg-slate-50/30">
                  <p className="text-gray-500 font-medium">
                    Showing <span className="font-bold text-gray-800">{visitorLogsPage * visitorLogsLimit + 1}</span> to{" "}
                    <span className="font-bold text-gray-800">
                      {Math.min((visitorLogsPage + 1) * visitorLogsLimit, totalVisitorLogs)}
                    </span>{" "}
                    of <span className="font-bold text-gray-800">{totalVisitorLogs}</span> searches
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={visitorLogsPage === 0 || visitorLogsLoading}
                      onClick={() => fetchVisitorLogs(visitorLogsPage - 1)}
                      className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={(visitorLogsPage + 1) * visitorLogsLimit >= totalVisitorLogs || visitorLogsLoading}
                      onClick={() => fetchVisitorLogs(visitorLogsPage + 1)}
                      className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-indigo-950">মাস্টার সিস্টেম অডিট লগ (Personnel Master Modifications Trail)</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">Real-time audit log of all administrative, committee, sub-admins and data-entry member mutations.</p>
                </div>
                <button
                  type="button"
                  onClick={() => fetchSystemAuditLogs(0)}
                  disabled={systemAuditLogsLoading}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border border-indigo-200 font-bold rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${systemAuditLogsLoading ? 'animate-spin' : ''}`} />
                  <span>Sync Audit Trail</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-gray-100 text-gray-500 font-bold text-[10px] uppercase">
                      <th className="p-3.5 font-semibold">Timestamp / সময়</th>
                      <th className="p-3.5 font-semibold">User / ব্যবহারকারী</th>
                      <th className="p-3.5 font-semibold">Role / পদবি</th>
                      <th className="p-3.5 font-semibold">Action Performed / সম্পাদিত কাজ</th>
                      <th className="p-3.5 font-semibold text-right">Device & IP / ডিভাইস এবং আইপি</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {systemAuditLogsLoading && systemAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                          Loading master system audit logs...
                        </td>
                      </tr>
                    ) : systemAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-10 text-center text-gray-400 italic">
                          No administrative personnel actions recorded yet.
                        </td>
                      </tr>
                    ) : (
                      systemAuditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-3.5 font-mono text-gray-500 text-[11px]">
                            {log.timestamp}
                          </td>
                          <td className="p-3.5 font-bold text-slate-900">
                            {log.user_full_name}
                          </td>
                          <td className="p-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                              log.account_role?.includes("Supreme")
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-100 animate-pulse"
                                : log.account_role?.includes("Sub-Admin")
                                ? "bg-amber-50 text-amber-700 border border-amber-100"
                                : "bg-indigo-50 text-indigo-750 border border-indigo-100"
                            }`}>
                              {log.account_role}
                            </span>
                          </td>
                          <td className="p-3.5 font-semibold text-slate-900">
                            {log.action_performed}
                          </td>
                          <td className="p-3.5 text-right font-mono text-gray-400 text-[10px]">
                            {log.device_info}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Personnel logs Pagination */}
              {totalSystemAuditLogs > 50 && (
                <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs bg-slate-50/30">
                  <p className="text-gray-500 font-medium">
                    Showing <span className="font-bold text-gray-800">{systemAuditLogsPage * 50 + 1}</span> to{" "}
                    <span className="font-bold text-gray-800">
                      {Math.min((systemAuditLogsPage + 1) * 50, totalSystemAuditLogs)}
                    </span>{" "}
                    of <span className="font-bold text-gray-800">{totalSystemAuditLogs}</span> audit logs
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={systemAuditLogsPage === 0 || systemAuditLogsLoading}
                      onClick={() => fetchSystemAuditLogs(systemAuditLogsPage - 1)}
                      className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={(systemAuditLogsPage + 1) * 50 >= totalSystemAuditLogs || systemAuditLogsLoading}
                      onClick={() => fetchSystemAuditLogs(systemAuditLogsPage + 1)}
                      className="px-3.5 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 font-bold transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Super Admin Approval Override Modal */}
      {showApprovalPrompt && (
        <div className="fixed inset-0 bg-indigo-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-amber-200 p-6 relative animate-scale-up">
            <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Lock className="w-6 h-6 text-red-600" />
            </div>

            <h3 className="text-base font-black text-indigo-950 text-center uppercase tracking-wide">
              Action Locked
            </h3>
            <p className="text-xs font-bold text-amber-600 text-center mt-1">
              Requires Super Admin Approval
            </p>

            <p className="text-xs text-gray-500 text-center mt-3 bg-gray-50 p-3 rounded-lg leading-relaxed border border-gray-100">
              Only the Super Admin (Creator) is permitted to modify global settings, slogans, or administrative passcodes. Please request the Super Admin to authorize this action.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!approvalPasscode.trim()) {
                  setApprovalError("Please enter a passcode.");
                  return;
                }
                try {
                  const res = await fetch("/api/auth", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ passcode: approvalPasscode })
                  });
                  const data = await res.json();
                  if (data.success) {
                    setUserRole("superadmin");
                    const approvedTok = data.token || approvalPasscode;
                    setPasscode(approvedTok);
                    setShowApprovalPrompt(false);
                    setApprovalError("");
                    
                    setTimeout(() => {
                      if (onApprovedCallback) {
                        onApprovedCallback.run(approvedTok);
                      }
                    }, 100);
                    alert("Super Admin authorization approved! Core customization features are now unlocked.");
                  } else {
                    setApprovalError("Unauthorized Passcode: Access denied by server.");
                  }
                } catch (err) {
                  setApprovalError("Network error. Verification failed.");
                }
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="block text-[9.5px] uppercase tracking-wider font-extrabold text-gray-500 mb-1">
                  Super Admin Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPasscode ? "text" : "password"}
                    placeholder="সুপার এডমিন পাসওয়ার্ড..."
                    value={approvalPasscode}
                    onChange={(e) => setApprovalPasscode(e.target.value)}
                    className="w-full pl-4 pr-12 py-2.5 bg-white border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none text-center font-mono placeholder:text-gray-400 text-lg text-[#0F172A] font-black shadow-sm"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-[#0F172A] transition-colors focus:outline-none cursor-pointer"
                    title={showPasscode ? "Hide Passcode" : "Show Passcode"}
                  >
                    {showPasscode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {approvalError && (
                <p className="text-[10px] text-red-600 font-bold bg-red-50 p-2 rounded-lg text-center">
                  {approvalError}
                </p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowApprovalPrompt(false);
                    setApprovalError("");
                  }}
                  className="flex-1 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-950 hover:bg-indigo-900 rounded-xl transition-all shadow-md"
                >
                  Authorize Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
    </DashboardErrorBoundary>
  );
}

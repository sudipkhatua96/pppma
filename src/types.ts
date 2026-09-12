export interface StudentResult {
  id: string;
  rollNo: string;
  name: string;
  school: string;
  classLevel: string; // e.g. "Class V", "Class VI", "Class VII", "Class VIII"
  marks: number;
  rank: number;
  status: 'Passed' | 'Failed' | 'Absent';
  phone?: string;
  rankOverride?: number; // Super Admin rank override value
  is_prize_winner?: number | boolean; // For Dynamic Prize Winner showcase and Flexible Merit list
}

export interface NoticeOrArchive {
  id: string;
  title: string;
  type: 'question' | 'notice' | 'syllabus';
  year: number;
  classLevel: string; // "All" or specific
  fileUrl?: string;
  content: string; // Body text or content representation
  downloadCount: number;
}

export interface PortalSettings {
  websiteName: string;
  logoText: string;
  primaryColor: string; // e.g. #1a1464 (Indigo)
  accentColor: string;  // e.g. #f5a623 (Saffron Gold)
  themeStyle: 'traditional' | 'modern' | 'academic';
  heroHeading: string;
  heroSubtitle: string;
  examDate: string;
  syllabusDetails: string;
  bgSlideshowUrls: string[];
  bgVideoUrl: string;
  useVideoBg: boolean;
  adminPasscode: string; // Passcode to log in (default "committee2026")
  allowCommitteeModifications?: boolean; // Super Admin togglable switch to allow settings modifications
  footerCopyright?: string;
  footerPhone?: string;
  footerEmail?: string;
  footerDevName?: string;
  footerDevEmail?: string;
  footerSocial?: string;
  footerCompany?: string;
  heroImageUrl?: string;
  searchHelpText?: string;
  is_results_live?: boolean; // Gatekeeper toggle: Draft Mode (false) vs Public Live Mode (true)
  officialLogo?: string;
  developerLogo?: string;
  scrolling_ticker?: string; // Scrolling text ticker at top of page
  scrolling_ticker_label?: string; // Custom label for news ticker e.g. "সরাসরি খবর / LATEST NEWS"
  notice_board_text?: string; // Lines of notices inside notice board section
  syllabusFileUrl?: string; // Link to download actual syllabus guidelines document
}

export interface SupportTicket {
  id: string;
  rollNo?: string;
  studentName?: string;
  issueDescription: string;
  contactNumber: string;
  status: 'pending' | 'resolved' | 'processing';
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
}

export interface FeedbackMessage {
  id: string;
  name: string;
  phone: string;
  address: string;
  subject: string;
  description: string;
  rating: number;
  screenshot?: string; // base64 screenshot data URI with red drawings
  timestamp: string;
  starred?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  username: string;
  role: 'superadmin' | 'committee' | 'data-entry';
  actionType: string; // 'LOGIN' | 'ADD_RESULT' | 'UPDATE_RESULT' | 'DELETE_RESULT' | 'UPDATE_SETTINGS' | 'RANK_BYPASS' | 'RELEASE_RESULTS' ...
  details: string;
}

export interface UserAuth {
  id: string;
  username: string;
  passcode: string;
  name: string;
  role: 'superadmin' | 'committee' | 'data-entry';
}

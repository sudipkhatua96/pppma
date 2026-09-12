# মেধা অন্বেষা ২০২৬ (Medha Anwesha Portal)
### Pindrui Purba Para Medha Anwesha (PPPMA) Official Examination & Talent Portal

<div align="center">

![Medha Anwesha Banner](https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=1200)

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TailwindCSS v4](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**Illuminating, recognizing, and fostering local academic excellence in Bengal's villages and schools.**

</div>

---

## 🌟 Overview / সংক্ষিপ্ত পরিচিতি

**Medha Anwesha (মেধা অন্বেষা)** is an annual competitive talent search examination conducted across primary and secondary schools in Bengal (Purba & Paschim Medinipur / Panskura region).

This portal serves as the official centralized digital system for:
1. **Public Student Result Portal (ফলাফল পোর্টাল)**: Real-time search by Roll Number or Student Name with dynamic suggestions, score verification, QR-authenticated digital report card, and PDF Certificate download.
2. **Admin & Committee Secretariat (এডমিন ড্যাশবোর্ড)**: Role-based administration (Super Admin, Committee Member, Data Entry Member) for managing candidate marks, publishing results, reviewing parent disputes, managing past papers, and updating website layout.
3. **Past Question & Notice Archive (পরীক্ষা আর্কাইভ)**: Downloadable past questions, syllabus guidelines, and official announcements filtered by class (Class I - X) and year.
4. **Bilingual AI Chatbot Assistant (মেধা অন্বেষা সহকারী)**: Powered by Gemini AI to answer candidates and parents in Bengali and English about syllabus, exam schedule, result queries, and exam rules.
5. **Interactive & Accessible UI**: Includes Day/Night/Eye-Comfort Sepia theme switcher, real-time local clock, lotus particle trail, animated backdrops, and mobile responsive design.

---

## 🚀 Features / বৈশিষ্ট্যসমূহ

- 🔍 **Instant Student Result Search**: Search by Roll No (e.g. `MA-2026-601`) or Candidate Name.
- 📜 **QR-Verified PDF Certificate Generator**: Auto-generates high-resolution academic certificates for candidates using `jsPDF` with instant print preview.
- 🔒 **Role-Based Admin Access**:
  - **Super Admin**: Full control over results release, settings CMS, audit activity trails, and database backups.
  - **Committee Members**: Marks review, syllabus management, dispute ticket processing.
  - **Data Entry Members**: Bulk CSV/Excel spreadsheet upload and candidate marks entry.
- 📊 **Visual Analytics Bento Box**: Top scorers showcase, passing percentage metrics, and average score distribution.
- 💬 **Bilingual AI Chatbot**: Integrated with Google Gemini AI for instant natural language help.
- 🎨 **Multi-Theme System**:
  - ☀️ **Normal Theme**: High contrast indigo and golden styling.
  - 🌙 **Comfort Dark Mode**: Charcoal deep-space styling.
  - 👁️ **Eye Saver Sepia Mode**: Warm cream tone for prolonged night viewing.
- 📱 **Full Mobile Responsiveness**: Seamless experience on smartphones, tablets, and desktops.

---

## 🛠️ Technology Stack / প্রযুক্তিসমূহ

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Motion (Framer Motion), Lucide React, React Markdown, QRCode.react, jsPDF, html2canvas, XLSX.
- **Backend**: Express.js (Node.js), TypeScript (TSX/ESBuild), Better-SQLite3 (WAL Mode), BcryptJS, Dotenv.
- **AI Integration**: Google Gen AI SDK (`@google/genai`).
- **Build Tool**: Vite 6.

---

## 💻 Local Development / লোকাল সেটআপ

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` or `yarn`

### 1. Clone the Repository
```bash
git clone https://github.com/sudipkhatua96/pppma.git
cd pppma
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local` or `.env`:
```bash
cp .env.example .env.local
```
Fill in your credentials:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
ADMIN_PASSWORD="your-admin-password"
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 📤 Git Repository & Push Instructions / গিট পুশ করার নিয়মাবলী

The repository remote is configured for:
`https://github.com/sudipkhatua96/pppma.git`

To push your latest commits to GitHub:

```bash
# 1. Check current status
git status

# 2. Stage all files
git add .

# 3. Commit changes
git commit -m "feat: complete Medha Anwesha portal with multi-theme, admin CMS, results verification, and responsive UI"

# 4. Push to main branch
git branch -M main
git push -u origin main
```

---

## 👥 Roles & Default Logins / এডমিন লগইন তথ্য

| Role | Default Username | Default Password Pattern | Permissions |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `superadmin1` ... `superadmin5` | `Admin@112345` ... `Admin@123455` | Full administrative, Result release, Audit logs, CMS |
| **Committee Member** | `comm1` ... `comm20` | `Committee@1` ... `Committee@20` | Results entry, Question archives, Feedback processing |
| **Data Entry** | `member1` ... `member100` | `Member@1` ... `Member@100` | Student marks data entry |

*(Passwords are automatically hashed securely with Bcrypt upon startup)*

---

## 👨‍💻 Developer & Credits

- **Developer**: Sudip Khatua
- **Portfolio / Website**: [www.xestus.in](https://www.xestus.in)
- **Email**: [sudipkhatua808@gmail.com](mailto:sudipkhatua808@gmail.com) / [xestus.office@gmail.com](mailto:xestus.office@gmail.com)
- **Organization**: Pindrui Purba Para Medha Anwesha Committee
- **Copyright**: © 2026 Medha Anwesha Committee. All Public Rights Reserved.

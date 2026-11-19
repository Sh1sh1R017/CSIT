# freeCSIT - 6th Semester Study Portal

[![Deploy freeCSIT to GitHub Pages](https://github.com/Sh1sh1R017/CSIT/actions/workflows/deploy.yml/badge.svg)](https://github.com/Sh1sh1R017/CSIT/actions/workflows/deploy.yml)
[![Live Portal](https://img.shields.io/badge/Live%20Portal-GitHub%20Pages-brightgreen?logo=github)](https://sh1sh1r017.github.io/CSIT/)
[![Google Drive Cloud](https://img.shields.io/badge/Google%20Drive-Cloud%20Library%20(1.4GB)-4285F4?logo=googledrive&logoColor=white)](https://drive.google.com/drive/folders/1zdvmVr-IcpIf48yrCKAXJ0VqDhRNwOOM)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

A modern, high-contrast, offline-capable study portal and academic resource mirror for **Tribhuvan University (TU) B.Sc. CSIT Sixth (6th) Semester** students.

---

## 🌐 Live Web Portal

Access the hosted web portal anytime at:
👉 **[https://sh1sh1r017.github.io/CSIT/](https://sh1sh1r017.github.io/CSIT/)**

---

## ☁️ Google Drive Cloud Archive (1.4 GB)

All high-resolution textbook editions, lecture slides, practical codes, and reference volumes are mirrored in the official cloud library:
👉 **[Open freeCSIT 6th Semester Google Drive Cloud Archive](https://drive.google.com/drive/folders/1zdvmVr-IcpIf48yrCKAXJ0VqDhRNwOOM)**

### 🔍 Individual Google Drive Preview & Targeted Search
- **Dual-Mode PDF Viewer**: Switch seamlessly between `☁️ Google Drive Preview` and `📄 In-Browser Viewer` directly inside the reader modal.
- **Targeted Cloud Search**: 1-click `☁️ Drive` action on any resource file triggers an instant, exact-match search query (`https://drive.google.com/drive/search?q="<filename>"`) inside Google Drive.
- **Custom Link Binding**: Click `⚙️` on any resource card to bind a custom Google Drive sharing link or File ID for automatic in-modal previews (saved persistently in `localStorage`).

---

## ✨ Comprehensive Features

### 1. 📚 6 Core Courses Covered
- **`CSC367`**: .NET Technology (C#, ASP.NET Core, ADO.NET, LINQ, Web APIs)
- **`CSC365`**: Compiler Design and Construction (Lexical Analysis, Parsers, Syntax-Directed Translation, Code Gen)
- **`CSC364`**: Software Engineering (Agile, Scrum, Architecture, Testing, Maintenance)
- **`CSC370`**: E-Commerce (Payment Gateways, Security, B2B/B2C Models, Electronic Markets)
- **`CSC366`**: E-Governance (E-Government Frameworks, Security, Infrastructure, Policy)
- **`CSC379`**: Technical Writing (Proposals, Technical Reports, Research Documentation, Ethics)

### 2. 📝 45 Authentic TU Board Question Papers & Solutions
- Formatted with authentic university examination headers, full marks breakdown, Group A (Long Questions) and Group B (Short Questions).
- Covers exams from **2082 down to 2076**.
- **479 verified model answers** with chapter mapping and expandable answer drawers.

### 3. 🎬 246 Curated Video Lectures (Aligned to TU Micro-Syllabus)
- Strictly deduplicated and organized chapter-by-chapter according to the official syllabus.
- **Prioritizes authentic Nepali language lectures** (173 Nepali tutorial videos).
- Features built-in 16:9 responsive YouTube player modal, direct YouTube navigation links, and 1-click iframe embed copying.

### 4. 👓 Dynamic Readability & Accessibility Controls
- Integrated **Text-Scaler widget** (100% to 140% dynamic scaling).
- Enhanced contrast typography with crisp Inter-based font hierarchy.
- Smooth unit navigators and chapter drawers designed for distraction-free exam preparation.

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm`

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Sh1sh1R017/CSIT.git
cd CSIT
npm install
```

### 2. Run Local Development Server
```bash
npm run app:dev
```
Open **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)** in your browser.

### 3. Build for Production
```bash
npm run build
```
Builds the production-ready bundle to `local-study-app/dist` with relative paths for GitHub Pages or static web servers.

### 4. Run Test Suite
```bash
npm test
```
Runs unit tests verifying URL normalization, scope validation, and schema deduplication.

---

## 📂 Project Architecture

```
CSIT/
├── .github/
│   └── workflows/
│       └── deploy.yml          # Automated CI/CD deployment to GitHub Pages
├── local-study-app/            # freeCSIT React + TypeScript + Vite web app
│   ├── src/
│   │   ├── main.tsx            # Main application UI, routing, and modals
│   │   └── style.css           # High-contrast readable CSS design system
│   ├── public/
│   │   └── data/               # Static study data
│   │       ├── portalData.json
│   │       ├── subjectVideos.json
│   │       └── questionBanks.json
│   ├── vite.config.ts          # Vite build config with relative base path
│   └── package.json
├── src/                        # Data crawler & transformation pipeline
│   ├── cli.ts
│   └── ...
├── test/                       # Unit tests
├── package.json                # Root workspace configuration
└── README.md
```

---

## 👨‍💻 Author & Attribution

Curated & Maintained by **SHISHIR** for TU B.Sc. CSIT students.  
*Content sources: easyCSIT, HamroCSIT, Kathmandu Engineering College, and Ankit Pangeni Archive.*  
*All study materials are aggregated strictly for academic and educational non-profit purposes.*

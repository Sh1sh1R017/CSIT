# freeCSIT - 6th Semester Study Portal

A comprehensive, offline-capable study portal for Tribhuvan University B.Sc. CSIT Sixth Semester students.

## ✨ Features

- **6 Core Courses Covered**:
  - `CSC367`: .NET Technology
  - `CSC365`: Compiler Design and Construction (CDC)
  - `CSC364`: Software Engineering (SE)
  - `CSC370`: E-Commerce
  - `CSC366`: E-Governance
  - `CSC379`: Technical Writing (TW)
- **45 Authentic TU Board Question Papers**: Complete past papers from 2082 down to 2076 formatted with university headers, Group A/B marks breakdown, and 479 verified solutions.
- **246 Curated Video Lectures**: Strictly deduplicated chapter-by-chapter mapping to the official TU micro-syllabus, prioritizing authentic Nepali lectures (173 Nepali tutorials), responsive 16:9 embedded iframe players, timestamps, and 1-click iframe copy.
- **KEC & Reference Textbooks**: Kathmandu Engineering College and TU curriculum reference textbooks.
- **Lab Manuals & Practical Code**: Complete C# code, Lex/Yacc parsers, case studies, and lab reports.
- **Official TU Micro-Syllabus**: Credit hours, lecture breakdowns, and course objectives.
- **☁️ Google Drive Cloud Archive**: Direct cloud access to 1.4 GB of high-resolution KEC books, reference textbooks, lecture slides, and project files.

## ☁️ Google Drive Cloud Library (1.4 GB)

All heavy textbooks, lecture notes, and lab manuals are accessible via Google Drive:
👉 **[Open 6th Semester Google Drive Cloud Archive](https://drive.google.com/drive/folders/1zdvmVr-IcpIf48yrCKAXJ0VqDhRNwOOM)**

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Study App
```bash
npm run app:dev
```
Open **[http://127.0.0.1:5173/](http://127.0.0.1:5173/)** in your browser.

### 3. Run Unit Tests
```bash
npm test
```

## 📂 Project Structure

- `local-study-app/` — React + TypeScript + Vite application (freeCSIT user interface)
- `local-study-app/public/data/` — JSON datasets (`portalData.json`, `subjectVideos.json`, `questionBanks.json`)
- `src/` — Crawler, parser, and normalization pipeline
- `data/` — Raw exports and indices
- `test/` — Unit test suite verifying schema validation and URL filtering

## 👨‍💻 Author

Curated & Maintained by **SHISHIR** for CSIT students.
Content attribution: easyCSIT.com, HamroCSIT, and Ankit Pangeni Archive.
All materials preserved for offline educational and academic study.

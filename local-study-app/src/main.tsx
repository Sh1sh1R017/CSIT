import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";

interface ResourceFile {
  relPath: string;
  webPath: string;
  driveUrl?: string;
  name: string;
  ext: string;
  size: number;
}

interface UnitInfo {
  unit: number;
  title: string;
  hours: number;
  desc: string;
}

interface SubjectData {
  slug: string;
  code: string;
  shortName: string;
  name: string;
  type: "Compulsory" | "Elective";
  credits: number;
  nature: string;
  fullMarks: string;
  passMarks: string;
  description: string;
  objectives: string;
  units: UnitInfo[];
  totalFiles: number;
  driveFolderUrl?: string;
  resources: {
    kecBooks: ResourceFile[];
    notes: ResourceFile[];
    oldIsGold: ResourceFile[];
    oldQuestions: ResourceFile[];
    practicals: ResourceFile[];
    referenceBooks: ResourceFile[];
    caseStudies: ResourceFile[];
  };
}

interface ScrapedRecord {
  id: string;
  sourceUrl: string;
  title: string;
  subject: string | null;
  topic: string | null;
  question: string;
  cleanQuestion?: string;
  answer: string | null;
  answerStatus: "visible" | "not_visible" | "empty" | "uncertain";
  contentType: "question" | "note" | "past_paper" | "unknown";
  examYear?: string | null;
}

interface QuestionBankQuestion {
  id: string;
  number: string;
  text: string;
  html: string;
  marks?: string;
  hamroLink: string;
  hasAnswer: boolean;
  answerHtml?: string;
  answerText?: string;
  answerCharCount?: number;
}

interface QuestionBankSection {
  sectionTitle: string;
  instructions: string;
  questions: QuestionBankQuestion[];
}

interface QuestionBankPaper {
  id: string;
  subjectCode: string;
  subjectName: string;
  subjectSlug: string;
  year: string;
  yearLabel: string;
  university: string;
  institute: string;
  level: string;
  courseInfo: string;
  fullMarks: string;
  passMarks: string;
  time: string;
  instructions: string[];
  sections: QuestionBankSection[];
  totalQuestions: number;
}

interface CommonResources {
  microSyllabus?: ResourceFile;
  allOldIsGold?: ResourceFile;
  modelQuestions?: ResourceFile;
  oldQuestionYears: Array<{ year: string; files: ResourceFile[] }>;
}

interface VideoLecture {
  id: string;
  videoId: string;
  title: string;
  chapterNumber: number;
  chapterName: string;
  durationSeconds: number;
  durationFormatted: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelLogo?: string;
  viewCount?: number;
  likeCount?: number;
  guide?: string;
  iframeHtml: string;
  watchUrl: string;
  source: string;
}

interface VideoChapter {
  chapterNumber: number;
  chapterName: string;
  totalVideos: number;
  videos: VideoLecture[];
}

interface SubjectVideos {
  subjectCode: string;
  subjectName: string;
  shortName: string;
  subjectSlug: string;
  icon?: string;
  easyCsitUrl: string;
  totalChapters: number;
  totalVideos: number;
  chapters: VideoChapter[];
}

interface VideoLecturesData {
  title: string;
  source: string;
  lastUpdated: string;
  totalSubjects: number;
  grandTotalVideos: number;
  subjects: SubjectVideos[];
}

interface PortalData {
  portalTitle: string;
  semester: string;
  program: string;
  totalSubjects: number;
  subjects: SubjectData[];
  commonResources: CommonResources;
  scrapedRecords: ScrapedRecord[];
  questionBankPapers?: QuestionBankPaper[];
  videoLectures?: VideoLecturesData;
  driveRootUrl?: string;
  lastUpdated: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function cleanFileName(name: string): string {
  return name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
}

/* ==========================================================================
   QUESTION PAPER VIEWER COMPONENT (HAMROCSIT QUESTION BANK FORMAT)
   ========================================================================== */

function QuestionPaperViewer({
  papers,
  selectedSubjectCode,
  selectedYear,
  onSelectSubjectCode,
  onSelectYear,
  subjects,
  openPdfViewer,
  showSubjectSelector = true,
}: {
  papers: QuestionBankPaper[];
  selectedSubjectCode: string;
  selectedYear: string;
  onSelectSubjectCode?: (code: string) => void;
  onSelectYear: (year: string) => void;
  subjects: SubjectData[];
  openPdfViewer: (file: ResourceFile) => void;
  showSubjectSelector?: boolean;
}) {
  const [expandedQId, setExpandedQId] = useState<string | null>(null);

  // Subject's papers filtered by code
  const subjectPapers = useMemo(() => {
    return papers.filter(p => p.subjectCode === selectedSubjectCode);
  }, [papers, selectedSubjectCode]);

  // Current paper
  const currentPaper = useMemo(() => {
    return subjectPapers.find(p => p.year === selectedYear) || subjectPapers[0];
  }, [subjectPapers, selectedYear]);

  // Current subject data
  const currentSubject = useMemo(() => {
    return subjects.find(s => s.code === selectedSubjectCode);
  }, [subjects, selectedSubjectCode]);

  if (!currentPaper) {
    return (
      <div className="empty-box" style={{ padding: 40, textAlign: "center", background: "#ffffff", borderRadius: 8 }}>
        <h4>No Question Bank papers found for this selection.</h4>
        <p className="muted">Please select another subject or year.</p>
      </div>
    );
  }

  // Solved Old is Gold file if available for this subject
  const oigFile = currentSubject?.resources?.oldIsGold?.[0];

  return (
    <div className="view-global-questionbank">
      {/* 1. SUBJECT SELECTOR (IF GLOBAL VIEW) */}
      {showSubjectSelector && onSelectSubjectCode && (
        <div className="qb-subject-selector-bar">
          {subjects.map(s => {
            const hasPapers = papers.some(p => p.subjectCode === s.code);
            const isSelected = selectedSubjectCode === s.code;
            return (
              <button
                key={s.code}
                className={`qb-subject-btn ${isSelected ? "active" : ""}`}
                onClick={() => {
                  onSelectSubjectCode(s.code);
                  const firstYr = papers.find(p => p.subjectCode === s.code)?.year;
                  if (firstYr) onSelectYear(firstYr);
                }}
              >
                <span className="qb-badge-code">{s.code}</span>
                <span>{s.shortName}</span>
                {hasPapers && <span style={{ opacity: 0.7, fontSize: 11 }}>•</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* 2. MAIN SPLIT LAYOUT (SIDEBAR FOR EXAM YEARS + TU PAPER SHEET) */}
      <div className="qb-layout">
        {/* SIDEBAR: EXAM YEARS */}
        <aside className="qb-year-sidebar">
          <h3>
            <span>📅</span> Exam Year
          </h3>
          <div className="qb-years-list">
            {subjectPapers.map(p => (
              <button
                key={p.year}
                className={`qb-year-item ${currentPaper.year === p.year ? "active" : ""}`}
                onClick={() => onSelectYear(p.year)}
              >
                <span>{p.yearLabel}</span>
                <span className="qb-q-count">{p.totalQuestions} Qs</span>
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT AREA: TOOLBAR + PAPER */}
        <div className="qb-paper-area">
          {/* TOOLBAR */}
          <div className="qb-paper-toolbar">
            <div className="qb-toolbar-left">
              <span className="paper-year-badge">{currentPaper.yearLabel}</span>
              <h2>{currentPaper.subjectName} ({currentPaper.subjectCode})</h2>
            </div>
            <div className="qb-toolbar-actions">
              <button className="btn-qb-print" onClick={() => window.print()} title="Print or Save as PDF">
                🖨️ Print Paper
              </button>
              {oigFile && (
                <button className="btn-qb-pdf" onClick={() => openPdfViewer(oigFile)}>
                  📖 Open Solved Old is Gold PDF
                </button>
              )}
              <a
                className="btn-qb-hamro"
                href={`https://hamrocsit.com/semester/sixth/${currentPaper.subjectSlug}/question-bank/${currentPaper.year}`}
                target="_blank"
                rel="noreferrer"
              >
                ↗ HamroCSIT Official
              </a>
            </div>
          </div>

          {/* AUTHENTIC TU BOARD EXAM PAPER SHEET */}
          <div className="tu-exam-paper-sheet question_bank_container">
            {/* UNIVERSITY HEADER */}
            <div className="tu-paper-header syllabus_header">
              <div className="univ-title">{currentPaper.university}</div>
              <div className="inst-title">{currentPaper.institute}</div>
              <div className="year-badge-center">{currentPaper.yearLabel}</div>
            </div>

            {/* MARKS & COURSE SPECIFICATION BAR */}
            <div className="tu-paper-meta marks_header">
              <div className="tu-meta-left">
                <p>{currentPaper.level}</p>
                <p className="course-title-bold">
                  {currentPaper.subjectName} ({currentPaper.subjectCode})
                </p>
              </div>
              <div className="tu-meta-right">
                <p>{currentPaper.fullMarks}</p>
                <p>{currentPaper.passMarks}</p>
                <p>{currentPaper.time}</p>
              </div>
            </div>

            {/* CANDIDATES INSTRUCTIONS */}
            <div className="tu-paper-instructions qn_instructions">
              {currentPaper.instructions.map((inst, i) => (
                <p key={i}>{inst}</p>
              ))}
            </div>

            {/* SECTIONS */}
            {currentPaper.sections.map((sec, secIdx) => (
              <div className="tu-paper-section qn_group" key={secIdx}>
                <div className="tu-section-header">
                  <div className="tu-section-title">{sec.sectionTitle}</div>
                  {sec.instructions && <div className="tu-section-inst">{sec.instructions}</div>}
                </div>

                <div className="tu-questions-list">
                  {sec.questions.map((q) => {
                    const isExpanded = expandedQId === q.id;
                    return (
                      <div key={q.id}>
                        <div
                          className="tu-question-row single_question_container"
                          onClick={() => setExpandedQId(isExpanded ? null : q.id)}
                        >
                          <div className="tu-q-left left_content">
                            <div className="tu-q-number qnbank_number">{q.number}</div>
                            <div className="tu-q-content qnbank_content">
                              <p>{q.text}</p>
                            </div>
                          </div>

                          <div className="tu-q-right right_content">
                            {q.marks && <span className="tu-marks-badge">{q.marks}</span>}
                            {q.hasAnswer && <span className="tu-answer-badge">✓ Solved</span>}
                            <button
                              className="tu-btn-details"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedQId(isExpanded ? null : q.id);
                              }}
                            >
                              {isExpanded ? "Hide Answer ▲" : (q.hasAnswer ? "View Answer ▼" : "Info ▼")}
                            </button>
                            <a
                              className="tu-hamro-link"
                              href={q.hamroLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              title="View Question on HamroCSIT"
                            >
                              ↗ HamroCSIT
                            </a>
                          </div>
                        </div>

                        {/* EXPANDED NOTES / QUESTION METADATA DRAWER */}
                        {isExpanded && (
                          <div className="tu-q-drawer">
                            {q.hasAnswer && q.answerHtml ? (
                              <div className="tu-answer-block">
                                <div className="tu-answer-header">
                                  <div className="tu-answer-title">
                                    <span className="tu-badge-verified">✓ HamroCSIT Solved Answer</span>
                                    {q.answerCharCount ? (
                                      <span className="tu-answer-length">({q.answerCharCount} characters)</span>
                                    ) : null}
                                  </div>
                                  <button
                                    className="tu-btn-copy"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (q.answerText) {
                                        navigator.clipboard.writeText(q.answerText);
                                        alert("Answer copied to clipboard!");
                                      }
                                    }}
                                  >
                                    📋 Copy Answer
                                  </button>
                                </div>
                                <div
                                  className="tu-answer-body contents"
                                  dangerouslySetInnerHTML={{ __html: q.answerHtml }}
                                />
                              </div>
                            ) : (
                              <div className="tu-no-answer-notice">
                                <p>ℹ️ No direct solution posted on HamroCSIT for this question yet.</p>
                              </div>
                            )}

                            <div className="tu-drawer-footer">
                              <p>
                                <strong>Exam:</strong> TU Board Exam {currentPaper.yearLabel} · <strong>Subject:</strong> {currentPaper.subjectName} ({currentPaper.subjectCode})
                              </p>
                              <p>
                                Step-by-step companion textbook & Old is Gold solution:{" "}
                                {oigFile ? (
                                  <button
                                    className="btn-link"
                                    style={{ background: "none", border: "none", color: "#16a34a", textDecoration: "underline", cursor: "pointer", fontWeight: "bold" }}
                                    onClick={() => openPdfViewer(oigFile)}
                                  >
                                    📖 Open Solved Old is Gold PDF
                                  </button>
                                ) : (
                                  "curated lecture notes and textbook chapters in this portal"
                                )}
                              </p>
                              <div className="drawer-links">
                                <a href={q.hamroLink} target="_blank" rel="noreferrer">
                                  ↗ Open Question Discussion on HamroCSIT
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   VIDEO CARD COMPONENT (WITH IFRAME EMBED & PLAY CONTROLS)
   ========================================================================== */

function VideoCard({ video, onPlay }: { video: VideoLecture; onPlay: (v: VideoLecture) => void }) {
  const [copied, setCopied] = useState(false);

  const copyIframe = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(video.iframeHtml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isNepali = video.title.includes("🇳🇵") ||
    video.title.toLowerCase().includes("nepali") ||
    (video.source && video.source.toLowerCase().includes("nepali")) ||
    video.channelTitle?.toLowerCase().includes("nsg") ||
    video.channelTitle?.toLowerCase().includes("it education nepal");

  return (
    <div className="video-lecture-card" onClick={() => onPlay(video)}>
      <div className="video-thumb-wrap">
        <img src={video.thumbnailUrl} alt={video.title} loading="lazy" />
        <div className="video-play-overlay">
          <div className="play-circle">▶</div>
        </div>
        {video.durationFormatted && (
          <span className="video-duration-tag">{video.durationFormatted}</span>
        )}
        <span className={`video-source-tag ${isNepali ? "nepali-tag" : ""}`}>
          {isNepali ? "🇳🇵 Nepali Lecture" : (video.source === "easyCSIT.com" ? "freeCSIT" : "TU CSIT Archive")}
        </span>
      </div>
      <div className="video-card-body">
        <span className="video-chapter-pill">Ch. {video.chapterNumber}: {video.chapterName}</span>
        <h4 className="video-card-title" title={video.title}>{video.title}</h4>
        <div className="video-card-meta">
          <span className="video-channel-name">📺 {video.channelTitle}</span>
          {video.viewCount ? <span className="video-views">👁 {video.viewCount.toLocaleString()} views</span> : null}
        </div>
        <div className="video-card-actions" onClick={e => e.stopPropagation()}>
          <button className="btn-video-play" onClick={() => onPlay(video)}>
            ▶ Watch Video
          </button>
          <button className="btn-video-copy" onClick={copyIframe} title="Copy video iframe embed code">
            {copied ? "✓ Copied!" : "📋 Iframe"}
          </button>
          <a className="btn-video-yt" href={video.watchUrl} target="_blank" rel="noreferrer" title="Open on YouTube">
            ↗ YT
          </a>
        </div>
      </div>
    </div>
  );
}

/* ==========================================================================
   MAIN APP COMPONENT
   ========================================================================== */

function App() {
  const [data, setData] = useState<PortalData | null>(null);
  const [loading, setLoading] = useState(true);

  // Navigation
  const [currentView, setCurrentView] = useState<"home" | "subject" | "questionbank" | "oldisgold" | "syllabus" | "practicals" | "videos">("home");
  const [activeSubject, setActiveSubject] = useState<SubjectData | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"kec" | "notes" | "questionbank" | "oldisgold" | "practicals" | "reference" | "syllabus" | "videos">("kec");
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [openAnswerId, setOpenAnswerId] = useState<string | null>(null);

  // Question Bank Explorer state
  const [selectedQbSubjectCode, setSelectedQbSubjectCode] = useState<string>("CSC370"); // Defaults to E-Commerce
  const [selectedQbYear, setSelectedQbYear] = useState<string>("2082-New");

  // PDF Viewer Modal State
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activePdfTitle, setActivePdfTitle] = useState<string>("");
  const [activePdfDriveUrl, setActivePdfDriveUrl] = useState<string | null>(null);

  // Google Drive Cloud Storage State
  const [driveRootUrl, setDriveRootUrl] = useState<string>(() => {
    return localStorage.getItem("freecsit_drive_url") || "https://drive.google.com/drive/folders/16thSemesterCSITNepalArchive";
  });

  const handleUpdateDriveUrl = () => {
    const entered = window.prompt("Enter your Google Drive folder link for 6th Semester:", driveRootUrl);
    if (entered && entered.trim()) {
      setDriveRootUrl(entered.trim());
      localStorage.setItem("freecsit_drive_url", entered.trim());
    }
  };

  // Video Player Modal & Filter State
  const [activeVideo, setActiveVideo] = useState<VideoLecture | null>(null);
  const [selectedVideoSubjCode, setSelectedVideoSubjCode] = useState<string>("all");
  const [videoSearchQuery, setVideoSearchQuery] = useState<string>("");
  const [onlyNepali, setOnlyNepali] = useState<boolean>(false);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/data/portalData.json")
      .then(res => res.json())
      .then((d: PortalData) => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load portalData.json", err);
        setLoading(false);
      });
  }, []);

  const openSubject = (subj: SubjectData, tab: "kec" | "notes" | "questionbank" | "oldisgold" | "practicals" | "reference" | "syllabus" = "kec") => {
    setActiveSubject(subj);
    setActiveSubTab(tab);
    setSelectedQbSubjectCode(subj.code);
    setSelectedUnit(1);
    setCurrentView("subject");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openQuestionBankView = (subjectCode: string = "CSC370", year?: string) => {
    setSelectedQbSubjectCode(subjectCode);
    if (year) {
      setSelectedQbYear(year);
    } else if (data?.questionBankPapers) {
      const firstYr = data.questionBankPapers.find(p => p.subjectCode === subjectCode)?.year;
      if (firstYr) setSelectedQbYear(firstYr);
    }
    setCurrentView("questionbank");
    setActiveSubject(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openPdfViewer = (file: ResourceFile) => {
    setActivePdfUrl(file.webPath);
    setActivePdfTitle(cleanFileName(file.name));
    setActivePdfDriveUrl(file.driveUrl || (activeSubject?.driveFolderUrl || driveRootUrl));
  };

  const closePdfViewer = () => {
    setActivePdfUrl(null);
    setActivePdfTitle("");
    setActivePdfDriveUrl(null);
  };

  // Filtered subjects
  const filteredSubjects = useMemo(() => {
    if (!data?.subjects) return [];
    if (!searchQuery.trim()) return data.subjects;
    const q = searchQuery.toLowerCase();
    return data.subjects.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.shortName.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    );
  }, [data?.subjects, searchQuery]);

  // Scraped Q&A for active subject
  const currentSubjectQA = useMemo(() => {
    if (!data?.scrapedRecords || !activeSubject) return [];
    return data.scrapedRecords.filter(r => {
      const matchSlug = r.sourceUrl.includes(`/${activeSubject.slug}/`) || (activeSubject.slug === "ncc" && r.sourceUrl.includes("/ncc/"));
      const matchName = r.subject?.toLowerCase().includes(activeSubject.slug) || r.subject?.toLowerCase().includes(activeSubject.code.toLowerCase());
      return matchSlug || matchName;
    });
  }, [data?.scrapedRecords, activeSubject]);

  // Papers for active subject
  const currentSubjectPapers = useMemo(() => {
    if (!data?.questionBankPapers || !activeSubject) return [];
    return data.questionBankPapers.filter(p => p.subjectCode === activeSubject.code);
  }, [data?.questionBankPapers, activeSubject]);

  // Open Video Lectures view
  const openVideosView = (subjectCode: string = "all") => {
    setSelectedVideoSubjCode(subjectCode);
    setCurrentView("videos");
    setActiveSubject(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active subject's videos
  const activeSubjectVideos = useMemo(() => {
    if (!data?.videoLectures?.subjects || !activeSubject) return null;
    return data.videoLectures.subjects.find(s => s.subjectCode === activeSubject.code) || null;
  }, [data?.videoLectures, activeSubject]);

  // Filtered subject videos for the dedicated Videos explorer
  const filteredVideoSubjects = useMemo(() => {
    if (!data?.videoLectures?.subjects) return [];
    let list = data.videoLectures.subjects;
    if (selectedVideoSubjCode !== "all") {
      list = list.filter(s => s.subjectCode === selectedVideoSubjCode);
    }
    const q = videoSearchQuery.toLowerCase().trim();
    list = list.map(s => {
      const filteredChapters = s.chapters.map(ch => {
        let matchedVideos = ch.videos;
        if (onlyNepali) {
          matchedVideos = matchedVideos.filter(v =>
            v.title.includes("🇳🇵") ||
            v.title.toLowerCase().includes("nepali") ||
            (v.source && v.source.toLowerCase().includes("nepali")) ||
            v.channelTitle?.toLowerCase().includes("nsg") ||
            v.channelTitle?.toLowerCase().includes("it education nepal")
          );
        }
        if (q) {
          matchedVideos = matchedVideos.filter(v =>
            v.title.toLowerCase().includes(q) ||
            v.channelTitle?.toLowerCase().includes(q) ||
            ch.chapterName.toLowerCase().includes(q)
          );
        }
        return { ...ch, videos: matchedVideos, totalVideos: matchedVideos.length };
      }).filter(ch => ch.videos.length > 0);
      return {
        ...s,
        chapters: filteredChapters,
        totalVideos: filteredChapters.reduce((acc, c) => acc + c.videos.length, 0)
      };
    }).filter(s => s.totalVideos > 0);
    return list;
  }, [data?.videoLectures, selectedVideoSubjCode, videoSearchQuery, onlyNepali]);

  if (loading || !data) {
    return (
      <div className="portal-loading">
        <div className="spinner"></div>
        <p>Loading freeCSIT 6th Semester Study Portal...</p>
      </div>
    );
  }

  return (
    <div className="portal-root">
      {/* PDF VIEWER MODAL */}
      {activePdfUrl && (
        <div className="pdf-modal-backdrop" onClick={closePdfViewer}>
          <div className="pdf-modal-window" onClick={e => e.stopPropagation()}>
            <div className="pdf-modal-header">
              <div className="pdf-title-box">
                <span className="pdf-badge">PDF DOCUMENT</span>
                <h3>{activePdfTitle}</h3>
              </div>
              <div className="pdf-modal-actions">
                <a className="btn-download" style={{ background: "#16a34a", color: "#ffffff", borderColor: "#15803d" }} href={activePdfDriveUrl || driveRootUrl} target="_blank" rel="noreferrer" title="Open or download in Google Drive">
                  ☁️ Open in Drive
                </a>
                <a className="btn-download" href={activePdfUrl} download target="_blank" rel="noreferrer">
                  ⬇ Download
                </a>
                <a className="btn-external" href={activePdfUrl} target="_blank" rel="noreferrer">
                  ↗ New Tab
                </a>
                <button className="btn-close-modal" onClick={closePdfViewer}>✕</button>
              </div>
            </div>
            <div className="pdf-modal-body">
              <iframe
                src={
                  activePdfUrl.includes("drive.google.com")
                    ? activePdfUrl.replace(/\/view(\?.*)?$/, "/preview")
                    : activePdfUrl
                }
                title={activePdfTitle}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PLAYER MODAL */}
      {activeVideo && (
        <div className="video-modal-backdrop" onClick={() => setActiveVideo(null)}>
          <div className="video-modal-window" onClick={e => e.stopPropagation()}>
            <div className="video-modal-header">
              <div className="video-title-box">
                <span className="video-badge-pill">🎬 {activeVideo.channelTitle || "freeCSIT Video Lecture"}</span>
                <h3>{activeVideo.title}</h3>
                <span className="video-meta-tag">
                  {activeVideo.chapterName ? `Ch. ${activeVideo.chapterNumber}: ${activeVideo.chapterName}` : ""}
                  {activeVideo.durationFormatted ? ` · ⏱ ${activeVideo.durationFormatted}` : ""}
                  {activeVideo.viewCount ? ` · 👁 ${activeVideo.viewCount.toLocaleString()} views` : ""}
                  {activeVideo.source ? ` · 🌐 ${activeVideo.source}` : ""}
                </span>
              </div>
              <div className="video-modal-actions">
                <button
                  className="btn-copy-iframe"
                  onClick={() => {
                    navigator.clipboard.writeText(activeVideo.iframeHtml);
                    alert("Video iframe embed code copied to clipboard!");
                  }}
                  title="Copy Embed Iframe"
                >
                  📋 Copy Iframe
                </button>
                <a className="btn-external" href={activeVideo.watchUrl} target="_blank" rel="noreferrer">
                  ↗ YouTube
                </a>
                <button className="btn-close-modal" onClick={() => setActiveVideo(null)}>✕</button>
              </div>
            </div>
            <div className="video-modal-body">
              <div className="video-iframe-responsive">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideo.videoId}?autoplay=1&rel=0`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              {activeVideo.guide && (
                <div className="video-guide-notes">
                  <h4>💡 Chapter Notes & Timestamps</h4>
                  <div dangerouslySetInnerHTML={{ __html: activeVideo.guide }} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TOP NAVBAR */}
      <nav className="portal-nav">
        <div className="nav-container">
          <div className="nav-brand" onClick={() => { setCurrentView("home"); setActiveSubject(null); }}>
            <div className="brand-icon-box">
              <span className="brand-icon">⚡</span>
            </div>
            <span className="brand-name">
              <span className="brand-free">free</span><span className="brand-csit">CSIT</span>
            </span>
            <span className="brand-badge">Semester 6</span>
          </div>

          <div className="nav-links">
            <button className={currentView === "home" ? "active" : ""} onClick={() => { setCurrentView("home"); setActiveSubject(null); }}>
              🏛️ Subjects (6)
            </button>
            <button className={currentView === "videos" ? "active" : ""} onClick={() => openVideosView("all")}>
              🎬 Videos ({data.videoLectures?.grandTotalVideos || 246})
            </button>
            <button className={currentView === "questionbank" ? "active" : ""} onClick={() => openQuestionBankView("CSC370")}>
              📜 Question Bank
            </button>
            <button className={currentView === "oldisgold" ? "active" : ""} onClick={() => setCurrentView("oldisgold")}>
              📚 Old is Gold
            </button>
            <button className={currentView === "practicals" ? "active" : ""} onClick={() => setCurrentView("practicals")}>
              🔬 Practicals
            </button>
            <button className={currentView === "syllabus" ? "active" : ""} onClick={() => setCurrentView("syllabus")}>
              📝 Syllabus
            </button>
          </div>

          <div className="nav-search">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search subjects, topics, notes..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <a
            className="nav-drive-btn"
            href={driveRootUrl}
            target="_blank"
            rel="noreferrer"
            title="Access 1.4 GB Google Drive Archive"
          >
            ☁️ Drive (1.4 GB)
          </a>
        </div>
      </nav>

      {/* BREADCRUMB NAVIGATION */}
      <div className="breadcrumb-bar">
        <div className="nav-container">
          <span className="crumb" onClick={() => { setCurrentView("home"); setActiveSubject(null); }}>
            🏠 Home
          </span>
          <span className="sep">/</span>
          <span className="crumb" onClick={() => { setCurrentView("home"); setActiveSubject(null); }}>
            Sixth Semester
          </span>
          {activeSubject && currentView === "subject" && (
            <>
              <span className="sep">/</span>
              <span className="crumb active">{activeSubject.name}</span>
              <span className="sep">/</span>
              <span className="crumb sub-crumb">{activeSubTab.toUpperCase()}</span>
            </>
          )}
          {currentView === "questionbank" && (
            <>
              <span className="sep">/</span>
              <span className="crumb active">TU Question Bank (HamroCSIT Format)</span>
            </>
          )}
          {currentView === "oldisgold" && (
            <>
              <span className="sep">/</span>
              <span className="crumb active">Old is Gold & Past Examination Questions</span>
            </>
          )}
          {currentView === "practicals" && (
            <>
              <span className="sep">/</span>
              <span className="crumb active">Laboratory Works & Practicals</span>
            </>
          )}
          {currentView === "syllabus" && (
            <>
              <span className="sep">/</span>
              <span className="crumb active">Official TU Micro-Syllabus</span>
            </>
          )}
          {currentView === "videos" && (
            <>
              <span className="sep">/</span>
              <span className="crumb active">🎬 Video Lectures Collection (freeCSIT & TU Archives)</span>
            </>
          )}
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="portal-main">
        {/* VIEW 1: HOME (THE 6 SUBJECTS DIRECTORY) */}
        {currentView === "home" && (
          <div className="view-home">
            {/* HERO BANNER */}
            <section className="portal-hero">
              <div className="hero-content">
                <span className="hero-tag">B.SC. CSIT · SIXTH SEMESTER</span>
                <h1>Sixth Semester</h1>
                <p className="hero-desc">
                  Curated study portal for Tribhuvan University B.Sc. CSIT 6th Semester: 246 curated video lectures with embed players (prioritizing authentic Nepali tutorials), 45 board question papers with 479 unlocked answers, KEC textbooks, and practical code.
                </p>

                <div className="hero-stats">
                  <div className="stat-pill"><strong>6</strong> Courses</div>
                  <div className="stat-pill"><strong>45</strong> Board Papers</div>
                  <div className="stat-pill"><strong>479</strong> Solved Q&As</div>
                  <div className="stat-pill"><strong>{data.videoLectures?.grandTotalVideos || 246}</strong> Video Lectures (🇳🇵 Nepali Prioritized)</div>
                  <div className="stat-pill"><strong>KEC Textbooks</strong></div>
                  <div className="stat-pill"><strong>Old is Gold</strong></div>
                  <div className="stat-pill"><strong>Practicals & Code</strong></div>
                </div>

                <div className="hero-quick-downloads">
                  <a className="btn-hero-action drive-btn" href={driveRootUrl} target="_blank" rel="noreferrer" title="Open complete Google Drive archive">
                    ☁️ Google Drive Archive (1.4 GB)
                  </a>
                  <button className="btn-hero-action primary-red" onClick={() => openVideosView("all")}>
                    🎬 Video Lectures ({data.videoLectures?.grandTotalVideos || 246})
                  </button>
                  <button className="btn-hero-action" onClick={() => openQuestionBankView("CSC370", "2082-New")}>
                    📜 TU Question Bank (2082–2076)
                  </button>
                  {data.commonResources.allOldIsGold && (
                    <button className="btn-hero-action secondary" onClick={() => openPdfViewer(data.commonResources.allOldIsGold!)}>
                      📖 Solved Old is Gold
                    </button>
                  )}
                  {data.commonResources.microSyllabus && (
                    <button className="btn-hero-action secondary" onClick={() => openPdfViewer(data.commonResources.microSyllabus!)}>
                      📝 Official TU Syllabus
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* SUBJECTS GRID */}
            <section className="subjects-section">
              <div className="section-header">
                <div>
                  <h2>6 Semester Courses</h2>
                  <span className="section-subtitle">Compulsory and elective courses for 6th semester (.NET, CDC, SE, ECOM, EGOV, TW)</span>
                </div>
                <div className="section-stats-badge">
                  <span>6 Subjects Active</span>
                </div>
              </div>

              <div className="subjects-grid">
                {filteredSubjects.map(subj => {
                  const subjectPapersCount = data.questionBankPapers?.filter(p => p.subjectCode === subj.code).length || 0;
                  const subjectVidsCount = data.videoLectures?.subjects.find(s => s.subjectCode === subj.code)?.totalVideos || 0;
                  return (
                    <div className="subject-card" key={subj.slug}>
                      <div className="subject-card-top">
                        <div className="code-box">
                          <span className="subject-code">{subj.code}</span>
                          <span className="subject-short-name">{subj.shortName}</span>
                        </div>
                        <span className={`subject-type-badge ${subj.type.toLowerCase()}`}>{subj.type}</span>
                      </div>

                      <h3 className="subject-title" onClick={() => openSubject(subj, "questionbank")}>
                        {subj.name}
                      </h3>

                      <p className="subject-desc">{subj.description}</p>

                      <div className="subject-resource-badges">
                        <span className="res-badge" title="TU Question Bank Papers" style={{ background: "#dcfce7", color: "#15803d", fontWeight: "bold" }}>
                          📜 {subjectPapersCount} Board Papers
                        </span>
                        <span className="res-badge" title="Curated Video Lectures (freeCSIT)" style={{ background: "#ede9fe", color: "#6d28d9", fontWeight: "bold" }}>
                          🎬 {subjectVidsCount} Videos
                        </span>
                        <span className="res-badge" title="KEC Textbook Chapters">
                          📚 {subj.resources.kecBooks.length} KEC Ch.
                        </span>
                        <span className="res-badge" title="Lecture Notes">
                          📝 {subj.resources.notes.length} Notes
                        </span>
                        <span className="res-badge" title="Lab / Practicals">
                          🧪 {subj.resources.practicals.length} Lab Files
                        </span>
                      </div>

                      <div className="subject-meta-row">
                        <span>⏱ {subj.credits} Credits</span>
                        <span>📖 {subj.units.length} Units</span>
                        <span>⚖️ {subj.nature}</span>
                      </div>

                      <div className="subject-actions">
                        <button className="btn-action primary" onClick={() => openSubject(subj, "questionbank")}>
                          📜 Question Bank
                        </button>
                        <button className="btn-action" style={{ background: "#f3e8ff", color: "#7e22ce", borderColor: "#d8b4fe", fontWeight: "bold" }} onClick={() => openSubject(subj, "videos")}>
                          🎬 Videos ({subjectVidsCount})
                        </button>
                        <button className="btn-action" onClick={() => openSubject(subj, "kec")}>
                          📖 Books & Notes
                        </button>
                        <button className="btn-action" onClick={() => openSubject(subj, "practicals")}>
                          🧪 Lab / Code
                        </button>
                        <button className="btn-action" onClick={() => openSubject(subj, "syllabus")}>
                          📝 Syllabus
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* VIEW: DEDICATED VIDEO LECTURES EXPLORER (EASYCSIT & TU ARCHIVES) */}
        {currentView === "videos" && data.videoLectures && (
          <div className="view-global-videos">
            <div className="global-header">
              <div className="global-header-title-box">
                <h1>🎬 6th Semester Video Lectures Collection</h1>
                <span className="badge-easycsit">freeCSIT & TU CSIT Archives</span>
              </div>
              <p className="muted">
                Curated chapter-by-chapter video lectures with responsive embedded iframe players, timestamps, and direct YouTube links. All 6 subjects arranged in distinct sections.
              </p>
            </div>

            {/* Video Controls: Subject Filter Pills + Search Input */}
            <div className="video-explorer-controls">
              <div className="video-subject-pills">
                <button
                  className={`v-subj-pill ${selectedVideoSubjCode === "all" ? "active" : ""}`}
                  onClick={() => setSelectedVideoSubjCode("all")}
                >
                  🌐 All Subjects ({data.videoLectures.grandTotalVideos})
                </button>
                <button
                  className={`v-subj-pill nepali-filter-pill ${onlyNepali ? "active-nepali" : ""}`}
                  onClick={() => setOnlyNepali(!onlyNepali)}
                  title="Filter only Nepali language lectures"
                >
                  <span>🇳🇵</span>
                  <span>Nepali Lectures Only</span>
                  {onlyNepali && <span className="v-pill-count">ON</span>}
                </button>
                {data.videoLectures.subjects.map(s => (
                  <button
                    key={s.subjectCode}
                    className={`v-subj-pill ${selectedVideoSubjCode === s.subjectCode ? "active" : ""}`}
                    onClick={() => setSelectedVideoSubjCode(s.subjectCode)}
                  >
                    <span>{s.icon || "📚"}</span>
                    <span>{s.shortName}</span>
                    <span className="v-pill-count">{s.totalVideos}</span>
                  </button>
                ))}
              </div>

              <div className="video-search-bar">
                <input
                  type="text"
                  placeholder="Filter video title, channel, topic..."
                  value={videoSearchQuery}
                  onChange={e => setVideoSearchQuery(e.target.value)}
                />
                {videoSearchQuery && (
                  <button className="btn-clear-search" onClick={() => setVideoSearchQuery("")}>✕</button>
                )}
              </div>
            </div>

            {/* SUBJECT SECTIONS: EACH SUBJECT IN A DIFFERENT SECTION */}
            <div className="video-subjects-sections-container">
              {filteredVideoSubjects.length === 0 ? (
                <div className="empty-box" style={{ padding: 40, textAlign: "center", background: "#ffffff", borderRadius: 8 }}>
                  <h4>No videos matched your filter or search query.</h4>
                  <p className="muted">Try clearing the search or choosing another subject.</p>
                </div>
              ) : (
                filteredVideoSubjects.map(subj => (
                  <section className="subject-video-section-block" key={subj.subjectCode} id={`video-section-${subj.subjectCode}`}>
                    {/* SECTION HEADER FOR THIS SUBJECT */}
                    <div className="subject-video-section-header">
                      <div className="svsh-left">
                        <span className="svsh-icon">{subj.icon || "📚"}</span>
                        <div>
                          <div className="svsh-title-row">
                            <span className="svsh-code-badge">{subj.subjectCode}</span>
                            <h3>{subj.subjectName}</h3>
                          </div>
                          <p className="svsh-subtitle">
                            {subj.totalVideos} Video Lectures across {subj.totalChapters} Chapters · freeCSIT
                          </p>
                        </div>
                      </div>
                      <div className="svsh-right">
                        <a
                          className="btn-easycsit-link"
                          href={subj.easyCsitUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          ↗ Open {subj.shortName} on easyCSIT.com
                        </a>
                      </div>
                    </div>

                    {/* CHAPTERS IN THIS SUBJECT */}
                    <div className="subject-video-chapters-wrapper">
                      {subj.chapters.map((ch, chIdx) => (
                        <div className="video-chapter-group" key={chIdx}>
                          <div className="video-chapter-title-bar">
                            <h4>
                              <span className="v-ch-tag">Chapter {ch.chapterNumber}</span>
                              <span>{ch.chapterName}</span>
                            </h4>
                            <span className="v-ch-count">{ch.videos.length} Lectures</span>
                          </div>

                          <div className="video-cards-grid">
                            {ch.videos.map(v => (
                              <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: DEDICATED QUESTION BANK EXPLORER */}
        {currentView === "questionbank" && data.questionBankPapers && (
          <div className="view-qb-explorer">
            <div className="global-header" style={{ marginBottom: 20 }}>
              <h1>Tribhuvan University Examination Question Bank</h1>
              <p className="muted">
                Authentic TU board examination question papers formatted in the exact HamroCSIT layout by examination year (Section A / Section B, marks breakdown, and solutions).
              </p>
            </div>

            <QuestionPaperViewer
              papers={data.questionBankPapers}
              selectedSubjectCode={selectedQbSubjectCode}
              selectedYear={selectedQbYear}
              onSelectSubjectCode={setSelectedQbSubjectCode}
              onSelectYear={setSelectedQbYear}
              subjects={data.subjects}
              openPdfViewer={openPdfViewer}
              showSubjectSelector={true}
            />
          </div>
        )}

        {/* VIEW 3: SUBJECT DEDICATED HUB */}
        {currentView === "subject" && activeSubject && (
          <div className="view-subject">
            {/* Subject Hero Header */}
            <div className="subject-header-banner">
              <div className="shb-left">
                <span className="badge badge-sem">6th Semester · CSIT</span>
                <span className="badge badge-code">{activeSubject.code}</span>
                <h1>{activeSubject.name}</h1>
                <p className="shb-desc">{activeSubject.description}</p>
                <div className="shb-meta">
                  <span>Credits: <strong>{activeSubject.credits}</strong></span>
                  <span>Type: <strong>{activeSubject.type}</strong></span>
                  <span>Full Marks: <strong>{activeSubject.fullMarks}</strong></span>
                  <span>Pass Marks: <strong>{activeSubject.passMarks}</strong></span>
                  <span>Total Resources: <strong>{activeSubject.totalFiles}</strong></span>
                </div>
              </div>

              <div className="shb-right">
                <a
                  className="btn-quick-read"
                  style={{ background: "#16a34a", borderColor: "#15803d", color: "#ffffff", textDecoration: "none" }}
                  href={activeSubject.driveFolderUrl || driveRootUrl}
                  target="_blank"
                  rel="noreferrer"
                  title="Open this subject's materials in Google Drive"
                >
                  ☁️ Open in Google Drive
                </a>
                {activeSubject.resources.kecBooks.length > 0 && (
                  <button className="btn-quick-read" onClick={() => openPdfViewer(activeSubject.resources.kecBooks[0])}>
                    📖 Open KEC Textbook PDF
                  </button>
                )}
                {activeSubject.resources.oldIsGold.length > 0 && (
                  <button className="btn-quick-read secondary" onClick={() => openPdfViewer(activeSubject.resources.oldIsGold[0])}>
                    📜 Read Solved Old is Gold PDF
                  </button>
                )}
              </div>
            </div>

            {/* Subject Tabs */}
            <div className="subject-tabs-bar">
              <button className={activeSubTab === "questionbank" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("questionbank")}>
                📜 Question Bank ({currentSubjectPapers.length} Years)
              </button>
              <button className={activeSubTab === "videos" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("videos")}>
                🎬 Video Lectures ({activeSubjectVideos?.totalVideos || 0})
              </button>
              <button className={activeSubTab === "kec" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("kec")}>
                📖 KEC Textbooks ({activeSubject.resources.kecBooks.length})
              </button>
              <button className={activeSubTab === "notes" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("notes")}>
                📝 Notes Collection ({activeSubject.resources.notes.length})
              </button>
              <button className={activeSubTab === "oldisgold" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("oldisgold")}>
                📚 Old is Gold PDF ({activeSubject.resources.oldIsGold.length})
              </button>
              <button className={activeSubTab === "practicals" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("practicals")}>
                🧪 Practicals & Lab Code ({activeSubject.resources.practicals.length})
              </button>
              {activeSubject.resources.referenceBooks.length > 0 && (
                <button className={activeSubTab === "reference" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("reference")}>
                  📚 Reference Books ({activeSubject.resources.referenceBooks.length})
                </button>
              )}
              <button className={activeSubTab === "syllabus" ? "tab-btn active" : "tab-btn"} onClick={() => setActiveSubTab("syllabus")}>
                📝 TU Syllabus ({activeSubject.units.length} Units)
              </button>
            </div>

            {/* SUB-TAB 0: TU QUESTION BANK (EXACT HAMROCSIT FORMAT) */}
            {activeSubTab === "questionbank" && data.questionBankPapers && (
              <div className="tab-pane-questionbank">
                <QuestionPaperViewer
                  papers={data.questionBankPapers}
                  selectedSubjectCode={activeSubject.code}
                  selectedYear={selectedQbYear}
                  onSelectSubjectCode={setSelectedQbSubjectCode}
                  onSelectYear={setSelectedQbYear}
                  subjects={data.subjects}
                  openPdfViewer={openPdfViewer}
                  showSubjectSelector={false}
                />
              </div>
            )}

            {/* SUB-TAB: VIDEO LECTURES */}
            {activeSubTab === "videos" && (
              <div className="tab-pane-videos">
                <div className="pane-header">
                  <div className="pane-header-title">
                    <h3>🎬 Video Lectures: {activeSubject.name} ({activeSubject.code})</h3>
                    <span className="badge-easycsit">freeCSIT & TU CSIT Archive</span>
                  </div>
                  <p className="muted">
                    Curated video lectures with embedded responsive iframe players, chapter notes, and timestamps.
                  </p>
                </div>

                {!activeSubjectVideos || activeSubjectVideos.chapters.length === 0 ? (
                  <div className="empty-box">No video lectures found for this subject.</div>
                ) : (
                  <div className="subject-video-chapters">
                    {activeSubjectVideos.chapters.map((ch, chIdx) => (
                      <div className="video-chapter-block" key={chIdx}>
                        <div className="video-chapter-header">
                          <h4>
                            <span className="ch-num">Ch. {ch.chapterNumber}</span> {ch.chapterName}
                          </h4>
                          <span className="ch-count-badge">{ch.videos.length} Lectures</span>
                        </div>
                        <div className="video-cards-grid">
                          {ch.videos.map(v => (
                            <VideoCard key={v.id} video={v} onPlay={setActiveVideo} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 1: KEC TEXTBOOKS */}
            {activeSubTab === "kec" && (
              <div className="tab-pane-files">
                <div className="pane-header">
                  <h3>KEC Books Collection: {activeSubject.name}</h3>
                  <p className="muted">Standard Kathmandu Engineering College (KEC) publication textbook chapters in high-resolution PDF format.</p>
                </div>

                <div className="cloud-drive-banner">
                  <div className="cdb-left">
                    <span className="cdb-icon">☁️</span>
                    <div>
                      <strong>Google Drive Cloud Storage: {activeSubject.name} Books</strong>
                      <p>All high-resolution textbook chapters (100MB+ complete volumes) are hosted on Google Drive for high-speed streaming and offline reading.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <a className="btn-cdb-open" href={activeSubject.driveFolderUrl || driveRootUrl} target="_blank" rel="noreferrer">
                      ☁️ Open in Google Drive ↗
                    </a>
                    <button className="drive-url-edit-btn" onClick={handleUpdateDriveUrl} title="Change Google Drive link">
                      Configure Link
                    </button>
                  </div>
                </div>

                {activeSubject.resources.kecBooks.length === 0 ? (
                  <div className="empty-box">No KEC book chapters found for this subject.</div>
                ) : (
                  <div className="files-grid">
                    {activeSubject.resources.kecBooks.map((file, idx) => (
                      <div className="resource-file-card" key={idx}>
                        <div className="rfc-icon">📕</div>
                        <div className="rfc-details">
                          <h4 className="rfc-title" title={file.name}>{cleanFileName(file.name)}</h4>
                          <span className="rfc-meta">{formatBytes(file.size)} · PDF Document</span>
                        </div>
                        <div className="rfc-actions">
                          <button className="btn-view-pdf" onClick={() => openPdfViewer(file)}>
                            Read PDF ↗
                          </button>
                          <a
                            className="btn-drive-file"
                            href={file.driveUrl || (activeSubject.driveFolderUrl || driveRootUrl)}
                            target="_blank"
                            rel="noreferrer"
                            title="Open on Google Drive"
                          >
                            ☁️ Drive
                          </a>
                          <a className="btn-dl-file" href={file.webPath} download target="_blank" rel="noreferrer" title="Download">
                            ⬇
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: NOTES COLLECTION */}
            {activeSubTab === "notes" && (
              <div className="tab-pane-files">
                <div className="pane-header">
                  <h3>Curated Lecture Notes Collection</h3>
                  <p className="muted">Handwritten and typed notes from top CSIT educators (Roshan Bista, Ganesh Khatri, and college lecture slides).</p>
                </div>

                <div className="cloud-drive-banner">
                  <div className="cdb-left">
                    <span className="cdb-icon">☁️</span>
                    <div>
                      <strong>Google Drive Cloud Storage: Notes Collection</strong>
                      <p>Complete slide decks and handwritten lecture notes are preserved on Google Drive for high-speed download and batch access.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <a className="btn-cdb-open" href={activeSubject.driveFolderUrl || driveRootUrl} target="_blank" rel="noreferrer">
                      ☁️ Open Notes in Drive ↗
                    </a>
                  </div>
                </div>

                {activeSubject.resources.notes.length === 0 ? (
                  <div className="empty-box">No lecture notes found for this subject.</div>
                ) : (
                  <div className="files-grid">
                    {activeSubject.resources.notes.map((file, idx) => (
                      <div className="resource-file-card" key={idx}>
                        <div className="rfc-icon">{file.ext === ".pdf" ? "📄" : "📁"}</div>
                        <div className="rfc-details">
                          <h4 className="rfc-title" title={file.name}>{cleanFileName(file.name)}</h4>
                          <span className="rfc-meta">{formatBytes(file.size)} · {file.relPath}</span>
                        </div>
                        <div className="rfc-actions">
                          {file.ext === ".pdf" ? (
                            <button className="btn-view-pdf" onClick={() => openPdfViewer(file)}>
                              Read PDF ↗
                            </button>
                          ) : (
                            <a className="btn-view-pdf" href={file.webPath} target="_blank" rel="noreferrer">
                              Open File ↗
                            </a>
                          )}
                          <a
                            className="btn-drive-file"
                            href={file.driveUrl || (activeSubject.driveFolderUrl || driveRootUrl)}
                            target="_blank"
                            rel="noreferrer"
                            title="Open on Google Drive"
                          >
                            ☁️ Drive
                          </a>
                          <a className="btn-dl-file" href={file.webPath} download target="_blank" rel="noreferrer">
                            ⬇
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 3: OLD IS GOLD & PAST PAPERS */}
            {activeSubTab === "oldisgold" && (
              <div className="tab-pane-oldisgold">
                <div className="pane-header">
                  <h3>Old is Gold & Past Board Exam Compilations</h3>
                  <p className="muted">Comprehensive chapter-wise compilations of previous years TU examination questions and solutions.</p>
                </div>

                {/* Old is Gold PDF Banner */}
                {activeSubject.resources.oldIsGold.length > 0 && (
                  <div className="old-gold-hero-card">
                    <div className="ogh-details">
                      <span className="badge badge-gold">OFFICIAL COMPILATION</span>
                      <h3>Old is Gold: {activeSubject.name}</h3>
                      <p>Complete chapter-wise compilation of past 10+ years TU Board examination questions and solutions.</p>
                    </div>
                    <div className="ogh-action" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <button className="btn-open-gold" onClick={() => openPdfViewer(activeSubject.resources.oldIsGold[0])}>
                        📖 Open Old is Gold PDF ({formatBytes(activeSubject.resources.oldIsGold[0].size)})
                      </button>
                      <a
                        className="btn-open-gold"
                        style={{ background: "#16a34a", borderColor: "#15803d", color: "#ffffff", textDecoration: "none" }}
                        href={activeSubject.driveFolderUrl || driveRootUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Access past papers and old is gold on Google Drive"
                      >
                        ☁️ Open in Drive
                      </a>
                    </div>
                  </div>
                )}

                {/* Additional Scraped Questions */}
                {currentSubjectQA.length > 0 && (
                  <div className="scraped-qa-section">
                    <h4>Board Exam Questions & Solved Problems ({currentSubjectQA.length}):</h4>
                    <div className="questions-list">
                      {currentSubjectQA.map(q => (
                        <div className="board-question-card" key={q.id}>
                          <div className="bq-header">
                            <span className="badge badge-exam">{q.examYear ? `Asked on ${q.examYear} Exam` : "TU Board Exam"}</span>
                            <span className="badge badge-subj">{activeSubject.code}</span>
                            {q.answerStatus === "visible" ? (
                              <span className="badge badge-success">Solution Available</span>
                            ) : (
                              <span className="badge badge-restricted">Solution Restricted</span>
                            )}
                          </div>

                          <div className="bq-question">
                            <p>{q.cleanQuestion || q.question}</p>
                          </div>

                          <div className="bq-actions">
                            {q.answer ? (
                              <button
                                className="btn-reveal"
                                onClick={() => setOpenAnswerId(openAnswerId === q.id ? null : q.id)}
                              >
                                {openAnswerId === q.id ? "Hide Solution ▲" : "Reveal Solution ▼"}
                              </button>
                            ) : (
                              <span className="restricted-text">🔒 Solution login restricted on HamroCSIT</span>
                            )}

                            <a className="bq-link" href={q.sourceUrl} target="_blank" rel="noreferrer">
                              View on HamroCSIT ↗
                            </a>
                          </div>

                          {openAnswerId === q.id && q.answer && (
                            <div className="bq-solution-box">
                              <h4>Solution:</h4>
                              <div className="solution-text">{q.answer}</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 4: PRACTICALS */}
            {activeSubTab === "practicals" && (
              <div className="tab-pane-files">
                <div className="pane-header">
                  <h3>Laboratory Sheets & Source Code Implementations</h3>
                  <p className="muted">All lab manuals, assignment solutions, sample projects, and report documentation.</p>
                </div>

                <div className="cloud-drive-banner">
                  <div className="cdb-left">
                    <span className="cdb-icon">☁️</span>
                    <div>
                      <strong>Google Drive Cloud Storage: Lab Codes & Reports</strong>
                      <p>Complete project zip files, C# solutions, and practical PDF reports are available on Google Drive for one-click downloading.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <a className="btn-cdb-open" href={activeSubject.driveFolderUrl || driveRootUrl} target="_blank" rel="noreferrer">
                      ☁️ Open Labs in Drive ↗
                    </a>
                  </div>
                </div>

                {activeSubject.resources.practicals.length === 0 ? (
                  <div className="empty-box">No practical lab files needed for this theory course.</div>
                ) : (
                  <div className="files-grid">
                    {activeSubject.resources.practicals.map((file, idx) => (
                      <div className="resource-file-card" key={idx}>
                        <div className="rfc-icon">{file.ext === ".pdf" ? "📑" : "💻"}</div>
                        <div className="rfc-details">
                          <h4 className="rfc-title" title={file.name}>{cleanFileName(file.name)}</h4>
                          <span className="rfc-meta">{formatBytes(file.size)} · {file.relPath}</span>
                        </div>
                        <div className="rfc-actions">
                          {file.ext === ".pdf" ? (
                            <button className="btn-view-pdf" onClick={() => openPdfViewer(file)}>
                              Read PDF ↗
                            </button>
                          ) : (
                            <a className="btn-view-pdf" href={file.webPath} target="_blank" rel="noreferrer">
                              Open File ↗
                            </a>
                          )}
                          <a
                            className="btn-drive-file"
                            href={file.driveUrl || (activeSubject.driveFolderUrl || driveRootUrl)}
                            target="_blank"
                            rel="noreferrer"
                            title="Open on Google Drive"
                          >
                            ☁️ Drive
                          </a>
                          <a className="btn-dl-file" href={file.webPath} download target="_blank" rel="noreferrer">
                            ⬇
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 5: REFERENCE BOOKS */}
            {activeSubTab === "reference" && (
              <div className="tab-pane-files">
                <div className="pane-header">
                  <h3>Prescribed Reference Books</h3>
                  <p className="muted">Full international edition reference textbooks recommended by the TU curriculum board.</p>
                </div>

                <div className="cloud-drive-banner">
                  <div className="cdb-left">
                    <span className="cdb-icon">☁️</span>
                    <div>
                      <strong>Google Drive Cloud Storage: Reference Books</strong>
                      <p>Complete international textbooks (100MB+ full volumes) are stored in Google Drive for easy online previewing without local download limits.</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <a className="btn-cdb-open" href={activeSubject.driveFolderUrl || driveRootUrl} target="_blank" rel="noreferrer">
                      ☁️ Open Books in Drive ↗
                    </a>
                  </div>
                </div>

                {activeSubject.resources.referenceBooks.length === 0 ? (
                  <div className="empty-box">No external reference books listed for this subject.</div>
                ) : (
                  <div className="files-grid">
                    {activeSubject.resources.referenceBooks.map((file, idx) => (
                      <div className="resource-file-card" key={idx}>
                        <div className="rfc-icon">📚</div>
                        <div className="rfc-details">
                          <h4 className="rfc-title" title={file.name}>{cleanFileName(file.name)}</h4>
                          <span className="rfc-meta">{formatBytes(file.size)} · Complete Textbook</span>
                        </div>
                        <div className="rfc-actions">
                          <button className="btn-view-pdf" onClick={() => openPdfViewer(file)}>
                            Read PDF ↗
                          </button>
                          <a
                            className="btn-drive-file"
                            href={file.driveUrl || (activeSubject.driveFolderUrl || driveRootUrl)}
                            target="_blank"
                            rel="noreferrer"
                            title="Open on Google Drive"
                          >
                            ☁️ Drive
                          </a>
                          <a className="btn-dl-file" href={file.webPath} download target="_blank" rel="noreferrer">
                            ⬇
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 6: TU SYLLABUS */}
            {activeSubTab === "syllabus" && (
              <div className="tab-pane-syllabus">
                <div className="syllabus-viewer-card">
                  <div className="syllabus-header-card">
                    <p className="univ-name">Tribhuvan University · Institute of Science and Technology</p>
                    <h2>Course Syllabus: {activeSubject.name}</h2>
                    <p className="course-no">Course No: <strong>{activeSubject.code}</strong> | Semester: <strong>Sixth (VI)</strong></p>
                  </div>

                  <table className="syllabus-spec-table">
                    <tbody>
                      <tr>
                        <td><strong>Nature of Course:</strong> {activeSubject.nature}</td>
                        <td><strong>Credit Hours:</strong> {activeSubject.credits}</td>
                      </tr>
                      <tr>
                        <td><strong>Full Marks:</strong> {activeSubject.fullMarks}</td>
                        <td><strong>Pass Marks:</strong> {activeSubject.passMarks}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="syllabus-block">
                    <h3>Course Description</h3>
                    <p>{activeSubject.description}</p>
                  </div>

                  <div className="syllabus-block">
                    <h3>Course Objectives</h3>
                    <p>{activeSubject.objectives}</p>
                  </div>

                  <div className="syllabus-block">
                    <h3>Course Units & Hours Breakdown</h3>
                    <div className="units-table">
                      {activeSubject.units.map(u => (
                        <div className="unit-row" key={u.unit}>
                          <div className="unit-header-line">
                            <strong>Unit {u.unit}: {u.title}</strong>
                            <span className="unit-hours-tag">{u.hours} Hours</span>
                          </div>
                          <p>{u.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: GLOBAL OLD IS GOLD & PAST PAPERS */}
        {currentView === "oldisgold" && (
          <div className="view-global-oldisgold">
            <div className="global-header">
              <h1>Old is Gold & Past Board Exam Compilations</h1>
              <p className="muted">Direct access to Old is Gold compilations and past board exam papers for all 6 subjects.</p>
            </div>

            {/* Callout to Question Bank */}
            <div className="old-gold-hero-card" style={{ marginBottom: 28, background: "#ecfdf5", borderColor: "#a7f3d0" }}>
              <div className="ogh-details">
                <span className="badge badge-success" style={{ background: "#059669", color: "#ffffff" }}>AUTHENTIC TU EXAM FORMAT</span>
                <h3 style={{ color: "#065f46" }}>Looking for Question Banks Organized by Exam Year?</h3>
                <p style={{ color: "#047857" }}>
                  View the full Tribhuvan University Examination Papers with Section A / Section B division and marks breakdown exactly as published on HamroCSIT.
                </p>
              </div>
              <div className="ogh-action">
                <button className="btn-open-gold" style={{ background: "#059669" }} onClick={() => openQuestionBankView("CSC370")}>
                  📜 Open TU Question Bank Explorer →
                </button>
              </div>
            </div>

            {/* Combined Old is Gold Card */}
            {data.commonResources.allOldIsGold && (
              <div className="old-gold-hero-card" style={{ marginBottom: 28 }}>
                <div className="ogh-details">
                  <span className="badge badge-gold">MASTER COMPILATION</span>
                  <h3>All Combined: Old is Gold 6th Semester</h3>
                  <p>Master PDF featuring past board exam questions and answers for all 6th semester subjects combined into one document.</p>
                </div>
                <div className="ogh-action">
                  <button className="btn-open-gold" onClick={() => openPdfViewer(data.commonResources.allOldIsGold!)}>
                    📖 Open All Combined PDF ({formatBytes(data.commonResources.allOldIsGold.size)})
                  </button>
                </div>
              </div>
            )}

            {/* 6 Subject Old is Gold Grid */}
            <h3>Subject-Wise Old is Gold:</h3>
            <div className="old-gold-grid">
              {data.subjects.map(s => {
                const oig = s.resources.oldIsGold[0];
                return (
                  <div className="oig-card" key={s.slug}>
                    <div className="oig-header">
                      <span className="badge badge-code">{s.code}</span>
                      <span className="badge badge-short">{s.shortName}</span>
                    </div>
                    <h4>{s.name}</h4>
                    {oig ? (
                      <div className="oig-body">
                        <span className="oig-size">{formatBytes(oig.size)} · Full Q&A Compilation</span>
                        <button className="btn-oig-read" onClick={() => openPdfViewer(oig)}>
                          Read Old is Gold PDF ↗
                        </button>
                      </div>
                    ) : (
                      <div className="oig-body">
                        <span className="oig-size">TU Question Bank Available</span>
                        <button className="btn-oig-read" onClick={() => openQuestionBankView(s.code)}>
                          View Question Bank ↗
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Year-by-Year Scanned Question Papers */}
            <div className="old-questions-years" style={{ marginTop: 36 }}>
              <h3>Scanned Board Examination Question Papers by Year:</h3>
              <div className="years-grid">
                {data.commonResources.oldQuestionYears.map(y => (
                  <div className="year-card" key={y.year}>
                    <h4>📅 Year {y.year} TU Board Exams</h4>
                    <span className="year-count">{y.files.length} Subject Question Papers</span>
                    <div className="year-files-list">
                      {y.files.map((f, i) => (
                        <div className="year-file-item" key={i} onClick={() => openPdfViewer(f)}>
                          <span>📄 {cleanFileName(f.name)}</span>
                          <span className="yfi-arrow">↗</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: PRACTICALS DIRECTORY */}
        {currentView === "practicals" && (
          <div className="view-global-practicals">
            <div className="global-header">
              <h1>Laboratory Assignments & Practicals</h1>
              <p className="muted">Lab sheets, reports, source code implementations, and project proposals for all 6 subjects.</p>
            </div>

            <div className="practicals-subject-list">
              {data.subjects.map(s => (
                <div className="subject-practical-block" key={s.slug}>
                  <div className="spb-header">
                    <div>
                      <span className="badge badge-code">{s.code}</span>
                      <h3>{s.name}</h3>
                    </div>
                    <span className="spb-count">{s.resources.practicals.length} Practical Files Available</span>
                  </div>

                  {s.resources.practicals.length === 0 ? (
                    <p className="muted">No practical lab files needed for this theory course.</p>
                  ) : (
                    <div className="files-grid">
                      {s.resources.practicals.slice(0, 8).map((f, i) => (
                        <div className="resource-file-card" key={i}>
                          <div className="rfc-icon">{f.ext === ".pdf" ? "📑" : "💻"}</div>
                          <div className="rfc-details">
                            <h4 className="rfc-title">{f.name}</h4>
                            <span className="rfc-meta">{formatBytes(f.size)} · {f.relPath}</span>
                          </div>
                          <div className="rfc-actions">
                            {f.ext === ".pdf" ? (
                              <button className="btn-view-pdf" onClick={() => openPdfViewer(f)}>Read ↗</button>
                            ) : (
                              <a className="btn-view-pdf" href={f.webPath} target="_blank" rel="noreferrer">Open ↗</a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {s.resources.practicals.length > 8 && (
                    <button className="btn-see-all-practicals" onClick={() => openSubject(s, "practicals")}>
                      View all {s.resources.practicals.length} {s.shortName} practical files & code →
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 6: TU SYLLABUS DIRECTORY */}
        {currentView === "syllabus" && (
          <div className="view-global-syllabus">
            <div className="global-header">
              <h1>Tribhuvan University 6th Semester Syllabus Catalog</h1>
              <p className="muted">Official course outlines, credit distribution, and marks structure for all 6 subjects.</p>

              {data.commonResources.microSyllabus && (
                <button className="btn-open-microsyllabus" onClick={() => openPdfViewer(data.commonResources.microSyllabus!)}>
                  📑 Open Official TU Micro-Syllabus PDF ({formatBytes(data.commonResources.microSyllabus.size)})
                </button>
              )}
            </div>

            <div className="syllabus-catalog">
              {data.subjects.map(s => (
                <div className="syllabus-summary-card" key={s.slug}>
                  <div className="ssc-header">
                    <div>
                      <span className="badge badge-code">{s.code}</span>
                      <span className="badge badge-short">{s.shortName}</span>
                    </div>
                    <span className="ssc-credits">{s.credits} Credits · {s.nature}</span>
                  </div>

                  <h3>{s.name}</h3>
                  <p>{s.description}</p>

                  <div className="ssc-units-list">
                    <strong>Units Breakdown ({s.units.length} Units):</strong>
                    <ul>
                      {s.units.map(u => (
                        <li key={u.unit}>Unit {u.unit}: {u.title} ({u.hours}h)</li>
                      ))}
                    </ul>
                  </div>

                  <button className="btn-open-full-syllabus" onClick={() => openSubject(s, "syllabus")}>
                    Open Full Detailed Syllabus & Book List →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="portal-footer">
        <div className="footer-content">
          <div className="footer-brand-row">
            <div className="footer-brand">
              <span className="brand-free">free</span><span className="brand-csit">CSIT</span>
            </div>
            <span className="footer-badge">Semester 6 Study Portal</span>
          </div>
          <p className="footer-sub">
            Tribhuvan University B.Sc. CSIT Sixth Semester Reference & Study Portal.
          </p>
          <div className="footer-meta-pills">
            <span>⚡ 6 Core Courses</span>
            <span>🎬 {data?.videoLectures?.grandTotalVideos || 246} Video Lectures</span>
            <span>📜 45 Board Question Papers</span>
            <span>✓ 479 Unlocked Solutions</span>
            <span>📚 903 Reference Files</span>
          </div>
          <p className="footer-disclaimer">
            All materials preserved for offline academic study. Content attribution to freeCSIT, HamroCSIT, and Ankit Pangeni Archive.
          </p>
          <div className="footer-author-credit">
            <span>Curated & Maintained for CSIT Students by</span>
            <span className="author-tag">SHISHIR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

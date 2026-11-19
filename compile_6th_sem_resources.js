import fs from "node:fs";
import path from "node:path";

const BASE_DIR = "E:\\Downloads\\6th semester - Ankit Pangeni-20260724T040533Z-1-001\\6th semester - Ankit Pangeni";

function walkDir(dir) {
  let files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(walkDir(fullPath));
      } else {
        const rel = fullPath.replace(BASE_DIR, "").replace(/^[\\\/]/, "").replace(/\\/g, "/");
        files.push({
          fullPath,
          relPath: rel,
          webPath: "/resources/" + encodeURI(rel),
          name: entry.name,
          ext: path.extname(entry.name).toLowerCase(),
          size: fs.statSync(fullPath).size
        });
      }
    }
  } catch (err) {
    console.error("Error reading dir:", dir, err);
  }
  return files;
}

const allFiles = walkDir(BASE_DIR);
console.log(`Discovered ${allFiles.length} files in Ankit Pangeni 6th semester folder.`);

// Define EXACT 6 Subjects
const SIX_SUBJECTS = [
  {
    slug: "ncc",
    code: "CSC367",
    shortName: ".NET",
    name: ".NET Centric Computing",
    type: "Compulsory",
    credits: 3,
    nature: "Theory + Lab",
    fullMarks: "60 + 20 + 20",
    passMarks: "24 + 8 + 8",
    description: "Cross-platform web application development using ASP.NET Core MVC framework and C# programming language.",
    objectives: "Master C# language constructs, ASP.NET Core MVC, Entity Framework Core, Web APIs, authentication, and cloud deployment.",
    units: [
      { unit: 1, title: "Language Preliminaries (C#)", hours: 8, desc: "Compilation/execution in .NET, basic constructs, constructors, properties, arrays, indexers, inheritance, method hiding/overriding, polymorphism, structs, enums, abstract/sealed classes, interfaces, delegates, events, collections, generics, LINQ, lambda expressions, async/await." },
      { unit: 2, title: "Introduction to ASP.NET Core", hours: 3, desc: ".NET, .NET Core, ASP.NET Web Forms, ASP.NET MVC, ASP.NET Core architecture, CLI, MSIL, CLR, project layout, middleware pipeline, dependency injection." },
      { unit: 3, title: "HTTP and ASP.NET Core", hours: 3, desc: "Request and response pipeline, HTTP methods, status codes, query strings, headers, controllers, action methods, action results, routing, model binding." },
      { unit: 4, title: "Creating MVC Applications", hours: 6, desc: "MVC pattern, controllers, Razor views, layout views, partial views, view components, HTML helpers, tag helpers, view models." },
      { unit: 5, title: "Working with Database (EF Core)", hours: 6, desc: "Entity Framework Core, Code-First approach, DbContext, migrations, CRUD operations, relationships, Linq to Entities." },
      { unit: 6, title: "State Management in ASP.NET Core", hours: 4, desc: "Cookies, session state, TempData, query strings, hidden fields, cache management (in-memory & distributed)." },
      { unit: 7, title: "Client-Side Development", hours: 3, desc: "Bootstrap, jQuery, AJAX in ASP.NET Core, bundling & minification, client-side validation using unobtrusive jQuery." },
      { unit: 8, title: "Securing ASP.NET Core Applications", hours: 5, desc: "ASP.NET Core Identity, authentication, authorization (roles, claims, policies), CSRF, XSS, SQL injection protection." },
      { unit: 9, title: "Hosting and Deployment", hours: 2, desc: "Kestrel web server, IIS/Nginx reverse proxy, Docker containerization, publishing to Azure/cloud." }
    ],
    fileFilter: f => /net centric|dot net|\bnet\b|asp\.net|c 8\.0/i.test(f.relPath) && !/e-commerce|software|compiler|governance|technical/i.test(f.relPath)
  },
  {
    slug: "cdc",
    code: "CSC365",
    shortName: "CDC",
    name: "Compiler Design and Construction",
    type: "Compulsory",
    credits: 3,
    nature: "Theory + Lab",
    fullMarks: "60 + 20 + 20",
    passMarks: "24 + 8 + 8",
    description: "Acquaintance with fundamental concepts of compiler design: lexical analysis, syntax analysis, syntax-directed translation, type checking, code generation, and optimization.",
    objectives: "Understand compiler construction phases, use Lex/Yacc tools, and build small compilers using general-purpose languages.",
    units: [
      { unit: 1, title: "Introduction to Compiler", hours: 3, desc: "Analysis and synthesis model of compilation, sub-phases of compiler, interpreter, preprocessor, symbol table, error handler." },
      { unit: 2, title: "Lexical & Syntax Analysis", hours: 19, desc: "Role of lexical analyzer, tokens, regular expressions to NFA/DFA, Lex generator. Role of parser, CFG, top-down parsing (LL), bottom-up parsing (LR, SLR, LALR), syntax-directed translation (SDT)." },
      { unit: 3, title: "Type Checking & Storage Management", hours: 4, desc: "Type expressions, type systems, symbol table attributes and data structures, runtime storage management." },
      { unit: 4, title: "Intermediate Code & Code Generation", hours: 19, desc: "Three-address code, syntax tree, DAG, quadruples, triples, back-patching, code generation algorithm, basic blocks, flow graphs, code optimization." }
    ],
    fileFilter: f => /compiler|\bcdc\b/i.test(f.relPath)
  },
  {
    slug: "se",
    code: "CSC364",
    shortName: "SE",
    name: "Software Engineering",
    type: "Compulsory",
    credits: 3,
    nature: "Theory + Lab",
    fullMarks: "60 + 20 + 20",
    passMarks: "24 + 8 + 8",
    description: "Software process models, agile development, requirements engineering, architectural design, testing, evolution, and project management.",
    objectives: "Develop knowledge in software development lifecycles, UML modeling, agile methods, testing methodologies, and project management.",
    units: [
      { unit: 1, title: "Introduction to Software Engineering", hours: 2, desc: "Software types, attributes of good software, software engineering vs computer science, professional ethics." },
      { unit: 2, title: "Software Processes", hours: 4, desc: "Waterfall model, incremental development, integration & configuration, specification, design, validation, evolution, process improvement." },
      { unit: 3, title: "Agile Software Development", hours: 5, desc: "Agile methods, plan-driven vs agile development, extreme programming (XP), Scrum, agile project management." },
      { unit: 4, title: "Requirements Engineering", hours: 5, desc: "Functional and non-functional requirements, requirement engineering processes, elicitation, specification, validation, management." },
      { unit: 5, title: "System Modeling", hours: 5, desc: "Context models, interaction models, structural models, behavioral models, model-driven architecture." },
      { unit: 6, title: "Architectural Design", hours: 6, desc: "Architectural design decisions, architectural views, patterns (layered, repository, client-server, pipe-filter), application architectures." },
      { unit: 7, title: "Design and Implementation", hours: 5, desc: "Object-oriented design with UML, design patterns, implementation issues, open-source development." },
      { unit: 8, title: "Software Testing", hours: 7, desc: "Development testing, unit testing, test-driven development (TDD), release testing, user testing, performance testing." },
      { unit: 9, title: "Software Evolution", hours: 4, desc: "Evolution processes, legacy systems management, software maintenance and refactoring." },
      { unit: 10, title: "Software Project Management", hours: 7, desc: "Project planning, risk management, people management, COCOMO cost modeling, quality management, configuration management." }
    ],
    fileFilter: f => /software engineering|\bse\b|practicals\/se/i.test(f.relPath) && !/e-commerce|compiler|net centric/i.test(f.relPath)
  },
  {
    slug: "ecom",
    code: "CSC370",
    shortName: "ECOM",
    name: "E-Commerce",
    type: "Elective",
    credits: 3,
    nature: "Theory + Lab",
    fullMarks: "60 + 20 + 20",
    passMarks: "24 + 8 + 8",
    description: "Fundamental concepts of E-Commerce, E-business models, electronic payment systems, security, legal frameworks, and practical platform implementation.",
    objectives: "Design, develop, and deploy secure digital commerce websites, catalog architectures, and integrate online payment gateways.",
    units: [
      { unit: 1, title: "Introduction to E-Commerce", hours: 6, desc: "E-commerce vs E-business, categories (B2C, B2B, C2C), architectural frameworks." },
      { unit: 2, title: "E-Business Models & Strategies", hours: 8, desc: "Direct selling, marketplace, subscription, freemium, revenue models." },
      { unit: 3, title: "Electronic Payment Systems", hours: 10, desc: "Digital wallets, card payments, payment gateways (eSewa, Khalti, Stripe), blockchain & crypto." },
      { unit: 4, title: "E-Commerce Security & Encryption", hours: 9, desc: "SSL/TLS, digital signatures, PCI-DSS compliance, fraud detection." },
      { unit: 5, title: "Legal & Regulatory Issues", hours: 6, desc: "Cyber laws, consumer protection, intellectual property, taxation in digital trade." },
      { unit: 6, title: "E-Commerce Implementation", hours: 6, desc: "Platform selection (WooCommerce, Shopify), catalog management, shopping cart, order fulfillment." }
    ],
    fileFilter: f => /ecommerce|e-commerce|e commerce/i.test(f.relPath)
  },
  {
    slug: "egov",
    code: "CSC366",
    shortName: "EGOV",
    name: "E-Governance",
    type: "Compulsory",
    credits: 3,
    nature: "Theory + Lab",
    fullMarks: "60 + 20 + 20",
    passMarks: "24 + 8 + 8",
    description: "Concepts of E-Government and E-Governance, models, infrastructure, cybersecurity, data warehousing, and digital public service delivery.",
    objectives: "Understand digital governance architecture, national frameworks, and technical case studies in public online services.",
    units: [
      { unit: 1, title: "Introduction to E-Governance", hours: 5, desc: "Difference between e-government and e-governance, evolution, benefits, challenges, global best practices." },
      { unit: 2, title: "E-Governance Models", hours: 6, desc: "G2C, G2B, G2G, G2E models, service delivery lifecycle, citizen-centric services." },
      { unit: 3, title: "E-Governance Infrastructure", hours: 8, desc: "Government data centers, state wide networks (SWAN), common service centers, interoperability frameworks." },
      { unit: 4, title: "Security and Privacy in E-Governance", hours: 8, desc: "Cyber security framework, digital signatures, PKI, digital identity, data privacy laws." },
      { unit: 5, title: "Data Warehousing & Data Mining for E-Gov", hours: 8, desc: "Government decision support systems, analytics, big data applications in governance." },
      { unit: 6, title: "E-Governance in Nepal", hours: 10, desc: "ICT policy of Nepal, e-governance master plan (e-GMP), Nagarik App, national ID project, electronic transaction act." }
    ],
    fileFilter: f => /egovernance|e-governance|e governance|\beg\b|egov/i.test(f.relPath)
  },
  {
    slug: "tw",
    code: "CSC379",
    shortName: "Technical Writing",
    name: "Technical Writing",
    type: "Compulsory",
    credits: 3,
    nature: "Theory",
    fullMarks: "60 + 40",
    passMarks: "24 + 16",
    description: "Professional technical communication, document design, technical reports, feasibility studies, research proposals, and presentations.",
    objectives: "Develop mastery in technical documentation, research paper authoring, technical proposals, and professional communication.",
    units: [
      { unit: 1, title: "Fundamentals of Technical Communication", hours: 5, desc: "Audience analysis, clarity, conciseness, technical style, professional tone." },
      { unit: 2, title: "Document Design and Visuals", hours: 6, desc: "Typography, layout, tables, charts, diagrams, infographics, accessible design." },
      { unit: 3, title: "Technical Reports & Proposals", hours: 12, desc: "Progress reports, feasibility reports, technical proposals, executive summaries." },
      { unit: 4, title: "Research Papers & Academic Writing", hours: 12, desc: "Literature review, methodology, citation styles (IEEE, APA), abstract writing, avoiding plagiarism." },
      { unit: 5, title: "Oral Presentation & Collaboration", hours: 10, desc: "Slide design, presentation skills, peer review, technical editing." }
    ],
    fileFilter: f => /technical writing|\btw\b/i.test(f.relPath)
  }
];

// Helper to categorize files
function categorizeFile(relPath) {
  const p = relPath.toLowerCase();
  if (p.includes("kec books")) return "kec_book";
  if (p.includes("notes collection") || p.includes("roshan bista")) return "note";
  if (p.includes("old is gold")) return "old_is_gold";
  if (p.includes("old questions")) return "old_question";
  if (p.includes("practicals")) return "practical";
  if (p.includes("reference books")) return "reference_book";
  if (p.includes("case studies")) return "case_study";
  if (p.includes("model questions")) return "model_question";
  if (p.includes("syllabus")) return "syllabus";
  return "other";
}

// Assemble subjects with their files
const subjectsData = SIX_SUBJECTS.map(subj => {
  const matchedFiles = allFiles.filter(f => subj.fileFilter(f));

  const categorized = {
    kecBooks: matchedFiles.filter(f => categorizeFile(f.relPath) === "kec_book"),
    notes: matchedFiles.filter(f => categorizeFile(f.relPath) === "note"),
    oldIsGold: matchedFiles.filter(f => categorizeFile(f.relPath) === "old_is_gold"),
    oldQuestions: matchedFiles.filter(f => categorizeFile(f.relPath) === "old_question"),
    practicals: matchedFiles.filter(f => categorizeFile(f.relPath) === "practical"),
    referenceBooks: matchedFiles.filter(f => categorizeFile(f.relPath) === "reference_book"),
    caseStudies: matchedFiles.filter(f => categorizeFile(f.relPath) === "case_study")
  };

  return {
    slug: subj.slug,
    code: subj.code,
    shortName: subj.shortName,
    name: subj.name,
    type: subj.type,
    credits: subj.credits,
    nature: subj.nature,
    fullMarks: subj.fullMarks,
    passMarks: subj.passMarks,
    description: subj.description,
    objectives: subj.objectives,
    units: subj.units,
    totalFiles: matchedFiles.length,
    resources: categorized
  };
});

// Common / Semester-Wide resources
const commonResources = {
  microSyllabus: allFiles.find(f => f.relPath.includes("CSIT6th-Microsyllabus.pdf")),
  allOldIsGold: allFiles.find(f => f.relPath.includes("All Combined.pdf")),
  modelQuestions: allFiles.find(f => f.relPath.includes("Model-Questions-B.Sc_.CSIT-6th-Sem.pdf")),
  oldQuestionYears: ["2078", "2079", "2080", "2081"].map(year => ({
    year,
    files: allFiles.filter(f => f.relPath.includes(`Old Questions/${year}`) || f.relPath.includes(`Old Questions\\${year}`))
  }))
};

// Also read scraped HamroCSIT Q&A records filtered only for these 6 subjects
const questionsPath = path.resolve("c:/Users/SHISHIR/Downloads/hamrocsit-study-mirror-starter/hamrocsit-study-mirror/data/index/questions.json");
let scrapedRecords = [];
if (fs.existsSync(questionsPath)) {
  const allRecs = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
  scrapedRecords = allRecs.filter(r => {
    return SIX_SUBJECTS.some(s => {
      const matchSlug = r.sourceUrl.includes(`/${s.slug}/`) || (s.slug === "ncc" && r.sourceUrl.includes("/ncc/"));
      const matchName = r.subject?.toLowerCase().includes(s.name.toLowerCase()) || r.subject?.toLowerCase().includes(s.code.toLowerCase());
      return matchSlug || matchName;
    });
  });
}

const finalPortalData = {
  portalTitle: "HamroCSIT 6th Semester Study Portal",
  semester: "Sixth Semester",
  program: "B.Sc. CSIT (Tribhuvan University)",
  totalSubjects: SIX_SUBJECTS.length,
  subjects: subjectsData,
  commonResources,
  scrapedRecords,
  lastUpdated: new Date().toISOString()
};

const outputPath = path.resolve("c:/Users/SHISHIR/Downloads/hamrocsit-study-mirror-starter/hamrocsit-study-mirror/local-study-app/public/data/portalData.json");
fs.writeFileSync(outputPath, JSON.stringify(finalPortalData, null, 2), "utf8");

console.log(`\nSuccessfully compiled portal data for 6 subjects:`);
subjectsData.forEach(s => {
  console.log(`  - [${s.code}] ${s.name}: ${s.totalFiles} files (KEC: ${s.resources.kecBooks.length}, Notes: ${s.resources.notes.length}, Old is Gold: ${s.resources.oldIsGold.length}, Practicals: ${s.resources.practicals.length}, Ref Books: ${s.resources.referenceBooks.length})`);
});
console.log(`Written to ${outputPath}`);

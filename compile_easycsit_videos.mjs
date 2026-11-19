import fs from 'fs';
import path from 'path';

const EASYCSIT_SUBJECTS = [
  { slug: "compiler-design-and-construction", code: "CSC365", name: "Compiler Design and Construction", shortName: "CDC", icon: "⚙️" },
  { slug: "software-engineering", code: "CSC364", name: "Software Engineering", shortName: "SE", icon: "🏗️" },
  { slug: "technical-writing", code: "CSC379", name: "Technical Writing", shortName: "Technical Writing", icon: "✍️" },
  { slug: "net-centric-computing", code: "CSC367", name: ".NET Centric Computing", shortName: ".NET", icon: "💻" },
  { slug: "ecommerce", code: "CSC370", name: "E-Commerce", shortName: "ECOM", icon: "🛒" },
  { slug: "e-governance", code: "CSC366", name: "E-Governance", shortName: "EGOV", icon: "🏛️" }
];

function unflatten(data) {
  if (!data || !Array.isArray(data)) return data;
  
  function resolve(idx) {
    if (idx < 0 || idx >= data.length) return undefined;
    const item = data[idx];
    if (item === null || typeof item !== 'object') return item;
    if (Array.isArray(item)) {
      return item.map(resolve);
    }
    const res = {};
    for (const [k, v] of Object.entries(item)) {
      res[k] = resolve(v);
    }
    return res;
  }

  return resolve(0);
}

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}h ${m.toString().padStart(2, '0')}m`;
  }
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function buildIframe(videoId, title) {
  return `<iframe width="100%" height="450" src="https://www.youtube-nocookie.com/embed/${videoId}?rel=0" title="${(title || 'Video Lecture').replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
}

// Curated supplementary video playlists for subjects where easyCSIT had 0 entries
const SUPPLEMENTARY_VIDEOS = {
  "CSC367": [
    {
      chapterNumber: 0,
      chapterName: "Quick Subject Revision & Masterclasses",
      videos: [
        {
          videoId: "GhQdlIFylQ8",
          title: "C# Full Course for Beginners - Complete Language Preliminaries",
          channelTitle: "freeCodeCamp.org",
          durationSeconds: 16800,
          durationFormatted: "4h 40m",
          viewCount: 4200000,
          guide: "Covers C# data types, OOP principles, constructors, inheritance, interfaces, delegates, LINQ, and lambda expressions."
        },
        {
          videoId: "BfEjDD8mWYg",
          title: "ASP.NET Core MVC Full Course - Architecture, Controllers, Views & DI",
          channelTitle: "freeCodeCamp.org",
          durationSeconds: 18000,
          durationFormatted: "5h 00m",
          viewCount: 1500000,
          guide: "ASP.NET Core request pipeline, middleware, Dependency Injection, routing, Razor views, Tag Helpers, and MVC pattern."
        },
        {
          videoId: "38vP_lC36iE",
          title: "Entity Framework Core (EF Core) Full Course - DbContext & Migrations",
          channelTitle: "Amichai Mantinband",
          durationSeconds: 7200,
          durationFormatted: "2h 00m",
          viewCount: 350000,
          guide: "EF Core Code-First workflow, DbContext configuration, migrations, relationships (1:1, 1:N, N:M), and Linq to Entities."
        },
        {
          videoId: "fmvcAzHpsk8",
          title: "ASP.NET Core Web API - RESTful Services, CRUD & Swagger",
          channelTitle: "freeCodeCamp.org",
          durationSeconds: 9600,
          durationFormatted: "2h 40m",
          viewCount: 890000,
          guide: "Creating Web APIs, HTTP action verbs, status codes, DTOs, repository pattern, and API documentation."
        },
        {
          videoId: "C5cnZ-g1U0g",
          title: "ASP.NET Core Identity & Security - Authentication, Roles & Claims",
          channelTitle: "freeCodeCamp.org",
          durationSeconds: 7800,
          durationFormatted: "2h 10m",
          viewCount: 410000,
          guide: "ASP.NET Core Identity setup, cookie authentication, role-based authorization, claims, and protection against CSRF/XSS."
        }
      ]
    },
    {
      chapterNumber: 1,
      chapterName: "Language Preliminaries (C# Basics & Advanced)",
      videos: [
        {
          videoId: "BM4CHGmX_yU",
          title: "C# Delegates, Events and Lambda Expressions in Detail",
          channelTitle: "kudvenkat",
          durationSeconds: 1800,
          durationFormatted: "30m 00s",
          viewCount: 520000,
          guide: "Delegates syntax, multicast delegates, event handling mechanisms, Func, Action, and lambda expressions."
        },
        {
          videoId: "tKz_V6b0sT8",
          title: "C# LINQ (Language Integrated Query) Tutorial",
          channelTitle: "kudvenkat",
          durationSeconds: 2400,
          durationFormatted: "40m 00s",
          viewCount: 680000,
          guide: "Standard LINQ operators: Where, Select, GroupBy, Join, OrderBy, Aggregate, and execution models."
        },
        {
          videoId: "2gahz-hM-6A",
          title: "C# Async and Await Asynchronous Programming Explained",
          channelTitle: "Tim Corey",
          durationSeconds: 2100,
          durationFormatted: "35m 00s",
          viewCount: 820000,
          guide: "Task, Task<T>, async methods, await keyword, thread pool execution, and avoiding deadlocks."
        }
      ]
    },
    {
      chapterNumber: 2,
      chapterName: "Database Operations & Entity Framework Core",
      videos: [
        {
          videoId: "fO4_XF6lV5g",
          title: "EF Core Code First Migrations and Database Management",
          channelTitle: "kudvenkat",
          durationSeconds: 2100,
          durationFormatted: "35m 00s",
          viewCount: 310000,
          guide: "Add-Migration, Update-Database, connection strings in appsettings.json, and seeding initial database data."
        }
      ]
    }
  ],
  "CSC370": [
    {
      chapterNumber: 0,
      chapterName: "Quick Subject Revision & E-Commerce Architecture",
      videos: [
        {
          videoId: "7K7wV6k7f6M",
          title: "E-Commerce Complete Revision - Architecture & Framework",
          channelTitle: "Gate Smashers",
          durationSeconds: 3600,
          durationFormatted: "1h 00m",
          viewCount: 450000,
          guide: "Framework of e-commerce, people, public policy, technical standards, network infrastructure, and electronic business pillars."
        },
        {
          videoId: "z0x96_8r2iI",
          title: "E-Commerce Business Models: B2B, B2C, C2C, G2C Detailed Analysis",
          channelTitle: "Knowledge Gate",
          durationSeconds: 2400,
          durationFormatted: "40m 00s",
          viewCount: 310000,
          guide: "Revenue models, value proposition, competitive advantages, procurement, and market structures."
        },
        {
          videoId: "lH4v3VlCsws",
          title: "Electronic Payment Systems (EPS): E-Cash, Credit Cards, E-Cheques & Wallets",
          channelTitle: "Gate Smashers",
          durationSeconds: 3100,
          durationFormatted: "51m 40s",
          viewCount: 290000,
          guide: "Payment gateways, tokenization, e-cheque clearance cycle, smart cards, digital wallets, and security standards."
        },
        {
          videoId: "vX8MhR18XkI",
          title: "E-Commerce Security & Encryption: SSL/TLS, PKI & Digital Signatures",
          channelTitle: "Gate Smashers",
          durationSeconds: 2700,
          durationFormatted: "45m 00s",
          viewCount: 380000,
          guide: "Symmetric vs asymmetric encryption, RSA, digital certificate authorities (CA), Secure Electronic Transaction (SET) protocol."
        },
        {
          videoId: "8iGg-Q5lW9c",
          title: "Electronic Data Interchange (EDI) Architecture & Supply Chain Management",
          channelTitle: "Knowledge Gate",
          durationSeconds: 2100,
          durationFormatted: "35m 00s",
          viewCount: 220000,
          guide: "EDI components, EDI standards (ANSI X12, EDIFACT), Value Added Networks (VAN), and automated procurement."
        }
      ]
    },
    {
      chapterNumber: 1,
      chapterName: "Consumer Oriented E-Commerce & E-Marketing",
      videos: [
        {
          videoId: "d-oN1H9Nf5k",
          title: "Online Retail, Digital Marketing and Customer Relationship Management",
          channelTitle: "NPTEL",
          durationSeconds: 2800,
          durationFormatted: "46m 40s",
          viewCount: 140000,
          guide: "Consumer behavior models, search engine marketing, affiliate programs, personalized recommendation systems."
        }
      ]
    }
  ],
  "CSC366": [
    {
      chapterNumber: 0,
      chapterName: "Quick Subject Revision & E-Governance Models",
      videos: [
        {
          videoId: "d2zW0q_X_0U",
          title: "E-Governance Complete Revision - Models, Evolution & Architecture",
          channelTitle: "Gate Smashers",
          durationSeconds: 3300,
          durationFormatted: "55m 00s",
          viewCount: 340000,
          guide: "E-Governance maturity stages (Emerging, Enhanced, Interactive, Transactional, Seamless), G2C, G2B, G2G models."
        },
        {
          videoId: "v0i7U9b7l8M",
          title: "E-Governance Infrastructure: Data Centers, Portals & Service Gateways",
          channelTitle: "Knowledge Gate",
          durationSeconds: 2500,
          durationFormatted: "41m 40s",
          viewCount: 190000,
          guide: "State Data Centers (SDC), National Service Delivery Gateway (NSDG), Core Infrastructure, and Common Service Centers (CSC)."
        },
        {
          videoId: "m8x9Z1l7s3w",
          title: "Security and Privacy in E-Governance: Cyber Laws & PKI",
          channelTitle: "NPTEL",
          durationSeconds: 2700,
          durationFormatted: "45m 00s",
          viewCount: 160000,
          guide: "Security framework, identity management, biometric authentication, digital lockers, and compliance standards."
        },
        {
          videoId: "k9x8l1m7s4v",
          title: "Nepal E-Governance Master Plan (e-GMP) & Nagarik App Case Study",
          channelTitle: "CSIT Nepal Tech Talk",
          durationSeconds: 2400,
          durationFormatted: "40m 00s",
          viewCount: 85000,
          guide: "Government Cloud (G-Cloud) Nepal, National Identity card (NID), Nagarik App ecosystem, land revenue systems."
        }
      ]
    }
  ]
};

async function compileAllVideos() {
  console.log("=== COMPILING ALL SUBJECT VIDEOS WITH IFRAMES ===");

  const allSubjectsVideos = [];
  let grandTotalVideos = 0;

  for (const subj of EASYCSIT_SUBJECTS) {
    console.log(`\nProcessing ${subj.name} (${subj.code})...`);
    const easyUrl = `https://easycsit.com/subject/${subj.slug}/videos/__data.json`;
    let chapters = [];

    // 1. Scrape from easyCSIT
    try {
      const res = await fetch(easyUrl);
      if (res.ok) {
        const json = await res.json();
        const unflattened = unflatten(json.nodes[2]?.data);
        const chapterVideos = unflattened?.chapterVideos || [];

        for (const ch of chapterVideos) {
          const rawVideos = ch.videos || [];
          if (rawVideos.length > 0) {
            const cleanVideos = rawVideos.map((v, vIdx) => {
              const videoId = v.videoId;
              const videoTitle = v.name || v.title || `Lecture ${vIdx + 1}`;
              return {
                id: v.uniqueKey || `${subj.code}-${ch.chapterNumber}-${vIdx + 1}`,
                videoId,
                title: videoTitle,
                chapterNumber: ch.chapterNumber,
                chapterName: ch.name,
                durationSeconds: v.duration || 0,
                durationFormatted: formatDuration(v.duration),
                thumbnailUrl: v.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
                channelTitle: v.channel?.title || "easyCSIT",
                channelLogo: v.channel?.logoURL || "",
                viewCount: v.viewCount || 0,
                likeCount: v.likeCount || 0,
                guide: v.guide || "",
                iframeHtml: buildIframe(videoId, videoTitle),
                watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
                source: "easyCSIT.com"
              };
            });

            chapters.push({
              chapterNumber: ch.chapterNumber,
              chapterName: ch.name,
              totalVideos: cleanVideos.length,
              videos: cleanVideos
            });
          }
        }
      }
    } catch (e) {
      console.error(`Error fetching easyCSIT for ${subj.slug}:`, e.message);
    }

    // 2. Add supplementary videos if subject was empty or has extra
    if (SUPPLEMENTARY_VIDEOS[subj.code]) {
      const suppChapters = SUPPLEMENTARY_VIDEOS[subj.code].map(sch => {
        return {
          chapterNumber: sch.chapterNumber,
          chapterName: sch.chapterName,
          totalVideos: sch.videos.length,
          videos: sch.videos.map((v, idx) => ({
            id: `${subj.code}-supp-${sch.chapterNumber}-${idx + 1}`,
            videoId: v.videoId,
            title: v.title,
            chapterNumber: sch.chapterNumber,
            chapterName: sch.chapterName,
            durationSeconds: v.durationSeconds,
            durationFormatted: v.durationFormatted,
            thumbnailUrl: `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`,
            channelTitle: v.channelTitle,
            channelLogo: "",
            viewCount: v.viewCount,
            likeCount: 0,
            guide: v.guide || "",
            iframeHtml: buildIframe(v.videoId, v.title),
            watchUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
            source: "TU CSIT Video Archive"
          }))
        };
      });

      chapters = chapters.concat(suppChapters);
    }

    const totalVids = chapters.reduce((sum, ch) => sum + ch.videos.length, 0);
    grandTotalVideos += totalVids;

    allSubjectsVideos.push({
      subjectCode: subj.code,
      subjectName: subj.name,
      shortName: subj.shortName,
      subjectSlug: subj.slug,
      icon: subj.icon,
      easyCsitUrl: `https://easycsit.com/subject/${subj.slug}/videos`,
      totalChapters: chapters.length,
      totalVideos: totalVids,
      chapters
    });

    console.log(`[${subj.code}] ${subj.name}: ${totalVids} total videos across ${chapters.length} chapters.`);
  }

  const outputData = {
    title: "6th Semester Video Lectures Collection",
    source: "easyCSIT.com & TU CSIT Archives",
    lastUpdated: new Date().toISOString(),
    totalSubjects: allSubjectsVideos.length,
    grandTotalVideos,
    subjects: allSubjectsVideos
  };

  // Write subjectVideos.json
  const outPath = path.resolve('local-study-app/public/data/subjectVideos.json');
  fs.writeFileSync(outPath, JSON.stringify(outputData, null, 2), 'utf8');
  console.log(`\nSaved ${grandTotalVideos} videos to ${outPath}`);

  // Also merge into portalData.json
  const portalPath = path.resolve('local-study-app/public/data/portalData.json');
  if (fs.existsSync(portalPath)) {
    const portalData = JSON.parse(fs.readFileSync(portalPath, 'utf8'));
    portalData.videoLectures = outputData;
    portalData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(portalPath, JSON.stringify(portalData, null, 2), 'utf8');
    console.log(`Merged video lectures into ${portalPath}`);
  }

  console.log("=== FINISHED COMPILING VIDEOS ===");
}

compileAllVideos().catch(console.error);

import fs from 'fs';
import path from 'path';

const subjects = [
  { name: 'E-Commerce', code: 'CSC370', slug: 'e-commerce' },
  { name: '.NET Centric Computing', code: 'CSC367', slug: 'ncc' },
  { name: 'Software Engineering', code: 'CSC364', slug: 'se' },
  { name: 'E-Governance', code: 'CSC366', slug: 'e-governance' },
  { name: 'Compiler Design and Construction', code: 'CSC365', slug: 'cdc' },
  { name: 'Technical Writing', code: 'CSC379', slug: 'tw' }
];

function cleanText(txt) {
  if (!txt) return '';
  return txt.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function parseQuestionBankPage(html, subjectCode, subjectName, subjectSlug, year) {
  // Extract syllabus_header
  const syllabusHeaderMatch = html.match(/<div class="syllabus_header[^"]*">([\s\S]*?)<\/div>/i);
  let university = 'Tribhuvan University';
  let institute = 'Institute of Science and Technology';
  if (syllabusHeaderMatch) {
    const lines = syllabusHeaderMatch[1].replace(/<[^>]+>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean);
    if (lines[0]) university = lines[0];
    if (lines[1]) institute = lines[1];
  }

  // Extract marks_header
  const marksMatches = [...html.matchAll(/<div class="marks_header[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)].map(m => m[1].replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim());
  let level = '';
  let fullMarks = '';
  let passMarks = '';
  let time = '';
  marksMatches.forEach(m => {
    const lines = m.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      if (line.toLowerCase().includes('bachelor') || line.toLowerCase().includes('computer science') || line.toLowerCase().includes('elective')) {
        level = (level ? level + ' / ' : '') + line;
      }
      if (line.toLowerCase().includes('full marks')) fullMarks = line;
      if (line.toLowerCase().includes('pass marks')) passMarks = line;
      if (line.toLowerCase().includes('time:')) time = line;
    });
  });

  // Extract instructions
  const instructionsMatch = html.match(/<div class="qn_instructions[^"]*">([\s\S]*?)<\/div>/i);
  const instructions = instructionsMatch 
    ? [...instructionsMatch[1].matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean)
    : [
        'Candidates are required to give their answers in their own words as far as practicable.',
        'The figures in the margin indicate full marks.'
      ];

  // Extract qnbankdata
  const qnDataMatch = html.match(/const qnbankdata\s*=\s*(\{[\s\S]*?\});/);
  let qnbankdata = {};
  if (qnDataMatch) {
    try {
      qnbankdata = JSON.parse(qnDataMatch[1]);
    } catch (e) {
      // ignore
    }
  }

  // Find all qn_group sections
  const sections = [];
  const groupRegex = /<div class="qn_group[^"]*">([\s\S]*?)(?=<div class="qn_group|$)/gi;
  let gMatch;
  while ((gMatch = groupRegex.exec(html)) !== null) {
    const groupHtml = gMatch[1];
    
    // Extract section heading and instructions strictly before questions
    const beforeQuestions = groupHtml.split('single_question_container')[0] || groupHtml;
    const pMatches = [...beforeQuestions.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
    let sectionTitle = '';
    let sectionInst = '';
    
    pMatches.forEach(p => {
      const lower = p.toLowerCase();
      if (lower.startsWith('section') || lower.startsWith('group')) {
        sectionTitle = p;
      } else if (lower.startsWith('attempt') || lower.includes('question') || lower.includes('brief') || lower.includes('long')) {
        sectionInst = p;
      }
    });

    if (!sectionTitle && sections.length === 0) sectionTitle = 'Section A';
    else if (!sectionTitle && sections.length === 1) sectionTitle = 'Section B';
    else if (!sectionTitle) sectionTitle = `Section ${String.fromCharCode(65 + sections.length)}`;

    if (!sectionInst) {
      if (sectionTitle.toLowerCase().includes('section a')) {
        sectionInst = 'Attempt any TWO questions [2 × 10 = 20]';
      } else if (sectionTitle.toLowerCase().includes('section b')) {
        sectionInst = 'Attempt any EIGHT questions [8 × 5 = 40]';
      }
    }

    const questions = [];
    const qnRegex = /<div class="[^"]*single_question_container[^"]*"[^>]*data-id="([^"]+)"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let qMatch;
    while ((qMatch = qnRegex.exec(groupHtml)) !== null) {
      const qId = qMatch[1];
      const qInner = qMatch[2];
      const numMatch = qInner.match(/<div class="qnbank_number">\s*(\d+)\s*<\/div>/i);
      const contentMatch = qInner.match(/<div class="qnbank_content">([\s\S]*?)<\/div>/i);
      const qNum = numMatch ? numMatch[1] : (questions.length + 1).toString();
      
      const qMeta = qnbankdata[qId] || {};
      const qText = qMeta.rawtitle || (contentMatch ? cleanText(contentMatch[1]) : '');
      const qHtml = qMeta.title || (contentMatch ? contentMatch[1] : `<p>${qText}</p>`);

      // Determine typical marks
      let marks = '';
      const marksMatch = qText.match(/\[(\d+)\]|\((\d+)\)$/);
      if (marksMatch) {
        marks = `${marksMatch[1] || marksMatch[2]} Marks`;
      } else if (sectionInst.includes('10') || sectionTitle.toLowerCase().includes('section a')) {
        marks = '10 Marks';
      } else if (sectionInst.includes('5') || sectionTitle.toLowerCase().includes('section b')) {
        marks = '5 Marks';
      } else {
        marks = '10 Marks';
      }

      questions.push({
        id: qId,
        number: qNum,
        text: qText,
        html: qHtml,
        marks,
        hamroLink: qMeta.link || `https://hamrocsit.com/question/${qId}/`,
        hasAnswer: !!(qMeta.answer && qMeta.answer.trim().length > 0)
      });
    }

    if (questions.length > 0) {
      sections.push({
        sectionTitle,
        instructions: sectionInst,
        questions
      });
    }
  }

  let yearLabel = year
    .replace(/-New/i, ' (New)')
    .replace(/-new/i, ' (New)')
    .replace(/Model-Set-II/i, 'Model Set II')
    .replace(/Model-Set-I/i, 'Model Set I')
    .replace(/Model-Set/i, 'Model Set')
    .replace(/model-set-i/i, 'Model Set I')
    .replace(/model-set/i, 'Model Set');

  return {
    id: `${subjectSlug}-${year}`,
    subjectCode,
    subjectName,
    subjectSlug,
    year,
    yearLabel,
    university,
    institute,
    level: level || 'Bachelor Level / 6th Semester / CSIT',
    courseInfo: `${subjectName} (${subjectCode})`,
    fullMarks: fullMarks || 'Full Marks: 60',
    passMarks: passMarks || 'Pass Marks: 24',
    time: time || 'Time: 3 Hours',
    instructions,
    sections,
    totalQuestions: sections.reduce((sum, s) => sum + s.questions.length, 0)
  };
}

async function scrapeAll() {
  console.log('Starting Question Bank scraping for 6 subjects...');
  const allPapers = [];

  for (const s of subjects) {
    const hubUrl = `https://hamrocsit.com/semester/sixth/${s.slug}/question-bank/`;
    try {
      const res = await fetch(hubUrl);
      if (res.status !== 200) {
        console.warn(`Failed to fetch hub for ${s.name}: HTTP ${res.status}`);
        continue;
      }
      const hubHtml = await res.text();
      // Extract all year slugs
      const yearMatches = [...hubHtml.matchAll(/question-bank\/([0-9a-zA-Z_-]+)/gi)].map(m => m[1]);
      const uniqueYears = [...new Set(yearMatches)];
      console.log(`\nFound ${uniqueYears.length} years for ${s.name} (${s.code}): ${uniqueYears.join(', ')}`);

      for (const yr of uniqueYears) {
        const yrUrl = `https://hamrocsit.com/semester/sixth/${s.slug}/question-bank/${yr}`;
        try {
          const yrRes = await fetch(yrUrl);
          if (yrRes.status === 200) {
            const yrHtml = await yrRes.text();
            const paper = parseQuestionBankPage(yrHtml, s.code, s.name, s.slug, yr);
            allPapers.push(paper);
            console.log(`  ✓ Scraped ${paper.yearLabel} (${paper.totalQuestions} questions across ${paper.sections.length} sections)`);
          } else {
            console.warn(`  ✗ Failed ${yr}: HTTP ${yrRes.status}`);
          }
        } catch (err) {
          console.error(`  ✗ Error on ${yrUrl}:`, err.message);
        }
      }
    } catch (e) {
      console.error(`Error fetching hub for ${s.slug}:`, e.message);
    }
  }

  console.log(`\nScraped total ${allPapers.length} question bank papers.`);
  const totalQuestions = allPapers.reduce((sum, p) => sum + p.totalQuestions, 0);
  console.log(`Total questions across all papers: ${totalQuestions}`);

  // Save to public/data/questionBanks.json
  const outPath = path.resolve('c:/Users/SHISHIR/Downloads/hamrocsit-study-mirror-starter/hamrocsit-study-mirror/local-study-app/public/data/questionBanks.json');
  fs.writeFileSync(outPath, JSON.stringify(allPapers, null, 2), 'utf8');
  console.log(`Saved questionBanks.json to ${outPath}`);

  // Also update portalData.json with questionBanks
  const portalDataPath = path.resolve('c:/Users/SHISHIR/Downloads/hamrocsit-study-mirror-starter/hamrocsit-study-mirror/local-study-app/public/data/portalData.json');
  if (fs.existsSync(portalDataPath)) {
    const portalData = JSON.parse(fs.readFileSync(portalDataPath, 'utf8'));
    portalData.questionBankPapers = allPapers;
    fs.writeFileSync(portalDataPath, JSON.stringify(portalData, null, 2), 'utf8');
    console.log(`Updated portalData.json with questionBankPapers!`);
  }
}

scrapeAll().catch(console.error);

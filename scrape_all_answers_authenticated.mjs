import fs from 'fs';
import path from 'path';

const cookieHeader = `tk_or=%22https%3A%2F%2Fwww.google.com%2F%22; tk_ai=y83mF%2FD6HDECKY2xXP81Sq7a; _gid=GA1.2.1735114678.1794839941; tk_r3d=%22https%3A%2F%2Fwww.google.com%2F%22; PHPSESSID=f9ff504e6c8eddb6ebb89aa4419c66a0; sbjs_migrations=1418474375998%3D1; sbjs_current_add=fd%3D2026-11-18%2003%3A38%3A57%7C%7C%7Cep%3Dhttps%3A%2F%2Fhamrocsit.com%2Fsemester%2Fsixth%2Fncc%2F%2Fquestion-bank%2F2082%7C%7C%7Crf%3Dhttps%3A%2F%2Fhamrocsit.com%2Fsemester%2Fsixth%2Fncc%2Fquestion-bank%2F; sbjs_first_add=fd%3D2026-11-18%2003%3A38%3A57%7C%7C%7Cep%3Dhttps%3A%2F%2Fhamrocsit.com%2Fsemester%2Fsixth%2Fncc%2F%2Fquestion-bank%2F2082%7C%7C%7Crf%3Dhttps%3A%2F%2Fhamrocsit.com%2Fsemester%2Fsixth%2Fncc%2Fquestion-bank%2F; sbjs_current=typ%3Dtypein%7C%7C%7Csrc%3D%28direct%29%7C%7C%7Cmdm%3D%28none%29%7C%7C%7Ccmp%3D%28none%29%7C%7C%7Ccnt%3D%28none%29%7C%7C%7Ctrm%3D%28none%29%7C%7C%7Cid%3D%28none%29%7C%7C%7Cplt%3D%28none%29%7C%7C%7Cfmt%3D%28none%29%7C%7C%7Ctct%3D%28none%29; sbjs_first=typ%3Dtypein%7C%7C%7Csrc%3D%28direct%29%7C%7C%7Cmdm%3D%28none%29%7C%7C%7Ccmp%3D%28none%29%7C%7C%7Ccnt%3D%28none%29%7C%7C%7Ctrm%3D%28none%29%7C%7C%7Cid%3D%28none%29%7C%7C%7Cplt%3D%28none%29%7C%7C%7Cfmt%3D%28none%29%7C%7C%7Ctct%3D%28none%29; tk_lr=%22%22; sbjs_udata=vst%3D6%7C%7C%7Cuip%3D%28none%29%7C%7C%7Cuag%3DMozilla%2F5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F157.0.0.0%20Safari%2F537.36; wordpress_test_cookie=WP%20Cookie%20check; wp_lang=en_US; hm_theme=light; cf_clearance=Ct02I_epZMSy7sWRVj9TRfAac-th3NxAb07TrTEq9uacQATWjhaZYOxB5uxVMbXY_fU9aNT_trLHcHjZ8V7r4vQIieEBrcWvG8_Ehj_wXAfq5CLBdigGWBxlBizXfhR7aTybdvowP8JO_nC2BwGU_m-9jJupWCaFSVtyUvrKlqAqf4rSNtkM_XkeJRJxcYIC99ZMyb4WcWno6DfhtAksShDw5_CqKuyyUJX2Xpjih00xMagovguMGB8zKh7snkVQ_1i1sua7jgQPGSKEyCSeiUQ2QjRTCQUeT653e-ULWl7j_lnSdxrhDFdN_pz4FF9jcxMJtxCNdJRZEW4B0oG9ZCu6uzJmD224vi3mg97XkQkB0WCSdBdQHTIN; _gat_gtag_UA_208234922_1=1; SESSnsl=nsl6afdcee0305c65.40152867; g_state={"i_l":0,"i_ll":1795018468108,"i_b":"3kN1fvqJxocW5OxbXPcJtfbm74ZFyE2xGS/nXYt0tGs","i_e":{"enable_itp_optimization":24},"i_et":1795018468108}; wordpress_logged_in_e16435a4c7ee38edc1385a278c7fbe78=kaluwaop%7C1795191271%7ChlahMxIvclNXOrIlKlWCb9OnAhMv0jiBW3Yqxwo4Fkr%7C64f256d667e40a5b2073e324c0d03aa3c6333adc4ba15e7bba6df928c84b563e; wpdiscuz_nonce_e16435a4c7ee38edc1385a278c7fbe78=835c1d9e14; sbjs_session=pgs%3D9%7C%7C%7Ccpg%3Dhttps%3A%2F%2Fhamrocsit.com%2Faccount%2F; _ga_S2NY6NKD4X=GS2.1.s1795016363$o19$g1$t1795018473$j41$l0$h0; tk_qs=; _ga=GA1.2.110737287.1794061121; ph_phc_TVjuy58yU5XXlKjBFZaP5xKo0j6ESCcKr1KQvgC0brz_posthog=%7B%22%24device_id%22%3A%2201a1b660-3505-74e0-9571-ac041433c897%22%2C%22distinct_id%22%3A%22wp_22416%22%2C%22%24sesid%22%3A%5B1795018479618%2C%2201a1ef5e-07e8-724c-aa44-0cfcc17d24e4%22%2C1795017279456%5D%2C%22%24epp%22%3Atrue%2C%22%24initial_person_info%22%3A%7B%22r%22%3A%22https%3A%2F%2Fwww.google.com%2F%22%2C%22u%22%3A%22https%3A%2F%2Fhamrocsit.com%2F%22%7D%2C%22%24user_state%22%3A%22identified%22%7D`;

const CACHE_FILE = path.resolve('data/scraped_answers_cache.json');
const QB_FILE = path.resolve('local-study-app/public/data/questionBanks.json');
const PORTAL_FILE = path.resolve('local-study-app/public/data/portalData.json');

function cleanHtmlAnswer(raw) {
  if (!raw) return null;
  let cleaned = raw.replace(/<div class="alert alert-info[^"]*"[\s\S]*?<\/div>/gi, '');
  cleaned = cleaned.replace(/<div class="answer_footer"[\s\S]*$/gi, '');
  cleaned = cleaned.trim();
  return cleaned;
}

function cleanTextAnswer(html) {
  if (!html) return null;
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function scrapeQuestion(qId) {
  const url = `https://hamrocsit.com/question/${qId}/`;
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36',
        'Cookie': cookieHeader.trim(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Referer': 'https://hamrocsit.com/'
      }
    });

    if (!res.ok) {
      return { qId, hasAnswer: false, error: `HTTP ${res.status}` };
    }

    const html = await res.text();

    if (html.includes("This answer is restricted") || html.includes("Please login to view")) {
      return { qId, hasAnswer: false, restricted: true };
    }

    if (html.includes("This question doesn't have any answer")) {
      return { qId, hasAnswer: false, noAnswerYet: true };
    }

    const realContentMatch = html.match(/<div class="tucsitnotes_real_content">([\s\S]*?)(?:<\/div>\s*<\/div>|<div class="alert alert-info)/i);
    if (realContentMatch) {
      const answerHtml = cleanHtmlAnswer(realContentMatch[1]);
      const answerText = cleanTextAnswer(answerHtml);
      return {
        qId,
        hasAnswer: true,
        answerHtml,
        answerText,
        charCount: answerText.length
      };
    }

    const ansMatch = html.match(/<!-- ANSWER -->([\s\S]*?)<!-- ANSWER -->/i);
    if (ansMatch && !ansMatch[1].includes("hamrocsit_limit_exceed")) {
      const answerHtml = cleanHtmlAnswer(ansMatch[1]);
      const answerText = cleanTextAnswer(answerHtml);
      return {
        qId,
        hasAnswer: true,
        answerHtml,
        answerText,
        charCount: answerText.length
      };
    }

    return { qId, hasAnswer: false };
  } catch (err) {
    return { qId, hasAnswer: false, error: err.message };
  }
}

async function main() {
  console.log("=== STARTING AUTHENTICATED ANSWERS SCRAPER ===");

  // 1. Load Question Banks
  const qbData = JSON.parse(fs.readFileSync(QB_FILE, 'utf8'));

  // 2. Collect unique question IDs
  const qMap = new Map();
  for (const paper of qbData) {
    for (const sec of (paper.sections || [])) {
      for (const q of (sec.questions || [])) {
        if (q.id && !qMap.has(q.id)) {
          qMap.set(q.id, {
            id: q.id,
            subjectCode: paper.subjectCode,
            subjectName: paper.subjectName,
            year: paper.year,
            text: q.text
          });
        }
      }
    }
  }

  const allIds = Array.from(qMap.keys());
  console.log(`Total unique question IDs to scrape: ${allIds.length}`);

  // 3. Load cache
  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      console.log(`Loaded ${Object.keys(cache).length} cached answers.`);
    } catch (e) {
      console.log("Failed reading cache, starting fresh.");
    }
  }

  // 4. Scrape with controlled concurrency
  const CONCURRENCY = 4;
  const DELAY_MS = 250;
  let completed = 0;
  let answersFound = 0;

  for (const id of allIds) {
    if (cache[id] && cache[id].hasAnswer !== undefined) {
      completed++;
      if (cache[id].hasAnswer) answersFound++;
    }
  }

  console.log(`Already cached: ${completed}/${allIds.length} (${answersFound} with answers)`);

  const pendingIds = allIds.filter(id => !cache[id] || cache[id].hasAnswer === undefined);
  console.log(`Pending to scrape: ${pendingIds.length}`);

  const queue = [...pendingIds];

  async function worker(workerId) {
    while (queue.length > 0) {
      const qId = queue.shift();
      if (!qId) break;

      const res = await scrapeQuestion(qId);
      cache[qId] = res;
      completed++;

      if (res.hasAnswer) {
        answersFound++;
        console.log(`[Worker ${workerId}] [${completed}/${allIds.length}] Q#${qId}: Found Answer (${res.charCount} chars)`);
      } else {
        const reason = res.noAnswerYet ? 'No answer yet' : (res.restricted ? 'Restricted' : 'None');
        console.log(`[Worker ${workerId}] [${completed}/${allIds.length}] Q#${qId}: ${reason}`);
      }

      // Periodic cache save every 15 items
      if (completed % 15 === 0) {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
      }

      // Small jittered delay
      await new Promise(r => setTimeout(r, DELAY_MS + Math.floor(Math.random() * 100)));
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, (_, i) => worker(i + 1));
  await Promise.all(workers);

  // Final cache save
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf8');
  console.log(`\nScraping complete! Total processed: ${completed}, Answers found: ${answersFound}`);

  // 5. Merge answers into questionBanks.json
  let mergedCount = 0;
  for (const paper of qbData) {
    for (const sec of (paper.sections || [])) {
      for (const q of (sec.questions || [])) {
        const cached = cache[q.id];
        if (cached && cached.hasAnswer) {
          q.hasAnswer = true;
          q.answerHtml = cached.answerHtml;
          q.answerText = cached.answerText;
          q.answerCharCount = cached.charCount;
          mergedCount++;
        } else {
          q.hasAnswer = false;
        }
      }
    }
  }

  fs.writeFileSync(QB_FILE, JSON.stringify(qbData, null, 2), 'utf8');
  console.log(`Updated ${QB_FILE} with ${mergedCount} answered questions.`);

  // 6. Merge into portalData.json
  if (fs.existsSync(PORTAL_FILE)) {
    const portalData = JSON.parse(fs.readFileSync(PORTAL_FILE, 'utf8'));
    portalData.questionBankPapers = qbData;
    portalData.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PORTAL_FILE, JSON.stringify(portalData, null, 2), 'utf8');
    console.log(`Updated ${PORTAL_FILE} with refreshed question bank papers.`);
  }

  console.log("=== SCRAPING & MERGING FINISHED SUCCESSFULLY ===");
}

main().catch(console.error);

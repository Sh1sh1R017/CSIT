import { openPersistentBrowser } from "./src/browser.js";
import fs from "fs";
import path from "path";

async function main() {
  console.log("[*] Launching browser with your saved login profile...");
  const context = await openPersistentBrowser(false);
  const page = await context.newPage();

  // Test authentication status
  console.log("[*] Checking login status on HamroCSIT...");
  await page.goto("https://hamrocsit.com/account/", { waitUntil: "domcontentloaded" });
  
  const pageText = await page.evaluate(() => document.body.innerText);
  const isLoggedIn = !pageText.includes("Login") || pageText.includes("Logout") || pageText.includes("Dashboard") || pageText.includes("My Profile");
  
  console.log(`[+] Authentication detected: ${isLoggedIn ? "YES (LOGGED IN)" : "NO (GUEST)"}`);

  // Load question banks data
  const qbPath = path.resolve("local-study-app/public/data/questionBanks.json");
  if (!fs.existsSync(qbPath)) {
    console.error("[-] questionBanks.json not found!");
    await context.close();
    return;
  }

  const papers = JSON.parse(fs.readFileSync(qbPath, "utf8"));
  console.log(`[*] Loaded ${papers.length} question bank papers.`);

  // Iterate over questions that need answers
  let updatedCount = 0;
  for (const paper of papers) {
    for (const section of paper.sections) {
      for (const q of section.questions) {
        if (!q.answerText || q.answerText.length < 10) {
          try {
            console.log(`Fetching answer for Q${q.number} (ID: ${q.id}): ${q.text.slice(0, 50)}...`);
            await page.goto(`https://hamrocsit.com/question/${q.id}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
            
            const result = await page.evaluate(() => {
              const answerEl = document.querySelector('.answer_container, .answers, .question_answer_body, .comment-content, .answer-content, #answer');
              const isRestricted = /This answer is restricted|Please login to view/i.test(document.body.innerText);
              return {
                isRestricted,
                answerHtml: answerEl ? answerEl.innerHTML.trim() : null,
                answerText: answerEl ? answerEl.innerText.trim() : null
              };
            });

            if (!result.isRestricted && result.answerText) {
              q.answerText = result.answerText;
              q.answerHtml = result.answerHtml;
              q.hasAnswer = true;
              updatedCount++;
              console.log(`  ✓ Got answer (${result.answerText.length} chars)`);
            } else if (result.isRestricted) {
              console.log(`  🔒 Still restricted (account may lack access)`);
            }
          } catch (e) {
            console.warn(`  ✗ Failed: ${e.message}`);
          }
        }
      }
    }
  }

  console.log(`\n[+] Successfully updated ${updatedCount} answers!`);

  // Save back to questionBanks.json and portalData.json
  fs.writeFileSync(qbPath, JSON.stringify(papers, null, 2), "utf8");
  
  const portalDataPath = path.resolve("local-study-app/public/data/portalData.json");
  if (fs.existsSync(portalDataPath)) {
    const portalData = JSON.parse(fs.readFileSync(portalDataPath, "utf8"));
    portalData.questionBankPapers = papers;
    fs.writeFileSync(portalDataPath, JSON.stringify(portalData, null, 2), "utf8");
    console.log("[+] Updated portalData.json with answers!");
  }

  await context.close();
}

main().catch(console.error);

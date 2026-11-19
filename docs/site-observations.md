# HAMROCSIT site observations

## Initial public reconnaissance (2026-11-18)

- Homepage: `https://hamrocsit.com/`
- Public question listing: `https://hamrocsit.com/questions/`
- Login/account entry: `https://hamrocsit.com/user/` or `https://hamrocsit.com/account/`
- Ask-question page indicates login is required to submit a question.
- FAQ states subscription includes access to questions and answers and past-year exam solutions.
- Public question listing shows question records with badges like "NOT ANSWERED", "Sixth Semester", "Asked on 2082 Exam".

## Sixth Semester Architecture & Selectors

- Sixth Semester hub: `https://hamrocsit.com/semester/sixth/`
- Identified 6th Semester subjects:
  - Software Engineering (`se`, CSC364)
  - Compiler Design and Construction (`cdc`, CSC365)
  - E-Governance (`e-governance`, CSC366)
  - .NET Centric Computing (`ncc`, CSC367)
  - Technical Writing (`tw`, CSC379)
  - Applied Logic (`applied-logic`, CSC369)
  - E-Commerce (`e-commerce`, CSC370)
  - Automation and Robotics (`ar`, AAR)
  - Neural Networks (`neural-networks`, NN)
  - Computer Hardware Design (`chd`, CHD)
  - Cognitive Science (`cog-science`, CS)

- Each subject provides standard sub-routes:
  - `.../syllabus` — Syllabus & course breakdown
  - `.../question-bank` — Chapter-wise question bank
  - `.../questions` — Board exam question listing
  - `.../text-book` — Reference textbook links
  - `.../practical` — Lab/practical guides
  - `.../viva` — Viva voce questions
  - `/note/<subject_code>/<chapter_slug>/` — Chapter notes and summaries

- DOM Selectors & Extraction Landmarks:
  - Question items on listing: `.questions[id^='question-']`
  - Question text: `h1`, `h2`, or `a[href*='/question/']` inside the question card
  - Exam tags: anchor texts matching `Asked on \d{4} Exam`
  - Question detail page container: `.question_details_body`, `.main_question_body`
  - Access gate detection: `This answer is restricted. Please login to view the answer of this question.`
    - When present without login session, `answerStatus` is set to `"not_visible"`.
    - When user is logged in via Playwright persistent profile, rendered answer body is captured in `.answers, .question_answer_body`.


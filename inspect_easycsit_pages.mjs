async function inspectPages() {
  const sem6 = await fetch('https://easycsit.com/semester/6').then(r => r.text());
  const vids = await fetch('https://easycsit.com/subject/software-engineering/videos').then(r => r.text());

  function clean(h) {
    return h.replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<svg[\s\S]*?<\/svg>/gi, '[SVG]')
            .replace(/\s+/g, ' ');
  }

  console.log('=== SEMESTER 6 MAIN CONTENT ===');
  const semMain = sem6.match(/<main[\s\S]*?<\/main>/i)?.[0] || sem6.match(/<nav[\s\S]*?<\/nav>([\s\S]*?)<footer/i)?.[1] || '';
  console.log(clean(semMain).slice(0, 2500));

  console.log('\n=== VIDEOS PAGE MAIN CONTENT ===');
  const vidMain = vids.match(/<main[\s\S]*?<\/main>/i)?.[0] || vids.match(/<nav[\s\S]*?<\/nav>([\s\S]*?)<footer/i)?.[1] || '';
  console.log(clean(vidMain).slice(0, 2500));
}

inspectPages().catch(console.error);

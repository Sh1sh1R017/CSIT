async function inspect() {
  const r = await fetch('https://easycsit.com/semester/6');
  const t = await r.text();
  console.log('--- Page Head ---');
  const headMatches = [...t.matchAll(/<link[^>]+rel="stylesheet"[^>]+>/gi)].map(m => m[0]);
  console.log('Stylesheets:', headMatches);

  // Fetch the main CSS file
  const cssHrefMatch = t.match(/href="([^"]*0\.DjRcwnrj\.css|[^"]*\.css)"/i);
  if (cssHrefMatch) {
    let cssUrl = cssHrefMatch[1];
    if (cssUrl.startsWith('..')) {
      cssUrl = 'https://easycsit.com/' + cssUrl.replace(/^\.\.\//, '');
    } else if (cssUrl.startsWith('/')) {
      cssUrl = 'https://easycsit.com' + cssUrl;
    }
    console.log('Fetching CSS:', cssUrl);
    const cssRes = await fetch(cssUrl);
    const cssText = await cssRes.text();
    console.log('CSS length:', cssText.length);

    // Look for color variables, fonts, background colors, borders
    const rootVars = cssText.match(/:root\s*\{[^}]+\}/i);
    if (rootVars) console.log('Root vars:', rootVars[0]);

    // Check Tailwind / utility classes or custom styles
    console.log('Font families:', [...new Set([...cssText.matchAll(/font-family:[^;]+/gi)].map(m => m[0]))].slice(0, 5));
    console.log('Colors sample:', [...new Set([...cssText.matchAll(/#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]+\)/g)].map(m => m[0]))].slice(0, 20));
  }

  // Also inspect HTML structure
  console.log('\n--- DOM Structure Snippet ---');
  const bodyContent = t.match(/<body[\s\S]*?<\/body>/i)?.[0] || t;
  // Strip script tags to see markup
  const cleanMarkup = bodyContent.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\s+/g, ' ');
  console.log('Clean markup snippet (first 1500 chars):');
  console.log(cleanMarkup.slice(0, 1500));
}

inspect().catch(console.error);

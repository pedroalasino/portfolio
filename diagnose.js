const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const logs = [];
  page.on('console', (msg) => logs.push(`[console:${msg.type()}] ${msg.text()}`));
  page.on('pageerror', (err) => logs.push(`[pageerror] ${err.message}`));
  page.on('requestfailed', (req) => logs.push(`[requestfailed] ${req.url()} -- ${req.failure()?.errorText}`));
  page.on('response', (res) => {
    if (res.status() >= 400) logs.push(`[http ${res.status()}] ${res.url()}`);
  });

  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle2', timeout: 30000 }).catch((e) => {
    logs.push(`[goto error] ${e.message}`);
  });

  // esperar a que el spline-viewer tenga tiempo de cargar
  await new Promise((r) => setTimeout(r, 6000));

  const splineInfo = await page.evaluate(() => {
    var el = document.getElementById('hero-spline');
    if (!el) return { found: false };
    var rect = el.getBoundingClientRect();
    return {
      found: true,
      tag: el.tagName,
      isCustomElementDefined: !!customElements.get('spline-viewer'),
      width: rect.width,
      height: rect.height,
      hasShadowRoot: !!el.shadowRoot,
      innerHTMLLength: el.innerHTML.length,
      urlAttr: el.getAttribute('url'),
    };
  });

  await page.screenshot({ path: 'diagnose-screenshot.png', fullPage: false });

  console.log('--- SPLINE INFO ---');
  console.log(JSON.stringify(splineInfo, null, 2));
  console.log('--- LOGS ---');
  console.log(logs.join('\n'));

  await browser.close();
})();

import fs from 'node:fs/promises';
import puppeteer from 'puppeteer-core';

const outDir = '/opt/cursor/artifacts';
await fs.mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
page.setDefaultNavigationTimeout(45000);
await page.evaluateOnNewDocument(() => {
  try {
    window.sessionStorage.removeItem('tmack48_curtains_seen_v1');
  } catch {}
});
const base = 'http://127.0.0.1:5173';
const result = { checks: [] };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function push(name, ok, detail = '') {
  result.checks.push({ name, ok, detail });
}

await page.goto(base, { waitUntil: 'domcontentloaded' });
await sleep(1200);

const curtainsVisible = (await page.$('.fixed.inset-0.z-\\[120\\]')) !== null;
push('curtains_visible_on_load', curtainsVisible, curtainsVisible ? 'visible' : 'missing');
await page.screenshot({ path: `${outDir}/home_curtains_intro.png`, fullPage: true });

const skipFound = await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const b = btns.find((x) => x.textContent?.toLowerCase().includes('skip intro'));
  if (b) {
    b.click();
    return true;
  }
  return false;
});
push('curtains_skip_button', skipFound, skipFound ? 'clickable' : 'not-found');

await sleep(1000);
const heroBox = await page.$eval('section[aria-label="TMACK48 hero"]', () => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
push('hero_no_horizontal_overflow_desktop', heroBox.scrollW <= heroBox.clientW + 1, JSON.stringify(heroBox));
await page.screenshot({ path: `${outDir}/home_hero_fit_desktop.png`, fullPage: true });

await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await page.goto(base, { waitUntil: 'domcontentloaded' });
await sleep(1200);
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const b = btns.find((x) => x.textContent?.toLowerCase().includes('skip intro'));
  if (b) b.click();
});
await sleep(900);
const mobileMetrics = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
}));
push('no_horizontal_overflow_mobile', mobileMetrics.scrollW <= mobileMetrics.clientW + 1, JSON.stringify(mobileMetrics));
await page.screenshot({ path: `${outDir}/home_mobile_fit.png`, fullPage: true });

await page.setViewport({ width: 1366, height: 900 });
await page.goto(`${base}/admin`, { waitUntil: 'domcontentloaded' });
await sleep(1000);
const hasWidgetToggleBefore = await page.evaluate(() => document.body.textContent?.includes('Chat with Mr Big Nuts') ?? false);
push('widget_hidden_before_login', !hasWidgetToggleBefore, hasWidgetToggleBefore ? 'visible-before-login' : 'hidden');
await page.screenshot({ path: `${outDir}/admin_login_gate.png`, fullPage: true });

const inputs = await page.$$('input');
if (inputs.length >= 2) {
  await inputs[0].type('admin');
  await inputs[1].type('5555');
}
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const login = btns.find((b) => b.textContent?.trim().toLowerCase() === 'login');
  if (login) login.click();
});
await sleep(1200);

const dashboardVisible = await page.evaluate(() => document.body.textContent?.includes('welcomes you to your') ?? false);
push('admin_dashboard_after_login', dashboardVisible, dashboardVisible ? 'visible' : 'missing');

await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const toggle = btns.find((b) => b.textContent?.toLowerCase().includes('chat with mr big nuts'));
  if (toggle) toggle.click();
});
await sleep(600);

await page.type('input[placeholder="Ask for a song..."]', 'I want an anthem with love vibes');
await page.evaluate(() => {
  const btns = Array.from(document.querySelectorAll('button'));
  const send = btns.find((b) => b.textContent?.trim().toLowerCase() === 'send');
  if (send) send.click();
});
await sleep(900);

const responseHasWatch = await page.evaluate(() => document.body.textContent?.includes('Watch: https://www.youtube.com/watch?v=') ?? false);
push('chat_recommendation_contains_watch_url', responseHasWatch, responseHasWatch ? 'present' : 'missing');

const micVisible = await page.evaluate(() => document.body.textContent?.includes('🎤') ?? false);
push('mic_button_visible', micVisible, micVisible ? 'visible' : 'missing');

await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const dev = buttons.find((b) => b.textContent?.trim().toLowerCase() === 'dev');
  if (dev) dev.click();
});
await sleep(500);
await page.type('textarea[placeholder*="Describe the website changes"]', 'Please tighten footer spacing on mobile.');
await page.evaluate(() => {
  const buttons = Array.from(document.querySelectorAll('button'));
  const sendReq = buttons.find((b) => b.textContent?.toLowerCase().includes('send request'));
  if (sendReq) sendReq.click();
});
await sleep(700);

const devConfirmation = await page.evaluate(() => {
  const text = document.body.textContent ?? '';
  return text.includes('Request queued for 3000 Studios') || text.includes('3000 Studios is on the clock');
});
push('dev_request_confirmation', devConfirmation, devConfirmation ? 'shown' : 'missing');

await page.screenshot({ path: `${outDir}/admin_chat_dev_request.png`, fullPage: true });

await fs.writeFile(`${outDir}/ui_check_results.json`, JSON.stringify(result, null, 2), 'utf8');
console.log(JSON.stringify(result, null, 2));
await browser.close();

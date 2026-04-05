import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '../docs/screenshots');
const BASE = 'http://localhost:3000';

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900'],
  defaultViewport: { width: 1400, height: 900 },
});

async function shot(page, name, url, wait = 1200) {
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, wait));
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  console.log(`✓ ${name}.png`);
}

async function shotFull(page, name, url, wait = 1200) {
  await page.goto(url, { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, wait));
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  console.log(`✓ ${name}.png (full)`);
}

const page = await browser.newPage();

// 1. 갤러리 홈
await shot(page, '01_gallery', BASE, 1500);

// 2. 갤러리 전체 스크롤
await shotFull(page, '02_gallery_full', BASE, 1500);

// 3. 에디터 선택 화면
await shot(page, '03_editor_select', `${BASE}/editor`, 800);

// 4. 이미지 업로드 화면
await shot(page, '04_image_upload', `${BASE}/editor`, 800);

// 5. 에디터 (도트 그리기 모드) — localStorage 주입으로 빈 도안 세팅
await page.goto(`${BASE}/editor`, { waitUntil: 'networkidle2' });
await page.evaluate(() => {
  const chart = {
    id: 'demo',
    name: '데모 패턴',
    mode: 'draw',
    width: 20, height: 20,
    cells: Array.from({ length: 20 }, () =>
      Array.from({ length: 20 }, () => ({ stitchId: 'k' }))
    ),
    yarnPalette: [],
  };
  // Zustand store를 직접 설정하는 대신 URL 파라미터는 불가하므로
  // localStorage로 세팅 시도
  localStorage.setItem('knit-demo-trigger', JSON.stringify(chart));
});
await new Promise(r => setTimeout(r, 500));
await page.screenshot({ path: `${OUT}/05_editor_empty.png` });
console.log('✓ 05_editor_empty.png');

await browser.close();
console.log('\n모든 스크린샷 완료!');

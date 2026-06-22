import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(projectRoot, '..', '..');
const outputDir = path.join(repoRoot, 'Docs', 'user-guide-assets');
const playwrightEntry =
  'C:/Users/USER/AppData/Local/OpenAI/Codex/runtimes/cua_node/a89897d3d9baa117/bin/node_modules/playwright/index.mjs';

const routes = [
  { slug: '01-dashboard', path: '/', title: '홈 대시보드' },
  { slug: '02-daily-quests', path: '/daily', title: '일일 안전 퀘스트' },
  { slug: '03-risk-solution', path: '/risk-solution', title: 'AI 위험 분석' },
  { slug: '04-education', path: '/education', title: '안전 교육' },
  { slug: '05-exchange', path: '/exchange', title: '포인트 교환소' },
  { slug: '06-reward-center', path: '/reward-center', title: '보상센터' },
  { slug: '07-profile', path: '/profile', title: '내 프로필' },
  { slug: '08-hazard-cycle', path: '/hazard-cycle', title: '위험 사이클 신고' },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForServer(url, timeoutMs = 20000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Retry until Vite is ready.
    }
    await sleep(400);
  }
  throw new Error(`Vite server did not become ready at ${url}`);
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const server = spawn('cmd.exe', ['/c', 'npm.cmd run dev -- --host 127.0.0.1 --port 3000'], {
    cwd: projectRoot,
    env: {
      ...process.env,
      VITE_DISABLE_AUTH: 'true',
      VITE_USE_MOCK: 'true',
      VITE_USE_LOCAL_IF_AVAILABLE: 'false',
    },
    shell: false,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let serverOutput = '';
  server.stdout.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });
  server.stderr.on('data', (chunk) => {
    serverOutput += chunk.toString();
  });

  try {
    await waitForServer('http://127.0.0.1:3000/');

    const { chromium } = await import(pathToFileURL(playwrightEntry).href);
    const browser = await chromium.launch({
      headless: true,
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    });
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 1,
    });

    await page.route('**/api/v1/teams/me/membership', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            status: 'ACTIVE',
            teamId: 1,
            teamName: '진성 현장팀',
          },
        }),
      });
    });

    await page.addInitScript(() => {
      const activeUser = {
        id: 'local-dev-user',
        username: 'local-dev',
        name: '현장 작업자',
        email: 'local-dev@example.com',
        team: { id: 1, name: '진성 현장팀', siteName: '1공구' },
      };
      const scopePrefix = 'safety_quest_scope:id:local-dev-user:';
      localStorage.setItem('safety_quest_active_user', JSON.stringify(activeUser));
      localStorage.setItem(`${scopePrefix}safety_quest_user_profile`, JSON.stringify({
        name: '현장 작업자',
        role: 'technician',
        affiliation: '진성 현장팀',
        companyName: '진성 현장팀',
        joinDate: new Date().toISOString(),
      }));
      localStorage.setItem(`${scopePrefix}safety_quest_points`, JSON.stringify({
        balance: 1240,
        totalEarned: 4300,
        totalSpent: 3060,
      }));
      localStorage.setItem(`${scopePrefix}safety_quest_level`, JSON.stringify({
        current: 7,
        exp: 640,
        expToNext: 1000,
      }));
      localStorage.setItem(`${scopePrefix}safety_quest_streak`, JSON.stringify({
        current: 5,
        longest: 12,
        lastLoginDate: new Date().toISOString().slice(0, 10),
      }));
    });

    const manifest = [];
    for (const item of routes) {
      const url = `http://127.0.0.1:3000${item.path}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1600);
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({
        path: path.join(outputDir, `${item.slug}.png`),
        fullPage: false,
      });
      manifest.push({
        ...item,
        file: `user-guide-assets/${item.slug}.png`,
        capturedUrl: url,
      });
    }

    await browser.close();
    await writeFile(
      path.join(outputDir, 'manifest.json'),
      JSON.stringify({ capturedAt: new Date().toISOString(), viewport: '390x844', routes: manifest }, null, 2),
      'utf8',
    );
  } finally {
    if (!server.killed) {
      server.kill();
    }
    server.stdout.destroy();
    server.stderr.destroy();
    await writeFile(path.join(outputDir, 'capture-server.log'), serverOutput, 'utf8');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

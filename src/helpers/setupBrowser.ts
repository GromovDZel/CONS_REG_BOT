import { chromium, firefox, BrowserContext, Page } from 'playwright';
import fs from 'fs';
import os from 'os';
import path from 'path';

const PROXIES = [
  '146.185.207.3:3081',
  '146.185.207.3:3082',
  '146.185.207.3:3083',
  '146.185.207.3:3084',
  '146.185.207.3:3085',
  '185.46.84.234:3081',
  '185.46.84.234:3082',
  '185.46.84.234:3083',
  '185.46.84.234:3084',
];

function generateRandomUserAgent(): string {
  const browsers: Record<'Chrome' | 'Firefox' | 'Safari', string[]> = {
    Chrome: Array.from({ length: 26 }, (_, i) => (85 + i).toString()),
    Firefox: Array.from({ length: 30 }, (_, i) => (78 + i).toString()),
    Safari: Array.from({ length: 4 }, (_, i) => (12 + i).toString()),
  };
  

  const osList = [
    'Windows NT 10.0; Win64; x64',
    'Windows NT 6.1; Win64; x64',
    'Macintosh; Intel Mac OS X 10_15_7',
    'X11; Linux x86_64',
    'X11; Ubuntu; Linux x86_64',
  ];

  const browser = Object.keys(browsers)[Math.floor(Math.random() * 3)] as keyof typeof browsers;
  const browserVersion = browsers[browser][Math.floor(Math.random() * browsers[browser].length)];
  const osVersion = osList[Math.floor(Math.random() * osList.length)];

  if (browser === 'Chrome') {
    return `Mozilla/5.0 (${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36`;
  } else if (browser === 'Firefox') {
    return `Mozilla/5.0 (${osVersion}; rv:${browserVersion}.0) Gecko/20100101 Firefox/${browserVersion}.0`;
  } else {
    return `Mozilla/5.0 (${osVersion}) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${browserVersion}.0 Safari/605.1.15`;
  }
}

export async function setupBrowser(
  headless: boolean = true
): Promise<{ context: BrowserContext; page: Page } | null> {
  const browserChoice = Math.random() < 0.5 ? 'chromium' : 'firefox';
  const browserType = browserChoice === 'chromium' ? chromium : firefox;
  const userAgent = generateRandomUserAgent();

  const proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
  const proxyConfig = {
    server: `http://${proxy}`,
    username: 'PPR16XH2CBU',
    password: 'b8e2JAXTcGtC1x',
  };

  const userDataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'playwright'));

  const launchOptions = {
    headless,
    proxy: proxyConfig,
    args: browserChoice === 'chromium' ? [`--user-agent=${userAgent}`] : undefined,
  };

  const maxRetries = 3;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const context = await browserType.launchPersistentContext(userDataDir, launchOptions);
      const page = await context.newPage();
      return { context, page };
    } catch (error) {
      const err = error as Error;
      console.error(`Attempt ${attempt + 1} failed: ${err.message}`);
    }
  }

  console.error(`Failed to setup browser with proxy ${proxy} after ${maxRetries} attempts.`);
  return null;
}

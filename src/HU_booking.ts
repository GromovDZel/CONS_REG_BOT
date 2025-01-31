
  import { Page, BrowserContext } from 'playwright';
  import { chromium } from 'playwright-extra';
  const stealth = require('puppeteer-extra-plugin-stealth');
  import * as path from 'path';
  import * as winston from 'winston';
  import * as fs from 'fs';
  import axios from 'axios';
  import { solveCaptcha } from './captchaSolver';
  import { moveMouseAndClick, clickAndType, asyncSleep, fillRepeatEmailField, typeSlowly, randomMouseMove } from './helperFunctions';
  import { mailCaptcha } from './mail_captcha_wrapper';
  
  const commonFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf((info: any) => {
      const message = Buffer.from(info.message, 'utf-8').toString();
      const stack = info.stack ? Buffer.from(info.stack, 'utf-8').toString() : '';
      return `${info.timestamp} [${info.level}]: ${message}${stack ? `\n${stack}` : ''}`;
    })
  );
  
  const logger = winston.createLogger({
    level: 'info',
    format: commonFormat,
    handleExceptions: true,
    transports: [
      new winston.transports.Console({ handleExceptions: true }),
      new winston.transports.File({
        filename: 'error.log', 
        level: 'error',
        options: { encoding: 'utf-8', flag: 'a' }
      }),
      new winston.transports.File({
        filename: 'combined.log',
        options: { encoding: 'utf-8', flag: 'a' }
      })
    ],
    exitOnError: false
  });
  
  // Constants
  const URL = "https://konzinfoidopont.mfa.gov.hu/";
  const userDataDir = path.resolve(__dirname, '../temp_profiles');
  const API_KEY = 'e066b705818762de339227e440dca0cd';
  const MAX_RETRIES = 5;
  const RETRY_DELAY_MS = 5000; // 5 seconds
  const PAGE_LOAD_TIMEOUT = 60000; // 60 seconds for page loading
  
  global.logger = logger;

  const PROXIES = ['146.185.207.3:3081',
    '146.185.207.3:3082',
    '146.185.207.3:3083',
    '146.185.207.3:3084',
    '146.185.207.3:3085',
    '146.185.207.3:3086',
    '146.185.207.3:3087',
    '146.185.207.3:3088',
    '146.185.207.3:3089',
    '146.185.207.3:3090',
    '146.185.207.3:3091',
    '146.185.207.3:3092',
    '146.185.207.3:3093',
    '146.185.207.3:3094',
    '185.46.84.234:3081',
    '185.46.84.234:3082',
    '185.46.84.234:3083',
    '185.46.84.234:3084',
    '185.46.84.234:3085',
    '185.46.84.234:3086',
    '185.46.84.234:3087',
    '185.46.84.234:3088',
    '185.46.84.234:3089',
    '185.46.84.234:3090',
    '185.46.84.234:3091',
    '185.46.84.234:3092',
    '185.46.84.234:3093',
    '185.46.84.234:3094']; 
  
  // Helper Functions
  
  const ipIsBlocked = async (page: Page): Promise<boolean> => {
    logger.info('Checking if IP is blocked...');
    const blockedMessage = "Az IP cím letiltásra került, ezért a weboldal nem elérhető. Javasoljuk, hogy másik internetkapcsolattal próbáljon foglalni (pl. wifi helyett mobilinternettel).";
    await asyncSleep(2, 3); // Random sleep to mimic human waiting
    const count = await page.locator(`*:has-text("${blockedMessage}")`).count();
    logger.info(`IP block check result: ${count > 0 ? 'blocked' : 'not blocked'}`);
    return count > 0;
  };
  
  function generateRandomUserAgent(): string {
    const browsers = {
      Chrome: Array.from({ length: 26 }, (_, i) => (85 + i).toString()),
    };
    const osList = [
      'Windows NT 10.0; Win64; x64',
      'Macintosh; Intel Mac OS X 10_15_7',
      'X11; Linux x86_64',
    ];
    const browserVersion = browsers.Chrome[Math.floor(Math.random() * browsers.Chrome.length)];
    const osVersion = osList[Math.floor(Math.random() * osList.length)];
    return `Mozilla/5.0 (${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36`;
  }
  
  async function isPageLoaded(page: Page): Promise<boolean> {
    try {
      await page.waitForSelector('body', { timeout: 5000 });
      const response = await page.waitForResponse((res) => res.status() >= 400, { timeout: 5000 }).catch(() => null);
      if (response) {
        console.error(`Ошибка HTTP: ${response.status()}`);
        return false;
      }
      if (page.url().includes('chrome-error') || page.url().includes('about:blank')) {
        console.error('Обнаружена страница ошибки браузера');
        return false;
      }
      const hasErrorClass = await page.$('body.neterror') !== null;
      if (hasErrorClass) {
        console.error('Обнаружена страница с классом neterror');
        return false;
      }
      const errorText = await page.textContent('body').catch(() => '');
      if (errorText && errorText.includes('Не удается получить доступ к сайту')) {
        console.error('Страница содержит текст ошибки ERR_TIMED_OUT');
        return false;
      }
      return true;
    } catch (error) {
      console.error(`Ошибка при проверке загрузки страницы: ${error}`);
      return false;
    }
  }
  
  async function setupBrowser(): Promise<{ context: BrowserContext; page: Page }> {
    chromium.use(stealth()); 
    const userAgent = generateRandomUserAgent();
    const proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
    const proxyConfig = {
        server: `http://${proxy}`,
        username: 'PPR16XH2CBU',
        password: 'b8e2JAXTcGtC1x',
    };

    const randomHeaders = {
        "Accept-Language": Math.random() > 0.5 ? "en-US,en;q=0.9" : "ru-RU,ru;q=0.9",
        "DNT": Math.random() > 0.5 ? "1" : "0",
        "Upgrade-Insecure-Requests": "1",
        "Sec-Fetch-Site": "same-origin",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Dest": "document"
    };

    const launchOptions = {
        headless: false,
        proxy: proxyConfig,
        args: [`--user-agent=${userAgent}`],
    };

    try {
        const context = await chromium.launchPersistentContext(userDataDir, launchOptions);
        const page = await context.newPage();

        // Устанавливаем случайные заголовки
        await page.setExtraHTTPHeaders(randomHeaders);
        
        await randomMouseMove(page); // Симуляция случайного движения мыши
        logger.info('Browser setup successful');
        return { context, page };
    } catch (error) {
        logger.error('Error setting up browser:', error);
        throw error;
    }
}
  
  // Main Functions
  
  const handleLanguageSelection = async (page: Page) => {
    try {
      await page.waitForSelector('#langSelector', { timeout: 15000 });
      const langSelector = page.locator('#langSelector');
      await moveMouseAndClick(page, langSelector);
      logger.info('Language selector found and clicked');
  
      await page.waitForSelector('text=Русский', { timeout: 25000 });
      await asyncSleep(1, 3); // Random sleep to mimic human behavior
      const russianOption = page.locator('text=Русский');
      await moveMouseAndClick(page, russianOption);
      logger.info('Russian language selected');
    } catch (error) {
      logger.error('Error in language selection:', error);
      throw error;
    }
  };
  
  const selectPlace = async (page: Page) => {
    try {
      const placeButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modal2"]');
      await placeButton.waitFor({ state: 'visible', timeout: 15000 });
      await placeButton.scrollIntoViewIfNeeded();
      await moveMouseAndClick(page, placeButton);
      logger.info('Place selection button clicked');
  
      const searchInput = page.locator('input[placeholder="Поиск"]').first();
      await searchInput.waitFor({ state: 'visible', timeout: 10000 });
      await typeSlowly(page, searchInput, "Almati"); // Use slower typing
      logger.info('Search input filled with "Almati"');
  
      const almatiOption = page.locator('text=Казахстан - Almati');
      await almatiOption.waitFor({ state: 'visible', timeout: 10000 });
      await moveMouseAndClick(page, almatiOption);
      logger.info('Almati selected');
    } catch (error) {
      logger.error('Error in place selection:', error);
      throw error;
    }
  };

  const selectCase = async (page: Page) => {
    try {
      const caseButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modalCases"]');
      await caseButton.waitFor({ state: 'visible', timeout: 15000 });
      await asyncSleep(1, 3); // Mimic human decision time
      await moveMouseAndClick(page, caseButton);
      logger.info('Case selection button clicked');
  
      const visaOption = page.locator("text=Visa application (Schengen visa- type 'C')");
      await visaOption.waitFor({ state: 'visible', timeout: 10000 });
      await asyncSleep(1, 3); // Simulate reading options
      await moveMouseAndClick(page, visaOption);
      logger.info('Visa case selected');
  
      const closeButton = page.locator('button.btn-success[data-dismiss="modal"]');
      await closeButton.waitFor({ state: 'visible', timeout: 10000 });
      await asyncSleep(1, 3); // Simulate reading modal before closing
      await moveMouseAndClick(page, closeButton);
      logger.info('Case selection modal closed');
    } catch (error) {
      logger.error('Error in case selection:', error);
      throw error;
    }
  };
const fillForm = async (page: Page, userData: Record<string, string>) => {
  try {
    await typeSlowly(page, 'input#label4', userData.name);
    await asyncSleep(5, 10);

    const birthDateField = page.locator('input#birthDate');
    await birthDateField.scrollIntoViewIfNeeded();
    await birthDateField.focus({ timeout: 10000 });
    await typeSlowly(page, birthDateField, userData.birth_date);
    await asyncSleep(5, 10);

    await typeSlowly(page, 'input#label9', userData.phone);
    await asyncSleep(5, 10);
    await typeSlowly(page, 'input#label10', userData.email);
    await asyncSleep(5, 10);
    await fillRepeatEmailField(page, userData.email);
    await asyncSleep(5, 10);
    await typeSlowly(page, 'input#label1000', userData.passport_number);
    await asyncSleep(5, 10);

    // Checkbox interaction
    const firstCheckbox = page.locator('input#slabel13');
    await firstCheckbox.waitFor({ state: 'visible', timeout: 10000 });
    await moveMouseAndClick(page, firstCheckbox);
    logger.info('First checkbox checked');
    await asyncSleep(1, 3);

    const secondCheckbox = page.locator('input#label13');
    await secondCheckbox.waitFor({ state: 'visible', timeout: 10000 });
    await moveMouseAndClick(page, secondCheckbox);
    logger.info('Second checkbox checked');
    await asyncSleep(1, 3);
  } catch (error) {
    logger.error('Error in form filling:', error);
    throw error;
  }
};

const completeBooking = async (page: Page) => {
  try {
    const goButton = page.locator('text=Перейти к выбору времени');
    await goButton.waitFor({ state: 'visible', timeout: 15000 });
    await asyncSleep(1, 3); // Mimic human reading time
    await moveMouseAndClick(page, goButton);
    logger.info('Go button clicked');
    await asyncSleep(2, 5);

    const okButton = page.locator('button:has-text("Хорошо")');
    await okButton.waitFor({ state: 'visible', timeout: 60000 });
    const alertText = await page.evaluate(() => {
      const alertElement = document.querySelector('.alert') || document.querySelector('#alert') || document.querySelector('[role="alert"]');
      return alertElement ? alertElement.textContent : '';
    });
    let hCaptchaPresent = false;
    if (alertText && alertText.toLowerCase().includes('hcaptcha')) {
      logger.info('hCaptcha detected сука блять');
      hCaptchaPresent = true;
    } else {
      logger.info('No hCaptcha detected');
    }
    await asyncSleep(1, 3); // Simulate reading alert
    await moveMouseAndClick(page, okButton);
    await asyncSleep(2, 5);
    logger.info('Хорошо clicked');

    if (hCaptchaPresent) {
      const solved = await solveCaptcha(page);
      if (!solved) {
        logger.error('Failed to solve hCaptcha');
        throw new Error('Failed to solve hCaptcha');
      } else {
        logger.info('hCaptcha solved');
        await asyncSleep(3, 6); // Random delay to mimic human verification
        await moveMouseAndClick(page, goButton);
        await asyncSleep(2, 5);
        logger.info('Go button clicked after hCaptcha');
        await okButton.waitFor({ state: 'visible', timeout: 60000 });
        await moveMouseAndClick(page, okButton);
        await asyncSleep(2, 5);
        logger.info('Ok button clicked after hCaptcha');
      }
    }

    const mailCaptchaSolution = await mailCaptcha();
    if (mailCaptchaSolution) {
      logger.info('Mail captcha solution obtained');
    } else {
      logger.error('Couldnt solve mail captcha');
      throw new Error("Mail captcha not solved");
    }
    const captchaInput = 'div.form-group.row.mt-3:has(label:has-text("Значение капчи, полученной в электронном письме:")) input.form-control';
    await page.locator(captchaInput).waitFor({ state: 'visible', timeout: 10000 });
    await typeSlowly(page, captchaInput, mailCaptchaSolution); // Type captcha slowly
    await asyncSleep(2, 5);
    await moveMouseAndClick(page, goButton);
    await asyncSleep(2, 5);
    logger.info('hCaptcha and mail captcha handled, proceed to choose appointment');
  } catch (error) {
    logger.error('Error in completing booking:', error);
    throw new Error('Error in CompleteBooking');
  }
};


const chooseAppointment = async (page: Page, desiredDate: string): Promise<boolean> => {
  try {
    const preferredDate = new Date(desiredDate);
    const appointmentBox = page.locator('div.appointments a.box.free').first();

    await appointmentBox.waitFor({ state: 'visible', timeout: 20000 });
    
    const availableDate = new Date(await appointmentBox.locator('time').getAttribute('datetime') || '');
    logger.info(`Comparing available date ${availableDate.toDateString()} with preferred date ${preferredDate.toDateString()}`);

    if (availableDate < preferredDate) {
      await asyncSleep(1, 3); // Simulate thinking time before selecting
      await moveMouseAndClick(page, appointmentBox);
      logger.info('Appointment selected');
    } else {
      logger.warn('No available appointments before the preferred date.');
      throw new Error('No available appointments before the preferred date.');
    }

    const nextToConfirmButton = page.locator('button#nextTo3:has-text("Перейти к подтверждению")');
    await nextToConfirmButton.waitFor({ state: 'visible', timeout: 10000 });
    await asyncSleep(2, 5); // Random delay before clicking
    await moveMouseAndClick(page, nextToConfirmButton);
    await asyncSleep(2, 5); // Random delay after clicking
    logger.info('Moved to confirmation');

    const finishButton = page.locator('button.btn-success:has-text("Завершение бронирования")');
    await finishButton.waitFor({ state: 'visible', timeout: 10000 });
    await asyncSleep(1, 3); // Random delay before final action
    await moveMouseAndClick(page, finishButton);
    await asyncSleep(2, 5); // Random delay after final click

    logger.info('Booking finalized');

    await asyncSleep(4, 7); // Longer random delay to simulate human review
    logger.info('Booking process completed successfully');

    return true;
  } catch (error) {
    logger.error('Error in choosing appointment:', error);
    return false;
  }
};


export async function main(userData: any): Promise<number> {
  console.log('Main function started');
  let success = false;

  while (true) {
    let context: BrowserContext | null = null;
    let page: Page | null = null;

    console.log('Attempting to setup browser');
    try {
      ({ context, page } = await setupBrowser());

      await page.goto(URL, { timeout: PAGE_LOAD_TIMEOUT });

      if (!await isPageLoaded(page)) {
        throw new Error('Page failed to load');
      }

      if (await ipIsBlocked(page)) {
        logger.error('IP is blocked');
        throw new Error('IP is blocked');
      }

      await handleLanguageSelection(page);
      await selectPlace(page);
      await selectCase(page);
      await fillForm(page, userData);
      await completeBooking(page);
      success = await chooseAppointment(page, userData.desired_date);
      if (success) {
        break; 
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error during booking process: ${error.message}`, { stack: error.stack });
      } else {
        logger.error('An unknown error occurred during booking');
      }
    } finally {
      if (context) {
        await context.close();
        logger.info('Browser context closed');
      }
      
      try {
        fs.rmSync(path.join(__dirname, '..', 'temp_profiles'), { recursive: true, force: true });
        logger.info('Temporary profiles directory removed');
      } catch (removeError) {
        if (removeError instanceof Error && 'code' in removeError && removeError.code === 'EBUSY') {
          logger.warn(`Failed to remove temp_profiles due to EBUSY`);
        } else {
          logger.error(`Failed to remove temp_profiles with error: ${(removeError as Error).message}`);
        }
      }

      if (!success) {
        await asyncSleep(1, 2); 
      }
    }
  }

  logger.info('All operations completed');
  return success ? 1 : 0;
}

main(JSON.parse(process.argv[2] || '{}')).then(code => {
  process.exit(code);
}).catch(error => {
  logger.error('Uncaught error in main function:', error);
  process.exit(0);
});
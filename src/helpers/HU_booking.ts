import { Page, BrowserContext, Locator } from 'playwright';
import { chromium } from 'playwright-extra';
import path from 'path';
import fs from 'fs'
import os from 'os'
import axios from 'axios';
import { solveCaptcha } from './captchaSolver';
import { moveMouseAndClick, clickAndType} from './helperFunctions';
import { mailCaptcha } from './mail_captcha_wrapper';

const logger = console; // Можно заменить на winston или другой логгер

// Constants
const URL = "https://konzinfoidopont.mfa.gov.hu/";
const userDataDir = path.resolve(__dirname, '../temp_profiles');
const API_KEY = 'e066b705818762de339227e440dca0cd';

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
    '185.46.84.234:3094']

// Helper Functions
const ipIsBlocked = async (page: Page): Promise<boolean> => {
    const blockedMessage =
        "Az IP cím letiltásra került, ezért a weboldal nem elérhető. Javasoljuk, hogy másik internetkapcsolattal próбáljon foglalni (pl. wifi helyett mobilinternettel).";
    const count = await page.locator(`*:has-text("${blockedMessage}")`).count();
    return count > 0;
};

function generateRandomUserAgent(): string {
    const browsers: Record<'Chrome', string[]> = {
      Chrome: Array.from({ length: 26 }, (_, i) => (85 + i).toString()),
    };
  
    const osList = [
      'Windows NT 10.0; Win64; x64',
      'Windows NT 6.1; Win64; x64',
      'Macintosh; Intel Mac OS X 10_15_7',
      'X11; Linux x86_64',
      'X11; Ubuntu; Linux x86_64',
    ];
  
    const browser = 'Chrome';
    const browserVersion = browsers[browser][Math.floor(Math.random() * browsers[browser].length)];
    const osVersion = osList[Math.floor(Math.random() * osList.length)];
  
    return `Mozilla/5.0 (${osVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${browserVersion}.0.0.0 Safari/537.36`;
  }
  
async function setupBrowser(): Promise<{ context: BrowserContext; page: Page }> {
    const userAgent = generateRandomUserAgent();
  
    const proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
    const proxyConfig = {
      server: `http://${proxy}`,
      username: 'PPR16XH2CBU',
      password: 'b8e2JAXTcGtC1x',
    };
    
    const launchOptions = {
      headless: false,
      proxy: proxyConfig,
      args: [`--user-agent=${userAgent}`],
    };
  
    try {
      const context = await chromium.launchPersistentContext(userDataDir, launchOptions);
      const page = await context.newPage();
      return { context, page };
    } catch (error) {
      const err = error as Error;
      logger.error(`Failed to setup browser with proxy ${proxy}: ${err.message}`);
      throw error;
    }
  }

// Booking Functions
const handleLanguageSelection = async (page: Page) => {
    await page.waitForSelector('#langSelector', { timeout: 10000 });
    const langSelector = page.locator('#langSelector');
    await moveMouseAndClick(page, langSelector);

    await page.waitForSelector('text=Русский', { timeout: 20000 });
    const russianOption = page.locator('text=Русский');
    await moveMouseAndClick(page, russianOption);
};

const selectPlace = async (page: Page) => {
    const placeButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modal2"]');
    await placeButton.scrollIntoViewIfNeeded();
    await moveMouseAndClick(page, placeButton);

    const searchInput = page.locator('input[placeholder="Поиск"]');
    await clickAndType(page, searchInput, "Almati");

    const almatiOption = page.locator('text=Казахстан - Almati');
    await moveMouseAndClick(page, almatiOption);
};

const selectCase = async (page: Page) => {
    const caseButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modalCases"]');
    await moveMouseAndClick(page, caseButton);

    const visaOption = page.locator("text=Visa application (Schengen visa- type 'C')");
    await moveMouseAndClick(page, visaOption);

    const closeButton = page.locator('button.btn-success[data-dismiss="modal"]');
    await moveMouseAndClick(page, closeButton);
};

const fillForm = async (page: Page, userData: Record<string, string>) => {
    const fillField = async (selector: string, text: string) => {
        const field = page.locator(selector);
        await clickAndType(page, field, text);
    };

    await fillField('input#label4', userData.name);
    await fillField('input#birthDate', userData.birth_date);
    await fillField('input#label9', userData.phone);
    await fillField('input#label10', userData.email);

    const repeatEmailLabel = await page.locator('label:has-text("Повторить адрес электронной почты")').first();
    const repeatEmailInput = `input#${await repeatEmailLabel.getAttribute('for')}`;
    await fillField(repeatEmailInput, userData.email);

    await fillField('input#label1000', userData.passport_number);

    const firstCheckbox = page.locator('input#slabel13');
    await moveMouseAndClick(page, firstCheckbox);
    const secondCheckbox = page.locator('input#label13');
    await moveMouseAndClick(page, secondCheckbox);
};

const completeBooking = async (page: Page) => {
    const goButton = page.locator('text=Перейти к выбору времени');
    await moveMouseAndClick(page, goButton);

    const okButton = page.locator('text=Хорошо');

    // Проверяем наличие алерта с упоминанием hCaptcha
    const alertText = await page.evaluate(() => {
        // В реальном мире, alert может быть представлен различными способами, 
        // здесь предполагается, что это текст внутри элемента с классом или id, связанным с алертами
        const alertElement = document.querySelector('.alert') || document.querySelector('#alert') || document.querySelector('[role="alert"]');
        return alertElement ? alertElement.textContent : '';
    });

    if (alertText && alertText.toLowerCase().includes('hcaptcha')) {
        // Если есть упоминание hCaptcha, решаем капчу
        const solved = await solveCaptcha(URL);
        if (!solved) throw new Error('Captcha not solved');

        // После решения hCaptcha снова нажимаем на goButton и okButton
        await moveMouseAndClick(page, goButton);
        await moveMouseAndClick(page, okButton);

        // Запускаем mailCaptcha
        const mailCaptchaSolution = await mailCaptcha();
        const captchaInput = page.locator('input.form-control[aria-required="true"]');
        await captchaInput.fill(mailCaptchaSolution);

        // Нажимаем goButton после ввода решения
        await moveMouseAndClick(page, goButton);
    } else {
        // Если hCaptcha не упоминается, сразу запускаем mailCaptcha
        await moveMouseAndClick(page, okButton);
        const mailCaptchaSolution = await mailCaptcha();
        const captchaInput = page.locator('input.form-control[aria-required="true"]');
        await captchaInput.fill(mailCaptchaSolution);

        // Нажимаем goButton после ввода решения
        await moveMouseAndClick(page, goButton);
    }
};

const chooseAppointment = async (page: Page, desiredDate: string) => {
    const preferredDate = new Date(desiredDate);
    const appointmentBox = page.locator('div.appointments a.box.free').first();

    const availableDate = new Date(await appointmentBox.locator('time').getAttribute('datetime') || '');
    if (availableDate < preferredDate) {
        await appointmentBox.click();
    } else {
        throw new Error('No available appointments before the preferred date.');
    }

    // Нажимаем на кнопку "Перейти к подтверждению"
    const nextToConfirmButton = page.locator('button#nextTo3:has-text("Перейти к подтверждению")');
    await nextToConfirmButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Нажимаем на кнопку "Завершение бронирования"
    const finishButton = page.locator('button.btn-success:has-text("Завершение бронирования")');
    await finishButton.click();
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Проверяем наличие элемента, подтверждающего успешную регистрацию
    const confirmationElement = page.locator('span[aria-required="true"]');
    if (await confirmationElement.count() > 0) {
        // Получаем номерок подтверждения
        const confirmationNumber = await confirmationElement.textContent();

        // Записываем данные
        const appointmentDetails = await page.locator('li.list-group-item[aria-required="true"]:has-text("Время обслуживания::") b');
        const appointmentDetailsText = await appointmentDetails.allTextContents();
        
        // Формируем строку с данными
        const bookingData = encodeURIComponent(appointmentDetailsText.join(', '));


        // Здесь вы можете отправить сообщение через Telegram бота
        // Предполагается, что URL для отправки сообщения через бота у вас есть
        const telegramBotUrl = `https://api.telegram.org/bot7900145035:AAFdbBhE3mxQqbQfHniE1KOTiXLy4H29dnc/sendMessage?chat_id=511976165&text=${bookingData}`
        const message = `Бронирование подтверждено. Детали: ${bookingData}. Номер подтверждения: ${confirmationNumber}`;

        try {
            await axios.post(telegramBotUrl, {
                text: message
            });
            logger.info('Сообщение успешно отправлено через Telegram бота');
        } catch (error) {
            logger.error('Ошибка при отправке сообщения через Telegram бота:', error);
        }
    } else {
        logger.info('Подтверждение успешной регистрации не найдено на странице.');
    }
};
// Main Function

export async function main(userData: any) {
    const { context, page } = await setupBrowser();
  
    try {
      await page.goto(URL, { timeout: 60000 });
  
      if (await ipIsBlocked(page)) throw new Error('IP is blocked');
  
      await handleLanguageSelection(page);
      await selectPlace(page);
      await selectCase(page);
      await fillForm(page, userData);
      await completeBooking(page);
      await chooseAppointment(page, userData.desired_date);
  
      logger.info('Booking completed successfully.');
      process.exit(0);
    } catch (error: unknown) {
      if (error instanceof Error) {
        logger.error(`Error: ${error.message}`);
      } else {
        logger.error('An unknown error occurred');
      }
      process.exit(1);
    } finally {
      await context.close();
    }
  }



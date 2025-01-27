import { chromium, Browser, BrowserContext, Page } from "playwright";
import axios from "axios";

const API_KEY = "e066b705818762de339227e440dca0cd";
const URL = "https://konzinfoidopont.mfa.gov.hu/";

export async function solveCaptcha(url: string = URL): Promise<boolean> {
  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();
    await page.goto(url);

    // Найти sitekey hCaptcha
    const siteKey = await page.evaluate(() => {
      const captchaElement = document.querySelector(".h-captcha");
      return captchaElement?.getAttribute("data-sitekey") || null;
    });

    if (!siteKey) {
      console.error("Не удалось найти hCaptcha sitekey");
      return false;
    }

    console.log(`Найден sitekey: ${siteKey}`);

    // Отправка запроса на решение капчи
    const response = await axios.post(
      "http://2captcha.com/in.php",
      null,
      {
        params: {
          key: API_KEY,
          method: "hcaptcha",
          sitekey: siteKey,
          pageurl: url,
          json: 1,
        },
      }
    );

    if (response.data.status !== 1) {
      console.error("Ошибка отправки капчи:", response.data);
      return false;
    }

    const requestId = response.data.request;
    console.log(`Отправлено решение капчи, requestId: ${requestId}`);

    // Получение результата решения капчи
    let token: string | null = null;
    while (!token) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // Ждем 5 секунд
      const result = await axios.get("http://2captcha.com/res.php", {
        params: {
          key: API_KEY,
          action: "get",
          id: requestId,
          json: 1,
        },
      });

      if (result.data.status === 1) {
        token = result.data.request;
        console.log("Капча решена, токен получен:", token);
      } else if (result.data.request !== "CAPCHA_NOT_READY") {
        console.error("Ошибка при решении капчи:", result.data);
        return false;
      } else {
        console.log("Ожидаем решения капчи...");
      }
    }

    // Вставка токена в поле ответа hCaptcha
    await page.evaluate((token) => {
      const responseField = document.getElementById("h-captcha-response") as HTMLInputElement;
      if (responseField) {
        responseField.value = token;
      } else {
        console.error("Не найдено поле для вставки токена hCaptcha");
      }
    }, token);

    console.log("Токен вставлен в поле hCaptcha.");

    // Предполагается, что после вставки токена форма отправляется автоматически или нужно кликнуть кнопку
    // await page.click('#submit_button_id'); // Если нужно кликнуть кнопку отправки, раскомментируйте эту строку

    return true;
  } catch (error) {
    console.error("Произошла ошибка при решении капчи:", error);
    return false;
  } finally {
    if (page) await page.close();
    if (context) await context.close();
    if (browser) await browser.close();
  }
}
import { Page } from "playwright";
import axios from "axios";

const API_KEY = "e066b705818762de339227e440dca0cd";

export async function solveCaptcha(page: Page): Promise<boolean> {
  try {
    global.logger.info("Waiting for hCaptcha to load...");
    await page.waitForSelector(".h-captcha", { timeout: 20000 });

    const siteKey = await page.$eval('.h-captcha', el => el.getAttribute('data-sitekey'));

    if (!siteKey) {
      global.logger.error("Failed to find hCaptcha sitekey");
      return false;
    }

    global.logger.info(`hCaptcha sitekey found: ${siteKey}`);

    // Отправка капчи на решение
    const response = await axios.post(
      "http://2captcha.com/in.php",
      null,
      {
        params: {
          key: API_KEY,
          method: "hcaptcha",
          sitekey: siteKey,
          pageurl: page.url(),
          json: 1,
        },
      }
    );

    if (response.data.status !== 1) {
      global.logger.error("Error submitting captcha:", response.data);
      return false;
    }

    const requestId = response.data.request;
    global.logger.info(`Captcha request sent, requestId: ${requestId}`);

    // Ожидание решения капчи
    let token: string | null = null;
    let attempts = 0;
    const maxAttempts = 15;

    while (!token && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 7500));
      attempts++;
      
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
        global.logger.info(`Captcha solved, token received: ${token}`);
      } else if (result.data.request !== "CAPCHA_NOT_READY") {
        global.logger.error("Error while solving captcha:", result.data);
        return false;
      } else {
        global.logger.info(`Waiting for captcha solution, attempt ${attempts}/${maxAttempts}...`);
      }
    }

    if (!token) {
      global.logger.error("Failed to solve captcha after maximum attempts.");
      return false;
    }

    // Вставка токена в скрытое поле hCaptcha
    await page.evaluate((token) => {
      const textArea = document.querySelector('textarea[name="h-captcha-response"]') as HTMLTextAreaElement;
      if (textArea) {
        textArea.value = token;
        textArea.dispatchEvent(new Event('change', { bubbles: true })); // Триггерим событие change
      } else {
        console.error("Could not find the hCaptcha response field");
      }
    }, token);

    global.logger.info("hCaptcha token inserted into the response field.");

    return true;
  } catch (error) {
    global.logger.error("An error occurred while solving captcha:", error);
    return false;
  }
}

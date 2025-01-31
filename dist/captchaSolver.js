"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.solveCaptcha = solveCaptcha;
const axios_1 = __importDefault(require("axios"));
const API_KEY = "e066b705818762de339227e440dca0cd";
function solveCaptcha(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            global.logger.info("Waiting for hCaptcha to load...");
            yield page.waitForSelector(".h-captcha", { timeout: 20000 });
            const siteKey = yield page.$eval('.h-captcha', el => el.getAttribute('data-sitekey'));
            if (!siteKey) {
                global.logger.error("Failed to find hCaptcha sitekey");
                return false;
            }
            global.logger.info(`hCaptcha sitekey found: ${siteKey}`);
            // Отправка капчи на решение
            const response = yield axios_1.default.post("http://2captcha.com/in.php", null, {
                params: {
                    key: API_KEY,
                    method: "hcaptcha",
                    sitekey: siteKey,
                    pageurl: page.url(),
                    json: 1,
                },
            });
            if (response.data.status !== 1) {
                global.logger.error("Error submitting captcha:", response.data);
                return false;
            }
            const requestId = response.data.request;
            global.logger.info(`Captcha request sent, requestId: ${requestId}`);
            // Ожидание решения капчи
            let token = null;
            let attempts = 0;
            const maxAttempts = 15;
            while (!token && attempts < maxAttempts) {
                yield new Promise((resolve) => setTimeout(resolve, 7500));
                attempts++;
                const result = yield axios_1.default.get("http://2captcha.com/res.php", {
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
                }
                else if (result.data.request !== "CAPCHA_NOT_READY") {
                    global.logger.error("Error while solving captcha:", result.data);
                    return false;
                }
                else {
                    global.logger.info(`Waiting for captcha solution, attempt ${attempts}/${maxAttempts}...`);
                }
            }
            if (!token) {
                global.logger.error("Failed to solve captcha after maximum attempts.");
                return false;
            }
            // Вставка токена в скрытое поле hCaptcha
            yield page.evaluate((token) => {
                const textArea = document.querySelector('textarea[name="h-captcha-response"]');
                if (textArea) {
                    textArea.value = token;
                    textArea.dispatchEvent(new Event('change', { bubbles: true })); // Триггерим событие change
                }
                else {
                    console.error("Could not find the hCaptcha response field");
                }
            }, token);
            global.logger.info("hCaptcha token inserted into the response field.");
            return true;
        }
        catch (error) {
            global.logger.error("An error occurred while solving captcha:", error);
            return false;
        }
    });
}

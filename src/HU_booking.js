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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
var playwright_extra_1 = require("playwright-extra");
var stealth = require('puppeteer-extra-plugin-stealth');
var path = require("path");
var winston = require("winston");
var fs = require("fs");
var captchaSolver_1 = require("./captchaSolver");
var helperFunctions_1 = require("./helperFunctions");
var mail_captcha_wrapper_1 = require("./mail_captcha_wrapper");
var commonFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.printf(function (info) {
    var message = Buffer.from(info.message, 'utf-8').toString();
    var stack = info.stack ? Buffer.from(info.stack, 'utf-8').toString() : '';
    return "".concat(info.timestamp, " [").concat(info.level, "]: ").concat(message).concat(stack ? "\n".concat(stack) : '');
}));
var logger = winston.createLogger({
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
var URL = "https://konzinfoidopont.mfa.gov.hu/";
var userDataDir = path.resolve(__dirname, '../temp_profiles');
var API_KEY = 'e066b705818762de339227e440dca0cd';
var MAX_RETRIES = 5;
var RETRY_DELAY_MS = 5000; // 5 seconds
var PAGE_LOAD_TIMEOUT = 60000; // 60 seconds for page loading
global.logger = logger;
var PROXIES = ['146.185.207.3:3081',
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
var ipIsBlocked = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var blockedMessage, count;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                logger.info('Checking if IP is blocked...');
                blockedMessage = "Az IP cím letiltásra került, ezért a weboldal nem elérhető. Javasoljuk, hogy másik internetkapcsolattal próbáljon foglalni (pl. wifi helyett mobilinternettel).";
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 3)];
            case 1:
                _a.sent(); // Random sleep to mimic human waiting
                return [4 /*yield*/, page.locator("*:has-text(\"".concat(blockedMessage, "\")")).count()];
            case 2:
                count = _a.sent();
                logger.info("IP block check result: ".concat(count > 0 ? 'blocked' : 'not blocked'));
                return [2 /*return*/, count > 0];
        }
    });
}); };
function generateRandomUserAgent() {
    var browsers = {
        Chrome: Array.from({ length: 26 }, function (_, i) { return (85 + i).toString(); }),
    };
    var osList = [
        'Windows NT 10.0; Win64; x64',
        'Macintosh; Intel Mac OS X 10_15_7',
        'X11; Linux x86_64',
    ];
    var browserVersion = browsers.Chrome[Math.floor(Math.random() * browsers.Chrome.length)];
    var osVersion = osList[Math.floor(Math.random() * osList.length)];
    return "Mozilla/5.0 (".concat(osVersion, ") AppleWebKit/537.36 (KHTML, like Gecko) Chrome/").concat(browserVersion, ".0.0.0 Safari/537.36");
}
function isPageLoaded(page) {
    return __awaiter(this, void 0, void 0, function () {
        var response, hasErrorClass, errorText, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, page.waitForSelector('body', { timeout: 5000 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.waitForResponse(function (res) { return res.status() >= 400; }, { timeout: 5000 }).catch(function () { return null; })];
                case 2:
                    response = _a.sent();
                    if (response) {
                        console.error("\u041E\u0448\u0438\u0431\u043A\u0430 HTTP: ".concat(response.status()));
                        return [2 /*return*/, false];
                    }
                    if (page.url().includes('chrome-error') || page.url().includes('about:blank')) {
                        console.error('Обнаружена страница ошибки браузера');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, page.$('body.neterror')];
                case 3:
                    hasErrorClass = (_a.sent()) !== null;
                    if (hasErrorClass) {
                        console.error('Обнаружена страница с классом neterror');
                        return [2 /*return*/, false];
                    }
                    return [4 /*yield*/, page.textContent('body').catch(function () { return ''; })];
                case 4:
                    errorText = _a.sent();
                    if (errorText && errorText.includes('Не удается получить доступ к сайту')) {
                        console.error('Страница содержит текст ошибки ERR_TIMED_OUT');
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/, true];
                case 5:
                    error_1 = _a.sent();
                    console.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u043F\u0440\u0438 \u043F\u0440\u043E\u0432\u0435\u0440\u043A\u0435 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B: ".concat(error_1));
                    return [2 /*return*/, false];
                case 6: return [2 /*return*/];
            }
        });
    });
}
function setupBrowser() {
    return __awaiter(this, void 0, void 0, function () {
        var userAgent, proxy, proxyConfig, randomHeaders, launchOptions, context, page, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    playwright_extra_1.chromium.use(stealth());
                    userAgent = generateRandomUserAgent();
                    proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
                    proxyConfig = {
                        server: "http://".concat(proxy),
                        username: 'PPR16XH2CBU',
                        password: 'b8e2JAXTcGtC1x',
                    };
                    randomHeaders = {
                        "Accept-Language": Math.random() > 0.5 ? "en-US,en;q=0.9" : "ru-RU,ru;q=0.9",
                        "DNT": Math.random() > 0.5 ? "1" : "0",
                        "Upgrade-Insecure-Requests": "1",
                        "Sec-Fetch-Site": "same-origin",
                        "Sec-Fetch-Mode": "navigate",
                        "Sec-Fetch-Dest": "document"
                    };
                    launchOptions = {
                        headless: false,
                        proxy: proxyConfig,
                        args: ["--user-agent=".concat(userAgent)],
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, playwright_extra_1.chromium.launchPersistentContext(userDataDir, launchOptions)];
                case 2:
                    context = _a.sent();
                    return [4 /*yield*/, context.newPage()];
                case 3:
                    page = _a.sent();
                    // Устанавливаем случайные заголовки
                    return [4 /*yield*/, page.setExtraHTTPHeaders(randomHeaders)];
                case 4:
                    // Устанавливаем случайные заголовки
                    _a.sent();
                    return [4 /*yield*/, (0, helperFunctions_1.randomMouseMove)(page)];
                case 5:
                    _a.sent(); // Симуляция случайного движения мыши
                    logger.info('Browser setup successful');
                    return [2 /*return*/, { context: context, page: page }];
                case 6:
                    error_2 = _a.sent();
                    logger.error('Error setting up browser:', error_2);
                    throw error_2;
                case 7: return [2 /*return*/];
            }
        });
    });
}
// Main Functions
var handleLanguageSelection = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var langSelector, russianOption, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, page.waitForSelector('#langSelector', { timeout: 15000 })];
            case 1:
                _a.sent();
                langSelector = page.locator('#langSelector');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, langSelector)];
            case 2:
                _a.sent();
                logger.info('Language selector found and clicked');
                return [4 /*yield*/, page.waitForSelector('text=Русский', { timeout: 25000 })];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 4:
                _a.sent(); // Random sleep to mimic human behavior
                russianOption = page.locator('text=Русский');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, russianOption)];
            case 5:
                _a.sent();
                logger.info('Russian language selected');
                return [3 /*break*/, 7];
            case 6:
                error_3 = _a.sent();
                logger.error('Error in language selection:', error_3);
                throw error_3;
            case 7: return [2 /*return*/];
        }
    });
}); };
var selectPlace = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var placeButton, searchInput, almatiOption, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 8, , 9]);
                placeButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modal2"]');
                return [4 /*yield*/, placeButton.waitFor({ state: 'visible', timeout: 15000 })];
            case 1:
                _a.sent();
                return [4 /*yield*/, placeButton.scrollIntoViewIfNeeded()];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, placeButton)];
            case 3:
                _a.sent();
                logger.info('Place selection button clicked');
                searchInput = page.locator('input[placeholder="Поиск"]').first();
                return [4 /*yield*/, searchInput.waitFor({ state: 'visible', timeout: 10000 })];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.typeSlowly)(page, searchInput, "Almati")];
            case 5:
                _a.sent(); // Use slower typing
                logger.info('Search input filled with "Almati"');
                almatiOption = page.locator('text=Казахстан - Almati');
                return [4 /*yield*/, almatiOption.waitFor({ state: 'visible', timeout: 10000 })];
            case 6:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, almatiOption)];
            case 7:
                _a.sent();
                logger.info('Almati selected');
                return [3 /*break*/, 9];
            case 8:
                error_4 = _a.sent();
                logger.error('Error in place selection:', error_4);
                throw error_4;
            case 9: return [2 /*return*/];
        }
    });
}); };
var selectCase = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var caseButton, visaOption, closeButton, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 10, , 11]);
                caseButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modalCases"]');
                return [4 /*yield*/, caseButton.waitFor({ state: 'visible', timeout: 15000 })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 2:
                _a.sent(); // Mimic human decision time
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, caseButton)];
            case 3:
                _a.sent();
                logger.info('Case selection button clicked');
                visaOption = page.locator("text=Visa application (Schengen visa- type 'C')");
                return [4 /*yield*/, visaOption.waitFor({ state: 'visible', timeout: 10000 })];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 5:
                _a.sent(); // Simulate reading options
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, visaOption)];
            case 6:
                _a.sent();
                logger.info('Visa case selected');
                closeButton = page.locator('button.btn-success[data-dismiss="modal"]');
                return [4 /*yield*/, closeButton.waitFor({ state: 'visible', timeout: 10000 })];
            case 7:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 8:
                _a.sent(); // Simulate reading modal before closing
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, closeButton)];
            case 9:
                _a.sent();
                logger.info('Case selection modal closed');
                return [3 /*break*/, 11];
            case 10:
                error_5 = _a.sent();
                logger.error('Error in case selection:', error_5);
                throw error_5;
            case 11: return [2 /*return*/];
        }
    });
}); };
var fillForm = function (page, userData) { return __awaiter(void 0, void 0, void 0, function () {
    var birthDateField, firstCheckbox, secondCheckbox, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 21, , 22]);
                return [4 /*yield*/, (0, helperFunctions_1.typeSlowly)(page, 'input#label4', userData.name)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(5, 10)];
            case 2:
                _a.sent();
                birthDateField = page.locator('input#birthDate');
                return [4 /*yield*/, birthDateField.scrollIntoViewIfNeeded()];
            case 3:
                _a.sent();
                return [4 /*yield*/, birthDateField.focus({ timeout: 10000 })];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.typeSlowly)(page, birthDateField, userData.birth_date)];
            case 5:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(5, 10)];
            case 6:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.typeSlowly)(page, 'input#label9', userData.phone)];
            case 7:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(5, 10)];
            case 8:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.typeSlowly)(page, 'input#label10', userData.email)];
            case 9:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(5, 10)];
            case 10:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.fillRepeatEmailField)(page, userData.email)];
            case 11:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(5, 10)];
            case 12:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.typeSlowly)(page, 'input#label1000', userData.passport_number)];
            case 13:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(5, 10)];
            case 14:
                _a.sent();
                firstCheckbox = page.locator('input#slabel13');
                return [4 /*yield*/, firstCheckbox.waitFor({ state: 'visible', timeout: 10000 })];
            case 15:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, firstCheckbox)];
            case 16:
                _a.sent();
                logger.info('First checkbox checked');
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 17:
                _a.sent();
                secondCheckbox = page.locator('input#label13');
                return [4 /*yield*/, secondCheckbox.waitFor({ state: 'visible', timeout: 10000 })];
            case 18:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, secondCheckbox)];
            case 19:
                _a.sent();
                logger.info('Second checkbox checked');
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 20:
                _a.sent();
                return [3 /*break*/, 22];
            case 21:
                error_6 = _a.sent();
                logger.error('Error in form filling:', error_6);
                throw error_6;
            case 22: return [2 /*return*/];
        }
    });
}); };
var completeBooking = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var goButton, okButton, alertText, hCaptchaPresent, solved, mailCaptchaSolution, captchaInput, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 25, , 26]);
                goButton = page.locator('text=Перейти к выбору времени');
                return [4 /*yield*/, goButton.waitFor({ state: 'visible', timeout: 15000 })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 2:
                _a.sent(); // Mimic human reading time
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, goButton)];
            case 3:
                _a.sent();
                logger.info('Go button clicked');
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 4:
                _a.sent();
                okButton = page.locator('button:has-text("Хорошо")');
                return [4 /*yield*/, okButton.waitFor({ state: 'visible', timeout: 60000 })];
            case 5:
                _a.sent();
                return [4 /*yield*/, page.evaluate(function () {
                        var alertElement = document.querySelector('.alert') || document.querySelector('#alert') || document.querySelector('[role="alert"]');
                        return alertElement ? alertElement.textContent : '';
                    })];
            case 6:
                alertText = _a.sent();
                hCaptchaPresent = false;
                if (alertText && alertText.toLowerCase().includes('hcaptcha')) {
                    logger.info('hCaptcha detected сука блять');
                    hCaptchaPresent = true;
                }
                else {
                    logger.info('No hCaptcha detected');
                }
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 7:
                _a.sent(); // Simulate reading alert
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, okButton)];
            case 8:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 9:
                _a.sent();
                logger.info('Хорошо clicked');
                if (!hCaptchaPresent) return [3 /*break*/, 18];
                return [4 /*yield*/, (0, captchaSolver_1.solveCaptcha)(page)];
            case 10:
                solved = _a.sent();
                if (!!solved) return [3 /*break*/, 11];
                logger.error('Failed to solve hCaptcha');
                throw new Error('Failed to solve hCaptcha');
            case 11:
                logger.info('hCaptcha solved');
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(3, 6)];
            case 12:
                _a.sent(); // Random delay to mimic human verification
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, goButton)];
            case 13:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 14:
                _a.sent();
                logger.info('Go button clicked after hCaptcha');
                return [4 /*yield*/, okButton.waitFor({ state: 'visible', timeout: 60000 })];
            case 15:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, okButton)];
            case 16:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 17:
                _a.sent();
                logger.info('Ok button clicked after hCaptcha');
                _a.label = 18;
            case 18: return [4 /*yield*/, (0, mail_captcha_wrapper_1.mailCaptcha)()];
            case 19:
                mailCaptchaSolution = _a.sent();
                if (mailCaptchaSolution) {
                    logger.info('Mail captcha solution obtained');
                }
                else {
                    logger.error('Couldnt solve mail captcha');
                    throw new Error("Mail captcha not solved");
                }
                captchaInput = 'div.form-group.row.mt-3:has(label:has-text("Значение капчи, полученной в электронном письме:")) input.form-control';
                return [4 /*yield*/, page.locator(captchaInput).waitFor({ state: 'visible', timeout: 10000 })];
            case 20:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.typeSlowly)(page, captchaInput, mailCaptchaSolution)];
            case 21:
                _a.sent(); // Type captcha slowly
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 22:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, goButton)];
            case 23:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 24:
                _a.sent();
                logger.info('hCaptcha and mail captcha handled, proceed to choose appointment');
                return [3 /*break*/, 26];
            case 25:
                error_7 = _a.sent();
                logger.error('Error in completing booking:', error_7);
                throw new Error('Error in CompleteBooking');
            case 26: return [2 /*return*/];
        }
    });
}); };
var chooseAppointment = function (page, desiredDate) { return __awaiter(void 0, void 0, void 0, function () {
    var preferredDate, appointmentBox, availableDate, _a, nextToConfirmButton, finishButton, error_8;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 16, , 17]);
                preferredDate = new Date(desiredDate);
                appointmentBox = page.locator('div.appointments a.box.free').first();
                return [4 /*yield*/, appointmentBox.waitFor({ state: 'visible', timeout: 20000 })];
            case 1:
                _b.sent();
                _a = Date.bind;
                return [4 /*yield*/, appointmentBox.locator('time').getAttribute('datetime')];
            case 2:
                availableDate = new (_a.apply(Date, [void 0, (_b.sent()) || '']))();
                logger.info("Comparing available date ".concat(availableDate.toDateString(), " with preferred date ").concat(preferredDate.toDateString()));
                if (!(availableDate < preferredDate)) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 3:
                _b.sent(); // Simulate thinking time before selecting
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, appointmentBox)];
            case 4:
                _b.sent();
                logger.info('Appointment selected');
                return [3 /*break*/, 6];
            case 5:
                logger.warn('No available appointments before the preferred date.');
                throw new Error('No available appointments before the preferred date.');
            case 6:
                nextToConfirmButton = page.locator('button#nextTo3:has-text("Перейти к подтверждению")');
                return [4 /*yield*/, nextToConfirmButton.waitFor({ state: 'visible', timeout: 10000 })];
            case 7:
                _b.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 8:
                _b.sent(); // Random delay before clicking
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, nextToConfirmButton)];
            case 9:
                _b.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 10:
                _b.sent(); // Random delay after clicking
                logger.info('Moved to confirmation');
                finishButton = page.locator('button.btn-success:has-text("Завершение бронирования")');
                return [4 /*yield*/, finishButton.waitFor({ state: 'visible', timeout: 10000 })];
            case 11:
                _b.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 3)];
            case 12:
                _b.sent(); // Random delay before final action
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, finishButton)];
            case 13:
                _b.sent();
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(2, 5)];
            case 14:
                _b.sent(); // Random delay after final click
                logger.info('Booking finalized');
                return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(4, 7)];
            case 15:
                _b.sent(); // Longer random delay to simulate human review
                logger.info('Booking process completed successfully');
                return [2 /*return*/, true];
            case 16:
                error_8 = _b.sent();
                logger.error('Error in choosing appointment:', error_8);
                return [2 /*return*/, false];
            case 17: return [2 /*return*/];
        }
    });
}); };
function main(userData) {
    return __awaiter(this, void 0, void 0, function () {
        var success, context, page, error_9;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('Main function started');
                    success = false;
                    _b.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 20];
                    context = null;
                    page = null;
                    console.log('Attempting to setup browser');
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 13, 14, 19]);
                    return [4 /*yield*/, setupBrowser()];
                case 3:
                    (_a = _b.sent(), context = _a.context, page = _a.page);
                    return [4 /*yield*/, page.goto(URL, { timeout: PAGE_LOAD_TIMEOUT })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, isPageLoaded(page)];
                case 5:
                    if (!(_b.sent())) {
                        throw new Error('Page failed to load');
                    }
                    return [4 /*yield*/, ipIsBlocked(page)];
                case 6:
                    if (_b.sent()) {
                        logger.error('IP is blocked');
                        throw new Error('IP is blocked');
                    }
                    return [4 /*yield*/, handleLanguageSelection(page)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, selectPlace(page)];
                case 8:
                    _b.sent();
                    return [4 /*yield*/, selectCase(page)];
                case 9:
                    _b.sent();
                    return [4 /*yield*/, fillForm(page, userData)];
                case 10:
                    _b.sent();
                    return [4 /*yield*/, completeBooking(page)];
                case 11:
                    _b.sent();
                    return [4 /*yield*/, chooseAppointment(page, userData.desired_date)];
                case 12:
                    success = _b.sent();
                    if (success) {
                        return [3 /*break*/, 20];
                    }
                    return [3 /*break*/, 19];
                case 13:
                    error_9 = _b.sent();
                    if (error_9 instanceof Error) {
                        logger.error("Error during booking process: ".concat(error_9.message), { stack: error_9.stack });
                    }
                    else {
                        logger.error('An unknown error occurred during booking');
                    }
                    return [3 /*break*/, 19];
                case 14:
                    if (!context) return [3 /*break*/, 16];
                    return [4 /*yield*/, context.close()];
                case 15:
                    _b.sent();
                    logger.info('Browser context closed');
                    _b.label = 16;
                case 16:
                    try {
                        fs.rmSync(path.join(__dirname, '..', 'temp_profiles'), { recursive: true, force: true });
                        logger.info('Temporary profiles directory removed');
                    }
                    catch (removeError) {
                        if (removeError instanceof Error && 'code' in removeError && removeError.code === 'EBUSY') {
                            logger.warn("Failed to remove temp_profiles due to EBUSY");
                        }
                        else {
                            logger.error("Failed to remove temp_profiles with error: ".concat(removeError.message));
                        }
                    }
                    if (!!success) return [3 /*break*/, 18];
                    return [4 /*yield*/, (0, helperFunctions_1.asyncSleep)(1, 2)];
                case 17:
                    _b.sent();
                    _b.label = 18;
                case 18: return [7 /*endfinally*/];
                case 19: return [3 /*break*/, 1];
                case 20:
                    logger.info('All operations completed');
                    return [2 /*return*/, success ? 1 : 0];
            }
        });
    });
}
main(JSON.parse(process.argv[2] || '{}')).then(function (code) {
    process.exit(code);
}).catch(function (error) {
    logger.error('Uncaught error in main function:', error);
    process.exit(0);
});

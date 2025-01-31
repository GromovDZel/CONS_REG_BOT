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
var path = require("path");
var winston = require("winston");
var captchaSolver_1 = require("./captchaSolver");
var helperFunctions_1 = require("./helperFunctions");
var mail_captcha_wrapper_1 = require("./mail_captcha_wrapper");
var logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston.format.errors({ stack: true }), winston.format.splat(), winston.format.printf(function (info) {
        var message = Buffer.from(info.message, 'utf-8').toString();
        var stack = info.stack ? Buffer.from(info.stack, 'utf-8').toString() : '';
        return "".concat(info.timestamp, " [").concat(info.level, "]: ").concat(message).concat(stack ? "\n".concat(stack) : '');
    })),
    transports: [
        new winston.transports.Console({
            handleExceptions: true,
            format: winston.format.simple()
        }),
        new winston.transports.File({
            filename: 'error.log',
            level: 'error',
            options: { encoding: 'utf-8' }
        }),
        new winston.transports.File({
            filename: 'combined.log',
            options: { encoding: 'utf-8' }
        })
    ],
    exitOnError: false
});
module.exports = logger;
// Constants
var URL = "https://konzinfoidopont.mfa.gov.hu/";
var userDataDir = path.resolve(__dirname, '../temp_profiles');
var API_KEY = 'e066b705818762de339227e440dca0cd';
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
                return [4 /*yield*/, page.locator("*:has-text(\"".concat(blockedMessage, "\")")).count()];
            case 1:
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
function setupBrowser() {
    return __awaiter(this, void 0, void 0, function () {
        var userAgent, proxy, proxyConfig, launchOptions, context, page, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userAgent = generateRandomUserAgent();
                    proxy = PROXIES[Math.floor(Math.random() * PROXIES.length)];
                    proxyConfig = {
                        server: "http://".concat(proxy),
                        username: 'PPR16XH2CBU',
                        password: 'b8e2JAXTcGtC1x',
                    };
                    launchOptions = {
                        headless: false,
                        proxy: proxyConfig,
                        args: ["--user-agent=".concat(userAgent)],
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, playwright_extra_1.chromium.launchPersistentContext(userDataDir, launchOptions)];
                case 2:
                    context = _a.sent();
                    return [4 /*yield*/, context.newPage()];
                case 3:
                    page = _a.sent();
                    logger.info('Browser setup successful');
                    return [2 /*return*/, { context: context, page: page }];
                case 4:
                    error_1 = _a.sent();
                    logger.error('Error setting up browser:', error_1);
                    throw error_1;
                case 5: return [2 /*return*/];
            }
        });
    });
}
var handleLanguageSelection = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var langSelector, russianOption, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, page.waitForSelector('#langSelector', { timeout: 10000 })];
            case 1:
                _a.sent();
                langSelector = page.locator('#langSelector');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, langSelector)];
            case 2:
                _a.sent();
                logger.info('Language selector found and clicked');
                return [4 /*yield*/, page.waitForSelector('text=Русский', { timeout: 20000 })];
            case 3:
                _a.sent();
                russianOption = page.locator('text=Русский');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, russianOption)];
            case 4:
                _a.sent();
                logger.info('Russian language selected');
                return [3 /*break*/, 6];
            case 5:
                error_2 = _a.sent();
                logger.error('Error in language selection:', error_2);
                throw error_2;
            case 6: return [2 /*return*/];
        }
    });
}); };
var selectPlace = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var placeButton, searchInput, almatiOption, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                placeButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modal2"]');
                return [4 /*yield*/, placeButton.scrollIntoViewIfNeeded()];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, placeButton)];
            case 2:
                _a.sent();
                logger.info('Place selection button clicked');
                searchInput = page.locator('input[placeholder="Поиск"]');
                return [4 /*yield*/, (0, helperFunctions_1.clickAndType)(page, searchInput, "Almati")];
            case 3:
                _a.sent();
                logger.info('Search input filled with "Almati"');
                almatiOption = page.locator('text=Казахстан - Almati');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, almatiOption)];
            case 4:
                _a.sent();
                logger.info('Almati selected');
                return [3 /*break*/, 6];
            case 5:
                error_3 = _a.sent();
                logger.error('Error in place selection:', error_3);
                throw error_3;
            case 6: return [2 /*return*/];
        }
    });
}); };
var selectCase = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var caseButton, visaOption, closeButton, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                caseButton = page.locator('button.btn-primary.dropdown-toggle[data-target="#modalCases"]');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, caseButton)];
            case 1:
                _a.sent();
                logger.info('Case selection button clicked');
                visaOption = page.locator("text=Visa application (Schengen visa- type 'C')");
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, visaOption)];
            case 2:
                _a.sent();
                logger.info('Visa case selected');
                closeButton = page.locator('button.btn-success[data-dismiss="modal"]');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, closeButton)];
            case 3:
                _a.sent();
                logger.info('Case selection modal closed');
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                logger.error('Error in case selection:', error_4);
                throw error_4;
            case 5: return [2 /*return*/];
        }
    });
}); };
var fillForm = function (page, userData) { return __awaiter(void 0, void 0, void 0, function () {
    var fillField, repeatEmailLabel, repeatEmailInput, _a, firstCheckbox, secondCheckbox, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                fillField = function (selector, text) { return __awaiter(void 0, void 0, void 0, function () {
                    var field;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                field = page.locator(selector);
                                return [4 /*yield*/, (0, helperFunctions_1.clickAndType)(page, field, text)];
                            case 1:
                                _a.sent();
                                logger.info("Field ".concat(selector, " filled with: ").concat(text));
                                return [2 /*return*/];
                        }
                    });
                }); };
                _b.label = 1;
            case 1:
                _b.trys.push([1, 12, , 13]);
                return [4 /*yield*/, fillField('input#label4', userData.name)];
            case 2:
                _b.sent();
                return [4 /*yield*/, fillField('input#birthDate', userData.birth_date)];
            case 3:
                _b.sent();
                return [4 /*yield*/, fillField('input#label9', userData.phone)];
            case 4:
                _b.sent();
                return [4 /*yield*/, fillField('input#label10', userData.email)];
            case 5:
                _b.sent();
                return [4 /*yield*/, page.locator('label:has-text("Повторить адрес электронной почты")').first()];
            case 6:
                repeatEmailLabel = _b.sent();
                _a = "input#".concat;
                return [4 /*yield*/, repeatEmailLabel.getAttribute('for')];
            case 7:
                repeatEmailInput = _a.apply("input#", [_b.sent()]);
                return [4 /*yield*/, fillField(repeatEmailInput, userData.email)];
            case 8:
                _b.sent();
                return [4 /*yield*/, fillField('input#label1000', userData.passport_number)];
            case 9:
                _b.sent();
                firstCheckbox = page.locator('input#slabel13');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, firstCheckbox)];
            case 10:
                _b.sent();
                logger.info('First checkbox checked');
                secondCheckbox = page.locator('input#label13');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, secondCheckbox)];
            case 11:
                _b.sent();
                logger.info('Second checkbox checked');
                return [3 /*break*/, 13];
            case 12:
                error_5 = _b.sent();
                logger.error('Error in form filling:', error_5);
                throw error_5;
            case 13: return [2 /*return*/];
        }
    });
}); };
var completeBooking = function (page) { return __awaiter(void 0, void 0, void 0, function () {
    var goButton, okButton, alertText, solved, mailCaptchaSolution, captchaInput, mailCaptchaSolution, captchaInput, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 15, , 16]);
                goButton = page.locator('text=Перейти к выбору времени');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, goButton)];
            case 1:
                _a.sent();
                logger.info('Go button clicked');
                okButton = page.locator('text=Хорошо');
                return [4 /*yield*/, page.evaluate(function () {
                        var alertElement = document.querySelector('.alert') || document.querySelector('#alert') || document.querySelector('[role="alert"]');
                        return alertElement ? alertElement.textContent : '';
                    })];
            case 2:
                alertText = _a.sent();
                if (!(alertText && alertText.toLowerCase().includes('hcaptcha'))) return [3 /*break*/, 9];
                logger.info('hCaptcha detected');
                return [4 /*yield*/, (0, captchaSolver_1.solveCaptcha)(URL)];
            case 3:
                solved = _a.sent();
                if (!solved) {
                    logger.error('Failed to solve Captcha');
                    throw new Error('Captcha not solved');
                }
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, goButton)];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, okButton)];
            case 5:
                _a.sent();
                return [4 /*yield*/, (0, mail_captcha_wrapper_1.mailCaptcha)()];
            case 6:
                mailCaptchaSolution = _a.sent();
                logger.info('Mail captcha solution obtained');
                captchaInput = page.locator('input.form-control[aria-required="true"]');
                return [4 /*yield*/, captchaInput.fill(mailCaptchaSolution)];
            case 7:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, goButton)];
            case 8:
                _a.sent();
                logger.info('hCaptcha and mail captcha handled');
                return [3 /*break*/, 14];
            case 9:
                logger.info('No hCaptcha detected');
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, okButton)];
            case 10:
                _a.sent();
                return [4 /*yield*/, (0, mail_captcha_wrapper_1.mailCaptcha)()];
            case 11:
                mailCaptchaSolution = _a.sent();
                logger.info('Mail captcha solution obtained');
                captchaInput = page.locator('input.form-control[aria-required="true"]');
                return [4 /*yield*/, captchaInput.fill(mailCaptchaSolution)];
            case 12:
                _a.sent();
                return [4 /*yield*/, (0, helperFunctions_1.moveMouseAndClick)(page, goButton)];
            case 13:
                _a.sent();
                logger.info('Mail captcha handled');
                _a.label = 14;
            case 14: return [3 /*break*/, 16];
            case 15:
                error_6 = _a.sent();
                logger.error('Error in completing booking:', error_6);
                throw error_6;
            case 16: return [2 /*return*/];
        }
    });
}); };
var chooseAppointment = function (page, desiredDate) { return __awaiter(void 0, void 0, void 0, function () {
    var preferredDate, appointmentBox, availableDate, _a, nextToConfirmButton, finishButton, error_7;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 10, , 11]);
                preferredDate = new Date(desiredDate);
                appointmentBox = page.locator('div.appointments a.box.free').first();
                _a = Date.bind;
                return [4 /*yield*/, appointmentBox.locator('time').getAttribute('datetime')];
            case 1:
                availableDate = new (_a.apply(Date, [void 0, (_b.sent()) || '']))();
                logger.info("Comparing available date ".concat(availableDate.toDateString(), " with preferred date ").concat(preferredDate.toDateString()));
                if (!(availableDate < preferredDate)) return [3 /*break*/, 3];
                return [4 /*yield*/, appointmentBox.click()];
            case 2:
                _b.sent();
                logger.info('Appointment selected');
                return [3 /*break*/, 4];
            case 3:
                logger.warn('No available appointments before the preferred date.');
                throw new Error('No available appointments before the preferred date.');
            case 4:
                nextToConfirmButton = page.locator('button#nextTo3:has-text("Перейти к подтверждению")');
                return [4 /*yield*/, nextToConfirmButton.click()];
            case 5:
                _b.sent();
                return [4 /*yield*/, page.waitForNavigation({ waitUntil: 'networkidle' })];
            case 6:
                _b.sent();
                logger.info('Moved to confirmation');
                finishButton = page.locator('button.btn-success:has-text("Завершение бронирования")');
                return [4 /*yield*/, finishButton.click()];
            case 7:
                _b.sent();
                return [4 /*yield*/, page.waitForNavigation({ waitUntil: 'networkidle' })];
            case 8:
                _b.sent();
                logger.info('Booking finalized');
                // Задержка для отладки
                return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
            case 9:
                // Задержка для отладки
                _b.sent(); // Подождать 5 секунд
                logger.info('Booking process completed successfully');
                return [3 /*break*/, 11];
            case 10:
                error_7 = _b.sent();
                logger.error('Error in choosing appointment:', error_7);
                throw error_7;
            case 11: return [2 /*return*/];
        }
    });
}); };
function main(userData) {
    return __awaiter(this, void 0, void 0, function () {
        var success, _a, context, page, error_8, error_9;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    success = false;
                    _b.label = 1;
                case 1:
                    if (!!success) return [3 /*break*/, 22];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 20, , 21]);
                    return [4 /*yield*/, setupBrowser()];
                case 3:
                    _a = _b.sent(), context = _a.context, page = _a.page;
                    _b.label = 4;
                case 4:
                    _b.trys.push([4, 13, 17, 19]);
                    return [4 /*yield*/, page.goto(URL, { timeout: 60000 })];
                case 5:
                    _b.sent();
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
                    _b.sent();
                    success = true;
                    return [3 /*break*/, 19];
                case 13:
                    error_8 = _b.sent();
                    if (!(error_8 instanceof Error)) return [3 /*break*/, 15];
                    logger.error("Error during booking process: ".concat(error_8.message), { stack: error_8.stack });
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 60000); })];
                case 14:
                    _b.sent(); // Ждем минуту перед повторной попыткой
                    return [3 /*break*/, 16];
                case 15:
                    logger.error('An unknown error occurred during booking');
                    _b.label = 16;
                case 16: return [3 /*break*/, 19];
                case 17: return [4 /*yield*/, context.close()];
                case 18:
                    _b.sent();
                    logger.info('Browser context closed');
                    return [7 /*endfinally*/];
                case 19: return [3 /*break*/, 21];
                case 20:
                    error_9 = _b.sent();
                    logger.error('Error setting up browser or during booking process:', error_9);
                    return [3 /*break*/, 21];
                case 21: return [3 /*break*/, 1];
                case 22:
                    logger.info('All operations completed');
                    process.exit(success ? 0 : 1);
                    return [2 /*return*/];
            }
        });
    });
}

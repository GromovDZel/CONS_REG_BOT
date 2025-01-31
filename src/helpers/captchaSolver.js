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
exports.solveCaptcha = solveCaptcha;
var playwright_1 = require("playwright");
var axios_1 = require("axios");
var API_KEY = "e066b705818762de339227e440dca0cd";
var URL = "https://konzinfoidopont.mfa.gov.hu/";
function solveCaptcha() {
    return __awaiter(this, arguments, void 0, function (url) {
        var browser, context, page, siteKey, response, requestId, token, result, error_1;
        if (url === void 0) { url = URL; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    browser = null;
                    context = null;
                    page = null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 13, 14, 21]);
                    return [4 /*yield*/, playwright_1.chromium.launch({ headless: false })];
                case 2:
                    browser = _a.sent();
                    return [4 /*yield*/, browser.newContext()];
                case 3:
                    context = _a.sent();
                    return [4 /*yield*/, context.newPage()];
                case 4:
                    page = _a.sent();
                    return [4 /*yield*/, page.goto(url)];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, page.evaluate(function () {
                            var captchaElement = document.querySelector(".h-captcha");
                            return (captchaElement === null || captchaElement === void 0 ? void 0 : captchaElement.getAttribute("data-sitekey")) || null;
                        })];
                case 6:
                    siteKey = _a.sent();
                    if (!siteKey) {
                        console.error("Не удалось найти hCaptcha sitekey");
                        return [2 /*return*/, false];
                    }
                    console.log("\u041D\u0430\u0439\u0434\u0435\u043D sitekey: ".concat(siteKey));
                    return [4 /*yield*/, axios_1.default.post("http://2captcha.com/in.php", null, {
                            params: {
                                key: API_KEY,
                                method: "hcaptcha",
                                sitekey: siteKey,
                                pageurl: url,
                                json: 1,
                            },
                        })];
                case 7:
                    response = _a.sent();
                    if (response.data.status !== 1) {
                        console.error("Ошибка отправки капчи:", response.data);
                        return [2 /*return*/, false];
                    }
                    requestId = response.data.request;
                    console.log("\u041E\u0442\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E \u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u043A\u0430\u043F\u0447\u0438, requestId: ".concat(requestId));
                    token = null;
                    _a.label = 8;
                case 8:
                    if (!!token) return [3 /*break*/, 11];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 5000); })];
                case 9:
                    _a.sent(); // Ждем 5 секунд
                    return [4 /*yield*/, axios_1.default.get("http://2captcha.com/res.php", {
                            params: {
                                key: API_KEY,
                                action: "get",
                                id: requestId,
                                json: 1,
                            },
                        })];
                case 10:
                    result = _a.sent();
                    if (result.data.status === 1) {
                        token = result.data.request;
                        console.log("Капча решена, токен получен:", token);
                    }
                    else if (result.data.request !== "CAPCHA_NOT_READY") {
                        console.error("Ошибка при решении капчи:", result.data);
                        return [2 /*return*/, false];
                    }
                    else {
                        console.log("Ожидаем решения капчи...");
                    }
                    return [3 /*break*/, 8];
                case 11: 
                // Вставка токена в поле ответа hCaptcha
                return [4 /*yield*/, page.evaluate(function (token) {
                        var responseField = document.getElementById("h-captcha-response");
                        if (responseField) {
                            responseField.value = token;
                        }
                        else {
                            console.error("Не найдено поле для вставки токена hCaptcha");
                        }
                    }, token)];
                case 12:
                    // Вставка токена в поле ответа hCaptcha
                    _a.sent();
                    console.log("Токен вставлен в поле hCaptcha.");
                    // Предполагается, что после вставки токена форма отправляется автоматически или нужно кликнуть кнопку
                    // await page.click('#submit_button_id'); // Если нужно кликнуть кнопку отправки, раскомментируйте эту строку
                    return [2 /*return*/, true];
                case 13:
                    error_1 = _a.sent();
                    console.error("Произошла ошибка при решении капчи:", error_1);
                    return [2 /*return*/, false];
                case 14:
                    if (!page) return [3 /*break*/, 16];
                    return [4 /*yield*/, page.close()];
                case 15:
                    _a.sent();
                    _a.label = 16;
                case 16:
                    if (!context) return [3 /*break*/, 18];
                    return [4 /*yield*/, context.close()];
                case 17:
                    _a.sent();
                    _a.label = 18;
                case 18:
                    if (!browser) return [3 /*break*/, 20];
                    return [4 /*yield*/, browser.close()];
                case 19:
                    _a.sent();
                    _a.label = 20;
                case 20: return [7 /*endfinally*/];
                case 21: return [2 /*return*/];
            }
        });
    });
}

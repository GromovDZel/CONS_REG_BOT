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
var axios_1 = require("axios");
var API_KEY = "e066b705818762de339227e440dca0cd";
function solveCaptcha(page) {
    return __awaiter(this, void 0, void 0, function () {
        var siteKey, response, requestId, token, attempts, maxAttempts, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    global.logger.info("Waiting for hCaptcha to load...");
                    return [4 /*yield*/, page.waitForSelector(".h-captcha", { timeout: 20000 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, page.$eval('.h-captcha', function (el) { return el.getAttribute('data-sitekey'); })];
                case 2:
                    siteKey = _a.sent();
                    if (!siteKey) {
                        global.logger.error("Failed to find hCaptcha sitekey");
                        return [2 /*return*/, false];
                    }
                    global.logger.info("hCaptcha sitekey found: ".concat(siteKey));
                    return [4 /*yield*/, axios_1.default.post("http://2captcha.com/in.php", null, {
                            params: {
                                key: API_KEY,
                                method: "hcaptcha",
                                sitekey: siteKey,
                                pageurl: page.url(),
                                json: 1,
                            },
                        })];
                case 3:
                    response = _a.sent();
                    if (response.data.status !== 1) {
                        global.logger.error("Error submitting captcha:", response.data);
                        return [2 /*return*/, false];
                    }
                    requestId = response.data.request;
                    global.logger.info("Captcha request sent, requestId: ".concat(requestId));
                    token = null;
                    attempts = 0;
                    maxAttempts = 15;
                    _a.label = 4;
                case 4:
                    if (!(!token && attempts < maxAttempts)) return [3 /*break*/, 7];
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 7500); })];
                case 5:
                    _a.sent();
                    attempts++;
                    return [4 /*yield*/, axios_1.default.get("http://2captcha.com/res.php", {
                            params: {
                                key: API_KEY,
                                action: "get",
                                id: requestId,
                                json: 1,
                            },
                        })];
                case 6:
                    result = _a.sent();
                    if (result.data.status === 1) {
                        token = result.data.request;
                        global.logger.info("Captcha solved, token received: ".concat(token));
                    }
                    else if (result.data.request !== "CAPCHA_NOT_READY") {
                        global.logger.error("Error while solving captcha:", result.data);
                        return [2 /*return*/, false];
                    }
                    else {
                        global.logger.info("Waiting for captcha solution, attempt ".concat(attempts, "/").concat(maxAttempts, "..."));
                    }
                    return [3 /*break*/, 4];
                case 7:
                    if (!token) {
                        global.logger.error("Failed to solve captcha after maximum attempts.");
                        return [2 /*return*/, false];
                    }
                    // Вставка токена в скрытое поле hCaptcha
                    return [4 /*yield*/, page.evaluate(function (token) {
                            var textArea = document.querySelector('textarea[name="h-captcha-response"]');
                            if (textArea) {
                                textArea.value = token;
                                textArea.dispatchEvent(new Event('change', { bubbles: true })); // Триггерим событие change
                            }
                            else {
                                console.error("Could not find the hCaptcha response field");
                            }
                        }, token)];
                case 8:
                    // Вставка токена в скрытое поле hCaptcha
                    _a.sent();
                    global.logger.info("hCaptcha token inserted into the response field.");
                    return [2 /*return*/, true];
                case 9:
                    error_1 = _a.sent();
                    global.logger.error("An error occurred while solving captcha:", error_1);
                    return [2 /*return*/, false];
                case 10: return [2 /*return*/];
            }
        });
    });
}

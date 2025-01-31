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
exports.typeSlowly = typeSlowly;
exports.asyncSleep = asyncSleep;
exports.moveMouseAndClick = moveMouseAndClick;
exports.clickAndType = clickAndType;
exports.randomMouseMove = randomMouseMove;
exports.handleError = handleError;
exports.fillRepeatEmailField = fillRepeatEmailField;
var utils_1 = require("./utils");
function typeSlowly(page_1, selectorOrLocator_1, text_1) {
    return __awaiter(this, arguments, void 0, function (page, selectorOrLocator, text, minDelay, maxDelay) {
        var element, _i, text_2, char, error_1;
        if (minDelay === void 0) { minDelay = 50; }
        if (maxDelay === void 0) { maxDelay = 200; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    element = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, , 13]);
                    return [4 /*yield*/, element.waitFor({ state: "visible", timeout: 10000 })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, element.fill("")];
                case 3:
                    _a.sent(); // Очистка поля перед вводом текста
                    global.logger.info("Filling text slowly: ".concat(text));
                    _i = 0, text_2 = text;
                    _a.label = 4;
                case 4:
                    if (!(_i < text_2.length)) return [3 /*break*/, 11];
                    char = text_2[_i];
                    if (!(Math.random() > 0.5)) return [3 /*break*/, 6];
                    return [4 /*yield*/, element.type(char, { delay: (0, utils_1.randomInt)(minDelay, maxDelay) })];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, element.press(char, { delay: (0, utils_1.randomInt)(minDelay, maxDelay) })];
                case 7:
                    _a.sent();
                    _a.label = 8;
                case 8: return [4 /*yield*/, asyncSleep((0, utils_1.randomInt)(0.1, 0.5), (0, utils_1.randomInt)(0.5, 1))];
                case 9:
                    _a.sent(); // Маленькие паузы между вводом символов
                    _a.label = 10;
                case 10:
                    _i++;
                    return [3 /*break*/, 4];
                case 11: return [3 /*break*/, 13];
                case 12:
                    error_1 = _a.sent();
                    global.logger.error("Error in typeSlowly for ".concat(typeof selectorOrLocator === "string" ? selectorOrLocator : "locator", ":"), error_1);
                    throw error_1;
                case 13: return [2 /*return*/];
            }
        });
    });
}
function asyncSleep(min, max) {
    return __awaiter(this, void 0, void 0, function () {
        var delay;
        return __generator(this, function (_a) {
            delay = (0, utils_1.randomInt)(min, max) * 1000;
            global.logger.info("Sleeping for ".concat(delay / 1000, " seconds"));
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
        });
    });
}
function moveMouseAndClick(page, locator) {
    return __awaiter(this, void 0, void 0, function () {
        var box, x, y, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, locator.boundingBox()];
                case 1:
                    box = _a.sent();
                    if (!box) {
                        throw new Error('Element not found or not visible');
                    }
                    x = box.x + box.width / 2;
                    y = box.y + box.height / 2;
                    // Simulate a smooth mouse movement
                    return [4 /*yield*/, page.mouse.move(x, y, { steps: (0, utils_1.randomInt)(10, 30) })];
                case 2:
                    // Simulate a smooth mouse movement
                    _a.sent();
                    global.logger.info("Mouse moved to center of element at (".concat(x, ", ").concat(y, ")"));
                    return [4 /*yield*/, locator.click()];
                case 3:
                    _a.sent();
                    global.logger.info("Element clicked");
                    // Small pause after clicking to simulate human reaction time
                    return [4 /*yield*/, asyncSleep(0.5, 1.5)];
                case 4:
                    // Small pause after clicking to simulate human reaction time
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    error_2 = _a.sent();
                    global.logger.error("Error in moveMouseAndClick:", error_2);
                    throw error_2;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function clickAndType(page, selectorOrLocator, text) {
    return __awaiter(this, void 0, void 0, function () {
        var locator, boundingBox, x, y, width, height, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    locator = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, locator.waitFor({ state: "visible", timeout: 10000 })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, locator.boundingBox()];
                case 3:
                    boundingBox = _a.sent();
                    if (!boundingBox)
                        throw new Error("Element for ".concat(selectorOrLocator, " not found or not visible"));
                    x = boundingBox.x, y = boundingBox.y, width = boundingBox.width, height = boundingBox.height;
                    return [4 /*yield*/, page.mouse.click(x + width / 2, y + height / 2)];
                case 4:
                    _a.sent();
                    // Small pause to mimic human-like interaction delay
                    return [4 /*yield*/, asyncSleep(0.5, 1.5)];
                case 5:
                    // Small pause to mimic human-like interaction delay
                    _a.sent();
                    // Focus on the element before typing
                    return [4 /*yield*/, locator.focus()];
                case 6:
                    // Focus on the element before typing
                    _a.sent();
                    global.logger.info("Clicked and focused on element at (".concat(x + width / 2, ", ").concat(y + height / 2, ")"));
                    return [4 /*yield*/, typeSlowly(page, locator, text)];
                case 7:
                    _a.sent(); // Use typeSlowly for more natural typing
                    return [3 /*break*/, 9];
                case 8:
                    error_3 = _a.sent();
                    global.logger.error("Error in clickAndType for ".concat(typeof selectorOrLocator === "string" ? selectorOrLocator : "locator", ":"), error_3);
                    throw error_3;
                case 9: return [2 /*return*/];
            }
        });
    });
}
function randomMouseMove(page) {
    return __awaiter(this, void 0, void 0, function () {
        var dimensions, width, height, startX, startY, endX, endY, steps, i, progress, x, y, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 8, , 10]);
                    return [4 /*yield*/, page.evaluate(function () { return ({
                            width: window.innerWidth,
                            height: window.innerHeight,
                        }); })];
                case 1:
                    dimensions = _a.sent();
                    width = Math.floor(dimensions.width);
                    height = Math.floor(dimensions.height);
                    startX = (0, utils_1.randomInt)(0, width);
                    startY = (0, utils_1.randomInt)(0, height);
                    endX = (0, utils_1.randomInt)(0, width);
                    endY = (0, utils_1.randomInt)(0, height);
                    steps = (0, utils_1.randomInt)(10, 50);
                    i = 0;
                    _a.label = 2;
                case 2:
                    if (!(i <= steps)) return [3 /*break*/, 6];
                    progress = i / steps;
                    x = startX + (endX - startX) * progress + (0, utils_1.randomFloat)(-3, 3);
                    y = startY + (endY - startY) * progress + (0, utils_1.randomFloat)(-3, 3);
                    return [4 /*yield*/, page.mouse.move(x, y)];
                case 3:
                    _a.sent();
                    if (!((0, utils_1.randomInt)(0, 5) === 3)) return [3 /*break*/, 5];
                    return [4 /*yield*/, asyncSleep((0, utils_1.randomFloat)(0.02, 0.1), (0, utils_1.randomFloat)(0.05, 0.15))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5:
                    i++;
                    return [3 /*break*/, 2];
                case 6:
                    global.logger.info("\u041C\u044B\u0448\u044C \u043F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0430 \u043A (".concat(endX, ", ").concat(endY, ")"));
                    return [4 /*yield*/, asyncSleep(0.1, 0.5)];
                case 7:
                    _a.sent(); // Маленькая пауза после движения
                    return [3 /*break*/, 10];
                case 8:
                    e_1 = _a.sent();
                    global.logger.error("\u041E\u0448\u0438\u0431\u043A\u0430 \u0432 randomMouseMove: ".concat(e_1));
                    return [4 /*yield*/, page.mouse.move(500, 500)];
                case 9:
                    _a.sent(); // Перемещение в безопасную зону
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
function handleError(e, page) {
    return __awaiter(this, void 0, void 0, function () {
        var errorMessage, content, blockedMessage, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorMessage = e.message;
                    if (/SSL_ERROR|NET_INTERRUPT|ERR_PROXY/i.test(errorMessage)) {
                        global.logger.error("SSL or Network error detected: ".concat(errorMessage));
                        return [2 /*return*/, true];
                    }
                    if (!page) return [3 /*break*/, 4];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, page.content()];
                case 2:
                    content = _a.sent();
                    blockedMessage = "Az IP cím letiltásra került, ezért a weboldal nem elérhető.";
                    if (content.includes(blockedMessage)) {
                        global.logger.error("IP blocked detected.");
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_4 = _a.sent();
                    global.logger.error("Error checking page content: ".concat(error_4));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
function fillRepeatEmailField(page, text) {
    return __awaiter(this, void 0, void 0, function () {
        var inputs, inputCount, lastInput, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    inputs = page.locator('input:visible');
                    return [4 /*yield*/, inputs.count()];
                case 1:
                    inputCount = _a.sent();
                    if (inputCount === 0) {
                        logger.error('No visible input elements found for repeat email.');
                        throw new Error('No visible input elements found for repeat email');
                    }
                    lastInput = inputs.nth(inputCount - 4);
                    return [4 /*yield*/, clickAndType(page, lastInput, text)];
                case 2:
                    _a.sent();
                    logger.info('Filled repeat email in the last visible input field');
                    return [3 /*break*/, 4];
                case 3:
                    error_5 = _a.sent();
                    logger.error('Error in fillRepeatEmailField:', error_5);
                    throw error_5;
                case 4: return [2 /*return*/];
            }
        });
    });
}

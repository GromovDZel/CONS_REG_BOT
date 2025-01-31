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
exports.randomMouse = randomMouse;
exports.asyncSleep = asyncSleep;
exports.moveMouseAndClick = moveMouseAndClick;
exports.clickAndType = clickAndType;
exports.handleError = handleError;
exports.randomMouseMove = randomMouseMove;
var utils_1 = require("./utils");
// Функция для медленного ввода текста
function typeSlowly(page_1, selectorOrLocator_1, text_1) {
    return __awaiter(this, arguments, void 0, function (page, selectorOrLocator, text, minDelay, maxDelay) {
        var element, _i, text_2, char;
        if (minDelay === void 0) { minDelay = 50; }
        if (maxDelay === void 0) { maxDelay = 200; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    element = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
                    return [4 /*yield*/, element.fill("")];
                case 1:
                    _a.sent(); // Очистка поля
                    _i = 0, text_2 = text;
                    _a.label = 2;
                case 2:
                    if (!(_i < text_2.length)) return [3 /*break*/, 5];
                    char = text_2[_i];
                    return [4 /*yield*/, element.type(char, { delay: (0, utils_1.randomInt)(minDelay, maxDelay) })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// Функция для случайного перемещения мыши и взаимодействий
function randomMouse(page_1) {
    return __awaiter(this, arguments, void 0, function (page, width, height) {
        var actions, i, actionType, x, y, scrollAmount;
        if (width === void 0) { width = 600; }
        if (height === void 0) { height = 600; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    actions = (0, utils_1.randomInt)(5, 15);
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < actions)) return [3 /*break*/, 8];
                    actionType = ["move", "scroll"][(0, utils_1.randomInt)(0, 1)];
                    if (!(actionType === "move")) return [3 /*break*/, 3];
                    x = (0, utils_1.randomInt)(0, width);
                    y = (0, utils_1.randomInt)(0, height);
                    return [4 /*yield*/, page.mouse.move(x, y, { steps: (0, utils_1.randomInt)(10, 50) })];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    if (!(actionType === "scroll")) return [3 /*break*/, 5];
                    scrollAmount = (0, utils_1.randomInt)(-1000, 1000);
                    return [4 /*yield*/, page.evaluate("window.scrollBy(0, ".concat(scrollAmount, ")"))];
                case 4:
                    _a.sent();
                    _a.label = 5;
                case 5: return [4 /*yield*/, asyncSleep(100, 1500)];
                case 6:
                    _a.sent(); // Пауза между действиями
                    _a.label = 7;
                case 7:
                    i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// Асинхронный сон
function asyncSleep(min, max) {
    return __awaiter(this, void 0, void 0, function () {
        var delay;
        return __generator(this, function (_a) {
            delay = (0, utils_1.randomInt)(min, max);
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, delay); })];
        });
    });
}
// Перемещение мыши к элементу и клик
function moveMouseAndClick(page, locator) {
    return __awaiter(this, void 0, void 0, function () {
        var box, x, y;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, locator.boundingBox()];
                case 1:
                    box = _a.sent();
                    if (!box) {
                        throw new Error('Element not found or not visible');
                    }
                    x = box.x + box.width / 2;
                    y = box.y + box.height / 2;
                    // Перемещаем мышь к центру элемента
                    return [4 /*yield*/, page.mouse.move(x, y)];
                case 2:
                    // Перемещаем мышь к центру элемента
                    _a.sent();
                    // Кликаем по элементу
                    return [4 /*yield*/, locator.click()];
                case 3:
                    // Кликаем по элементу
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Клик на элемент и ввод текста
function clickAndType(page, selectorOrLocator, text) {
    return __awaiter(this, void 0, void 0, function () {
        var locator, boundingBox, x, y, width, height;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    locator = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
                    return [4 /*yield*/, locator.waitFor({ state: "visible", timeout: 10000 })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, locator.boundingBox()];
                case 2:
                    boundingBox = _a.sent();
                    if (!boundingBox)
                        throw new Error("Element for ".concat(selectorOrLocator, " not found or not visible"));
                    x = boundingBox.x, y = boundingBox.y, width = boundingBox.width, height = boundingBox.height;
                    return [4 /*yield*/, page.mouse.click(x + width / 2, y + height / 2)];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, page.keyboard.type(text)];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
// Обработка ошибок
function handleError(e, page) {
    return __awaiter(this, void 0, void 0, function () {
        var errorMessage, content, blockedMessage, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errorMessage = e.message;
                    if (/SSL_ERROR|NET_INTERRUPT|ERR_PROXY/i.test(errorMessage)) {
                        console.error("SSL or Network error detected: ".concat(errorMessage));
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
                        console.error("IP blocked detected.");
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error checking page content: ".concat(error_1));
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
// Случайное перемещение мыши
function randomMouseMove(page) {
    return __awaiter(this, void 0, void 0, function () {
        var dimensions, width, height, x, y, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 6]);
                    return [4 /*yield*/, page.evaluate(function () { return ({
                            width: window.innerWidth,
                            height: window.innerHeight,
                        }); })];
                case 1:
                    dimensions = _a.sent();
                    width = Math.floor(dimensions.width);
                    height = Math.floor(dimensions.height);
                    x = (0, utils_1.randomInt)(0, width);
                    y = (0, utils_1.randomInt)(0, height);
                    return [4 /*yield*/, page.mouse.move(x, y)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, asyncSleep(100, 500)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 4:
                    e_1 = _a.sent();
                    console.error("Error in randomMouseMove: ".concat(e_1));
                    return [4 /*yield*/, page.mouse.move(500, 500)];
                case 5:
                    _a.sent(); // Восстановление положения мыши
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    });
}

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeSlowly = typeSlowly;
exports.asyncSleep = asyncSleep;
exports.moveMouseAndClick = moveMouseAndClick;
exports.clickAndType = clickAndType;
exports.randomMouseMove = randomMouseMove;
exports.handleError = handleError;
exports.fillRepeatEmailField = fillRepeatEmailField;
const utils_1 = require("./utils");
function typeSlowly(page_1, selectorOrLocator_1, text_1) {
    return __awaiter(this, arguments, void 0, function* (page, selectorOrLocator, text, minDelay = 50, maxDelay = 200) {
        const element = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
        try {
            yield element.waitFor({ state: "visible", timeout: 10000 });
            yield element.fill(""); // Очистка поля перед вводом текста
            global.logger.info(`Filling text slowly: ${text}`);
            for (const char of text) {
                if (Math.random() > 0.5) {
                    yield element.type(char, { delay: (0, utils_1.randomInt)(minDelay, maxDelay) });
                }
                else {
                    yield element.press(char, { delay: (0, utils_1.randomInt)(minDelay, maxDelay) });
                }
                yield asyncSleep((0, utils_1.randomInt)(50, 200), (0, utils_1.randomInt)(100, 300)); // Маленькие паузы между вводом символов
            }
        }
        catch (error) {
            global.logger.error(`Error in typeSlowly for ${typeof selectorOrLocator === "string" ? selectorOrLocator : "locator"}:`, error);
            throw error;
        }
    });
}
function asyncSleep(min, max) {
    return __awaiter(this, void 0, void 0, function* () {
        const delay = (0, utils_1.randomInt)(min, max) * 1000; // Convert to milliseconds
        global.logger.info(`Sleeping for ${delay / 1000} seconds`);
        return new Promise(resolve => setTimeout(resolve, delay));
    });
}
function moveMouseAndClick(page, locator) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const box = yield locator.boundingBox();
            if (!box) {
                throw new Error('Element not found or not visible');
            }
            const x = box.x + box.width / 2;
            const y = box.y + box.height / 2;
            // Simulate a smooth mouse movement
            yield page.mouse.move(x, y, { steps: (0, utils_1.randomInt)(10, 30) });
            global.logger.info(`Mouse moved to center of element at (${x}, ${y})`);
            yield locator.click();
            global.logger.info("Element clicked");
            // Small pause after clicking to simulate human reaction time
            yield asyncSleep(0.5, 1.5);
        }
        catch (error) {
            global.logger.error("Error in moveMouseAndClick:", error);
            throw error;
        }
    });
}
function clickAndType(page, selectorOrLocator, text) {
    return __awaiter(this, void 0, void 0, function* () {
        const locator = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
        try {
            yield locator.waitFor({ state: "visible", timeout: 10000 });
            const boundingBox = yield locator.boundingBox();
            if (!boundingBox)
                throw new Error(`Element for ${selectorOrLocator} not found or not visible`);
            const { x, y, width, height } = boundingBox;
            yield page.mouse.click(x + width / 2, y + height / 2);
            // Small pause to mimic human-like interaction delay
            yield asyncSleep(0.5, 1.5);
            // Focus on the element before typing
            yield locator.focus();
            global.logger.info(`Clicked and focused on element at (${x + width / 2}, ${y + height / 2})`);
            yield typeSlowly(page, locator, text); // Use typeSlowly for more natural typing
        }
        catch (error) {
            global.logger.error(`Error in clickAndType for ${typeof selectorOrLocator === "string" ? selectorOrLocator : "locator"}:`, error);
            throw error;
        }
    });
}
function randomMouseMove(page) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const dimensions = yield page.evaluate(() => ({
                width: window.innerWidth,
                height: window.innerHeight,
            }));
            const width = Math.floor(dimensions.width);
            const height = Math.floor(dimensions.height);
            // Начальная и конечная точки движения
            const startX = (0, utils_1.randomInt)(0, width);
            const startY = (0, utils_1.randomInt)(0, height);
            const endX = (0, utils_1.randomInt)(0, width);
            const endY = (0, utils_1.randomInt)(0, height);
            // Количество шагов (имитируем естественное движение)
            const steps = (0, utils_1.randomInt)(10, 50);
            // Двигаем мышку по траектории с небольшими отклонениями
            for (let i = 0; i <= steps; i++) {
                const progress = i / steps;
                // Интерполяция (плавный переход)
                const x = startX + (endX - startX) * progress + (0, utils_1.randomFloat)(-3, 3);
                const y = startY + (endY - startY) * progress + (0, utils_1.randomFloat)(-3, 3);
                yield page.mouse.move(x, y);
                // Иногда делаем небольшие задержки (чтобы движение выглядело реалистично)
                if ((0, utils_1.randomInt)(0, 5) === 3) {
                    yield asyncSleep((0, utils_1.randomFloat)(0.02, 0.1), (0, utils_1.randomFloat)(0.05, 0.15));
                }
            }
            global.logger.info(`Мышь перемещена к (${endX}, ${endY})`);
            yield asyncSleep(0.1, 0.5); // Маленькая пауза после движения
        }
        catch (e) {
            global.logger.error(`Ошибка в randomMouseMove: ${e}`);
            yield page.mouse.move(500, 500); // Перемещение в безопасную зону
        }
    });
}
function handleError(e, page) {
    return __awaiter(this, void 0, void 0, function* () {
        const errorMessage = e.message;
        if (/SSL_ERROR|NET_INTERRUPT|ERR_PROXY/i.test(errorMessage)) {
            global.logger.error(`SSL or Network error detected: ${errorMessage}`);
            return true;
        }
        if (page) {
            try {
                const content = yield page.content();
                const blockedMessage = "Az IP cím letiltásra került, ezért a weboldal nem elérhető.";
                if (content.includes(blockedMessage)) {
                    global.logger.error("IP blocked detected.");
                    return true;
                }
            }
            catch (error) {
                global.logger.error(`Error checking page content: ${error}`);
            }
        }
        return false;
    });
}
function fillRepeatEmailField(page, text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const inputs = page.locator('input:visible');
            const inputCount = yield inputs.count();
            if (inputCount === 0) {
                logger.error('No visible input elements found for repeat email.');
                throw new Error('No visible input elements found for repeat email');
            }
            // Assuming the repeat email field is one of the last few inputs, but not the very last one
            const lastInput = inputs.nth(inputCount - 4);
            yield clickAndType(page, lastInput, text);
            logger.info('Filled repeat email in the last visible input field');
        }
        catch (error) {
            logger.error('Error in fillRepeatEmailField:', error);
            throw error;
        }
    });
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
exports.default = (0, test_1.defineConfig)({
    testDir: './tests',
    timeout: 30 * 1000, // Таймаут для выполнения тестов
    expect: {
        timeout: 5000, // Таймаут для ожиданий
    },
    use: {
        headless: true, // Использовать безголовый режим
        viewport: { width: 1280, height: 720 }, // Размер окна браузера
        ignoreHTTPSErrors: true, // Игнорировать ошибки HTTPS
    },
});

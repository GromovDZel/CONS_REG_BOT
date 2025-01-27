import { defineConfig } from '@playwright/test';

export default defineConfig({
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

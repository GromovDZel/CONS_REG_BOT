import { Page, Locator } from "playwright";
import { randomInt, randomFloat } from "./utils";

// Функция для медленного ввода текста
export async function typeSlowly(
  page: Page,
  selectorOrLocator: string | Locator,
  text: string,
  minDelay = 50,
  maxDelay = 200
): Promise<void> {
  const element = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;

  await element.fill(""); // Очистка поля
  for (const char of text) {
    await element.type(char, { delay: randomInt(minDelay, maxDelay) });
  }
}

// Функция для случайного перемещения мыши и взаимодействий
export async function randomMouse(page: Page, width = 600, height = 600): Promise<void> {
  const actions = randomInt(5, 15); // Количество действий

  for (let i = 0; i < actions; i++) {
    const actionType = ["move", "scroll"][randomInt(0, 1)];

    if (actionType === "move") {
      const x = randomInt(0, width);
      const y = randomInt(0, height);
      await page.mouse.move(x, y, { steps: randomInt(10, 50) });
    } else if (actionType === "scroll") {
      const scrollAmount = randomInt(-1000, 1000);
      await page.evaluate(`window.scrollBy(0, ${scrollAmount})`);
    }

    await asyncSleep(100, 1500); // Пауза между действиями
  }
}

// Асинхронный сон
export async function asyncSleep(min: number, max: number): Promise<void> {
  const delay = randomInt(min, max);
  return new Promise((resolve) => setTimeout(resolve, delay));
}

// Перемещение мыши к элементу и клик
export async function moveMouseAndClick(page: Page, locator: Locator): Promise<void> {
  // Получаем координаты и размеры элемента
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error('Element not found or not visible');
  }
  
  // Вычисляем координаты центра элемента
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;

  // Перемещаем мышь к центру элемента
  await page.mouse.move(x, y);
  
  // Кликаем по элементу
  await locator.click();
}

// Клик на элемент и ввод текста
export async function clickAndType(page: Page, selectorOrLocator: string | Locator, text: string): Promise<void> {
  const locator = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;

  await locator.waitFor({ state: "visible", timeout: 10000 });
  const boundingBox = await locator.boundingBox();
  if (!boundingBox) throw new Error(`Element for ${selectorOrLocator} not found or not visible`);

  const { x, y, width, height } = boundingBox;
  await page.mouse.click(x + width / 2, y + height / 2);
  await page.keyboard.type(text);
}

// Обработка ошибок
export async function handleError(e: Error, page?: Page): Promise<boolean> {
  const errorMessage = e.message;

  if (/SSL_ERROR|NET_INTERRUPT|ERR_PROXY/i.test(errorMessage)) {
    console.error(`SSL or Network error detected: ${errorMessage}`);
    return true;
  }

  if (page) {
    try {
      const content = await page.content();
      const blockedMessage = "Az IP cím letiltásra került, ezért a weboldal nem elérhető.";
      if (content.includes(blockedMessage)) {
        console.error("IP blocked detected.");
        return true;
      }
    } catch (error) {
      console.error(`Error checking page content: ${error}`);
    }
  }
  return false;
}

// Случайное перемещение мыши
export async function randomMouseMove(page: Page): Promise<void> {
  try {
    const dimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    const width = Math.floor(dimensions.width);
    const height = Math.floor(dimensions.height);

    const x = randomInt(0, width);
    const y = randomInt(0, height);
    await page.mouse.move(x, y);
    await asyncSleep(100, 500);
  } catch (e) {
    console.error(`Error in randomMouseMove: ${e}`);
    await page.mouse.move(500, 500); // Восстановление положения мыши
  }
}


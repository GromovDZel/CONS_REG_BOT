import { Page, Locator } from "playwright";
import { randomInt, randomFloat } from "./utils";

// Ensure global logger is accessible
declare global {
  var logger: any; // Replace 'any' with your logger type if using TypeScript
}

export async function typeSlowly(
  page: Page,
  selectorOrLocator: string | Locator,
  text: string,
  minDelay = 50,
  maxDelay = 200
): Promise<void> {
    const element = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
    try {
        await element.waitFor({ state: "visible", timeout: 10000 });
        await element.fill(""); // Очистка поля перед вводом текста
        global.logger.info(`Filling text slowly: ${text}`);
        
        for (const char of text) {
            if (Math.random() > 0.5) {
                await element.type(char, { delay: randomInt(minDelay, maxDelay) });
            } else {
                await element.press(char, { delay: randomInt(minDelay, maxDelay) });
            }
            await asyncSleep(randomInt(0.1, 0.5), randomInt(0.5, 1)); // Маленькие паузы между вводом символов
        }
    } catch (error) {
        global.logger.error(`Error in typeSlowly for ${typeof selectorOrLocator === "string" ? selectorOrLocator : "locator"}:`, error);
        throw error;
    }
}


export async function asyncSleep(
  min: number, 
  max: number
): Promise<void> {
  const delay = randomInt(min, max) * 1000; // Convert to milliseconds
  global.logger.info(`Sleeping for ${delay / 1000} seconds`);
  return new Promise(resolve => setTimeout(resolve, delay));
}

export async function moveMouseAndClick(
  page: Page, 
  locator: Locator
): Promise<void> {
  try {
    const box = await locator.boundingBox();
    if (!box) {
      throw new Error('Element not found or not visible');
    }
    
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    // Simulate a smooth mouse movement
    await page.mouse.move(x, y, { steps: randomInt(10, 30) });
    global.logger.info(`Mouse moved to center of element at (${x}, ${y})`);
    
    await locator.click();
    global.logger.info("Element clicked");
    // Small pause after clicking to simulate human reaction time
    await asyncSleep(0.5, 1.5);
  } catch (error) {
    global.logger.error("Error in moveMouseAndClick:", error);
    throw error;
  }
}

export async function clickAndType(
  page: Page, 
  selectorOrLocator: string | Locator, 
  text: string
): Promise<void> {
  const locator = typeof selectorOrLocator === "string" ? page.locator(selectorOrLocator) : selectorOrLocator;
  try {
    await locator.waitFor({ state: "visible", timeout: 10000 });
    const boundingBox = await locator.boundingBox();
    if (!boundingBox) throw new Error(`Element for ${selectorOrLocator} not found or not visible`);
    const { x, y, width, height } = boundingBox;
    await page.mouse.click(x + width / 2, y + height / 2);
    // Small pause to mimic human-like interaction delay
    await asyncSleep(0.5, 1.5);
    // Focus on the element before typing
    await locator.focus();
    global.logger.info(`Clicked and focused on element at (${x + width / 2}, ${y + height / 2})`);
    await typeSlowly(page, locator, text); // Use typeSlowly for more natural typing
  } catch (error) {
    global.logger.error(`Error in clickAndType for ${typeof selectorOrLocator === "string" ? selectorOrLocator : "locator"}:`, error);
    throw error;
  }
}

export async function randomMouseMove(page: Page): Promise<void> {
  try {
    const dimensions = await page.evaluate(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
    }));

    const width = Math.floor(dimensions.width);
    const height = Math.floor(dimensions.height);

    // Начальная и конечная точки движения
    const startX = randomInt(0, width);
    const startY = randomInt(0, height);
    const endX = randomInt(0, width);
    const endY = randomInt(0, height);

    // Количество шагов (имитируем естественное движение)
    const steps = randomInt(10, 50);
    
    // Двигаем мышку по траектории с небольшими отклонениями
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      
      // Интерполяция (плавный переход)
      const x = startX + (endX - startX) * progress + randomFloat(-3, 3);
      const y = startY + (endY - startY) * progress + randomFloat(-3, 3);

      await page.mouse.move(x, y);
      
      // Иногда делаем небольшие задержки (чтобы движение выглядело реалистично)
      if (randomInt(0, 5) === 3) {
        await asyncSleep(randomFloat(0.02, 0.1), randomFloat(0.05, 0.15));
      }
    }

    global.logger.info(`Мышь перемещена к (${endX}, ${endY})`);
    await asyncSleep(0.1, 0.5); // Маленькая пауза после движения

  } catch (e) {
    global.logger.error(`Ошибка в randomMouseMove: ${e}`);
    await page.mouse.move(500, 500); // Перемещение в безопасную зону
  }
}


export async function handleError(
  e: Error, 
  page?: Page
): Promise<boolean> {
  const errorMessage = e.message;
  if (/SSL_ERROR|NET_INTERRUPT|ERR_PROXY/i.test(errorMessage)) {
    global.logger.error(`SSL or Network error detected: ${errorMessage}`);
    return true;
  }
  if (page) {
    try {
      const content = await page.content();
      const blockedMessage = "Az IP cím letiltásra került, ezért a weboldal nem elérhető.";
      if (content.includes(blockedMessage)) {
        global.logger.error("IP blocked detected.");
        return true;
      }
    } catch (error) {
      global.logger.error(`Error checking page content: ${error}`);
    }
  }
  return false;
}

export async function fillRepeatEmailField(page: Page, text: string) {
  try {
    const inputs = page.locator('input:visible');
    const inputCount = await inputs.count();
    if (inputCount === 0) {
      logger.error('No visible input elements found for repeat email.');
      throw new Error('No visible input elements found for repeat email');
    }
    // Assuming the repeat email field is one of the last few inputs, but not the very last one
    const lastInput = inputs.nth(inputCount - 4);
    await clickAndType(page, lastInput, text);
    logger.info('Filled repeat email in the last visible input field');
  } catch (error) {
    logger.error('Error in fillRepeatEmailField:', error);
    throw error;
  }
}
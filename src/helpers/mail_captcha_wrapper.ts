import { spawnSync } from 'child_process';

export function mailCaptcha(/* аргументы для функции, если нужны */) {
  // Пример вызова Python скрипта
  const result = spawnSync('python', ['mail_captcha.py', /* аргументы для скрипта */]);
  
  // Обработка результата
  if (result.status !== 0) {
    console.error('Ошибка при выполнении Python скрипта:', result.stderr.toString());
    throw new Error('Python script execution failed');
  }
  
  return result.stdout.toString();
}
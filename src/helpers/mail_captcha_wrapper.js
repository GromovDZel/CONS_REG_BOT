"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mailCaptcha = mailCaptcha;
var child_process_1 = require("child_process");
function mailCaptcha( /* аргументы для функции, если нужны */) {
    // Пример вызова Python скрипта
    var result = (0, child_process_1.spawnSync)('python', ['mail_captcha.py', /* аргументы для скрипта */]);
    // Обработка результата
    if (result.status !== 0) {
        console.error('Ошибка при выполнении Python скрипта:', result.stderr.toString());
        throw new Error('Python script execution failed');
    }
    return result.stdout.toString();
}

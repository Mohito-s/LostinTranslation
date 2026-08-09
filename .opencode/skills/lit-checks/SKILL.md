---
name: lit-checks
description: Use when the user asks to verify the project, run checks, lints, tests, builds, or debug the LIT API. Trigger keywords: lint, проверить, тест, test, build, tsc, vitest, npm test.
---

# LostInTranslation — проверка проекта

Прогони проверки ПОСЛЕДОВАТЕЛЬНО и сообщи результат каждого шага. Всегда
используй `npm.cmd` на Windows (голый `npm` заблокирован политикой).

## Порядок

1. `npm.cmd run lint` — `tsc --noEmit`. Должно быть чисто; любая ошибка типа = фиксить.
2. `npm.cmd test` — Vitest. Все файлы `src/**/*.test.ts` должны быть зелёные.
3. Если просили собрать: `npm.cmd run build`.

## Известные подводные камни

- `npm run build` может падать на этой Windows-машине: Application Control
  блокирует нативный бинарь rollup (`ERR_DLOPEN_FAILED` / `@rollup/rollup-win32-x64-msvc`).
  Это НЕ баг проекта — CI (ubuntu) собирается нормально.
- Тесты изолируют БД через `process.chdir()` во временную папку ДО
  `vi.resetModules()` + динамического `import()`. Не меняй этот паттерн.
- Логгер pino полностью отключён при `NODE_ENV=test` — «тишина» в тестах это норма.

## Быстрый дебаг

- Дев-сервер: `npm.cmd run dev` (или `tsx server.ts`), слушает `:3000`.
- Без `GEMINI_API_KEY` сервер работает в mock-режиме — это нормально для проверки.
- Проверить API curl'ом из PowerShell можно через файл:
  `curl.exe -X POST http://localhost:3000/api/analyze -H "Content-Type: application/json" --data-binary @file.json`
  (кодировку UTF-8 в теле через сам PowerShell manglить не надо).
---
name: lit-new-language
description: Use when adding a new language, region, dialect, culture example, or "loss of meaning" case to the LIT API mocks. Trigger keywords: new language, добавить язык, новый язык, mock rule, cultural loss, потери смысла, пример.
---

# LostInTranslation — добавление нового примера «культурной потери»

Mock-правила живут в ТРЁХ местах, и их надо менять согласованно:

1. `src/lib/analyze.ts` → `getMockAnalysis()` — ответ для `POST /api/analyze`.
2. `src/lib/enhance.ts` → `getMockEnhancement()` — контекстный блок для `POST /api/enhance`.
3. `src/lib/analyze.test.ts` — как минимум один тест на новый кейс (лучше и в
   `enhance` тоже, если есть покрытие).

## Как добавить кейс

1. Определи нормализованный ключ-якорь: `text.toLowerCase()` (в analyze ещё и
   без пунктуации). НЕ полагайся только на латиницу — добавь и родную письменность
   (например `iketara iku` и `行けたら行く`).
2. В `analyze.ts` верни ответ с полями: `original`, `literal_translation`,
   `found: true`, `items[]` с `fragment` = точная цитата из текста.
3. В `enhance.ts` верни `enhanced_prompt` вида:
   `<промт>\n\n[Cultural context for accurate interpretation: ...]\n\nText: <text>`,
   плюс `context_added: true` и осмысленный `losses_detected`.
4. Добавь тест в `src/lib/analyze.test.ts`, следуя стилю уже существующих.
5. Прогони `npm.cmd test` и `npm.cmd run lint`.

## Качество ответов

- Объяснение должно быть про ЭТУ фразу, а не общие факты о языке.
- Указывай, почему дословный перевод ломает смысл (тональность, вежливость,
  хеджирование, understatement, частицы).
- Не выдумывай контекст, которого нет в тексте.
- Если текст скучный и без подтекста — демо-фолбэк всё равно «включает догадку»:
  это окей для моков, но в реальном вызове Gemini `found` должен быть false.
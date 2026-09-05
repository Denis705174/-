# Syntora Space — статический сайт (пока на GitHub Pages / syntora.space)

## Бренд

**Syntora Space** — студия ИИ-менеджеров и AI-лендингов.

<!-- TODO: заменить на реальный домен после покупки -->
Домен: `syntora.space` (плейсхолдер). Пока CNAME указывает на `syntora.space`, чтобы сайт оставался доступен.

## Форма заявок

Форма шлёт JSON на lead-api:
`https://syntora-lead-api-1.onrender.com/api/lead`

1. Сохраняет заявку в SQLite (`leads.db`) всегда
2. Шлёт уведомление в Telegram (ошибка Telegram не отменяет сохранение)

## Демо-боты

| На сайте | Username | Примечание |
|----------|----------|------------|
| Syntora Kitchen AI · демо | @iogram3x_bot | переименование в BotFather — по желанию |
| Syntora Lead Bot · демо | @MegaPromptBot | актуальный lead-бот |
| @ymy_test_bot | — | устарел, не используется |

## РКН / 152-ФЗ

- ИНН: 324104032397
- Политика: `privacy.html`
- Хостинг lead-api на Render (зарубежный) — для полной локализации ПДн нужен сервер в РФ (отдельное решение)

## Деплой сайта

```bash
git add .
git commit -m "описание"
git push origin main
```

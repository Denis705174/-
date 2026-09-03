# Syntora — сайт syntora.space

Статический лендинг на GitHub Pages.

## Файлы

| Файл | Назначение |
|------|------------|
| `index.html` | Главная страница |
| `privacy.html` | Политика конфиденциальности |
| `style.css`, `script.js` | Стили и логика формы |
| `img/` | Изображения и favicon |
| `CNAME` | Домен syntora.space |

## Форма заявок

Форма отправляет JSON на `lead-api` (Render: `https://syntora-lead-api-1.onrender.com`), который:
1. Сохраняет заявку в SQLite
2. Шлёт уведомление в Telegram

Код API: `../lead-api/`

Перед публикацией убедитесь, что API задеплоен (см. `../lead-api/README.md`).

## Деплой сайта

```bash
git add .
git commit -m "описание изменений"
git push origin main
```

GitHub Pages обновится через 1–2 минуты.

Remote: `https://github.com/denis705174/-`

## Домен .ru (желательно)

1. Купить `syntora.ru` у регистратора.
2. Настроить 301-редирект на `https://syntora.space`.
3. В политике и контактах можно указать оба домена.

Бренд и контент менять не нужно — только редирект.

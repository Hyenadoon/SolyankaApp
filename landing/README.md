# Solyanka Landing

Статический лендинг Солянки на Vite + React. Проект можно класть в папку `landing` внутри основного репозитория и собирать отдельно от приложения.

## Локальный запуск

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
npm run preview
```

## Render

Если лендинг лежит в монорепозитории в папке `landing`, в Render укажи:

- Root Directory: `landing`
- Build Command: `npm ci --no-audit --no-fund && npm run build`
- Publish Directory: `dist`
- Environment Variable: `NODE_VERSION=22.12.0`

## Ссылки

Ссылки лежат в `src/config.js`:

- сервис: `https://solyankaapp-front.onrender.com/`
- Telegram: `https://t.me/SolyankaAPP`

# Solyanka VK Mini App

Фронт проекта адаптирован под запуск как VK Mini App без замены существующей вёрстки на VKUI-компоненты.

## Стек

- Frontend: React, Vite, React Router.
- VK integration: `@vkontakte/vk-bridge`.
- Backend: Rails API в папке `backend`.

## Структура фронта

- Точка входа: `src/app/main.jsx`.
- Роутинг экранов: `src/app/App.jsx`.
- Глобальные стили: `src/tokens/tokens.css`, `src/app/App.css`.
- Страницы: `src/app/pages/*`.
- Компоненты: `src/components/*` и `src/app/components/*`.
- API-клиенты: `src/api/*`, базовая обёртка `src/lib/api.js`.
- VK Bridge helpers: `src/lib/vkMiniApp.js`.

## Что изменено для VK Mini App

- Добавлен `@vkontakte/vk-bridge`.
- При старте приложения вызывается `VKWebAppInit` через `initVkMiniApp()`.
- Получаются launch params и config через VK Bridge, если приложение запущено внутри VK.
- Добавлена заготовка `getVkUserInfo()` для дальнейшего получения данных пользователя.
- На странице авторизации добавлен автоматический вход через `/api/v1/vk/launch`, если в URL есть подписанные VK launch params.
- Роутер выбирается автоматически: обычный `BrowserRouter` для веба, `HashRouter` для VK launch params или при `VITE_ROUTER_MODE=hash`.
- Добавлена аккуратная поддержка safe-area/insets через CSS-переменные. Цвета, типографика, размеры, компоненты и структура экранов не заменялись.

## Установка зависимостей

```bash
npm ci
```

## Запуск фронта локально

```bash
npm run dev
```

Если нужно открыть фронт с телефона или через туннель:

```bash
npm run dev:host
```

Фронт по умолчанию ждёт Rails API на:

```bash
http://localhost:3000/api/v1
```

Можно переопределить API URL:

```bash
VITE_API_URL=https://your-api.example.com/api/v1 npm run dev
```

На Windows PowerShell:

```powershell
$env:VITE_API_URL="https://your-api.example.com/api/v1"; npm run dev
```

## Запуск Rails API

```bash
cd backend
bundle install
bin/rails db:setup
bin/rails server -p 3000
```

Для локальной проверки VK-логина без реальной подписи можно временно включить пропуск проверки подписи в development:

```bash
VK_SKIP_SIGNATURE_CHECK=true bin/rails server -p 3000
```

Для production нужны настоящие переменные. `VK_APP_SECRET` — это защищённый ключ из настроек VK Mini App. `VK_SERVICE_TOKEN` хранится на backend для серверных запросов к VK API и не должен попадать во frontend:

```bash
VK_APP_ID=...
VK_APP_SECRET=...
VK_SERVICE_TOKEN=...
```


## Распознавание продуктов по фото

Экран `/scan` теперь отправляет выбранное фото в Rails API через `multipart/form-data` на:

```bash
POST /api/v1/fridge_recognition
```

Backend берёт файл из параметра `image`, отправляет его в OpenAI Responses API, разбирает JSON-ответ модели и сопоставляет найденные продукты с таблицей `ingredients` и `ingredient_synonyms`. Фронт получает `recognized_items` и `suggested_ingredients`, показывает результат на экране проверки и сохраняет в холодильник только продукты, которые удалось связать с ингредиентами из базы.

Для работы распознавания на backend нужны переменные окружения. В локальной сборке их можно положить в `backend/.env`; Rails загрузит этот файл при старте:

```bash
OPENAI_API_KEY=...
# опционально, если хотите хранить временный публичный URL фото
IMGBB_API_KEY=...
# опционально
OPENAI_VISION_MODEL=gpt-4.1-mini
```

Если `IMGBB_API_KEY` не задан, backend отправляет изображение в OpenAI как `data:` URL и не сохраняет URL фото в `fridge_photos`.

## Сборка

Обычная веб-сборка:

```bash
npm run build
```

Сборка под VK/static hosting: hash-router + относительный base path.

```bash
npm run build:vk
```

Результат появится в папке `dist`.

Проверка сборки локально:

```bash
npm run preview
```

## Настройка в кабинете VK Mini Apps

В кабинете VK Mini Apps нужно:

1. Создать Mini App и получить App ID.
2. Указать URL фронта, где лежит собранный `dist` или внешний хостинг приложения.
3. Указать доверенный домен фронта.
4. Указать URL backend API, если он нужен отдельно, и разрешить CORS на backend.
5. Сохранить `VK_APP_ID` и `VK_APP_SECRET` на backend.
6. Убедиться, что frontend запускается по HTTPS. VK-контейнер, как обычно, не любит бытовую магию с небезопасными URL.

## Что проверить вручную

- Открытие Mini App из VK на iOS, Android и desktop web.
- Автоматический вход через VK launch params.
- Что `/api/v1/vk/launch` возвращает JWT и создаёт/находит пользователя.
- Навигацию по всем экранам после перехода на hash-router внутри VK.
- Высоту экранов, фиксированное меню и нижние fixed-элементы на телефонах с safe-area.
- Загрузку фото/камеры, если этот сценарий используется в VK-контейнере.
- CORS backend API на production-домене фронта.

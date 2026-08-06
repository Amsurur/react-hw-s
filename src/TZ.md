# ТЗ Frontend — ADL5:8 (Мобильное приложение)
**Дата:** 2026-07-12
**Версия:** 1.0
**Платформа:** React Native (iOS + Android)
**Статус:** черновик для разработки
> Этот документ описывает **фронтенд** приложения ADL5:8 и опирается на бэкенд-ТЗ (сущности Auth, Contacts, Debts, Folders, Stats, Subscription, Notifications, Scan/Attachments, System). Здесь описано: экраны, навигация, компоненты, вызовы API, состояния (loading / error / empty), валидация на клиенте и разбивка задач между junior и mid.
---
## 0. Как читать этот документ
- Каждый **модуль** = раздел. Внутри — список **экранов**.
- Для каждого экрана указано: **Назначение**, **Компоненты**, **API** (какие эндпоинты вызывает), **Состояния**, **Валидация**, **Заметки**.
- Раздел «Кто делает» в конце говорит, что можно отдать junior, а что вести самому.
- Приоритеты: **P0 = MVP**, **P1 = Phase 2**, **P2 = Phase 3**.
---
## 1. Общее описание
### 1.1 Что это
Приложение для учёта долгов между людьми. Две модели долга:
- **Личный долг** — пользователь ведёт сам, никто не подтверждает.
- **Совместный долг (mutual)** — между двумя пользователями ADL5:8. Каждое действие (создание, платёж, увеличение) требует подтверждения второй стороны.
### 1.2 Технологический стек (рекомендуемый)
| Слой | Технология |
| --- | --- |
| Framework | React Native + TypeScript |
| Навигация | React Navigation (native-stack + bottom-tabs) |
| Серверное состояние | TanStack Query (React Query) |
| Клиентское состояние | Zustand (или Context) — только для auth/тема/язык |
| Формы | React Hook Form + Zod |
| HTTP | Axios (с interceptors) |
| Хранилище токенов | expo-secure-store / react-native-keychain |
| Push | Firebase Cloud Messaging (Android) + APNS (iOS) |
| Камера / галерея | expo-image-picker / react-native-vision-camera |
| QR | react-native-vision-camera + code scanner |
| Графики | victory-native / react-native-gifted-charts |
| i18n | i18next + react-i18next (tj / ru / en) |
> ⚠️ **Важно определить до старта:** бэкенд по ТЗ — .NET / PostgreSQL. Если реально используется другой бэкенд (например Supabase), auth, refresh-токены и realtime меняются. Договоритесь об этом до кода.
### 1.3 Архитектура папок (feature-based)
```
src/
├── app/                # навигация, провайдеры, точка входа
├── shared/
│   ├── api/            # axios instance, interceptors, refresh
│   ├── ui/             # переиспользуемые компоненты (Button, Input, ...)
│   ├── lib/            # утилиты (форматирование валют, дат)
│   ├── config/         # константы, env
│   └── i18n/           # переводы
├── entities/           # модели (типы + мелкие компоненты): debt, contact, folder, user
├── features/           # действия: create-debt, pay-debt, confirm-mutual, ...
└── screens/            # экраны, собранные из features + entities
```
---
## 2. Навигация (структура экранов)
### 2.1 Верхний уровень
```
RootNavigator
├── AuthStack               (не залогинен)
│   ├── Welcome
│   ├── Register
│   ├── VerifyEmail
│   ├── Login
│   ├── ForgotPassword
│   └── ResetPassword
│
├── OnboardingStack         (залогинен, но не прошёл онбординг)
│   ├── PremiumOffer
│   └── SelectThemes
│
└── MainTabs                (залогинен)
    ├── Tab: Home           → Dashboard
    ├── Tab: Debts          → DebtsList → DebtDetails → ...
    ├── Tab: Contacts       → ContactsList → ContactDetails → ...
    ├── Tab: Stats          → StatsDashboard
    └── Tab: Settings       → Settings → (Profile, Themes, Notifications, Subscription, Team)
```
Отдельные экраны, открываемые модально из любого места:
`CreateDebt`, `PaymentSheet`, `IncreaseSheet`, `SettleSheet`, `CreateContact`, `ScanQR`, `NotificationCenter`, `AttachmentViewer`.
### 2.2 Deep linking
Push-уведомления открывают конкретный экран (например `DebtDetails` по `debtId`). QR-код при сканировании ведёт на `DebtDetails` / confirm.
---
## 3. Дизайн-система
### 3.1 Темы
- Всего **10 тем** (Ocean, Forest, Sunset, Midnight, Coral, Sage, Lavender, Gold, Berry, Slate).
- Каждая тема = набор цветов: `primary, secondary, accent, background, surface, text, textSecondary`.
- Тему тянем с `/api/System/themes`. Free-юзеру доступно 3 из 10, Premium — все 10.
- Тема хранится в клиентском сторе + применяется через `ThemeProvider`.
- Поддержка light/dark учитывается через цвета темы (Midnight — тёмная).
### 3.2 Базовые UI-компоненты (`shared/ui`)
| Компонент | Назначение |
| --- | --- |
| `Button` | primary / secondary / danger / ghost, состояние loading/disabled |
| `Input` | текст, с label, ошибкой, иконкой |
| `PasswordInput` | с показать/скрыть |
| `Select` / `BottomSheetPicker` | валюта, язык, папка, тема |
| `Avatar` | фото или инициалы |
| `Card` | контейнер |
| `Badge` / `StatusPill` | статус долга, тип уведомления |
| `AmountText` | форматирует сумму + символ валюты |
| `EmptyState` | иконка + текст + действие |
| `ErrorState` | текст ошибки + «Повторить» |
| `Skeleton` | загрузка |
| `Toast` | уведомления об успехе/ошибке |
| `ConfirmDialog` | подтверждение действий (удаление, выход) |
| `PhotoPicker` | камера / галерея |
### 3.3 Форматирование
- **Валюты НЕ конвертируются.** Каждая сумма показывается в своей валюте с её символом (TJS = ЅМ, USD = $, RUB = ₽). Общие суммы группируются по валюте.
- Даты — по локали пользователя.
- Отрицательный баланс (я должен) и положительный (мне должны) — разными цветами.
---
## 4. Глобальные состояния и обработка ошибок
### 4.1 Каждый экран со списком имеет 4 состояния
1. **Loading** — скелетоны.
2. **Empty** — `EmptyState` с призывом к действию.
3. **Error** — `ErrorState` + кнопка «Повторить».
4. **Data** — контент.
### 4.2 Обработка ошибок API (коды из бэкенд-ТЗ)
Единый обработчик мапит код ошибки → сообщение (i18n). Примеры:
| Код | Сообщение (пример, ru) |
| --- | --- |
| `INVALID_CREDENTIALS` | Неверный email или пароль |
| `EMAIL_NOT_VERIFIED` | Подтвердите email |
| `OTP_EXPIRED` | Код истёк, отправьте заново |
| `PAYMENT_AMOUNT_EXCEEDS_DEBT` | Сумма больше остатка долга |
| `MUTUAL_DEBT_ALREADY_EXISTS` | С этим контактом уже есть активный долг |
| `PREMIUM_REQUIRED` | Нужна подписка Premium |
| `RATE_LIMIT_EXCEEDED` | Слишком много запросов, попробуйте позже |
| `CONTACT_HAS_ACTIVE_DEBTS` | Нельзя удалить контакт с активными долгами |
`429` → показать «попробуйте позже». `401` → авто-refresh токена (см. §5). `403 PREMIUM_REQUIRED` → показать экран подписки.
---
## 5. Слой API (auth, токены, refresh)
### 5.1 Хранение токенов
- `accessToken` (живёт 1 час) и `refreshToken` (30 дней) — в **secure storage**, не в AsyncStorage.
### 5.2 Interceptor'ы Axios
- **Request**: добавляет `Authorization: Bearer {accessToken}` и `X-API-Version: v1`.
- **Response 401**:
  1. Вызвать `POST /api/Auth/refresh` с `refreshToken`.
  2. Сохранить новые токены, повторить исходный запрос.
  3. Если refresh упал → разлогинить, увести на `AuthStack`.
  4. Обязательно **очередь запросов**: пока идёт refresh, остальные 401-запросы ждут, чтобы не дёргать refresh несколько раз.
### 5.3 Структура запросов
Каждый модуль имеет свой `api`-файл с типизированными функциями (`debtsApi.list()`, `debtsApi.pay(id, body)` …) и React Query хуки (`useDebts()`, `usePayDebt()`).
---
## 6. Модуль AUTH (P0)
### 6.1 Welcome
- **Назначение:** первый экран. Кнопки «Регистрация», «Войти», OAuth (Google/Apple).
- **API:** —
- **Заметки:** брендинг ADL5:8.
### 6.2 Register
- **Назначение:** регистрация по email/паролю.
- **Компоненты:** Input(username, email), PasswordInput(password, confirmPassword), Button.
- **API:** `POST /api/Auth/register` → возвращает `userId`, отправляет OTP.
- **Валидация (клиент):** username 3–50, email формат, пароль ≥6 символов + минимум 1 буква + 1 цифра, `password === confirmPassword`.
- **Успех:** переход на `VerifyEmail` с email.
- **Ошибки:** `EMAIL_ALREADY_EXISTS`, `USERNAME_ALREADY_EXISTS`, `VALIDATION_ERROR`.
### 6.3 VerifyEmail
- **Назначение:** ввод 6-значного OTP.
- **Компоненты:** OTP-input (6 ячеек), таймер (15 мин), кнопка «Отправить заново».
- **API:** `POST /api/Auth/verify-email` ; повтор — `POST /api/Auth/resend-verification`.
- **Ошибки:** `INVALID_OTP`, `OTP_EXPIRED`.
- **Успех:** переход на `Login` или сразу авто-вход → `OnboardingStack`.
### 6.4 Login
- **API:** `POST /api/Auth/login` → access + refresh token.
- **Валидация:** email, пароль непустой.
- **Ошибки:** `INVALID_CREDENTIALS`, `EMAIL_NOT_VERIFIED` (кнопка «Отправить код»).
- **Заметки:** после 5 неудач бэкенд блокирует на 15 минут — показать понятное сообщение.
### 6.5 ForgotPassword / ResetPassword
- **API:** `POST /api/Auth/forgot-password` → письмо; `POST /api/Auth/reset-password`.
### 6.6 OAuth (Google / Apple) — P1
- Получить `idToken` из SDK → `POST /api/Auth/oauth/google` | `/apple`.
---
## 7. Модуль ONBOARDING (P1)
### 7.1 PremiumOffer
- **Назначение:** после регистрации показать преимущества Premium.
- **API:** `GET /api/Subscription/offer`.
- **Кнопки:** «Начать пробный период (30 дней)» → `POST` активации триала; «Игнорировать» → `POST /api/Subscription/offer/skip` (покажется снова через 7 дней).
- **Далее:** `SelectThemes`.
### 7.2 SelectThemes
- **Назначение:** Free выбирает 3 темы из 10 (Premium — все).
- **API:** `GET /api/System/themes` → `POST /api/Themes/select`.
- **Валидация:** Free — ровно/до 3 тем, минимум 1.
---
## 8. Модуль DASHBOARD / HOME (P0 — сводка, P1 — графики)
### 8.1 Dashboard
- **Назначение:** главный экран, финансовая сводка.
- **API:** `GET /api/Stats/summary?currency=...`.
- **Компоненты:**
  - Карточка **чистого баланса** (netBalance) — крупно.
  - Две карточки: «Мне должны» (totalOwesMe) / «Я должен» (totalIOwe).
  - Плашка **просрочки** (overdueCount, overdueTotal) — если >0.
  - Индекс здоровья (debtHealthScore 0–100).
  - Быстрые действия: «+ Долг», «Уведомления».
- **Состояния:** loading (скелетон карточек), empty (нет долгов → призыв создать первый), error.
- **Заметки:** сводка может содержать несколько валют — не суммировать между валютами.
---
## 9. Модуль DEBTS (P0 базовый, события — P1)
### 9.1 DebtsList
- **Назначение:** список долгов.
- **API:** `GET /api/Debts` (фильтры: статус, контакт, папка; сортировка; пагинация).
- **Компоненты:** `DebtCard` (контакт, сумма, сторона OwesMe/IOwe, статус, срок, значок просрочки, значок mutual). Фильтры-чипсы (Активные / Урегулированные / Архив). Поиск. Пул-ту-рефреш.
- **Состояния:** все 4.
### 9.2 DebtDetails
- **API:** `GET /api/Debts/{id}` (включает `events[]`).
- **Компоненты:**
  - Шапка: контакт, сумма, остаток, статус, срок, фото-вложение.
  - Кнопки действий: «Оплатить», «Увеличить», «Погасить», «Архивировать» (в зависимости от статуса).
  - Для mutual — плашка подтверждения (кто подтвердил), кнопка QR.
  - **Лента событий** (история): каждое событие = тип, сумма, дата, остаток после. Для mutual — инициатор + статус подтверждения.
- **Заметки:** действия, требующие суммы, открывают bottom sheet (§9.4–9.6).
### 9.3 CreateDebt
- **Назначение:** создать личный или совместный долг.
- **API:** `POST /api/Debts` (`isMutual` = true/false).
- **Компоненты:** выбор контакта, сумма, валюта, сторона (Мне должны / Я должен), описание, дата долга, срок (dueDate), папка, фото, переключатель «Совместный».
- **Валидация:** сумма > 0 и < 1 000 000 000; dueDate в будущем; описание ≤500.
- **Заметки:** «Совместный» доступен только если у контакта `hasAccount = true`.
### 9.4 PaymentSheet
- **API:** `POST /api/Debts/{id}/pay`.
- **Валидация:** сумма > 0 и ≤ остатка (`PAYMENT_AMOUNT_EXCEEDS_DEBT`).
- **Mutual:** после отправки — статус «ждёт подтверждения второй стороны». Нельзя создать второй платёж, пока первый не подтверждён (`PAYMENT_PENDING_EXISTS`).
### 9.5 IncreaseSheet
- **API:** `POST /api/Debts/{id}/increase`. Сумма > 0.
### 9.6 SettleSheet
- **API:** `POST /api/Debts/{id}/settle`. Долг → Settled.
### 9.7 Архив / восстановление
- **API:** `POST /api/Debts/{id}/archive`, `POST /api/Debts/{id}/restore`.
### 9.8 Управление событиями (P1 — сложно)
- **Лента событий:** `GET /api/Debts/{id}/events`.
- **Редактировать событие:** `PATCH /api/Debts/{id}/events/{eventId}` (сумма, дата, заметка, фото + причина). Нельзя редактировать `Created` и события удалённого/архивного долга. Только автор.
- **История изменений:** `GET .../events/{eventId}/history` — старые/новые значения.
- **Откат:** `POST .../events/{eventId}/revert`.
- **Удаление:** `DELETE .../events/{eventId}` (нельзя удалять `Created` и подтверждённые события).
- **Заметки для UI:** после любого редактирования баланс последующих событий пересчитывается бэкендом — просто перезапросить долг. Показывать пометку «изменено» (isEdited).
---
## 10. Модуль MUTUAL DEBTS (P1 — самый сложный)
Совместные долги приходят через тот же `DebtDetails`, но с дополнительной логикой подтверждения.
### 10.1 Входящий запрос на долг
- Приходит push `DebtCreated`. Экран показывает детали и две кнопки: **Подтвердить** / **Отклонить**.
- **API:** `POST /api/Debts/{id}/events/{eventId}/confirm` | `.../reject` (или `/api/MutualDebts/{id}/confirm`).
- Обе стороны подтвердили → долг Active. Одна отклонила → Cancelled.
### 10.2 Подтверждение платежей / увеличений
- Любое действие второй стороны → плашка «требует вашего подтверждения» + кнопки Подтвердить/Отклонить.
### 10.3 Спор (Dispute) — P2
- **API:** `POST /api/MutualDebts/{id}/dispute`, `.../dispute/resolve`.
- В споре все операции заморожены — UI блокирует кнопки действий, показывает баннер спора.
### 10.4 QR для совместного долга (P1)
- **Показать QR:** `GET /api/Debts/{debtId}/qr` → картинка + возможность поделиться.
- **Сканировать:** `ScanQR` → `POST /api/Debts/qr/scan` → открыть детали / подтвердить.
---
## 11. Модуль CONTACTS (P0)
### 11.1 ContactsList
- **API:** `GET /api/Contacts` (+ `/search`, `/favorites`, `/group/{group}`).
- **Компоненты:** `ContactCard` (аватар, имя, сумма долга, значок «есть аккаунт»/«доверенный»), поиск, фильтр по группе, избранные, сортировка.
### 11.2 ContactDetails
- **API:** `GET /api/Contacts/{id}`, статистика `GET /api/Contacts/{id}/stats`.
- **Компоненты:** профиль, статистика (активные долги, сумма, кто чаще должен), список долгов контакта, кнопка «Создать долг».
### 11.3 CreateContact / EditContact
- **API:** `POST /api/Contacts`, `PATCH /api/Contacts/{id}`.
- **Поля:** имя (обяз.), телефон, email, заметки, компания, должность, группа, теги, избранное, аватар.
- **Валидация:** имя 1–100; email/телефон формат; заметки ≤500; тег ≤30, до 20 тегов.
- **Заметки:** если email совпадает с юзером системы — бэкенд сам свяжет (`hasAccount = true`).
### 11.4 Удаление контакта
- **API:** `DELETE /api/Contacts/{id}`. Ошибка `CONTACT_HAS_ACTIVE_DEBTS`.
### 11.5 Импорт/экспорт — P2
- CSV / vCard: `POST /api/Contacts/import`.
---
## 12. Модуль FOLDERS (P0 — простой)
### 12.1 FoldersList
- **API:** `GET /api/Folders`.
- **Компоненты:** карточка папки (иконка-emoji, цвет, название, количество и сумма долгов). Системная папка «Без папки» — первая, без удаления/редактирования.
### 12.2 Create / Edit / Delete / Reorder
- **API:** `POST /api/Folders`, `PUT /api/Folders/{id}`, `DELETE /api/Folders/{id}`, `POST /api/Folders/reorder`.
- **Поля:** название (обяз., ≤50, уникально), иконка (1 emoji), цвет (hex).
- **Валидация:** цвет `#RRGGBB`; лимит 100 папок (Free — 15 → `FOLDER_LIMIT_EXCEEDED`).
- **Удаление:** долги переносятся в «Без папки» (показать «перенесено N долгов»).
- **Заметки:** системную папку нельзя трогать (`FOLDER_CANNOT_EDIT_SYSTEM`).
---
## 13. Модуль STATS / ANALYTICS (P1)
### 13.1 StatsDashboard
- **API:** `GET /api/Stats/summary`, `/comparison`, `/trend/monthly`, `/contacts/top`, `/folders/distribution`, `/overdue`, `/mutual`.
- **Компоненты:**
  - Селектор периода (месяц / квартал / год / всё) и валюты.
  - Линейный график тренда по месяцам.
  - Круговая диаграмма по папкам.
  - Топ-контакты (список с долей %).
  - Сравнение с прошлым периодом (стрелки ↑↓ + %).
- **Заметки:** бэкенд кэширует; можно дёрнуть `GET /api/Stats/refresh` для форс-обновления.
---
## 14. Модуль SUBSCRIPTION (P1)
### 14.1 SubscriptionStatus
- **API:** `GET /api/Subscription/status` → тариф, дни до конца, features.
- **Компоненты:** текущий тариф, дни триала, список возможностей, кнопки «Оформить Premium», «Отменить».
### 14.2 Plans / Checkout
- **API:** `GET /api/Subscription/plans`, `POST /api/Subscription/checkout` (Stripe / Apple / Google).
- **Заметки:** Premium может активировать суперадмин вне приложения — просто отражаем статус, платёжных данных не требуем.
### 14.3 ThemesScreen
- **API:** `GET /api/System/themes`, `POST /api/Themes/select`.
- Free: 3 из 10. Premium: все 10. Заблокированные темы показывать с замком + CTA на Premium.
### 14.4 Cancel / Resume
- **API:** `POST /api/Subscription/cancel`, `/resume`.
---
## 15. Модуль NOTIFICATIONS (P1)
### 15.1 Push-инфраструктура
- Регистрация устройства: `POST /api/Notifications/device` (token, platform, model, os, appVersion) — после логина и получения разрешения.
- Обработка входящего push → deep link на нужный экран.
- 13 типов уведомлений (долги, команда, подписка). Приоритеты Urgent/High → звук/бейдж.
### 15.2 NotificationCenter
- **API:** `GET /api/Notifications` (пагинация), непрочитанные `GET /api/Notifications/unread`.
- **Действия:** прочитать `POST /{id}/read`, всё `POST /read-all`, удалить `DELETE /{id}`.
- **Компоненты:** список с иконкой по типу, непрочитанные выделены, бейдж на табе.
### 15.3 NotificationSettings
- **API:** `GET /api/Notifications/settings`, `PATCH ...`.
- Глобальный вкл/выкл push, вкл/выкл по типам, язык уведомлений.
---
## 16. Модуль SCAN / ATTACHMENTS (P1)
### 16.1 Вложения к долгу
- **Загрузить:** `POST /api/Debts/{debtId}/attachments` (multipart). Форматы JPG/PNG/WEBP, ≤10 MB, до 5 фото.
- **Просмотр:** `AttachmentViewer` (зум, свайп между фото).
- **Удалить:** `DELETE .../attachments/{id}`.
- **Компоненты:** `PhotoPicker` (камера/галерея), превью, индикатор загрузки.
- **Ошибки:** `ATTACHMENT_FILE_TOO_LARGE`, `ATTACHMENT_UNSUPPORTED_FORMAT`, `ATTACHMENT_LIMIT_EXCEEDED`.
### 16.2 ScanQR
- Камера + сканер QR → `POST /api/Debts/qr/scan` → детали/подтверждение долга.
- Обработать ошибки: `QR_INVALID_CODE`, `QR_EXPIRED`, `QR_NOT_FOR_YOU`.
---
## 17. Модуль SETTINGS / SYSTEM (P0)
### 17.1 Settings (корневой)
- Разделы: Профиль, Тема, Язык, Валюта, Уведомления, Подписка, Команда, Выход.
### 17.2 Profile
- **API:** `GET /api/Users/me`, `PATCH /api/Users/me`, аватар `POST/DELETE /api/Users/me/avatar`, удаление аккаунта `DELETE /api/Users/me` (подтверждение словом «DELETE»).
- Смена валюты (TJS/USD/RUB), языка (tj/ru/en), темы, уведомлений.
### 17.3 ChangePassword
- **API:** `POST /api/Auth/change-password` (текущий → новый → повтор).
### 17.4 Logout
- **API:** `POST /api/Auth/logout` (аннулирует refresh). Предупреждение: «Несохранённые данные будут удалены». Очистить secure storage и кэш React Query.
### 17.5 System-данные
- Валюты `GET /api/System/currencies`, языки `/languages`, лимиты `/limits`, health `/health`.
---
## 18. Команда (Team) — P2
- **API:** `POST /api/Users/team/invite`, `/accept`, `GET /members`, `PATCH/DELETE /members/{id}`, `POST /leave`.
- Только Premium. Free — до 3 сотрудников, Premium — до 10.
- Экраны: список сотрудников, приглашение по email, управление правами.
---
## 19. Матрица «Кто делает» (junior vs mid)
| Модуль | Сложность | Кто ведёт | Что объяснить junior |
| --- | --- | --- | --- |
| Folders | Простой | **Junior полностью** | CRUD + системная папка неудаляемая |
| Contacts (CRUD) | Средний | Junior + твой ревью | валидация, связь с аккаунтом |
| Settings / Profile | Простой | **Junior** | формы, PATCH me |
| Dashboard (сводка) | Средний | Junior + ревью | не суммировать валюты между собой |
| Auth + refresh токены | Сложный | **Ты** | очередь refresh, secure storage, 401-flow |
| Debts (список/детали/создание) | Сложный | Ты, часть — junior | статусы, стороны, mutual-флаг |
| События (edit/revert/delete) | Сложный | **Ты** | пересчёт баланса, права автора |
| Mutual debts + confirm | Самый сложный | **Ты полностью** | двустороннее подтверждение, споры |
| Stats + графики | Сложный | Ты + junior на верстку | периоды, кэш, несколько валют |
| Subscription + themes | Средний | Ты | features-гейтинг, замки на темах |
| Notifications + push | Средний | Ты | регистрация устройства, deep link |
| Scan + QR + attachments | Средний | Junior + ревью | multipart, лимиты файлов |
**Правило для делегирования:** отдавай junior то, что **зелёное/жёлтое** и **не завязано на mutual-логику**. Всё, где два пользователя подтверждают друг друга (mutual debts, confirm, dispute, QR-подтверждение) — держи на себе, потому что там легко сломать бизнес-логику и данные разъедутся между сторонами.
---
## 20. Фазы разработки
### Phase 0 — MVP (запуск)
Auth (+ refresh), Contacts (CRUD), Folders, Debts (личные: создание, список, детали, оплата, погашение), Dashboard (сводка), Settings/Profile, System-данные.
### Phase 1 — Core value
Mutual debts (+ confirm), события/история (edit/revert/delete), Stats + графики, Subscription + темы, Notifications + push, Scan/QR/вложения, Onboarding/PremiumOffer, OAuth.
### Phase 2 — Later
Споры (dispute), Team management, Import/export контактов, Predictions/рекомендации.
---
## 21. Что уточнить до старта (открытые вопросы)
1. **Бэкенд .NET или Supabase?** — влияет на auth, refresh, realtime.
2. **Realtime нужен?** — для mutual debt подтверждений: polling или WebSocket/SignalR?
3. **Дизайн-макеты есть?** — этот ТЗ описывает функционал, но не пиксельный дизайн.
4. **Оффлайн-режим нужен?** — если да, добавить кэш-стратегию (persist React Query).
5. **Мультивалютность в одном отчёте** — как показывать: раздельными блоками по валюте (рекомендуется) или иначе?
---
*Конец ТЗ. Документ живой — дополняется по мере уточнения бэкенда и дизайна.*


this is a TZ for a new app with react native how much it can cost for me ?

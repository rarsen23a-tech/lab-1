# Лабораторна робота №4/5 
## Запуск

### Бекенд
```bash
cd backend
npm install
npm run dev
```
Сервер запускається на http://localhost:3000

### Фронтенд
```bash
cd frontend
npm install
npx http-server . -p 5500
```
Відкрити у браузері: http://127.0.0.1:5500

> Фронтенд **обов'язково** відкривати через http://, не як file://

## Структура проєкту

```
backend/
  src/
    controllers/    — обробники запитів
    services/       — бізнес-логіка
    repositories/   — робота з БД
    routes/         — маршрути
    dtos/           — DTO класи
    middlewares/    — логер, обробник помилок
    utils/          — AppError, валідатори
    db/             — dbClient, migrate
  migrations/       — SQL міграції
  data/             — SQLite база даних

frontend/
  src/
    config.ts       — API_BASE_URL
    dtos.ts         — TypeScript інтерфейси
    apiClient.ts    — HTTP клієнт (fetch + AbortController)
    ui.ts           — рендеринг DOM
    main.ts         — точка входу, логіка сценаріїв
  public/
    js/             — скомпільований TypeScript
  index.html
  styles.css
  tsconfig.json
```

## Схема БД

### Users
| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE |
| username | TEXT | — |
| role | TEXT | — |
| createdAt | TEXT | NOT NULL |

### Posts
| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| userId | INTEGER | NOT NULL, FK → Users.id |
| title | TEXT | NOT NULL |
| content | TEXT | NOT NULL |
| category | TEXT | — |
| createdAt | TEXT | NOT NULL |

### Comments
| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| postId | INTEGER | NOT NULL, FK → Posts.id |
| userId | INTEGER | NOT NULL, FK → Users.id |
| text | TEXT | NOT NULL |
| createdAt | TEXT | NOT NULL |

## Міграції
001_init_users.sql
002_init_posts.sql
003_init_comments.sql
004_add_indexes.sql
005_add_email_to_users.sql
006_add_unique_email.sql
007_add_username_to_users.sql
008_add_role_to_users.sql
009_add_category_to_posts.sql
010_init_notes.sql

## Ендпоінти API (v1)

### Users
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

### Posts
GET    /api/v1/posts
GET    /api/v1/posts/:id
POST   /api/v1/posts
PUT    /api/v1/posts/:id
DELETE /api/v1/posts/:id

### Comments
GET    /api/v1/comments
GET    /api/v1/comments/:id
POST   /api/v1/comments
PUT    /api/v1/comments/:id
DELETE /api/v1/comments/:id

### Додаткові
GET  /api/v1/posts-with-authors
GET  /api/v1/stats/posts-per-user
GET  /api/v1/search/posts?q=текст
POST /api/v1/users-with-post

## Правила сумісності DTO (v1)

1. Поля не перейменовуються і не видаляються у v1
2. Нові поля додаються як необов'язкові з дефолтами
3. Breaking changes лише при введенні /api/v2/

## Приклади перевірки

### Створити користувача
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice\",\"email\":\"alice@example.com\",\"username\":\"alice123\",\"role\":\"admin\"}"
```

### Отримати список користувачів
```bash
curl http://localhost:3000/api/v1/users
```

### Створити пост
```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Тест\",\"content\":\"Вміст\",\"category\":\"Навчання\",\"userId\":1}"
```

### Додати коментар
```bash
curl -X POST http://localhost:3000/api/v1/comments \
  -H "Content-Type: application/json" \
  -d "{\"postId\":1,\"userId\":1,\"text\":\"Коментар\"}"
```

### Перевірка помилки валідації (400)
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"\"}"
```

### Перевірка 404
```bash
curl http://localhost:3000/api/v1/users/99999
```

### Перевірка CORS
Відкрити http://127.0.0.1:5500 у браузері — запити до бекенду мають проходити без CORS помилок.

## SQL Injection демонстрація

Endpoint `/api/v1/search/posts` використовує рядкову конкатенацію — навмисно для демонстрації. Виправлення через параметризовані запити буде в лабораторній роботі №5.

## Технічні особливості

- **TypeScript** на фронтенді з типізованими DTO
- **AbortController** — таймаут запитів 10 секунд
- **CORS whitelist** — дозволені конкретні origins
- **Стани UI** — loading / success / empty / error для кожного запиту
- **Версійність API** — префікс /api/v1/

## Лабораторна робота №5

### Нотатки (захищений ресурс)
```bash
# Створити нотатку (юзер 1)
curl -X POST http://localhost:3000/api/v1/notes \
  -H "Content-Type: application/json" \
  -H "X-Demo-UserId: 1" \
  -d "{\"title\":\"Моя нотатка\",\"body\":\"Секретний текст\"}"

# Читати свою нотатку (юзер 1) — OK
curl http://localhost:3000/api/v1/notes/1 -H "X-Demo-UserId: 1"

# Читати чужу нотатку (юзер 2) — 404
curl http://localhost:3000/api/v1/notes/1 -H "X-Demo-UserId: 2"

# Без заголовка — 401
curl http://localhost:3000/api/v1/notes/1
```

### Notes (IDOR захист)
| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| ownerUserId | INTEGER | NOT NULL, FK → Users.id |
| title | TEXT | NOT NULL |
| body | TEXT | NOT NULL |
| createdAt | TEXT | NOT NULL |

### Перевірка SQL Injection (виправлено)
```bash
# Нормальний пошук — працює
curl "http://localhost:3000/api/v1/search/posts?q=First"

# SQL injection — після виправлення повертає порожній масив
curl "http://localhost:3000/api/v1/search/posts?q=%27%20OR%20%271%27%3D%271"
```

### Перевірка Security Headers
```bash
curl -I http://localhost:3000/api/v1/users
```

### Уразливості і захист
Детальний опис всіх 4 сценаріїв безпеки — у файлі [REPORT.md](./REPORT.md).



Лабораторна робота №3 Перед початком роботи прочитайте README. 
# Backend API — Lab 3 (SQLite)

## Запуск

```bash
npm install
npm run seed
npm run dev
```

Сервер запускається на http://localhost:3000

База даних створюється автоматично у `data/app.db`

## Схема БД

### Таблиці та поля

**Users**
| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| name | TEXT | NOT NULL |
| email | TEXT | UNIQUE |
| createdAt | TEXT | NOT NULL |

**Posts**
| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| userId | INTEGER | NOT NULL, FK → Users.id |
| title | TEXT | NOT NULL |
| content | TEXT | NOT NULL |
| createdAt | TEXT | NOT NULL |

**Comments**
| Поле | Тип | Обмеження |
|------|-----|-----------|
| id | INTEGER | PRIMARY KEY |
| postId | INTEGER | NOT NULL, FK → Posts.id |
| userId | INTEGER | NOT NULL, FK → Users.id |
| text | TEXT | NOT NULL |
| createdAt | TEXT | NOT NULL |

### Зв'язки
- User має багато Posts (1:N) — ON DELETE CASCADE
- Post має багато Comments (1:N) — ON DELETE CASCADE
- User має багато Comments (1:N) — ON DELETE RESTRICT

### Обмеження
- NOT NULL — всі обов'язкові поля
- UNIQUE — email користувача
- FOREIGN KEY — зв'язки між таблицями
- PRAGMA foreign_keys = ON — увімкнено перевірку FK

## Міграції

Міграції знаходяться в папці `migrations/`:
 `001_init_users.sql` — створення таблиці Users
 `002_init_posts.sql` — створення таблиці Posts
 `003_init_comments.sql` — створення таблиці Comments
 `004_add_indexes.sql` — індекси для прискорення пошуку
 `005_add_email_to_users.sql` — додавання колонки email
 `006_add_unique_email.sql` — унікальний індекс на email

При старті застосунок застосовує тільки ті міграції яких ще немає в таблиці `schema_migrations`.

## Індекси

 `idx_posts_userId` — прискорює пошук постів по userId
 `idx_comments_postId` — прискорює пошук коментарів по postId

## Ендпоінти

### Users
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id

### Posts
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
PUT    /api/posts/:id
DELETE /api/posts/:id

### Comments
GET    /api/comments
GET    /api/comments/:id
POST   /api/comments
PUT    /api/comments/:id
DELETE /api/comments/:id

### Додаткові
GET  /api/posts-with-authors        # JOIN: пости з авторами
GET  /api/stats/posts-per-user      # Агрегація: кількість постів
GET  /api/search/posts?q=текст      # Пошук через LIKE
POST /api/users-with-post           # Операція на кілька таблиць

## Приклади запитів

Всі приклади curl команд знаходяться у файлі `command.txt`.

## SQL Injection демонстрація

Endpoint `/api/search/posts` використовує рядкову конкатенацію:
```sql
WHERE title LIKE '%${q}%'
```

Це небезпечно бо користувацький ввід вставляється прямо в SQL без перевірки.

Приклад небезпечного вводу:
/api/search/posts?q=' OR '1'='1

Запит стає:
```sql
WHERE title LIKE '%' OR '1'='1'%'
```

Умова `'1'='1'` завжди true — повертає всі записи незалежно від фільтра. Виправлення через параметризовані запити буде реалізоване в лабораторній роботі №5.

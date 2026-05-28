# REPORT — Лабораторна робота №5

## Таблиця ризиків

| Уразливість | Наслідок | Виправлення |
|-------------|----------|-------------|
| SQL Injection | Зловмисник отримує всі дані з БД | Параметризовані запити |
| XSS (Stored) | Шкідливий JS виконується в браузері | textContent замість innerHTML |
| IDOR | Доступ до чужих нотаток за id | Перевірка ownerUserId на бекенді |
| Misconfiguration | Витік dev-деталей, відсутність захисних заголовків | Security headers, clean errors, CORS whitelist |

---

## Сценарій А — SQL Injection

**Було:** рядок `q` вставлявся прямо в SQL через шаблонний рядок:
```typescript
const sql = `SELECT * FROM Posts WHERE title LIKE '%${q}%'`;
const rows = await all(sql);
```

**Відтворення:**
curl "http://localhost:3000/api/v1/search/posts?q=%27%20OR%20%271%27%3D%271"
Результат — повертались ВСІ пости бо умова `'1'='1'` завжди true.

**Виправлення:** параметризований запит:
```typescript
const sql = `SELECT * FROM Posts WHERE title LIKE ? ORDER BY id DESC;`;
const rows = await all(sql, [`%${q}%`]);
```

**Перевірка:**
curl "http://localhost:3000/api/v1/search/posts?q=First"
curl "http://localhost:3000/api/v1/search/posts?q=%27%20OR%20%271%27%3D%271"
Після виправлення — ін'єкція повертає порожній масив, нормальний пошук працює.

---

## Сценарій Б — XSS (Stored)

**Було:** дані користувача вставлялись через `innerHTML`:
```typescript
tr.innerHTML = `<td>${post.title}</td>`;
content.innerHTML = `<h3>${post.title}</h3>`;
```

**Відтворення:** створити пост з назвою `<img src=x onerror="alert('XSS')">` — браузер виконував JS.

**Виправлення:** DOM API + `textContent`:
```typescript
const tdTitle = document.createElement('td');
tdTitle.textContent = post.title;
```

**Перевірка:** той самий пост після виправлення — назва відображається як текст, alert не спрацьовує.

---

## Сценарій В — IDOR

**Було:** будь-який запит до `/api/v1/notes/:id` без перевірки власника.

**Відтворення:**
curl http://localhost:3000/api/v1/notes/1 -H "X-Demo-UserId: 2"
Юзер 2 отримував нотатку юзера 1.

**Виправлення:** middleware `demoAuth` + перевірка `ownerUserId` на кожній операції:
```typescript
if (note.ownerUserId !== req.currentUser!.id) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Note not found' } });
}
```

**Перевірка:**
curl http://localhost:3000/api/v1/notes/1
curl http://localhost:3000/api/v1/notes/1 -H "X-Demo-UserId: 1"
curl http://localhost:3000/api/v1/notes/1 -H "X-Demo-UserId: 2"
curl -X DELETE http://localhost:3000/api/v1/notes/1 -H "X-Demo-UserId: 2"
Без заголовка — 401. Свій ресурс — OK. Чужий — 404.

---

## Сценарій Г — Security Misconfiguration

**Було:** відсутні захисні заголовки, stack trace в помилках 500, `X-Demo-UserId` не в CORS.

**Виправлення:**
```typescript
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    next();
});
```
```typescript
const isDev = process.env.NODE_ENV !== 'production';
details: status >= 500 && !isDev ? [] : (err.details ?? [])
```
```typescript
allowedHeaders: ['Content-Type', 'Authorization', 'X-Demo-UserId']
```

**Перевірка:**
curl -I http://localhost:3000/api/v1/users
Відповідь містить: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`.

---

## Висновок

Всі 4 сценарії виконані за принципом «було → відтворення → виправлення → перевірка»:

- Параметризовані SQL запити замість конкатенації
- DOM API + `textContent` замість `innerHTML`
- Серверна перевірка прав через `demoAuth` + `ownerUserId`
- Security headers і clean errors без dev-деталей в production

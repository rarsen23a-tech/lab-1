import type { UserDto, PostDto, CommentDto } from './dtos.js';

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function showNotice(text: string, isError = false): void {
    const el = document.getElementById('notice');
    if (!el) return;
    el.innerHTML = text;
    el.className = isError ? 'notice error' : 'notice success';
    setTimeout(() => {
        el.innerHTML = '';
        el.className = 'notice';
    }, 4000);
}

export function renderStatus(containerId: string, status: 'loading' | 'empty' | 'error' | 'success', error?: string): void {
    const el = document.getElementById(containerId);
    if (!el) return;
    if (status === 'loading') el.innerHTML = '<p class="status-loading">Завантаження...</p>';
    else if (status === 'empty') el.innerHTML = '<p class="status-empty">Немає даних</p>';
    else if (status === 'error') el.innerHTML = `<p class="status-error">Помилка: ${error ?? 'невідома'}</p>`;
    else el.innerHTML = '';
}

export function renderUsersTable(users: UserDto[]): void {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email ?? '—'}</td>
            <td>${user.username ?? '—'}</td>
            <td>${user.role ?? '—'}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button type="button" class="delete-user-btn btn-danger" data-id="${user.id}">Видалити</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderUsersToSelect(users: UserDto[]): void {
    const selects = document.querySelectorAll<HTMLSelectElement>('.author-select');
    selects.forEach(select => {
        const currentVal = select.value;
        select.innerHTML = '<option value="">-- Оберіть автора --</option>';
        users.forEach(user => {
            const option = document.createElement('option');
            option.value = String(user.id);
            option.textContent = user.name;
            select.appendChild(option);
        });
        select.value = currentVal;
    });
}

export function renderPostsTable(posts: PostDto[], users: UserDto[]): void {
    const tbody = document.getElementById('postsBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    posts.forEach(post => {
        const user = users.find(u => u.id === post.userId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.category ?? '—'}</td>
            <td>${user ? user.name : '—'}</td>
            <td>${formatDate(post.createdAt)}</td>
            <td>
                <button type="button" class="view-post-btn btn-secondary" data-id="${post.id}">Переглянути</button>
                <button type="button" class="edit-post-btn btn-primary" data-id="${post.id}">Редагувати</button>
                <button type="button" class="delete-post-btn btn-danger" data-id="${post.id}">Видалити</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

export function renderPostModal(post: PostDto, users: UserDto[], comments: CommentDto[]): void {
    const user = users.find(u => u.id === post.userId);
    const content = document.getElementById('viewContent');
    if (!content) return;

    const commentsHtml = comments.length === 0
        ? '<p>Немає коментарів</p>'
        : comments.map(c => {
            const commentUser = users.find(u => u.id === c.userId);
            return `
                <div class="comment">
                    <p><b>${commentUser ? commentUser.name : '—'}:</b> ${c.text}</p>
                    <small>${formatDate(c.createdAt)}</small>
                    <button type="button" class="delete-comment-btn btn-danger" data-id="${c.id}">Видалити</button>
                </div>
            `;
        }).join('');

    content.innerHTML = `
        <h3>${post.title}</h3>
        <p><b>Категорія:</b> ${post.category ?? '—'}</p>
        <p><b>Автор:</b> ${user ? user.name : '—'}</p>
        <p><b>Створено:</b> ${formatDate(post.createdAt)}</p>
        <hr>
        <p>${post.content}</p>
        <hr>
        <h4>Коментарі</h4>
        ${commentsHtml}
        <div class="comment-form">
            <h4>Додати коментар</h4>
            <select id="commentAuthor" class="author-select">
                <option value="">-- Оберіть автора --</option>
            </select>
            <small class="error" id="commentAuthorError"></small>
            <textarea id="commentText" placeholder="Текст коментаря"></textarea>
            <small class="error" id="commentTextError"></small>
            <button type="button" id="addCommentBtn">Додати коментар</button>
        </div>
    `;
}
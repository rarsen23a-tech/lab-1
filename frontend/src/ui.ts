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
    el.textContent = text;
    el.className = isError ? 'notice error' : 'notice success';
    setTimeout(() => {
        el.textContent = '';
        el.className = 'notice';
    }, 4000);
}

export function renderStatus(containerId: string, status: 'loading' | 'empty' | 'error' | 'success', error?: string): void {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = '';
    if (status === 'loading') {
        const p = document.createElement('p');
        p.className = 'status-loading';
        p.textContent = 'Завантаження...';
        el.appendChild(p);
    } else if (status === 'empty') {
        const p = document.createElement('p');
        p.className = 'status-empty';
        p.textContent = 'Немає даних';
        el.appendChild(p);
    } else if (status === 'error') {
        const p = document.createElement('p');
        p.className = 'status-error';
        p.textContent = `Помилка: ${error ?? 'невідома'}`;
        el.appendChild(p);
    }
}

export function renderUsersTable(users: UserDto[]): void {
    const tbody = document.getElementById('usersBody');
    if (!tbody) return;
    tbody.innerHTML = '';
    users.forEach(user => {
        const tr = document.createElement('tr');

        const tdId = document.createElement('td');
        tdId.textContent = String(user.id);

        const tdName = document.createElement('td');
        tdName.textContent = user.name;

        const tdEmail = document.createElement('td');
        tdEmail.textContent = user.email ?? '—';

        const tdUsername = document.createElement('td');
        tdUsername.textContent = user.username ?? '—';

        const tdRole = document.createElement('td');
        tdRole.textContent = user.role ?? '—';

        const tdDate = document.createElement('td');
        tdDate.textContent = formatDate(user.createdAt);

        const tdActions = document.createElement('td');
        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-user-btn btn-danger';
        deleteBtn.dataset.id = String(user.id);
        deleteBtn.textContent = 'Видалити';
        tdActions.appendChild(deleteBtn);

        tr.append(tdId, tdName, tdEmail, tdUsername, tdRole, tdDate, tdActions);
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

        const tdId = document.createElement('td');
        tdId.textContent = String(post.id);

        const tdTitle = document.createElement('td');
        tdTitle.textContent = post.title;

        const tdCategory = document.createElement('td');
        tdCategory.textContent = post.category ?? '—';

        const tdAuthor = document.createElement('td');
        tdAuthor.textContent = user ? user.name : '—';

        const tdDate = document.createElement('td');
        tdDate.textContent = formatDate(post.createdAt);

        const tdActions = document.createElement('td');

        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.className = 'view-post-btn btn-secondary';
        viewBtn.dataset.id = String(post.id);
        viewBtn.textContent = 'Переглянути';

        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.className = 'edit-post-btn btn-primary';
        editBtn.dataset.id = String(post.id);
        editBtn.textContent = 'Редагувати';

        const deleteBtn = document.createElement('button');
        deleteBtn.type = 'button';
        deleteBtn.className = 'delete-post-btn btn-danger';
        deleteBtn.dataset.id = String(post.id);
        deleteBtn.textContent = 'Видалити';

        tdActions.append(viewBtn, editBtn, deleteBtn);
        tr.append(tdId, tdTitle, tdCategory, tdAuthor, tdDate, tdActions);
        tbody.appendChild(tr);
    });
}

export function renderPostModal(post: PostDto, users: UserDto[], comments: CommentDto[]): void {
    const user = users.find(u => u.id === post.userId);
    const content = document.getElementById('viewContent');
    if (!content) return;
    content.innerHTML = '';

    // Заголовок
    const h3 = document.createElement('h3');
    h3.textContent = post.title;

    const pCategory = document.createElement('p');
    const bCategory = document.createElement('b');
    bCategory.textContent = 'Категорія: ';
    pCategory.appendChild(bCategory);
    pCategory.append(post.category ?? '—');

    const pAuthor = document.createElement('p');
    const bAuthor = document.createElement('b');
    bAuthor.textContent = 'Автор: ';
    pAuthor.appendChild(bAuthor);
    pAuthor.append(user ? user.name : '—');

    const pDate = document.createElement('p');
    const bDate = document.createElement('b');
    bDate.textContent = 'Створено: ';
    pDate.appendChild(bDate);
    pDate.append(formatDate(post.createdAt));

    const hr1 = document.createElement('hr');

    const pContent = document.createElement('p');
    pContent.textContent = post.content;

    const hr2 = document.createElement('hr');

    const h4Comments = document.createElement('h4');
    h4Comments.textContent = 'Коментарі';

    content.append(h3, pCategory, pAuthor, pDate, hr1, pContent, hr2, h4Comments);

    // Коментарі
    if (comments.length === 0) {
        const p = document.createElement('p');
        p.textContent = 'Немає коментарів';
        content.appendChild(p);
    } else {
        comments.forEach(c => {
            const commentUser = users.find(u => u.id === c.userId);
            const div = document.createElement('div');
            div.className = 'comment';

            const p = document.createElement('p');
            const b = document.createElement('b');
            b.textContent = `${commentUser ? commentUser.name : '—'}: `;
            p.appendChild(b);
            p.append(c.text);

            const small = document.createElement('small');
            small.textContent = formatDate(c.createdAt);

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'delete-comment-btn btn-danger';
            deleteBtn.dataset.id = String(c.id);
            deleteBtn.textContent = 'Видалити';

            div.append(p, small, deleteBtn);
            content.appendChild(div);
        });
    }

    // Форма коментаря
    const commentForm = document.createElement('div');
    commentForm.className = 'comment-form';

    const h4Add = document.createElement('h4');
    h4Add.textContent = 'Додати коментар';

    const select = document.createElement('select');
    select.id = 'commentAuthor';
    select.className = 'author-select';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Оберіть автора --';
    select.appendChild(defaultOption);

    const authorErr = document.createElement('small');
    authorErr.className = 'error';
    authorErr.id = 'commentAuthorError';

    const textarea = document.createElement('textarea');
    textarea.id = 'commentText';
    textarea.placeholder = 'Текст коментаря';

    const textErr = document.createElement('small');
    textErr.className = 'error';
    textErr.id = 'commentTextError';

    const addBtn = document.createElement('button');
    addBtn.type = 'button';
    addBtn.id = 'addCommentBtn';
    addBtn.textContent = 'Додати коментар';

    commentForm.append(h4Add, select, authorErr, textarea, textErr, addBtn);
    content.appendChild(commentForm);
}

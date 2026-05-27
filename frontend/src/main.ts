import * as api from './apiClient.js';
import * as ui from './ui.js';
import type { PostDto, UserDto } from './dtos.js';

// STATE
let users: UserDto[] = [];
let posts: PostDto[] = [];
let editingPostId: number | null = null;
let currentViewPostId: number | null = null;

// ELEMENTS
const userForm = document.getElementById('userForm') as HTMLFormElement;
const postForm = document.getElementById('postForm') as HTMLFormElement;
const postsBody = document.getElementById('postsBody') as HTMLTableSectionElement;
const viewModal = document.getElementById('viewModal') as HTMLDivElement;
const closeViewBtn = document.getElementById('closeViewBtn') as HTMLButtonElement;
const cancelEditBtn = document.getElementById('cancelEditBtn') as HTMLButtonElement;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;
const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
const postSubmitBtn = postForm.querySelector('button[type="submit"]') as HTMLButtonElement;

// LOAD USERS
async function loadUsers(): Promise<void> {
    renderStatus('usersStatus', 'loading');
    try {
        const result = await api.getUsers(1, 100);
        users = result.items;
        if (users.length === 0) {
            renderStatus('usersStatus', 'empty');
        } else {
            renderStatus('usersStatus', 'success');
        }
        ui.renderUsersTable(users);
        ui.renderUsersToSelect(users);
    } catch (e: unknown) {
        const err = e as { message?: string };
        renderStatus('usersStatus', 'error', err.message);
    }
}

// LOAD POSTS
async function loadPosts(): Promise<void> {
    renderStatus('postsStatus', 'loading');
    try {
        const result = await api.getPosts(1, 100);
        posts = result.items;
        if (posts.length === 0) {
            renderStatus('postsStatus', 'empty');
        } else {
            renderStatus('postsStatus', 'success');
        }
        renderFilteredPosts();
    } catch (e: unknown) {
        const err = e as { message?: string };
        renderStatus('postsStatus', 'error', err.message);
    }
}

// RENDER STATUS
function renderStatus(id: string, status: 'loading' | 'empty' | 'error' | 'success', error?: string): void {
    ui.renderStatus(id, status, error);
}

// RENDER FILTERED POSTS
function renderFilteredPosts(): void {
    const q = searchInput.value.trim().toLowerCase();
    const sortBy = sortSelect.value;

    let filtered = [...posts];

    if (q) {
        filtered = filtered.filter(p => {
            const user = users.find(u => u.id === p.userId);
            return (
                p.title.toLowerCase().includes(q) ||
                p.content.toLowerCase().includes(q) ||
                (p.category ? p.category.toLowerCase().includes(q) : false) ||
                (user ? user.name.toLowerCase().includes(q) : false)
            );
        });
    }

    switch (sortBy) {
        case 'dateAsc':
            filtered.sort((a, b) => a.id - b.id);
            break;
        case 'dateDesc':
            filtered.sort((a, b) => b.id - a.id);
            break;
        case 'authorAsc':
            filtered.sort((a, b) => {
                const ua = users.find(u => u.id === a.userId)?.name ?? '';
                const ub = users.find(u => u.id === b.userId)?.name ?? '';
                return ua.localeCompare(ub);
            });
            break;
        case 'authorDesc':
            filtered.sort((a, b) => {
                const ua = users.find(u => u.id === a.userId)?.name ?? '';
                const ub = users.find(u => u.id === b.userId)?.name ?? '';
                return ub.localeCompare(ua);
            });
            break;
    }

    ui.renderPostsTable(filtered, users);
}

// USER FORM
userForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = (document.getElementById('userName') as HTMLInputElement).value.trim();
    const email = (document.getElementById('userEmail') as HTMLInputElement).value.trim();
    const username = (document.getElementById('userUsername') as HTMLInputElement).value.trim();
    const role = (document.getElementById('userRole') as HTMLSelectElement).value;

    let valid = true;

    const nameErr = document.getElementById('userNameError') as HTMLElement;
    const emailErr = document.getElementById('userEmailError') as HTMLElement;
    const usernameErr = document.getElementById('userUsernameError') as HTMLElement;
    const roleErr = document.getElementById('userRoleError') as HTMLElement;

    nameErr.textContent = '';
    emailErr.textContent = '';
    usernameErr.textContent = '';
    roleErr.textContent = '';

    if (!name || name.length < 3) {
        nameErr.textContent = "Ім'я обов'язкове (мінімум 3 символи)";
        valid = false;
    }
    if (!email || !email.includes('@')) {
        emailErr.textContent = 'Невірний email';
        valid = false;
    }
    if (!username || username.length < 3) {
        usernameErr.textContent = 'Мінімум 3 символи';
        valid = false;
    }
    if (!role) {
        roleErr.textContent = 'Оберіть роль';
        valid = false;
    }

    if (!valid) return;

    const submitBtn = userForm.querySelector('button[type="submit"]') as HTMLButtonElement;
    submitBtn.disabled = true;

    try {
        await api.createUser({ name, email, username, role });
        ui.showNotice('Користувача додано!');
        userForm.reset();
        await loadUsers();
    } catch (err: unknown) {
        const e = err as { message?: string };
        ui.showNotice(`Помилка: ${e.message ?? 'невідома'}`, true);
    } finally {
        submitBtn.disabled = false;
    }
});

// POST FORM
postForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = (document.getElementById('title') as HTMLInputElement).value.trim();
    const content = (document.getElementById('body') as HTMLTextAreaElement).value.trim();
    const category = (document.getElementById('category') as HTMLSelectElement).value || undefined;
    const userId = Number((document.getElementById('author') as HTMLSelectElement).value);

    let valid = true;

    const titleErr = document.getElementById('titleError') as HTMLElement;
    const bodyErr = document.getElementById('bodyError') as HTMLElement;
    const authorErr = document.getElementById('authorError') as HTMLElement;

    titleErr.textContent = '';
    bodyErr.textContent = '';
    authorErr.textContent = '';

    if (!title) { titleErr.textContent = "Назва обов'язкова"; valid = false; }
    if (!content) { bodyErr.textContent = "Текст обов'язковий"; valid = false; }
    if (!userId) { authorErr.textContent = "Автор обов'язковий"; valid = false; }

    if (!valid) return;

    postSubmitBtn.disabled = true;

    try {
        if (editingPostId) {
            await api.updatePost(editingPostId, { title, content, category });
            ui.showNotice('Пост оновлено!');
            editingPostId = null;
            cancelEditBtn.style.display = 'none';
            postSubmitBtn.textContent = 'Додати';
        } else {
            await api.createPost({ title, content, category, userId });
            ui.showNotice('Пост додано!');
        }
        postForm.reset();
        await loadPosts();
    } catch (err: unknown) {
        const e = err as { message?: string };
        ui.showNotice(`Помилка: ${e.message ?? 'невідома'}`, true);
    } finally {
        postSubmitBtn.disabled = false;
    }
});

// CANCEL EDIT
cancelEditBtn.addEventListener('click', () => {
    editingPostId = null;
    postForm.reset();
    cancelEditBtn.style.display = 'none';
    postSubmitBtn.textContent = 'Додати';
});

// CLEAR FORMS
document.getElementById('clearUserFormBtn')?.addEventListener('click', () => {
    userForm.reset();
    document.getElementById('userNameError')!.textContent = '';
    document.getElementById('userEmailError')!.textContent = '';
    document.getElementById('userUsernameError')!.textContent = '';
    document.getElementById('userRoleError')!.textContent = '';
});

document.getElementById('clearPostFormBtn')?.addEventListener('click', () => {
    postForm.reset();
    editingPostId = null;
    cancelEditBtn.style.display = 'none';
    postSubmitBtn.textContent = 'Додати';
    document.getElementById('titleError')!.textContent = '';
    document.getElementById('bodyError')!.textContent = '';
    document.getElementById('authorError')!.textContent = '';
});

// TABLE CLICK
postsBody.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const id = Number(target.dataset.id);

    if (target.classList.contains('delete-post-btn')) {
        if (!confirm('Видалити пост?')) return;
        try {
            await api.deletePost(id);
            ui.showNotice('Пост видалено!');
            await loadPosts();
        } catch (err: unknown) {
            const e = err as { message?: string };
            ui.showNotice(`Помилка: ${e.message ?? 'невідома'}`, true);
        }
    }

    if (target.classList.contains('edit-post-btn')) {
        const post = posts.find(p => p.id === id);
        if (!post) return;
        (document.getElementById('title') as HTMLInputElement).value = post.title;
        (document.getElementById('body') as HTMLTextAreaElement).value = post.content;
        (document.getElementById('category') as HTMLSelectElement).value = post.category ?? '';
        (document.getElementById('author') as HTMLSelectElement).value = String(post.userId);
        editingPostId = id;
        cancelEditBtn.style.display = 'inline-block';
        postSubmitBtn.textContent = 'Зберегти зміни';
    }

    if (target.classList.contains('view-post-btn')) {
        currentViewPostId = id;
        await openPostModal(id);
    }
});

// OPEN POST MODAL
async function openPostModal(postId: number): Promise<void> {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
        const commentsResult = await api.getComments(postId);
        ui.renderPostModal(post, users, commentsResult.items);
        viewModal.style.display = 'flex';

       
        ui.renderUsersToSelect(users);

        const addCommentBtn = document.getElementById('addCommentBtn');
        if (addCommentBtn) {
            const newBtn = addCommentBtn.cloneNode(true) as HTMLButtonElement;
            addCommentBtn.parentNode?.replaceChild(newBtn, addCommentBtn);

            
            ui.renderUsersToSelect(users);

            newBtn.addEventListener('click', async () => {
                const commentAuthor = Number((document.getElementById('commentAuthor') as HTMLSelectElement).value);
                const commentText = (document.getElementById('commentText') as HTMLTextAreaElement).value.trim();

                const authorErr = document.getElementById('commentAuthorError') as HTMLElement;
                const textErr = document.getElementById('commentTextError') as HTMLElement;

                authorErr.textContent = '';
                textErr.textContent = '';

                let valid = true;
                if (!commentAuthor) { authorErr.textContent = 'Оберіть автора'; valid = false; }
                if (!commentText) { textErr.textContent = 'Текст обов\'язковий'; valid = false; }
                if (!valid) return;

                try {
                    await api.createComment({ postId, userId: commentAuthor, text: commentText });
                    ui.showNotice('Коментар додано!');
                    await openPostModal(postId);
                } catch (err: unknown) {
                    const e = err as { message?: string };
                    ui.showNotice(`Помилка: ${e.message ?? 'невідома'}`, true);
                }
            });
        }

        const viewContent = document.getElementById('viewContent');
        if (viewContent) {
            viewContent.addEventListener('click', async (e) => {
                const target = e.target as HTMLElement;
                if (target.classList.contains('delete-comment-btn')) {
                    const commentId = Number(target.dataset.id);
                    try {
                        await api.deleteComment(commentId);
                        ui.showNotice('Коментар видалено!');
                        await openPostModal(postId);
                    } catch (err: unknown) {
                        const e = err as { message?: string };
                        ui.showNotice(`Помилка: ${e.message ?? 'невідома'}`, true);
                    }
                }
            }, { once: true });
        }

    } catch (err: unknown) {
        const e = err as { message?: string };
        ui.showNotice(`Помилка: ${e.message ?? 'невідома'}`, true);
    }
}

// USERS TABLE CLICK
document.getElementById('usersBody')?.addEventListener('click', async (e) => {
    const target = e.target as HTMLElement;
    const id = Number(target.dataset.id);

    if (target.classList.contains('delete-user-btn')) {
        if (!confirm('Видалити користувача?')) return;
        try {
            await api.deleteUser(id);
            ui.showNotice('Користувача видалено!');
            await loadUsers();
            await loadPosts();
        } catch (err: unknown) {
            const e = err as { message?: string };
            ui.showNotice(`Помилка: ${e.message ?? 'невідома'}`, true);
        }
    }
});

// CLOSE MODAL
closeViewBtn.addEventListener('click', () => {
    viewModal.style.display = 'none';
    currentViewPostId = null;
});

// SEARCH AND SORT
searchInput.addEventListener('input', renderFilteredPosts);
sortSelect.addEventListener('change', renderFilteredPosts);

// INIT
(async () => {
    await loadUsers();
    await loadPosts();
})();

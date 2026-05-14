// STATE 
const STORAGE_KEY = "posts_storage_v1";
const COUNTER_KEY = "posts_id_counter";
const USERS_STORAGE_KEY = "users_storage_v1";

const state = {
    posts: [],
    searchQuery: "",
    sortBy: "none"
};

let users = [];

let editingPostId = null;
let postIdCounter = 1;

// ELEMENTS 
const form = document.getElementById("postForm");
const postsBody = document.getElementById("postsBody");
const submitBtn = form.querySelector('button[type="submit"]');
const cancelEditBtn = document.getElementById("cancelEditBtn");

const viewModal = document.getElementById("viewModal");
const viewContent = document.getElementById("viewContent");
const closeViewBtn = document.getElementById("closeViewBtn");

const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

// USERS FORM
const userForm = document.getElementById("userForm");

// CANCEL EDIT 
cancelEditBtn.addEventListener("click", () => {
    editingPostId = null;
    form.reset();
    clearErrors();

    cancelEditBtn.style.display = "none";
    submitBtn.textContent = "Додати";

    form.title.focus();
});

// HELPERS 
function readForm() {
    return {
        title: form.title.value.trim(),
        category: form.category.value,
        body: form.body.value.trim(),
        author: form.author.value
    };
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(e => e.textContent = "");
    document.querySelectorAll(".invalid").forEach(el => el.classList.remove("invalid"));
}

function setError(fieldName, message) {
    const errorEl = document.getElementById(fieldName + "Error");
    const input = form[fieldName];

    errorEl.textContent = message;
    input.classList.add("invalid");
}

function validate(data) {
    clearErrors();
    let valid = true;

    if (!data.title) {
        setError("title", "Назва обов'язкова");
        valid = false;
    }

    if (!data.category) {
        setError("category", "Оберіть категорію");
        valid = false;
    }

    if (!data.body) {
        setError("body", "Текст обов'язковий");
        valid = false;
    }

    if (!data.author) {
        setError("author", "Автор обов'язковий");
        valid = false;
    }

    return valid;
}

// LOCAL STORAGE 
function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.posts));
    localStorage.setItem(COUNTER_KEY, postIdCounter);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    const counter = localStorage.getItem(COUNTER_KEY);
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);

    if (data) {
        try {
            state.posts = JSON.parse(data);
        } catch {
            state.posts = [];
        }
    }

    if (counter) {
        postIdCounter = Number(counter);
    }

    if (usersData) {
        try {
            users = JSON.parse(usersData);
        } catch {
            users = [];
        }
    }
}

// USERS 
function renderUsersToSelect() {
    const select = document.getElementById("author");

    select.innerHTML = '<option value="">-- Оберіть автора --</option>';

    users.forEach(user => {
        const option = document.createElement("option");
        option.value = user.id;
        option.textContent = user.name;
        select.appendChild(option);
    });
}

userForm.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("userName");
    const email = document.getElementById("userEmail");
    const username = document.getElementById("userUsername");
    const role = document.getElementById("userRole");

    let valid = true;

    if (!name.value.trim()) {
        document.getElementById("userNameError").textContent = "Обов'язково";
        name.classList.add("invalid");
        valid = false;
    } else {
        document.getElementById("userNameError").textContent = "";
        name.classList.remove("invalid");
    }

    if (!email.value.includes("@")) {
        document.getElementById("userEmailError").textContent = "Невірний email";
        email.classList.add("invalid");
        valid = false;
    } else {
        document.getElementById("userEmailError").textContent = "";
        email.classList.remove("invalid");
    }

    if (username.value.length < 3) {
        document.getElementById("userUsernameError").textContent = "Мінімум 3 символи";
        username.classList.add("invalid");
        valid = false;
    } else {
        document.getElementById("userUsernameError").textContent = "";
        username.classList.remove("invalid");
    }

    if (!role.value) {
        document.getElementById("userRoleError").textContent = "Оберіть роль";
        role.classList.add("invalid");
        valid = false;
    } else {
        document.getElementById("userRoleError").textContent = "";
        role.classList.remove("invalid");
    }

    if (!valid) return;

    const newUser = {
        id: Date.now(),
        name: name.value,
        email: email.value,
        username: username.value,
        role: role.value
    };

    users.push(newUser);

    saveToStorage();
    renderUsersToSelect();

    this.reset();
});

// CRUD 
function addPost(data) {
    const post = {
        id: postIdCounter,
        ...data,
        createdAt: new Date().toLocaleString("uk-UA")
    };

    state.posts.push(post);
    postIdCounter++;

    saveToStorage();
}

function deletePost(id) {
    state.posts = state.posts.filter(p => p.id !== id);
    saveToStorage();
    render();
}

function startEditPost(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;

    form.title.value = post.title;
    form.category.value = post.category;
    form.body.value = post.body;
    form.author.value = post.author;

    editingPostId = id;

    cancelEditBtn.style.display = "inline-block";
    submitBtn.textContent = "Зберегти зміни";

    form.title.focus();
}

// VIEW POST
function viewPost(id) {
    const post = state.posts.find(p => p.id === id);
    if (!post) return;

    const user = users.find(u => u.id == post.author);

    viewContent.innerHTML = `
        <h3>${post.title}</h3>
        <p><b>Категорія:</b> ${post.category}</p>
        <p><b>Автор:</b> ${user ? user.name : "—"}</p>
        <p><b>Створено:</b> ${post.createdAt}</p>
        <hr>
        <p>${post.body}</p>
    `;

    viewModal.style.display = "block";
}

closeViewBtn.addEventListener("click", () => {
    viewModal.style.display = "none";
});

// SEARCH AND SORT 
function getProcessedPosts() {
    let result = [...state.posts];

    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();

        result = result.filter(p => {
            const user = users.find(u => u.id == p.author);
            const authorName = user ? user.name : "";

            return (
                p.title.toLowerCase().includes(q) ||
                p.body.toLowerCase().includes(q) ||
                authorName.toLowerCase().includes(q)
            );
        });
    }

    switch (state.sortBy) {
        case "dateAsc":
            result.sort((a, b) => a.id - b.id);
            break;
        case "dateDesc":
            result.sort((a, b) => b.id - a.id);
            break;
    }

    return result;
}

// RENDER
function render() {
    postsBody.innerHTML = "";

    const postsToShow = getProcessedPosts();

    postsToShow.forEach(post => {
        const user = users.find(u => u.id == post.author);

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.category}</td>
            <td>${user ? user.name : "—"}</td>
            <td>${post.createdAt}</td>
            <td>
                <button type="button" data-id="${post.id}" class="view-btn">Переглянути</button>
                <button type="button" data-id="${post.id}" class="edit-btn">Редагувати</button>
                <button type="button" data-id="${post.id}" class="delete-btn">Видалити</button>
            </td>
        `;

        postsBody.appendChild(tr);
    });
}

// HANDLERS
function handleSubmit(event) {
    event.preventDefault();

    const data = readForm();
    if (!validate(data)) return;

    if (editingPostId) {
        const post = state.posts.find(p => p.id === editingPostId);

        if (!post) {
            alert("Цього посту вже не існує");
            editingPostId = null;
            form.reset();
            cancelEditBtn.style.display = "none";
            submitBtn.textContent = "Додати";
            render();
            return;
        }

        post.title = data.title;
        post.category = data.category;
        post.body = data.body;
        post.author = data.author;
        post.createdAt = new Date().toLocaleString("uk-UA");

        editingPostId = null;
    } else {
        addPost(data);
    }

    saveToStorage();
    render();

    form.reset();
    cancelEditBtn.style.display = "none";
    submitBtn.textContent = "Додати";

    form.title.focus();
}

function handleTableClick(event) {
    const id = Number(event.target.dataset.id);

    if (event.target.classList.contains("delete-btn")) {
        deletePost(id);
    }

    if (event.target.classList.contains("edit-btn")) {
        startEditPost(id);
    }

    if (event.target.classList.contains("view-btn")) {
        viewPost(id);
    }
}

// EVENTS 
form.addEventListener("submit", handleSubmit);
postsBody.addEventListener("click", handleTableClick);

searchInput.addEventListener("input", () => {
    state.searchQuery = searchInput.value.trim();
    render();
});

sortSelect.addEventListener("change", () => {
    state.sortBy = sortSelect.value;
    render();
});

// INIT 
loadFromStorage();
renderUsersToSelect();
render();
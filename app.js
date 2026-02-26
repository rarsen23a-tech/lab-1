// STATE 
const STORAGE_KEY = "posts_storage_v1";
const COUNTER_KEY = "posts_id_counter";

const state = {
    posts: [],
    searchQuery: "",
    sortBy: "none" // none | dateAsc | dateDesc | authorAsc | authorDesc
};

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

// NEW (search & sort)
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

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
        author: form.author.value.trim()
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
}

function loadFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    const counter = localStorage.getItem(COUNTER_KEY);

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
}

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

    viewContent.innerHTML = `
        <h3>${post.title}</h3>
        <p><b>Категорія:</b> ${post.category}</p>
        <p><b>Автор:</b> ${post.author}</p>
        <p><b>Створено:</b> ${post.createdAt}</p>
        <hr>
        <p>${post.body}</p>
    `;

    viewModal.style.display = "block";
}

closeViewBtn.addEventListener("click", () => {
    viewModal.style.display = "none";
});

//  SEARCH AND SORT LOGIC 
function getProcessedPosts() {
    let result = [...state.posts];

    // SEARCH
    if (state.searchQuery) {
        const q = state.searchQuery.toLowerCase();

        result = result.filter(p =>
            p.title.toLowerCase().includes(q) ||
            p.body.toLowerCase().includes(q) ||
            p.author.toLowerCase().includes(q)
        );
    }

    // SORT
    switch (state.sortBy) {
        case "dateAsc":
            result.sort((a, b) => a.id - b.id);
            break;
        case "dateDesc":
            result.sort((a, b) => b.id - a.id);
            break;
        case "authorAsc":
            result.sort((a, b) => a.author.localeCompare(b.author, "uk"));
            break;
        case "authorDesc":
            result.sort((a, b) => b.author.localeCompare(a.author, "uk"));
            break;
    }

    return result;
}

// RENDER
function render() {
    postsBody.innerHTML = "";

    const postsToShow = getProcessedPosts();

    postsToShow.forEach(post => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>${post.category}</td>
            <td>${post.author}</td>
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
render();
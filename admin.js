// ---------------- DARK MODE TOGGLE ----------------

const themeBtn = document.getElementById("themeToggle");
themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    themeBtn.textContent = 
        document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// ---------------- ADMIN LOGIC ----------------

const $ = id => document.getElementById(id);

const addBtn = $("addAdminBtn");
const nameInput = $("newAdminName");
const listContainer = document.querySelector(".admin-list");

addBtn.addEventListener("click", () => {
    const name = nameInput.value.trim();
    if (!name) return alert("Skriv et navn");

    const row = document.createElement("div");
    row.className = "admin-row";
    row.innerHTML = `
        <div class="admin-left">
            <img src="images/default.jpg" alt="">
            <strong>${name}</strong>
        </div>
        <div class="admin-right">
            Opprettet: ${new Date().toISOString().slice(0,10)}
            <button class="btn tiny remove-admin">🗑 Fjern</button>
        </div>
    `;

    listContainer.appendChild(row);
    nameInput.value = "";
});

document.addEventListener("click", e => {
    if (e.target.classList.contains("remove-admin")) {
        e.target.closest(".admin-row").remove();
    }
});
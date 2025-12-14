// ---------- Login ----------
document.getElementById("loginBtn").addEventListener("click", () => {
    const name = document.getElementById("loginName").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    const msg = document.getElementById("loginMessage");

    if (!name || !pass) {
        showError(msg, "Vennligst fyll ut alle feltene");
        return;
    }

    showSuccess(msg, "Innlogging vellykket ✔");
});

// ---------- Register ----------
document.getElementById("regBtn").addEventListener("click", () => {
    const name = document.getElementById("regName").value.trim();
    const pass = document.getElementById("regPass").value.trim();
    const pass2 = document.getElementById("regPass2").value.trim();
    const msg = document.getElementById("regMessage");

    if (!name || !pass || !pass2) {
        showError(msg, "Alle felt må fylles ut");
        return;
    }

    if (pass !== pass2) {
        showError(msg, "Passordene er ikke like ❌");
        shakeInputs(["regPass", "regPass2"]);
        return;
    }

    if (pass.length < 4) {
        showError(msg, "Passord må være minst 4 tegn");
        return;
    }

    showSuccess(msg, "Bruker registrert ✔");
});

// ---------- Helper-funksjoner ----------
function showError(element, text) {
    element.innerText = text;
    element.className = "msg error";
}

function showSuccess(element, text) {
    element.innerText = text;
    element.className = "msg success";
}

function shakeInputs(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 400);
    });
}

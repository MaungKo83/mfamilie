document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("menuToggle");
    const menu = document.getElementById("sideMenu");

    toggleBtn.addEventListener("click", () => {
        menu.classList.toggle("open");
    });
});


// clock + date

function updateDateTime() {
  const el = document.getElementById("datetime");
  if (!el) return;

  const now = new Date();

  const date = now.toLocaleDateString("no-NO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

  const time = now.toLocaleTimeString("no-NO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  // Use backticks for template literals
  el.textContent = `${date} ${time}`;
}

setInterval(updateDateTime, 1000);
updateDateTime();
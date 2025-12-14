// Safe: only run if toggle exists
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("light");
        themeToggle.textContent =
            document.body.classList.contains("light")
                ? "🌙 Mørk"
                : "☀️ Lys";
    });
}

  /* ===================================================================
   PRINT ENGINE
=================================================================== */
      document.addEventListener("DOMContentLoaded", () => {
        function getTimestamp() {
          return new Date().toLocaleString("no-NO");
        }

        window.addEventListener("beforeprint", () => {
          const ts = document.getElementById("printTimestamp");
          if (ts) ts.textContent = "Utskrevet: " + getTimestamp();
        });

        const modal = document.getElementById("printModal");
        const openBtn = document.getElementById("openPrint");
        const cancelBtn = document.getElementById("cancelPrint");
        const printNow = document.getElementById("printNow");
        const breakPerCard = document.getElementById("breakPerCard");

        if (openBtn) openBtn.onclick = () => (modal.style.display = "block");
        if (cancelBtn) cancelBtn.onclick = () => (modal.style.display = "none");

        function clearPrintArea() {
          const old = document.getElementById("printArea");
          if (old) old.remove();
        }

        function buildPrintArea(targets, breakPages) {
          clearPrintArea();

          const area = document.createElement("div");
          area.id = "printArea";

          targets.forEach((selector, i) => {
            const el = document.querySelector(selector);
            if (!el) return;

            const clone = el.cloneNode(true);
            if (breakPages && i > 0) clone.classList.add("page-break");
            clone.classList.add("print-section");

            area.appendChild(clone);
          });

          document.body.appendChild(area);
        }

        if (printNow) {
          printNow.onclick = () => {
            const selected = [
              ...document.querySelectorAll(".print-check:checked"),
            ].map((ch) => ch.dataset.target);

            if (selected.length === 0) {
              alert("Velg minst én seksjon.");
              return;
            }

            buildPrintArea(selected, breakPerCard.checked);
            window.print();
            modal.style.display = "none";
          };
        }
      });

      
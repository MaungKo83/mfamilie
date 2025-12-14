/* =========================================================
   STORAGE & DEFAULT STATE
======================================================== */
const STORAGE_KEY = "maung_dashboard_v2";

const defaultState = {
  routines: [],
  grocery: [],
  notes: [],
  meds: [],
  calendar: [],
  quick: [],
  quotes: [],
  birthdays: [],
  meals: [
    { day: "Man", frokost: "Havre", middag: "Fisk" },
    { day: "Tir", frokost: "Brød", middag: "Grønnsaker" },
    { day: "Ons", frokost: "Egg", middag: "Kylling" }
  ]
};

let state = { ...defaultState };

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw){
      const parsed = JSON.parse(raw);
      // merge with default to avoid missing keys
      state = { ...defaultState, ...parsed };
    } else {
      // first time: seed with defaults
      state = {...defaultState};
      saveState();
    }
  }catch(e){
    console.warn("Failed to load state:", e);
    state = {...defaultState};
  }
}
function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){
    console.warn("Failed to save state:", e);
  }
}

/* =========================================================
   RENDER HELPERS
   - renderList: renders array to container id
   - renderMeals: renders meals table
======================================================== */
function renderList(containerId, arr, emptyText = "Ingen", allowDelete = true, stateKey = null){
  const container = document.getElementById(containerId);
  container.innerHTML = "";
  if(!arr || arr.length === 0){
    container.innerHTML = `<em>${emptyText}</em>`;
    return;
  }
  arr.forEach((item, idx) => {
    const li = document.createElement('div');
    li.className = 'list-item';
    // item can be string or object (we only use string)
    const text = document.createElement('div');
    text.textContent = item;
    li.appendChild(text);
    if(allowDelete && stateKey){
      const btn = document.createElement('button');
      btn.className = 'del-btn';
      btn.title = 'Slett';
      btn.innerHTML = '<i class="fa-solid fa-trash"></i>';
      btn.addEventListener('click', () => {
        state[stateKey].splice(idx, 1);
        saveState();
        renderAll();
      });
      li.appendChild(btn);
    }
    container.appendChild(li);
  });
}

function renderMeals(){
  const tbody = document.getElementById('mealTbody');
  tbody.innerHTML = '';
  if(!Array.isArray(state.meals) || state.meals.length === 0){
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="4"><em>Ingen måltider</em></td>';
    tbody.appendChild(tr);
    return;
  }

  state.meals.forEach((m, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${m.day || ''}</td>
      <td>${m.frokost || ''}</td>
      <td>${m.middag || ''}</td>
      <td><button class="del-btn" title="Slett" data-idx="${i}"><i class="fa-solid fa-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
  });

  // attach delete handlers (delegation would also work)
  tbody.querySelectorAll('button.del-btn').forEach(b => {
    b.addEventListener('click', () => {
      const idx = Number(b.dataset.idx);
      if (!Number.isNaN(idx)) {
        state.meals.splice(idx, 1);
        saveState();
        renderMeals();
      }
    });
  });
}

function renderAll(){
  renderList('routineList', state.routines, 'Ingen rutiner', true, 'routines');
  renderList('groceryList', state.grocery, 'Ingen varer', true, 'grocery');
  // notesList is a div — allow delete and store as array
  renderList('notesList', state.notes, 'Ingen notater', true, 'notes');
  renderList('medList', state.meds, 'Ingen medisiner', true, 'meds');
  renderList('calendarList', state.calendar, 'Ingen hendelser', true, 'calendar');
  renderList('quickList', state.quick, 'Ingen', true, 'quick');
  renderList('birthdayList', state.birthdays, 'Ingen fødselsdager', true, 'birthdays');
  // quoteArea (using same renderer but displays quotes)
  renderList('quoteArea', state.quotes, 'Ingen sitat', true, 'quotes');
  renderMeals();
}

/* =========================================================
   ACTIONS (ADD / DELETE)
======================================================== */
function addRoutine(text){
  if(!text) return;
  state.routines.push(text);
  saveState();
  renderAll();
}

function addGrocery(text){
  if(!text) return;
  state.grocery.push(text);
  saveState();
  renderAll();
}

function addNote(text){
  if(!text) return;
  state.notes.push(text);
  saveState();
  renderAll();
}

function addMed(text){
  if(!text) return;
  state.meds.push(text);
  saveState();
  renderAll();
}

function addCalendar(date, time, text){
  if(!date || !text) return;
  const entry = time ? `${date} ${time} — ${text}` : `${date} — ${text}`;
  state.calendar.push(entry);
  saveState();
  renderAll();
}

function addQuick(text){
  if(!text) return;
  state.quick.push(text);
  saveState();
  renderAll();
}

function addQuote(text){
  if(!text) return;
  state.quotes.push(text);
  saveState();
  renderAll();
}

function addBday(name, date){
  if(!name || !date) return;
  state.birthdays.push(`${name} — ${date}`);
  saveState();
  renderAll();
}

function addMealFromInputs(){
  const day = document.getElementById('mealDay').value.trim();
  const frokost = document.getElementById('mealFrokost').value.trim();
  const middag = document.getElementById('mealMiddag').value.trim();
  if(!day || !frokost || !middag) return;
  state.meals.push({ day, frokost, middag });
  saveState();
  renderMeals();
  document.getElementById('mealDay').value = '';
  document.getElementById('mealFrokost').value = '';
  document.getElementById('mealMiddag').value = '';
}

/* =========================================================
   PRINT BUILDER
======================================================== */
function buildPrintArea(targets = [], breakPages = false, includeCover = false){
  let area = document.getElementById('printArea');
  if(!area){
    area = document.createElement('div');
    area.id = 'printArea';
    document.body.appendChild(area);
  }
  area.style.display = 'block';
  area.innerHTML = '';

  if(includeCover){
    const cover = document.createElement('div');
    cover.className = 'print-cover';
    cover.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh">
        <h1 style="font-size:36px;margin:0">Familien Oversikt</h1>
        <p style="font-size:18px;color:#444;margin-top:8px">${new Date().toLocaleDateString()}</p>
      </div>
    `;
    area.appendChild(cover);
  }

  targets.forEach((sel, idx) => {
    const el = document.querySelector(sel);
    if(!el) return;
    const wrap = document.createElement('div');
    wrap.className = 'print-section';
    if(breakPages && idx > 0) wrap.style.pageBreakBefore = 'always';
    const clone = el.cloneNode(true);
    // remove interactive controls
    clone.querySelectorAll('button,input,textarea,select').forEach(n => n.remove());
    wrap.appendChild(clone);
    area.appendChild(wrap);
  });
}

/* =========================================================
   BOOTSTRAP (attach event listeners)
======================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // load state
  loadState();

  // If meals not present or empty, seed defaults once
  if(!Array.isArray(state.meals) || state.meals.length === 0){
    state.meals = [...defaultState.meals];
    saveState();
  }

  // render first time
  renderAll();

  // buttons / inputs
  const routineText = document.getElementById('routineText');
  const addRoutineBtn = document.getElementById('addRoutineBtn');
  addRoutineBtn.addEventListener('click', () => { addRoutine(routineText.value.trim()); routineText.value = ''; });

  const groceryText = document.getElementById('groceryText');
  document.getElementById('addGroceryBtn').addEventListener('click', () => { addGrocery(groceryText.value.trim()); groceryText.value = ''; });

  const noteText = document.getElementById('noteText');
  document.getElementById('addNoteBtn').addEventListener('click', () => { addNote(noteText.value.trim()); noteText.value = ''; });

  const medText = document.getElementById('medText');
  document.getElementById('addMedBtn').addEventListener('click', () => { addMed(medText.value.trim()); medText.value = ''; });

  const calDate = document.getElementById('calDate');
  const calTime = document.getElementById('calTime');
  const calText = document.getElementById('calText');
  document.getElementById('addCalendarBtn').addEventListener('click', () => {
    addCalendar(calDate.value, calTime.value, calText.value.trim());
    calDate.value = ''; calTime.value = ''; calText.value = '';
  });

  const quickText = document.getElementById('quickText');
  document.getElementById('addQuickBtn').addEventListener('click', () => { addQuick(quickText.value.trim()); quickText.value = ''; });

  const quoteText = document.getElementById('quoteText');
  document.getElementById('addQuoteBtn').addEventListener('click', () => { addQuote(quoteText.value.trim()); quoteText.value = ''; });

  const bdayName = document.getElementById('bdayName');
  const bdayDate = document.getElementById('bdayDate');
  document.getElementById('addBdayBtn').addEventListener('click', () => { addBday(bdayName.value.trim(), bdayDate.value); bdayName.value=''; bdayDate.value=''; });

  // Meals
  document.getElementById('mealAddBtn').addEventListener('click', addMealFromInputs);

  // Theme toggle
  const body = document.body;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  function updateThemeIcon(){ themeIcon.className = body.classList.contains('dark') ? 'fa-solid fa-sun' : 'fa-solid fa-moon'; }
  if(localStorage.getItem('theme') === 'dark') body.classList.add('dark');
  updateThemeIcon();
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark');
    localStorage.setItem('theme', body.classList.contains('dark') ? 'dark' : 'light');
    updateThemeIcon();
  });

  // Print modal
  const printModal = document.getElementById('printModal');
  const openPrint = document.getElementById('openPrint');
  const cancelPrint = document.getElementById('cancelPrint');
  const printNow = document.getElementById('printNow');
  openPrint.addEventListener('click', () => printModal.style.display = 'block');
  cancelPrint.addEventListener('click', () => printModal.style.display = 'none');

  printNow.addEventListener('click', () => {
    const selected = [...document.querySelectorAll('.print-check:checked')].map(ch => ch.dataset.target).filter(Boolean);
    const includeCover = document.getElementById('includeCover').checked;
    const breakPerCard = document.getElementById('breakPerCard').checked;
    if(selected.length === 0 && !includeCover){ alert('Velg minst én seksjon eller inkluder forside.'); return; }
    buildPrintArea(selected, breakPerCard, includeCover);
    printModal.style.display = 'none';
    window.print();
    setTimeout(()=>{ const area = document.getElementById('printArea'); if(area){ area.innerHTML=''; area.style.display='none'; } }, 500);
  });
});
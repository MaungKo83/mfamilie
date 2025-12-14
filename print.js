


/* =========================================================
   STATE + STORAGE
   ========================================================= */
const STORAGE_KEY = "maung_weektable_v1";

const defaultState = {
  routine: [],
  meds: [],
  grocery: [],
  note: [],
  calendar: [],
  birthday: [],
  quote: [],
  meals: { // meals[day][slot] -> array
    // e.g. Mon: { breakfast: ["Pancake"], lunch:[], dinner:[] }
  }
};

let state = { ...defaultState };

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) {
      const parsed = JSON.parse(raw);
      state = { ...defaultState, ...parsed };
      // ensure meals keys exist as objects
      state.meals = state.meals || {};
    }
  }catch(e){ console.error("loadState", e) }
}

function saveState(){
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }catch(e){ console.error("saveState", e) }
}

/* Initialize from storage */
loadState();

/* =========================================================
   UTIL
   ========================================================= */
const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const SLOTS = ["breakfast","lunch","dinner"];
const SLOT_LABEL = { breakfast: "Frokost", lunch: "Middag", dinner: "Kveld" };

/* Helpers to ensure structure */
function ensureDaySlot(day, slot){
  if(!state.meals[day]) state.meals[day] = { breakfast:[], lunch:[], dinner:[] };
  if(!state.meals[day][slot]) state.meals[day][slot] = [];
}

/* =========================================================
   RENDERING helpers
   ========================================================= */
function renderList(id, arr){
  const ul = document.getElementById(id);
  if(!ul) return;
  ul.innerHTML = "";
  (arr||[]).forEach((txt,i)=>{
    const li = document.createElement("li");
    li.className = "item";
    li.innerHTML = `<span>${escapeHtml(txt)}</span>`;
    const btn = document.createElement("button");
    btn.className = "small-btn red";
    btn.textContent = "X";
    btn.onclick = () => { removeListItem(id, i); };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

function escapeHtml(s){
  return String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

/* remove helper for simple lists */
function removeListItem(listId, index){
  const key = listId.replace("List","");
  if(!state[key]) return;
  state[key].splice(index,1);
  saveState();
  renderAll();
}

/* =========================================================
   RENDER MEAL TABLE (table layout)
   ========================================================= */
function renderMealsTable(){
  const tbody = document.getElementById("mealTbody");
  tbody.innerHTML = "";
  DAYS.forEach(day=>{
    const tr = document.createElement("tr");
    const dayCell = document.createElement("td");
    dayCell.innerHTML = `<strong>${day}</strong>`;
    tr.appendChild(dayCell);

    SLOTS.forEach(slot=>{
      const td = document.createElement("td");
      const entries = (state.meals[day] && state.meals[day][slot]) || [];
      if(entries.length === 0){
        td.innerHTML = `<span style="opacity:0.6">Ingen</span>`;
      } else {
        entries.forEach((val, idx)=>{
          const pill = document.createElement("span");
          pill.className = "meal-pill";
          pill.innerHTML = `${escapeHtml(val)} <button title="Slett" onclick="deleteMealEntry('${day}','${slot}',${idx})">✕</button>`;
          td.appendChild(pill);
        });
      }
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });
}

/* =========================================================
   CRUD functions (lists + calendar)
   ========================================================= */
function addItemSimple(type){
  const mapping = {
    routine: "routineInput",
    grocery: "groceryInput",
    note: "noteInput",
    quote: "quoteInput"
  };
  const id = mapping[type];
  if(!id) return;
  const val = document.getElementById(id).value.trim();
  if(!val) return;
  state[type] = state[type] || [];
  state[type].push(val);
  document.getElementById(id).value = "";
  saveState();
  renderAll();
}

document.addEventListener("click",(e)=>{
  if(e.target && e.target.matches(".add") && e.target.dataset && e.target.dataset.simple){
    addItemSimple(e.target.dataset.simple);
  }
});

/* Bindings for add buttons (explicit) */
window.addItem = function(type){
  addItemSimple(type);
};

function addMed(){
  const name = document.getElementById("medName").value.trim();
  const dose = document.getElementById("medDose").value.trim();
  const time = document.getElementById("medTime").value.trim();
  if(!name) return;
  state.meds = state.meds || [];
  state.meds.push(`${name} — ${dose} — ${time}`);
  document.getElementById("medName").value="";
  document.getElementById("medDose").value="";
  document.getElementById("medTime").value="";
  saveState();
  renderAll();
}

function addCalendar(){
  const date = document.getElementById("calDate").value;
  const time = document.getElementById("calTime").value;
  const text = document.getElementById("calText").value.trim();
  if(!date || !text) return;
  state.calendar = state.calendar || [];
  state.calendar.push(`${date} ${time} — ${text}`);
  document.getElementById("calText").value="";
  saveState();
  renderAll();
}

function addBirthday(){
  const name = document.getElementById("bdayName").value.trim();
  const date = document.getElementById("bdayDate").value;
  if(!name || !date) return;
  state.birthday = state.birthday || [];
  state.birthday.push(`${name} — ${date}`);
  document.getElementById("bdayName").value="";
  document.getElementById("bdayDate").value="";
  saveState();
  renderAll();
}

/* =========================================================
   MEALS CRUD (table)
   ========================================================= */
function addMealToTable(){
  const day = document.getElementById("mealDay").value;
  const slot = document.getElementById("mealSlot").value;
  const text = document.getElementById("mealText").value.trim();
  if(!text) return;
  ensureDaySlot(day, slot);
  state.meals[day][slot].push(text);
  document.getElementById("mealText").value = "";
  saveState();
  renderMealsTable();
  showMealTable();
}

function deleteMealEntry(day, slot, index){
  if(!(state.meals[day] && state.meals[day][slot])) return;
  state.meals[day][slot].splice(index,1);
  saveState();
  renderMealsTable();
}

function ensureDaySlot(day, slot){
  if(!state.meals[day]) state.meals[day] = { breakfast:[], lunch:[], dinner:[] };
  if(!state.meals[day][slot]) state.meals[day][slot] = [];
}

function autoFillMeals(){
  // Provide sample data in table form
  state.meals = {
    Mon: { breakfast:["Yoghurt"], lunch:["Pasta"], dinner:["Kylling"] },
    Tue: { breakfast:["Brød"], lunch:["Suppe"], dinner:["Tacos"] },
    Wed: { breakfast:["Havre"], lunch:["Salat"], dinner:["Fisk"] },
    Thu: { breakfast:["Smoothie"], lunch:["Sandwich"], dinner:["Laks"] },
    Fri: { breakfast:["Egg"], lunch:["Pizza"], dinner:["Burger"] },
    Sat: { breakfast:["Pannekaker"], lunch:[], dinner:["Sushi"] },
    Sun: { breakfast:["Pannekaker"], lunch:["Roast"], dinner:[] }
  };
  saveState();
  renderMealsTable();
  showMealTable();
}

function clearAllMeals(){
  if(!confirm("Tøm alle måltider?")) return;
  state.meals = {};
  saveState();
  renderMealsTable();
  hideMealTable();
}

/* show/hide meal table area */
function showMealTable(){ document.getElementById("mealTableWrap").style.display = "block"; }
function hideMealTable(){ document.getElementById("mealTableWrap").style.display = "none"; }

/* =========================================================
   PRINT: clone selected cards into #printArea and copy inputs
   ========================================================= */
function openPrintModal(){
  document.getElementById("printOverlay").style.display = "flex";
}
function closePrintModal(){
  document.getElementById("printOverlay").style.display = "none";
}

function copyValuesToClone(orig, clone){
  // copy simple input/textarea/select values by mapping elements
  const inputs = orig.querySelectorAll("input, textarea, select");
  const clones = clone.querySelectorAll("input, textarea, select");
  inputs.forEach((inp, i)=>{
    if(!clones[i]) return;
    try{
      clones[i].value = inp.value;
      clones[i].textContent = inp.value;
    }catch(e){}
  });
  // For meal table, the cell content is DOM; it will clone as text nodes already.
}

function doPrintSelected(){
  // which cards selected
  const checks = document.querySelectorAll(".printCheck:checked");
  if(!checks.length){
    alert("Velg minst én seksjon å skrive ut.");
    return;
  }

  // clear previous
  const printArea = document.getElementById("printArea");
  printArea.innerHTML = "";
  printArea.style.display = "block";

  checks.forEach((chk, idx)=>{
    const id = chk.value;
    const orig = document.getElementById(id);
    if(!orig) return;
    const clone = orig.cloneNode(true);
    // copy inputs/textarea values so they show correctly if present
    copyValuesToClone(orig, clone);

    // if user requested page break per card
    const breakPerCard = document.getElementById("breakPerCard")?.checked;
    if(breakPerCard && idx > 0) clone.style.pageBreakBefore = "always";

    printArea.appendChild(clone);
  });

  closePrintModal();
  // allow layout to settle
  setTimeout(()=>{
    window.print();
    // cleanup
    printArea.innerHTML = "";
    printArea.style.display = "none";
  }, 150);
}

/* =========================================================
   RENDER everything
   ========================================================= */
function renderAll(){
  renderList("routineList", state.routine || []);
  renderList("medList", state.meds || []);
  renderList("groceryList", state.grocery || []);
  renderList("noteList", state.note || []);
  renderList("calendarList", state.calendar || []);
  renderList("birthdayList", state.birthday || []);
  renderList("quoteList", state.quote || []);
  renderMealsTable();

  // show meal table if any meals exist
  const hasMeals = Object.keys(state.meals || {}).length > 0 &&
    DAYS.some(d => state.meals[d] && SLOTS.some(s => (state.meals[d][s]||[]).length>0));
  if(hasMeals) showMealTable(); else hideMealTable();
}

/* =========================================================
   Hook up UI events
   ========================================================= */
document.getElementById("openPrint").addEventListener("click", openPrintModal);
document.getElementById("closePrintBtn").addEventListener("click", closePrintModal);
document.getElementById("doPrintBtn").addEventListener("click", doPrintSelected);

document.getElementById("addMealBtn").addEventListener("click", addMealToTable);
document.getElementById("autoFillMeals").addEventListener("click", autoFillMeals);
document.getElementById("clearMealsBtn").addEventListener("click", clearAllMeals);
document.getElementById("showTableBtn").addEventListener("click", ()=>{
  const wrap = document.getElementById("mealTableWrap");
  wrap.style.display = wrap.style.display === "block" ? "none" : "block";
});

/* Add simple list add binding for the other add buttons rendered in markup */
document.querySelectorAll(".card .add").forEach(btn=>{
  // some .add buttons are bound directly by inline onclick; this ensures no duplicates
});

/* =========================================================
   Init
   ========================================================= */
renderAll();

/* Save on unload as well */
window.addEventListener("beforeunload", saveState);
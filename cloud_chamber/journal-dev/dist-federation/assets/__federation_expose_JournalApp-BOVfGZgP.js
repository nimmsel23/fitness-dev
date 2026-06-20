import { importShared } from './__federation_fn_import-Cio-_O4i.js';
import { r as reactExports } from './index-Dm_EQZZA.js';

var jsxRuntime = {exports: {}};

var reactJsxRuntime_production_min = {};

/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f=reactExports,k=Symbol.for("react.element"),l=Symbol.for("react.fragment"),m=Object.prototype.hasOwnProperty,n=f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,p={key:true,ref:true,__self:true,__source:true};
function q(c,a,g){var b,d={},e=null,h=null;void 0!==g&&(e=""+g);void 0!==a.key&&(e=""+a.key);void 0!==a.ref&&(h=a.ref);for(b in a)m.call(a,b)&&!p.hasOwnProperty(b)&&(d[b]=a[b]);if(c&&c.defaultProps)for(b in a=c.defaultProps,a) void 0===d[b]&&(d[b]=a[b]);return {$$typeof:k,type:c,key:e,ref:h,props:d,_owner:n.current}}reactJsxRuntime_production_min.Fragment=l;reactJsxRuntime_production_min.jsx=q;reactJsxRuntime_production_min.jsxs=q;

{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}

var jsxRuntimeExports = jsxRuntime.exports;

const BASE = "";
function apiFetch(url, opts) {
  const fn = window.aosOfflineQueue?.fetch ?? fetch;
  return fn(url, opts);
}
async function get(path) {
  const res = await apiFetch(BASE + path, { cache: "no-store" });
  const fromOffline = res.headers?.get?.("X-Source")?.startsWith("offline");
  if (!res.ok && !fromOffline) throw new Error(`GET ${path} → ${res.status}`);
  try {
    return await res.json();
  } catch {
    return null;
  }
}
async function post(path, data) {
  const res = await apiFetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok && res.status !== 202) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}
async function del(path) {
  const res = await apiFetch(BASE + path, { method: "DELETE" });
  if (!res.ok && res.status !== 202) throw new Error(`DELETE ${path} → ${res.status}`);
  return res.json();
}
function localToday$1() {
  const d = /* @__PURE__ */ new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function isLocalMode() {
  return true;
}
async function getSessionHistory() {
  return [];
}
async function getJournalHistory(limitCount = 50) {
  try {
    const data = await get(`/journal/list?limit=${limitCount}`);
    return (data?.entries || []).map((e) => ({ id: e.date, date: e.date, text: e.preview }));
  } catch {
    return [];
  }
}
async function saveJournal(date = localToday$1(), text) {
  const content = String(text || "").trim();
  await post(`/journal?date=${date}`, { content });
  return { id: date, date, text: content, time: (/* @__PURE__ */ new Date()).toISOString() };
}
async function updateJournal(id, text) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(id) ? id : localToday$1();
  await post(`/journal?date=${date}`, { content: String(text || "").trim() });
  return { ok: true };
}
const HJ_KEY = "journal-dev-habit-journals";
function readHJ() {
  try {
    return JSON.parse(localStorage.getItem(HJ_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeHJ(d) {
  try {
    localStorage.setItem(HJ_KEY, JSON.stringify(d));
  } catch {
  }
}
async function getAllHabitJournalsHistory(limitCount = 50) {
  const journals = readHJ();
  const all = [];
  Object.entries(journals).forEach(([habitId, items]) => {
    (Array.isArray(items) ? items : []).forEach((item) => all.push({ id: `${habitId}_${item.date}`, habitId, ...item, type: "habit" }));
  });
  return all.sort((a, b) => b.date.localeCompare(a.date)).slice(0, limitCount);
}
const OVERLAY_KEY = "journal-dev-habit-overlay";
function readOverlay() {
  try {
    return JSON.parse(localStorage.getItem(OVERLAY_KEY) || "{}");
  } catch {
    return {};
  }
}
function writeOverlay(d) {
  try {
    localStorage.setItem(OVERLAY_KEY, JSON.stringify(d));
  } catch {
  }
}
function normalizeRecord(r) {
  const date = r?.date || (r?.epochDay !== void 0 ? new Date(Number(r.epochDay) * 864e5).toISOString().slice(0, 10) : null);
  if (!date) return null;
  return { ...r, date, completion: r?.completion || (r?.done ? "DONE" : "MISSED") };
}
function mapHabits(raw) {
  const overlay = readOverlay();
  const habits = Array.isArray(raw) ? raw : raw?.habits || [];
  return habits.map((h) => {
    const records = (h.records || []).map(normalizeRecord).filter(Boolean);
    const ov = overlay[h.uuid || h.id] || {};
    return {
      uuid: h.uuid || h.id,
      name: ov.name || h.name,
      icon: ov.icon || h.icon || "Activity",
      deleted: ov.deleted ?? !!h.deleted,
      source: h.source || "coach",
      records,
      hasRecord: (date) => records.some((x) => x.date === date && x.completion === "DONE")
    };
  });
}
async function getHabits() {
  try {
    const data = await get("/habitsync/habits");
    return mapHabits(data).filter((h) => !h.deleted);
  } catch {
    return [];
  }
}
async function addHabit(name, icon = "Activity") {
  return post("/habitsync/add", { name: name.trim(), icon });
}
async function deleteHabit(uuid) {
  const overlay = readOverlay();
  overlay[uuid] = { ...overlay[uuid] || {}, deleted: true };
  writeOverlay(overlay);
  return del(`/habitsync/delete/${encodeURIComponent(uuid)}`);
}
async function recordHabit(uuid) {
  return post(`/habitsync/record/${encodeURIComponent(uuid)}`, {});
}
async function unrecordHabit(uuid) {
  return post(`/habitsync/record/${encodeURIComponent(uuid)}`, {});
}
async function updateHabit(uuid, newName, newIcon) {
  const overlay = readOverlay();
  overlay[uuid] = { ...overlay[uuid] || {}, name: newName, icon: newIcon };
  writeOverlay(overlay);
  return { ok: true };
}
async function getHabitRecordsForDate(date = localToday$1()) {
  const habits = await getHabits();
  return habits.filter((h) => h.hasRecord(date)).map((h) => h.uuid);
}
async function getHabitJournal(habitId, date) {
  const journals = readHJ();
  return (journals[habitId] || []).find((i) => i.date === date) || null;
}
async function getHabitJournalHistory(habitId) {
  const journals = readHJ();
  return (journals[habitId] || []).slice().sort((a, b) => b.date.localeCompare(a.date));
}
async function saveHabitJournal(habitId, date, text) {
  const journals = readHJ();
  const items = (Array.isArray(journals[habitId]) ? journals[habitId] : []).filter((i) => i.date !== date);
  items.unshift({ date, text: String(text || "").trim(), updated_at: (/* @__PURE__ */ new Date()).toISOString() });
  journals[habitId] = items;
  writeHJ(journals);
  return { ok: true };
}

function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

const {Activity: Activity$1,Footprints,Apple,BookOpen: BookOpen$1,Coffee,Droplet,Dumbbell: Dumbbell$2,Feather,Heart,Home,Moon,Sunrise,Sun,Zap} = await importShared('lucide-react');


const ICON_OPTIONS = [
  "Activity", "Footprints", "Apple", "BookOpen", "Coffee", "Droplet", "Dumbbell", "Feather", "Heart", "Home", "Moon", "Sunrise", "Sun", "Zap"
];

const ICON_COMPONENTS_MAP = {
  Activity: Activity$1, Footprints, Apple, BookOpen: BookOpen$1, Coffee, Droplet, Dumbbell: Dumbbell$2, Feather, Heart, Home, Moon, Sunrise, Sun, Zap
};

function getRollingDays(count) {
  const dates = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

const {ChevronLeft,ChevronRight,CalendarDays: CalendarDays$1,Book: Book$3} = await importShared('lucide-react');

function JournalHeader({ date, setDate, localToday, formatRelativeDate }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[var(--accent)] font-black uppercase tracking-[0.3em] text-[10px] mb-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Book$3, { size: 14 }),
        "Daily Reflection"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl font-black text-[var(--ink)] tracking-tighter", children: formatRelativeDate(date) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 bg-[var(--card)] p-1.5 rounded-2xl border border-[var(--line)] shadow-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
        const d = new Date(date);
        d.setDate(d.getDate() - 1);
        setDate(d.toISOString().slice(0, 10));
      }, className: "p-2.5 rounded-xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { size: 20 }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "date",
          value: date,
          max: localToday,
          onChange: (e) => setDate(e.target.value),
          className: "bg-transparent px-4 py-2 text-sm font-black text-[var(--ink)] outline-none cursor-pointer uppercase tracking-widest"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          disabled: date === localToday,
          onClick: () => {
            const d = new Date(date);
            d.setDate(d.getDate() + 1);
            setDate(d.toISOString().slice(0, 10));
          },
          className: "p-2.5 rounded-xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all disabled:opacity-10",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { size: 20 })
        }
      )
    ] })
  ] });
}

const {Book: Book$2,X: X$3} = await importShared('lucide-react');

function JournalForm({ text, setText, onSubmit, saving, editingEntry, onCancelEdit }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-6 space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `card p-6 shadow-2xl bg-gradient-to-b from-[var(--card)] to-[var(--bg2)] border relative overflow-hidden group transition-colors ${editingEntry ? "border-[var(--accent)]/50 shadow-[var(--accent)]/10" : "border-[var(--line)]"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-4 -top-4 opacity-5 group-hover:scale-110 transition-transform duration-1000", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Book$2, { size: 120 }) }),
      editingEntry && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 pb-4 border-b border-[var(--line)]/50 animate-in slide-in-from-top-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[var(--accent)]", children: "Bearbeitungs-Modus" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancelEdit, className: "p-1 rounded-lg hover:bg-[var(--bg2)] text-[var(--dim)] transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X$3, { size: 14 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: text,
          onChange: (e) => setText(e.target.value),
          rows: 8,
          placeholder: "Gedanken, Erkenntnisse, Fokus...",
          className: "w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-[var(--ink)] font-medium placeholder:opacity-30",
          autoFocus: !!editingEntry
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 flex items-center justify-between pt-4 border-t border-[var(--line)]/50", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase tracking-widest opacity-30", children: "Shift + Enter für Umbruch" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          editingEntry && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: onCancelEdit, className: "text-[9px] font-black uppercase tracking-widest text-[var(--dim)] hover:text-[var(--ink)] transition-all px-2", children: "Abbrechen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: onSubmit,
              disabled: saving || !text.trim(),
              className: "btn btn-primary px-8 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[var(--accent)]/20",
              children: saving ? "..." : editingEntry ? "Aktualisieren" : "Sichern"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-2 py-4 border-l-2 border-dashed border-[var(--line)] ml-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-bold opacity-30 leading-relaxed italic text-[var(--dim)]", children: '"Worte sind die Brücke von der Erfahrung zur Erkenntnis."' }) })
  ] });
}

const EFFORT_LABELS = ['', '', 'Sehr leicht', 'Leicht', 'Moderat', 'Etwas schwer', 'Schwer', 'Sehr schwer', 'Extrem', 'Maximal', 'All-Out'];

function timeStr(e) {
  if (e.time) return e.time.slice(11, 16);
  if (e.updated_at?.seconds) return new Date(e.updated_at.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return '';
}

const {Target: Target$2,Dumbbell: Dumbbell$1,Clock,Brain: Brain$2,Edit: Edit$1,CheckCircle2: CheckCircle2$1} = await importShared('lucide-react');
function JournalEntry({ e, i, habits, setSelectedEntry, onEdit }) {
  const isHabit = e.type === "habit";
  const isWorkout = e.type === "workout";
  const isHabitCompletion = e.type === "habit-completion";
  const isAuto = isHabit || isWorkout || isHabitCompletion;
  const habit = isHabit ? habits.find((h) => h.uuid === e.habitId) : null;
  const bulletColor = isWorkout ? "bg-blue-500" : isHabit || isHabitCompletion ? "bg-[var(--accent)]" : "bg-[var(--dim)]";
  const borderColor = isWorkout ? "border-blue-500/15" : isAuto ? "border-[var(--accent)]/10" : "border-[var(--line)]";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute -left-[37px] top-6 w-4 h-4 rounded-full border-4 border-[var(--bg)] shadow-sm z-10 transition-transform group-hover:scale-125 ${bulletColor}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => setSelectedEntry(e),
        className: `p-6 rounded-[24px] border bg-[var(--card)] shadow-md transition-all hover:shadow-2xl hover:-translate-y-0.5 cursor-pointer ${borderColor}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-3", children: [
            isWorkout ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Dumbbell$1, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-blue-500", children: e.block }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5", children: "Workout geloggt" })
              ] })
            ] }) : isHabitCompletion ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2$1, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]", children: e.habitName }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5", children: "Habit abgeschlossen" })
              ] })
            ] }) : isHabit ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Target$2, { size: 16 }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]", children: habit?.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-bold opacity-30 uppercase tracking-tighter -mt-0.5", children: "Habit Journal" })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[var(--dim)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { size: 14, className: "opacity-30" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest opacity-40", children: "Journal Eintrag" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              e.type === "regular" && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: (ev) => {
                    ev.stopPropagation();
                    onEdit(e);
                  },
                  className: "p-1.5 rounded-lg hover:bg-[var(--bg2)] text-[var(--dim)] hover:text-[var(--accent)] transition-all",
                  title: "Eintrag bearbeiten",
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Edit$1, { size: 12 })
                }
              ),
              timeStr(e) && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black font-mono opacity-20 bg-[var(--bg2)] px-2 py-1 rounded-md", children: timeStr(e) })
            ] })
          ] }),
          isWorkout && e.exercises?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3 flex flex-wrap gap-1.5", children: e.exercises.map((ex, idx) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold px-2.5 py-1 rounded-lg bg-blue-500/8 text-blue-400 border border-blue-500/15", children: ex.name }, idx)) }),
          isWorkout && e.effort > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase tracking-widest opacity-30", children: "Anstrengung" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black text-blue-400 bg-blue-500/8 border border-blue-500/15 px-2 py-0.5 rounded-md", children: [
              e.effort,
              "/10 ",
              EFFORT_LABELS[e.effort] ? `· ${EFFORT_LABELS[e.effort]}` : ""
            ] })
          ] }),
          e.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm leading-relaxed text-[var(--ink)]/90 font-medium whitespace-pre-wrap selection:bg-[var(--accent)]/30 line-clamp-3", children: e.text }),
          isHabit && e.coachFeedback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 p-4 rounded-2xl bg-[var(--accent)]/5 border-l-4 border-[var(--accent)]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Brain$2, { size: 14, className: "text-[var(--accent)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[var(--accent)]", children: "Coach Feedback" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold italic text-[var(--ink)]/80 leading-relaxed truncate", children: [
              '"',
              e.coachFeedback,
              '"'
            ] })
          ] })
        ]
      }
    )
  ] });
}

const {X: X$2,Target: Target$1,Dumbbell,Book: Book$1,Brain: Brain$1,CheckCircle2} = await importShared('lucide-react');
function JournalModal({ selectedEntry, setSelectedEntry, habits, formatRelativeDate }) {
  if (!selectedEntry) return null;
  const isHabit = selectedEntry.type === "habit";
  const isWorkout = selectedEntry.type === "workout";
  const isHabitCompletion = selectedEntry.type === "habit-completion";
  const habit = isHabit ? habits.find((h) => h.uuid === selectedEntry.habitId) : null;
  const timeDisplay = selectedEntry.time ? selectedEntry.time.slice(11, 16) : selectedEntry.updated_at?.seconds ? new Date(selectedEntry.updated_at.seconds * 1e3).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  const iconColor = isWorkout ? "text-blue-500 bg-blue-500/10" : "text-[var(--accent)] bg-[var(--accent)]/10";
  const title = isHabit ? habit?.name : isWorkout ? selectedEntry.block : isHabitCompletion ? selectedEntry.habitName : "Journal Eintrag";
  const subtitle = isWorkout ? "Workout geloggt" : isHabitCompletion ? "Habit abgeschlossen" : isHabit ? "Habit Journal" : "Notiz";
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-black/60 backdrop-blur-sm", onClick: () => setSelectedEntry(null) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-2xl bg-[var(--card)] rounded-[32px] border border-[var(--line)] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-[var(--line)]/50 flex items-center justify-between bg-gradient-to-r from-[var(--card)] to-[var(--bg2)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `w-10 h-10 rounded-2xl flex items-center justify-center ${iconColor}`, children: isHabit ? /* @__PURE__ */ jsxRuntimeExports.jsx(Target$1, { size: 20 }) : isWorkout ? /* @__PURE__ */ jsxRuntimeExports.jsx(Dumbbell, { size: 20 }) : isHabitCompletion ? /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 20 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Book$1, { size: 20 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-black uppercase tracking-widest text-[var(--ink)]", children: title }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold opacity-30 uppercase tracking-widest", children: [
              formatRelativeDate(selectedEntry.date),
              timeDisplay ? ` · ${timeDisplay} Uhr` : "",
              " · ",
              subtitle
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedEntry(null), className: "p-3 rounded-2xl hover:bg-[var(--bg2)] text-[var(--dim)] transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X$2, { size: 24 }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-8 sm:p-10 space-y-8", children: [
        isWorkout && selectedEntry.exercises?.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-3", children: "Abgehakte Übungen" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: selectedEntry.exercises.map((ex, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-500/8 text-blue-400 border border-blue-500/15", children: [
            ex.name,
            ex.sets && ex.reps ? ` · ${ex.sets}×${ex.reps}` : "",
            ex.weight ? ` @ ${ex.weight}kg` : ""
          ] }, idx)) })
        ] }),
        isWorkout && selectedEntry.effort > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest opacity-30", children: "Anstrengung" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black text-blue-400 bg-blue-500/8 border border-blue-500/15 px-3 py-1 rounded-lg", children: [
            selectedEntry.effort,
            "/10 · ",
            EFFORT_LABELS[selectedEntry.effort] || ""
          ] })
        ] }),
        selectedEntry.text && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg sm:text-xl font-medium leading-relaxed text-[var(--ink)]/90 whitespace-pre-wrap selection:bg-[var(--accent)]/30", children: selectedEntry.text }),
        isHabitCompletion && !selectedEntry.text && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 text-[var(--accent)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CheckCircle2, { size: 32 }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-base font-black uppercase tracking-widest", children: [
            selectedEntry.habitName,
            " — Abgeschlossen"
          ] })
        ] }),
        isHabit && selectedEntry.coachFeedback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-[24px] bg-[var(--accent)]/5 border border-[var(--accent)]/20 relative overflow-hidden group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-1000 text-[var(--accent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Brain$1, { size: 120 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Brain$1, { size: 18, className: "text-[var(--accent)]" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]", children: "Coach Feedback" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm sm:text-base font-bold italic text-[var(--ink)]/80 leading-relaxed relative z-10", children: [
            '"',
            selectedEntry.coachFeedback,
            '"'
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-6 border-t border-[var(--line)]/50 bg-[var(--bg2)]/50 flex justify-end", children: /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedEntry(null), className: "btn bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] px-8 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-[var(--accent)] transition-all", children: "Schließen" }) })
    ] })
  ] });
}

const {useEffect: useEffect$2,useRef} = await importShared('react');

const {X: X$1,Save: Save$1} = await importShared('lucide-react');
function HabitJournalModal({
  open,
  onClose,
  habit,
  date,
  journalText,
  setJournalText,
  isJournalSaving,
  onSaveJournal
}) {
  const textareaRef = useRef(null);
  useEffect$2(() => {
    if (!open) return;
    const t = setTimeout(() => textareaRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [open]);
  useEffect$2(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") {
        onSaveJournal();
        onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onSaveJournal]);
  if (!open || !habit) return null;
  const Icon = ICON_COMPONENTS_MAP[habit.icon || "Activity"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-in fade-in duration-200", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "absolute inset-0",
        onClick: () => {
          onSaveJournal();
          onClose();
        }
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full max-w-3xl max-h-full bg-[var(--card)] rounded-3xl shadow-2xl border border-[var(--line)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-8 py-6 border-b border-[var(--line)]/40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          Icon && /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 28, className: "text-[var(--ink)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black text-[var(--ink)] leading-tight", children: habit.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-widest opacity-40 mt-0.5", children: date })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => {
              onSaveJournal();
              onClose();
            },
            className: "p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all",
            "aria-label": "Schließen",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X$1, { size: 24 })
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 px-8 py-6 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          ref: textareaRef,
          value: journalText,
          onChange: (e) => setJournalText(e.target.value),
          onBlur: () => onSaveJournal(),
          onKeyDown: (e) => {
            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              onSaveJournal();
              onClose();
            }
          },
          placeholder: "",
          className: "w-full min-h-[60vh] bg-transparent border-0 text-base font-medium leading-relaxed text-[var(--ink)] focus:outline-none resize-none"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between px-8 py-4 border-t border-[var(--line)]/40 text-[10px] font-black uppercase tracking-widest opacity-40", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Esc · schließen + speichern" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          isJournalSaving && /* @__PURE__ */ jsxRuntimeExports.jsx(Save$1, { size: 12, className: "text-[var(--accent)] animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Strg + Enter · speichern" })
        ] })
      ] })
    ] })
  ] });
}

const {useState: useState$2,useEffect: useEffect$1,useMemo: useMemo$1} = await importShared('react');
const {Book,PenLine: PenLine$1} = await importShared('lucide-react');
function formatRelativeDate(dateStr) {
  const today = localToday();
  if (dateStr === today) return "Heute";
  const yesterday = /* @__PURE__ */ new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().slice(0, 10)) return "Gestern";
  return new Date(dateStr).toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}
function Journal() {
  const [date, setDate] = useState$2(localToday());
  const [text, setText] = useState$2("");
  const [timeline, setTimeline] = useState$2([]);
  const [habits, setHabits] = useState$2([]);
  const [saving, setSaving] = useState$2(false);
  const [toast, setToast] = useState$2("");
  const [selectedEntry, setSelectedEntry] = useState$2(null);
  const [editingEntry, setEditingEntry] = useState$2(null);
  const [limitCount, setLimitCount] = useState$2(30);
  const [journalModalOpen, setJournalModalOpen] = useState$2(false);
  const [selectedHabitForJournal, setSelectedHabitForJournal] = useState$2(null);
  const [journalText, setJournalText] = useState$2("");
  const [isJournalSaving, setIsJournalSaving] = useState$2(false);
  const outstandingMemoirs = useMemo$1(() => {
    if (!date || habits.length === 0) return [];
    const doneHabits = habits.filter(
      (h) => h.records?.some((r) => r.date === date && r.completion === "DONE")
    );
    const dateGroup = timeline.find((g) => g.date === date);
    const writtenHabitIdsForDate = new Set(
      (dateGroup?.entries || []).filter((e) => e.type === "habit" && e.text && e.text.trim()).map((e) => e.habitId)
    );
    return doneHabits.filter((h) => !writtenHabitIdsForDate.has(h.uuid));
  }, [date, habits, timeline]);
  const handleOpenMemoir = async (habit) => {
    setSelectedHabitForJournal(habit);
    setJournalText("");
    const j = await getHabitJournal(habit.uuid, date);
    setJournalText(j?.text || "");
    setJournalModalOpen(true);
  };
  async function onSaveJournal(textOverride = null) {
    const textToSave = textOverride !== null ? textOverride : journalText;
    if (!selectedHabitForJournal || !date) return;
    setIsJournalSaving(true);
    try {
      await saveHabitJournal(selectedHabitForJournal.uuid, date, textToSave);
      setLimitCount((p) => p + 1);
    } finally {
      setIsJournalSaving(false);
    }
  }
  useEffect$1(() => {
    async function load() {
      const [regularHistory, habitHistory, sessions, allHabits] = await Promise.all([
        getJournalHistory(limitCount),
        getAllHabitJournalsHistory(limitCount),
        getSessionHistory(),
        getHabits()
      ]);
      setHabits(allHabits);
      const combined = [
        ...regularHistory.map((e) => ({ ...e, type: "regular" })),
        ...habitHistory
      ];
      sessions.forEach((session) => {
        const savedAt = session.saved_at?.seconds ? new Date(session.saved_at.seconds * 1e3).toISOString() : typeof session.saved_at === "string" ? session.saved_at : `${session.date}T23:59:59`;
        combined.push({
          id: "workout-" + session.date + "-" + (session.id || "0"),
          date: session.date,
          text: session.notes || "",
          type: "workout",
          block: session.block || "Training",
          exercises: (session.exercises || []).filter((e) => e.done),
          effort: session.effort,
          mood: session.mood,
          time: savedAt
        });
      });
      const cutoff = /* @__PURE__ */ new Date();
      cutoff.setDate(cutoff.getDate() - limitCount);
      const cutoffStr = cutoff.toISOString().slice(0, 10);
      allHabits.forEach((habit) => {
        (habit.records || []).forEach((record) => {
          if (record.completion === "DONE" && record.date >= cutoffStr) {
            combined.push({
              id: `habit-completion-${habit.uuid}-${record.date}`,
              date: record.date,
              type: "habit-completion",
              habitId: habit.uuid,
              habitName: habit.name,
              habitIcon: habit.icon,
              text: "",
              time: `${record.date}T12:00:00`
            });
          }
        });
      });
      const grouped = {};
      combined.forEach((entry) => {
        const d = entry.date || localToday();
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(entry);
      });
      const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));
      const finalTimeline = sortedDates.map((d) => ({
        date: d,
        entries: grouped[d].sort((a, b) => {
          const timeA = a.time || "";
          const timeB = b.time || "";
          return timeB.localeCompare(timeA);
        })
      }));
      setTimeline(finalTimeline);
      if (date === localToday() && grouped[date]?.filter((e) => e.type === "regular").length === 1 && !text) {
        const todayRegular = grouped[date].find((e) => e.type === "regular");
        setEditingEntry(todayRegular);
        setText(todayRegular.text);
      } else if (!editingEntry) {
        setText("");
      }
    }
    load().catch(() => setTimeline([]));
  }, [limitCount, date]);
  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2e3);
  }
  async function submit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      if (editingEntry) {
        await updateJournal(editingEntry.id, text);
        setTimeline((prev) => prev.map((group) => {
          if (group.date === editingEntry.date) {
            return { ...group, entries: group.entries.map((e) => e.id === editingEntry.id ? { ...e, text: text.trim() } : e) };
          }
          return group;
        }));
        setEditingEntry(null);
        showToast("Aktualisiert ✓");
      } else {
        await saveJournal(date, text);
        setLimitCount((p) => p + 1);
        showToast("Gespeichert ✓");
      }
      setText("");
    } catch {
      showToast("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }
  const handleEdit = (entry) => {
    setDate(entry.date);
    setEditingEntry(entry);
    setText(entry.text);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-32 max-w-3xl mx-auto px-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      JournalHeader,
      {
        date,
        setDate,
        localToday: localToday(),
        formatRelativeDate
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        JournalForm,
        {
          text,
          setText,
          onSubmit: submit,
          saving,
          editingEntry,
          onCancelEdit: () => {
            setEditingEntry(null);
            setText("");
            setDate(localToday());
          }
        }
      ),
      outstandingMemoirs.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 rounded-[24px] border border-[var(--accent)]/25 bg-[var(--accent)]/5 shadow-md space-y-4 animate-in fade-in slide-in-from-top-2 duration-300", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-[var(--accent)]", children: [
            "Ausstehende Memoirs (",
            outstandingMemoirs.length,
            ")"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: outstandingMemoirs.map((h) => {
          const Icon = ICON_COMPONENTS_MAP[h.icon] || ICON_COMPONENTS_MAP["Activity"];
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => handleOpenMemoir(h),
              className: "flex items-center justify-between p-4 rounded-2xl bg-[var(--card)] border border-[var(--line)] hover:border-[var(--accent)] hover:shadow-lg transition-all text-left group",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)] group-hover:scale-105 transition-transform", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-black text-[var(--ink)]", children: h.name }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[8px] font-bold opacity-40 uppercase tracking-widest mt-0.5", children: "Eintrag fehlt" })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--accent)]/10 px-2.5 py-1.5 rounded-xl border border-[var(--accent)]/15 group-hover:bg-[var(--accent)] group-hover:text-black transition-all", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine$1, { size: 10 }),
                  "Schreiben"
                ] })
              ]
            },
            h.uuid
          );
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-12 mt-12", children: [
        timeline.length > 0 ? timeline.map((group) => {
          const habitJournalIds = new Set(group.entries.filter((e) => e.type === "habit").map((e) => e.habitId));
          const standaloneCompletions = group.entries.filter((e) => e.type === "habit-completion" && !habitJournalIds.has(e.habitId));
          const mainEntries = group.entries.filter((e) => e.type !== "habit-completion");
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sticky top-20 z-10 py-2 bg-[var(--bg)]/90 backdrop-blur-md -mx-2 px-2 border-b border-[var(--line)]", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-black uppercase tracking-[0.2em] text-accent", children: formatRelativeDate(group.date) }),
              standaloneCompletions.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-1.5 mt-1.5", children: standaloneCompletions.map((e) => {
                const Icon = ICON_COMPONENTS_MAP[e.habitIcon] || ICON_COMPONENTS_MAP["Activity"];
                return /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "span",
                  {
                    title: e.habitName,
                    className: "w-6 h-6 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] cursor-default",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 12 })
                  },
                  e.id
                );
              }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative pl-6 sm:pl-8 border-l border-[var(--line)] space-y-6 mt-4", children: mainEntries.map((e, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              JournalEntry,
              {
                e,
                i,
                habits,
                setSelectedEntry,
                onEdit: handleEdit
              },
              e.id || i
            )) })
          ] }, group.date);
        }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-20 text-center rounded-[32px] border border-dashed border-[var(--line)] opacity-20", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Book, { size: 48, className: "mx-auto mb-4" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-black uppercase tracking-widest", children: "Keine Einträge gefunden" })
        ] }),
        timeline.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-8 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => setLimitCount((p) => p + 30),
            className: "px-8 py-3 rounded-2xl bg-bg2 border border-line text-[10px] font-black uppercase tracking-widest text-dim hover:text-ink hover:border-accent/30 transition-all",
            children: "Ältere Einträge laden ↓"
          }
        ) })
      ] })
    ] }),
    toast && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed bottom-24 lg:bottom-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl z-50 bg-card text-accent border border-line", children: toast }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      JournalModal,
      {
        selectedEntry,
        setSelectedEntry,
        habits,
        formatRelativeDate
      }
    ),
    journalModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx(
      HabitJournalModal,
      {
        open: journalModalOpen,
        onClose: () => {
          setJournalModalOpen(false);
          setSelectedHabitForJournal(null);
        },
        habit: selectedHabitForJournal,
        date,
        journalText,
        setJournalText,
        isJournalSaving,
        onSaveJournal
      }
    )
  ] });
}

const {Plus} = await importShared('lucide-react');
function HabitForm({ newHabit, setNewHabit, selectedIcon, setSelectedIcon, onAdd, saving }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: onAdd, className: "card p-6 shadow-xl border-[var(--accent)]/10 bg-[var(--card)] border-[var(--line)]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "label-caps mb-4 flex items-center gap-2 text-[var(--accent)]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14, className: "text-[var(--accent)]" }),
      "Neuer Habit"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "text",
          value: newHabit,
          onChange: (e) => setNewHabit(e.target.value),
          placeholder: "z.B. Früh aufstehen",
          className: "flex-1 bg-[var(--bg2)] border-[var(--line)] rounded-xl px-4 py-3 text-sm font-bold focus:border-[var(--accent)] outline-none"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { disabled: saving || !newHabit.trim(), className: "btn bg-[var(--accent)] text-black !p-3", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 20 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "label-caps !mb-2 text-[var(--dim)]", children: "Icon wählen" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ICON_OPTIONS.map((iconName) => {
        const IconComponent = ICON_COMPONENTS_MAP[iconName];
        return /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedIcon(iconName),
            className: `p-2 rounded-full border transition-colors ${selectedIcon === iconName ? "bg-[var(--accent)] border-[var(--accent)] text-black" : "bg-[var(--bg2)] border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)]"}`,
            children: IconComponent && /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { size: 20 })
          },
          iconName
        );
      }) })
    ] })
  ] });
}

const {Edit,Check: Check$1,Trash2,Sparkles} = await importShared('lucide-react');
function HabitItem({
  h,
  isSelected,
  isEditing,
  editingIcon,
  setEditingIcon,
  setEditingHabitId,
  onToggleSelection,
  onToggleCheck,
  onDelete,
  onUpdateName,
  onFinishEditing,
  selectedDate
}) {
  const isCoachHabit = h.source === "coach";
  const canEdit = isLocalMode();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      onClick: onToggleSelection,
      className: `group card p-3 sm:p-4 flex items-center justify-between transition-all border-l-4 cursor-pointer
               ${h.isDoneForSelectedDate ? "border-green bg-green/5" : "border-[var(--dim)] bg-[var(--card)]"}
               ${isSelected ? "border-[var(--accent)] bg-[var(--accent)]/10" : ""}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 pr-2", children: [
          isEditing ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                value: h.name,
                onChange: (e) => onUpdateName(h.uuid, e.target.value),
                onBlur: onFinishEditing,
                onKeyDown: (e) => {
                  if (e.key === "Enter") {
                    e.target.blur();
                  }
                },
                className: "w-full bg-[var(--bg2)] border-[var(--line)] rounded-md px-2 py-1 text-sm font-bold focus:border-[var(--accent)] outline-none",
                autoFocus: true,
                onClick: (e) => e.stopPropagation()
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ICON_OPTIONS.map((iconName) => {
              const IconComponent = ICON_COMPONENTS_MAP[iconName];
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  type: "button",
                  onClick: (e) => {
                    e.stopPropagation();
                    setEditingIcon(iconName);
                  },
                  className: `p-2 rounded-full border transition-colors ${editingIcon === iconName ? "bg-[var(--accent)] border-[var(--accent)] text-black" : "bg-[var(--bg2)] border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)]"}`,
                  children: IconComponent && /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { size: 20 })
                },
                iconName
              );
            }) })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            (() => {
              const IconComponent = ICON_COMPONENTS_MAP[h.icon || "Activity"];
              return IconComponent && /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { size: 16, className: "text-[var(--dim)] shrink-0" });
            })(),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-black text-[var(--ink)] truncate", children: h.name }),
            isCoachHabit && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-full border border-[var(--accent)]/20 uppercase tracking-tighter shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 8 }),
              " Coach"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[10px] font-bold opacity-30 uppercase tracking-widest mt-0.5 text-[var(--dim)] truncate", children: [
            h.isDoneForSelectedDate ? "Erledigt" : "Noch offen",
            " für ",
            selectedDate
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-3 shrink-0", children: [
          !isEditing && canEdit && /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
            e.stopPropagation();
            setEditingHabitId(h.uuid);
          }, className: "p-2 text-[var(--dim)] hover:text-[var(--accent)] transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Edit, { size: 16 }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: (e) => {
                e.stopPropagation();
                onToggleCheck(h);
              },
              className: `w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transition-all ${h.isDoneForSelectedDate ? "bg-green text-black" : "bg-[var(--bg2)] border border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)] hover:text-[var(--accent)]"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check$1, { size: 20, className: h.isDoneForSelectedDate ? "stroke-[3]" : "" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
            e.stopPropagation();
            onDelete(h.uuid);
          }, className: "opacity-0 group-hover:opacity-100 hidden sm:block p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 16 }) })
        ] })
      ]
    }
  );
}

const {X,Calendar,Check,Save,History,Brain,PenLine} = await importShared('lucide-react');
function HabitSidebar({
  selectedHabitId,
  setSelectedHabitId,
  habits,
  rollingDates,
  selectedSidebarDate,
  setSelectedSidebarDate,
  journalText,
  isJournalSaving,
  onToggleSidebarDone,
  journalHistory,
  onOpenJournalModal
}) {
  const selectedHabit = habits.find((h) => h.uuid === selectedHabitId);
  if (!selectedHabit) return null;
  const selectedHabitRecords = selectedHabit.records || [];
  const selectedHabitConsistency = selectedHabitRecords.length > 0 ? selectedHabitRecords.filter((r) => rollingDates.includes(r.date) && r.completion === "DONE").length / rollingDates.length * 100 : 0;
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `fixed top-0 right-0 h-full w-full sm:w-80 lg:w-96 bg-[var(--card)] shadow-2xl z-50 transform transition-transform duration-300
                     ${selectedHabitId ? "translate-x-0" : "translate-x-full"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col h-full p-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        (() => {
          const IconComponent = ICON_COMPONENTS_MAP[selectedHabit.icon || "Activity"];
          return IconComponent && /* @__PURE__ */ jsxRuntimeExports.jsx(IconComponent, { size: 24, className: "text-[var(--ink)]" });
        })(),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-[var(--ink)]", children: selectedHabit.name })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedHabitId(null), className: "p-2 text-[var(--dim)] hover:text-[var(--red)] transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 24 }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs font-bold uppercase tracking-widest opacity-70 text-[var(--ink)] flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { size: 12, className: "text-[var(--dim)]" }),
            "Konsistenz (28 Tage)"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold opacity-30 text-[var(--dim)]", children: [
            "Konsistenz: ",
            Math.round(selectedHabitConsistency),
            "%"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-7 sm:grid-cols-14 lg:grid-cols-28 gap-1.5", children: getRollingDays(28).map((d) => {
          const done = selectedHabit.records.some((r) => r.date === d && r.completion === "DONE");
          const isSelectedDate = d === selectedSidebarDate;
          return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col items-center gap-1", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setSelectedSidebarDate(d),
              className: `w-full aspect-square rounded-md shadow-sm transition-all border ${done ? "bg-emerald-500 border-emerald-600" : "bg-[var(--bg2)] border-[var(--line)]/50"} ${isSelectedDate ? "ring-2 ring-[var(--accent)] ring-offset-2 ring-offset-[var(--card)] scale-110 z-10" : ""}`,
              title: `${d}: ${done ? "Erledigt" : "Offen"}`
            }
          ) }, d);
        }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] font-black uppercase tracking-widest opacity-30 mb-0.5", children: selectedSidebarDate }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-black text-[var(--ink)]", children: "Status & Notizen" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => onToggleSidebarDone(selectedHabitId, selectedSidebarDate),
              className: `flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedHabit.records.some((r) => r.date === selectedSidebarDate && r.completion === "DONE") ? "bg-green text-black shadow-lg shadow-green/20" : "bg-[var(--bg2)] border border-[var(--line)] text-[var(--dim)]"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14, className: selectedHabit.records.some((r) => r.date === selectedSidebarDate && r.completion === "DONE") ? "stroke-[3]" : "" }),
                selectedHabit.records.some((r) => r.date === selectedSidebarDate && r.completion === "DONE") ? "Erledigt" : "Offen"
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => onOpenJournalModal?.(),
            className: "w-full text-left bg-[var(--bg2)] border border-[var(--line)] rounded-2xl p-4 hover:border-[var(--accent)] transition-all group",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--accent)]", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { size: 12 }),
                  "Reflexion schreiben"
                ] }),
                isJournalSaving && /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { size: 12, className: "text-[var(--accent)] animate-pulse" })
              ] }),
              journalText ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold leading-relaxed text-[var(--ink)]/80 line-clamp-3 whitespace-pre-wrap", children: journalText }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold leading-relaxed text-[var(--dim)] opacity-50 italic", children: "Tippen, um die Memoirs zu öffnen" })
            ]
          }
        ),
        (() => {
          const currentEntry = journalHistory.find((h) => h.date === selectedSidebarDate);
          if (!currentEntry?.coachFeedback) return null;
          return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl bg-[var(--accent)]/5 border border-[var(--accent)]/20 animate-in fade-in slide-in-from-top-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 14, className: "text-[var(--accent)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-[var(--accent)]", children: "Coach Feedback" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs font-bold leading-relaxed text-[var(--ink)]/90 italic", children: [
              '"',
              currentEntry.coachFeedback,
              '"'
            ] })
          ] });
        })()
      ] }),
      journalHistory && journalHistory.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 pb-12", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 px-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(History, { size: 14, className: "text-[var(--dim)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dim)]", children: "Historie" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: journalHistory.map((item, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 rounded-2xl bg-[var(--bg2)] border border-[var(--line)]/50", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] font-black opacity-30 uppercase tracking-widest mb-2", children: item.date }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-bold leading-relaxed text-[var(--ink)]/80 whitespace-pre-wrap", children: item.text }),
          item.coachFeedback && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-[var(--line)]/30", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mb-1.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Brain, { size: 10, className: "text-[var(--accent)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase tracking-widest text-[var(--accent)]", children: "Coach Feedback" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[11px] font-bold italic text-[var(--ink)]/70", children: [
              '"',
              item.coachFeedback,
              '"'
            ] })
          ] })
        ] }, idx)) })
      ] })
    ] })
  ] }) });
}

const {Target,TrendingUp} = await importShared('lucide-react');

function HabitStats({ todayCompletionPercentage, getMotivationalMessage }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mt-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card bg-[var(--accent)]/5 border-[var(--accent)]/20 p-6 flex flex-col justify-between border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "label-caps !mb-4 flex items-center gap-2 text-[var(--accent)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Target, { size: 14 }),
          "Fokus heute"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium leading-relaxed opacity-70 text-[var(--ink)]", children: getMotivationalMessage(todayCompletionPercentage) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-6 h-1.5 w-full bg-[var(--bg2)] rounded-full overflow-hidden border border-[var(--line)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-full bg-[var(--accent)] transition-all duration-1000", style: { width: `${todayCompletionPercentage}%` } }) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-6 border-dashed border-[var(--line)]/50 bg-[var(--card)] border", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "label-caps !mb-4 flex items-center gap-2 text-[var(--dim)]", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(TrendingUp, { size: 14, className: "text-[var(--dim)]" }),
        "Psychologie"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-medium opacity-50 leading-relaxed italic text-[var(--dim)]", children: '"Motivation bringt dich in Gang. Gewohnheit hält dich am Laufen." – Jim Ryun. Konzentriere dich darauf, die Kette nicht zu unterbrechen.' })
    ] })
  ] });
}

const {useState: useState$1,useEffect,useMemo} = await importShared('react');

const {Star,CalendarDays,Activity} = await importShared('lucide-react');
function Habits() {
  const [habits, setHabits] = useState$1([]);
  const [loading, setLoading] = useState$1(true);
  const [newHabit, setNewHabit] = useState$1("");
  const [selectedIcon, setSelectedIcon] = useState$1("Activity");
  const [saving, setSaving] = useState$1(false);
  const [selectedDate, setSelectedDate] = useState$1(localToday());
  const [editingHabitId, setEditingHabitId] = useState$1(null);
  const [editingIcon, setEditingIcon] = useState$1(null);
  const [selectedHabitId, setSelectedHabitId] = useState$1(null);
  const [selectedSidebarDate, setSelectedSidebarDate] = useState$1(localToday());
  const [journalText, setJournalText] = useState$1("");
  const [journalHistory, setJournalHistory] = useState$1([]);
  const [isJournalSaving, setIsJournalSaving] = useState$1(false);
  const [journalModalOpen, setJournalModalOpen] = useState$1(false);
  const rollingDates = useMemo(() => getRollingDays(28), []);
  const recentDates = useMemo(() => getRollingDays(10), []);
  async function load() {
    setLoading(true);
    try {
      const allHabits = await getHabits();
      const completedHabitIdsForSelectedDate = await getHabitRecordsForDate(selectedDate);
      const habitsWithStatus = allHabits.filter((h) => !h.deleted).map((h) => ({
        ...h,
        isDoneForSelectedDate: completedHabitIdsForSelectedDate.includes(h.uuid)
      }));
      setHabits(habitsWithStatus);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, [selectedDate]);
  useEffect(() => {
    setSelectedSidebarDate(selectedDate);
  }, [selectedDate]);
  useEffect(() => {
    if (selectedHabitId && selectedSidebarDate) {
      setJournalText("");
      getHabitJournal(selectedHabitId, selectedSidebarDate).then((j) => {
        setJournalText(j?.text || "");
      });
    }
    if (selectedHabitId) {
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
    }
  }, [selectedHabitId, selectedSidebarDate]);
  useEffect(() => {
    if (editingHabitId) {
      const habitToEdit = habits.find((h) => h.uuid === editingHabitId);
      setEditingIcon(habitToEdit?.icon || "Activity");
    } else {
      setEditingIcon(null);
    }
  }, [editingHabitId, habits]);
  async function toggleCheck(h) {
    if (h.isDoneForSelectedDate) {
      await unrecordHabit(h.uuid);
    } else {
      await recordHabit(h.uuid);
    }
    load();
  }
  async function toggleSidebarDone(habitId, date) {
    const h = habits.find((x) => x.uuid === habitId);
    const isDone = h?.records?.some((r) => r.date === date && r.completion === "DONE");
    if (isDone) {
      await unrecordHabit(habitId);
    } else {
      await recordHabit(habitId);
    }
    load();
  }
  async function onSaveJournal(textOverride = null) {
    const textToSave = textOverride !== null ? textOverride : journalText;
    if (!selectedHabitId || !selectedSidebarDate) return;
    setIsJournalSaving(true);
    try {
      await saveHabitJournal(selectedHabitId, selectedSidebarDate, textToSave);
      getHabitJournalHistory(selectedHabitId).then(setJournalHistory);
    } finally {
      setIsJournalSaving(false);
    }
  }
  async function handleAdd(e) {
    e.preventDefault();
    if (!newHabit.trim()) return;
    setSaving(true);
    try {
      await addHabit(newHabit.trim(), selectedIcon);
      setNewHabit("");
      setSelectedIcon("Activity");
      load();
    } finally {
      setSaving(false);
    }
  }
  async function handleDelete(uuid) {
    if (!confirm("Habit wirklich löschen?")) return;
    await deleteHabit(uuid);
    load();
  }
  const overallConsistency = habits.length === 0 ? 0 : habits.reduce((totalConsistency, h) => {
    const habitDoneCount = (h.records || []).filter((r) => rollingDates.includes(r.date) && r.completion === "DONE").length;
    return totalConsistency + habitDoneCount / rollingDates.length;
  }, 0) / habits.length;
  const todayCompletionPercentage = habits.length === 0 ? 0 : habits.filter((h) => h.isDoneForSelectedDate).length / habits.length * 100;
  function getMotivationalMessage(percentage) {
    if (percentage === 100) return "Hervorragend! Alle Habits erledigt! Weiter so!";
    if (percentage >= 50) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Fast geschafft! Bleib dran!`;
    if (percentage > 0) return `Du hast ${Math.round(percentage)}% deiner Habits erledigt. Guter Start! Aber da geht noch mehr!`;
    return "Der Tag hat gerade erst begonnen! Fang jetzt an und hol dir die ersten Checks!";
  }
  const updateHabitName = (uuid, name) => {
    setHabits((prev) => prev.map((h) => h.uuid === uuid ? { ...h, name } : h));
  };
  const finishEditing = async () => {
    const h = habits.find((x) => x.uuid === editingHabitId);
    if (h) {
      await updateHabit(h.uuid, h.name.trim(), editingIcon);
    }
    setEditingHabitId(null);
    setEditingIcon(null);
    load();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pb-32 px-2 sm:px-4 lg:px-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-10 flex flex-col gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black text-[var(--ink)] mb-1", children: "Deine Habits" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold opacity-30 uppercase tracking-[0.2em]", children: "Konsistenz schlägt Intensität" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 bg-[var(--card)] border border-[var(--line)] px-4 py-2.5 rounded-2xl shadow-xl", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-end", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[9px] font-black uppercase tracking-widest opacity-30", children: "Gesamt-Score" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-lg font-black text-[var(--accent)]", children: [
              Math.round(overallConsistency * 100),
              "%"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center text-[var(--accent)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { size: 20, fill: "currentColor", fillOpacity: 0.2 }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 overflow-x-auto pb-4 hide-scrollbar -mx-2 px-2", children: [
        recentDates.map((d) => {
          const isSelected = d === selectedDate;
          const isToday = d === localToday();
          const dateObj = new Date(d);
          const weekday = dateObj.toLocaleDateString("de-DE", { weekday: "short" });
          const dayNum = dateObj.getDate();
          return /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setSelectedDate(d),
              className: `flex-shrink-0 flex flex-col items-center min-w-[52px] py-3 rounded-2xl border transition-all
                  ${isSelected ? "bg-[var(--accent)] border-[var(--accent)] text-black shadow-lg shadow-[var(--accent)]/20 scale-105 z-10" : "bg-[var(--card)] border-[var(--line)] text-[var(--dim)] hover:border-[var(--accent)]/50"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `text-[8px] font-black uppercase tracking-widest mb-1 ${isSelected ? "opacity-70" : "opacity-40"}`, children: weekday }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-black tracking-tighter", children: dayNum }),
                isToday && !isSelected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-1 h-1 rounded-full bg-[var(--accent)] mt-1" })
              ]
            },
            d
          );
        }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-shrink-0 pl-4 border-l border-[var(--line)]/30 flex items-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 rounded-2xl bg-[var(--card)] border border-[var(--line)] text-[var(--ink)] text-[10px] font-black uppercase tracking-widest flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(CalendarDays, { size: 14, className: "text-[var(--dim)]" }),
          new Date(selectedDate).toLocaleDateString("de-DE", { month: "short" })
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        HabitForm,
        {
          newHabit,
          setNewHabit,
          selectedIcon,
          setSelectedIcon,
          onAdd: handleAdd,
          saving
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "label-caps px-1 text-[var(--dim)]", children: "Aktive Habits" }),
        habits.length === 0 && !loading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "card p-12 text-center opacity-30 border-dashed bg-[var(--card)] border-[var(--line)]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Activity, { size: 32, className: "mx-auto mb-3 text-[var(--dim)]" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-bold uppercase tracking-widest text-[var(--dim)]", children: "Noch keine Habits" })
        ] }),
        habits.map((h) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          HabitItem,
          {
            h,
            isSelected: selectedHabitId === h.uuid,
            isEditing: editingHabitId === h.uuid,
            editingIcon,
            setEditingIcon,
            setEditingHabitId,
            onToggleSelection: () => setSelectedHabitId(selectedHabitId === h.uuid ? null : h.uuid),
            onToggleCheck: toggleCheck,
            onDelete: handleDelete,
            onUpdateName: updateHabitName,
            onFinishEditing: finishEditing,
            selectedDate
          },
          h.uuid
        ))
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HabitStats,
      {
        todayCompletionPercentage,
        getMotivationalMessage
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HabitSidebar,
      {
        selectedHabitId,
        setSelectedHabitId,
        habits,
        rollingDates,
        selectedSidebarDate,
        setSelectedSidebarDate,
        journalText,
        isJournalSaving,
        onToggleSidebarDone: toggleSidebarDone,
        journalHistory,
        onOpenJournalModal: () => setJournalModalOpen(true)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      HabitJournalModal,
      {
        open: journalModalOpen,
        onClose: () => setJournalModalOpen(false),
        habit: habits.find((h) => h.uuid === selectedHabitId),
        date: selectedSidebarDate,
        journalText,
        setJournalText,
        isJournalSaving,
        onSaveJournal
      }
    ),
    selectedHabitId && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 z-40", onClick: () => setSelectedHabitId(null) })
  ] });
}

const {useState} = await importShared('react');

const {BookOpen,CheckSquare} = await importShared('lucide-react');
const TABS = [
  { id: "journal", label: "Journal", Icon: BookOpen, View: Journal },
  { id: "habits", label: "Habits", Icon: CheckSquare, View: Habits }
];
function App() {
  const [tab, setTab] = useState("journal");
  const Active = TABS.find((t) => t.id === tab)?.View;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { style: {
    display: "flex",
    flexDirection: "column",
    height: "100dvh",
    background: "#0a0a0f",
    color: "#e2e8f0",
    fontFamily: "system-ui, sans-serif"
  }, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("nav", { style: { display: "flex", borderBottom: "1px solid #1e293b", flexShrink: 0 }, children: TABS.map(({ id, label, Icon }) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setTab(id), style: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "12px 0",
      border: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 500,
      transition: "all 0.15s",
      background: tab === id ? "#0f172a" : "transparent",
      color: tab === id ? "#e2e8f0" : "#475569",
      borderBottom: tab === id ? "2px solid #3b82f6" : "2px solid transparent"
    }, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { size: 16 }),
      label
    ] }, id)) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { style: { flex: 1, overflowY: "auto" }, children: Active && /* @__PURE__ */ jsxRuntimeExports.jsx(Active, {}) })
  ] });
}

export { App as default, jsxRuntimeExports as j };

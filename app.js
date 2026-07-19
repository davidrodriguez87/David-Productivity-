"use strict";
const { useState, useMemo, useEffect, useRef } = React;
/* ============================== ICONOS (SVG propios, sin dependencias) ============================== */
function Icon({ path, size = 20, strokeWidth = 2 }) {
    return (React.createElement("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" }, path));
}
const Check = (p) => React.createElement(Icon, { ...p, path: React.createElement("path", { d: "M20 6 9 17l-5-5" }) });
const Minus = (p) => React.createElement(Icon, { ...p, path: React.createElement("path", { d: "M5 12h14" }) });
const X = (p) => React.createElement(Icon, { ...p, path: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M18 6 6 18" }),
        React.createElement("path", { d: "M6 6l12 12" })) });
const Plus = (p) => React.createElement(Icon, { ...p, path: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M12 5v14" }),
        React.createElement("path", { d: "M5 12h14" })) });
const Lock = (p) => React.createElement(Icon, { ...p, path: React.createElement(React.Fragment, null,
        React.createElement("rect", { x: "3", y: "11", width: "18", height: "11", rx: "2" }),
        React.createElement("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })) });
const Pencil = (p) => React.createElement(Icon, { ...p, path: React.createElement("path", { d: "M12.9 3.1a2 2 0 0 1 2.8 0l1.2 1.2a2 2 0 0 1 0 2.8L6.7 17.3 3 18l.7-3.7Z" }) });
const FolderIcon = (p) => React.createElement(Icon, { ...p, path: React.createElement("path", { d: "M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" }) });
const ChevronRight = (p) => React.createElement(Icon, { ...p, path: React.createElement("path", { d: "M9 6l6 6-6 6" }) });
const ChevronLeft = (p) => React.createElement(Icon, { ...p, path: React.createElement("path", { d: "M15 6l-6 6 6 6" }) });
const Briefcase = (p) => React.createElement(Icon, { ...p, path: React.createElement(React.Fragment, null,
        React.createElement("rect", { x: "2.5", y: "7.5", width: "19", height: "12.5", rx: "2" }),
        React.createElement("path", { d: "M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" }),
        React.createElement("path", { d: "M2.5 13h19" })) });
const Trash = (p) => React.createElement(Icon, { ...p, path: React.createElement(React.Fragment, null,
        React.createElement("path", { d: "M4 7h16" }),
        React.createElement("path", { d: "M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" }),
        React.createElement("path", { d: "M6 7l1 13.5A1.5 1.5 0 0 0 8.5 22h7a1.5 1.5 0 0 0 1.5-1.5L18 7" })) });
/* ============================== TOKENS — paleta cálida y elegante ============================== */
const C = {
    bg: '#FFFFFF', panel: '#FFFDFB', panelSoft: '#F6E9DC', line: '#EADBC8',
    ink: '#3A2A22', muted: '#8B7360',
    persimmon: '#DD6549', gold: '#E3A03D', plum: '#7C3F52',
    green: '#6E9B5E', greenBg: 'rgba(110,155,94,0.15)',
    orange: '#C1702E', orangeBg: 'rgba(193,112,46,0.16)',
    red: '#A8402C', redBg: 'rgba(168,64,44,0.14)',
    blue: '#3E76A6', blueBg: 'rgba(62,118,166,0.15)',
    purple: '#7B5EA0', purpleBg: 'rgba(123,94,160,0.15)',
    lightBlue: '#6FAFCE', lightBlueBg: 'rgba(111,175,206,0.16)',
};
const DAY_LETTERS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
function Portal({ children }) {
    return ReactDOM.createPortal(children, document.body);
}
// Guarda y recupera datos reales en el teléfono usando localStorage, para que nada se pierda al cerrar la app.
function usePersistentState(key, initialValue) {
    const fullKey = `davidProductivity_${key}`;
    const [state, setState] = useState(() => {
        try {
            const raw = localStorage.getItem(fullKey);
            return raw !== null ? JSON.parse(raw) : initialValue;
        }
        catch (e) {
            return initialValue;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem(fullKey, JSON.stringify(state));
        }
        catch (e) { /* almacenamiento no disponible */ }
    }, [state]);
    return [state, setState];
}
/* ============================== UTILIDADES DE FECHA ============================== */
const pad2 = n => String(n).padStart(2, '0');
const todayStr = (d = new Date()) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
const uid = () => Math.random().toString(36).slice(2, 9);
function lastNDays(n) {
    const out = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        out.push(todayStr(d));
    }
    return out;
}
function daysElapsedInMonth() { return new Date().getDate(); }
function monthName() { return new Date().toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }); }
function getMonthGridCells() {
    const now = new Date();
    const year = now.getFullYear(), month = now.getMonth();
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7; // Lunes = 0
    const total = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++)
        cells.push(null);
    for (let d = 1; d <= total; d++)
        cells.push(d);
    return cells;
}
function getMonthGridCellsFor(year, month) {
    const first = new Date(year, month, 1);
    const startWeekday = (first.getDay() + 6) % 7;
    const total = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++)
        cells.push(null);
    for (let d = 1; d <= total; d++)
        cells.push(d);
    return cells;
}
function monthNameFor(year, month) {
    return new Date(year, month, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}
function fmtDateLong(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
function fmtDateShort(iso) {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' });
}
/* ============================== LÓGICA DE HÁBITOS ============================== */
// historial: { 'YYYY-MM-DD': { habitId: 'si' | 'medio' | 'no' } }
function dayStatusesForDate(habitos, historial, iso, isPast) {
    const rec = historial[iso] || {};
    return habitos.map(h => rec[h.id] || (isPast ? 'no' : null));
}
function dayColorKey(statuses) {
    if (statuses.length === 0 || statuses.some(s => s === null))
        return null; // sin resolver / futuro
    if (statuses.every(s => s === 'si'))
        return 'green';
    if (statuses.every(s => s === 'no'))
        return 'red';
    return 'orange';
}
function valueOf(status) { return status === 'si' ? 1 : status === 'medio' ? 0.5 : 0; }
function todayPercent(habitos, historial) {
    if (!habitos.length)
        return 0;
    const today = todayStr();
    const rec = historial[today] || {};
    const sum = habitos.reduce((acc, h) => acc + valueOf(rec[h.id]), 0);
    return Math.round((sum / habitos.length) * 100);
}
function last30ComplianceCount(habitos, historial) {
    const days = lastNDays(30);
    let count = 0;
    days.forEach(iso => {
        const statuses = dayStatusesForDate(habitos, historial, iso, true);
        if (!statuses.length)
            return;
        const allSi = statuses.every(s => s === 'si');
        const allMedio = statuses.every(s => s === 'medio');
        if (allSi || allMedio)
            count++; // debe ser uniforme: todos al 100% o todos al 50%
    });
    return count;
}
function weeklyGoodDays(habitos, historial) {
    if (!habitos.length)
        return 0;
    const today = todayStr();
    let count = 0;
    lastNDays(7).forEach(iso => {
        const isPast = iso < today;
        const statuses = dayStatusesForDate(habitos, historial, iso, isPast);
        // aquí sí cuenta "a medias": basta con que cada hábito esté en 'si' o 'medio' (no mezcla obligatoria)
        if (statuses.every(s => s === 'si' || s === 'medio'))
            count++;
    });
    return count;
}
function todayStatuses(habitos, historial) {
    const today = todayStr();
    const rec = historial[today] || {};
    return habitos.map(h => rec[h.id] || 'no');
}
function gaugeColorKey(statuses) {
    if (!statuses.length)
        return 'red';
    if (statuses.every(s => s === 'si'))
        return 'green';
    if (statuses.every(s => s === 'no'))
        return 'red';
    return 'orange'; // completo a medias, o mezcla de estados
}
/* ============================== DATOS INICIALES ============================== */
const HABITOS_DEFAULT = [
    { id: 'h1', nombre: 'Dormir temprano' },
];
/* ============================== LÓGICA AQUAFEEL (puertas / citas / ventas) ============================== */
// aquafeelMetrics: { 'YYYY-MM-DD': { puertas, citas, ventas } }
function aquafeelDayColorKey(m, isPast, isToday) {
    const has = m && (m.puertas > 0 || m.citas > 0 || m.ventas > 0);
    if (!isPast && !isToday)
        return null; // día futuro, sin color
    if (isToday && !has)
        return null; // día en curso, aún nada registrado
    const mm = m || { puertas: 0, citas: 0, ventas: 0 };
    if (mm.ventas > 0)
        return 'blue'; // venta registrada ese día = siempre azul
    if (mm.citas === 0)
        return 'red'; // no se sacaron citas ese día
    if (mm.puertas >= 15 && mm.citas >= 6)
        return 'green'; // día fuerte
    return 'orange'; // actividad moderada
}
function buildMonthSeries(metrics, year, month) {
    const totalDays = new Date(year, month + 1, 0).getDate();
    const puertas = [], citas = [], ventas = [];
    for (let d = 1; d <= totalDays; d++) {
        const iso = `${year}-${pad2(month + 1)}-${pad2(d)}`;
        const m = metrics[iso] || { puertas: 0, citas: 0, ventas: 0 };
        puertas.push(m.puertas || 0);
        citas.push(m.citas || 0);
        ventas.push(m.ventas || 0);
    }
    return { puertas, citas, ventas, totalDays };
}
function sumArr(a) { return a.reduce((s, v) => s + v, 0); }
function getMonthsWithData(metrics, excludeYear, excludeMonth) {
    const set = new Set();
    Object.keys(metrics).forEach(iso => {
        const [y, m] = iso.split('-').map(Number);
        if (!(y === excludeYear && (m - 1) === excludeMonth))
            set.add(`${y}-${pad2(m)}`);
    });
    return Array.from(set).sort().reverse();
}
/* ============================== GAUGE (arco cálido tipo amanecer) ============================== */
function Gauge({ value = 0, colorKey = 'red', size = 168, stroke = 13 }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const pct = Math.max(0, Math.min(100, value));
    const arcLen = c * 0.75;
    const offset = arcLen - (pct / 100) * arcLen;
    const accent = colorKey === 'green' ? C.green : colorKey === 'orange' ? C.orange : C.red;
    const ticks = Array.from({ length: 22 });
    return (React.createElement("div", { style: { position: 'relative', width: size, height: size, flexShrink: 0 } },
        React.createElement("svg", { width: size, height: size, viewBox: `0 0 ${size} ${size}` },
            React.createElement("g", { transform: `rotate(135 ${size / 2} ${size / 2})` },
                React.createElement("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: C.line, strokeWidth: stroke, strokeDasharray: `${c * 0.75} ${c}`, strokeLinecap: "round" }),
                React.createElement("circle", { cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: accent, strokeWidth: stroke, strokeDasharray: `${c * 0.75} ${c}`, strokeDashoffset: offset, strokeLinecap: "round", style: { transition: 'stroke-dashoffset 700ms cubic-bezier(.2,.9,.25,1)' } })),
            ticks.map((_, i) => {
                const a = (135 + (i / 21) * 270) * Math.PI / 180;
                const rO = r + stroke / 2 + 5, rI = r + stroke / 2 + 9;
                const cx = size / 2, cy = size / 2;
                const lit = (i / 21) * 100 <= pct;
                return React.createElement("line", { key: i, x1: cx + rO * Math.cos(a), y1: cy + rO * Math.sin(a), x2: cx + rI * Math.cos(a), y2: cy + rI * Math.sin(a), stroke: lit ? accent : C.line, strokeWidth: "2", strokeLinecap: "round" });
            })),
        React.createElement("div", { style: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' } },
            React.createElement("span", { className: "gd-mono", style: { fontWeight: 700, fontSize: 34, color: accent, lineHeight: 1 } },
                pct,
                "%"),
            React.createElement("span", { style: { fontSize: 10.5, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginTop: 6, textAlign: 'center' } }, "cumplido hoy"))));
}
/* ============================== CALENDARIO MENSUAL ============================== */
function MonthCalendar({ habitos, historial }) {
    const cells = getMonthGridCells();
    const today = todayStr();
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5, marginBottom: 5 } }, DAY_LETTERS.map(l => React.createElement("div", { key: l, style: { textAlign: 'center', fontSize: 9.5, color: C.muted, fontWeight: 600 } }, l))),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 } }, cells.map((d, i) => {
            if (!d)
                return React.createElement("div", { key: i });
            const now = new Date();
            const iso = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(d)}`;
            const isPast = iso < today;
            const isToday = iso === today;
            const statuses = dayStatusesForDate(habitos, historial, iso, isPast);
            const key = dayColorKey(statuses);
            const bg = key === 'green' ? C.greenBg : key === 'orange' ? C.orangeBg : key === 'red' ? C.redBg : C.panelSoft;
            const fg = key === 'green' ? C.green : key === 'orange' ? C.orange : key === 'red' ? C.red : C.muted;
            return (React.createElement("div", { key: i, title: `Día ${d}`, style: {
                    aspectRatio: '1/1', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: bg, color: fg, fontSize: 11, fontWeight: 600, fontFamily: 'JetBrains Mono, monospace',
                    border: isToday ? `1.5px solid ${C.plum}` : '1.5px solid transparent',
                } }, d));
        })),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 6, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.line}` } }, [{ c: C.green, bg: C.greenBg, t: 'Cumplí todos mis hábitos' }, { c: C.orange, bg: C.orangeBg, t: 'Cumplí a medias' }, { c: C.red, bg: C.redBg, t: 'No cumplí' }].map((row, i) => (React.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: 8 } },
            React.createElement("div", { style: { width: 16, height: 16, borderRadius: 5, background: row.bg, border: `1.5px solid ${row.c}` } }),
            React.createElement("span", { style: { fontSize: 11.5, color: C.ink } }, row.t)))))));
}
/* ============================== FILA DE HÁBITO (Sí / A medias / No + editar) ============================== */
function HabitRow({ habito, status, onSet, onRename }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(habito.nombre);
    const options = [
        { key: 'si', label: 'Sí', Icon: Check, color: C.green, bg: C.greenBg },
        { key: 'medio', label: 'A medias', Icon: Minus, color: C.orange, bg: C.orangeBg },
        { key: 'no', label: 'No', Icon: X, color: C.red, bg: C.redBg },
    ];
    const save = () => { if (val.trim())
        onRename(habito.id, val.trim()); setEditing(false); };
    return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 12, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '12px 14px' } },
        React.createElement("div", { style: { display: 'flex', gap: 6, flexShrink: 0 } }, options.map(o => {
            const active = status === o.key;
            return (React.createElement("button", { key: o.key, onClick: () => onSet(habito.id, o.key), title: o.label, style: {
                    width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${active ? o.color : C.line}`, background: active ? o.bg : C.panelSoft,
                    color: active ? o.color : C.muted, cursor: 'pointer', transition: 'all 150ms ease',
                } },
                React.createElement(o.Icon, { size: 15, strokeWidth: 2.5 })));
        })),
        editing ? (React.createElement(React.Fragment, null,
            React.createElement("input", { autoFocus: true, value: val, onChange: e => setVal(e.target.value), onKeyDown: e => e.key === 'Enter' && save(), style: { flex: 1, background: C.panelSoft, border: `1px solid ${C.line}`, borderRadius: 10, padding: '7px 11px', color: C.ink, outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: 14 } }),
            React.createElement("button", { onClick: save, title: "Guardar", style: { width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${C.green}`, background: C.greenBg, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 } },
                React.createElement(Check, { size: 14 })),
            React.createElement("button", { onClick: () => { setVal(habito.nombre); setEditing(false); }, title: "Cancelar", style: { width: 30, height: 30, borderRadius: '50%', border: `1.5px solid ${C.line}`, background: C.panelSoft, color: C.muted, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 } },
                React.createElement(X, { size: 14 })))) : (React.createElement(React.Fragment, null,
            React.createElement("p", { style: { fontSize: 14.5, fontWeight: 500, color: C.ink, flex: 1 } }, habito.nombre),
            React.createElement("button", { onClick: () => setEditing(true), title: "Editar h\u00E1bito", style: { width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panelSoft, color: C.plum, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 } },
                React.createElement(Pencil, { size: 13 }))))));
}
/* ============================== AGREGAR HÁBITO ============================== */
function AddHabitCard({ unlocked, green, needed, onAdd }) {
    const [showForm, setShowForm] = useState(false);
    const [nombre, setNombre] = useState('');
    if (!unlocked) {
        return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 12, border: `1.5px dashed ${C.line}`, borderRadius: 16, padding: '14px 16px', color: C.muted } },
            React.createElement("div", { style: { width: 34, height: 34, borderRadius: '50%', background: C.panelSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                React.createElement(Lock, { size: 15 })),
            React.createElement("div", null,
                React.createElement("p", { style: { fontSize: 13, fontWeight: 500, color: C.ink } }, "Agregar un nuevo h\u00E1bito se desbloquea con constancia"),
                React.createElement("p", { style: { fontSize: 12, color: C.muted, marginTop: 2 } },
                    "Llevas ",
                    React.createElement("b", { style: { color: C.plum } }, green),
                    " de los \u00FAltimos 30 d\u00EDas cumplidos \u2014 necesitas al menos ",
                    needed,
                    "."))));
    }
    if (!showForm) {
        return (React.createElement("button", { onClick: () => setShowForm(true), style: { display: 'flex', alignItems: 'center', gap: 10, border: `1.5px dashed ${C.persimmon}`, borderRadius: 16, padding: '14px 16px', background: 'rgba(221,101,73,0.06)', color: C.persimmon, cursor: 'pointer', width: '100%' } },
            React.createElement("div", { style: { width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${C.persimmon}` } },
                React.createElement(Plus, { size: 16 })),
            React.createElement("span", { style: { fontSize: 14, fontWeight: 600 } }, "Agregar nuevo h\u00E1bito")));
    }
    return (React.createElement("div", { style: { border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, background: C.panel } },
        React.createElement("p", { style: { fontSize: 13, fontWeight: 600, marginBottom: 10, color: C.ink } }, "Nuevo h\u00E1bito"),
        React.createElement("input", { autoFocus: true, value: nombre, onChange: e => setNombre(e.target.value), placeholder: "Ej: Escribir en mi diario", style: { width: '100%', background: C.panelSoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: '10px 13px', color: C.ink, outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: 14, marginBottom: 12 } }),
        React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
            React.createElement("button", { onClick: () => { setShowForm(false); setNombre(''); }, style: { borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: `1px solid ${C.line}`, color: C.ink, cursor: 'pointer' } }, "Cancelar"),
            React.createElement("button", { disabled: !nombre.trim(), onClick: () => { onAdd(nombre.trim()); setNombre(''); setShowForm(false); }, style: { borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: C.persimmon, border: 'none', color: '#fff', cursor: nombre.trim() ? 'pointer' : 'not-allowed', opacity: nombre.trim() ? 1 : 0.5 } }, "Guardar"))));
}
function FishingRewardCard({ unlocked, goodDays }) {
    if (!unlocked) {
        return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 12, border: `1.5px dashed ${C.line}`, borderRadius: 16, padding: '14px 16px', color: C.muted } },
            React.createElement("div", { style: { width: 34, height: 34, borderRadius: '50%', background: C.panelSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                React.createElement(Lock, { size: 15 })),
            React.createElement("div", null,
                React.createElement("p", { style: { fontSize: 13, fontWeight: 500, color: C.ink } }, "Tu recompensa semanal se desbloquea con constancia"),
                React.createElement("p", { style: { fontSize: 12, color: C.muted, marginTop: 2 } },
                    "Llevas ",
                    React.createElement("b", { style: { color: C.plum } }, goodDays),
                    " de los \u00FAltimos 7 d\u00EDas cumplidos \u2014 necesitas al menos 6."))));
    }
    return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 12, border: `1.5px solid ${C.green}`, borderRadius: 16, padding: '14px 16px', background: 'rgba(110,155,94,0.08)' } },
        React.createElement("div", { style: { width: 34, height: 34, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: `1.5px solid ${C.green}`, fontSize: 16 } }, "\uD83C\uDFA3"),
        React.createElement("div", null,
            React.createElement("p", { style: { fontSize: 13.5, fontWeight: 600, color: C.green } }, "\u00A1Te ganaste ir a pescar o hacer algo divertido!"),
            React.createElement("p", { style: { fontSize: 11.5, color: C.muted, marginTop: 2 } }, "Cumpliste al menos 6 de los \u00FAltimos 7 d\u00EDas."))));
}
/* ============================== LOGO (imagen provista por el usuario) ============================== */
function LogoImg({ size = 38 }) {
    return React.createElement("img", { src: window.__LOGO_DATA_URI__, width: size, height: size, alt: "David Productivity", style: { display: 'block', borderRadius: Math.round(size * 0.22), boxShadow: '0 2px 6px rgba(58,42,34,0.18)' } });
}
/* ============================== CONTADOR MANUAL (+ / -) ============================== */
function MetricStepper({ label, value, onChange, accent = C.persimmon }) {
    return (React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 13, padding: '9px 11px' } },
        React.createElement("p", { style: { fontSize: 10, color: C.muted, marginBottom: 6 } }, label),
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 } },
            React.createElement("button", { onClick: () => onChange(Math.max(0, value - 1)), style: { width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${C.line}`, background: C.panelSoft, color: C.ink, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, "\u2212"),
            React.createElement("span", { className: "gd-mono", style: { fontSize: 17, fontWeight: 700, color: accent } }, value),
            React.createElement("button", { onClick: () => onChange(value + 1), style: { width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${accent}`, background: `${accent}18`, color: accent, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, "+"))));
}
/* ============================== ALMANAQUE AQUAFEEL (cuadros grandes, meses navegables) ============================== */
function AquafeelCalendar({ metrics, cancelaciones }) {
    const now = new Date();
    const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
    const cells = getMonthGridCellsFor(view.year, view.month);
    const today = todayStr();
    const isCurrentMonth = view.year === now.getFullYear() && view.month === now.getMonth();
    const cancelDates = new Set((cancelaciones || []).map(c => c.fecha));
    const COLORS = {
        green: { fg: C.green, bg: C.greenBg }, orange: { fg: C.orange, bg: C.orangeBg },
        red: { fg: C.red, bg: C.redBg }, blue: { fg: C.blue, bg: C.blueBg },
    };
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 } },
            React.createElement("button", { onClick: () => setView(v => { const m = v.month - 1; return m < 0 ? { year: v.year - 1, month: 11 } : { ...v, month: m }; }), style: { width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panelSoft, color: C.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                React.createElement(ChevronLeft, { size: 15 })),
            React.createElement("p", { className: "gd-display", style: { fontSize: 13.5, fontWeight: 600, textTransform: 'capitalize' } }, monthNameFor(view.year, view.month)),
            React.createElement("button", { onClick: () => setView(v => { const m = v.month + 1; return m > 11 ? { year: v.year + 1, month: 0 } : { ...v, month: m }; }), style: { width: 30, height: 30, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panelSoft, color: C.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                React.createElement(ChevronRight, { size: 15 }))),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 } }, DAY_LETTERS.map(l => React.createElement("div", { key: l, style: { textAlign: 'center', fontSize: 9.5, color: C.muted, fontWeight: 600 } }, l))),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 } }, cells.map((d, i) => {
            if (!d)
                return React.createElement("div", { key: i });
            const iso = `${view.year}-${pad2(view.month + 1)}-${pad2(d)}`;
            const isToday = iso === today;
            const isPast = iso < today;
            const m = metrics[iso];
            const key = aquafeelDayColorKey(m, isPast, isToday);
            const c = key ? COLORS[key] : null;
            const hasCancel = cancelDates.has(iso);
            return (React.createElement("div", { key: i, title: m ? `Puertas: ${m.puertas || 0} · Citas: ${m.citas || 0} · Ventas: ${m.ventas || 0}${hasCancel ? ' · Cancelación registrada' : ''}` : '', style: {
                    position: 'relative', minHeight: 34, borderRadius: 10, padding: '4px 2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    background: c ? c.bg : C.panelSoft, border: isToday ? `1.5px solid ${C.plum}` : `1.5px solid ${c ? c.fg + '55' : 'transparent'}`,
                } },
                hasCancel && React.createElement("div", { style: { position: 'absolute', top: 3, right: 3, width: 6, height: 6, borderRadius: '50%', background: C.red } }),
                React.createElement("span", { className: "gd-mono", style: { fontSize: 11, fontWeight: 700, color: c ? c.fg : C.muted } }, d),
                m && (m.puertas > 0 || m.citas > 0 || m.ventas > 0) && (React.createElement("span", { style: { fontSize: 6.5, color: c ? c.fg : C.muted, lineHeight: 1.1, marginTop: 1, textAlign: 'center' }, className: "gd-mono" },
                    m.puertas || 0,
                    "\u00B7",
                    m.citas || 0,
                    "\u00B7",
                    m.ventas || 0))));
        })),
        React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, paddingTop: 10, borderTop: `1px solid ${C.line}` } },
            [{ c: C.green, bg: C.greenBg, t: 'Muchas puertas y citas' }, { c: C.orange, bg: C.orangeBg, t: 'Actividad moderada' }, { c: C.red, bg: C.redBg, t: 'Sin citas ese día' }, { c: C.blue, bg: C.blueBg, t: 'Venta registrada' }].map((row, i) => (React.createElement("div", { key: i, style: { display: 'flex', alignItems: 'center', gap: 6 } },
                React.createElement("div", { style: { width: 11, height: 11, borderRadius: 3, background: row.bg, border: `1.5px solid ${row.c}` } }),
                React.createElement("span", { style: { fontSize: 10, color: C.ink } }, row.t)))),
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 6 } },
                React.createElement("div", { style: { width: 8, height: 8, borderRadius: '50%', background: C.red } }),
                React.createElement("span", { style: { fontSize: 10, color: C.ink } }, "Cancelaci\u00F3n ese d\u00EDa")))));
}
/* ============================== GRÁFICA DEL MES (puertas / citas / ventas, en barras) ============================== */
function monthCancelCount(cancelaciones, year, month) {
    return cancelaciones.filter(c => { const [y, m] = c.fecha.split('-').map(Number); return y === year && (m - 1) === month; }).length;
}
function MonthChart({ metrics, cancelaciones, year, month }) {
    const { puertas, citas, ventas, totalDays } = useMemo(() => buildMonthSeries(metrics, year, month), [metrics, year, month]);
    const maxVal = Math.max(5, ...puertas, ...citas, ...ventas);
    const puertasTotal = sumArr(puertas), citasTotal = sumArr(citas), ventasTotal = sumArr(ventas);
    const cancelTotal = monthCancelCount(cancelaciones || [], year, month);
    const W = 300, H = 104, padL = 4, padR = 4, padT = 6, padB = 14;
    const plotW = W - padL - padR, plotH = H - padT - padB;
    const slotW = plotW / Math.max(totalDays, 1);
    const barW = Math.max(0.8, slotW / 3 - 0.6);
    const scaleH = v => (v / maxVal) * plotH;
    const tickDays = [1, 5, 10, 15, 20, 25, totalDays].filter((d, i, arr) => d <= totalDays && arr.indexOf(d) === i);
    const series = [
        { label: 'Puertas', color: C.persimmon, data: puertas, total: puertasTotal },
        { label: 'Citas', color: C.gold, data: citas, total: citasTotal },
        { label: 'Ventas', color: C.blue, data: ventas, total: ventasTotal },
    ];
    return (React.createElement("div", null,
        React.createElement("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 8 } }, series.map(s => (React.createElement("div", { key: s.label, style: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: C.ink } },
            React.createElement("div", { style: { width: 9, height: 9, borderRadius: 3, background: s.color } }),
            React.createElement("span", { style: { fontWeight: 600 } }, s.label),
            " ",
            React.createElement("span", { className: "gd-mono", style: { color: C.muted } }, s.total))))),
        React.createElement("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: "112", preserveAspectRatio: "none" },
            React.createElement("line", { x1: padL, y1: H - padB, x2: W - padR, y2: H - padB, stroke: C.line, strokeWidth: "1" }),
            tickDays.map(d => {
                const x = padL + (d - 1) * slotW + slotW / 2;
                return React.createElement("text", { key: d, x: x.toFixed(1), y: H - 3, fontSize: "6", textAnchor: "middle", fill: C.muted }, d);
            }),
            series.map((s, si) => s.data.map((v, i) => {
                if (v <= 0)
                    return null;
                const x = padL + i * slotW + si * (barW + 0.6);
                const h = scaleH(v);
                const y = H - padB - h;
                return React.createElement("rect", { key: `${si}-${i}`, x: x.toFixed(1), y: y.toFixed(1), width: barW.toFixed(1), height: h.toFixed(1), rx: "0.6", fill: s.color });
            }))),
        React.createElement("p", { style: { fontSize: 11, color: C.muted, marginTop: 8 } },
            "De ",
            React.createElement("span", { className: "gd-mono", style: { color: C.ink } }, ventasTotal),
            " venta",
            ventasTotal !== 1 ? 's' : '',
            " se cancelaron ",
            React.createElement("span", { className: "gd-mono", style: { color: cancelTotal > 0 ? C.red : C.ink } }, cancelTotal),
            ".")));
}
/* ============================== PANTALLA: ANALÍTICAS (archivo de meses pasados) ============================== */
function monthSummaryText(metrics, year, month) {
    const { puertas, citas, ventas } = buildMonthSeries(metrics, year, month);
    return { puertasTotal: sumArr(puertas), citasTotal: sumArr(citas), ventasTotal: sumArr(ventas) };
}
function MiniBars({ puertas, citas, ventas }) {
    const max = Math.max(1, puertas, citas, ventas);
    const bars = [{ v: puertas, c: C.persimmon }, { v: citas, c: C.gold }, { v: ventas, c: C.blue }];
    return (React.createElement("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 3, height: 26 } }, bars.map((b, i) => React.createElement("div", { key: i, style: { width: 6, borderRadius: 2, background: b.c, height: `${Math.max(8, (b.v / max) * 26)}px` } }))));
}
function AnaliticasScreen({ metrics, cancelaciones, onBack }) {
    const [mounted, setMounted] = useState(false);
    const [selected, setSelected] = useState(null); // { year, month } | null
    useEffect(() => { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); }, []);
    const now = new Date();
    const months = getMonthsWithData(metrics, now.getFullYear(), now.getMonth());
    return (React.createElement(Portal, null,
        React.createElement("div", { style: {
                position: 'fixed', inset: 0, zIndex: 55, background: C.bg, overflowY: 'auto',
                transform: mounted ? 'translateY(0)' : 'translateY(24px)', opacity: mounted ? 1 : 0,
                transition: 'transform 420ms cubic-bezier(.2,.9,.25,1), opacity 360ms ease',
            } },
            React.createElement("div", { style: { position: 'sticky', top: 0, zIndex: 5, background: 'rgba(251,243,233,0.92)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${C.line}`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 } },
                React.createElement("button", { onClick: () => (selected ? setSelected(null) : onBack()), style: { width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panel, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
                    React.createElement(ChevronLeft, { size: 18 })),
                React.createElement("h1", { className: "gd-display", style: { fontSize: 20, fontWeight: 700 } }, "Anal\u00EDticas")),
            React.createElement("div", { style: { maxWidth: 600, margin: '0 auto', padding: '20px 18px 60px' } }, !selected ? (months.length === 0 ? (React.createElement("p", { style: { color: C.muted, fontSize: 13 } }, "Todav\u00EDa no hay meses cerrados. En cuanto termine el mes actual, aparecer\u00E1 aqu\u00ED.")) : (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, months.map(key => {
                const [y, m] = key.split('-').map(Number);
                const { puertasTotal, citasTotal, ventasTotal } = monthSummaryText(metrics, y, m - 1);
                const cancelTotal = monthCancelCount(cancelaciones || [], y, m - 1);
                return (React.createElement("button", { key: key, onClick: () => setSelected({ year: y, month: m - 1 }), style: {
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                        background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px', cursor: 'pointer',
                    } },
                    React.createElement(MiniBars, { puertas: puertasTotal, citas: citasTotal, ventas: ventasTotal }),
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("span", { className: "gd-display", style: { fontSize: 14.5, fontWeight: 600, textTransform: 'capitalize', color: C.ink, display: 'block' } }, monthNameFor(y, m - 1)),
                        React.createElement("span", { style: { fontSize: 11, color: C.muted } },
                            "De ",
                            puertasTotal,
                            " puertas tocadas se sacaron ",
                            citasTotal,
                            " citas, y se vendi\u00F3 ",
                            ventasTotal,
                            " ",
                            ventasTotal === 1 ? 'vez' : 'veces',
                            cancelTotal > 0 ? ` (${cancelTotal} cancelada${cancelTotal !== 1 ? 's' : ''})` : '',
                            ".")),
                    React.createElement(ChevronRight, { size: 16, color: C.green })));
            })))) : (React.createElement("div", null,
                React.createElement("p", { className: "gd-display", style: { fontSize: 16, fontWeight: 700, marginBottom: 4, textTransform: 'capitalize' } }, monthNameFor(selected.year, selected.month)),
                React.createElement("p", { style: { fontSize: 11.5, color: C.muted, marginBottom: 16 } }, "Registro cerrado de ese mes"),
                React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 20, padding: 18 } },
                    React.createElement(MonthChart, { metrics: metrics, cancelaciones: cancelaciones, year: selected.year, month: selected.month }))))))));
}
/* ============================== CANCELACIONES: modal de motivo + archivo ============================== */
function CancelModal({ onSave, onClose }) {
    const [motivo, setMotivo] = useState('');
    return (React.createElement(Portal, null,
        React.createElement("div", { onClick: onClose, style: { position: 'fixed', inset: 0, zIndex: 65, background: 'rgba(58,42,34,0.4)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16 } },
            React.createElement("div", { onClick: e => e.stopPropagation(), style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 20, padding: 20, width: '100%', maxWidth: 420 } },
                React.createElement("p", { className: "gd-display", style: { fontSize: 15.5, fontWeight: 700, marginBottom: 4 } }, "\u00BFPor qu\u00E9 crees que te cancelaron?"),
                React.createElement("p", { style: { fontSize: 11.5, color: C.muted, marginBottom: 12 } }, "Escribe el motivo para guardarlo en tu archivo"),
                React.createElement("textarea", { autoFocus: true, rows: 3, value: motivo, onChange: e => setMotivo(e.target.value), placeholder: "Ej: Cambi\u00F3 de opini\u00F3n, el precio, no ten\u00EDa el dinero...", style: { width: '100%', background: C.panelSoft, border: `1px solid ${C.line}`, borderRadius: 12, padding: '10px 13px', color: C.ink, outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: 14, marginBottom: 12, resize: 'vertical' } }),
                React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
                    React.createElement("button", { onClick: onClose, style: { borderRadius: 999, padding: '9px 16px', fontSize: 13, fontWeight: 600, background: 'transparent', border: `1px solid ${C.line}`, color: C.ink, cursor: 'pointer' } }, "Cancelar"),
                    React.createElement("button", { disabled: !motivo.trim(), onClick: () => onSave(motivo.trim()), style: { borderRadius: 999, padding: '9px 18px', fontSize: 13, fontWeight: 600, background: C.red, border: 'none', color: '#fff', cursor: motivo.trim() ? 'pointer' : 'not-allowed', opacity: motivo.trim() ? 1 : 0.5 } }, "Guardar"))))));
}
function MotivoRow({ item, onEdit, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(item.motivo);
    const save = () => { if (val.trim())
        onEdit(item.id, val.trim()); setEditing(false); };
    return (React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '13px 16px' } },
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 6 } },
            React.createElement("p", { className: "gd-mono", style: { fontSize: 10.5, color: C.red } }, fmtDateLong(item.fecha)),
            !editing && (React.createElement("div", { style: { display: 'flex', gap: 6, flexShrink: 0 } },
                React.createElement("button", { onClick: () => setEditing(true), style: { width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panelSoft, color: C.plum, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    React.createElement(Pencil, { size: 11 })),
                React.createElement("button", { onClick: () => onDelete(item.id), style: { width: 26, height: 26, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panelSoft, color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
                    React.createElement(Trash, { size: 11 }))))),
        editing ? (React.createElement("div", null,
            React.createElement("textarea", { autoFocus: true, rows: 2, value: val, onChange: e => setVal(e.target.value), style: { width: '100%', background: C.panelSoft, border: `1px solid ${C.line}`, borderRadius: 10, padding: '8px 11px', color: C.ink, outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: 13.5, marginBottom: 8, resize: 'vertical' } }),
            React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
                React.createElement("button", { onClick: () => { setVal(item.motivo); setEditing(false); }, style: { borderRadius: 999, padding: '6px 13px', fontSize: 12, fontWeight: 600, background: 'transparent', border: `1px solid ${C.line}`, color: C.ink, cursor: 'pointer' } }, "Cancelar"),
                React.createElement("button", { onClick: save, style: { borderRadius: 999, padding: '6px 15px', fontSize: 12, fontWeight: 600, background: C.green, border: 'none', color: '#fff', cursor: 'pointer' } }, "Guardar")))) : (React.createElement("p", { style: { fontSize: 13.5, color: C.ink } }, item.motivo))));
}
function MotivosScreen({ cancelaciones, onEdit, onDelete, onBack }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); }, []);
    const sorted = [...cancelaciones].sort((a, b) => b.fecha.localeCompare(a.fecha));
    return (React.createElement(Portal, null,
        React.createElement("div", { style: {
                position: 'fixed', inset: 0, zIndex: 55, background: C.bg, overflowY: 'auto',
                transform: mounted ? 'translateY(0)' : 'translateY(24px)', opacity: mounted ? 1 : 0,
                transition: 'transform 420ms cubic-bezier(.2,.9,.25,1), opacity 360ms ease',
            } },
            React.createElement("div", { style: { position: 'sticky', top: 0, zIndex: 5, background: 'rgba(251,243,233,0.92)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${C.line}`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 } },
                React.createElement("button", { onClick: onBack, style: { width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panel, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
                    React.createElement(ChevronLeft, { size: 18 })),
                React.createElement("h1", { className: "gd-display", style: { fontSize: 20, fontWeight: 700 } }, "Motivos de cancelaci\u00F3n")),
            React.createElement("div", { style: { maxWidth: 600, margin: '0 auto', padding: '20px 18px 60px' } }, sorted.length === 0 ? (React.createElement("p", { style: { color: C.muted, fontSize: 13 } }, "Todav\u00EDa no has registrado ninguna cancelaci\u00F3n.")) : (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, sorted.map(c => React.createElement(MotivoRow, { key: c.id, item: c, onEdit: onEdit, onDelete: onDelete }))))))));
}
/* ============================== CITAS (agenda con clasificación) ============================== */
const CITA_ESTADOS = [
    { key: 'no_show', label: 'No se presentó', color: C.blue },
    { key: 'seguimiento', label: 'Seguimiento', color: C.orange },
    { key: 'presentacion', label: 'Presentaciones', color: C.lightBlue },
    { key: 'venta', label: 'Ventas', color: C.purple },
    { key: 'cancelada', label: 'Cancelada', color: C.red },
];
const CITA_TABS = [
    { key: 'pendiente', label: 'Citas activas', dot: C.green },
    { key: 'no_show', label: 'No se presentó', dot: C.blue },
    { key: 'presentacion', label: 'Presentaciones', dot: C.lightBlue },
    { key: 'venta', label: 'Ventas', dot: C.purple },
    { key: 'seguimiento', label: 'Seguimiento', dot: C.orange },
    { key: 'cancelada', label: 'Canceladas', dot: C.red },
];
function citaDotColor(estado) {
    if (estado === 'no_show')
        return C.blue;
    if (estado === 'seguimiento')
        return C.orange;
    if (estado === 'presentacion')
        return C.lightBlue;
    if (estado === 'venta')
        return C.purple;
    if (estado === 'cancelada')
        return C.red;
    return C.green; // activa / pendiente
}
function CitaRow({ item, onSetEstado, onDelete }) {
    const dot = citaDotColor(item.estado);
    return (React.createElement("div", { style: { position: 'relative', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: '11px 13px' } },
        React.createElement("div", { style: { position: 'absolute', top: 10, right: 10, width: 9, height: 9, borderRadius: '50%', background: dot } }),
        React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8, paddingRight: 16 } },
            React.createElement("div", { style: { minWidth: 0 } },
                React.createElement("p", { className: "gd-mono", style: { fontSize: 10.5, color: C.muted, textTransform: 'capitalize' } },
                    fmtDateShort(item.fecha),
                    item.hora ? ` · ${item.hora}` : ''),
                React.createElement("p", { style: { fontSize: 13.5, color: C.ink, marginTop: 2, fontWeight: 500 } }, item.nombre || 'Sin nombre'),
                item.direccion && React.createElement("p", { style: { fontSize: 11.5, color: C.muted, marginTop: 1 } }, item.direccion))),
        React.createElement("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' } },
            CITA_ESTADOS.map(e => {
                const active = item.estado === e.key;
                return (React.createElement("button", { key: e.key, onClick: () => onSetEstado(item.id, active ? null : e.key), style: {
                        fontSize: 10.5, fontWeight: 600, borderRadius: 999, padding: '5px 10px', cursor: 'pointer',
                        border: `1px solid ${active ? e.color : C.line}`, background: active ? `${e.color}20` : C.panelSoft, color: active ? e.color : C.muted,
                    } }, e.label));
            }),
            item.estado && (React.createElement("button", { onClick: () => onSetEstado(item.id, null), style: { fontSize: 10.5, fontWeight: 600, borderRadius: 999, padding: '5px 10px', cursor: 'pointer', border: `1px solid ${C.green}`, background: `${C.green}18`, color: C.green } }, "Volver a activa")),
            React.createElement("button", { onClick: () => onDelete(item.id), title: "Eliminar cita", style: { width: 24, height: 24, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panelSoft, color: C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: 'auto' } },
                React.createElement(Trash, { size: 11 })))));
}
function FieldLabel({ children }) {
    return React.createElement("p", { style: { fontSize: 9.5, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 } }, children);
}
function CitaForm({ onSave, onCancel }) {
    const [nombre, setNombre] = useState('');
    const [direccion, setDireccion] = useState('');
    const [fecha, setFecha] = useState(todayStr());
    const [hora, setHora] = useState('');
    const inputStyle = { width: '100%', background: C.panelSoft, border: `1px solid ${C.line}`, borderRadius: 10, padding: '9px 11px', color: C.ink, outline: 'none', fontFamily: 'Poppins, sans-serif', fontSize: 13.5 };
    return (React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 12 } },
        React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement(FieldLabel, null, "Nombre del cliente"),
            React.createElement("input", { autoFocus: true, value: nombre, onChange: e => setNombre(e.target.value), placeholder: "Nombre completo", style: inputStyle })),
        React.createElement("div", { style: { marginBottom: 10 } },
            React.createElement(FieldLabel, null, "Direcci\u00F3n"),
            React.createElement("input", { value: direccion, onChange: e => setDireccion(e.target.value), placeholder: "Direcci\u00F3n de la cita", style: inputStyle })),
        React.createElement("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 } },
            React.createElement("div", null,
                React.createElement(FieldLabel, null, "Fecha"),
                React.createElement("input", { type: "date", value: fecha, onChange: e => setFecha(e.target.value), style: inputStyle })),
            React.createElement("div", null,
                React.createElement(FieldLabel, null, "Hora"),
                React.createElement("input", { type: "time", value: hora, onChange: e => setHora(e.target.value), style: inputStyle }))),
        React.createElement("div", { style: { display: 'flex', justifyContent: 'flex-end', gap: 8 } },
            React.createElement("button", { onClick: onCancel, style: { borderRadius: 999, padding: '8px 15px', fontSize: 12.5, fontWeight: 600, background: 'transparent', border: `1px solid ${C.line}`, color: C.ink, cursor: 'pointer' } }, "Cancelar"),
            React.createElement("button", { disabled: !nombre.trim(), onClick: () => onSave({ nombre: nombre.trim(), direccion: direccion.trim(), fecha, hora }), style: { borderRadius: 999, padding: '8px 17px', fontSize: 12.5, fontWeight: 600, background: C.persimmon, border: 'none', color: '#fff', cursor: nombre.trim() ? 'pointer' : 'not-allowed', opacity: nombre.trim() ? 1 : 0.5 } }, "Guardar"))));
}
/* ============================== ANALÍTICAS DE CITAS CANCELADAS ============================== */
function citasMonthStats(citas, eventLog, year, month) {
    const sameMonth = (fecha) => { const [y, m] = fecha.split('-').map(Number); return y === year && (m - 1) === month; };
    const inMonth = citas.filter(c => sameMonth(c.fecha));
    const canceladas = (eventLog || []).filter(e => e.tipo === 'cancelada' && sameMonth(e.fecha)).length;
    const presentaciones = (eventLog || []).filter(e => e.tipo === 'presentacion' && sameMonth(e.fecha)).length;
    return { total: inMonth.length, canceladas, presentaciones };
}
function CitasChart({ citas, eventLog, year, month }) {
    const { total, canceladas, presentaciones } = citasMonthStats(citas, eventLog, year, month);
    const max = Math.max(1, total, canceladas, presentaciones);
    return (React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'flex-end', gap: 6, height: 44 } },
            React.createElement("div", { style: { width: 14, borderRadius: 3, background: C.green, height: `${Math.max(6, (total / max) * 44)}px` } }),
            React.createElement("div", { style: { width: 14, borderRadius: 3, background: C.red, height: `${Math.max(canceladas ? 6 : 0, (canceladas / max) * 44)}px` } }),
            React.createElement("div", { style: { width: 14, borderRadius: 3, background: C.lightBlue, height: `${Math.max(presentaciones ? 6 : 0, (presentaciones / max) * 44)}px` } })),
        React.createElement("p", { style: { fontSize: 11.5, color: C.ink, lineHeight: 1.5 } },
            "De ",
            React.createElement("span", { className: "gd-mono", style: { color: C.green } }, total),
            " citas sacadas se cancelaron ",
            React.createElement("span", { className: "gd-mono", style: { color: C.red } }, canceladas),
            " y se presentaron ",
            React.createElement("span", { className: "gd-mono", style: { color: C.lightBlue } }, presentaciones),
            " veces este mes.")));
}
function CitasAnaliticasScreen({ citas, eventLog, dismissedMonths, onDismissMonth, onBack }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); }, []);
    const now = new Date();
    const dateMap = {};
    citas.forEach(c => { dateMap[c.fecha] = true; });
    (eventLog || []).forEach(e => { dateMap[e.fecha] = true; });
    const months = getMonthsWithData(dateMap, now.getFullYear(), now.getMonth())
        .filter(key => !(dismissedMonths || []).includes(key));
    return (React.createElement(Portal, null,
        React.createElement("div", { style: {
                position: 'fixed', inset: 0, zIndex: 55, background: C.bg, overflowY: 'auto',
                transform: mounted ? 'translateY(0)' : 'translateY(24px)', opacity: mounted ? 1 : 0,
                transition: 'transform 420ms cubic-bezier(.2,.9,.25,1), opacity 360ms ease',
            } },
            React.createElement("div", { style: { position: 'sticky', top: 0, zIndex: 5, background: 'rgba(251,243,233,0.92)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${C.line}`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 } },
                React.createElement("button", { onClick: onBack, style: { width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panel, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
                    React.createElement(ChevronLeft, { size: 18 })),
                React.createElement("h1", { className: "gd-display", style: { fontSize: 19, fontWeight: 700 } }, "Anal\u00EDticas de citas canceladas")),
            React.createElement("div", { style: { maxWidth: 600, margin: '0 auto', padding: '20px 18px 60px' } }, months.length === 0 ? (React.createElement("p", { style: { color: C.muted, fontSize: 13 } }, "Todav\u00EDa no hay meses cerrados.")) : (React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, months.map(key => {
                const [y, m] = key.split('-').map(Number);
                const { total, canceladas, presentaciones } = citasMonthStats(citas, eventLog, y, m - 1);
                return (React.createElement("div", { key: key, style: { display: 'flex', alignItems: 'flex-start', gap: 10, background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: '14px 16px' } },
                    React.createElement("div", { style: { flex: 1, minWidth: 0 } },
                        React.createElement("p", { className: "gd-display", style: { fontSize: 14.5, fontWeight: 600, textTransform: 'capitalize', color: C.ink, marginBottom: 4 } }, monthNameFor(y, m - 1)),
                        React.createElement("p", { style: { fontSize: 11.5, color: C.muted } },
                            "De ",
                            total,
                            " citas sacadas se cancelaron ",
                            canceladas,
                            " y se presentaron ",
                            presentaciones,
                            " veces.")),
                    React.createElement("button", { onClick: () => onDismissMonth(key), title: "Eliminar de anal\u00EDticas", style: { width: 28, height: 28, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panelSoft, color: C.red, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } },
                        React.createElement(Trash, { size: 12 }))));
            })))))));
}
function CitasSection({ citas, setCitas }) {
    const [tab, setTab] = useState('pendiente');
    const [showForm, setShowForm] = useState(false);
    const [showCitasAnaliticas, setShowCitasAnaliticas] = useState(false);
    const [dismissedMonths, setDismissedMonths] = usePersistentState('citas_dismissedMonths', []);
    const [eventLog, setEventLog] = usePersistentState('citas_eventLog', []); // { id, citaId, fecha, tipo: 'cancelada' | 'presentacion' } — sobrevive aunque se elimine la cita
    const now = new Date();
    const addCita = (data) => { setCitas(prev => [...prev, { id: uid(), estado: null, ...data }]); setShowForm(false); };
    const logEvento = (cita, tipo) => setEventLog(log => log.some(e => e.citaId === cita.id && e.tipo === tipo) ? log : [...log, { id: uid(), citaId: cita.id, fecha: cita.fecha, tipo }]);
    const setEstado = (id, estado) => {
        const cita = citas.find(c => c.id === id);
        if (cita && (estado === 'cancelada' || estado === 'presentacion'))
            logEvento(cita, estado);
        setCitas(prev => prev.map(c => c.id === id ? { ...c, estado } : c));
    };
    const deleteCita = (id) => setCitas(prev => prev.filter(c => c.id !== id));
    const dismissMonth = (key) => setDismissedMonths(prev => [...prev, key]);
    const filtered = citas.filter(c => tab === 'pendiente' ? !c.estado : c.estado === tab)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));
    return (React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 22, padding: 18 } },
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 10 } },
            React.createElement("p", { className: "gd-display", style: { fontSize: 15, fontWeight: 700 } }, "Citas"),
            React.createElement("button", { onClick: () => setShowForm(s => !s), style: {
                    display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(221,101,73,0.10)', border: `1px solid ${C.persimmon}`,
                    borderRadius: 999, padding: '6px 12px', cursor: 'pointer', color: C.persimmon,
                } },
                React.createElement(Plus, { size: 13, strokeWidth: 2.4 }),
                React.createElement("span", { style: { fontSize: 12, fontWeight: 600 } }, "Nueva cita"))),
        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', background: C.panelSoft, border: `1px solid ${C.line}`, borderRadius: 16, padding: 14, marginBottom: 14 } },
            React.createElement(CitasChart, { citas: citas, eventLog: eventLog, year: now.getFullYear(), month: now.getMonth() }),
            React.createElement("button", { onClick: () => setShowCitasAnaliticas(true), style: {
                    display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(110,155,94,0.12)', border: `1px solid ${C.green}`,
                    borderRadius: 999, padding: '5px 11px', cursor: 'pointer', color: C.green, flexShrink: 0,
                } },
                React.createElement(FolderIcon, { size: 12, strokeWidth: 2.3 }),
                React.createElement("span", { style: { fontSize: 11, fontWeight: 600 } }, "Anal\u00EDticas"))),
        showForm && React.createElement(CitaForm, { onSave: addCita, onCancel: () => setShowForm(false) }),
        React.createElement("div", { style: { display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 14 } }, CITA_TABS.map(t => {
            const count = citas.filter(c => t.key === 'pendiente' ? !c.estado : c.estado === t.key).length;
            return (React.createElement("button", { key: t.key, onClick: () => setTab(t.key), style: {
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                    border: `1px solid ${tab === t.key ? C.persimmon : C.line}`, background: tab === t.key ? 'rgba(221,101,73,0.12)' : C.panelSoft,
                    color: tab === t.key ? C.persimmon : C.ink,
                } },
                React.createElement("span", { style: { width: 7, height: 7, borderRadius: '50%', background: t.dot, flexShrink: 0 } }),
                t.label,
                count > 0 ? ` (${count})` : ''));
        })),
        React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 8 } },
            filtered.length === 0 && React.createElement("p", { style: { color: C.muted, fontSize: 12.5, textAlign: 'center', padding: '14px 0' } }, "No hay citas en esta categor\u00EDa."),
            filtered.map(c => React.createElement(CitaRow, { key: c.id, item: c, onSetEstado: setEstado, onDelete: deleteCita }))),
        showCitasAnaliticas && React.createElement(CitasAnaliticasScreen, { citas: citas, eventLog: eventLog, dismissedMonths: dismissedMonths, onDismissMonth: dismissMonth, onBack: () => setShowCitasAnaliticas(false) })));
}
/* ============================== PANTALLA: AQUAFEEL ============================== */
function AquafeelScreen({ onBack }) {
    const [mounted, setMounted] = useState(false);
    const [metrics, setMetrics] = usePersistentState('aquafeel_metrics', {});
    const [cancelaciones, setCancelaciones] = usePersistentState('aquafeel_cancelaciones', []);
    const [showAnaliticas, setShowAnaliticas] = useState(false);
    const [showMotivos, setShowMotivos] = useState(false);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [citas, setCitas] = usePersistentState('citas', []);
    useEffect(() => { const t = setTimeout(() => setMounted(true), 10); return () => clearTimeout(t); }, []);
    const today = todayStr();
    const now = new Date();
    const todayMetrics = metrics[today] || { puertas: 0, citas: 0, ventas: 0 };
    const setMetric = (key, value) => setMetrics(prev => ({ ...prev, [today]: { ...(prev[today] || { puertas: 0, citas: 0, ventas: 0 }), [key]: value } }));
    const cancelacionesHoy = cancelaciones.filter(c => c.fecha === today).length;
    const guardarCancelacion = (motivo) => {
        setCancelaciones(prev => [...prev, { id: uid(), fecha: today, motivo }]);
        setShowCancelModal(false);
    };
    const editarMotivo = (id, motivo) => setCancelaciones(prev => prev.map(c => c.id === id ? { ...c, motivo } : c));
    const eliminarMotivo = (id) => setCancelaciones(prev => prev.filter(c => c.id !== id));
    return (React.createElement("div", { style: {
            position: 'fixed', inset: 0, zIndex: 50, background: C.bg, overflowY: 'auto',
            transform: mounted ? 'translateY(0)' : 'translateY(24px)', opacity: mounted ? 1 : 0,
            transition: 'transform 420ms cubic-bezier(.2,.9,.25,1), opacity 360ms ease',
        } },
        React.createElement("div", { style: { position: 'sticky', top: 0, zIndex: 5, background: 'rgba(251,243,233,0.92)', backdropFilter: 'blur(6px)', borderBottom: `1px solid ${C.line}`, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12 } },
            React.createElement("button", { onClick: onBack, style: { width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.line}`, background: C.panel, color: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' } },
                React.createElement(ChevronLeft, { size: 18 })),
            React.createElement("h1", { className: "gd-display", style: { fontSize: 20, fontWeight: 700 } }, "AQUAFEEL")),
        React.createElement("div", { style: { maxWidth: 860, margin: '0 auto', padding: '20px 18px 60px' } },
            React.createElement("div", { style: { display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' } },
                React.createElement("div", { style: { flex: '0 1 190px', display: 'flex', flexDirection: 'column', gap: 9 } },
                    React.createElement(MetricStepper, { label: "Puertas tocadas en el d\u00EDa", value: todayMetrics.puertas, onChange: v => setMetric('puertas', v), accent: C.persimmon }),
                    React.createElement(MetricStepper, { label: "Citas sacadas en el d\u00EDa", value: todayMetrics.citas, onChange: v => setMetric('citas', v), accent: C.gold }),
                    React.createElement(MetricStepper, { label: "Ventas hechas en el d\u00EDa", value: todayMetrics.ventas, onChange: v => setMetric('ventas', v), accent: C.blue })),
                React.createElement("div", { style: { flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: 14 } },
                    React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 22, padding: 18 } },
                        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 } },
                            React.createElement("p", { className: "gd-display", style: { fontSize: 13.5, fontWeight: 600 } }, "Progreso del mes"),
                            React.createElement("button", { onClick: () => setShowAnaliticas(true), style: {
                                    display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(110,155,94,0.12)', border: `1px solid ${C.green}`,
                                    borderRadius: 999, padding: '5px 11px', cursor: 'pointer', color: C.green,
                                } },
                                React.createElement(FolderIcon, { size: 12, strokeWidth: 2.3 }),
                                React.createElement("span", { style: { fontSize: 11, fontWeight: 600 } }, "Anal\u00EDticas"))),
                        React.createElement(MonthChart, { metrics: metrics, cancelaciones: cancelaciones, year: now.getFullYear(), month: now.getMonth() })),
                    React.createElement("div", { style: { background: C.panel, border: `1px solid ${C.line}`, borderRadius: 22, padding: 18 } },
                        React.createElement("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginBottom: 12, flexWrap: 'wrap' } },
                            React.createElement("button", { onClick: () => setShowCancelModal(true), style: {
                                    display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(168,64,44,0.10)', border: `1px solid ${C.red}`,
                                    borderRadius: 999, padding: '5px 11px', cursor: 'pointer', color: C.red,
                                } },
                                React.createElement(X, { size: 12, strokeWidth: 2.5 }),
                                React.createElement("span", { style: { fontSize: 11, fontWeight: 600 } },
                                    "Cancelaciones",
                                    cancelacionesHoy > 0 ? ` (${cancelacionesHoy})` : '')),
                            React.createElement("button", { onClick: () => setShowMotivos(true), style: {
                                    display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(110,155,94,0.12)', border: `1px solid ${C.green}`,
                                    borderRadius: 999, padding: '5px 11px', cursor: 'pointer', color: C.green,
                                } },
                                React.createElement(FolderIcon, { size: 12, strokeWidth: 2.3 }),
                                React.createElement("span", { style: { fontSize: 11, fontWeight: 600 } }, "Motivos"))),
                        React.createElement(AquafeelCalendar, { metrics: metrics, cancelaciones: cancelaciones })),
                    React.createElement(CitasSection, { citas: citas, setCitas: setCitas })))),
        showAnaliticas && React.createElement(AnaliticasScreen, { metrics: metrics, cancelaciones: cancelaciones, onBack: () => setShowAnaliticas(false) }),
        showMotivos && React.createElement(MotivosScreen, { cancelaciones: cancelaciones, onEdit: editarMotivo, onDelete: eliminarMotivo, onBack: () => setShowMotivos(false) }),
        showCancelModal && React.createElement(CancelModal, { onSave: guardarCancelacion, onClose: () => setShowCancelModal(false) })));
}
/* ============================== MENÚ FLOTANTE: CARPETA DE PRODUCTIVIDAD (abanico) ============================== */
const FOLDER_ITEMS = [
    { id: 'aquafeel', label: 'AQUAFEEL', Icon: Briefcase },
];
function ProductivityFab({ onOpenAquafeel }) {
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState(() => ({ x: window.innerWidth - 52, y: window.innerHeight - 96 }));
    const dragging = useRef(false);
    const dragged = useRef(false);
    const start = useRef({ x: 0, y: 0, px: 0, py: 0 });
    const fabSize = 60;
    const clamp = (x, y) => ({
        x: Math.min(Math.max(x, fabSize / 2 + 6), window.innerWidth - fabSize / 2 - 6),
        y: Math.min(Math.max(y, fabSize / 2 + 6), window.innerHeight - fabSize / 2 - 6),
    });
    const onDown = (e) => {
        dragging.current = true;
        dragged.current = false;
        const p = e.touches ? e.touches[0] : e;
        start.current = { x: p.clientX, y: p.clientY, px: pos.x, py: pos.y };
    };
    const onMove = (e) => {
        if (!dragging.current)
            return;
        if (e.cancelable)
            e.preventDefault(); // evita que la página se desplace mientras arrastro el botón
        const p = e.touches ? e.touches[0] : e;
        const dx = p.clientX - start.current.x, dy = p.clientY - start.current.y;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6)
            dragged.current = true;
        if (dragged.current)
            setPos(clamp(start.current.px + dx, start.current.py + dy));
    };
    const onUp = () => { if (dragging.current && !dragged.current)
        setOpen(o => !o); dragging.current = false; };
    useEffect(() => {
        const mv = (e) => onMove(e), up = () => onUp();
        window.addEventListener('mousemove', mv);
        window.addEventListener('mouseup', up);
        window.addEventListener('touchmove', mv, { passive: false });
        window.addEventListener('touchend', up);
        return () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); window.removeEventListener('touchmove', mv); window.removeEventListener('touchend', up); };
    });
    const flipUp = pos.y > window.innerHeight / 2;
    const flipLeft = pos.x > window.innerWidth - 140;
    const radius = 78;
    const n = FOLDER_ITEMS.length;
    const actions = { aquafeel: onOpenAquafeel };
    return (React.createElement(React.Fragment, null,
        open && React.createElement("div", { onClick: () => setOpen(false), style: { position: 'fixed', inset: 0, zIndex: 39, background: 'rgba(58,42,34,0.14)' } }),
        React.createElement("div", { style: { position: 'fixed', left: pos.x, top: pos.y, transform: 'translate(-50%,-50%)', zIndex: 40 } },
            FOLDER_ITEMS.map((item, i) => {
                const spread = n > 1 ? 34 : 0;
                const angleDeg = (flipUp ? 90 : -90) + (flipLeft ? 1 : -1) * (i - (n - 1) / 2) * spread;
                const rad = angleDeg * Math.PI / 180;
                const tx = open ? Math.cos(rad) * radius : 0;
                const ty = open ? -Math.sin(rad) * radius : 0;
                const Ico = item.Icon;
                return (React.createElement("button", { key: item.id, onClick: () => { setOpen(false); actions[item.id] && actions[item.id](); }, style: {
                        position: 'absolute', width: 48, height: 48, left: 0, top: 0, borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        border: `1.5px solid ${C.line}`, background: C.panel, color: C.green,
                        boxShadow: '0 8px 20px rgba(58,42,34,0.16)',
                        transform: `translate(${tx - 24}px, ${ty - 24}px) scale(${open ? 1 : 0.3})`,
                        opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
                        transition: `transform 360ms cubic-bezier(.34,1.56,.64,1) ${open ? i * 40 : 0}ms, opacity 240ms ease ${open ? i * 40 : 0}ms`,
                    } },
                    React.createElement(Ico, { size: 20, strokeWidth: 2 })));
            }),
            open && FOLDER_ITEMS.map((item, i) => {
                const spread = n > 1 ? 34 : 0;
                const angleDeg = (flipUp ? 90 : -90) + (flipLeft ? 1 : -1) * (i - (n - 1) / 2) * spread;
                const rad = angleDeg * Math.PI / 180;
                const tx = Math.cos(rad) * radius, ty = -Math.sin(rad) * radius;
                return (React.createElement("span", { key: item.id + 'l', style: {
                        position: 'absolute', left: tx, top: ty + (ty < 0 ? -32 : 26), transform: 'translateX(-50%)',
                        fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: C.ink, whiteSpace: 'nowrap', pointerEvents: 'none',
                        background: C.panel, padding: '2px 7px', borderRadius: 999, border: `1px solid ${C.line}`,
                        transition: `opacity 200ms ease ${i * 40 + 100}ms`,
                    } }, item.label));
            }),
            React.createElement("button", { onMouseDown: open ? undefined : onDown, onTouchStart: open ? undefined : onDown, onClick: open ? () => setOpen(false) : undefined, title: "Carpeta de productividad", style: {
                    width: fabSize, height: fabSize, borderRadius: '50%', border: 'none', cursor: open ? 'pointer' : (dragging.current ? 'grabbing' : 'grab'),
                    background: `linear-gradient(135deg, #A9CE97, ${C.green})`, boxShadow: '0 10px 24px rgba(110,155,94,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', userSelect: 'none', touchAction: 'none',
                    transform: open ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 280ms ease',
                } }, open ? React.createElement(X, { size: 22 }) : React.createElement(FolderIcon, { size: 22, strokeWidth: 2 })))));
}
/* ============================== APP ============================== */
function App() {
    const [habitos, setHabitos] = usePersistentState('habitos', HABITOS_DEFAULT);
    const [historial, setHistorial] = usePersistentState('historial', {});
    const [screen, setScreen] = useState('inicio');
    const today = todayStr();
    const todayRec = historial[today] || {};
    const setStatus = (habitId, status) => {
        setHistorial(prev => {
            const rec = { ...(prev[today] || {}) };
            rec[habitId] = rec[habitId] === status ? undefined : status; // toca de nuevo para deshacer
            return { ...prev, [today]: rec };
        });
    };
    const addHabito = (nombre) => setHabitos(prev => [...prev, { id: uid(), nombre }]);
    const renameHabito = (id, nombre) => setHabitos(prev => prev.map(h => h.id === id ? { ...h, nombre } : h));
    const pct = todayPercent(habitos, historial);
    const gColor = gaugeColorKey(todayStatuses(habitos, historial));
    const compliant = last30ComplianceCount(habitos, historial);
    const needed = 25;
    const unlocked = compliant >= needed;
    const goodDays = weeklyGoodDays(habitos, historial);
    const weeklyUnlocked = goodDays >= 6;
    return (React.createElement("div", { style: { minHeight: '100vh', background: C.bg, color: C.ink, fontFamily: 'Poppins, sans-serif', position: 'relative' } },
        React.createElement("div", { style: { position: 'absolute', inset: 0, pointerEvents: 'none', background: `radial-gradient(700px 400px at 15% -10%, rgba(227,160,61,0.14), transparent 60%), radial-gradient(600px 400px at 100% 0%, rgba(221,101,73,0.10), transparent 55%)` } }),
        React.createElement("div", { style: { position: 'relative', maxWidth: 720, margin: '0 auto', padding: '30px 20px 60px' } },
            React.createElement("div", { style: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26 } },
                React.createElement(LogoImg, { size: 38 }),
                React.createElement("div", null,
                    React.createElement("h1", { className: "gd-display", style: { fontSize: 19, fontWeight: 700, letterSpacing: '0.02em' } }, "DAVID PRODUCTIVITY"),
                    React.createElement("p", { style: { fontSize: 11.5, color: C.muted, textTransform: 'capitalize' } }, new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })))),
            React.createElement("div", { style: { display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 26 } },
                React.createElement("div", { style: { flex: '1 1 220px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 22, padding: 22 } },
                    React.createElement("p", { className: "gd-display", style: { fontSize: 14.5, fontWeight: 600, alignSelf: 'flex-start', marginBottom: 14 } },
                        "Porcentaje de h\u00E1bitos",
                        React.createElement("br", null),
                        "cumplidos del d\u00EDa"),
                    React.createElement(Gauge, { value: pct, colorKey: gColor })),
                React.createElement("div", { style: { flex: '1 1 260px', background: C.panel, border: `1px solid ${C.line}`, borderRadius: 22, padding: 22 } },
                    React.createElement("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 } },
                        React.createElement("p", { className: "gd-display", style: { fontSize: 14.5, fontWeight: 600 } }, "Calendario"),
                        React.createElement("p", { style: { fontSize: 11, color: C.muted, textTransform: 'capitalize' } }, monthName())),
                    React.createElement(MonthCalendar, { habitos: habitos, historial: historial }))),
            React.createElement("div", { style: { marginBottom: 18 } },
                React.createElement("h2", { className: "gd-display", style: { fontSize: 16, fontWeight: 600, marginBottom: 12 } },
                    "H\u00E1bitos de ",
                    monthName()),
                React.createElement("div", { style: { display: 'flex', flexDirection: 'column', gap: 10 } }, habitos.map(h => React.createElement(HabitRow, { key: h.id, habito: h, status: todayRec[h.id], onSet: setStatus, onRename: renameHabito })))),
            React.createElement(AddHabitCard, { unlocked: unlocked, green: compliant, needed: needed, onAdd: addHabito }),
            React.createElement("div", { style: { marginTop: 12 } },
                React.createElement(FishingRewardCard, { unlocked: weeklyUnlocked, goodDays: goodDays }))),
        React.createElement(ProductivityFab, { onOpenAquafeel: () => setScreen('aquafeel') }),
        screen === 'aquafeel' && React.createElement(AquafeelScreen, { onBack: () => setScreen('inicio') })));
}
document.getElementById('root').dataset.appMounted = 'true';
ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App, null));

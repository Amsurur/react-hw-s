import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  LayoutGrid, Building2, Users, Percent, Megaphone, Wrench, LineChart,
  Settings, ShieldCheck, MessageSquare, Search, Bell, Eye, ChevronDown,
  Send, Save, Clock, X, Check, AlertTriangle, Info, Plus, User, Phone,
  Filter, Calendar, MoreHorizontal, ChevronRight, Wallet, FileText,
  UserX, Volume2, Zap, MessageCircle, ArrowLeft, Sparkles, Loader2
} from "lucide-react";

// ────────────────────────────────────────────────────────────────
// FAKE DATA
// ────────────────────────────────────────────────────────────────

const TEMPLATES = [
  { id: "t1", name: "Приветствие нового лида", lang: "ru", text: "Здравствуйте, {name}! Спасибо за интерес к {project}. Я {manager}, ваш менеджер. Готов ответить на любые вопросы." },
  { id: "t2", name: "Напоминание о показе", lang: "ru", text: "{name}, напоминаем: завтра в 15:00 показ квартиры в {project}. Ждём вас!" },
  { id: "t3", name: "Скидка 5%", lang: "ru", text: "Здравствуйте, {name}! Скидка 5% на квартиры в {project} действует до конца недели." },
  { id: "t4", name: "Салом (таджикский)", lang: "tg", text: "Салом {name}! Ба {project} таваҷҷуҳатон ташаккур." },
  { id: "t5", name: "Welcome (English)", lang: "en", text: "Hello {name}! Thanks for your interest in {project}." }
];

const LEADS = [
  { id: "l1", name: "Алишер Рахимов", phone: "+992 90 123 45 67", project: "ЖК Садбарг", status: "Новый", source: "Instagram", manager: "Фарход С.", hasPhone: true, optedOut: false },
  { id: "l2", name: "Дилноза Каримова", phone: "+992 93 456 78 90", project: "ЖК Садбарг", status: "На связи", source: "Веб-сайт", manager: "Фарход С.", hasPhone: true, optedOut: false },
  { id: "l3", name: "Рустам Шарипов", phone: "+992 92 111 22 33", project: "ЖК Сафо", status: "Просмотр", source: "Рекомендация", manager: "Заррина М.", hasPhone: true, optedOut: false },
  { id: "l4", name: "Мадина Юсупова", phone: "+992 98 555 66 77", project: "ЖК Садбарг", status: "Бронь", source: "Instagram", manager: "Фарход С.", hasPhone: true, optedOut: false },
  { id: "l5", name: "Джамшед Ахмедов", phone: "—", project: "ЖК Сафо", status: "Новый", source: "Билборд", manager: "Заррина М.", hasPhone: false, optedOut: false },
  { id: "l6", name: "Зарина Одилова", phone: "+992 91 999 88 77", project: "ЖК Садбарг", status: "На связи", source: "Веб-сайт", manager: "Фарход С.", hasPhone: true, optedOut: true },
  { id: "l7", name: "Бахтиёр Назаров", phone: "+992 90 333 44 55", project: "ЖК Сафо", status: "Продан", source: "Рекомендация", manager: "Заррина М.", hasPhone: true, optedOut: false },
];

const HISTORY = [
  { id: "h1", date: "10.07.2026 14:32", type: "bulk", text: "Здравствуйте! Скидка 5% на квартиры в ЖК Садбарг до 15 июля...", recipients: 23, delivered: 21, failed: 2, cost: "3.45 TJS", status: "Завершена" },
  { id: "h2", date: "10.07.2026 11:15", type: "single", text: "Алишер, напоминаю: показ завтра в 15:00.", recipients: 1, delivered: 1, failed: 0, cost: "0.05 TJS", status: "Доставлено" },
  { id: "h3", date: "10.07.2026 09:00", type: "auto", text: "Новый лид назначен: Алишер Рахимов, +992 90 123...", recipients: 1, delivered: 1, failed: 0, cost: "0.05 TJS", status: "Доставлено", event: "Новый лид назначен" },
  { id: "h4", date: "09.07.2026 16:22", type: "bulk", text: "Новая планировка появилась в ЖК Сафо! Подробности...", recipients: 47, delivered: 45, failed: 2, cost: "7.05 TJS", status: "Завершена" },
  { id: "h5", date: "09.07.2026 10:14", type: "single", text: "Дилноза, ваша бронь истекает через 2 дня.", recipients: 1, delivered: 1, failed: 0, cost: "0.05 TJS", status: "Доставлено" },
  { id: "h6", date: "08.07.2026 18:00", type: "auto", text: "Бронь Рустама Шарипова истекает через 24 часа.", recipients: 1, delivered: 0, failed: 1, cost: "0.05 TJS", status: "Ошибка", event: "Бронь скоро истекает" },
  { id: "h7", date: "08.07.2026 12:45", type: "bulk", text: "Всем сотрудникам: планёрка в понедельник в 10:00.", recipients: 12, delivered: 12, failed: 0, cost: "0.60 TJS", status: "Завершена" },
  { id: "h8", date: "07.07.2026 15:30", type: "single", text: "Мадина, спасибо за визит! Готов ответить на вопросы.", recipients: 1, delivered: 1, failed: 0, cost: "0.05 TJS", status: "Доставлено" },
];

const AUTO_EVENTS = [
  { id: "e1", event: "Новый лид назначен", recipient: "Менеджер", template: "LEAD_ASSIGNED", enabled: true },
  { id: "e2", event: "Лид передан другому менеджеру", recipient: "Менеджер", template: "LEAD_ASSIGNED", enabled: true },
  { id: "e3", event: "Бронь скоро истекает", recipient: "Менеджер", template: "RESERVATION_EXPIRING", enabled: true },
  { id: "e4", event: "Сделка одобрена", recipient: "Клиент", template: "DEAL_APPROVED", enabled: false },
  { id: "e5", event: "Подтверждение брони", recipient: "Клиент", template: "RESERVATION_CONFIRMED", enabled: false },
];

const SAVED_AUDIENCES = [
  { id: "s1", name: "Все лиды ЖК Садбарг", count: 34, lastUsed: "10.07.2026" },
  { id: "s2", name: "Клиенты с истекающей бронью", count: 8, lastUsed: "08.07.2026" },
  { id: "s3", name: "Новые лиды за неделю", count: 12, lastUsed: "07.07.2026" },
];

const OPTED_OUT = [
  { phone: "+992 91 999 88 77", name: "Зарина Одилова", date: "15.06.2026" },
  { phone: "+992 92 777 66 55", name: "Неизвестный", date: "02.05.2026" },
];

// ────────────────────────────────────────────────────────────────
// STYLING TOKENS (matched to PropTech OS dashboard screenshot)
// ────────────────────────────────────────────────────────────────

const S = {
  bg: "#F5F7FA",
  card: "#FFFFFF",
  border: "#E5E9F0",
  ink: "#1F2937",
  muted: "#6B7280",
  mutedLight: "#9CA3AF",
  primary: "#2B7FFF",
  primaryDark: "#1D6BEB",
  primaryLight: "#EBF3FF",
  good: "#10B981",
  goodLight: "#ECFDF5",
  warn: "#F59E0B",
  warnLight: "#FEF3C7",
  bad: "#EF4444",
  badLight: "#FEE2E2",
  softBg: "#F9FAFB",
};

// ────────────────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────────────────

const SMS_CHARS_PER_PART = 67; // Cyrillic
const COST_PER_PART_TJS = 0.05;

function calcParts(text) {
  if (!text) return 0;
  return Math.max(1, Math.ceil(text.length / SMS_CHARS_PER_PART));
}

function renderTemplate(text, ctx) {
  return text
    .replace(/\{name\}/g, ctx.name || "—")
    .replace(/\{project\}/g, ctx.project || "—")
    .replace(/\{manager\}/g, ctx.manager || "—");
}

// ────────────────────────────────────────────────────────────────
// SIDEBAR
// ────────────────────────────────────────────────────────────────

function Sidebar({ view, setView }) {
  const items = [
    { key: "dash",   label: "Дашборд",       icon: LayoutGrid },
    { key: "prop",   label: "Недвижимость",  icon: Building2 },
    { key: "crm",    label: "CRM",           icon: Users, expandable: true, open: true },
    { key: "leads",  label: "Лиды",          indent: true, active: view === "leads" },
    { key: "clients",label: "Клиенты",       indent: true },
    { key: "deals",  label: "Сделки",        indent: true },
    { key: "disc",   label: "Скидки",        icon: Percent },
    { key: "sms",    label: "SMS",           icon: MessageSquare, active: view === "sms-hub", badge: null },
    { key: "ops",    label: "Операции",      icon: Wrench, expandable: true },
    { key: "an",     label: "Аналитика",     icon: LineChart },
    { key: "set",    label: "Настройки",     icon: Settings, expandable: true },
    { key: "aud",    label: "Аудит",         icon: ShieldCheck },
  ];

  const handleClick = (item) => {
    if (item.key === "leads") setView("leads");
    if (item.key === "sms") setView("sms-hub");
    if (item.key === "dash") setView("dash");
  };

  return (
    <aside style={{ width: 232, background: S.card, borderRight: `1px solid ${S.border}`, padding: "20px 12px", display: "flex", flexDirection: "column", flexShrink: 0, minHeight: "100vh" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 8px 22px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: S.primary, display: "grid", placeItems: "center", color: "#fff", fontWeight: 700, fontSize: 14 }}>P</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: S.ink, letterSpacing: "-0.01em" }}>PropTech OS</div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => handleClick(item)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: item.indent ? "8px 10px 8px 34px" : "9px 10px",
                borderRadius: 8, cursor: "pointer",
                background: item.active ? S.primaryLight : "transparent",
                color: item.active ? S.primary : S.muted,
                border: "none", textAlign: "left",
                fontSize: 13.5, fontWeight: item.active ? 600 : 500,
                transition: "background 0.12s"
              }}
              onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.background = S.softBg; }}
              onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
            >
              {Icon && <Icon size={17} strokeWidth={item.active ? 2.2 : 1.8} />}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.expandable && <ChevronRight size={13} style={{ transform: item.open ? "rotate(90deg)" : "none", opacity: 0.5 }} />}
              {item.badge && <span style={{ background: S.primary, color: "#fff", fontSize: 10, padding: "1px 6px", borderRadius: 8, fontWeight: 600 }}>{item.badge}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

// ────────────────────────────────────────────────────────────────
// TOP BAR
// ────────────────────────────────────────────────────────────────

function TopBar() {
  return (
    <header style={{ height: 60, background: S.card, borderBottom: `1px solid ${S.border}`, padding: "0 24px", display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: S.softBg, border: `1px solid ${S.border}`, borderRadius: 8, cursor: "pointer", fontSize: 13.5, fontWeight: 500, color: S.ink }}>
        <Building2 size={15} />
        ЖК Садбарг
        <ChevronDown size={13} style={{ opacity: 0.6 }} />
      </button>

      <div style={{ flex: 1, maxWidth: 420, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: S.softBg, border: `1px solid ${S.border}`, borderRadius: 8, color: S.mutedLight, fontSize: 13.5 }}>
        <Search size={15} />
        Поиск клиентов, квартир, сделок...
      </div>

      <div style={{ flex: 1 }} />

      <button style={{ padding: "6px 10px", background: S.softBg, border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, fontWeight: 500, color: S.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
        ⌘ K
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", background: S.softBg, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 13, color: S.muted, cursor: "pointer" }}>
        <Eye size={14} />
        Презентация
      </button>
      <button style={{ width: 36, height: 36, borderRadius: 8, background: S.softBg, border: `1px solid ${S.border}`, display: "grid", placeItems: "center", color: S.muted, cursor: "pointer" }}>
        <Bell size={15} />
      </button>
      <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px 6px 6px", background: S.softBg, border: `1px solid ${S.border}`, borderRadius: 999, fontSize: 13, color: S.ink, cursor: "pointer" }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", background: S.primary, color: "#fff", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700 }}>РА</div>
        Рахимов Алишер
        <ChevronDown size={12} style={{ opacity: 0.6 }} />
      </button>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────
// SMS HUB — compose tab
// ────────────────────────────────────────────────────────────────

function ComposeTab({ initialSelectedIds, onSent, quietHoursActive, setQuickModalOpen }) {
  const [text, setText] = useState("Здравствуйте, {name}! Скидка 5% на квартиры в {project} действует до конца недели. С уважением, {manager}.");
  const [preset, setPreset] = useState(initialSelectedIds && initialSelectedIds.length ? "selected" : "all-leads");
  const [manualIds] = useState(initialSelectedIds || []);
  const [scheduleType, setScheduleType] = useState("now");
  const [scheduledAt, setScheduledAt] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const recipients = useMemo(() => {
    if (preset === "selected") return manualIds.length;
    if (preset === "all-leads") return 34;
    if (preset === "new-leads") return 12;
    if (preset === "all-clients") return 47;
    if (preset === "project-clients") return selectedProject ? 23 : 0;
    if (preset === "staff") return 12;
    return 0;
  }, [preset, manualIds, selectedProject]);

  const noPhone = preset === "selected" ? 0 : Math.max(0, Math.floor(recipients * 0.04));
  const optedOut = preset === "selected" ? 0 : Math.max(0, Math.floor(recipients * 0.03));
  const willReceive = Math.max(0, recipients - noPhone - optedOut);

  const parts = calcParts(text);
  const cost = (willReceive * parts * COST_PER_PART_TJS).toFixed(2);

  const previewCtx = {
    name: "Алишер",
    project: "ЖК Садбарг",
    manager: "Фарход С.",
  };
  const rendered = renderTemplate(text, previewCtx);

  const insertToken = (token) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = text.slice(0, start) + token + text.slice(end);
    setText(next);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    }, 0);
  };

  const applyTemplate = (t) => {
    setText(t.text);
    setShowTemplates(false);
  };

  const canSend = willReceive > 0 && text.trim().length > 0 && !sending;

  const handleSend = () => {
    if (!canSend) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onSent(willReceive);
    }, 800);
  };

  const presets = [
    { key: "all-leads",       label: "Все лиды",         count: 34 },
    { key: "new-leads",       label: "Новые лиды",       count: 12 },
    { key: "all-clients",     label: "Все клиенты",      count: 47 },
    { key: "project-clients", label: "Клиенты проекта…", count: null },
    { key: "staff",           label: "Сотрудники",       count: 12 },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20 }}>
      {/* LEFT — composition */}
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

        {/* Selected chip if bulk */}
        {preset === "selected" && (
          <div style={{ padding: "10px 14px", background: S.primaryLight, borderRadius: 10, border: `1px solid ${S.primary}33`, fontSize: 13, color: S.primaryDark, display: "flex", alignItems: "center", gap: 8 }}>
            <Check size={14} />
            Выбрано вручную: {manualIds.length} {manualIds.length === 1 ? "человек" : "человек"}
            <button onClick={() => setPreset("all-leads")} style={{ marginLeft: "auto", background: "transparent", border: "none", color: S.primary, fontSize: 12, cursor: "pointer" }}>Отменить выбор</button>
          </div>
        )}

        {/* Message section */}
        <Card>
          <SectionHead title="Сообщение" hint="Напишите текст или выберите шаблон" />
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Здравствуйте, {name}! ..."
            style={{
              width: "100%", minHeight: 130, padding: "12px 14px",
              border: `1px solid ${S.border}`, borderRadius: 10,
              fontSize: 14, lineHeight: 1.55, resize: "vertical",
              fontFamily: "inherit", color: S.ink, background: S.card,
              outline: "none",
            }}
            onFocus={(e) => e.target.style.borderColor = S.primary}
            onBlur={(e) => e.target.style.borderColor = S.border}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: S.muted, marginRight: 4 }}>Вставить:</span>
            {["{name}", "{project}", "{manager}"].map((tok) => (
              <button
                key={tok}
                onClick={() => insertToken(tok)}
                style={{ padding: "5px 10px", background: S.softBg, border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12.5, color: S.primary, fontFamily: "ui-monospace, monospace", cursor: "pointer", fontWeight: 500 }}
                onMouseEnter={(e) => e.currentTarget.style.background = S.primaryLight}
                onMouseLeave={(e) => e.currentTarget.style.background = S.softBg}
              >
                {tok}
              </button>
            ))}
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                style={{ padding: "6px 12px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12.5, cursor: "pointer", color: S.ink, display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
              >
                <FileText size={13} />
                Шаблоны
                <ChevronDown size={12} />
              </button>
              {showTemplates && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: S.card, border: `1px solid ${S.border}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", width: 320, zIndex: 20, padding: 6 }}>
                  <div style={{ padding: "8px 10px 4px", fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5 }}>Русский</div>
                  {TEMPLATES.filter(t => t.lang === "ru").map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t)} style={{ display: "block", width: "100%", padding: "8px 10px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: 6, fontSize: 13, color: S.ink }} onMouseEnter={(e) => e.currentTarget.style.background = S.softBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <div style={{ fontWeight: 500, marginBottom: 2 }}>{t.name}</div>
                      <div style={{ fontSize: 11.5, color: S.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text}</div>
                    </button>
                  ))}
                  <div style={{ padding: "8px 10px 4px", fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5 }}>Тоҷикӣ</div>
                  {TEMPLATES.filter(t => t.lang === "tg").map(t => (
                    <button key={t.id} onClick={() => applyTemplate(t)} style={{ display: "block", width: "100%", padding: "8px 10px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: 6, fontSize: 13, color: S.ink }} onMouseEnter={(e) => e.currentTarget.style.background = S.softBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: S.muted, textAlign: "right" }}>
            <span style={{ color: text.length > SMS_CHARS_PER_PART * 3 ? S.warn : S.muted }}>{text.length} / 800 символов</span>
            <span style={{ margin: "0 8px", color: S.mutedLight }}>·</span>
            <span style={{ color: parts > 3 ? S.warn : S.muted }}>{parts} {parts === 1 ? "часть" : parts < 5 ? "части" : "частей"}</span>
            <span style={{ margin: "0 8px", color: S.mutedLight }}>·</span>
            ~{(parts * COST_PER_PART_TJS).toFixed(2)} TJS за сообщение
          </div>
        </Card>

        {/* Кому section */}
        {preset !== "selected" && (
          <Card>
            <SectionHead title="Кому" hint="Выберите готовый пресет или настройте фильтры" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {presets.map(p => (
                <button
                  key={p.key}
                  onClick={() => {
                    setPreset(p.key);
                    if (p.key === "project-clients") setShowProjectPicker(true);
                    else setShowProjectPicker(false);
                  }}
                  style={{
                    padding: "9px 14px",
                    background: preset === p.key ? S.primary : S.card,
                    border: `1px solid ${preset === p.key ? S.primary : S.border}`,
                    borderRadius: 999,
                    fontSize: 13, fontWeight: 500,
                    color: preset === p.key ? "#fff" : S.ink,
                    cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 6,
                    transition: "all 0.12s"
                  }}
                >
                  {p.label}
                  {p.count !== null && (
                    <span style={{ fontSize: 11.5, opacity: 0.7, fontWeight: 400 }}>{p.count}</span>
                  )}
                </button>
              ))}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                style={{
                  padding: "9px 14px",
                  background: showAdvanced ? S.softBg : S.card,
                  border: `1px dashed ${S.border}`,
                  borderRadius: 999,
                  fontSize: 13, fontWeight: 500,
                  color: S.muted, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 6
                }}
              >
                <Filter size={13} />
                Настроить…
              </button>
            </div>

            {showProjectPicker && preset === "project-clients" && (
              <div style={{ marginTop: 14, padding: 12, background: S.softBg, borderRadius: 10, border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 12, color: S.muted, marginBottom: 8, fontWeight: 500 }}>Выберите проект</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {["ЖК Садбарг", "ЖК Сафо", "ЖК Ватан"].map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedProject(p)}
                      style={{
                        padding: "7px 12px",
                        background: selectedProject === p ? S.primary : S.card,
                        color: selectedProject === p ? "#fff" : S.ink,
                        border: `1px solid ${selectedProject === p ? S.primary : S.border}`,
                        borderRadius: 8, fontSize: 12.5, cursor: "pointer", fontWeight: 500
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {showAdvanced && (
              <div style={{ marginTop: 14, padding: 14, background: S.softBg, borderRadius: 10, border: `1px solid ${S.border}` }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: S.muted, marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Расширенные фильтры</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  <FieldLabel label="Проекты">
                    <FakeSelect placeholder="Все проекты" />
                  </FieldLabel>
                  <FieldLabel label="Менеджеры">
                    <FakeSelect placeholder="Все менеджеры" />
                  </FieldLabel>
                </div>
                <FieldLabel label="Статусы лида">
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["Новый", "На связи", "Просмотр", "Бронь", "Продан"].map(s => (
                      <span key={s} style={{ padding: "5px 10px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, color: S.ink, cursor: "pointer" }}>{s}</span>
                    ))}
                  </div>
                </FieldLabel>
                <div style={{ marginTop: 10 }}>
                  <FieldLabel label="Источники">
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {["Instagram", "Веб-сайт", "Рекомендация", "Билборд", "Звонок"].map(s => (
                        <span key={s} style={{ padding: "5px 10px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, color: S.ink, cursor: "pointer" }}>{s}</span>
                      ))}
                    </div>
                  </FieldLabel>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* When section */}
        <Card>
          <SectionHead title="Когда" hint="Отправить сейчас или запланировать" />
          <div style={{ display: "flex", gap: 12 }}>
            <RadioBox
              checked={scheduleType === "now"}
              onClick={() => setScheduleType("now")}
              label="Отправить сейчас"
              icon={Send}
            />
            <RadioBox
              checked={scheduleType === "later"}
              onClick={() => setScheduleType("later")}
              label="Запланировать"
              icon={Calendar}
            />
          </div>
          {scheduleType === "later" && (
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              style={{ marginTop: 12, padding: "10px 12px", border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 13.5, color: S.ink, fontFamily: "inherit", outline: "none" }}
            />
          )}
          <div style={{ marginTop: 12, padding: "10px 12px", background: S.softBg, borderRadius: 8, fontSize: 12.5, color: S.muted, display: "flex", alignItems: "center", gap: 8 }}>
            <Volume2 size={13} />
            Тихие часы: 22:00 – 09:00. В это время сообщения не отправляются.
            <a style={{ marginLeft: "auto", color: S.primary, cursor: "pointer", textDecoration: "none" }}>Изменить</a>
          </div>
        </Card>
      </div>

      {/* RIGHT — live panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20, alignSelf: "flex-start" }}>
        <Card padded={false}>
          <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${S.border}` }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5 }}>Предпросмотр</div>
            <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>Пример для: <b style={{ color: S.ink, fontWeight: 500 }}>Алишер Рахимов</b> · ЖК Садбарг</div>
          </div>
          <div style={{ padding: 16, background: S.softBg }}>
            {text.trim() ? (
              <div style={{ background: S.card, padding: "12px 14px", borderRadius: "14px 14px 14px 4px", fontSize: 13.5, lineHeight: 1.5, color: S.ink, border: `1px solid ${S.border}`, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {rendered}
              </div>
            ) : (
              <div style={{ fontSize: 12.5, color: S.mutedLight, textAlign: "center", padding: "20px 0" }}>Начните вводить текст, чтобы увидеть пример</div>
            )}
          </div>
        </Card>

        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Получатели</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: S.ink, letterSpacing: "-0.02em", lineHeight: 1 }}>{recipients}</div>
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6, fontSize: 12.5 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: S.ink }}>
              <span style={{ color: S.muted }}>Получат сообщение</span>
              <b>{willReceive}</b>
            </div>
            {noPhone > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: S.muted }}>
                <span>Без телефона</span>
                <span>{noPhone}</span>
              </div>
            )}
            {optedOut > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: S.muted }}>
                <span>Отписались</span>
                <span>{optedOut}</span>
              </div>
            )}
          </div>
          {quietHoursActive && willReceive > 0 && (
            <div style={{ marginTop: 12, padding: "9px 11px", background: S.warnLight, border: `1px solid ${S.warn}44`, borderRadius: 8, fontSize: 12, color: "#92400E", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>Сейчас тихие часы. Отправим утром в 09:00.</span>
            </div>
          )}
        </Card>

        <Card>
          <div style={{ fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Стоимость</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: S.ink, letterSpacing: "-0.01em" }}>≈ {cost} TJS</div>
          <div style={{ fontSize: 12, color: S.muted, marginTop: 4 }}>{willReceive} × {parts} {parts === 1 ? "часть" : "части"} × 0.05 TJS</div>
        </Card>

        <button
          onClick={handleSend}
          disabled={!canSend}
          style={{
            padding: "14px 20px",
            background: canSend ? S.primary : "#D1D5DB",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14, fontWeight: 600,
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            transition: "background 0.12s"
          }}
          onMouseEnter={(e) => { if (canSend) e.currentTarget.style.background = S.primaryDark; }}
          onMouseLeave={(e) => { if (canSend) e.currentTarget.style.background = S.primary; }}
        >
          {sending ? <Loader2 size={16} className="spin" /> : <Send size={15} />}
          {sending ? "Отправка..." : scheduleType === "now" ? `Отправить (${willReceive})` : `Запланировать (${willReceive})`}
        </button>
        <button style={{ padding: "8px 12px", background: "transparent", border: "none", color: S.muted, fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <Save size={13} />
          Сохранить как черновик
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SMS HUB — history tab
// ────────────────────────────────────────────────────────────────

function HistoryTab() {
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  const filtered = HISTORY.filter(h => {
    if (filter === "all") return true;
    return h.type === filter;
  });

  const typeMap = {
    bulk: { label: "Массовая", color: S.primary, bg: S.primaryLight, icon: Megaphone },
    single: { label: "Одиночная", color: S.good, bg: S.goodLight, icon: MessageCircle },
    auto: { label: "Авто", color: "#7C3AED", bg: "#EDE9FE", icon: Zap }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
        {[
          { key: "all", label: "Все" },
          { key: "bulk", label: "Массовые" },
          { key: "single", label: "Одиночные" },
          { key: "auto", label: "Автоматические" }
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "7px 14px",
              background: filter === f.key ? S.ink : S.card,
              color: filter === f.key ? "#fff" : S.ink,
              border: `1px solid ${filter === f.key ? S.ink : S.border}`,
              borderRadius: 999,
              fontSize: 13, fontWeight: 500, cursor: "pointer"
            }}
          >{f.label}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 12.5, color: S.muted, cursor: "pointer" }}>
          <Calendar size={13} />
          Последние 7 дней
        </div>
      </div>

      <Card padded={false}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: S.softBg }}>
              <Th>Дата</Th>
              <Th>Тип</Th>
              <Th>Сообщение</Th>
              <Th align="right">Получат.</Th>
              <Th align="right">Доставл.</Th>
              <Th align="right">Ошибок</Th>
              <Th align="right">Стоимость</Th>
              <Th>Статус</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(h => {
              const t = typeMap[h.type];
              const T = t.icon;
              return (
                <tr key={h.id} onClick={() => setSelected(h)} style={{ borderTop: `1px solid ${S.border}`, cursor: "pointer" }} onMouseEnter={(e) => e.currentTarget.style.background = S.softBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                  <Td style={{ color: S.muted, whiteSpace: "nowrap" }}>{h.date}</Td>
                  <Td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px", background: t.bg, color: t.color, borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>
                      <T size={11} />
                      {t.label}
                    </span>
                  </Td>
                  <Td style={{ maxWidth: 340 }}>
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: S.ink }}>{h.text}</div>
                  </Td>
                  <Td align="right" style={{ color: S.ink, fontWeight: 500 }}>{h.recipients}</Td>
                  <Td align="right" style={{ color: S.good, fontWeight: 500 }}>{h.delivered}</Td>
                  <Td align="right" style={{ color: h.failed > 0 ? S.bad : S.mutedLight, fontWeight: h.failed > 0 ? 500 : 400 }}>{h.failed}</Td>
                  <Td align="right" style={{ color: S.ink, fontWeight: 500 }}>{h.cost}</Td>
                  <Td>
                    {h.status === "Завершена" || h.status === "Доставлено" ? (
                      <span style={{ padding: "3px 8px", background: S.goodLight, color: "#065F46", borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>{h.status}</span>
                    ) : (
                      <span style={{ padding: "3px 8px", background: S.badLight, color: "#991B1B", borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>{h.status}</span>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {selected && <HistoryDrawer item={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function HistoryDrawer({ item, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", justifyContent: "flex-end", animation: "fadeIn 0.15s" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 480, background: S.card, height: "100%", overflow: "auto", boxShadow: "-8px 0 24px rgba(0,0,0,0.1)" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>{item.date}</div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.ink }}>Сообщение</h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: S.muted, padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ padding: "14px 16px", background: S.softBg, borderRadius: 10, fontSize: 13.5, color: S.ink, lineHeight: 1.55, marginBottom: 20 }}>
            {item.text}
          </div>

          {item.event && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Событие</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#EDE9FE", color: "#7C3AED", borderRadius: 6, fontSize: 12.5, fontWeight: 500 }}>
                <Zap size={12} />
                {item.event}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <Stat label="Получателей" value={item.recipients} />
            <Stat label="Доставлено" value={item.delivered} color={S.good} />
            <Stat label="Стоимость" value={item.cost} />
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>Получатели</div>
          <div style={{ border: `1px solid ${S.border}`, borderRadius: 10, overflow: "hidden" }}>
            {Array.from({ length: Math.min(4, item.recipients) }).map((_, i) => (
              <div key={i} style={{ padding: "10px 14px", borderTop: i === 0 ? "none" : `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                <User size={14} style={{ color: S.mutedLight }} />
                <span style={{ flex: 1, color: S.ink }}>+992 90 {100 + i * 111} {100 + i * 22} {100 + i * 33}</span>
                <span style={{ padding: "2px 8px", background: i === 1 && item.failed > 0 ? S.badLight : S.goodLight, color: i === 1 && item.failed > 0 ? "#991B1B" : "#065F46", borderRadius: 4, fontSize: 11, fontWeight: 500 }}>
                  {i === 1 && item.failed > 0 ? "Ошибка" : "Доставлено"}
                </span>
              </div>
            ))}
          </div>
          {item.failed > 0 && (
            <button style={{ marginTop: 16, padding: "9px 16px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 13, color: S.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              <Send size={13} />
              Повторить неудачные ({item.failed})
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SMS HUB — settings tab
// ────────────────────────────────────────────────────────────────

function SettingsTab() {
  const [section, setSection] = useState("auto");
  const [autoEvents, setAutoEvents] = useState(AUTO_EVENTS);
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("09:00");
  const [allowOverride, setAllowOverride] = useState(true);
  const [balanceThreshold, setBalanceThreshold] = useState("50");

  const sections = [
    { key: "auto",      label: "Автоматические SMS", icon: Zap },
    { key: "templates", label: "Шаблоны сообщений",  icon: FileText },
    { key: "audiences", label: "Сохранённые аудитории", icon: Users },
    { key: "optout",    label: "Отписки",             icon: UserX },
    { key: "quiet",     label: "Тихие часы",          icon: Volume2 },
    { key: "billing",   label: "Баланс и расход",     icon: Wallet },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {sections.map(s => {
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              onClick={() => setSection(s.key)}
              style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 12px", borderRadius: 8, cursor: "pointer",
                background: section === s.key ? S.primaryLight : "transparent",
                color: section === s.key ? S.primary : S.ink,
                border: "none", textAlign: "left",
                fontSize: 13, fontWeight: section === s.key ? 600 : 500,
              }}
            >
              <Icon size={15} />
              {s.label}
            </button>
          );
        })}
      </div>

      <div>
        {section === "auto" && (
          <Card>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.ink }}>Автоматические SMS</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: S.muted }}>Уведомления, которые система отправляет автоматически при событиях в CRM.</p>
            </div>
            <div style={{ border: `1px solid ${S.border}`, borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: S.softBg }}>
                    <Th>Событие</Th>
                    <Th>Получатель</Th>
                    <Th>Шаблон</Th>
                    <Th align="right">Включено</Th>
                  </tr>
                </thead>
                <tbody>
                  {autoEvents.map(e => (
                    <tr key={e.id} style={{ borderTop: `1px solid ${S.border}` }}>
                      <Td style={{ color: S.ink, fontWeight: 500 }}>{e.event}</Td>
                      <Td style={{ color: S.muted }}>{e.recipient}</Td>
                      <Td>
                        <span style={{ padding: "3px 8px", background: S.softBg, borderRadius: 5, fontSize: 11.5, fontFamily: "ui-monospace, monospace", color: S.muted }}>{e.template}</span>
                      </Td>
                      <Td align="right">
                        <Toggle checked={e.enabled} onChange={(v) => setAutoEvents(prev => prev.map(x => x.id === e.id ? { ...x, enabled: v } : x))} />
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {section === "quiet" && (
          <Card>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.ink }}>Тихие часы</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: S.muted }}>Время, когда сообщения не отправляются, чтобы не беспокоить клиентов.</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 460, marginBottom: 20 }}>
              <FieldLabel label="Не отправлять с">
                <input type="time" value={quietFrom} onChange={(e) => setQuietFrom(e.target.value)} style={{ padding: "10px 12px", border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 14, width: "100%", fontFamily: "inherit", outline: "none" }} />
              </FieldLabel>
              <FieldLabel label="До">
                <input type="time" value={quietTo} onChange={(e) => setQuietTo(e.target.value)} style={{ padding: "10px 12px", border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 14, width: "100%", fontFamily: "inherit", outline: "none" }} />
              </FieldLabel>
            </div>
            <div style={{ fontSize: 12.5, color: S.muted, marginBottom: 16 }}>Часовой пояс: <b style={{ color: S.ink }}>Азия/Душанбе (UTC+5)</b></div>
            <div style={{ padding: "14px 16px", background: S.softBg, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500, color: S.ink }}>Разрешить переопределять</div>
                <div style={{ fontSize: 12.5, color: S.muted, marginTop: 2 }}>Менеджер сможет отправить одиночное сообщение в тихие часы вручную.</div>
              </div>
              <Toggle checked={allowOverride} onChange={setAllowOverride} />
            </div>
          </Card>
        )}

        {section === "billing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Card>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.ink }}>Баланс OsonSMS</h3>
              <div style={{ marginTop: 14, display: "flex", alignItems: "baseline", gap: 12 }}>
                <div style={{ fontSize: 36, fontWeight: 700, color: S.ink, letterSpacing: "-0.02em" }}>245.60</div>
                <div style={{ fontSize: 16, color: S.muted, fontWeight: 500 }}>TJS</div>
                <span style={{ padding: "3px 8px", background: S.goodLight, color: "#065F46", borderRadius: 6, fontSize: 12, fontWeight: 500, marginLeft: 8 }}>Достаточно</span>
              </div>
              <div style={{ marginTop: 14, padding: "12px 14px", background: S.softBg, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: S.muted }}>Предупреждать, когда баланс ниже:</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <input value={balanceThreshold} onChange={(e) => setBalanceThreshold(e.target.value)} style={{ width: 70, padding: "6px 10px", border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 13, textAlign: "right", fontFamily: "inherit", outline: "none" }} />
                  <span style={{ fontSize: 13, color: S.ink, fontWeight: 500 }}>TJS</span>
                </div>
              </div>
              <button style={{ marginTop: 14, padding: "10px 18px", background: S.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 13.5, fontWeight: 500, cursor: "pointer" }}>Пополнить баланс</button>
            </Card>

            <Card>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: S.ink }}>Расход за июль</h3>
              <div style={{ marginTop: 14, marginBottom: 6, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: S.muted }}>Потрачено</span>
                <span style={{ color: S.ink, fontWeight: 600 }}>34.20 TJS · 684 SMS</span>
              </div>
              <div style={{ height: 8, background: S.softBg, borderRadius: 4, overflow: "hidden" }}>
                <div style={{ width: "34%", height: "100%", background: S.primary, borderRadius: 4 }} />
              </div>
              <div style={{ marginTop: 4, fontSize: 11.5, color: S.mutedLight, display: "flex", justifyContent: "space-between" }}>
                <span>Тариф 1: до 1000 SMS/мес</span>
                <span>34%</span>
              </div>
            </Card>
          </div>
        )}

        {section === "templates" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.ink }}>Шаблоны сообщений</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: S.muted }}>Готовые тексты для быстрой отправки.</p>
              </div>
              <button style={{ padding: "8px 14px", background: S.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={13} />
                Создать шаблон
              </button>
            </div>
            <div style={{ border: `1px solid ${S.border}`, borderRadius: 10, overflow: "hidden" }}>
              {TEMPLATES.map((t, i) => (
                <div key={t.id} style={{ padding: "14px 16px", borderTop: i === 0 ? "none" : `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: S.ink, marginBottom: 3 }}>{t.name}</div>
                    <div style={{ fontSize: 12.5, color: S.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.text}</div>
                  </div>
                  <span style={{ padding: "3px 8px", background: S.softBg, borderRadius: 5, fontSize: 11, color: S.muted, fontWeight: 500, textTransform: "uppercase" }}>{t.lang}</span>
                  <button style={{ background: "transparent", border: "none", cursor: "pointer", color: S.muted, padding: 4 }}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {section === "audiences" && (
          <Card>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.ink }}>Сохранённые аудитории</h3>
                <p style={{ margin: "4px 0 0", fontSize: 13, color: S.muted }}>Списки получателей для повторного использования.</p>
              </div>
              <button style={{ padding: "8px 14px", background: S.primary, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={13} />
                Создать аудиторию
              </button>
            </div>
            <div style={{ border: `1px solid ${S.border}`, borderRadius: 10, overflow: "hidden" }}>
              {SAVED_AUDIENCES.map((a, i) => (
                <div key={a.id} style={{ padding: "14px 16px", borderTop: i === 0 ? "none" : `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <Users size={16} style={{ color: S.mutedLight }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: S.ink }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>{a.count} человек · Использовано {a.lastUsed}</div>
                  </div>
                  <button style={{ background: "transparent", border: "none", cursor: "pointer", color: S.muted, padding: 4 }}>
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {section === "optout" && (
          <Card>
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: S.ink }}>Отписки</h3>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: S.muted }}>Номера, которым больше не отправляются рекламные сообщения. Транзакционные (оплата, бронь) продолжают доставляться.</p>
            </div>
            <div style={{ border: `1px solid ${S.border}`, borderRadius: 10, overflow: "hidden" }}>
              {OPTED_OUT.map((o, i) => (
                <div key={o.phone} style={{ padding: "12px 16px", borderTop: i === 0 ? "none" : `1px solid ${S.border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <Phone size={14} style={{ color: S.mutedLight }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 500, color: S.ink, fontFamily: "ui-monospace, monospace" }}>{o.phone}</div>
                    <div style={{ fontSize: 12, color: S.muted, marginTop: 1 }}>{o.name} · Отписался {o.date}</div>
                  </div>
                  <button style={{ padding: "5px 10px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 6, fontSize: 12, color: S.muted, cursor: "pointer" }}>Убрать из списка</button>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// LEADS VIEW (with bulk-select)
// ────────────────────────────────────────────────────────────────

function LeadsView({ onOpenSms, onBulkSms }) {
  const [selected, setSelected] = useState(new Set());
  const [openedLead, setOpenedLead] = useState(null);

  const toggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === LEADS.length) setSelected(new Set());
    else setSelected(new Set(LEADS.map(l => l.id)));
  };

  const statusColor = (s) => {
    if (s === "Новый") return { bg: S.primaryLight, fg: S.primary };
    if (s === "На связи") return { bg: "#FEF3C7", fg: "#B45309" };
    if (s === "Просмотр") return { bg: "#E0E7FF", fg: "#4338CA" };
    if (s === "Бронь") return { bg: "#FCE7F3", fg: "#BE185D" };
    if (s === "Продан") return { bg: S.goodLight, fg: "#065F46" };
    return { bg: S.softBg, fg: S.muted };
  };

  return (
    <div style={{ padding: "24px 32px 100px", maxWidth: 1400 }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: S.ink, letterSpacing: "-0.02em" }}>Лиды</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: S.muted }}>Управление входящими запросами и потенциальными клиентами.</p>
      </div>

      <Card padded={false}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: S.softBg }}>
              <Th style={{ width: 40 }}>
                <input type="checkbox" checked={selected.size === LEADS.length} onChange={toggleAll} style={{ cursor: "pointer" }} />
              </Th>
              <Th>Имя</Th>
              <Th>Телефон</Th>
              <Th>Проект</Th>
              <Th>Статус</Th>
              <Th>Источник</Th>
              <Th>Менеджер</Th>
              <Th style={{ width: 40 }}></Th>
            </tr>
          </thead>
          <tbody>
            {LEADS.map(l => {
              const sc = statusColor(l.status);
              return (
                <tr key={l.id} style={{ borderTop: `1px solid ${S.border}`, background: selected.has(l.id) ? S.primaryLight : "transparent" }}>
                  <Td>
                    <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} style={{ cursor: "pointer" }} />
                  </Td>
                  <Td>
                    <button onClick={() => setOpenedLead(l)} style={{ background: "transparent", border: "none", padding: 0, color: S.primary, fontSize: 13, fontWeight: 500, cursor: "pointer", textAlign: "left" }}>{l.name}</button>
                  </Td>
                  <Td style={{ color: S.muted, fontFamily: "ui-monospace, monospace", fontSize: 12.5 }}>{l.phone}</Td>
                  <Td style={{ color: S.ink }}>{l.project}</Td>
                  <Td>
                    <span style={{ padding: "3px 9px", background: sc.bg, color: sc.fg, borderRadius: 6, fontSize: 11.5, fontWeight: 500 }}>{l.status}</span>
                  </Td>
                  <Td style={{ color: S.muted }}>{l.source}</Td>
                  <Td style={{ color: S.ink }}>{l.manager}</Td>
                  <Td>
                    <button style={{ background: "transparent", border: "none", cursor: "pointer", color: S.mutedLight, padding: 4 }}>
                      <MoreHorizontal size={16} />
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      {/* floating action bar */}
      {selected.size > 0 && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(calc(-50% + 116px))", background: S.ink, color: "#fff", padding: "10px 14px 10px 20px", borderRadius: 12, boxShadow: "0 12px 32px rgba(0,0,0,0.24)", display: "flex", alignItems: "center", gap: 12, zIndex: 40 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>Выбрано: {selected.size}</div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
          <button style={{ padding: "7px 12px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, color: "#fff", fontSize: 12.5, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            Изменить статус
            <ChevronDown size={12} />
          </button>
          <button
            onClick={() => onBulkSms(Array.from(selected))}
            style={{ padding: "7px 14px", background: S.primary, border: "none", borderRadius: 7, color: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            <MessageSquare size={13} />
            Отправить SMS
          </button>
          <button style={{ padding: "7px 12px", background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 7, color: "#fff", fontSize: 12.5, cursor: "pointer" }}>Экспорт</button>
          <button onClick={() => setSelected(new Set())} style={{ background: "transparent", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", padding: 4, marginLeft: 4 }}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* Lead card modal (opens when clicking lead name) */}
      {openedLead && <LeadCardModal lead={openedLead} onClose={() => setOpenedLead(null)} onSendSms={() => { onOpenSms(openedLead); setOpenedLead(null); }} />}
    </div>
  );
}

function LeadCardModal({ lead, onClose, onSendSms }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 50, display: "flex", justifyContent: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 480, background: S.card, height: "100%", overflow: "auto" }}>
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${S.border}`, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: S.muted, marginBottom: 4 }}>ЛИД</div>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: S.ink }}>{lead.name}</h3>
            <div style={{ fontSize: 13, color: S.muted, marginTop: 4, fontFamily: "ui-monospace, monospace" }}>{lead.phone}</div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: S.muted, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
            <InfoField label="Проект" value={lead.project} />
            <InfoField label="Статус" value={lead.status} />
            <InfoField label="Источник" value={lead.source} />
            <InfoField label="Менеджер" value={lead.manager} />
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <button
              onClick={onSendSms}
              disabled={!lead.hasPhone || lead.optedOut}
              style={{
                flex: 1,
                padding: "11px 16px",
                background: (!lead.hasPhone || lead.optedOut) ? S.softBg : S.primary,
                color: (!lead.hasPhone || lead.optedOut) ? S.mutedLight : "#fff",
                border: (!lead.hasPhone || lead.optedOut) ? `1px solid ${S.border}` : "none",
                borderRadius: 9, fontSize: 13.5, fontWeight: 600,
                cursor: (!lead.hasPhone || lead.optedOut) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8
              }}
            >
              <MessageSquare size={15} />
              Отправить SMS
            </button>
            <button style={{ padding: "11px 16px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 9, fontSize: 13.5, color: S.ink, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={14} />
              Позвонить
            </button>
          </div>

          {!lead.hasPhone && (
            <div style={{ marginBottom: 20, padding: "10px 12px", background: S.warnLight, border: `1px solid ${S.warn}44`, borderRadius: 8, fontSize: 12.5, color: "#92400E", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <Info size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              У этого лида не указан телефон. Добавьте номер, чтобы отправлять SMS.
            </div>
          )}
          {lead.optedOut && (
            <div style={{ marginBottom: 20, padding: "10px 12px", background: S.badLight, border: `1px solid ${S.bad}44`, borderRadius: 8, fontSize: 12.5, color: "#991B1B", display: "flex", gap: 8, alignItems: "flex-start" }}>
              <UserX size={13} style={{ flexShrink: 0, marginTop: 1 }} />
              Этот клиент отписался от рассылок. Только транзакционные сообщения.
            </div>
          )}

          <div style={{ fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>История общения</div>
          <div style={{ fontSize: 12.5, color: S.muted }}>Пока нет истории. Отправьте первое сообщение, чтобы начать общение.</div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// QUICK SEND MODAL (from lead card)
// ────────────────────────────────────────────────────────────────

function QuickSendModal({ lead, onClose, onSent, quietHoursActive }) {
  const [text, setText] = useState("Здравствуйте, {name}! Напоминаю, что могу ответить на любые вопросы по {project}. — {manager}");
  const [showTemplates, setShowTemplates] = useState(false);
  const [sendMode, setSendMode] = useState("morning"); // morning | now
  const [sending, setSending] = useState(false);
  const textareaRef = useRef(null);

  const parts = calcParts(text);
  const cost = (parts * COST_PER_PART_TJS).toFixed(2);

  const previewCtx = {
    name: lead.name.split(" ")[0],
    project: lead.project,
    manager: lead.manager
  };
  const rendered = renderTemplate(text, previewCtx);

  const insertToken = (token) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const next = text.slice(0, start) + token + text.slice(end);
    setText(next);
    setTimeout(() => {
      el.focus();
      el.selectionStart = el.selectionEnd = start + token.length;
    }, 0);
  };

  const handleSend = () => {
    setSending(true);
    setTimeout(() => {
      setSending(false);
      onSent(lead.name);
    }, 700);
  };

  const canSend = text.trim().length > 0 && !sending;

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 60, display: "flex", justifyContent: "center", alignItems: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 560, background: S.card, borderRadius: 14, overflow: "hidden", boxShadow: "0 20px 48px rgba(0,0,0,0.25)" }}>

        <div style={{ padding: "18px 22px", borderBottom: `1px solid ${S.border}`, display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: S.primaryLight, color: S.primary, display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
            {lead.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: S.ink }}>Отправить SMS — {lead.name}</h3>
            <div style={{ fontSize: 12.5, color: S.muted, marginTop: 3, fontFamily: "ui-monospace, monospace" }}>
              {lead.phone} · {lead.project} · Менеджер: {lead.manager}
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", color: S.muted, padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: 22 }}>
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Здравствуйте, {name}! ..."
            style={{ width: "100%", minHeight: 100, padding: "12px 14px", border: `1px solid ${S.border}`, borderRadius: 10, fontSize: 14, lineHeight: 1.5, resize: "vertical", fontFamily: "inherit", color: S.ink, background: S.card, outline: "none" }}
            onFocus={(e) => e.target.style.borderColor = S.primary}
            onBlur={(e) => e.target.style.borderColor = S.border}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10, alignItems: "center" }}>
            {["{name}", "{project}", "{manager}"].map((tok) => (
              <button
                key={tok}
                onClick={() => insertToken(tok)}
                style={{ padding: "4px 9px", background: S.softBg, border: `1px solid ${S.border}`, borderRadius: 5, fontSize: 12, color: S.primary, fontFamily: "ui-monospace, monospace", cursor: "pointer", fontWeight: 500 }}
              >
                {tok}
              </button>
            ))}
            <div style={{ marginLeft: "auto", position: "relative" }}>
              <button onClick={() => setShowTemplates(!showTemplates)} style={{ padding: "5px 10px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 5, fontSize: 12, cursor: "pointer", color: S.ink, display: "flex", alignItems: "center", gap: 5, fontWeight: 500 }}>
                <FileText size={12} />
                Шаблоны
              </button>
              {showTemplates && (
                <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.1)", width: 280, zIndex: 5, padding: 4 }}>
                  {TEMPLATES.filter(t => t.lang === "ru").map(t => (
                    <button key={t.id} onClick={() => { setText(t.text); setShowTemplates(false); }} style={{ display: "block", width: "100%", padding: "8px 10px", background: "transparent", border: "none", textAlign: "left", cursor: "pointer", borderRadius: 5, fontSize: 12.5, color: S.ink }} onMouseEnter={(e) => e.currentTarget.style.background = S.softBg} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{ marginTop: 10, fontSize: 12, color: S.muted, textAlign: "right" }}>
            {text.length} символов · {parts} {parts === 1 ? "часть" : "части"} · {cost} TJS
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: S.mutedLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Предпросмотр</div>
            <div style={{ background: S.softBg, padding: 14, borderRadius: 10, border: `1px solid ${S.border}` }}>
              <div style={{ background: S.card, padding: "10px 12px", borderRadius: "12px 12px 12px 4px", fontSize: 13.5, lineHeight: 1.5, color: S.ink, border: `1px solid ${S.border}`, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {rendered}
              </div>
            </div>
          </div>

          {quietHoursActive && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: S.warnLight, border: `1px solid ${S.warn}44`, borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
                <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                Сейчас тихие часы (22:00 – 09:00)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingLeft: 22 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: S.ink, cursor: "pointer" }}>
                  <input type="radio" checked={sendMode === "morning"} onChange={() => setSendMode("morning")} />
                  Отправить утром в 09:00
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: S.ink, cursor: "pointer" }}>
                  <input type="radio" checked={sendMode === "now"} onChange={() => setSendMode("now")} />
                  Отправить сейчас (переопределить)
                </label>
              </div>
            </div>
          )}
        </div>

        <div style={{ padding: "14px 22px", borderTop: `1px solid ${S.border}`, background: S.softBg, display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 13.5, color: S.ink, cursor: "pointer", fontWeight: 500 }}>Отмена</button>
          <button
            onClick={handleSend}
            disabled={!canSend}
            style={{
              padding: "9px 20px",
              background: canSend ? S.primary : "#D1D5DB",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 13.5, fontWeight: 600,
              cursor: canSend ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 7
            }}
          >
            {sending ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
            {sending ? "Отправка..." : quietHoursActive && sendMode === "morning" ? "Запланировать" : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SMS HUB
// ────────────────────────────────────────────────────────────────

function SmsHub({ initialTab, initialSelectedIds, onSent, quietHoursActive }) {
  const [tab, setTab] = useState(initialTab || "compose");

  return (
    <div style={{ padding: "24px 32px 60px", maxWidth: 1400 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: S.ink, letterSpacing: "-0.02em" }}>SMS</h1>
          <p style={{ margin: "4px 0 0", fontSize: 13.5, color: S.muted }}>Отправка сообщений клиентам, лидам и сотрудникам.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 999, fontSize: 12.5 }}>
          <Wallet size={13} style={{ color: S.good }} />
          <span style={{ color: S.muted }}>Баланс:</span>
          <b style={{ color: S.ink }}>245.60 TJS</b>
        </div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: `1px solid ${S.border}` }}>
        {[
          { key: "compose", label: "Отправить", icon: Send },
          { key: "history", label: "История", icon: Clock },
          { key: "settings", label: "Настройки", icon: Settings },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "10px 16px",
                background: "transparent",
                border: "none",
                borderBottom: tab === t.key ? `2px solid ${S.primary}` : "2px solid transparent",
                marginBottom: -1,
                color: tab === t.key ? S.primary : S.muted,
                fontSize: 13.5, fontWeight: tab === t.key ? 600 : 500,
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7
              }}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "compose" && <ComposeTab initialSelectedIds={initialSelectedIds} onSent={onSent} quietHoursActive={quietHoursActive} />}
      {tab === "history" && <HistoryTab />}
      {tab === "settings" && <SettingsTab />}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// DASHBOARD (placeholder)
// ────────────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div style={{ padding: "24px 32px" }}>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, color: S.ink, letterSpacing: "-0.02em" }}>Сводка</h1>
      <p style={{ margin: "4px 0 20px", fontSize: 13.5, color: S.muted }}>Общая картина по компании.</p>
      <div style={{ padding: 40, background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, textAlign: "center", color: S.muted, fontSize: 13.5 }}>
        Это заглушка. В прототипе интересно посмотреть на SMS и Лиды — переключитесь в сайдбаре.
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// SHARED PIECES
// ────────────────────────────────────────────────────────────────

function Card({ children, padded = true }) {
  return (
    <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: padded ? 20 : 0 }}>
      {children}
    </div>
  );
}

function SectionHead({ title, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: S.ink }}>{title}</div>
      {hint && <div style={{ fontSize: 12.5, color: S.muted, marginTop: 2 }}>{hint}</div>}
    </div>
  );
}

function RadioBox({ checked, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "13px 14px",
        background: checked ? S.primaryLight : S.card,
        border: `1.5px solid ${checked ? S.primary : S.border}`,
        borderRadius: 10,
        cursor: "pointer",
        display: "flex", alignItems: "center", gap: 10,
        textAlign: "left",
        transition: "all 0.12s"
      }}
    >
      <div style={{ width: 16, height: 16, borderRadius: "50%", border: `1.5px solid ${checked ? S.primary : "#CBD5E1"}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
        {checked && <div style={{ width: 8, height: 8, borderRadius: "50%", background: S.primary }} />}
      </div>
      {Icon && <Icon size={14} style={{ color: checked ? S.primary : S.muted }} />}
      <span style={{ fontSize: 13.5, fontWeight: 500, color: checked ? S.primary : S.ink }}>{label}</span>
    </button>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 38, height: 22, borderRadius: 999,
        background: checked ? S.primary : "#CBD5E1",
        border: "none", cursor: "pointer", position: "relative",
        padding: 0, transition: "background 0.15s",
        flexShrink: 0
      }}
    >
      <div style={{ position: "absolute", top: 2, left: checked ? 18 : 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 0.15s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
    </button>
  );
}

function Th({ children, align, style }) {
  return <th style={{ padding: "10px 14px", textAlign: align || "left", fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", letterSpacing: 0.5, ...style }}>{children}</th>;
}

function Td({ children, align, style }) {
  return <td style={{ padding: "12px 14px", textAlign: align || "left", ...style }}>{children}</td>;
}

function FieldLabel({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 500, color: S.muted, marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function FakeSelect({ placeholder }) {
  return (
    <div style={{ padding: "9px 12px", background: S.card, border: `1px solid ${S.border}`, borderRadius: 8, fontSize: 13, color: S.mutedLight, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
      {placeholder}
      <ChevronDown size={13} />
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ padding: "10px 12px", background: S.softBg, borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 4, fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: color || S.ink, letterSpacing: "-0.01em" }}>{value}</div>
    </div>
  );
}

function InfoField({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: S.muted, marginBottom: 3, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontSize: 13.5, color: S.ink, fontWeight: 500 }}>{value}</div>
    </div>
  );
}

function Toast({ text, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(calc(-50% + 116px))", background: S.ink, color: "#fff", padding: "12px 20px", borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.24)", display: "flex", alignItems: "center", gap: 10, zIndex: 70, fontSize: 13.5, fontWeight: 500, animation: "slideUp 0.2s" }}>
      <div style={{ width: 22, height: 22, borderRadius: "50%", background: S.good, display: "grid", placeItems: "center" }}>
        <Check size={13} />
      </div>
      {text}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// ROOT APP
// ────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState("sms-hub"); // dash | leads | sms-hub
  const [smsInitialTab, setSmsInitialTab] = useState("compose");
  const [smsInitialSelectedIds, setSmsInitialSelectedIds] = useState(null);
  const [quickModalLead, setQuickModalLead] = useState(null);
  const [toast, setToast] = useState(null);

  // Simulate "quiet hours" for demo — toggle via URL hash #quiet
  const [quietHoursActive, setQuietHoursActive] = useState(false);

  const handleSent = (count) => {
    setToast(`Отправлено сообщений: ${count}`);
    setSmsInitialSelectedIds(null);
  };

  const handleQuickSent = (name) => {
    setToast(`Сообщение отправлено — ${name}`);
    setQuickModalLead(null);
  };

  const openBulkSms = (ids) => {
    setSmsInitialSelectedIds(ids);
    setSmsInitialTab("compose");
    setView("sms-hub");
  };

  return (
    <div style={{ minHeight: "100vh", background: S.bg, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: S.ink, display: "flex" }}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translate(calc(-50% + 116px), 20px); opacity: 0; } to { transform: translate(calc(-50% + 116px), 0); opacity: 1; } }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        button:focus-visible, input:focus-visible, textarea:focus-visible { outline: 2px solid ${S.primary}; outline-offset: 1px; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <Sidebar view={view} setView={(v) => { setView(v); setSmsInitialSelectedIds(null); }} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar />

        {/* Demo bar to toggle quiet hours */}
        <div style={{ padding: "6px 32px", background: "#FEF9C3", borderBottom: `1px solid ${S.border}`, fontSize: 12, color: "#78350F", display: "flex", alignItems: "center", gap: 10 }}>
          <Sparkles size={12} />
          <span>Демо: попробуйте кликнуть на лид → "Отправить SMS", выделить несколько лидов чекбоксами, или открыть SMS → Настройки.</span>
          <label style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <input type="checkbox" checked={quietHoursActive} onChange={(e) => setQuietHoursActive(e.target.checked)} />
            Симулировать тихие часы
          </label>
        </div>

        <main style={{ flex: 1, overflow: "auto" }}>
          {view === "dash"    && <Dashboard />}
          {view === "leads"   && <LeadsView onOpenSms={setQuickModalLead} onBulkSms={openBulkSms} />}
          {view === "sms-hub" && <SmsHub initialTab={smsInitialTab} initialSelectedIds={smsInitialSelectedIds} onSent={handleSent} quietHoursActive={quietHoursActive} />}
        </main>
      </div>

      {quickModalLead && <QuickSendModal lead={quickModalLead} onClose={() => setQuickModalLead(null)} onSent={handleQuickSent} quietHoursActive={quietHoursActive} />}
      {toast && <Toast text={toast} onClose={() => setToast(null)} />}
    </div>
  );
}

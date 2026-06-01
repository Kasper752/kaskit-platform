"use client";

import {
  BarChart3,
  BellRing,
  Building2,
  CheckCircle2,
  ClipboardList,
  Cog,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PhoneMissed,
  Plus,
  ShieldCheck,
  Users
} from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";

type View = "dashboard" | "inbox" | "leads" | "contacts" | "analytics" | "settings" | "admin";

const navItems: Array<{ id: View; label: string; icon: ComponentType<{ size?: number }> }> = [
  { id: "dashboard", label: "Панель", icon: LayoutDashboard },
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "leads", label: "Лиды", icon: ClipboardList },
  { id: "contacts", label: "Контакты", icon: Users },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "settings", label: "Настройки", icon: Cog },
  { id: "admin", label: "KASKIT Admin", icon: ShieldCheck }
];

const leads = [
  {
    name: "Илья",
    phone: "+7 999 120-44-18",
    service: "Кровля под ключ",
    city: "Химки",
    source: "Яндекс / сайт",
    status: "Новый",
    value: "420 000 ₽",
    next: "Сегодня 17:00"
  },
  {
    name: "Марина",
    phone: "+7 916 331-20-00",
    service: "Ремонт протечки",
    city: "Мытищи",
    source: "WhatsApp",
    status: "Нужна смета",
    value: "85 000 ₽",
    next: "Завтра 10:30"
  },
  {
    name: "Алексей",
    phone: "+7 925 700-15-22",
    service: "Монтаж снегозадержателей",
    city: "Москва",
    source: "Звонок",
    status: "Связались",
    value: "120 000 ₽",
    next: "Пятница"
  }
];

const timeline = [
  { title: "Форма сайта", body: "Нужна кровля для дома 160 м². Можно рассчитать смету?", time: "12:44" },
  { title: "Клик по телефону", body: "Посетитель нажал номер на странице /krovlya", time: "12:42" },
  { title: "Визит", body: "utm_source=yandex, utm_campaign=roof_search", time: "12:38" }
];

function LoginScreen({ onLogin }: { onLogin: () => void }) {
  return (
    <main className="login">
      <section className="loginPanel">
        <div className="brand">
          <span className="brandMark">K</span>
          KASKIT Hub
        </div>
        <h1>Вход в платформу</h1>
        <p className="muted">Кабинет клиента KASKIT для заявок, звонков, сообщений и метрик сайта.</p>
        <div style={{ height: 24 }} />
        <div className="field">
          <label>Email</label>
          <input defaultValue="owner@example.com" type="email" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input defaultValue="KaskitDemo2026!" type="password" />
        </div>
        <button className="button primary" onClick={onLogin}>
          <KeyRound size={18} />
          Войти
        </button>
      </section>
      <section className="loginAside">
        <div className="loginAsideInner">
          <h2>Кто обратился, откуда пришел и что сделать дальше</h2>
          <p className="muted">
            Простая рабочая панель для подрядчика: сайт приводит обращения, KASKIT Hub показывает ценность и помогает не терять лиды.
          </p>
          <div className="signalGrid">
            <div className="card metric">
              <span>Лиды за месяц</span>
              <strong>126</strong>
              <small>+18% к прошлому</small>
            </div>
            <div className="card metric">
              <span>Пропущенные звонки</span>
              <strong>9</strong>
              <small>SMS автоответы готовы</small>
            </div>
            <div className="card metric">
              <span>Конверсия сайта</span>
              <strong>7.4%</strong>
              <small>визит → обращение</small>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Dashboard() {
  return (
    <div className="grid">
      <div className="grid metrics">
        {[
          ["Обращения сегодня", "14", "+5 за 2 часа"],
          ["Визиты сайта", "1 842", "+12% за неделю"],
          ["Конверсия", "7.4%", "визит → обращение"],
          ["Без ответа", "6", "нужен перезвон"]
        ].map(([label, value, hint]) => (
          <div className="card metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </div>
        ))}
      </div>
      <div className="layoutThree">
        <section className="card">
          <h2 className="sectionTitle">Новые обращения</h2>
          <div className="leadList">
            {leads.map((lead) => (
              <div className="leadItem" key={lead.phone}>
                <strong>{lead.name}</strong>
                <span className="muted">{lead.service}</span>
                <div style={{ marginTop: 8 }}>
                  <span className="status hot">{lead.status}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h2 className="sectionTitle">Источники обращений</h2>
          <table className="table">
            <tbody>
              {[
                ["Органика", "42", "6.8%"],
                ["Яндекс Директ", "31", "8.1%"],
                ["WhatsApp", "18", "11.2%"],
                ["Телефон", "35", "5.9%"]
              ].map(([source, count, conversion]) => (
                <tr key={source}>
                  <td>{source}</td>
                  <td>{count}</td>
                  <td>{conversion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h2 className="sectionTitle">Что требует внимания</h2>
          <div className="leadList">
            <div className="leadItem">
              <PhoneMissed size={18} />
              <strong>3 пропущенных звонка</strong>
              <span className="muted">Авто-SMS будет подключено после телефонии.</span>
            </div>
            <div className="leadItem">
              <BellRing size={18} />
              <strong>6 лидов без ответа</strong>
              <span className="muted">Поставьте следующий шаг или ответственного.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function InboxView() {
  return (
    <div className="layoutThree">
      <section className="card">
        <h2 className="sectionTitle">Лиды и диалоги</h2>
        <div className="leadList">
          {leads.map((lead, index) => (
            <div className="leadItem" key={lead.phone}>
              <strong>{lead.name}</strong>
              <span className="muted">{lead.source}</span>
              <div style={{ marginTop: 8 }}>
                <span className={index === 0 ? "status hot" : "status"}>{lead.status}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2 className="sectionTitle">История касаний</h2>
        <div className="timeline">
          {timeline.map((item) => (
            <div className="message" key={item.title}>
              <strong>{item.title}</strong>
              <span>{item.body}</span>
              <div className="muted" style={{ marginTop: 6 }}>{item.time}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="card">
        <h2 className="sectionTitle">Карточка клиента</h2>
        <p><strong>Илья</strong></p>
        <p className="muted">+7 999 120-44-18</p>
        <p className="muted">Химки · Кровля под ключ</p>
        <div className="field">
          <label>Статус</label>
          <select defaultValue="new">
            <option value="new">Новый</option>
            <option value="contacted">Связались</option>
            <option value="estimate_needed">Нужна смета</option>
            <option value="estimate_sent">Смета отправлена</option>
            <option value="thinking">Думает</option>
            <option value="won">Выигран</option>
            <option value="lost">Потерян</option>
          </select>
        </div>
        <div className="field">
          <label>Следующее касание</label>
          <input defaultValue="Сегодня 17:00" />
        </div>
        <button className="button primary">
          <CheckCircle2 size={18} />
          Сохранить
        </button>
      </section>
    </div>
  );
}

function LeadsView() {
  return (
    <section className="card">
      <h2 className="sectionTitle">CRM-лиды</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Клиент</th>
            <th>Услуга</th>
            <th>Источник</th>
            <th>Статус</th>
            <th>Чек</th>
            <th>Следующий шаг</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <tr key={lead.phone}>
              <td>
                <strong>{lead.name}</strong>
                <div className="muted">{lead.phone}</div>
              </td>
              <td>{lead.service}<div className="muted">{lead.city}</div></td>
              <td>{lead.source}</td>
              <td><span className={index === 0 ? "status hot" : "status"}>{lead.status}</span></td>
              <td>{lead.value}</td>
              <td>{lead.next}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function ContactsView() {
  return (
    <section className="card">
      <h2 className="sectionTitle">Контакты</h2>
      <table className="table">
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.phone}>
              <td><strong>{lead.name}</strong><div className="muted">{lead.phone}</div></td>
              <td>{lead.city}</td>
              <td>{lead.source}</td>
              <td>3 касания</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function AnalyticsView() {
  return (
    <div className="grid settingsGrid">
      <section className="card">
        <h2 className="sectionTitle">События за 30 дней</h2>
        <table className="table">
          <tbody>
            {[
              ["Визиты", "18 420"],
              ["Клики по телефону", "312"],
              ["WhatsApp", "186"],
              ["Telegram", "94"],
              ["Формы", "126"]
            ].map(([label, value]) => (
              <tr key={label}><td>{label}</td><td>{value}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card">
        <h2 className="sectionTitle">UTM и каналы</h2>
        <table className="table">
          <tbody>
            {[
              ["yandex / cpc", "31 лид"],
              ["organic", "42 лида"],
              ["maps", "22 лида"],
              ["direct", "11 лидов"]
            ].map(([label, value]) => (
              <tr key={label}><td>{label}</td><td>{value}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="grid settingsGrid">
      <section className="card">
        <h2 className="sectionTitle">Проект</h2>
        <div className="field"><label>Бизнес</label><input defaultValue="Кровля Север" /></div>
        <div className="field"><label>Сайт</label><input defaultValue="https://example.com" /></div>
        <div className="field"><label>Project key</label><input defaultValue="PROJECT-DEMO" /></div>
        <button className="button"><Plus size={18} />Скопировать скрипт</button>
      </section>
      <section className="card">
        <h2 className="sectionTitle">Авто-SMS при пропущенном звонке</h2>
        <div className="field"><label>Статус</label><select defaultValue="off"><option value="off">Выключено</option><option value="on">Включено</option></select></div>
        <div className="field"><label>Задержка</label><input defaultValue="45 секунд" /></div>
        <div className="field"><label>Шаблон</label><textarea defaultValue="Здравствуйте! Вы звонили в {{businessName}}. Сейчас не смогли ответить. Напишите сюда или оставьте заявку: {{link}}. Мы скоро свяжемся." /></div>
      </section>
    </div>
  );
}

function AdminView() {
  return (
    <div className="grid settingsGrid">
      <section className="card">
        <h2 className="sectionTitle">Клиенты KASKIT</h2>
        <table className="table">
          <tbody>
            {[
              ["Кровля Север", "1 проект", "MVP"],
              ["Септик Дом", "2 проекта", "Growth"],
              ["Окна Профи", "1 проект", "MVP"]
            ].map(([name, projects, plan]) => (
              <tr key={name}><td><strong>{name}</strong></td><td>{projects}</td><td>{plan}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card">
        <h2 className="sectionTitle">Support access</h2>
        <div className="leadList">
          <div className="leadItem">
            <strong>Доступ не активен</strong>
            <span className="muted">Клиент может разрешить KASKIT доступ на 24 часа. Админ открывает данные только с причиной, действие пишется в аудит.</span>
          </div>
          <button className="button primary"><ShieldCheck size={18} />Запросить доступ</button>
        </div>
      </section>
    </div>
  );
}

function titleFor(view: View) {
  const map: Record<View, string> = {
    dashboard: "Панель подрядчика",
    inbox: "Единый Inbox",
    leads: "Лиды и сделки",
    contacts: "Контакты",
    analytics: "Аналитика",
    settings: "Настройки проекта",
    admin: "Админка KASKIT"
  };
  return map[view];
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<View>("dashboard");

  const content = useMemo(() => {
    switch (view) {
      case "dashboard":
        return <Dashboard />;
      case "inbox":
        return <InboxView />;
      case "leads":
        return <LeadsView />;
      case "contacts":
        return <ContactsView />;
      case "analytics":
        return <AnalyticsView />;
      case "settings":
        return <SettingsView />;
      case "admin":
        return <AdminView />;
    }
  }, [view]);

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brandMark">K</span>
          KASKIT Hub
        </div>
        <nav className="nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebarFooter">
          <span>app.kaskit.ru</span>
          <span>Tenant: Кровля Север</span>
        </div>
      </aside>
      <section className="main">
        <header className="topbar">
          <div>
            <h1>{titleFor(view)}</h1>
            <p>Кто обратился, откуда пришел, ответили ли и что делать дальше.</p>
          </div>
          <div className="actions">
            <button className="button">
              <MessageCircle size={18} />
              Виджет активен
            </button>
            <button className="button" onClick={() => setIsLoggedIn(false)}>
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </header>
        {content}
      </section>
    </main>
  );
}

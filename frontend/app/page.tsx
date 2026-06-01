"use client";

import {
  BarChart3,
  BellRing,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  Cog,
  FileWarning,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageCircle,
  PhoneMissed,
  Plus,
  ShieldCheck,
  Users
} from "lucide-react";
import type { ComponentType } from "react";
import { useMemo, useState } from "react";

type UserRole = "client" | "kaskit";
type ClientView = "dashboard" | "inbox" | "leads" | "contacts" | "analytics" | "settings";
type AdminView = "adminOverview" | "adminTenants" | "adminProjects" | "adminSupport" | "adminAudit";
type AppView = ClientView | AdminView;

type DemoUser = {
  email: string;
  password: string;
  role: UserRole;
  name: string;
  tenantLabel: string;
};

const demoUsers: DemoUser[] = [
  {
    email: "client@kaskit-demo.ru",
    password: "KaskitDemo2026!",
    role: "client",
    name: "Владелец Кровля Север",
    tenantLabel: "Кровля Север"
  },
  {
    email: "admin@kaskit.ru",
    password: "KaskitDemo2026!",
    role: "kaskit",
    name: "Администратор KASKIT",
    tenantLabel: "KASKIT internal"
  }
];

const clientNavItems: Array<{ id: ClientView; label: string; icon: ComponentType<{ size?: number }> }> = [
  { id: "dashboard", label: "Панель", icon: LayoutDashboard },
  { id: "inbox", label: "Обращения", icon: Inbox },
  { id: "leads", label: "Лиды", icon: ClipboardList },
  { id: "contacts", label: "Контакты", icon: Users },
  { id: "analytics", label: "Аналитика", icon: BarChart3 },
  { id: "settings", label: "Настройки", icon: Cog }
];

const adminNavItems: Array<{ id: AdminView; label: string; icon: ComponentType<{ size?: number }> }> = [
  { id: "adminOverview", label: "Обзор", icon: ShieldCheck },
  { id: "adminTenants", label: "Клиенты", icon: Building2 },
  { id: "adminProjects", label: "Проекты", icon: BriefcaseBusiness },
  { id: "adminSupport", label: "Доступ поддержки", icon: LifeBuoy },
  { id: "adminAudit", label: "Аудит", icon: FileWarning }
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

const tenants = [
  { name: "Кровля Север", projects: "1 проект", plan: "Старт", status: "Виджет активен", city: "Москва" },
  { name: "Септик Дом", projects: "2 проекта", plan: "Рост", status: "Ждет телефонию", city: "Санкт-Петербург" },
  { name: "Окна Профи", projects: "1 проект", plan: "Старт", status: "Ошибка вебхука", city: "Казань" }
];

function Brand({ mode = "client" }: { mode?: "client" | "admin" }) {
  return (
    <div className="brand">
      <img className="brandLogo" src="/kaskit-logo.png" alt="KASKIT" />
      <span>{mode === "admin" ? "Админка" : "Платформа"}</span>
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: DemoUser) => void }) {
  const [email, setEmail] = useState(demoUsers[0].email);
  const [password, setPassword] = useState(demoUsers[0].password);
  const [error, setError] = useState("");

  function submitLogin() {
    const user = demoUsers.find((item) => item.email === email.trim().toLowerCase() && item.password === password);
    if (!user) {
      setError("Для демо используйте одну из тестовых учетных записей ниже.");
      return;
    }

    setError("");
    onLogin(user);
  }

  function fillDemo(user: DemoUser) {
    setEmail(user.email);
    setPassword(user.password);
    setError("");
  }

  return (
    <main className="login">
      <section className="loginPanel">
        <Brand />
        <h1>Вход в платформу</h1>
        <p className="muted">Выберите тестовую роль: клиент подрядчика или внутренняя команда KASKIT.</p>
        <div style={{ height: 24 }} />
        <div className="field">
          <label>Почта</label>
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />
        </div>
        <div className="field">
          <label>Пароль</label>
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />
        </div>
        {error && <p className="errorText">{error}</p>}
        <button className="button primary" onClick={submitLogin}>
          <KeyRound size={18} />
          Войти
        </button>
        <div className="demoAccounts">
          <span className="muted">Тестовые входы</span>
          {demoUsers.map((user) => (
            <button className="demoAccount" key={user.email} onClick={() => fillDemo(user)}>
              <strong>{user.role === "client" ? "Клиент" : "KASKIT"}</strong>
              <span>{user.email}</span>
              <small>Пароль: {user.password}</small>
            </button>
          ))}
        </div>
      </section>
      <section className="loginAside">
        <div className="loginAsideInner">
          <h2>Две зоны: клиентский кабинет и админка KASKIT</h2>
          <p className="muted">
            Клиент видит только свои лиды и метрики. KASKIT видит проекты, интеграции, ошибки, тарифы и доступы поддержки без свободного доступа к лидам.
          </p>
          <div className="signalGrid">
            <div className="card metric">
              <span>Клиент</span>
              <strong>Лиды</strong>
              <small>заявки, звонки, источники</small>
            </div>
            <div className="card metric">
              <span>KASKIT</span>
              <strong>Админка</strong>
              <small>проекты, интеграции, аудит</small>
            </div>
            <div className="card metric">
              <span>Доступ</span>
              <strong>24ч</strong>
              <small>доступ по причине</small>
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
              <span className="muted">Авто-СМС будет подключено после телефонии.</span>
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
      <h2 className="sectionTitle">Лиды и сделки</h2>
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
              ["Клики WhatsApp", "186"],
              ["Клики Telegram", "94"],
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
        <div className="field"><label>Ключ проекта</label><input defaultValue="PROJECT-DEMO" /></div>
        <button className="button"><Plus size={18} />Скопировать скрипт</button>
      </section>
      <section className="card">
        <h2 className="sectionTitle">Авто-СМС при пропущенном звонке</h2>
        <div className="field"><label>Статус</label><select defaultValue="off"><option value="off">Выключено</option><option value="on">Включено</option></select></div>
        <div className="field"><label>Задержка</label><input defaultValue="45 секунд" /></div>
        <div className="field"><label>Шаблон</label><textarea defaultValue="Здравствуйте! Вы звонили в {{businessName}}. Сейчас не смогли ответить. Напишите сюда или оставьте заявку: {{link}}. Мы скоро свяжемся." /></div>
      </section>
    </div>
  );
}

function AdminOverview() {
  return (
    <div className="grid">
      <div className="grid metrics">
        {[
          ["Клиенты", "3", "2 активных проекта"],
          ["Ошибки интеграций", "1", "вебхук телефонии"],
          ["Лимиты СМС", "71%", "использовано в среднем"],
          ["Доступы поддержки", "0", "нет активных окон"]
        ].map(([label, value, hint]) => (
          <div className="card metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </div>
        ))}
      </div>
      <div className="grid settingsGrid">
        <section className="card">
          <h2 className="sectionTitle">Состояние клиентов</h2>
          <table className="table">
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.name}>
                  <td><strong>{tenant.name}</strong><div className="muted">{tenant.city}</div></td>
                  <td>{tenant.projects}</td>
                  <td><span className={tenant.status.includes("Ошибка") ? "status danger" : "status"}>{tenant.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card">
          <h2 className="sectionTitle">Правило доступа к лидам</h2>
          <div className="leadList">
            <div className="leadItem">
              <strong>KASKIT не читает лиды без причины</strong>
              <span className="muted">Клиент выдает доступ на 24 часа, либо специалист KASKIT открывает данные с причиной. Все действия пишутся в аудит.</span>
            </div>
            <div className="leadItem">
              <strong>Двухфакторная защита для админов</strong>
              <span className="muted">В рабочей версии вход команды KASKIT должен требовать второй фактор.</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AdminTenantsView() {
  return (
    <div className="grid settingsGrid">
      <section className="card">
        <h2 className="sectionTitle">Клиенты KASKIT</h2>
        <table className="table">
          <tbody>
            {tenants.map((tenant) => (
              <tr key={tenant.name}>
                <td><strong>{tenant.name}</strong><div className="muted">{tenant.city}</div></td>
                <td>{tenant.projects}</td>
                <td>{tenant.plan}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="card">
        <h2 className="sectionTitle">Создание клиента</h2>
        <div className="field"><label>Название</label><input defaultValue="Фасады Юг" /></div>
        <div className="field"><label>Ниша</label><input defaultValue="Строительство" /></div>
        <div className="field"><label>Тариф</label><select defaultValue="start"><option value="start">Старт</option><option value="growth">Рост</option></select></div>
        <button className="button primary"><Plus size={18} />Создать клиента</button>
      </section>
    </div>
  );
}

function AdminProjectsView() {
  return (
    <section className="card">
      <h2 className="sectionTitle">Проекты и подключения</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Проект</th>
            <th>Клиент</th>
            <th>Ключ проекта</th>
            <th>Виджет</th>
            <th>Интеграции</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["Основной сайт", "Кровля Север", "PROJECT-DEMO", "Активен", "Telegram готов"],
            ["Септики Ленобласть", "Септик Дом", "PROJECT-SPB1", "Активен", "Телефония ожидает"],
            ["Окна под ключ", "Окна Профи", "PROJECT-OKNA", "Нет событий", "Ошибка вебхука"]
          ].map(([project, tenant, key, widget, integrations]) => (
            <tr key={key}>
              <td><strong>{project}</strong></td>
              <td>{tenant}</td>
              <td>{key}</td>
              <td>{widget}</td>
              <td>{integrations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function AdminSupportView() {
  return (
    <div className="grid settingsGrid">
      <section className="card">
        <h2 className="sectionTitle">Доступ поддержки</h2>
        <div className="leadList">
          <div className="leadItem">
            <strong>Доступ не активен</strong>
            <span className="muted">Клиент может разрешить KASKIT доступ на 24 часа. Админ открывает данные только с причиной, действие пишется в аудит.</span>
          </div>
          <button className="button primary"><ShieldCheck size={18} />Запросить доступ</button>
        </div>
      </section>
      <section className="card">
        <h2 className="sectionTitle">Логи запросов</h2>
        <table className="table">
          <tbody>
            {[
              ["Кровля Север", "Интеграция Telegram", "закрыто"],
              ["Септик Дом", "Проверка звонков", "ожидает клиента"],
              ["Окна Профи", "Ошибка вебхука", "нужна причина"]
            ].map(([tenant, reason, status]) => (
              <tr key={`${tenant}-${reason}`}><td>{tenant}</td><td>{reason}</td><td>{status}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function AdminAuditView() {
  return (
    <section className="card">
      <h2 className="sectionTitle">Аудит действий</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Время</th>
            <th>Пользователь</th>
            <th>Действие</th>
            <th>Причина</th>
          </tr>
        </thead>
        <tbody>
          {[
            ["12:12", "admin@kaskit.ru", "project.created", "Подключение нового клиента"],
            ["11:40", "support@kaskit.ru", "Запрошен доступ поддержки", "Проверка вебхука телефонии"],
            ["10:18", "client@kaskit-demo.ru", "lead.updated", "Статус лида изменен"]
          ].map(([time, userEmail, action, reason]) => (
            <tr key={`${time}-${action}`}><td>{time}</td><td>{userEmail}</td><td>{action}</td><td>{reason}</td></tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function AdminArea({ view }: { view: AdminView }) {
  switch (view) {
    case "adminOverview":
      return <AdminOverview />;
    case "adminTenants":
      return <AdminTenantsView />;
    case "adminProjects":
      return <AdminProjectsView />;
    case "adminSupport":
      return <AdminSupportView />;
    case "adminAudit":
      return <AdminAuditView />;
  }
}

function ClientArea({ view }: { view: ClientView }) {
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
  }
}

function titleFor(view: AppView) {
  const map: Record<AppView, string> = {
    dashboard: "Панель подрядчика",
    inbox: "Единый поток обращений",
    leads: "Лиды и сделки",
    contacts: "Контакты",
    analytics: "Аналитика",
    settings: "Настройки проекта",
    adminOverview: "Админка KASKIT",
    adminTenants: "Клиенты KASKIT",
    adminProjects: "Проекты и подключения",
    adminSupport: "Доступ поддержки",
    adminAudit: "Аудит действий"
  };
  return map[view];
}

function subtitleFor(role: UserRole) {
  if (role === "kaskit") {
    return "Внутренняя зона KASKIT: клиенты, проекты, интеграции, ошибки, доступы и аудит.";
  }

  return "Кто обратился, откуда пришел, ответили ли и что делать дальше.";
}

export default function Home() {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [view, setView] = useState<AppView>("dashboard");

  const isKaskit = user?.role === "kaskit";
  const navItems = isKaskit ? adminNavItems : clientNavItems;

  const content = useMemo(() => {
    if (isKaskit) return <AdminArea view={view as AdminView} />;
    return <ClientArea view={view as ClientView} />;
  }, [isKaskit, view]);

  function handleLogin(nextUser: DemoUser) {
    setUser(nextUser);
    setView(nextUser.role === "kaskit" ? "adminOverview" : "dashboard");
  }

  function handleLogout() {
    setUser(null);
    setView("dashboard");
  }

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <main className={isKaskit ? "shell adminShell" : "shell"}>
      <aside className="sidebar">
        <Brand mode={isKaskit ? "admin" : "client"} />
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
          <span>{isKaskit ? "admin.kaskit.ru" : "app.kaskit.ru"}</span>
          <span>{isKaskit ? "Раздел: KASKIT" : `Компания: ${user.tenantLabel}`}</span>
          <span>{user.email}</span>
        </div>
      </aside>
      <section className="main">
        <header className="topbar">
          <div>
            <h1>{titleFor(view)}</h1>
            <p>{subtitleFor(user.role)}</p>
          </div>
          <div className="actions">
            <span className={isKaskit ? "userBadge admin" : "userBadge"}>
              {isKaskit ? "Команда KASKIT" : "Клиент"}
            </span>
            <button className="button">
              <MessageCircle size={18} />
              {isKaskit ? "Мониторинг активен" : "Виджет активен"}
            </button>
            <button className="button" onClick={handleLogout}>
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

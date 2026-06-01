(function () {
  var script = document.currentScript;
  var projectKey = script && script.getAttribute("data-project");
  if (!projectKey) return;

  var apiBase = (script && script.getAttribute("data-api")) || "https://app.kaskit.ru";
  var storageKey = "kaskit_visitor_id";
  var visitorId = localStorage.getItem(storageKey);

  if (!visitorId) {
    visitorId = "v_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(storageKey, visitorId);
  }

  function utm() {
    var params = new URLSearchParams(window.location.search);
    var result = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"].forEach(function (key) {
      if (params.has(key)) result[key] = params.get(key);
    });
    return result;
  }

  function send(path, payload) {
    var body = Object.assign(
      {
        projectKey: projectKey,
        visitorId: visitorId,
        pageUrl: window.location.href,
        referrer: document.referrer || undefined,
        utm: utm()
      },
      payload || {}
    );

    try {
      navigator.sendBeacon(
        apiBase + path,
        new Blob([JSON.stringify(body)], { type: "application/json" })
      );
    } catch (error) {
      fetch(apiBase + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true
      }).catch(function () {});
    }
  }

  send("/api/public/event", { type: "visit" });

  document.addEventListener("click", function (event) {
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link) return;

    var href = link.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) {
      send("/api/public/call-click", { phone: href.replace("tel:", "") });
    } else if (href.indexOf("https://wa.me") === 0 || href.indexOf("whatsapp://") === 0) {
      send("/api/public/event", { type: "whatsapp_click", source: "whatsapp" });
    } else if (href.indexOf("https://t.me") === 0 || href.indexOf("tg://") === 0) {
      send("/api/public/event", { type: "telegram_click", source: "telegram" });
    }
  });

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form || !form.matches || !form.matches("[data-kaskit-lead]")) return;

    var data = new FormData(form);
    var payload = {
      name: data.get("name") || data.get("Имя") || undefined,
      phone: data.get("phone") || data.get("Телефон") || undefined,
      email: data.get("email") || undefined,
      service: data.get("service") || data.get("Услуга") || undefined,
      city: data.get("city") || data.get("Город") || undefined,
      message: data.get("message") || data.get("Комментарий") || undefined,
      source: "form"
    };

    send("/api/public/lead", payload);
    send("/api/public/event", { type: "form_submit", source: "form" });
  });

  window.KaskitHub = {
    track: function (type, metadata) {
      send("/api/public/event", { type: type, metadata: metadata || {} });
    },
    lead: function (payload) {
      send("/api/public/lead", payload || {});
    },
    chatMessage: function (payload) {
      send("/api/public/chat-message", payload || {});
    }
  };
})();

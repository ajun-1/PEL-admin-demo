(function () {
  const AUTH_KEY = "pel:auth_user";

  function pathToRoot() {
    return location.pathname.includes("/pages/") ? "../" : "";
  }

  function isLoginPage() {
    return /index\.html$/.test(location.pathname) || location.pathname.endsWith("/");
  }

  function currentUser() {
    return localStorage.getItem(AUTH_KEY) || sessionStorage.getItem(AUTH_KEY);
  }

  function guard() {
    if (isLoginPage()) return;
    if (!currentUser()) {
      const redirect = encodeURIComponent(location.pathname.split("/").pop() || "pages/page0_user.html");
      location.replace(`${pathToRoot()}index.html?redirect=pages/${redirect}`);
    }
  }

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("pel:auth_time");
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem("pel:auth_time");
    location.replace(`${pathToRoot()}index.html`);
  }

  function initLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    const msg = document.getElementById("login-msg");
    const pwd = document.getElementById("password");
    const toggle = document.getElementById("toggle-password");
    toggle.addEventListener("change", () => {
      pwd.type = toggle.checked ? "text" : "password";
    });
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const username = document.getElementById("username").value.trim();
      const password = pwd.value;
      const remember = document.getElementById("remember").checked;
      msg.textContent = "";
      if (!username || !password) {
        msg.textContent = "请输入账号和密码";
        return;
      }
      if (username !== "admin" || password !== "123456") {
        msg.textContent = "账号或密码错误，请重试";
        return;
      }
      const store = remember ? localStorage : sessionStorage;
      store.setItem(AUTH_KEY, username);
      store.setItem("pel:auth_time", String(Date.now()));
      const params = new URLSearchParams(location.search);
      const target = params.get("redirect") || "pages/page0_user.html";
      location.replace(target);
    });
  }

  function make(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined && text !== null) el.textContent = text;
    return el;
  }

  function renderNav(activeHref) {
    const nav = make("aside", "sidebar");
    const title = make("p", "nav-title", "PEL 分之一粉运后台");
    const ul = make("ul", "nav-list");
    window.PEL_ADMIN_DATA.nav.forEach(([href, label, index]) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = href;
      if (href === activeHref) a.classList.add("active");
      const name = make("span", "", label);
      const no = make("span", "nav-index", index);
      a.append(name, no);
      li.appendChild(a);
      ul.appendChild(li);
    });
    nav.append(title, ul);
    return nav;
  }

  function renderHeader(pageTitle) {
    const header = document.getElementById("app-header");
    if (!header) return;
    header.innerHTML = "";
    const brand = make("div", "brand");
    brand.append(make("span", "brand-mark", "1"), make("span", "", pageTitle || "PEL 分之一粉运后台"));
    const actions = make("div", "header-actions");
    actions.append(make("span", "", `当前账号：admin`));
    const btn = make("button", "btn", "退出");
    btn.type = "button";
    btn.addEventListener("click", logout);
    actions.append(btn);
    header.append(brand, actions);
  }

  function renderStats(stats) {
    if (!stats || !stats.length) return document.createDocumentFragment();
    const grid = make("div", "stat-grid");
    stats.forEach(([label, value]) => {
      const stat = make("div", "stat");
      stat.append(make("span", "hint", label), make("strong", "", value));
      grid.appendChild(stat);
    });
    return grid;
  }

  function renderTable(section) {
    const wrap = make("div", "spec-table-wrap");
    const table = make("table", "spec-table");
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    section.headers.forEach((header) => tr.appendChild(make("th", "", header)));
    thead.appendChild(tr);
    const tbody = document.createElement("tbody");
    section.rows.forEach((row) => {
      const tr = document.createElement("tr");
      section.headers.forEach((_, index) => tr.appendChild(make("td", "", row[index] || "—")));
      tbody.appendChild(tr);
    });
    table.append(thead, tbody);
    wrap.appendChild(table);
    return wrap;
  }

  function pickInputType(label, type) {
    const merged = `${label}${type}`;
    if (/图片|上传|Excel|文件|附件|凭证/.test(merged)) return "file";
    if (/时间|周期|时段/.test(merged)) return "datetime-local";
    if (/数量|次数|积分|成长值|权重|比例|库存|金额|阈值|上限|人数/.test(merged)) return "number";
    if (/状态|类型|渠道|平台|规则|下拉|单选|多选|开关/.test(merged)) return "select";
    if (/简介|内容|说明|备注|理由|文案|规则/.test(merged)) return "textarea";
    return "text";
  }

  function renderForm(section) {
    const form = make("form", "form-grid");
    const rows = section.rows.slice(0, 6);
    rows.forEach((row, index) => {
      const label = row[0] || `字段${index + 1}`;
      const typeText = row[1] || "";
      const field = make("div", "field");
      const lab = make("label", "", label);
      const inputType = pickInputType(label, typeText);
      let input;
      if (inputType === "select") {
        input = document.createElement("select");
        ["请选择", "上线", "下线", "已通过", "已驳回", "待处理"].forEach((optionText) => {
          const option = document.createElement("option");
          option.textContent = optionText;
          option.value = optionText;
          input.appendChild(option);
        });
      } else if (inputType === "textarea") {
        input = document.createElement("textarea");
        input.placeholder = row[2] || row[1] || "请输入";
      } else {
        input = document.createElement("input");
        input.type = inputType;
        if (inputType !== "file") input.placeholder = row[2] || row[1] || "请输入";
      }
      input.name = label.replace(/\s+/g, "_");
      const hint = make("span", "hint", row[2] || row[3] || "");
      field.append(lab, input, hint);
      form.appendChild(field);
    });
    return form;
  }

  function renderSection(section) {
    const card = make("article", "section-card");
    const head = make("div", "section-head");
    const intro = make("div");
    intro.append(make("h2", "", section.title), make("p", "", section.desc || ""));
    const actions = make("div", "section-actions");
    (section.actions || ["新增", "保存", "导出"]).forEach((label, index) => {
      const btn = make("button", index === 0 ? "btn primary" : "btn", label);
      btn.type = "button";
      btn.addEventListener("click", () => {
        window.dispatchEvent(new CustomEvent("pel:toast", { detail: `${section.title}：${label}` }));
      });
      actions.appendChild(btn);
    });
    head.append(intro, actions);
    const body = make("div", "section-body");
    body.append(renderTable(section), renderForm(section));
    card.append(head, body);
    return card;
  }

  function renderToast() {
    const toast = make("div", "chip");
    toast.style.position = "fixed";
    toast.style.right = "18px";
    toast.style.bottom = "18px";
    toast.style.zIndex = "60";
    toast.style.display = "none";
    document.body.appendChild(toast);
    let timer;
    window.addEventListener("pel:toast", (event) => {
      toast.textContent = event.detail || "操作已记录";
      toast.style.display = "inline-flex";
      clearTimeout(timer);
      timer = setTimeout(() => { toast.style.display = "none"; }, 1800);
    });
  }

  function renderPage(pageKey) {
    guard();
    const data = window.PEL_ADMIN_DATA.pages[pageKey];
    if (!data) return;
    renderHeader(data.title);
    const root = document.getElementById("app");
    root.innerHTML = "";
    const shell = make("main", "shell");
    const active = location.pathname.split("/").pop();
    shell.appendChild(renderNav(active));
    const content = make("section", "content");
    const hero = make("div", "page-hero");
    const intro = make("div");
    intro.append(make("h1", "", data.title), make("p", "", data.desc));
    const toolbar = make("div", "toolbar");
    const search = make("input", "search");
    search.type = "search";
    search.placeholder = "搜索当前页面字段、说明或模块";
    toolbar.append(search, make("button", "btn", "导出当前页"), make("button", "btn primary", "保存全部配置"));
    hero.append(intro, toolbar);
    const grid = make("div", "grid");
    data.sections.forEach((section) => grid.appendChild(renderSection(section)));
    search.addEventListener("input", () => {
      const key = search.value.trim();
      Array.from(grid.children).forEach((card) => {
        card.style.display = !key || card.textContent.includes(key) ? "" : "none";
      });
    });
    content.append(hero, renderStats(data.stats), grid);
    shell.appendChild(content);
    root.appendChild(shell);
    renderToast();
  }

  window.PELAdmin = { initLogin, renderPage };
})();

const root = document.querySelector("#admin");
const themeStorageKey = "websmakenpas-theme";
const resources = {
  majors: { title: "Program Keahlian", path: "/api/majors", fields: ["name", "slug", "description", "competencies", "careerProspects", "practiceFacilities", "productiveTeachers", "achievements", "imageUrl", "isFeatured"] },
  teachers: { title: "Guru & Tendik", path: "/api/teachers", fields: ["name", "photoUrl", "position", "subject", "expertise", "status"] },
  facilities: { title: "Fasilitas", path: "/api/facilities", fields: ["name", "description", "imageUrl", "isFeatured"] },
  galleries: { title: "Galeri", path: "/api/galleries", fields: ["title", "slug", "category", "description", "coverUrl", "showOnHome"] },
  agendas: { title: "Agenda", path: "/api/agendas", fields: ["title", "startDate", "endDate", "location", "description", "status"] },
  announcements: { title: "Pengumuman", path: "/api/announcements", fields: ["title", "content", "isPriority", "attachmentUrl", "status", "publishedAt"] },
  downloads: { title: "File Unduhan", path: "/api/downloads", fields: ["title", "category", "description", "fileUrl", "fileType", "fileSize"] },
  banners: { title: "Banner", path: "/api/banners", fields: ["title", "subtitle", "imageUrl", "ctaLabel", "ctaUrl", "sortOrder", "isActive"] },
  messages: { title: "Pesan Masuk", path: "/api/messages", fields: ["name", "email", "phone", "subject", "message", "status"] },
  testimonials: { title: "Testimoni Alumni", path: "/api/testimonials", fields: ["name", "graduationYear", "occupation", "photoUrl", "instagram", "tiktok", "facebook", "message", "status"] },
  users: { title: "User Admin", path: "/api/users", fields: ["name", "username", "email", "password", "role"] }
};

const adminMenuGroups = [
  {
    title: "Utama",
    items: [
      ["overview", "Dashboard"],
      ["profile", "Profil Sekolah"],
      ["settings", "Pengaturan Website"]
    ]
  },
  {
    title: "Konten Sekolah",
    items: [
      ["banners", resources.banners.title],
      ["majors", resources.majors.title],
      ["teachers", resources.teachers.title],
      ["facilities", resources.facilities.title],
      ["galleries", resources.galleries.title],
      ["testimonials", resources.testimonials.title]
    ]
  },
  {
    title: "Informasi Publik",
    items: [
      ["agendas", resources.agendas.title],
      ["announcements", resources.announcements.title],
      ["downloads", resources.downloads.title],
      ["upload", "Upload File"]
    ]
  },
  {
    title: "Administrasi",
    items: [
      ["messages", resources.messages.title],
      ["users", resources.users.title]
    ]
  },
  {
    title: "Akun",
    items: [
      ["theme", "Mode Gelap", "theme"],
      ["logout", "Keluar"]
    ]
  }
];

let active = "majors";
let rows = [];

const statsLabels = {
  majors: "Program Keahlian",
  teachers: "Guru & Tendik",
  galleries: "Galeri",
  agendas: "Agenda",
  announcements: "Pengumuman",
  downloads: "File Unduhan",
  messages: "Pesan Masuk",
  testimonials: "Testimoni Alumni",
  newMessages: "Pesan Baru",
  pendingTestimonials: "Testimoni Baru",
  users: "User Admin"
};

function getPreferredTheme() {
  const saved = localStorage.getItem(themeStorageKey);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    button.textContent = theme === "dark" ? "Mode Terang" : "Mode Gelap";
    button.setAttribute("aria-pressed", String(theme === "dark"));
  });
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(themeStorageKey, next);
  applyTheme(next);
}

applyTheme(getPreferredTheme());

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function notify(message, type = "success") {
  let stack = document.querySelector(".toast-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "toast-stack";
    document.body.appendChild(stack);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  stack.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

async function api(path, options = {}) {
  const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error?.message || "Terjadi kesalahan");
  return json.data;
}

function fieldLabel(field) {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (ch) => ch.toUpperCase())
    .replace("Url", "URL");
}

function isBooleanField(field) {
  return ["isFeatured", "showOnHome", "isPriority", "isActive"].includes(field);
}

function formFields(config, item = {}) {
  return config.fields.map((field) => {
    if (isBooleanField(field)) {
      return `<div class="field"><label><input type="checkbox" name="${field}" ${item[field] ? "checked" : ""}> ${fieldLabel(field)}</label></div>`;
    }
    const value = esc(item[field] ?? "");
    if (field === "instagram" || field === "tiktok" || field === "facebook") {
      const placeholder = field === "instagram"
        ? "username instagram atau URL"
        : field === "tiktok"
          ? "username tiktok atau URL"
          : "username facebook atau URL";
      return `<div class="field"><label>${fieldLabel(field)}</label><input name="${field}" value="${value}" placeholder="${placeholder}"></div>`;
    }
    if (["description", "content", "competencies", "careerProspects", "practiceFacilities", "achievements", "message", "subtitle"].includes(field)) {
      return `<div class="field"><label>${fieldLabel(field)}</label><textarea name="${field}">${value}</textarea></div>`;
    }
    const type = field === "password" ? "password" : field.toLowerCase().includes("date") || field === "publishedAt" ? "date" : "text";
    return `<div class="field"><label>${fieldLabel(field)}</label><input type="${type}" name="${field}" value="${value}"></div>`;
  }).join("");
}

function loginView() {
  root.innerHTML = `
    <main class="login-screen">
      <form class="login-card form" id="login-form">
        <div class="brand"><span class="brand-mark">S</span><span>Admin Sekolah</span></div>
        <div class="field"><label>Username</label><input name="username" value="ferilee" required></div>
        <div class="field"><label>Password</label><input name="password" type="password" value="F3r!-lee" required></div>
        <button class="btn">Masuk</button>
      </form>
    </main>`;
  document.querySelector("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
      history.pushState(null, "", "/admin");
      await dashboardView();
    } catch (error) {
      notify(error.message, "error");
    }
  });
}

function adminMenu() {
  return adminMenuGroups.map((group) => `
    <div class="menu-group">
      <p class="menu-group-title">${esc(group.title)}</p>
      ${group.items.map(([page, label, type]) => {
        const attr = type === "theme" ? "data-theme-toggle" : `data-page="${page}"`;
        const badge = page === "messages" || page === "testimonials" ? `<span class="menu-badge" data-menu-badge="${page}" hidden><i></i><b>0</b></span>` : "";
        return `<button ${attr} type="button"><span>${esc(label)}</span>${badge}</button>`;
      }).join("")}
    </div>`).join("");
}

async function updateMenuBadges() {
  try {
    const stats = await api("/api/stats");
    const badges = {
      messages: Number(stats.newMessages || 0),
      testimonials: Number(stats.pendingTestimonials || 0)
    };
    Object.entries(badges).forEach(([key, value]) => {
      const badge = document.querySelector(`[data-menu-badge="${key}"]`);
      if (!badge) return;
      badge.hidden = value < 1;
      const number = badge.querySelector("b");
      if (number) number.textContent = String(value);
    });
  } catch {
    // Badge counts are secondary; keep dashboard usable if stats fail.
  }
}

async function dashboardView() {
  try {
    await api("/api/auth/me");
  } catch {
    loginView();
    return;
  }
  root.innerHTML = `
    <div class="admin-layout">
      <div class="admin-backdrop" data-admin-drawer-close hidden></div>
      <aside class="sidebar" id="admin-sidebar" aria-hidden="true">
        <div class="brand"><span class="brand-mark">S</span><span>Dashboard</span></div>
        <nav class="menu">
          ${adminMenu()}
        </nav>
      </aside>
      <main class="main">
        <header class="admin-topbar">
          <button class="hamburger-btn" type="button" data-admin-drawer-toggle aria-label="Buka menu admin" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
          <div>
            <strong>Dashboard Admin</strong>
            <span>Kelola konten website sekolah</span>
          </div>
        </header>
        <section id="main"></section>
      </main>
    </div>
    <div class="modal" id="modal"><div class="modal-box" id="modal-box"></div></div>`;
  setupAdminDrawer();
  document.querySelectorAll(".menu button").forEach((button) => {
    button.addEventListener("click", async () => {
      if (button.dataset.themeToggle !== undefined) {
        toggleTheme();
        return;
      }
      const page = button.dataset.page;
      if (page === "logout") {
        await api("/api/auth/logout", { method: "POST" });
        location.href = "/admin/login";
        return;
      }
      active = page;
      await renderPage(page);
      closeAdminDrawer();
    });
  });
  applyTheme(document.documentElement.dataset.theme || getPreferredTheme());
  await renderPage("overview");
  await updateMenuBadges();
}

function openAdminDrawer() {
  if (window.matchMedia("(min-width: 861px)").matches) return;
  const sidebar = document.querySelector("#admin-sidebar");
  const backdrop = document.querySelector("[data-admin-drawer-close]");
  const toggle = document.querySelector("[data-admin-drawer-toggle]");
  if (!sidebar || !backdrop || !toggle) return;
  backdrop.hidden = false;
  requestAnimationFrame(() => {
    sidebar.classList.add("open");
    backdrop.classList.add("open");
    sidebar.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
  });
}

function closeAdminDrawer() {
  if (window.matchMedia("(min-width: 861px)").matches) return;
  const sidebar = document.querySelector("#admin-sidebar");
  const backdrop = document.querySelector("[data-admin-drawer-close]");
  const toggle = document.querySelector("[data-admin-drawer-toggle]");
  if (!sidebar || !backdrop || !toggle) return;
  sidebar.classList.remove("open");
  backdrop.classList.remove("open");
  sidebar.setAttribute("aria-hidden", "true");
  toggle.setAttribute("aria-expanded", "false");
  setTimeout(() => {
    if (!backdrop.classList.contains("open")) backdrop.hidden = true;
  }, 260);
}

function setupAdminDrawer() {
  const toggle = document.querySelector("[data-admin-drawer-toggle]");
  const backdrop = document.querySelector("[data-admin-drawer-close]");
  toggle?.addEventListener("click", () => {
    const sidebar = document.querySelector("#admin-sidebar");
    if (sidebar?.classList.contains("open")) closeAdminDrawer();
    else openAdminDrawer();
  });
  backdrop?.addEventListener("click", closeAdminDrawer);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAdminDrawer();
  });
}

function setActive(page) {
  document.querySelectorAll(".menu button").forEach((button) => button.classList.toggle("active", button.dataset.page === page));
}

async function renderPage(page) {
  setActive(page);
  if (page === "overview") return overview();
  if (page === "profile") return singleton("Profil Sekolah", "/api/profile", ["history", "vision", "mission", "principalName", "principalGreeting", "principalPhotoUrl", "principalCtaLabel", "principalCtaUrl", "organization", "accreditation", "location"]);
  if (page === "settings") return singleton("Pengaturan Website", "/api/settings", ["schoolName", "tagline", "logoUrl", "faviconUrl", "themeColor", "address", "email", "phone", "whatsapp", "wordpressUrl", "ppdbUrl", "metaDescription", "footerText"]);
  if (page === "upload") return uploadPage();
  return resourcePage(page);
}

async function overview() {
  const stats = await api("/api/stats");
  document.querySelector("#main").innerHTML = `
    <div class="toolbar"><div><h1>Dashboard</h1><p>Ringkasan konten website sekolah.</p></div><a class="btn secondary" href="/" target="_blank">Lihat Website</a></div>
    <div class="grid four">
      ${Object.entries(stats).map(([key, value]) => `<div class="card"><h3>${esc(value)}</h3><p>${esc(statsLabels[key] || resources[key]?.title || key)}</p></div>`).join("")}
    </div>`;
  await updateMenuBadges();
}

async function singleton(title, path, fields) {
  const data = await api(path);
  document.querySelector("#main").innerHTML = `
    <div class="toolbar"><div><h1>${title}</h1><p>Perbarui data utama website.</p></div></div>
    <form class="card form" id="single-form">
      ${formFields({ fields }, data || {})}
      <button class="btn">Simpan</button>
    </form>`;
  document.querySelector("#single-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = formPayload(event.target, fields);
    await api(path, { method: "PUT", body: JSON.stringify(body) });
    notify("Data tersimpan.");
  });
}

async function resourcePage(key) {
  const config = resources[key];
  rows = await api(config.path);
  document.querySelector("#main").innerHTML = `
    <div class="toolbar">
      <div><h1>${config.title}</h1><p>Kelola data ${config.title.toLowerCase()}.</p></div>
      <button class="btn" id="add">Tambah</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Judul/Nama</th><th>Info</th><th>Aksi</th></tr></thead>
        <tbody>${rows.map((row) => `
          <tr>
            <td>${row.id}</td>
            <td>${esc(row.name || row.title || row.username || row.subject || "-")}</td>
            <td>${esc(row.description || row.content || row.position || row.email || row.status || "").slice(0, 120)}</td>
            <td>
              ${key === "testimonials" ? `<button class="btn ghost" data-view="${row.id}">View</button>` : ""}
              ${key === "testimonials" && row.status !== "approved" ? `<button class="btn" data-approve="${row.id}">Approve</button>` : ""}
              ${key === "messages" && row.status === "new" ? `<button class="btn" data-read="${row.id}">Tandai Dibaca</button>` : ""}
              <button class="btn ghost" data-edit="${row.id}">Edit</button>
              <button class="btn danger" data-delete="${row.id}">Hapus</button>
            </td>
          </tr>`).join("") || '<tr><td colspan="4" class="empty">Belum ada data.</td></tr>'}</tbody>
      </table>
    </div>`;
  document.querySelector("#add").addEventListener("click", () => openForm(key));
  document.querySelectorAll("[data-edit]").forEach((button) => button.addEventListener("click", () => openForm(key, rows.find((row) => row.id === Number(button.dataset.edit)))));
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => openDetail(key, rows.find((row) => row.id === Number(button.dataset.view)))));
  document.querySelectorAll("[data-approve]").forEach((button) => button.addEventListener("click", async () => {
    const item = rows.find((row) => row.id === Number(button.dataset.approve));
    if (!item) return;
    try {
      await api(`${config.path}/${button.dataset.approve}`, { method: "PUT", body: JSON.stringify({ status: "approved" }) });
      await resourcePage(key);
      await updateMenuBadges();
      notify("Testimoni berhasil di-approve.");
    } catch (error) {
      notify(error.message || "Gagal approve testimoni.", "error");
    }
  }));
  document.querySelectorAll("[data-read]").forEach((button) => button.addEventListener("click", async () => {
    const item = rows.find((row) => row.id === Number(button.dataset.read));
    if (!item) return;
    try {
      await api(`${config.path}/${button.dataset.read}`, { method: "PUT", body: JSON.stringify({ status: "read" }) });
      await resourcePage(key);
      await updateMenuBadges();
      notify("Pesan ditandai sebagai dibaca.");
    } catch (error) {
      notify(error.message || "Gagal menandai pesan.", "error");
    }
  }));
  document.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", async () => {
    if (!confirm("Hapus data ini?")) return;
    await api(`${config.path}/${button.dataset.delete}`, { method: "DELETE" });
    await resourcePage(key);
    await updateMenuBadges();
  }));
  await updateMenuBadges();
}

function openDetail(key, item = {}) {
  const config = resources[key];
  const modal = document.querySelector("#modal");
  const box = document.querySelector("#modal-box");
  if (key !== "testimonials" || !item.id) return;
  const socialLinks = [
    item.instagram ? { label: "Instagram", href: item.instagram } : null,
    item.tiktok ? { label: "TikTok", href: item.tiktok } : null,
    item.facebook ? { label: "Facebook", href: item.facebook } : null
  ].filter(Boolean);

  box.innerHTML = `
    <div class="toolbar"><h2>Detail ${config.title}</h2><button class="btn ghost" id="close">Tutup</button></div>
    <article class="detail-view">
      <div class="detail-head">
        <div class="detail-avatar">${item.photoUrl ? `<img src="${esc(item.photoUrl)}" alt="${esc(item.name)}">` : `<span>${esc((item.name || "A").slice(0, 1))}</span>`}</div>
        <div>
          <h3>${esc(item.name || "-")}</h3>
          <p>${esc([item.occupation, item.graduationYear ? `Angkatan ${item.graduationYear}` : ""].filter(Boolean).join(" - ") || "-")}</p>
          <span class="badge">${esc(item.status || "-")}</span>
        </div>
      </div>
      <div class="detail-grid">
        <div><strong>Tahun Lulus</strong><p>${esc(item.graduationYear || "-")}</p></div>
        <div><strong>Pekerjaan</strong><p>${esc(item.occupation || "-")}</p></div>
        <div><strong>Instagram</strong><p>${item.instagram ? `<a href="${esc(item.instagram)}" target="_blank" rel="noopener noreferrer">${esc(item.instagram)}</a>` : "-"}</p></div>
        <div><strong>TikTok</strong><p>${item.tiktok ? `<a href="${esc(item.tiktok)}" target="_blank" rel="noopener noreferrer">${esc(item.tiktok)}</a>` : "-"}</p></div>
        <div><strong>Facebook</strong><p>${item.facebook ? `<a href="${esc(item.facebook)}" target="_blank" rel="noopener noreferrer">${esc(item.facebook)}</a>` : "-"}</p></div>
        <div><strong>Dibuat</strong><p>${esc(item.createdAt || "-")}</p></div>
      </div>
      <div class="detail-message">
        <strong>Testimoni</strong>
        <p>${esc(item.message || "-")}</p>
      </div>
      ${socialLinks.length ? `<div class="detail-socials">${socialLinks.map((social) => `<a class="btn ghost" href="${esc(social.href)}" target="_blank" rel="noopener noreferrer">${esc(social.label)}</a>`).join("")}</div>` : ""}
    </article>`;
  modal.classList.add("open");
  document.querySelector("#close").addEventListener("click", () => modal.classList.remove("open"));
}

function formPayload(form, fields) {
  const data = Object.fromEntries(new FormData(form));
  for (const field of fields) {
    if (isBooleanField(field)) data[field] = form.querySelector(`[name="${field}"]`)?.checked || false;
  }
  return data;
}

function openForm(key, item = {}) {
  const config = resources[key];
  const modal = document.querySelector("#modal");
  const box = document.querySelector("#modal-box");
  box.innerHTML = `
    <div class="toolbar"><h2>${item.id ? "Edit" : "Tambah"} ${config.title}</h2><button class="btn ghost" id="close">Tutup</button></div>
    <form class="form" id="resource-form">${formFields(config, item)}<button class="btn">Simpan</button></form>`;
  modal.classList.add("open");
  document.querySelector("#close").addEventListener("click", () => modal.classList.remove("open"));
  document.querySelector("#resource-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const method = item.id ? "PUT" : "POST";
    const path = item.id ? `${config.path}/${item.id}` : config.path;
    await api(path, { method, body: JSON.stringify(formPayload(event.target, config.fields)) });
    modal.classList.remove("open");
    await resourcePage(key);
    await updateMenuBadges();
  });
}

function uploadPage() {
  document.querySelector("#main").innerHTML = `
    <div class="toolbar"><div><h1>Upload File</h1><p>Unggah gambar atau dokumen ke storage aplikasi.</p></div></div>
    <form class="card form" id="upload-form">
      <div class="field"><label>File</label><input type="file" name="file" required></div>
      <button class="btn">Upload</button>
      <p id="upload-result"></p>
    </form>`;
  document.querySelector("#upload-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const res = await fetch("/api/upload", { method: "POST", body: new FormData(event.target) });
    const json = await res.json();
    if (!json.ok) return notify(json.error?.message || "Upload gagal", "error");
    document.querySelector("#upload-result").innerHTML = `URL file: <a href="${esc(json.data.url)}" target="_blank">${esc(json.data.url)}</a>`;
    notify("File berhasil diupload.");
  });
}

if (location.pathname === "/admin/login") loginView();
else dashboardView();

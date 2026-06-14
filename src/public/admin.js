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
  complaints: { title: "Pengaduan", path: "/api/complaints", fields: ["name", "reporterRole", "classOrUnit", "phone", "email", "category", "title", "complaint", "attachmentUrl", "expectation", "status"] },
  testimonials: { title: "Testimoni Alumni", path: "/api/testimonials", fields: ["name", "graduationYear", "occupation", "photoUrl", "whatsapp", "telegram", "instagram", "tiktok", "facebook", "youtube", "message", "status"] },
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
      ["complaints", resources.complaints.title],
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
let complaintStatusFilter = "all";
let teacherSearchQuery = "";

const statsLabels = {
  majors: "Program Keahlian",
  teachers: "Guru & Tendik",
  galleries: "Galeri",
  agendas: "Agenda",
  announcements: "Pengumuman",
  downloads: "File Unduhan",
  messages: "Pesan Masuk",
  complaints: "Pengaduan",
  testimonials: "Testimoni Alumni",
  newMessages: "Pesan Baru",
  newComplaints: "Pengaduan Baru",
  pendingTestimonials: "Testimoni Baru",
  users: "User Admin"
};

const settingsFields = ["schoolName", "tagline", "logoUrl", "faviconUrl", "themeColor", "address", "email", "phone", "whatsapp", "wordpressUrl", "ppdbUrl", "metaDescription", "footerText"];
const profileFields = ["history", "vision", "mission", "principalName", "principalGreeting", "principalPhotoUrl", "profileSummaryImageUrl", "principalCtaLabel", "principalCtaUrl", "organization", "accreditation", "location"];
const quickLinkIconOptions = ["report", "briefcase", "shield", "graduation", "globe", "book", "download", "link"];
const quickLinkToneOptions = ["aqua", "violet", "gold"];
const imageUploadFieldConfig = {
  imageUrl: {
    title: "Upload gambar",
    description: "Unggah gambar ke storage aplikasi/RustFS lalu URL diisi otomatis.",
    successText: "Gambar berhasil diupload."
  },
  photoUrl: {
    title: "Upload foto",
    description: "Unggah foto ke storage aplikasi/RustFS lalu URL diisi otomatis.",
    successText: "Foto berhasil diupload."
  },
  coverUrl: {
    title: "Upload cover",
    description: "Unggah gambar cover ke storage aplikasi/RustFS lalu URL diisi otomatis.",
    successText: "Cover berhasil diupload."
  },
  logoUrl: {
    title: "Upload logo sekolah",
    description: "Unggah logo sekolah ke storage aplikasi/RustFS lalu URL diisi otomatis.",
    successText: "Logo sekolah berhasil diupload."
  },
  faviconUrl: {
    title: "Upload favicon",
    description: "Unggah favicon ke storage aplikasi/RustFS lalu URL diisi otomatis.",
    successText: "Favicon berhasil diupload."
  },
  principalPhotoUrl: {
    title: "Upload foto kepala sekolah",
    description: "Unggah foto kepala sekolah ke storage aplikasi/RustFS lalu URL diisi otomatis.",
    successText: "Foto kepala sekolah berhasil diupload."
  },
  profileSummaryImageUrl: {
    title: "Upload gambar profil singkat sekolah",
    description: "Unggah gambar untuk panel Profil Singkat Sekolah di beranda lalu URL diisi otomatis.",
    successText: "Gambar profil singkat sekolah berhasil diupload."
  }
};
const managementEditorBlueprint = [
  {
    key: "kurikulum",
    label: "Kurikulum",
    defaultLead: "Mengatur arah pembelajaran agar selaras dengan kebutuhan sekolah, industri, dan capaian lulusan.",
    defaultPoints: [
      "Penyusunan perangkat ajar dan kalender akademik.",
      "Koordinasi pembelajaran lintas mata pelajaran dan jurusan.",
      "Evaluasi hasil belajar, asesmen, dan tindak lanjut mutu.",
      "Sinkronisasi dengan kebutuhan DUDIKA dan dunia kerja."
    ],
    defaultResources: []
  },
  {
    key: "kesiswaan",
    label: "Kesiswaan",
    defaultLead: "Membina peserta didik agar disiplin, berkembang, dan aktif dalam kegiatan sekolah.",
    defaultPoints: [
      "Pembinaan disiplin, tata tertib, dan budaya positif.",
      "Pendampingan OSIS, ekstrakurikuler, dan kepemimpinan siswa.",
      "Pemantauan absensi, kedisiplinan, dan kesejahteraan siswa.",
      "Koordinasi layanan BK dan pengembangan prestasi non-akademik."
    ],
    defaultResources: []
  },
  {
    key: "prasaranasarana",
    label: "Prasarana dan Sarana",
    defaultLead: "Menjaga ruang belajar, laboratorium, dan inventaris sekolah tetap layak, aman, dan siap pakai.",
    defaultPoints: [
      "Pendataan dan pemeliharaan ruang, alat, dan inventaris.",
      "Pengaturan penggunaan laboratorium, kelas, dan fasilitas umum.",
      "Perencanaan kebutuhan pengadaan dan perbaikan fasilitas.",
      "Monitoring kebersihan, keamanan, dan kelayakan sarana."
    ],
    defaultResources: []
  },
  {
    key: "humas",
    label: "Humas",
    defaultLead: "Menjaga komunikasi dengan orang tua, mitra industri, dan masyarakat agar sekolah tetap terbuka dan relevan.",
    defaultPoints: [
      "Kemitraan dengan industri, dunia kerja, dan lembaga eksternal.",
      "Publikasi kegiatan sekolah dan pengelolaan informasi resmi.",
      "Koordinasi layanan informasi untuk orang tua dan masyarakat.",
      "Dukungan promosi sekolah, PPDB, dan citra institusi."
    ],
    defaultResources: []
  }
];

const identityEditorBlueprint = [
  {
    title: "Identitas Kepala Sekolah",
    fields: [
      ["principalIdentityName", "Nama Lengkap", "text", "Dermawan Triwahyono,ST,MM"],
      ["principalIdentityBirth", "Tempat & Tanggal Lahir", "text", "Lumajang,03 Maret 1976"],
      ["principalIdentityAddress", "Alamat", "textarea", "Dsn. Krajan RT.18/ RW.05\nDesa Yosowilangun Lor\nKec. Yosowilangun, Kab. Lumajang"],
      ["principalIdentityPhone", "Telepon Rumah/HP", "text", "085236083132"],
      ["principalIdentityDecreeNumber", "Nomor SK", "text", "800/9767/204/2025"],
      ["principalIdentityDecreeDate", "Tanggal SK", "text", "09 Mei 2025"],
      ["principalIdentityAppointingOfficial", "Pejabat yang mengangkat", "textarea", "Dra. Hj. Khofifah Indar Parawansa, M.Si\nGubernur Jawa Timur"]
    ]
  },
  {
    title: "Komite Sekolah",
    fields: [
      ["committeeMembers", "Jumlah Anggota", "text", "5 orang"],
      ["committeeChair", "Ketua", "text", "Sugeng Ngabekti"],
      ["committeeDecreeNumber", "Nomor SK pengangkatan", "text", "421.5/001/101.6.5.17/2023"],
      ["committeeDecreeDate", "Tanggal SK pengangkatan", "text", "3 Agustus 2023"]
    ]
  }
];

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
  toast.setAttribute("role", type === "error" ? "alert" : "status");
  toast.setAttribute("aria-live", type === "error" ? "assertive" : "polite");
  toast.style.setProperty("--toast-duration", "5000ms");
  const icons = {
    success: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>',
    error: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>',
    warning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 4.6 3.1 17a2 2 0 0 0 1.7 3h14.4a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"/></svg>'
  };
  toast.innerHTML = `
    <span class="toast-icon">${icons[type] || icons.success}</span>
    <span class="toast-content">${esc(message)}</span>
    <button class="toast-close" type="button" aria-label="Tutup notifikasi">&times;</button>
    <span class="toast-bar" aria-hidden="true"></span>`;
  stack.appendChild(toast);
  let removeTimer;
  const dismiss = () => {
    clearTimeout(removeTimer);
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 240);
  };
  toast.querySelector(".toast-close")?.addEventListener("click", dismiss);
  requestAnimationFrame(() => toast.classList.add("show"));
  removeTimer = setTimeout(dismiss, 5000);
}

function confirmAction({ title = "Konfirmasi", message, confirmLabel = "Lanjutkan", danger = false }) {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className = "confirm-dialog";
    dialog.innerHTML = `
      <div class="confirm-dialog-backdrop" data-confirm-cancel></div>
      <section class="confirm-dialog-box" role="alertdialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message">
        <span class="confirm-dialog-icon ${danger ? "danger" : ""}" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 8v5M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>
        </span>
        <div>
          <h3 id="confirm-title">${esc(title)}</h3>
          <p id="confirm-message">${esc(message)}</p>
        </div>
        <div class="confirm-dialog-actions">
          <button class="btn ghost" type="button" data-confirm-cancel>Batal</button>
          <button class="btn ${danger ? "danger" : ""}" type="button" data-confirm-accept>${esc(confirmLabel)}</button>
        </div>
      </section>`;
    document.body.appendChild(dialog);

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      document.removeEventListener("keydown", onKeydown);
      dialog.classList.remove("open");
      setTimeout(() => dialog.remove(), 220);
      resolve(value);
    };
    const onKeydown = (event) => {
      if (event.key === "Escape") finish(false);
    };
    dialog.querySelectorAll("[data-confirm-cancel]").forEach((button) => button.addEventListener("click", () => finish(false)));
    dialog.querySelector("[data-confirm-accept]")?.addEventListener("click", () => finish(true));
    document.addEventListener("keydown", onKeydown);
    requestAnimationFrame(() => {
      dialog.classList.add("open");
      dialog.querySelector("[data-confirm-accept]")?.focus();
    });
  });
}

async function api(path, options = {}) {
  const res = await fetch(path, { ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const raw = await res.text();
  let json;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error(raw || `Terjadi kesalahan (HTTP ${res.status})`);
  }
  if (!json?.ok) throw new Error(json?.error?.message || `Terjadi kesalahan (HTTP ${res.status})`);
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
    if (["whatsapp", "telegram", "instagram", "tiktok", "facebook", "youtube"].includes(field)) {
      const placeholders = {
        whatsapp: "nomor WhatsApp atau URL",
        telegram: "username Telegram atau URL",
        instagram: "username Instagram atau URL",
        tiktok: "username TikTok atau URL",
        facebook: "username Facebook atau URL",
        youtube: "handle YouTube atau URL"
      };
      const placeholder = placeholders[field];
      return `<div class="field"><label>${fieldLabel(field)}</label><input name="${field}" value="${value}" placeholder="${placeholder}"></div>`;
    }
    if (["description", "content", "competencies", "careerProspects", "practiceFacilities", "achievements", "message", "subtitle", "complaint", "expectation", "mission"].includes(field)) {
      const hint = field === "mission" ? '<p class="hint">Satu poin per baris. Contoh: 1. ... lalu baris baru untuk poin berikutnya.</p>' : "";
      return `<div class="field"><label>${fieldLabel(field)}</label><textarea name="${field}" placeholder="${field === "mission" ? "Tulis satu misi per baris" : ""}">${value}</textarea>${hint}</div>`;
    }
    const type = field === "password" ? "password" : field.toLowerCase().includes("date") || field === "publishedAt" ? "date" : "text";
    return `<div class="field"><label>${fieldLabel(field)}</label><input type="${type}" name="${field}" value="${value}"></div>`;
  }).join("");
}

function splitLines(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function managementEditor(data = {}) {
  const management = data.management || {};
  return `
    <section class="management-admin">
      <div class="toolbar">
        <div>
          <h2>Manajemen Sekolah</h2>
          <p>Konten ini ditampilkan pada modal akses cepat di beranda.</p>
        </div>
      </div>
      <div class="management-admin-grid">
        ${managementEditorBlueprint.map((item) => {
          const current = management[item.key] || {};
          const lead = esc(current.lead || item.defaultLead);
          const points = esc(Array.isArray(current.points) ? current.points.join("\n") : String(current.points || item.defaultPoints.join("\n")));
          const resources = esc(Array.isArray(current.resources) ? current.resources.map((resource) => `${resource.label || ""} | ${resource.type || "link"} | ${resource.url || ""}`).join("\n") : String(current.resources || ""));
          return `
            <article class="management-admin-card">
              <h3>${esc(item.label)}</h3>
              <div class="field">
                <label>Ringkasan</label>
                <textarea name="management_${item.key}_lead">${lead}</textarea>
              </div>
              <div class="field">
                <label>Poin detail per baris</label>
                <textarea name="management_${item.key}_points">${points}</textarea>
              </div>
              <div class="field">
                <label>Berkas / tautan per baris</label>
                <textarea name="management_${item.key}_resources" placeholder="Judul | file/link | https://...">${resources}</textarea>
                <p class="hint">Format: label | file/link | URL. Baris tipe <strong>file</strong> akan tampil sebagai unduhan, <strong>link</strong> akan buka situs eksternal.</p>
              </div>
            </article>`;
        }).join("")}
      </div>
    </section>`;
}

function identityEditor(data = {}) {
  const identity = data.identity || {};
  return `
    <section class="management-admin">
      <div class="toolbar">
        <div>
          <h2>Identitas Kepala Sekolah dan Komite</h2>
          <p>Konten ini tampil pada halaman profil sekolah.</p>
        </div>
      </div>
      <div class="management-admin-grid">
        ${identityEditorBlueprint.map((block) => `
          <article class="management-admin-card">
            <h3>${esc(block.title)}</h3>
            ${block.fields.map(([name, label, type, fallback]) => {
              const value = esc(String(identity[name] ?? fallback ?? ""));
              if (type === "textarea") {
                return `<div class="field"><label>${esc(label)}</label><textarea name="${name}">${value}</textarea></div>`;
              }
              return `<div class="field"><label>${esc(label)}</label><input name="${name}" value="${value}"></div>`;
            }).join("")}
          </article>`).join("")}
      </div>
    </section>`;
}

function buildIdentityPayload(form) {
  return Object.fromEntries(identityEditorBlueprint.flatMap((block) => block.fields.map(([name]) => [name, String(form.querySelector(`[name="${name}"]`)?.value || "").trim()])));
}

function splitManagementResources(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", type = "", url = ""] = line.split("|").map((part) => part.trim());
      if (!label || !url) return null;
      return {
        label,
        type: /^(file|berkas|download)$/i.test(type) ? "file" : "link",
        url
      };
    })
    .filter(Boolean);
}

function buildManagementPayload(form) {
  return Object.fromEntries(managementEditorBlueprint.map((item) => {
    const lead = String(form.querySelector(`[name="management_${item.key}_lead"]`)?.value || "").trim();
    const points = splitLines(form.querySelector(`[name="management_${item.key}_points"]`)?.value || "");
    const resources = splitManagementResources(form.querySelector(`[name="management_${item.key}_resources"]`)?.value || "");
    return [item.key, { lead, points, resources }];
  }));
}

function quickLinksEditor(data = {}) {
  const links = Array.isArray(data.quickLinks) && data.quickLinks.length
    ? data.quickLinks
    : [
        { label: "E-raport", url: "#", icon: "report", tone: "aqua" },
        { label: "Bursa Kerja Khusus (BKK)", url: "#", icon: "briefcase", tone: "violet" },
        { label: "SAKA", url: "#", icon: "shield", tone: "gold" }
      ];
  return `
    <section class="management-admin">
      <div class="toolbar">
        <div>
          <h2>Layanan Sekolah</h2>
          <p>Kelola kartu akses cepat yang tampil di beranda.</p>
        </div>
        <button class="btn secondary" type="button" id="add-quick-link">Tambah Layanan</button>
      </div>
      <div class="management-admin-grid" id="quick-links-list">
        ${links.map((item, index) => quickLinkCard(item, index)).join("")}
      </div>
      <p class="hint">Setiap layanan berisi judul, tautan, ikon, dan warna kartu.</p>
    </section>`;
}

function quickLinkCard(item = {}, index = 0) {
  const icon = quickLinkIconOptions.includes(String(item.icon || "").trim()) ? String(item.icon).trim() : "link";
  const tone = quickLinkToneOptions.includes(String(item.tone || "").trim()) ? String(item.tone).trim() : "aqua";
  return `
    <article class="management-admin-card quick-link-card" data-quick-link-item>
      <div class="toolbar compact-toolbar">
        <h3>Layanan ${index + 1}</h3>
        <button class="btn danger" type="button" data-remove-quick-link>Hapus</button>
      </div>
      <div class="field">
        <label>Judul</label>
        <input name="quickLink_label" value="${esc(item.label || "")}" placeholder="Contoh: E-raport">
      </div>
      <div class="field">
        <label>Tautan</label>
        <input name="quickLink_url" value="${esc(item.url || "")}" placeholder="https://... atau /halaman-internal">
      </div>
      <div class="field">
        <label>Ikon</label>
        <select name="quickLink_icon">
          ${quickLinkIconOptions.map((option) => `<option value="${option}" ${icon === option ? "selected" : ""}>${fieldLabel(option)}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label>Warna Kartu</label>
        <select name="quickLink_tone">
          ${quickLinkToneOptions.map((option) => `<option value="${option}" ${tone === option ? "selected" : ""}>${fieldLabel(option)}</option>`).join("")}
        </select>
      </div>
    </article>`;
}

function collectQuickLinks(form) {
  return [...form.querySelectorAll("[data-quick-link-item]")].map((card) => ({
    label: String(card.querySelector('[name="quickLink_label"]')?.value || "").trim(),
    url: String(card.querySelector('[name="quickLink_url"]')?.value || "").trim(),
    icon: String(card.querySelector('[name="quickLink_icon"]')?.value || "link").trim(),
    tone: String(card.querySelector('[name="quickLink_tone"]')?.value || "aqua").trim()
  })).filter((item) => item.label && item.url);
}

function bindQuickLinkEditor(container) {
  const list = container.querySelector("#quick-links-list");
  const addButton = container.querySelector("#add-quick-link");
  if (!list || !addButton) return;

  const bindRemoveButtons = () => {
    list.querySelectorAll("[data-remove-quick-link]").forEach((button) => {
      button.onclick = () => {
        const cards = list.querySelectorAll("[data-quick-link-item]");
        if (cards.length <= 1) {
          notify("Minimal sisakan satu layanan sekolah.", "warning");
          return;
        }
        button.closest("[data-quick-link-item]")?.remove();
      };
    });
  };

  addButton.addEventListener("click", () => {
    list.insertAdjacentHTML("beforeend", quickLinkCard({}, list.querySelectorAll("[data-quick-link-item]").length));
    bindRemoveButtons();
  });

  bindRemoveButtons();
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
        const badge = page === "messages" || page === "testimonials" || page === "complaints" ? `<span class="menu-badge" data-menu-badge="${page}" hidden><i></i><b>0</b></span>` : "";
        return `<button ${attr} type="button"><span>${esc(label)}</span>${badge}</button>`;
      }).join("")}
    </div>`).join("");
}

async function updateMenuBadges() {
  try {
    const stats = await api("/api/stats");
    const badges = {
      messages: Number(stats.newMessages || 0),
      complaints: Number(stats.newComplaints || 0),
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
  if (page === "profile") return profileAdminPage();
  if (page === "settings") return settingsAdminPage();
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

async function settingsAdminPage() {
  const data = await api("/api/settings");
  document.querySelector("#main").innerHTML = `
    <div class="toolbar"><div><h1>Pengaturan Website</h1><p>Perbarui data utama website dan akses cepat beranda.</p></div></div>
    <form class="card form" id="single-form">
      ${formFields({ fields: settingsFields }, data || {})}
      ${quickLinksEditor(data || {})}
      <button class="btn">Simpan</button>
    </form>`;
  const form = document.querySelector("#single-form");
  bindQuickLinkEditor(form);
  wireKnownImageUploadFields(form, data || {});
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = formPayload(event.target, settingsFields);
    body.quickLinks = collectQuickLinks(event.target);
    await api("/api/settings", { method: "PUT", body: JSON.stringify(body) });
    notify("Data tersimpan.");
  });
}

async function profileAdminPage() {
  const data = await api("/api/profile");
  document.querySelector("#main").innerHTML = `
    <div class="toolbar"><div><h1>Profil Sekolah</h1><p>Perbarui data utama website.</p></div></div>
    <form class="card form" id="single-form">
      ${formFields({ fields: profileFields }, data || {})}
      ${managementEditor(data || {})}
      ${identityEditor(data || {})}
      <button class="btn">Simpan</button>
    </form>`;
  const form = document.querySelector("#single-form");
  wireKnownImageUploadFields(form, data || {});
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = formPayload(event.target, profileFields);
    body.management = buildManagementPayload(event.target);
    body.identity = buildIdentityPayload(event.target);
    await api("/api/profile", { method: "PUT", body: JSON.stringify(body) });
    notify("Data tersimpan.");
  });
}

async function resourcePage(key) {
  const config = resources[key];
  rows = await api(config.path);
  const filteredRows = key === "complaints"
    ? rows.filter((row) => complaintStatusFilter === "all" ? true : String(row.status || "") === complaintStatusFilter)
    : rows;
  document.querySelector("#main").innerHTML = `
    <div class="toolbar">
      <div><h1>${config.title}</h1><p>Kelola data ${config.title.toLowerCase()}.</p></div>
      <div class="toolbar-actions">
        ${key === "teachers" ? '<button class="btn ghost" id="open-template-sheet">Template Google Sheets</button><button class="btn secondary" id="import-sheet">Import Google Sheets</button>' : ""}
        ${key === "complaints" ? `<select id="complaint-status-filter" class="admin-filter"><option value="all" ${complaintStatusFilter === "all" ? "selected" : ""}>Semua Status</option><option value="new" ${complaintStatusFilter === "new" ? "selected" : ""}>Baru</option><option value="reviewed" ${complaintStatusFilter === "reviewed" ? "selected" : ""}>Ditinjau</option><option value="resolved" ${complaintStatusFilter === "resolved" ? "selected" : ""}>Selesai</option></select>` : ""}
        <button class="btn" id="add">Tambah</button>
      </div>
    </div>
    ${key === "teachers" ? `
      <div class="admin-search-panel">
        <label class="admin-search" for="teacher-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>
          <input id="teacher-search" type="search" value="${esc(teacherSearchQuery)}" placeholder="Cari nama, jabatan, mata pelajaran, bidang, atau status..." autocomplete="off">
        </label>
        <span id="teacher-search-count">${filteredRows.length} data</span>
      </div>` : ""}
    <div class="table-wrap">
      <table>
        <thead><tr><th>ID</th><th>Judul/Nama</th><th>Info</th><th>Aksi</th></tr></thead>
        <tbody>${filteredRows.map((row) => `
          <tr data-resource-row data-search="${esc([row.name, row.position, row.subject, row.expertise, row.status].filter(Boolean).join(" ").toLowerCase())}">
            <td>${row.id}</td>
            <td>${esc(row.name || row.title || row.username || row.subject || "-")}</td>
            <td>${esc(row.description || row.content || row.position || row.category || row.email || row.status || "").slice(0, 120)}</td>
            <td>
              ${key === "testimonials" ? `<button class="btn ghost" data-view="${row.id}">View</button>` : ""}
              ${key === "testimonials" && row.status !== "approved" ? `<button class="btn" data-approve="${row.id}">Approve</button>` : ""}
              ${key === "messages" && row.status === "new" ? `<button class="btn" data-read="${row.id}">Tandai Dibaca</button>` : ""}
              <button class="btn ghost" data-edit="${row.id}">Edit</button>
              <button class="btn danger" data-delete="${row.id}">Hapus</button>
            </td>
          </tr>`).join("")}${filteredRows.length
            ? key === "teachers" ? '<tr data-search-empty hidden><td colspan="4" class="empty">Data Guru & Tendik tidak ditemukan.</td></tr>' : ""
            : '<tr><td colspan="4" class="empty">Belum ada data.</td></tr>'}</tbody>
      </table>
    </div>`;
  if (key === "teachers") {
    document.querySelector("#open-template-sheet").addEventListener("click", () => openTeacherTemplate());
    document.querySelector("#import-sheet").addEventListener("click", () => openTeacherImport());
    const searchInput = document.querySelector("#teacher-search");
    const searchCount = document.querySelector("#teacher-search-count");
    const applyTeacherSearch = () => {
      teacherSearchQuery = String(searchInput?.value || "").trim().toLowerCase();
      let visible = 0;
      document.querySelectorAll("[data-resource-row]").forEach((row) => {
        const matches = !teacherSearchQuery || String(row.dataset.search || "").includes(teacherSearchQuery);
        row.hidden = !matches;
        if (matches) visible += 1;
      });
      const emptyRow = document.querySelector("[data-search-empty]");
      if (emptyRow) emptyRow.hidden = visible !== 0;
      if (searchCount) searchCount.textContent = `${visible} dari ${rows.length} data`;
    };
    searchInput?.addEventListener("input", applyTeacherSearch);
    applyTeacherSearch();
  }
  if (key === "complaints") {
    document.querySelector("#complaint-status-filter")?.addEventListener("change", (event) => {
      complaintStatusFilter = String(event.target.value || "all");
      resourcePage("complaints");
    });
  }
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
    const item = rows.find((row) => row.id === Number(button.dataset.delete));
    const itemName = item?.name || item?.title || item?.username || item?.subject || `ID ${button.dataset.delete}`;
    const confirmed = await confirmAction({
      title: `Hapus ${config.title}`,
      message: `Data "${itemName}" akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.`,
      confirmLabel: "Hapus",
      danger: true
    });
    if (!confirmed) return;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = "Menghapus...";
    try {
      await api(`${config.path}/${button.dataset.delete}`, { method: "DELETE" });
      await resourcePage(key);
      await updateMenuBadges();
      notify(`${config.title} berhasil dihapus.`);
    } catch (error) {
      button.disabled = false;
      button.textContent = originalText;
      notify(error.message || `${config.title} gagal dihapus.`, "error");
    }
  }));
  await updateMenuBadges();
}

function openTeacherImport() {
  const modal = document.querySelector("#modal");
  const box = document.querySelector("#modal-box");
  box.innerHTML = `
    <div class="toolbar"><h2>Import Guru & Tendik dari Google Sheets</h2><button class="btn ghost" id="close">Tutup</button></div>
    <form class="form" id="teacher-import-form">
      <div class="field">
        <label>URL Google Sheets</label>
        <input name="url" placeholder="https://docs.google.com/spreadsheets/d/..." required>
        <p class="hint">Gunakan sheet yang sudah dibuka publik atau URL ekspor CSV. Header kolom akan dipetakan otomatis.</p>
      </div>
      <div class="field">
        <label>Mode Import</label>
        <select name="mode">
          <option value="upsert">Tambah / perbarui data yang sudah ada</option>
          <option value="replace">Hapus semua lalu impor ulang</option>
        </select>
      </div>
      <button class="btn">Import</button>
    </form>`;
  modal.classList.add("open");
  document.querySelector("#close").addEventListener("click", () => modal.classList.remove("open"));
  document.querySelector("#teacher-import-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.target));
    try {
      const result = await api("/api/teachers/import/google-sheets", { method: "POST", body: JSON.stringify(body) });
      modal.classList.remove("open");
      await resourcePage("teachers");
      await updateMenuBadges();
      notify(`Import selesai: ${result.inserted} baru, ${result.updated} diperbarui.`);
    } catch (error) {
      notify(error.message || "Import Google Sheets gagal.", "error");
    }
  });
}

function openTeacherTemplate() {
  const modal = document.querySelector("#modal");
  const box = document.querySelector("#modal-box");
  box.innerHTML = `
    <div class="toolbar"><h2>Template Google Sheets Guru & Tendik</h2><button class="btn ghost" id="close">Tutup</button></div>
    <article class="detail-view">
      <p class="prose">Gunakan template ini agar format kolom sesuai dengan importer. Download CSV, upload ke Google Sheets, isi data, lalu gunakan URL sheet tersebut saat import.</p>
      <div class="detail-grid">
        <div><strong>Kolom Wajib</strong><p>Nama, Jabatan</p></div>
        <div><strong>Kolom Didukung</strong><p>Mapel, Bidang Keahlian, Status, Photo URL</p></div>
        <div><strong>Status Valid</strong><p>active, inactive, nonaktif, pensiun</p></div>
        <div><strong>Photo URL</strong><p>Opsional. Isi URL foto guru jika tersedia.</p></div>
      </div>
      <div class="detail-message">
        <strong>Header Template</strong>
        <p>Nama | Jabatan | Mapel | Bidang Keahlian | Status | Photo URL</p>
      </div>
      <div class="detail-socials">
        <a class="btn" href="/api/teachers/import/template.csv" target="_blank" rel="noopener noreferrer">Download CSV Template</a>
        <a class="btn ghost" href="https://docs.google.com/spreadsheets/u/0/create" target="_blank" rel="noopener noreferrer">Buka Google Sheets</a>
      </div>
    </article>`;
  modal.classList.add("open");
  document.querySelector("#close").addEventListener("click", () => modal.classList.remove("open"));
}

function openDetail(key, item = {}) {
  const config = resources[key];
  const modal = document.querySelector("#modal");
  const box = document.querySelector("#modal-box");
  if (key !== "testimonials" || !item.id) return;
  const socialLinks = [
    item.whatsapp ? { label: "WhatsApp", href: item.whatsapp } : null,
    item.telegram ? { label: "Telegram", href: item.telegram } : null,
    item.instagram ? { label: "Instagram", href: item.instagram } : null,
    item.tiktok ? { label: "TikTok", href: item.tiktok } : null,
    item.facebook ? { label: "Facebook", href: item.facebook } : null,
    item.youtube ? { label: "YouTube", href: item.youtube } : null
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
        <div><strong>WhatsApp</strong><p>${item.whatsapp ? `<a href="${esc(item.whatsapp)}" target="_blank" rel="noopener noreferrer">${esc(item.whatsapp)}</a>` : "-"}</p></div>
        <div><strong>Telegram</strong><p>${item.telegram ? `<a href="${esc(item.telegram)}" target="_blank" rel="noopener noreferrer">${esc(item.telegram)}</a>` : "-"}</p></div>
        <div><strong>Instagram</strong><p>${item.instagram ? `<a href="${esc(item.instagram)}" target="_blank" rel="noopener noreferrer">${esc(item.instagram)}</a>` : "-"}</p></div>
        <div><strong>TikTok</strong><p>${item.tiktok ? `<a href="${esc(item.tiktok)}" target="_blank" rel="noopener noreferrer">${esc(item.tiktok)}</a>` : "-"}</p></div>
        <div><strong>Facebook</strong><p>${item.facebook ? `<a href="${esc(item.facebook)}" target="_blank" rel="noopener noreferrer">${esc(item.facebook)}</a>` : "-"}</p></div>
        <div><strong>YouTube</strong><p>${item.youtube ? `<a href="${esc(item.youtube)}" target="_blank" rel="noopener noreferrer">${esc(item.youtube)}</a>` : "-"}</p></div>
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

function wireImageUploadField({ input, initialValue = "", title, description, successText, emptyText = "Belum ada file yang dipilih." }) {
  const field = input?.closest(".field");
  if (!field || field.querySelector("[data-inline-upload]")) return;
  field.insertAdjacentHTML("beforeend", `
    <div class="inline-upload" data-inline-upload>
      <div class="inline-upload-head">
        <strong>${esc(title)}</strong>
        <span>${esc(description)}</span>
      </div>
      <div class="inline-upload-row">
        <input type="file" accept="image/*" data-banner-file>
        <button class="btn secondary" type="button" data-banner-upload>Upload Gambar</button>
      </div>
      <p class="inline-upload-status" data-banner-status>${initialValue ? "Gambar sudah terpasang." : esc(emptyText)}</p>
      <div class="inline-upload-preview${initialValue ? "" : " hidden"}" data-banner-preview-wrap>
        <img src="${esc(initialValue)}" alt="Preview banner" data-banner-preview>
      </div>
    </div>`);

  const uploadButton = field.querySelector("[data-banner-upload]");
  const fileInput = field.querySelector("[data-banner-file]");
  const status = field.querySelector("[data-banner-status]");
  const previewWrap = field.querySelector("[data-banner-preview-wrap]");
  const preview = field.querySelector("[data-banner-preview]");

  uploadButton?.addEventListener("click", async () => {
    const file = fileInput?.files?.[0];
    if (!file) {
      notify("Pilih file gambar terlebih dahulu.", "warning");
      return;
    }
    const payload = new FormData();
    payload.append("file", file);
    uploadButton.disabled = true;
    uploadButton.textContent = "Mengunggah...";
    if (status) status.textContent = "Sedang mengunggah gambar...";
    try {
      const res = await fetch("/api/upload", { method: "POST", body: payload });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error?.message || "Upload gambar gagal.");
      input.value = json.data.url || "";
      if (preview && previewWrap) {
        preview.src = json.data.url || "";
        previewWrap.classList.remove("hidden");
      }
      if (status) status.textContent = "Upload selesai. URL gambar terisi otomatis.";
      notify(successText);
    } catch (error) {
      if (status) status.textContent = error.message || "Upload gambar gagal.";
      notify(error.message || "Upload gambar gagal.", "error");
    } finally {
      uploadButton.disabled = false;
      uploadButton.textContent = "Upload Gambar";
    }
  });
}

function wireKnownImageUploadFields(form, data = {}) {
  Object.entries(imageUploadFieldConfig).forEach(([fieldName, config]) => {
    const input = form.querySelector(`input[name="${fieldName}"]`);
    if (!input) return;
    wireImageUploadField({
      input,
      initialValue: String(data?.[fieldName] || input.value || "").trim(),
      title: config.title,
      description: config.description,
      successText: config.successText
    });
  });
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
  const form = document.querySelector("#resource-form");
  wireKnownImageUploadFields(form, item);
  form.addEventListener("submit", async (event) => {
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

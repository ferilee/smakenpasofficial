const app = document.querySelector("#app");
const state = { home: null, profile: null };
let heroTimer = null;
let pwaRegistered = false;
const themeStorageKey = "websmakenpas-theme";

const navItems = [
  ["Beranda", "/"],
  ["Profil", "/profil"],
  ["Program Keahlian", "/program-keahlian"],
  ["Guru & Tendik", "/guru-tendik"],
  ["Galeri", "/galeri"],
  ["Agenda", "/agenda"],
  ["Pengumuman", "/pengumuman"],
  ["Unduhan", "/unduhan"],
  ["Berita", "/berita"],
  ["Kontak", "/kontak"]
];

const mobilePrimaryNav = [
  ["Beranda", "/", "home"],
  ["Jurusan", "/program-keahlian", "layers"],
  ["Pengumuman", "/pengumuman", "bell"],
  ["Berita", "/berita", "newspaper"]
];

const mobileMoreNav = [
  ["Profil", "/profil", "school"],
  ["Guru & Tendik", "/guru-tendik", "users"],
  ["Agenda", "/agenda", "calendar"],
  ["Unduhan", "/unduhan", "download"],
  ["Pengaduan", "/pengaduan", "report"],
  ["Kontak", "/kontak", "phone"],
  ["Login Admin", "/admin", "login"]
];

function getPreferredTheme() {
  const saved = localStorage.getItem(themeStorageKey);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const label = theme === "dark" ? "Mode Terang" : "Mode Gelap";
    button.innerHTML = navIcon(theme === "dark" ? "sun" : "moon");
    button.setAttribute("aria-label", label);
    button.setAttribute("title", label);
    button.setAttribute("aria-pressed", String(theme === "dark"));
  });
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  localStorage.setItem(themeStorageKey, next);
  applyTheme(next);
}

applyTheme(getPreferredTheme());

function navIcon(name) {
  const icons = {
    home: `<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h5v-6h4v6h5v-9.5"/>`,
    layers: `<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 13 9 5 9-5"/><path d="m3 18 9 5 9-5"/>`,
    bell: `<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>`,
    newspaper: `<path d="M4 5h13a3 3 0 0 1 3 3v11H6a2 2 0 0 1-2-2V5Z"/><path d="M8 9h6"/><path d="M8 13h8"/><path d="M8 17h5"/>`,
    more: `<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>`,
    report: `<path d="M7 3h8l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h6"/><path d="M9 9h2"/>`,
    briefcase: `<path d="M10 6V5a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v1"/><rect x="3" y="6" width="18" height="14" rx="2"/><path d="M3 12h18"/><path d="M10 12v2h4v-2"/>`,
    shield: `<path d="M12 3 20 6v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6l8-3Z"/><path d="m9 12 2 2 4-5"/>`,
    moon: `<path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.7 6.7 0 0 0 9.8 9.8Z"/>`,
    sun: `<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>`,
    arrowUp: `<path d="m12 19V5"/><path d="m5 12 7-7 7 7"/>`,
    login: `<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><path d="m10 17 5-5-5-5"/><path d="M15 12H3"/>`,
    school: `<path d="m3 10 9-5 9 5-9 5-9-5Z"/><path d="M5 12v5c2 2 12 2 14 0v-5"/><path d="M12 15v5"/>`,
    users: `<path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>`,
    calendar: `<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>`,
    download: `<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/>`,
    globe: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a15 15 0 0 1 0 18"/><path d="M12 3a15 15 0 0 0 0 18"/>`,
    book: `<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>`,
    link: `<path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5"/><path d="M14 11a5 5 0 0 0-7.07 0L5.5 12.41a5 5 0 1 0 7.07 7.07L14 19"/>`,
    phone: `<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.77.63 2.6a2 2 0 0 1-.45 2.11L8 9.7a16 16 0 0 0 6.3 6.3l1.27-1.27a2 2 0 0 1 2.11-.45c.83.3 1.7.51 2.6.63A2 2 0 0 1 22 16.92Z"/>`
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name] || icons.more}</svg>`;
}

function footerSocialIcon(name) {
  const icons = {
    youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.6 4.6 12 4.6 12 4.6s-5.6 0-7.5.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.9.5 7.5.5 7.5.5s5.6 0 7.5-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.4-4.8ZM10 15.5v-7l6 3.5-6 3.5Z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.5"/><circle cx="17" cy="7" r="1"/></svg>`,
    email: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>`
  };
  return icons[name] || "";
}

function isNavActive(url) {
  if (url === "/") return location.pathname === "/";
  return location.pathname === url || location.pathname.startsWith(`${url}/`);
}

function bottomNavigation() {
  const moreActive = mobileMoreNav.some(([, url]) => isNavActive(url));
  return `<div class="mobile-more-backdrop" data-more-close hidden></div>
    <aside class="mobile-more-sheet" id="mobile-more-sheet" aria-hidden="true">
      <div class="mobile-more-handle"></div>
      <nav class="mobile-more-list" aria-label="Menu lainnya">
        ${mobileMoreNav.map(([label, url, icon]) => `<a class="mobile-more-link ${isNavActive(url) ? "active" : ""}" href="${url}">${navIcon(icon)}<span>${label}</span></a>`).join("")}
      </nav>
    </aside>
    <nav class="bottom-nav" aria-label="Navigasi mobile">
      ${mobilePrimaryNav.map(([label, url, icon]) => `<a class="bottom-nav-item ${isNavActive(url) ? "active" : ""}" href="${url}" aria-label="${label}">${navIcon(icon)}<span class="bottom-nav-label">${label}</span></a>`).join("")}
      <button class="bottom-nav-item ${moreActive ? "active" : ""}" type="button" data-more-toggle aria-label="More" aria-expanded="false">${navIcon("more")}<span class="bottom-nav-label">More</span></button>
    </nav>`;
}

async function api(path, options) {
  const res = await fetch(path, options);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error?.message || "Terjadi kesalahan");
  return json.data;
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function dateId(value) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
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

function dateKey(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function layout(content, data = state.home) {
  const school = data?.settings?.schoolName || "Website Sekolah";
  const footerLinks = [
    ["Profil", "/profil"],
    ["Jurusan", "/program-keahlian"],
    ["Agenda", "/agenda"],
    ["Pengaduan", "/pengaduan"],
    ["Kontak", "/kontak"]
  ];
  const footerSocials = [
    ["YouTube", "https://www.youtube.com/@SMKNPasirianOfficial", "youtube"],
    ["Instagram", "https://www.instagram.com/smknpasofficial/", "instagram"]
  ];
  const support = "info@smkpasirian-lmj.sch.id";
  return `
    <header class="topbar">
      <div class="container nav">
        <a class="brand" href="/"><span class="brand-mark">S</span><span>${esc(school)}</span></a>
        <nav class="nav-links">
          ${navItems.map(([label, url]) => `<a class="${location.pathname === url ? "active" : ""}" href="${url}">${label}</a>`).join("")}
          <button class="theme-toggle" data-theme-toggle type="button" aria-pressed="false" aria-label="Mode Gelap"></button>
        </nav>
      </div>
    </header>
    ${content}
    <footer class="footer">
      <div class="container">
        <div class="footer-panel">
          <div class="footer-brand">
            <strong>${esc(school)}</strong>
          </div>
          <div class="footer-main">
            <nav class="footer-links" aria-label="Link footer">
              ${footerLinks.map(([label, url]) => `<a href="${url}">${esc(label)}</a>`).join("")}
            </nav>
            <p>${esc(data?.settings?.footerText || "SMK Negeri Pasirian. Seluruh hak cipta dilindungi.")}</p>
          </div>
          <div class="footer-contact">
            <div class="footer-socials">
              ${footerSocials.map(([name, url, icon]) => `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(name)}">${footerSocialIcon(icon)}</a>`).join("")}
              <a href="mailto:${esc(support)}" aria-label="Email">${footerSocialIcon("email")}</a>
            </div>
            <p>Email: <a href="mailto:${esc(support)}">${esc(support)}</a></p>
          </div>
        </div>
      </div>
    </footer>
    ${bottomNavigation()}`;
}

function sectionHead(title, text, action = "") {
  return `<div class="section-head"><div><h2>${title}</h2><p>${text}</p></div>${action}</div>`;
}

function card(title, text, extra = "") {
  return `<article class="card">${extra}<h3>${esc(title)}</h3><p>${esc(text)}</p></article>`;
}

function makeMajorIllustration(title, index) {
  const initials = (title || "JR")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  const palettes = [
    ["#fff3e8", "#ff6a13", "#1f2948"],
    ["#edf4ff", "#4b6bff", "#1f2948"],
    ["#eefcf4", "#2f9a66", "#1f2948"],
    ["#fff1f5", "#d94f8a", "#1f2948"]
  ];
  const [bg, accent, ink] = palettes[index % palettes.length];
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 900 620'>
    <rect width='900' height='620' fill='${bg}'/>
    <circle cx='760' cy='120' r='120' fill='${accent}' opacity='.15'/>
    <circle cx='140' cy='520' r='160' fill='${accent}' opacity='.14'/>
    <rect x='80' y='110' rx='28' ry='28' width='740' height='400' fill='white' stroke='${accent}' stroke-width='6'/>
    <text x='120' y='190' fill='${ink}' font-size='34' font-family='Segoe UI, Arial, sans-serif' font-weight='700'>Program Keahlian</text>
    <text x='120' y='255' fill='${accent}' font-size='84' font-family='Segoe UI, Arial, sans-serif' font-weight='800'>${initials}</text>
    <rect x='120' y='300' rx='10' ry='10' width='430' height='20' fill='${accent}' opacity='.25'/>
    <rect x='120' y='336' rx='10' ry='10' width='360' height='20' fill='${accent}' opacity='.18'/>
    <rect x='120' y='372' rx='10' ry='10' width='400' height='20' fill='${accent}' opacity='.12'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function majorCard(item) {
  const image = item.imageUrl || makeMajorIllustration(item.name, Number(item.id || 0));
  const detailUrl = `/program-keahlian/${encodeURIComponent(item.slug || item.id || "")}`;
  return `<article class="major-card">
    <div class="major-image-wrap">
      <img class="major-image" src="${esc(image)}" alt="${esc(item.name)}">
    </div>
    <div class="major-body">
      <h3>${esc(item.name)}</h3>
      <a class="major-btn" href="${detailUrl}">LIHAT DETAIL JURUSAN &#8594;</a>
    </div>
  </article>`;
}

function majorsShowcase(data, withMoreButton = false, showHeader = true) {
  const items = (data.majors || []).slice(0, withMoreButton ? 8 : 4);
  return `<section class="majors-showcase">
    <div class="container">
      ${showHeader ? `<div class="majors-head">
        <p>PROGRAM KEAHLIAN</p>
        <h2>Jurusan</h2>
        <span>Sub Jurusan</span>
      </div>` : ""}
      <div class="majors-grid">${items.map(majorCard).join("")}</div>
      ${withMoreButton ? '<div class="majors-more-wrap"><a class="majors-more" href="/program-keahlian">LIHAT PROGRAM KEAHLIAN LAINNYA &#8594;</a></div>' : ""}
    </div>
  </section>`;
}

function quickAccessSection(settings = {}) {
  const fallback = [
    { label: "E-raport", url: "#", icon: "report", tone: "aqua" },
    { label: "Bursa Kerja Khusus (BKK)", url: "#", icon: "briefcase", tone: "violet" },
    { label: "SAKA", url: "#", icon: "shield", tone: "gold" }
  ];
  const items = Array.isArray(settings.quickLinks) && settings.quickLinks.length ? settings.quickLinks : fallback;
  const normalized = items
    .map((item, index) => ({
      label: String(item?.label || "").trim(),
      url: String(item?.url || "#").trim() || "#",
      icon: ["report", "briefcase", "shield", "graduation", "globe", "link", "book", "download"].includes(String(item?.icon || "").trim()) ? String(item.icon).trim() : fallback[index % fallback.length].icon,
      tone: ["aqua", "violet", "gold"].includes(String(item?.tone || "").trim()) ? String(item.tone).trim() : fallback[index % fallback.length].tone
    }))
    .filter((item) => item.label);
  return `<section class="quick-access">
    <div class="container">
      <div class="quick-palette" aria-hidden="true">
        ${["#ff7a59", "#ffc44d", "#3ac7b6", "#34c7de", "#55b7f2", "#6f76f6", "#b45fee", "#e758a2"].map((color) => `<span style="background:${color}"></span>`).join("")}
      </div>
      <div class="quick-head">
        <p>AKSES CEPAT</p>
        <h2>Layanan Sekolah</h2>
        <span>Pintasan informasi dan layanan utama</span>
      </div>
      <div class="quick-grid">
        ${normalized.map((item) => `<a class="quick-card ${item.tone}" href="${esc(item.url)}" ${/^https?:\/\//i.test(item.url) ? 'target="_blank" rel="noopener noreferrer"' : ""} aria-label="${esc(item.label)}">
          <span class="quick-icon">${navIcon(item.icon)}</span>
          <strong>${esc(item.label)}</strong>
        </a>`).join("")}
      </div>
    </div>
  </section>`;
}

const managementBlueprint = [
  {
    key: "kurikulum",
    label: "Kurikulum",
    tone: "aqua",
    title: "Manajemen Kurikulum",
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
    tone: "violet",
    title: "Manajemen Kesiswaan",
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
    tone: "gold",
    title: "Manajemen Prasarana dan Sarana",
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
    tone: "teal",
    title: "Manajemen Hubungan Masyarakat",
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

function splitManagementResources(value) {
  return String(value ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label = "", type = "", url = ""] = line.split("|").map((part) => part.trim());
      const finalType = /^(file|berkas|download)$/i.test(type) ? "file" : "link";
      if (!label || !url) return null;
      return { label, type: finalType, url };
    })
    .filter(Boolean);
}

function normalizeManagementContent(raw = {}) {
  return managementBlueprint.map((item) => {
    const current = raw?.[item.key] || {};
    const points = Array.isArray(current.points) ? current.points : splitLines(current.points || "");
    const resources = Array.isArray(current.resources) ? current.resources : splitManagementResources(current.resources || "");
    return {
      ...item,
      lead: String(current.lead || item.defaultLead || "").trim(),
      points: points.length ? points : item.defaultPoints,
      resources: resources.length ? resources : item.defaultResources || []
    };
  });
}

function managementSchoolSection(management = {}) {
  const items = normalizeManagementContent(management);

  return `<section class="management-access">
    <div class="management-access-head">
      <p>MANAGEMENT SEKOLAH</p>
      <h3>Akses cepat unit kerja sekolah</h3>
      <span>Lihat detail singkat empat bidang manajemen yang menggerakkan operasional sekolah.</span>
    </div>
    <div class="management-grid">
      ${items.map((item) => `<button class="management-card ${item.tone}" type="button" data-management-open="${esc(item.key)}">
        <strong>${esc(item.label)}</strong>
        <span>Buka detail</span>
      </button>`).join("")}
    </div>
    <div class="management-modal" data-management-modal hidden>
      <div class="management-modal-backdrop" data-management-close></div>
      <article class="management-modal-box" role="dialog" aria-modal="true" aria-labelledby="management-modal-title">
        <button class="management-modal-close" type="button" data-management-close aria-label="Tutup">&times;</button>
        <p class="management-modal-kicker">Manajemen Sekolah</p>
        <h3 id="management-modal-title" data-management-title></h3>
        <p class="management-modal-lead" data-management-lead></p>
        <div class="management-modal-list" data-management-list></div>
        <div class="management-modal-resources" data-management-resources hidden></div>
      </article>
    </div>
    <script type="application/json" id="management-school-data">${JSON.stringify(items).replace(/</g, "\\u003c")}</script>
  </section>`;
}

function agendaCalendarSection(agendas = []) {
  const validAgendas = agendas.filter((item) => item.startDate);
  const today = new Date();
  const upcoming = validAgendas
    .map((item) => ({ ...item, date: new Date(item.startDate) }))
    .filter((item) => !Number.isNaN(item.date.getTime()))
    .sort((a, b) => a.date - b.date)
    .find((item) => dateKey(item.date) >= dateKey(today));
  const base = upcoming?.date || (validAgendas[0]?.startDate ? new Date(validAgendas[0].startDate) : today);
  const year = base.getFullYear();
  const month = base.getMonth();
  const firstDay = new Date(year, month, 1);
  const totalDays = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (firstDay.getDay() + 6) % 7;
  const agendaByDate = {};

  validAgendas.forEach((item) => {
    const start = new Date(item.startDate);
    const end = item.endDate ? new Date(item.endDate) : start;
    if (Number.isNaN(start.getTime())) return;
    const cursor = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    const limit = Number.isNaN(end.getTime()) ? start : end;
    while (cursor <= limit) {
      const key = dateKey(cursor);
      if (!agendaByDate[key]) agendaByDate[key] = [];
      agendaByDate[key].push(item);
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  const cells = [];
  for (let i = 0; i < leadingBlanks; i += 1) cells.push('<div class="calendar-cell muted" aria-hidden="true"></div>');
  for (let day = 1; day <= totalDays; day += 1) {
    const current = new Date(year, month, day);
    const key = dateKey(current);
    const items = agendaByDate[key] || [];
    const isToday = key === dateKey(today);
    cells.push(`<button class="calendar-cell ${items.length ? "has-agenda" : ""} ${isToday ? "today" : ""}" type="button" data-agenda-date="${key}" ${items.length ? "" : "disabled"} aria-label="${items.length ? `${day}, ${items.length} agenda` : `Tanggal ${day}`}">
      <span class="calendar-day">${day}</span>
      ${items.length ? `<span class="calendar-dot">${items.length}</span>` : ""}
    </button>`);
  }

  return `<section class="agenda-calendar-section">
    <div class="container">
      ${sectionHead("Agenda Terdekat", "Kalender kegiatan sekolah bulan ini. Klik tanggal yang ditandai untuk melihat detail.")}
      <div class="calendar-card">
        <div class="calendar-top">
          <div>
            <p>Kalender Agenda</p>
            <h3>${new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(base)}</h3>
          </div>
          <a class="btn ghost" href="/agenda">Lihat Semua Agenda</a>
        </div>
        <div class="calendar-weekdays">${["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day) => `<span>${day}</span>`).join("")}</div>
        <div class="calendar-grid">${cells.join("")}</div>
      </div>
    </div>
    <div class="agenda-modal" data-agenda-modal hidden>
      <div class="agenda-modal-backdrop" data-agenda-modal-close></div>
      <article class="agenda-modal-box" role="dialog" aria-modal="true" aria-labelledby="agenda-modal-title">
        <button class="agenda-modal-close" type="button" data-agenda-modal-close aria-label="Tutup">&times;</button>
        <p class="agenda-modal-date" data-agenda-modal-date></p>
        <h3 id="agenda-modal-title">Detail Agenda</h3>
        <div class="agenda-modal-list" data-agenda-modal-list></div>
      </article>
    </div>
    <script type="application/json" id="agenda-calendar-data">${JSON.stringify(agendaByDate).replace(/</g, "\\u003c")}</script>
  </section>`;
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "A";
}

function testimonialsSection(testimonials = []) {
  const items = testimonials.length ? testimonials : [
    {
      name: "Alumni Sekolah",
      graduationYear: "",
      occupation: "Lulusan",
      photoUrl: "",
      message: "Testimoni alumni akan tampil di sini setelah disetujui oleh admin."
    }
  ];
  const socialIcon = (platform) => ({
    whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"/><path d="M8.5 8.2c.4 2.7 2.6 4.9 5.3 5.3"/></svg>`,
    telegram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 4-3 16-6-4-3 3v-5l9-7-11 6-4-2 18-7Z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.5" cy="6.5" r="1.2"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v9.2a3.8 3.8 0 1 1-3.8-3.8"/><path d="M14 4c1 2.1 2.8 3.3 5 3.5"/></svg>`,
    facebook: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 9h3V5h-3c-2.8 0-5 2.2-5 5v3H7v4h2v4h4v-4h3.2l.8-4H13v-3c0-.6.4-1 1-1Z"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="4"/><path d="m10 9 5 3-5 3V9Z"/></svg>`
  })[platform];
  return `<section class="testimonials-section">
    <div class="container">
      ${sectionHead("Testimoni Alumni", "Cerita lulusan tentang pengalaman belajar dan dampaknya setelah menempuh pendidikan.", '<button class="btn btn-with-icon" type="button" data-testimonial-open><span aria-hidden="true">+</span><span>Testimoni Baru</span></button>')}
      <div class="testimonial-toolbar">
        <div class="field testimonial-search">
          <label>Cari Tahun Lulus</label>
          <input data-testimonial-year type="search" inputmode="numeric" placeholder="Contoh: 2022">
        </div>
        <div class="testimonial-nav">
          <button class="hero-arrow testimonial-arrow" type="button" data-testimonial-prev aria-label="Testimoni sebelumnya">&#8592;</button>
          <button class="hero-arrow testimonial-arrow" type="button" data-testimonial-next aria-label="Testimoni berikutnya">&#8594;</button>
        </div>
      </div>
      <div class="testimonial-carousel" data-testimonial-carousel>
        <div class="testimonial-track" data-testimonial-track>
          ${items.map((item, index) => `<article class="testimonial-card" data-testimonial-card data-year="${esc(item.graduationYear || "")}" style="--testimonial-index:${index}">
            <div class="testimonial-quote">“</div>
            <p>${esc(item.message || "-")}</p>
            <div class="testimonial-socials">
              ${item.whatsapp ? `<a href="${esc(item.whatsapp)}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">${socialIcon("whatsapp")}</a>` : ""}
              ${item.telegram ? `<a href="${esc(item.telegram)}" target="_blank" rel="noopener noreferrer" aria-label="Telegram">${socialIcon("telegram")}</a>` : ""}
              ${item.instagram ? `<a href="${esc(item.instagram)}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">${socialIcon("instagram")}</a>` : ""}
              ${item.tiktok ? `<a href="${esc(item.tiktok)}" target="_blank" rel="noopener noreferrer" aria-label="TikTok">${socialIcon("tiktok")}</a>` : ""}
              ${item.facebook ? `<a href="${esc(item.facebook)}" target="_blank" rel="noopener noreferrer" aria-label="Facebook">${socialIcon("facebook")}</a>` : ""}
              ${item.youtube ? `<a href="${esc(item.youtube)}" target="_blank" rel="noopener noreferrer" aria-label="YouTube">${socialIcon("youtube")}</a>` : ""}
            </div>
            <div class="testimonial-author">
              ${item.photoUrl ? `<img src="${esc(item.photoUrl)}" alt="${esc(item.name)}">` : `<span>${esc(initials(item.name))}</span>`}
              <div>
                <h3>${esc(item.name || "Alumni")}</h3>
                <small>${esc([item.occupation, item.graduationYear ? `Angkatan ${item.graduationYear}` : ""].filter(Boolean).join(" - ") || "Alumni")}</small>
              </div>
            </div>
          </article>`).join("")}
        </div>
        <p class="empty testimonial-empty" data-testimonial-empty hidden>Tidak ada testimoni untuk tahun tersebut.</p>
      </div>
    </div>
    <div class="testimonial-modal" data-testimonial-modal hidden>
      <div class="testimonial-modal-backdrop" data-testimonial-close></div>
      <article class="testimonial-modal-box" role="dialog" aria-modal="true" aria-labelledby="testimonial-modal-title">
        <button class="agenda-modal-close" type="button" data-testimonial-close aria-label="Tutup">&times;</button>
        <p class="agenda-modal-date">Testimoni Alumni</p>
        <h3 id="testimonial-modal-title">Beri Testimoni</h3>
        <form class="form" id="testimonial-form">
          <div class="field"><label>Nama</label><input name="name" required></div>
          <div class="field"><label>Tahun Lulus</label><input name="graduationYear" placeholder="Contoh: 2022"></div>
          <div class="field"><label>Pekerjaan / Aktivitas Saat Ini</label><input name="occupation" placeholder="Contoh: Web Developer"></div>
          <div class="field testimonial-photo-field">
            <label>Foto Alumni</label>
            <input name="photo" type="file" accept="image/*" data-testimonial-photo>
            <small>Format gambar, maksimal 5 MB. Foto akan diunggah ke RustFS.</small>
            <div class="testimonial-photo-preview" data-testimonial-photo-preview hidden><img alt="Preview foto alumni"></div>
          </div>
          <div class="field"><label>WhatsApp</label><input name="whatsapp" inputmode="tel" placeholder="Contoh: 081234567890"></div>
          <div class="field"><label>Telegram</label><input name="telegram" placeholder="username telegram atau URL"></div>
          <div class="field"><label>Instagram</label><input name="instagram" placeholder="username instagram atau URL"></div>
          <div class="field"><label>TikTok</label><input name="tiktok" placeholder="username tiktok atau URL"></div>
          <div class="field"><label>Facebook</label><input name="facebook" placeholder="username facebook atau URL"></div>
          <div class="field"><label>YouTube</label><input name="youtube" placeholder="handle youtube atau URL"></div>
          <div class="field"><label>Testimoni</label><textarea name="message" required></textarea></div>
          <button class="btn">Kirim Testimoni</button>
          <p class="testimonial-note" data-testimonial-note></p>
        </form>
      </article>
    </div>
  </section>`;
}

function teacherCard(item) {
  const image = item.photoUrl || makeMajorIllustration(item.name, Number(item.id || 0));
  const detailUrl = `/guru-tendik/${encodeURIComponent(item.id || "")}`;
  return `<article class="major-card teacher-card">
    <div class="major-image-wrap">
      <img class="major-image teacher-image" src="${esc(image)}" alt="${esc(item.name)}">
    </div>
    <div class="major-body">
      <h3>${esc(item.name)}</h3>
      <p class="teacher-meta">${esc(item.position || item.subject || "Guru / Tendik")}</p>
      <a class="major-btn" href="${detailUrl}">LIHAT DETAIL GURU &#8594;</a>
    </div>
  </article>`;
}

function teacherCategory(item) {
  const position = String(item.position || "").toLowerCase();
  if (position.includes("wakil")) return "Wakil Kepala Sekolah";
  if (position.includes("kepala sekolah") || position.includes("principal")) return "Kepala Sekolah";
  if (position.includes("ketua") || position.includes("konsentrasi") || position.includes("kaprodi") || position.includes("kompetensi keahlian")) return "Ketua Konsentrasi Keahlian";
  return "Guru-guru";
}

function teacherSpotlight(item, title, note = "") {
  const image = item.photoUrl || makeMajorIllustration(item.name, Number(item.id || 0));
  const detailUrl = `/guru-tendik/${encodeURIComponent(item.id || "")}`;
  return `<article class="teacher-spotlight-card">
    <div class="teacher-spotlight-image">
      <img src="${esc(image)}" alt="${esc(item.name)}">
    </div>
    <div class="teacher-spotlight-body">
      <span class="teacher-category-tag">${esc(title)}</span>
      <h3>${esc(item.name)}</h3>
      <p class="teacher-meta">${esc(item.position || item.subject || "Guru / Tendik")}</p>
      ${note ? `<p class="teacher-note">${esc(note)}</p>` : ""}
      <div class="teacher-detail-grid">
        ${item.subject ? `<div><strong>Mapel</strong><span>${esc(item.subject)}</span></div>` : ""}
        ${item.status ? `<div><strong>Status</strong><span>${esc(item.status)}</span></div>` : ""}
      </div>
      <a class="major-btn" href="${detailUrl}">LIHAT DETAIL GURU &#8594;</a>
    </div>
  </article>`;
}

function teacherPrincipalSpotlight(item) {
  const image = item.photoUrl || makeMajorIllustration(item.name, Number(item.id || 0));
  const detailUrl = `/guru-tendik/${encodeURIComponent(item.id || "")}`;
  return `<article class="teacher-principal-card">
    <div class="teacher-principal-image">
      <img src="${esc(image)}" alt="${esc(item.name)}">
    </div>
    <div class="teacher-principal-body">
      <span class="teacher-category-tag">Kepala Sekolah</span>
      <h3>${esc(item.name)}</h3>
      <p class="teacher-meta">${esc(item.position || item.subject || "Kepala Sekolah")}</p>
      <p class="teacher-note">${esc(item.expertise || "Sosok utama pemimpin sekolah.")}</p>
      <div class="teacher-detail-grid">
        ${item.subject ? `<div><strong>Mapel</strong><span>${esc(item.subject)}</span></div>` : ""}
        ${item.status ? `<div><strong>Status</strong><span>${esc(item.status)}</span></div>` : ""}
      </div>
      <a class="major-btn" href="${detailUrl}">LIHAT DETAIL GURU &#8594;</a>
    </div>
  </article>`;
}

function teacherSpotlightGrid(items, title, note = "") {
  return `<div class="teacher-spotlight-grid">
    ${items.map((item) => teacherSpotlight(item, title, note)).join("")}
  </div>`;
}

function teachersGroupedSections(teachers = []) {
  const grouped = {
    kepala: teachers.filter((item) => teacherCategory(item) === "Kepala Sekolah"),
    wakil: teachers.filter((item) => teacherCategory(item) === "Wakil Kepala Sekolah"),
    ketua: teachers.filter((item) => teacherCategory(item) === "Ketua Konsentrasi Keahlian"),
    guru: teachers.filter((item) => teacherCategory(item) === "Guru-guru")
  };
  const section = (title, items, mode, note) => !items.length ? "" : `
    <section class="teacher-group">
      <div class="container">
        <div class="teacher-group-head">
          <p>${esc(title)}</p>
          <h2>${esc(note || title)} <span>(${items.length} orang)</span></h2>
        </div>
        ${mode === "principal"
          ? items.map((item) => teacherPrincipalSpotlight(item)).join("")
          : mode === "spotlight-grid"
          ? teacherSpotlightGrid(items, title, note)
          : mode === "spotlight"
          ? items.map((item) => teacherSpotlight(item, title, note)).join("")
          : `<div class="majors-grid teacher-grid">${items.map(teacherCard).join("")}</div>`}
      </div>
    </section>`;
  return [
    section("Kepala Sekolah", grouped.kepala, "principal", "Sosok utama pemimpin sekolah."),
    section("Wakil KS", grouped.wakil, "spotlight-grid", "Mendukung arah kebijakan dan operasional sekolah."),
    section("Ketua Konsentrasi Keahlian (K3)", grouped.ketua, "spotlight", "Penggerak konsentrasi keahlian dan koordinasi jurusan."),
    section("Guru-guru", grouped.guru, "grid", "Tim pengajar dan tenaga pendidik aktif.")
  ].join("");
}

function teachersTabbedSections(teachers = []) {
  const grouped = {
    kepala: teachers.filter((item) => teacherCategory(item) === "Kepala Sekolah"),
    wakil: teachers.filter((item) => teacherCategory(item) === "Wakil Kepala Sekolah"),
    ketua: teachers.filter((item) => teacherCategory(item) === "Ketua Konsentrasi Keahlian"),
    guru: teachers.filter((item) => teacherCategory(item) === "Guru-guru")
  };
  const head = grouped.kepala[0];
  const wakilCards = grouped.wakil.map((item) => teacherSpotlight(item, "Wakil KS", "Mendukung arah kebijakan dan operasional sekolah.")).join("");
  const ketuaCards = grouped.ketua.map((item) => teacherSpotlight(item, "Ketua K3", "Penggerak konsentrasi keahlian dan koordinasi jurusan.")).join("");
  const guruCards = grouped.guru.map((item) => teacherCard(item)).join("");
  return `
    <section class="teacher-tabs-section">
      <div class="container">
        <div class="teacher-tabs-shell">
          <input class="teacher-tab-input" type="radio" name="teacher-tab" id="teacher-tab-head" checked>
          <input class="teacher-tab-input" type="radio" name="teacher-tab" id="teacher-tab-waka">
          <input class="teacher-tab-input" type="radio" name="teacher-tab" id="teacher-tab-k3">
          <input class="teacher-tab-input" type="radio" name="teacher-tab" id="teacher-tab-guru">

          <div class="teacher-tabs-nav" role="tablist" aria-label="Kategori guru dan tendik">
            <label class="teacher-tab-button teacher-tab-head" for="teacher-tab-head" role="tab" aria-controls="teacher-panel-head">
              <span class="teacher-tab-copy">
                <span>Kepala Sekolah</span>
                <small>1 orang</small>
              </span>
              <b>${grouped.kepala.length}</b>
            </label>
            <label class="teacher-tab-button teacher-tab-waka" for="teacher-tab-waka" role="tab" aria-controls="teacher-panel-waka">
              <span class="teacher-tab-copy">
                <span>Waka</span>
                <small>${grouped.wakil.length} orang</small>
              </span>
              <b>${grouped.wakil.length}</b>
            </label>
            <label class="teacher-tab-button teacher-tab-k3" for="teacher-tab-k3" role="tab" aria-controls="teacher-panel-k3">
              <span class="teacher-tab-copy">
                <span>K3</span>
                <small>${grouped.ketua.length} orang</small>
              </span>
              <b>${grouped.ketua.length}</b>
            </label>
            <label class="teacher-tab-button teacher-tab-guru" for="teacher-tab-guru" role="tab" aria-controls="teacher-panel-guru">
              <span class="teacher-tab-copy">
                <span>Guru-guru</span>
                <small>${grouped.guru.length} orang</small>
              </span>
              <b>${grouped.guru.length}</b>
            </label>
          </div>

          <div class="teacher-tabs-panels">
            <div class="teacher-tab-panel" id="teacher-panel-head" data-panel="head">
              ${head ? teacherPrincipalSpotlight(head) : '<p class="empty">Belum ada data kepala sekolah.</p>'}
            </div>
            <div class="teacher-tab-panel" id="teacher-panel-waka" data-panel="waka">
              ${wakilCards ? `<div class="teacher-tab-grid">${wakilCards}</div>` : '<p class="empty">Belum ada data wakil kepala sekolah.</p>'}
            </div>
            <div class="teacher-tab-panel" id="teacher-panel-k3" data-panel="k3">
              ${ketuaCards ? `<div class="teacher-tab-grid">${ketuaCards}</div>` : '<p class="empty">Belum ada data ketua konsentrasi keahlian.</p>'}
            </div>
            <div class="teacher-tab-panel" id="teacher-panel-guru" data-panel="guru">
              ${guruCards ? `<div class="majors-grid teacher-grid">${guruCards}</div>` : '<p class="empty">Belum ada data guru-guru.</p>'}
            </div>
          </div>
        </div>
      </div>
    </section>`;
}

function teachersShowcase(data, withMoreButton = false) {
  const items = (data.teachers || []).slice(0, withMoreButton ? 12 : 4);
  return `<section class="majors-showcase teachers-showcase">
    <div class="container">
      <div class="majors-head">
        <p>GURU & TENDIK</p>
        <h2>Tim Sekolah</h2>
        <span>Profil Guru dan Tenaga Kependidikan</span>
      </div>
      <div class="majors-grid">${items.map(teacherCard).join("")}</div>
      ${withMoreButton ? "" : '<div class="majors-more-wrap"><a class="majors-more" href="/guru-tendik">LIHAT GURU & TENDIK LAINNYA &#8594;</a></div>'}
    </div>
  </section>`;
}

async function loadHome() {
  if (!state.home) state.home = await api("/api/public/home");
  return state.home;
}

async function loadProfile() {
  if (!state.profile) state.profile = await api("/api/public/profile");
  return state.profile;
}

async function homePage() {
  const data = await loadHome();
  const banners = data.banners?.length
    ? data.banners
    : [{
      title: data.settings.schoolName,
      subtitle: data.settings.tagline,
      ctaLabel: "Lihat Profil",
      ctaUrl: "/profil",
      imageUrl: ""
    }];
  const hero = banners[0];
  const heroImage = (hero.imageUrl || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1800&q=80").replace(/"/g, "&quot;");

  return layout(`
    <main>
      <section class="hero-wrap">
        <section class="hero hero-animate" id="hero-carousel" style="background-image: linear-gradient(100deg, rgba(6,31,28,.85), rgba(6,31,28,.48), rgba(6,31,28,.18)), url('${esc(heroImage)}');">
          <div class="container hero-inner">
            <div class="eyebrow">Website Resmi Sekolah</div>
            <h1 id="hero-title">${esc(hero.title || data.settings.schoolName)}</h1>
            <p id="hero-subtitle">${esc(hero.subtitle || data.settings.tagline)}</p>
            <div class="actions">
              <a class="btn" id="hero-cta" href="${esc(hero.ctaUrl || "/profil")}">${esc(hero.ctaLabel || "Lihat Profil")}</a>
              <a class="btn secondary" href="https://www.smkpasirian-lmj.sch.id/blog/category/berita">Baca Berita</a>
            </div>
            <div class="hero-nav">
              <button class="hero-arrow" id="hero-prev" aria-label="Sebelumnya">&#8592;</button>
              <button class="hero-arrow" id="hero-next" aria-label="Berikutnya">&#8594;</button>
              <div class="hero-progress" aria-hidden="true">
                <div class="hero-progress-track">
                  <span class="hero-progress-bar" id="hero-progress-bar"></span>
                </div>
                <div class="hero-progress-meta">
                  <strong id="hero-progress-current">01</strong>
                  <span id="hero-progress-total">${String(banners.length).padStart(2, "0")}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        <div class="container">
          <section class="hero-overlay">
            <article>
              <h3>Sambutan Kepala Sekolah</h3>
              <div class="principal-block">
                <img class="principal-photo" src="${esc(data.profile.principalPhotoUrl || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80")}" alt="${esc(data.profile.principalName || "Kepala Sekolah")}">
                <div>
                  <h4>${esc(data.profile.principalName)}</h4>
                  <p class="prose">${esc(data.profile.principalGreeting)}</p>
                  <a class="btn" href="${esc(data.profile.principalCtaUrl || "/profil")}">${esc(data.profile.principalCtaLabel || "Selengkapnya")}</a>
                </div>
              </div>
            </article>
            <article>
              <h3>Statistik Data Sekolah</h3>
              <div class="hero-stats">
                <div><strong>${data.teachers?.length ?? 0}</strong><span>Guru & Staf</span></div>
                <div><strong>${data.majors?.length ?? 0}</strong><span>Program</span></div>
                <div><strong>${data.agendas?.length ?? 0}</strong><span>Agenda</span></div>
              </div>
            </article>
          </section>
        </div>
      </section>
      <script type="application/json" id="hero-banners-data">${JSON.stringify(banners).replace(/</g, "\\u003c")}</script>
      <section>
        <div class="container">
          ${sectionHead("Profil Singkat Sekolah", "Gambaran ringkas karakter, visi, dan arah pengembangan sekolah.")}
          <div class="split">
          <div>
            <h3>${esc(data.settings.schoolName)}</h3>
            <p class="prose">${esc(data.profile.history)}</p>
          </div>
          <div class="photo-panel" style="background-image:url(&quot;${esc(data.profile.profileSummaryImageUrl || "https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80")}&quot;)"></div>
          </div>
          ${managementSchoolSection(data.profile.management || {})}
        </div>
      </section>
      ${quickAccessSection(data.settings || {})}
      ${agendaCalendarSection(data.agendas || [])}
      <section class="soft">
        <div class="container">
          ${sectionHead("Pengumuman Penting", "Informasi administratif yang perlu segera diketahui.")}
          <div class="grid two">${(data.announcements || []).map((item) => card(item.title, item.content, item.isPriority ? '<span class="badge">Prioritas</span>' : "")).join("")}</div>
        </div>
      </section>
      ${testimonialsSection(data.testimonials || [])}
      <button class="back-to-top" type="button" data-back-to-top aria-label="Kembali ke atas">${navIcon("arrowUp")}</button>
    </main>`, data);
}

function setupHeroCarousel() {
  const carousel = document.querySelector("#hero-carousel");
  const payload = document.querySelector("#hero-banners-data");
  if (!carousel || !payload) return;

  const banners = JSON.parse(payload.textContent || "[]");
  if (!Array.isArray(banners) || banners.length < 2) return;

  const title = document.querySelector("#hero-title");
  const subtitle = document.querySelector("#hero-subtitle");
  const cta = document.querySelector("#hero-cta");
  const prev = document.querySelector("#hero-prev");
  const next = document.querySelector("#hero-next");
  const progressBar = document.querySelector("#hero-progress-bar");
  const progressCurrent = document.querySelector("#hero-progress-current");
  const autoplayDelay = 6000;
  let index = 0;

  const restartProgress = () => {
    if (!progressBar) return;
    progressBar.classList.remove("run");
    void progressBar.offsetWidth;
    progressBar.style.setProperty("--hero-progress-duration", `${autoplayDelay}ms`);
    progressBar.classList.add("run");
  };

  const applySlide = () => {
    const item = banners[index];
    const image = item.imageUrl || "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1800&q=80";
    carousel.style.backgroundImage = `linear-gradient(100deg, rgba(6,31,28,.85), rgba(6,31,28,.48), rgba(6,31,28,.18)), url('${image}')`;
    if (title) title.textContent = item.title || "";
    if (subtitle) subtitle.textContent = item.subtitle || "";
    if (cta) {
      cta.textContent = item.ctaLabel || "Lihat Profil";
      cta.href = item.ctaUrl || "/profil";
    }
    if (progressCurrent) progressCurrent.textContent = String(index + 1).padStart(2, "0");
    carousel.classList.remove("hero-animate");
    void carousel.offsetWidth;
    carousel.classList.add("hero-animate");
    restartProgress();
  };

  prev?.addEventListener("click", () => {
    index = (index - 1 + banners.length) % banners.length;
    applySlide();
  });
  next?.addEventListener("click", () => {
    index = (index + 1) % banners.length;
    applySlide();
  });

  if (heroTimer) clearInterval(heroTimer);
  heroTimer = setInterval(() => {
    index = (index + 1) % banners.length;
    applySlide();
  }, autoplayDelay);

  restartProgress();
}

function setupMobileNavigation() {
  const toggle = document.querySelector("[data-more-toggle]");
  const sheet = document.querySelector("#mobile-more-sheet");
  const backdrop = document.querySelector("[data-more-close]");
  if (!toggle || !sheet || !backdrop) return;

  let closeTimer = null;

  const openMore = () => {
    if (closeTimer) clearTimeout(closeTimer);
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add("open");
      backdrop.classList.add("open");
      sheet.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
    });
  };

  const closeMore = () => {
    sheet.classList.remove("open");
    backdrop.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    closeTimer = setTimeout(() => {
      backdrop.hidden = true;
    }, 260);
  };

  toggle.addEventListener("click", () => {
    if (sheet.classList.contains("open")) closeMore();
    else openMore();
  });
  backdrop.addEventListener("click", closeMore);
  sheet.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMore));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheet.classList.contains("open")) closeMore();
  });
}

function setupBackToTop() {
  const button = document.querySelector("[data-back-to-top]");
  if (!button) return;
  const update = () => button.classList.toggle("visible", window.scrollY > 420);
  button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", update, { passive: true });
  update();
}

function setupAgendaCalendar() {
  const payload = document.querySelector("#agenda-calendar-data");
  const modal = document.querySelector("[data-agenda-modal]");
  const modalDate = document.querySelector("[data-agenda-modal-date]");
  const modalList = document.querySelector("[data-agenda-modal-list]");
  if (!payload || !modal || !modalDate || !modalList) return;

  const agendaByDate = JSON.parse(payload.textContent || "{}");
  const closeModal = () => {
    modal.classList.remove("open");
    setTimeout(() => {
      if (!modal.classList.contains("open")) modal.hidden = true;
    }, 220);
  };
  const openModal = (key) => {
    const items = agendaByDate[key] || [];
    if (!items.length) return;
    modalDate.textContent = dateId(key);
    modalList.innerHTML = items.map((item) => `<div class="agenda-modal-item">
      <h4>${esc(item.title || "Agenda Sekolah")}</h4>
      <p><strong>Waktu:</strong> ${esc(dateId(item.startDate))}${item.endDate ? ` - ${esc(dateId(item.endDate))}` : ""}</p>
      <p><strong>Lokasi:</strong> ${esc(item.location || "-")}</p>
      <p>${esc(item.description || "-")}</p>
      ${item.status ? `<span class="badge">${esc(item.status)}</span>` : ""}
    </div>`).join("");
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("open"));
  };

  document.querySelectorAll("[data-agenda-date]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.agendaDate));
  });
  modal.querySelectorAll("[data-agenda-modal-close]").forEach((button) => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

function setupTestimonialForm() {
  const modal = document.querySelector("[data-testimonial-modal]");
  const open = document.querySelector("[data-testimonial-open]");
  const form = document.querySelector("#testimonial-form");
  const note = document.querySelector("[data-testimonial-note]");
  if (!modal || !open || !form || !note) return;

  const closeModal = () => {
    modal.classList.remove("open");
    setTimeout(() => {
      if (!modal.classList.contains("open")) modal.hidden = true;
    }, 220);
  };
  const openModal = () => {
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("open"));
  };

  open.addEventListener("click", openModal);
  modal.querySelectorAll("[data-testimonial-close]").forEach((button) => button.addEventListener("click", closeModal));
  const photoInput = form.querySelector("[data-testimonial-photo]");
  const photoPreview = form.querySelector("[data-testimonial-photo-preview]");
  const previewImage = photoPreview?.querySelector("img");
  let previewUrl = "";
  photoInput?.addEventListener("change", () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const file = photoInput.files?.[0];
    if (!file || !previewImage || !photoPreview) {
      photoPreview?.setAttribute("hidden", "");
      return;
    }
    if (!file.type.startsWith("image/")) {
      photoInput.value = "";
      notify("Foto harus berupa file gambar.", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      photoInput.value = "";
      notify("Ukuran foto maksimal 5 MB.", "error");
      return;
    }
    previewUrl = URL.createObjectURL(file);
    previewImage.src = previewUrl;
    photoPreview.removeAttribute("hidden");
  });
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    note.textContent = "Mengirim testimoni...";
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Mengirim...";
    }
    try {
      await api("/api/public/testimonials", { method: "POST", body: new FormData(form) });
      form.reset();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      previewUrl = "";
      photoPreview?.setAttribute("hidden", "");
      note.textContent = "Terima kasih. Testimoni akan tampil setelah disetujui admin.";
      notify("Testimoni berhasil dikirim dan menunggu persetujuan admin.");
    } catch (error) {
      note.textContent = error.message;
      notify(error.message || "Testimoni gagal dikirim.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Kirim Testimoni";
      }
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

function setupTestimonialCarousel() {
  const track = document.querySelector("[data-testimonial-track]");
  const cards = Array.from(document.querySelectorAll("[data-testimonial-card]"));
  const prev = document.querySelector("[data-testimonial-prev]");
  const next = document.querySelector("[data-testimonial-next]");
  const input = document.querySelector("[data-testimonial-year]");
  const empty = document.querySelector("[data-testimonial-empty]");
  if (!track || !cards.length || !prev || !next || !input || !empty) return;

  let index = 0;
  let visibleCards = cards;

  const perView = () => window.matchMedia("(max-width: 860px)").matches ? 1 : Math.min(3, visibleCards.length || 1);
  const maxIndex = () => Math.max(0, visibleCards.length - perView());

  const update = () => {
    index = Math.min(index, maxIndex());
    const cardWidth = visibleCards[0]?.getBoundingClientRect().width || 0;
    const gap = Number.parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || "0") || 0;
    track.style.transform = `translateX(-${index * (cardWidth + gap)}px)`;
    prev.disabled = index <= 0;
    next.disabled = index >= maxIndex();
    empty.hidden = visibleCards.length > 0;
  };

  const applyFilter = () => {
    const query = input.value.trim();
    visibleCards = cards.filter((card) => !query || card.dataset.year?.includes(query));
    cards.forEach((card) => {
      card.hidden = !visibleCards.includes(card);
    });
    index = 0;
    update();
  };

  prev.addEventListener("click", () => {
    index = Math.max(0, index - 1);
    update();
  });
  next.addEventListener("click", () => {
    index = Math.min(maxIndex(), index + 1);
    update();
  });
  input.addEventListener("input", applyFilter);
  window.addEventListener("resize", update);
  applyFilter();
}

function setupManagementModal() {
  const payload = document.querySelector("#management-school-data");
  const modal = document.querySelector("[data-management-modal]");
  const title = document.querySelector("[data-management-title]");
  const lead = document.querySelector("[data-management-lead]");
  const list = document.querySelector("[data-management-list]");
  const resources = document.querySelector("[data-management-resources]");
  if (!payload || !modal || !title || !lead || !list || !resources) return;
  const items = JSON.parse(payload.textContent || "[]");
  if (!Array.isArray(items) || !items.length) return;
  const byKey = new Map(items.map((item) => [item.key, item]));

  const closeModal = () => {
    modal.classList.remove("open");
    setTimeout(() => {
      if (!modal.classList.contains("open")) modal.hidden = true;
    }, 220);
  };

  const openModal = (key) => {
    const item = byKey.get(key);
    if (!item) return;
    title.textContent = item.title;
    lead.textContent = item.lead;
    list.innerHTML = item.points.map((point) => `<div class="management-modal-item"><span></span><p>${esc(point)}</p></div>`).join("");
    const resourceItems = Array.isArray(item.resources) ? item.resources : [];
    resources.hidden = resourceItems.length === 0;
    resources.innerHTML = resourceItems.length ? `
      <p class="management-modal-resources-title">Berkas dan Tautan</p>
      <div class="management-modal-resource-list">
        ${resourceItems.map((resource) => {
          const isFile = resource.type === "file";
          const href = esc(resource.url);
          const label = esc(resource.label || (isFile ? "Unduh Berkas" : "Lihat Tautan"));
          return `<a class="management-resource-button ${isFile ? "file" : "link"}" href="${href}" ${isFile ? 'download rel="noopener noreferrer"' : 'target="_blank" rel="noopener noreferrer"'}>${label}<span>${isFile ? "Unduh" : "Lihat"}</span></a>`;
        }).join("")}
      </div>` : "";
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add("open"));
  };

  document.querySelectorAll("[data-management-open]").forEach((button) => {
    button.addEventListener("click", () => openModal(button.dataset.managementOpen || ""));
  });
  modal.querySelectorAll("[data-management-close]").forEach((button) => button.addEventListener("click", closeModal));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
  });
}

function registerPwa() {
  if (pwaRegistered) return;
  pwaRegistered = true;
  if (!("serviceWorker" in navigator)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

function pageHero(title, text) {
  return `<section class="page-hero"><div class="container"><h1>${title}</h1><p>${text}</p></div></section>`;
}

function splitLines(value) {
  return String(value ?? "")
    .split(/\n+/)
    .map((line) => line.replace(/^\s*\d+[\).\:-]?\s*/, "").trim())
    .filter(Boolean);
}

async function profilePage() {
  const data = await loadProfile();
  const missionItems = splitLines(data.profile.mission);
  const identityRows = [
    ["Nama Sekolah", "SMK Negeri Pasirian."],
    ["NSS", data.profile.identity?.NSS || "32 1 05 21 05 009"],
    ["NPSN", data.profile.identity?.NPSN || "20521455"],
    ["Status Akreditasi", data.profile.identity?.["Status Akreditasi"] || data.profile.accreditation || "Negeri"],
    ["Alamat Sekolah", data.profile.identity?.["Alamat Sekolah"] || data.settings?.address || "Jalan Raya Condro – Pasirian/ 67372"],
    ["Kabupaten", data.profile.identity?.Kabupaten || "Lumajang"],
    ["Propinsi", data.profile.identity?.Propinsi || "Jawa Timur"],
    ["Telepon/Fax", data.profile.identity?.["Telepon/Fax"] || data.settings?.phone || "(0334) 574253"],
    ["SK Pendirian Pejabat", data.profile.identity?.["SK Pendirian Pejabat"] || "Bupati Lumajang"],
    ["Nomor", data.profile.identity?.Nomor || "188.45/656/427.12/2003"],
    ["Tanggal Penetapan", data.profile.identity?.["Tanggal Penetapan"] || "15 Desember 2003"],
    ["Tanggal Berdiri", data.profile.identity?.["Tanggal Berdiri"] || "24 Juli 2003"],
    ["Luas Tanah", data.profile.identity?.["Luas Tanah"] || "20620 m2 ( sertifikat tgl 24 Maret 2005 )"],
    ["IMB", data.profile.identity?.IMB || "SK Kepala Dinas Kimpraswil Kab. Lumajang – No. 188.45/40/427.39/2004 – tanggal 5 Maret 2004"]
  ];
  return layout(`
    <main>
      ${pageHero("Profil Sekolah", "Sejarah, visi misi, identitas, fasilitas, dan lokasi sekolah.")}
      <section><div class="container split">
        <div>
          <h2>Sejarah</h2><p class="prose">${esc(data.profile.history)}</p>
          <h2>Visi</h2><p class="prose">${esc(data.profile.vision)}</p>
          <h2>Misi</h2>
          <ol class="mission-list">
            ${missionItems.map((item, index) => `
              <li>
                <span class="mission-number">${index + 1}</span>
                <span class="mission-text">${esc(item)}</span>
              </li>
            `).join("")}
          </ol>
        </div>
        <div class="card">
          <h3>Identitas Sekolah</h3>
          <div class="identity-list">
            ${identityRows.map(([label, value]) => `
              <div class="identity-row">
                <span class="identity-label">${esc(label)}</span>
                <span class="identity-separator">:</span>
                <span class="identity-value">${esc(value)}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div></section>
      <section class="soft"><div class="container">${sectionHead("Fasilitas", "Fasilitas pendukung kegiatan belajar.")}<div class="grid">${data.facilities.map((item) => card(item.name, item.description)).join("")}</div></div></section>
    </main>`, data);
}

async function collectionPage(apiPath, title, subtitle, renderer) {
  const data = await loadHome();
  const rows = await api(apiPath);
  return layout(`<main>${pageHero(title, subtitle)}<section><div class="container"><div class="grid">${rows.map(renderer).join("") || '<p class="empty">Belum ada data.</p>'}</div></div></section></main>`, data);
}

async function majorsPage() {
  const data = await loadHome();
  data.majors = await api("/api/majors");
  return layout(`<main>${pageHero("Program Keahlian", "Pilihan jurusan dan kompetensi yang disiapkan untuk masa depan siswa.")}${majorsShowcase(data, false, false)}</main>`, data);
}

async function teachersPage() {
  const data = await loadHome();
  data.teachers = await api("/api/teachers");
  return layout(`<main>${pageHero("Guru & Tendik", "Disusun dalam tab Kepala Sekolah, Waka, dan K3 agar lebih rapi.")}${teachersTabbedSections(data.teachers || [])}</main>`, data);
}

async function majorDetailPage(slug) {
  const data = await loadHome();
  const majors = await api("/api/majors");
  const major = majors.find((item) => String(item.slug) === String(slug));
  if (!major) {
    return layout(`<main>${pageHero("Program Keahlian", "Jurusan tidak ditemukan.")}<section><div class="container"><p class="empty">Data jurusan tidak ditemukan.</p><a class="btn" href="/program-keahlian">Kembali ke Program Keahlian</a></div></section></main>`, data);
  }
  const image = major.imageUrl || makeMajorIllustration(major.name, Number(major.id || 0));
  return layout(`
    <main>
      ${pageHero(major.name, "Detail kompetensi, fasilitas, guru produktif, dan prospek kerja jurusan.")}
      <section>
        <div class="container split">
          <div>
            <h2>Deskripsi Jurusan</h2>
            <p class="prose">${esc(major.description || "-")}</p>
            <h2>Kompetensi</h2>
            <p class="prose">${esc(major.competencies || "-")}</p>
            <h2>Prospek Kerja</h2>
            <p class="prose">${esc(major.careerProspects || "-")}</p>
            <h2>Fasilitas Praktik</h2>
            <p class="prose">${esc(major.practiceFacilities || "-")}</p>
            <h2>Guru Produktif</h2>
            <p class="prose">${esc(major.productiveTeachers || "-")}</p>
            <h2>Prestasi Jurusan</h2>
            <p class="prose">${esc(major.achievements || "-")}</p>
            <div class="actions">
              <a class="btn" href="/program-keahlian">Kembali ke Program Keahlian</a>
              <a class="btn secondary" href="/kontak">Hubungi Sekolah</a>
            </div>
          </div>
          <div class="card">
            <img src="${esc(image)}" alt="${esc(major.name)}" style="width:100%;border-radius:8px;object-fit:cover;aspect-ratio:16/11;">
          </div>
        </div>
      </section>
    </main>`, data);
}

async function teacherDetailPage(id) {
  const data = await loadHome();
  const teachers = await api("/api/teachers");
  const teacher = teachers.find((item) => String(item.id) === String(id));
  if (!teacher) {
    return layout(`<main>${pageHero("Guru & Tendik", "Data tidak ditemukan.")}<section><div class="container"><p class="empty">Data guru/tendik tidak ditemukan.</p><a class="btn" href="/guru-tendik">Kembali ke Guru & Tendik</a></div></section></main>`, data);
  }
  const image = teacher.photoUrl || makeMajorIllustration(teacher.name, Number(teacher.id || 0));
  return layout(`
    <main>
      ${pageHero(teacher.name, "Detail profil guru dan tenaga kependidikan.")}
      <section>
        <div class="container split">
          <div>
            <h2>Profil</h2>
            <div class="identity-list teacher-profile-list">
              ${[
                ["Jabatan", teacher.position || "-"],
                ["Mata Pelajaran", teacher.subject || "-"],
                ["Bidang Keahlian", teacher.expertise || "-"],
                ["Status", teacher.status || "-"]
              ].map(([label, value]) => `
                <div class="identity-row teacher-profile-row">
                  <span class="identity-label">${esc(label)}</span>
                  <span class="identity-separator">:</span>
                  <span class="identity-value">${esc(value)}</span>
                </div>
              `).join("")}
            </div>
            <div class="actions">
              <a class="btn" href="/guru-tendik">Kembali ke Guru & Tendik</a>
              <a class="btn secondary" href="/kontak">Hubungi Sekolah</a>
            </div>
          </div>
          <div class="card">
            <img src="${esc(image)}" alt="${esc(teacher.name)}" style="width:100%;border-radius:8px;object-fit:cover;aspect-ratio:4/5;">
          </div>
        </div>
      </section>
    </main>`, data);
}

async function contactPage() {
  const data = await loadHome();
  return layout(`
    <main>
      ${pageHero("Kontak Sekolah", "Hubungi sekolah melalui alamat, telepon, WhatsApp, atau formulir pesan.")}
      <section><div class="container split">
        <div class="card">
          <h3>${esc(data.settings.schoolName)}</h3>
          <p>${esc(data.settings.address)}</p>
          <p>${esc(data.settings.email)}</p>
          <p>${esc(data.settings.phone)}</p>
          <p>WhatsApp: ${esc(data.settings.whatsapp)}</p>
          <div class="actions">
            <a class="btn" href="/pengaduan">Buka Form Pengaduan</a>
          </div>
        </div>
        <form class="card form" id="contact-form">
          <div class="field"><label>Nama</label><input name="name" required></div>
          <div class="field"><label>Email</label><input name="email" type="email" required></div>
          <div class="field"><label>Telepon</label><input name="phone"></div>
          <div class="field"><label>Subjek</label><input name="subject"></div>
          <div class="field"><label>Pesan</label><textarea name="message" required></textarea></div>
          <button class="btn">Kirim Pesan</button>
        </form>
      </div></section>
    </main>`, data);
}

async function complaintPage() {
  const data = await loadHome();
  return layout(`
    <main>
      ${pageHero("Form Pengaduan", "Saluran resmi untuk menyampaikan pengaduan, kendala layanan, atau masukan yang memerlukan tindak lanjut sekolah.")}
      <section><div class="container split">
        <div class="card">
          <h3>Informasi Pengaduan</h3>
          <p class="prose">Gunakan formulir ini untuk menyampaikan keluhan atau laporan yang perlu ditindaklanjuti pihak sekolah. Sampaikan data dengan jelas agar proses verifikasi dan tindak lanjut berjalan lebih cepat.</p>
          <div class="identity-list teacher-profile-list">
            ${[
              ["Cocok Untuk", "Keluhan layanan, administrasi, pembelajaran, sarana prasarana, atau perilaku yang perlu ditindaklanjuti."],
              ["Respon Awal", "Pengaduan masuk ke dashboard admin untuk diverifikasi oleh sekolah."],
              ["Saran Penempatan", "Paling tepat ditempatkan sebagai halaman khusus /pengaduan dengan CTA dari halaman Kontak dan footer."]
            ].map(([label, value]) => `
              <div class="identity-row teacher-profile-row">
                <span class="identity-label">${esc(label)}</span>
                <span class="identity-separator">:</span>
                <span class="identity-value">${esc(value)}</span>
              </div>
            `).join("")}
          </div>
        </div>
        <form class="card form" id="complaint-form">
          <div class="field"><label>Nama</label><input name="name" required></div>
          <div class="field"><label>Peran Pelapor</label><select name="reporterRole"><option value="Siswa">Siswa</option><option value="Orang Tua / Wali">Orang Tua / Wali</option><option value="Alumni">Alumni</option><option value="Guru / Tendik">Guru / Tendik</option><option value="Masyarakat">Masyarakat</option><option value="Lainnya">Lainnya</option></select></div>
          <div class="field"><label>Kelas / Unit / Hubungan</label><input name="classOrUnit" placeholder="Contoh: XII RPL 1 / Orang Tua Kelas X"></div>
          <div class="field"><label>Telepon / WhatsApp</label><input name="phone"></div>
          <div class="field"><label>Email</label><input name="email" type="email"></div>
          <div class="field"><label>Kategori Pengaduan</label><select name="category"><option value="Layanan Sekolah">Layanan Sekolah</option><option value="Pembelajaran">Pembelajaran</option><option value="Administrasi">Administrasi</option><option value="Sarana Prasarana">Sarana Prasarana</option><option value="Kedisiplinan">Kedisiplinan</option><option value="Perundungan / Keamanan">Perundungan / Keamanan</option><option value="Lainnya">Lainnya</option></select></div>
          <div class="field"><label>Judul Pengaduan</label><input name="title" required></div>
          <div class="field"><label>Isi Pengaduan</label><textarea name="complaint" required></textarea></div>
          <div class="field"><label>Lampiran Bukti</label><input name="attachment" type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"></div>
          <div class="field"><label>Harapan / Tindak Lanjut</label><textarea name="expectation" placeholder="Opsional"></textarea></div>
          <button class="btn">Kirim Pengaduan</button>
        </form>
      </div></section>
    </main>`, data);
}

async function render() {
  const path = location.pathname;
  try {
    if (path === "/") app.innerHTML = await homePage();
    else if (path === "/profil") app.innerHTML = await profilePage();
    else if (path === "/program-keahlian") app.innerHTML = await majorsPage();
    else if (path.startsWith("/program-keahlian/")) app.innerHTML = await majorDetailPage(decodeURIComponent(path.replace("/program-keahlian/", "")));
    else if (path === "/guru-tendik") app.innerHTML = await teachersPage();
    else if (path.startsWith("/guru-tendik/")) app.innerHTML = await teacherDetailPage(decodeURIComponent(path.replace("/guru-tendik/", "")));
    else if (path === "/galeri") app.innerHTML = await collectionPage("/api/galleries", "Galeri", "Album dokumentasi kegiatan, fasilitas, jurusan, dan ekstrakurikuler.", (item) => card(item.title, `${item.category}\n${item.description}`));
    else if (path === "/agenda") app.innerHTML = await collectionPage("/api/agendas", "Agenda", "Jadwal kegiatan sekolah.", (item) => `<article class="card"><span class="badge">${dateId(item.startDate)}</span><h3>${esc(item.title)}</h3><p>${esc(item.location)}</p><p>${esc(item.description)}</p></article>`);
    else if (path === "/pengumuman") app.innerHTML = await collectionPage("/api/announcements", "Pengumuman", "Informasi administratif dan pengumuman penting.", (item) => card(item.title, item.content, item.isPriority ? '<span class="badge">Prioritas</span>' : ""));
    else if (path === "/unduhan") app.innerHTML = await collectionPage("/api/downloads", "Unduhan", "Dokumen resmi sekolah yang dapat diunduh.", (item) => `<article class="card"><span class="badge">${esc(item.category)}</span><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p><p>${esc(item.fileType)} - ${esc(item.fileSize)}</p><a class="btn ghost" href="${esc(item.fileUrl)}">Download</a></article>`);
    else if (path === "/kontak") app.innerHTML = await contactPage();
    else if (path === "/pengaduan") app.innerHTML = await complaintPage();
    else app.innerHTML = await homePage();

    const form = document.querySelector("#contact-form");
    if (form) {
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const body = Object.fromEntries(new FormData(form));
        await api("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        form.reset();
        notify("Pesan berhasil dikirim.");
      });
    }
    const complaintForm = document.querySelector("#complaint-form");
    if (complaintForm) {
      complaintForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        try {
          const body = new FormData(complaintForm);
          const res = await fetch("/api/public/complaints", { method: "POST", body });
          const json = await res.json();
          if (!json.ok) throw new Error(json.error?.message || "Pengaduan gagal dikirim.");
          complaintForm.reset();
          notify("Pengaduan berhasil dikirim.");
        } catch (error) {
          notify(error.message || "Pengaduan gagal dikirim.", "error");
        }
      });
    }
    setupHeroCarousel();
    setupMobileNavigation();
    setupBackToTop();
    setupAgendaCalendar();
    setupTestimonialForm();
    setupTestimonialCarousel();
    setupManagementModal();
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => button.addEventListener("click", toggleTheme));
    applyTheme(document.documentElement.dataset.theme || getPreferredTheme());
    registerPwa();
  } catch (error) {
    app.innerHTML = `<div class="container"><p class="empty">${esc(error.message)}</p></div>`;
  }
}

render();

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function pick<T extends Record<string, unknown>>(body: T, fields: string[]) {
  return Object.fromEntries(fields.filter((field) => field in body).map((field) => [field, body[field]]));
}

export function ok<T>(data: T) {
  return { ok: true, data };
}

export function fail(message: string, status = 400) {
  return { ok: false, error: { message, status } };
}

export function formatDate(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value));
}

export function socialProfileUrl(platform: "instagram" | "tiktok" | "facebook", value: string) {
  const input = String(value ?? "").trim();
  if (!input) return "";
  if (/^https?:\/\//i.test(input)) return input;
  const handle = input.replace(/^@+/, "");
  if (!handle) return "";
  if (platform === "instagram") return `https://instagram.com/${handle}`;
  if (platform === "tiktok") return `https://www.tiktok.com/@${handle}`;
  return `https://facebook.com/${handle}`;
}

export function parseCsv(text: string) {
  const input = String(text ?? "").replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const next = input[index + 1];
    if (quoted) {
      if (char === '"') {
        if (next === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (char === "\n" || char === "\r") {
      if (char === "\r" && next === "\n") index += 1;
      row.push(cell);
      if (row.some((value) => value.trim() !== "") || cell.trim() !== "") rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell.length || row.length) {
    row.push(cell);
    if (row.some((value) => value.trim() !== "") || cell.trim() !== "") rows.push(row);
  }

  return rows;
}

export function resolveGoogleSheetCsvUrl(raw: string) {
  const input = String(raw ?? "").trim();
  if (!input) return "";
  if (/(\.csv|output=csv|format=csv)/i.test(input)) return input;

  try {
    const url = new URL(input);
    const match = url.pathname.match(/\/spreadsheets\/d(?:\/e)?\/([^/]+)/i);
    const gid = url.searchParams.get("gid") || url.hash.match(/gid=(\d+)/)?.[1] || "0";
    if (match) {
      if (url.pathname.includes("/pubhtml")) {
        const pathname = url.pathname.replace(/\/pubhtml.*/, "/pub");
        return `${url.origin}${pathname}${url.search ? `${url.search}&` : "?"}output=csv`;
      }
      if (url.pathname.includes("/pub")) return input.includes("output=csv") ? input : `${url.origin}${url.pathname}${url.search ? `${url.search}&` : "?"}output=csv`;
      return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${gid}`;
    }
  } catch {
    return "";
  }

  return "";
}

export function normalizeTeacherImportRow(headers: string[], row: string[]) {
  const normalizedHeaders = headers.reduce<Record<string, string>>((acc, header, index) => {
    const key = header
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    acc[key] = String(row[index] ?? "").trim();
    return acc;
  }, {});
  const read = (...candidates: string[]) => {
    for (const candidate of candidates) {
      const key = candidate
        .toLowerCase()
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (normalizedHeaders[key] !== undefined) return normalizedHeaders[key];
    }
    return "";
  };
  const name = read("nama", "nama lengkap", "name", "guru", "tenaga kependidikan");
  if (!name) return null;
  const statusRaw = read("status", "keaktifan", "aktif");
  const status = /non|tidak|inactive|pensiun|purna/i.test(statusRaw) ? "inactive" : "active";
  return {
    name,
    photoUrl: read("foto", "photo", "photo url", "url foto", "photo_url"),
    position: read("jabatan", "posisi", "peran", "role", "kedudukan"),
    subject: read("mapel", "mata pelajaran", "subject", "bidang studi"),
    expertise: read("bidang", "keahlian", "expertise", "bidang keahlian", "k3"),
    status
  };
}

export async function hashPassword(password: string) {
  return Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
}

export async function verifyPassword(password: string, hash: string) {
  return Bun.password.verify(password, hash);
}

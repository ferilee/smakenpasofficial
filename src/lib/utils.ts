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

export async function hashPassword(password: string) {
  return Bun.password.hash(password, { algorithm: "bcrypt", cost: 10 });
}

export async function verifyPassword(password: string, hash: string) {
  return Bun.password.verify(password, hash);
}

import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { migrate } from "./db/migrate";
import { apiRoutes } from "./api";
import { adminShell, appShell } from "./ui/pages";

const port = Number(process.env.PORT ?? 2005);
const app = new Hono();

function publicRequestUrl(c: any) {
  const url = new URL(c.req.url);
  const forwardedHost = c.req.header("x-forwarded-host");
  const forwardedProto = c.req.header("x-forwarded-proto");
  if (forwardedHost) url.host = forwardedHost;
  if (forwardedProto) url.protocol = `${forwardedProto}:`;
  return url.toString();
}

migrate();

app.route("/api", apiRoutes());
app.get("/assets/app.css", () => new Response(Bun.file("./src/public/app.css"), {
  headers: { "content-type": "text/css; charset=utf-8" }
}));
app.get("/assets/app.js", () => new Response(Bun.file("./src/public/app.js"), {
  headers: { "content-type": "application/javascript; charset=utf-8" }
}));
app.get("/assets/admin.js", () => new Response(Bun.file("./src/public/admin.js"), {
  headers: { "content-type": "application/javascript; charset=utf-8" }
}));
app.get("/favicon.svg", () => new Response(Bun.file("./src/public/Logo_SMKNPasirian.png"), {
  headers: { "content-type": "image/png" }
}));
app.get("/favicon.ico", () => new Response(Bun.file("./src/public/Logo_SMKNPasirian.png"), {
  headers: { "content-type": "image/png" }
}));
app.get("/Logo_SMKNPasirian.png", () => new Response(Bun.file("./src/public/Logo_SMKNPasirian.png"), {
  headers: { "content-type": "image/png" }
}));
app.get("/manifest.webmanifest", () => new Response(Bun.file("./src/public/manifest.webmanifest"), {
  headers: { "content-type": "application/manifest+json; charset=utf-8" }
}));
app.get("/sw.js", () => new Response(Bun.file("./src/public/sw.js"), {
  headers: { "content-type": "application/javascript; charset=utf-8" }
}));
app.use("/uploads/*", serveStatic({ root: "./" }));

app.get("/robots.txt", (c) => c.text(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: https://web.smkpasirian-lmj.sch.id/sitemap.xml
`));
app.get("/sitemap.xml", (c) => {
  const origin = "https://web.smkpasirian-lmj.sch.id";
  const paths = ["/", "/profil", "/ppdb", "/siswa", "/program-keahlian", "/guru-tendik", "/galeri", "/agenda", "/pengumuman", "/unduhan", "/berita", "/kontak", "/pengaduan"];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${origin}${path}</loc></url>`).join("\n")}\n</urlset>\n`;
  return c.body(body, 200, { "content-type": "application/xml; charset=utf-8" });
});

app.get("/admin/login", (c) => c.html(adminShell("Login Admin")));
app.get("/admin", (c) => c.html(adminShell("Dashboard Admin")));

app.get("*", (c) => c.html(appShell("SMK Negeri Pasirian — Website Resmi", publicRequestUrl(c))));

export default {
  port,
  fetch: app.fetch
};

console.log(`Aplikasi berjalan di http://localhost:${port}`);

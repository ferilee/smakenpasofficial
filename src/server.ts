import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { migrate } from "./db/migrate";
import { seed } from "./db/seed";
import { apiRoutes } from "./api";
import { adminShell, appShell } from "./ui/pages";

const port = Number(process.env.PORT ?? 2005);
const app = new Hono();

migrate();
await seed();

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
app.get("/favicon.svg", () => new Response(Bun.file("./src/public/favicon.svg"), {
  headers: { "content-type": "image/svg+xml; charset=utf-8" }
}));
app.get("/favicon.ico", () => new Response(Bun.file("./src/public/favicon.svg"), {
  headers: { "content-type": "image/svg+xml; charset=utf-8" }
}));
app.get("/manifest.webmanifest", () => new Response(Bun.file("./src/public/manifest.webmanifest"), {
  headers: { "content-type": "application/manifest+json; charset=utf-8" }
}));
app.get("/sw.js", () => new Response(Bun.file("./src/public/sw.js"), {
  headers: { "content-type": "application/javascript; charset=utf-8" }
}));
app.use("/uploads/*", serveStatic({ root: "./" }));

app.get("/berita", async (c) => {
  return c.redirect("https://www.smkpasirian-lmj.sch.id/blog/category/berita", 302);
});

app.get("/admin/login", (c) => c.html(adminShell("Login Admin")));
app.get("/admin", (c) => c.html(adminShell("Dashboard Admin")));

app.get("*", (c) => c.html(appShell("Website Profil Sekolah")));

export default {
  port,
  fetch: app.fetch
};

console.log(`Aplikasi berjalan di http://localhost:${port}`);

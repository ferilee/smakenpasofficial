function requestOrigin(requestUrl?: string) {
  try {
    return new URL(requestUrl || "https://www.smkpasirian-lmj.sch.id").origin;
  } catch {
    return "https://www.smkpasirian-lmj.sch.id";
  }
}

function requestPath(requestUrl?: string) {
  try {
    const url = new URL(requestUrl || "https://www.smkpasirian-lmj.sch.id/");
    return `${url.pathname}${url.search}`;
  } catch {
    return "/";
  }
}

export function appShell(title = "Website Sekolah", requestUrl?: string) {
  const origin = requestOrigin(requestUrl);
  const description = "Website resmi SMK Negeri Pasirian sebagai pusat informasi sekolah.";
  const logoPath = "/Logo_SMKNPasirian.png";
  const pageUrl = `${origin}${requestPath(requestUrl)}`;
  const ogImage = `${origin}${logoPath}`;
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#3f3d99">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="SMK Negeri Pasirian">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:alt" content="Logo SMK Negeri Pasirian">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <link rel="icon" type="image/png" href="${logoPath}">
  <link rel="apple-touch-icon" href="${logoPath}">
  <link rel="manifest" href="/manifest.webmanifest">
  <script>
    (() => {
      const key = "websmakenpas-theme";
      const saved = localStorage.getItem(key);
      const theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
    })();
  </script>
  <link rel="stylesheet" href="/assets/app.css?v=66">
</head>
<body>
  <div id="app"></div>
  <script src="/assets/app.js?v=66"></script>
</body>
</html>`;
}

export function adminShell(title = "Dashboard Admin") {
  const logoPath = "/Logo_SMKNPasirian.png";
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="theme-color" content="#3f3d99">
  <link rel="icon" type="image/png" href="${logoPath}">
  <link rel="apple-touch-icon" href="${logoPath}">
  <link rel="manifest" href="/manifest.webmanifest">
  <script>
    (() => {
      const key = "websmakenpas-theme";
      const saved = localStorage.getItem(key);
      const theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
    })();
  </script>
  <link rel="stylesheet" href="/assets/app.css?v=66">
</head>
<body class="admin-body">
  <div id="admin"></div>
  <script src="/assets/admin.js?v=63"></script>
</body>
</html>`;
}

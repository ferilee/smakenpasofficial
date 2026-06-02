export function appShell(title = "Website Sekolah") {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="description" content="Website profil sekolah dan pusat informasi resmi.">
  <meta name="theme-color" content="#3f3d99">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <link rel="manifest" href="/manifest.webmanifest">
  <script>
    (() => {
      const key = "websmakenpas-theme";
      const saved = localStorage.getItem(key);
      const theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
    })();
  </script>
  <link rel="stylesheet" href="/assets/app.css?v=33">
</head>
<body>
  <div id="app"></div>
  <script src="/assets/app.js?v=33"></script>
</body>
</html>`;
}

export function adminShell(title = "Dashboard Admin") {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta name="theme-color" content="#3f3d99">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg">
  <link rel="manifest" href="/manifest.webmanifest">
  <script>
    (() => {
      const key = "websmakenpas-theme";
      const saved = localStorage.getItem(key);
      const theme = saved || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      document.documentElement.dataset.theme = theme;
    })();
  </script>
  <link rel="stylesheet" href="/assets/app.css?v=33">
</head>
<body class="admin-body">
  <div id="admin"></div>
  <script src="/assets/admin.js?v=33"></script>
</body>
</html>`;
}

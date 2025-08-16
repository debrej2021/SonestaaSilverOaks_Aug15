// generateIndex.js
// Scans all subfolders under /photos and generates a multi-section index.html.
// Each subfolder becomes a section (e.g., photos/performances, photos/stills, ...).

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const PHOTOS_DIR = path.join(ROOT, "photos");
const OUT_HTML = path.join(ROOT, "index.html");

const TITLE = "Society Function — Gallery";
const VERSION = new Date().toISOString().slice(0, 10);
const VIDEO_EXTS = [".mp4", ".m4v", ".mov"];
const IMAGE_EXTS = [".jpg", ".jpeg", ".png", ".webp"];

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }
function listDirs(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir)
    .filter((name) => exists(path.join(dir, name)) && fs.statSync(path.join(dir, name)).isDirectory())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
function listFiles(dir) {
  if (!exists(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isFile())
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}
function isVideo(name) { return VIDEO_EXTS.includes(path.extname(name).toLowerCase()); }
function isImage(name) { return IMAGE_EXTS.includes(path.extname(name).toLowerCase()); }
function webPath(abs) { return path.relative(ROOT, abs).split(path.sep).join("/"); }
function titleCase(s) { return s.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()); }

function buildEntries(dirAbs) {
  const files = listFiles(dirAbs);
  return files.map((file) => {
    const abs = path.join(dirAbs, file);
    const url = webPath(abs);
    if (isVideo(file)) {
      const base = file.replace(path.extname(file), "");
      // optional poster: same base name with any image ext
      const poster = IMAGE_EXTS
        .map(ext => path.join(dirAbs, `${base}${ext}`))
        .find(exists);
      return {
        type: "video",
        src: `${url}?v=${VERSION}`,
        poster: poster ? `${webPath(poster)}?v=${VERSION}` : null,
        label: base
      };
    }
    if (isImage(file)) {
      return { type: "image", src: `${url}?v=${VERSION}`, label: file };
    }
    return null;
  }).filter(Boolean);
}

// Collect all sections under /photos
const sectionDirs = listDirs(PHOTOS_DIR);
const sections = sectionDirs.map((dirName) => {
  const abs = path.join(PHOTOS_DIR, dirName);
  return {
    id: dirName,
    title: titleCase(dirName),
    items: buildEntries(abs)
  };
}).filter(sec => sec.items.length > 0);

// Fallback if no sections
if (sections.length === 0) {
  console.warn("No media found. Put files under photos/<section>/ and rerun.");
}

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${TITLE}</title>
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<style>
:root { --maxw: 1200px; --pad: 12px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; }
body { margin:0; background:#0b0b0b; color:#e6edf3; }
header, footer { max-width:var(--maxw); margin:0 auto; padding:16px var(--pad); }
header h1 { margin:0 0 4px; font-size:1.35rem; }
header p { margin:0; opacity:.8; }
.wrap { max-width:var(--maxw); margin:0 auto; padding:12px var(--pad) 28px; }
.nav { display:flex; gap:8px; flex-wrap:wrap; margin-bottom:12px; }
.nav a { text-decoration:none; padding:8px 12px; border-radius:10px; background:#2d333b; color:#e6edf3; font-weight:600; }
.section { display:grid; grid-template-columns: 2fr 1fr; gap:12px; margin:18px 0 28px; }
@media (max-width: 900px) { .section { grid-template-columns: 1fr; } }
.card { background:#111; border-radius:12px; padding:12px; }
.player { position:relative; width:100%; background:#000; border-radius:12px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,.4); }
.player video, .player img { display:block; width:100%; height:auto; object-fit:contain; aspect-ratio:16/9; background:#000; }
.controls { display:flex; gap:8px; margin:10px 0 0; flex-wrap:wrap; }
button { appearance:none; border:0; padding:10px 14px; border-radius:10px; cursor:pointer; background:#1f6feb; color:#fff; font-weight:600; }
button.secondary { background:#2d333b; color:#e6edf3; }
.list { list-style:none; margin:0; padding:0; max-height:420px; overflow:auto; }
.list li { padding:8px 10px; border-radius:8px; cursor:pointer; }
.list li.active { background:#1f6feb22; }
.list li:hover { background:#2d333b; }
.small { font-size:.9rem; opacity:.75; }
.caption { margin-top:8px; opacity:.85; }
</style>
</head>
<body>
<header>
  <h1>${TITLE}</h1>
  <p>Auto-generated on ${new Date().toLocaleString()} • Cache version: ${VERSION}</p>
</header>

<div class="wrap">
  <nav class="nav">
    ${sections.map(s => `<a href="#${s.id}">${s.title}</a>`).join("")}
  </nav>

  ${sections.map((s, si) => `
  <section id="${s.id}" class="section">
    <div class="card">
      <h2 style="margin:4px 0 8px">${s.title}</h2>
      <div class="player" id="player-${si}"></div>
      <div class="controls">
        <button class="secondary" data-prev="${si}">◀︎ Prev</button>
        <button class="secondary" data-next="${si}">Next ▶︎</button>
        <button data-reload="${si}">Reload Media</button>
      </div>
      <div class="caption" id="caption-${si}"></div>
      <div class="small" id="meta-${si}"></div>
    </div>
    <aside class="card">
      <h3 style="margin:4px 0 8px">${s.title} — Items</h3>
      <ul class="list" id="list-${si}"></ul>
    </aside>
  </section>
  `).join("")}
</div>

<footer>
  <small>© Your Society • Static site generated by generateIndex.js</small>
</footer>

<script>
const VERSION = "${VERSION}";
const sections = ${JSON.stringify(sections, null, 2)};
const state = sections.map(() => 0);

function $(sel) { return document.querySelector(sel); }
function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); }

function renderList(si) {
  const ul = $("#list-" + si);
  clear(ul);
  const items = sections[si].items;
  items.forEach((item, i) => {
    const li = document.createElement("li");
    li.className = i === state[si] ? "active" : "";
    li.innerHTML = '<span class="small">#' + (i+1) + '</span> ' + (item.label || item.src);
    li.addEventListener("click", () => { state[si] = i; renderMedia(si); renderList(si); });
    ul.appendChild(li);
  });
}

function renderMedia(si) {
  const container = $("#player-" + si);
  clear(container);
  const item = sections[si].items[state[si]];
  if (!item) { container.textContent = "No media."; return; }

  if (item.type === "video") {
    const vid = document.createElement("video");
    vid.setAttribute("controls", "");
    vid.setAttribute("playsinline", "");
    vid.setAttribute("preload", "metadata");
    vid.style.width = "100%";
    vid.style.borderRadius = "12px";
    vid.style.background = "#000";
    vid.style.objectFit = "contain";
    if (item.poster) vid.poster = item.poster;

    const src = document.createElement("source");
    const fresh = item.src + (item.src.includes("?") ? "&" : "?") + "t=" + Date.now();
    src.src = fresh;
    src.type = "video/mp4";
    vid.appendChild(src);

    container.appendChild(vid);
  } else {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.label || "";
    container.appendChild(img);
  }

  $("#caption-" + si).textContent = item.label || (item.type === "video" ? "Video" : "Image");
  $("#meta-" + si).textContent = (item.type === "video" ? "Video" : "Image") + " • " + item.src.split("?")[0];
}

document.addEventListener("click", (e) => {
  if (e.target.matches("[data-prev]")) {
    const si = +e.target.getAttribute("data-prev");
    const n = sections[si].items.length;
    state[si] = (state[si] - 1 + n) % n;
    renderMedia(si); renderList(si);
  }
  if (e.target.matches("[data-next]")) {
    const si = +e.target.getAttribute("data-next");
    const n = sections[si].items.length;
    state[si] = (state[si] + 1) % n;
    renderMedia(si); renderList(si);
  }
  if (e.target.matches("[data-reload]")) {
    const si = +e.target.getAttribute("data-reload");
    renderMedia(si);
  }
});

(function boot(){
  sections.forEach((_, si) => { renderList(si); renderMedia(si); });
})();
</script>
</body>
</html>`;

fs.writeFileSync(OUT_HTML, html, "utf8");
console.log(`✅ Generated ${OUT_HTML}`);
console.log(`• Sections found under /photos: ${sectionDirs.join(", ") || "(none)"}`);
sections.forEach(s => console.log(`  - ${s.title}: ${s.items.length} item(s)`));

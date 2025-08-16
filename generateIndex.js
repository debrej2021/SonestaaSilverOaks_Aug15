const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'photos');
const outputFile = path.join(__dirname, 'index.html');

const sections = [
  { title: "Flag Hoisting", folder: "flag" },
  { title: "Champions", folder: "champions" },
  { title: "Performances", folder: "performances" }
];

// Function to read local media files
function getMediaFiles(folderPath) {
  return fs.existsSync(folderPath) ? 
    fs.readdirSync(folderPath).filter(file =>
      /\.(jpg|jpeg|png|gif|mp4|webm)$/i.test(file)
    ) : [];
}

// Function to read external links (YouTube/Vimeo)
function getLinksFile(folderPath) {
  const filePath = path.join(folderPath, 'links.txt');
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }
  return [];
}

function generateSectionHTML(sectionId, files, folder, links) {
  const allItems = [
    ...files.map(f => `photos/${folder}/${f}`),
    ...links
  ];

  const fileArrayJS = `const ${sectionId}Files = [\n${allItems.map(f => `  "${f}"`).join(',\n')}\n];`;

  return `
  <h2 id="${sectionId}">${sectionId.replace(/_/g, " ")}</h2>
  <div class="slideshow-container" id="${sectionId}-slideshow">
    <a class="prev" onclick="plus${sectionId}(-1)">&#10094;</a>
    <a class="next" onclick="plus${sectionId}(1)">&#10095;</a>
  </div>
  <script>
  ${fileArrayJS}
  const ${sectionId}Slideshow = document.getElementById('${sectionId}-slideshow');

  ${sectionId}Files.forEach(src => {
    let el;
    if (/\\.(mp4|webm)$/i.test(src)) {
      el = document.createElement('video');
      el.src = src;
      el.className = 'slides ${sectionId}';
      el.autoplay = true; el.loop = true; el.muted = true; el.playsInline = true;
    } else if (src.includes("youtube.com") || src.includes("youtu.be")) {
      el = document.createElement('iframe');
      el.src = src.replace("watch?v=", "embed/");
      el.className = 'slides ${sectionId}';
      el.width = "100%"; el.height = "400";
      el.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      el.allowFullscreen = true;
    } else if (src.includes("vimeo.com")) {
      el = document.createElement('iframe');
      el.src = src.replace("vimeo.com", "player.vimeo.com/video");
      el.className = 'slides ${sectionId}';
      el.width = "100%"; el.height = "400";
      el.allow = "autoplay; fullscreen; picture-in-picture";
      el.allowFullscreen = true;
    } else {
      el = document.createElement('img');
      el.src = src;
      el.className = 'slides ${sectionId}';
    }
    ${sectionId}Slideshow.appendChild(el);
  });

  let ${sectionId}Index = 0;
  show${sectionId}(${sectionId}Index);

  function plus${sectionId}(n) { show${sectionId}(${sectionId}Index += n); }

  function show${sectionId}(n) {
    let slides = document.getElementsByClassName("slides ${sectionId}");
    if (n >= slides.length) { ${sectionId}Index = 0; }
    if (n < 0) { ${sectionId}Index = slides.length - 1; }
    for (let i = 0; i < slides.length; i++) { slides[i].style.display = "none"; }
    slides[${sectionId}Index].style.display = "block";
  }

  setInterval(function() {
    let slides = document.getElementsByClassName("slides ${sectionId}");
    if (!(slides[${sectionId}Index] instanceof HTMLVideoElement) &&
        !(slides[${sectionId}Index] instanceof HTMLIFrameElement)) {
      plus${sectionId}(1);
    }
  }, 5000);
  </script>
  `;
}

// Build body
let bodyContent = `
<h1>SSO Independence Day Celebrations-25</h1>
<nav>
  <a href="#flag_hoisting">Flag Hoisting</a> |
  <a href="#champions">Champions</a> |
  <a href="#performances">Performances</a>
</nav>
`;

sections.forEach(section => {
  const folderPath = path.join(baseDir, section.folder);
  const files = getMediaFiles(folderPath);
  const links = getLinksFile(folderPath);
  const sectionId = section.title.toLowerCase().replace(/ /g, "_");
  bodyContent += generateSectionHTML(sectionId, files, section.folder, links);
});

// Final HTML
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Independence Day Celebration</title>
<style>
body { text-align: center; font-family: Arial; background-color: #f7f7f7; margin: 0; padding: 0; }
h1 { color: #ff5722; margin-top: 20px; font-size: 1.8rem; }
h2 { margin-top: 40px; color: #333; }
nav { margin: 20px; font-size: 1.2rem; }
nav a { margin: 0 10px; text-decoration: none; color: #007BFF; }
.slideshow-container { max-width: 100%; margin: 20px auto; position: relative; padding: 0 10px; }
.slides { display: none; width: 100%; height: auto; border-radius: 10px; object-fit: contain; }
video.slides, iframe.slides { background: black; }
.prev, .next {
  cursor: pointer;
  position: absolute;
  top: 50%;
  padding: 16px;
  color: white;
  font-weight: bold;
  font-size: 22px;
  border-radius: 3px;
  user-select: none;
  transform: translateY(-50%);
  background-color: rgba(0,0,0,0.5);
  z-index: 10;
}
.prev { left: 5px; }
.next { right: 5px; }
</style>
</head>
<body>
${bodyContent}
</body>
</html>
`;

fs.writeFileSync(outputFile, htmlTemplate, 'utf-8');
console.log("index.html generated with YouTube/Vimeo + local media support.");

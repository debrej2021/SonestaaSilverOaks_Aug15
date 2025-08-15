const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'photos'); // folder with images/videos
const outputFile = path.join(__dirname, 'index.html');

// Read all files in the photos folder
const files = fs.readdirSync(photosDir).filter(file => {
    return /\.(jpg|jpeg|png|gif|mp4|webm)$/i.test(file);
});

// Generate JavaScript array dynamically
const imageArrayJS = `const imageFiles = [\n${files.map(f => `  "photos/${f}"`).join(',\n')}\n];`;

// HTML template
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
.slideshow-container {
  max-width: 100%;
  margin: 20px auto;
  position: relative;
  padding: 0 10px;
}
.slides {
  display: none;
  width: 100%;
  height: auto;
  border-radius: 10px;
  object-fit: contain;
}
video.slides {
  background: black;
}
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
@media screen and (max-width: 600px) {
  h1 { font-size: 1.4rem; }
  .prev, .next { font-size: 18px; padding: 12px; }
}
</style>
</head>
<body>

<h1>Our Society Independence Day Celebrations</h1>

<div class="slideshow-container" id="slideshow">
  <a class="prev" onclick="plusSlides(-1)">&#10094;</a>
  <a class="next" onclick="plusSlides(1)">&#10095;</a>
</div>

<script>
${imageArrayJS}

const slideshow = document.getElementById('slideshow');
imageFiles.forEach(src => {
  let el;
  if (/\\.(mp4|webm)$/i.test(src)) {
    el = document.createElement('video');
    el.src = src;
    el.className = 'slides';
    el.autoplay = true;
    el.loop = true;
    el.muted = true;       // required for autoplay on mobile
    el.playsInline = true; // required for iOS Safari
  } else {
    el = document.createElement('img');
    el.src = src;
    el.className = 'slides';
  }
  slideshow.appendChild(el);
});

let slideIndex = 0;
showSlides(slideIndex);

function plusSlides(n) { showSlides(slideIndex += n); }

function showSlides(n) {
  let slides = document.getElementsByClassName("slides");
  if (n >= slides.length) { slideIndex = 0; }
  if (n < 0) { slideIndex = slides.length - 1; }
  for (let i = 0; i < slides.length; i++) { slides[i].style.display = "none"; }
  slides[slideIndex].style.display = "block";
}

// Auto-slide every 5 seconds for images only
setInterval(function() { 
  let slides = document.getElementsByClassName("slides");
  if (!(slides[slideIndex] instanceof HTMLVideoElement)) {
    plusSlides(1);
  }
}, 5000);
</script>

</body>
</html>
`;

// Write index.html
fs.writeFileSync(outputFile, htmlTemplate, 'utf-8');
console.log(`index.html generated with ${files.length} files (images/videos).`);

const fs = require('fs');
const path = require('path');

const photosDir = path.join(__dirname, 'photos'); // folder with images
const outputFile = path.join(__dirname, 'index.html');

// Read all files in the photos folder
const files = fs.readdirSync(photosDir).filter(file => {
    return /\.(jpg|jpeg|png|gif)$/i.test(file);
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
body { text-align: center; font-family: Arial; background-color: #f7f7f7; }
h1 { color: #ff5722; margin-top: 20px; }
.slideshow-container { max-width: 800px; margin: 40px auto; position: relative; }
.slides { display: none; width: 100%; border-radius: 10px; }
.prev, .next { cursor: pointer; position: absolute; top: 50%; padding: 12px;
               color: white; font-weight: bold; font-size: 18px; border-radius: 3px;
               user-select: none; transform: translateY(-50%); background-color: rgba(0,0,0,0.5); }
.prev { left: 0; } .next { right: 0; }
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
  const img = document.createElement('img');
  img.src = src;
  img.className = 'slides';
  slideshow.appendChild(img);
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

// Auto-slide every 3 seconds
setInterval(function() { plusSlides(1); }, 3000);
</script>

</body>
</html>
`;

// Write index.html
fs.writeFileSync(outputFile, htmlTemplate, 'utf-8');
console.log(`index.html generated with ${files.length} photos.`);

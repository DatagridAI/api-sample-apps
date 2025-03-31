const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, "../public/icons");

// Create icons directory if it doesn't exist
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate icons for each size
sizes.forEach((size) => {
  // Create a blue square with white 'C' text
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#4285f4"/>
      <text
        x="50%"
        y="50%"
        font-family="Arial"
        font-size="${size * 0.6}"
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >C</text>
    </svg>
  `;

  // Convert SVG to PNG
  sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(iconsDir, `icon${size}.png`))
    .then(() => console.log(`Generated ${size}x${size} icon`))
    .catch((err) =>
      console.error(`Error generating ${size}x${size} icon:`, err)
    );
});

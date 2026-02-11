/**
 * scripts/generate-pwa-icons.js
 * 
 * Generates PWA icons (192x192 and 512x512) from Logo.png
 * Uses sharp for automatic resizing with transparent background
 * 
 * Requirements:
 *   npm install --save-dev sharp
 * 
 * Usage:
 *   node scripts/generate-pwa-icons.js
 */

const fs = require('fs');
const path = require('path');

const logoPath = path.join(__dirname, '..', 'src', 'assets', 'images', 'Logo.png');
const publicDir = path.join(__dirname, '..', 'public');

if (!fs.existsSync(logoPath)) {
  console.error('Logo not found at:', logoPath);
  console.log('\nPlease place your logo at: src/assets/images/Logo.png');
  process.exit(1);
}

console.log('PWA Icon Generation Tool');
console.log('=========================');

try {
  const sharp = require('sharp');

  async function generateIcons() {
    const sizes = [192, 512];

    for (const size of sizes) {
      const outputPath = path.join(publicDir, `icon-${size}x${size}.png`);

      await sharp(logoPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }, // transparent
        })
        .png({ quality: 90 })
        .toFile(outputPath);

      console.log(`✓ Generated: ${path.relative(process.cwd(), outputPath)}`);
    }

    console.log('\nAll PWA icons generated successfully!');
    console.log('You can now use them in manifest.json and index.html');
    console.log('Tip: For maskable icons, ensure important content is centered (safe zone).');
  }

  generateIcons().catch(err => {
    console.error('Error during generation:', err.message);
  });
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.log('\nSharp is not installed. To enable automatic generation:');
    console.log('  1. Run: npm install --save-dev sharp');
    console.log('  2. Run this script again: node scripts/generate-pwa-icons.js');
    console.log('\nManual fallback instructions:');
    console.log('-----------------------------');
    console.log('1. Open src/assets/images/Logo.png in any image editor');
    console.log('2. Create square versions:');
    console.log('   - 192×192 px → save as public/icon-192x192.png');
    console.log('   - 512×512 px → save as public/icon-512x512.png');
    console.log('3. Use transparent background');
    console.log('4. Keep important content centered for maskable icons');
  } else {
    console.error('Unexpected error:', err.message);
  }
}
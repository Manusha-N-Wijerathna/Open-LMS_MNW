const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_IMAGE = path.join(__dirname, '..', 'public', 'icons', 'icon-source.png');
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const APP_DIR = path.join(__dirname, '..', 'src', 'app');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const standardSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const faviconSizes = [16, 32];

async function main() {
  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`Source image not found at ${SOURCE_IMAGE}`);
    process.exit(1);
  }

  // 1. Standard transparent icons
  for (const size of standardSizes) {
    const dest = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(`Generated: icon-${size}x${size}.png`);
  }

  // 2. Favicon PNGs
  for (const size of faviconSizes) {
    const dest = path.join(ICONS_DIR, `favicon-${size}x${size}.png`);
    await sharp(SOURCE_IMAGE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toFile(dest);
    console.log(`Generated: favicon-${size}x${size}.png`);
  }

  // 3. Apple Touch Icon (180x180)
  const appleBg = await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 9, g: 13, b: 22, alpha: 1 }
    }
  }).png().toBuffer();

  const appleBadge = await sharp(SOURCE_IMAGE)
    .resize(150, 150, { fit: 'contain' })
    .toBuffer();

  const appleTouchPath = path.join(ICONS_DIR, 'apple-touch-icon.png');
  await sharp(appleBg)
    .composite([{ input: appleBadge, gravity: 'center' }])
    .png({ compressionLevel: 9 })
    .toFile(appleTouchPath);
  console.log('Generated: apple-touch-icon.png');

  // 4. Maskable Icons (192x192 & 512x512)
  for (const size of [192, 512]) {
    const badgeSize = Math.round(size * 0.78);
    const maskBg = await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 9, g: 13, b: 22, alpha: 1 }
      }
    }).png().toBuffer();

    const badgeBuffer = await sharp(SOURCE_IMAGE)
      .resize(badgeSize, badgeSize, { fit: 'contain' })
      .toBuffer();

    const maskDest = path.join(ICONS_DIR, `icon-maskable-${size}x${size}.png`);
    await sharp(maskBg)
      .composite([{ input: badgeBuffer, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(maskDest);
    console.log(`Generated: icon-maskable-${size}x${size}.png`);
  }

  // 5. SVG Fallbacks
  const png512Buffer = fs.readFileSync(path.join(ICONS_DIR, 'icon-512x512.png'));
  const png512Base64 = png512Buffer.toString('base64');
  const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${png512Base64}" width="512" height="512" />
</svg>
`;
  fs.writeFileSync(path.join(ICONS_DIR, 'icon.svg'), svgContent, 'utf8');

  const mask512Buffer = fs.readFileSync(path.join(ICONS_DIR, 'icon-maskable-512x512.png'));
  const mask512Base64 = mask512Buffer.toString('base64');
  const svgMaskContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <image href="data:image/png;base64,${mask512Base64}" width="512" height="512" />
</svg>
`;
  fs.writeFileSync(path.join(ICONS_DIR, 'icon-maskable.svg'), svgMaskContent, 'utf8');
  console.log('Generated: SVGs');

  // 6. Favicon.ico multi-resolution
  const icoSizes = [16, 32, 48, 256];
  const icoPngBuffers = await Promise.all(
    icoSizes.map(s => sharp(SOURCE_IMAGE).resize(s, s, { fit: 'contain' }).png().toBuffer())
  );

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(icoSizes.length, 4);

  let offset = 6 + icoSizes.length * 16;
  const entries = [];
  for (let i = 0; i < icoSizes.length; i++) {
    const s = icoSizes[i];
    const buf = icoPngBuffers[i];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(s === 256 ? 0 : s, 0);
    entry.writeUInt8(s === 256 ? 0 : s, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += buf.length;
  }

  const icoBuffer = Buffer.concat([icoHeader, ...entries, ...icoPngBuffers]);
  fs.writeFileSync(path.join(APP_DIR, 'favicon.ico'), icoBuffer);
  fs.writeFileSync(path.join(PUBLIC_DIR, 'favicon.ico'), icoBuffer);
  console.log('Generated: favicon.ico');

  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

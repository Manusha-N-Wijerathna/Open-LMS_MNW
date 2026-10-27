const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 1. Standard SVG Icon (with rounded squircle & glow)
const standardSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#7c3aed" />
    </linearGradient>
    <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#06b6d4" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#a855f7" stop-opacity="0.8" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000" flood-opacity="0.4" />
    </filter>
  </defs>

  <!-- Background Squircle -->
  <rect x="24" y="24" width="464" height="464" rx="104" fill="url(#bgGrad)" filter="url(#shadow)" />
  
  <!-- Subtle border highlight -->
  <rect x="24" y="24" width="464" height="464" rx="104" fill="none" stroke="url(#glowGrad)" stroke-width="4" stroke-opacity="0.6" />

  <!-- Graduation Cap & Future Tech Motif -->
  <g transform="translate(256, 230) scale(1.15)">
    <!-- Cap top diamond -->
    <path d="M 0,-85 L 140,-25 L 0,35 L -140,-25 Z" fill="#ffffff" />
    
    <!-- Cap top inner 3D depth layer -->
    <path d="M 0,35 L 140,-25 L 140,-15 L 0,45 L -140,-15 L -140,-25 Z" fill="#e0e7ff" opacity="0.85" />
    
    <!-- Cap skull base -->
    <path d="M -75,6 C -75,48 -40,78 0,78 C 40,78 75,48 75,6 Z" fill="#ffffff" opacity="0.95" />
    <path d="M -75,6 C -75,48 -40,78 0,78 C 40,78 75,48 75,6 Z" fill="none" stroke="#6366f1" stroke-width="3" />

    <!-- Tassel Button & Cord -->
    <circle cx="0" cy="-25" r="7" fill="url(#accentGrad)" />
    <path d="M 0,-25 C 65,-20 100,5 110,45" fill="none" stroke="url(#accentGrad)" stroke-width="5" stroke-linecap="round" />
    
    <!-- Tassel Bobble -->
    <rect x="105" y="45" width="10" height="28" rx="4" fill="url(#accentGrad)" />
    
    <!-- Tech circuits / brackets below -->
    <g transform="translate(0, 100)" stroke="url(#accentGrad)" stroke-width="4" stroke-linecap="round" fill="none">
      <!-- Future Nodes -->
      <path d="M -90,-5 L -45,15 L 45,15 L 90,-5" opacity="0.8" />
      <circle cx="-90" cy="-5" r="5" fill="#22d3ee" />
      <circle cx="90" cy="-5" r="5" fill="#22d3ee" />
      <circle cx="0" cy="15" r="4" fill="#ffffff" />
    </g>
  </g>

  <!-- Brand badge label -->
  <text x="256" y="435" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="28" letter-spacing="4" fill="#e0e7ff">ICT FOR FUTURE</text>
</svg>
`;

// 2. Maskable SVG Icon (Safe-area compliant: 80% circle, edge-to-edge background)
const maskableSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGradMask" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3730a3" />
      <stop offset="50%" stop-color="#4f46e5" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
    <linearGradient id="accentGradMask" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#22d3ee" />
      <stop offset="100%" stop-color="#ffffff" />
    </linearGradient>
  </defs>

  <!-- Full Bleed Background for Android Masking -->
  <rect x="0" y="0" width="512" height="512" fill="url(#bgGradMask)" />
  
  <!-- Subtle background glow in center -->
  <circle cx="256" cy="256" r="180" fill="#6366f1" opacity="0.3" filter="blur(30px)" />

  <!-- Main emblem scaled to 70% to stay strictly within 80% safe circle -->
  <g transform="translate(256, 235) scale(0.95)">
    <!-- Cap top diamond -->
    <path d="M 0,-85 L 140,-25 L 0,35 L -140,-25 Z" fill="#ffffff" />
    
    <!-- Cap top inner 3D depth layer -->
    <path d="M 0,35 L 140,-25 L 140,-15 L 0,45 L -140,-15 L -140,-25 Z" fill="#e0e7ff" opacity="0.85" />
    
    <!-- Cap skull base -->
    <path d="M -75,6 C -75,48 -40,78 0,78 C 40,78 75,48 75,6 Z" fill="#ffffff" opacity="0.95" />
    <path d="M -75,6 C -75,48 -40,78 0,78 C 40,78 75,48 75,6 Z" fill="none" stroke="#4f46e5" stroke-width="3" />

    <!-- Tassel Button & Cord -->
    <circle cx="0" cy="-25" r="7" fill="url(#accentGradMask)" />
    <path d="M 0,-25 C 65,-20 100,5 110,45" fill="none" stroke="url(#accentGradMask)" stroke-width="5" stroke-linecap="round" />
    
    <!-- Tassel Bobble -->
    <rect x="105" y="45" width="10" height="28" rx="4" fill="url(#accentGradMask)" />
    
    <!-- Tech circuits / brackets below -->
    <g transform="translate(0, 95)" stroke="url(#accentGradMask)" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M -80,-5 L -40,15 L 40,15 L 80,-5" opacity="0.8" />
      <circle cx="-80" cy="-5" r="5" fill="#22d3ee" />
      <circle cx="80" cy="-5" r="5" fill="#22d3ee" />
      <circle cx="0" cy="15" r="4" fill="#ffffff" />
    </g>
  </g>

  <text x="256" y="410" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="24" letter-spacing="3" fill="#e0e7ff">ICT FOR FUTURE</text>
</svg>
`;

async function main() {
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Save SVGs
  fs.writeFileSync(path.join(iconsDir, 'icon.svg'), standardSvg);
  fs.writeFileSync(path.join(iconsDir, 'icon-maskable.svg'), maskableSvg);

  const standardSizes = [72, 96, 128, 144, 152, 180, 192, 384, 512];
  for (const size of standardSizes) {
    const filename = size === 180 ? 'apple-touch-icon.png' : `icon-${size}x${size}.png`;
    await sharp(Buffer.from(standardSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, filename));
    console.log(`Generated: ${filename}`);
  }

  // Favicon PNGs
  await sharp(Buffer.from(standardSvg)).resize(32, 32).png().toFile(path.join(iconsDir, 'favicon-32x32.png'));
  await sharp(Buffer.from(standardSvg)).resize(16, 16).png().toFile(path.join(iconsDir, 'favicon-16x16.png'));

  // Maskable icons
  const maskableSizes = [192, 512];
  for (const size of maskableSizes) {
    const filename = `icon-maskable-${size}x${size}.png`;
    await sharp(Buffer.from(maskableSvg))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, filename));
    console.log(`Generated maskable: ${filename}`);
  }

  console.log('All icons generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

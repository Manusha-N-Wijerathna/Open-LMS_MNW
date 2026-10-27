const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const desktopSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 800" width="1280" height="800">
  <defs>
    <linearGradient id="d-bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="50%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="d-accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="card-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
    </linearGradient>
  </defs>

  <rect width="1280" height="800" fill="url(#d-bg)" />

  <!-- Top App Navigation Bar -->
  <rect x="0" y="0" width="1280" height="72" fill="#0b1120" opacity="0.9" />
  <line x1="0" y1="72" x2="1280" y2="72" stroke="#334155" stroke-opacity="0.4" />
  
  <!-- Logo -->
  <rect x="48" y="16" width="40" height="40" rx="10" fill="url(#d-accent)" />
  <text x="100" y="38" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#ffffff">#ict_for_future</text>
  <text x="100" y="52" font-family="system-ui, sans-serif" font-weight="600" font-size="10" letter-spacing="2" fill="#94a3b8">LMS PLATFORM</text>

  <!-- Nav links -->
  <text x="400" y="42" font-family="system-ui, sans-serif" font-size="14" fill="#e2e8f0" font-weight="500">Past Papers</text>
  <text x="520" y="42" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" font-weight="500">Exam Countdown</text>
  <text x="680" y="42" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8" font-weight="500">Curriculum</text>
  
  <!-- Sign In Button -->
  <rect x="1120" y="18" width="110" height="36" rx="8" fill="#6366f1" />
  <text x="1175" y="41" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#ffffff" text-anchor="middle">Get Started</text>

  <!-- Hero Content -->
  <g transform="translate(80, 160)">
    <!-- Badge -->
    <rect x="0" y="0" width="220" height="30" rx="15" fill="#4f46e5" fill-opacity="0.2" stroke="#6366f1" stroke-width="1" />
    <text x="110" y="20" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#38bdf8" text-anchor="middle">NEXT-GEN LMS PLATFORM</text>

    <!-- Main Headline -->
    <text x="0" y="80" font-family="system-ui, sans-serif" font-weight="900" font-size="52" fill="#ffffff">Master ICT with</text>
    <text x="0" y="140" font-family="system-ui, sans-serif" font-weight="900" font-size="52" fill="url(#d-accent)">Modern Interactive Tools</text>
    <text x="0" y="190" font-family="system-ui, sans-serif" font-size="18" fill="#94a3b8">Past papers, automated marking schemes, countdown timers, and full progress analytics.</text>
  </g>

  <!-- Feature Cards -->
  <g transform="translate(80, 440)">
    <!-- Card 1 -->
    <rect x="0" y="0" width="340" height="240" rx="16" fill="url(#card-grad)" stroke="#334155" stroke-opacity="0.5" />
    <text x="32" y="55" font-family="system-ui, sans-serif" font-size="28" fill="#818cf8">📄</text>
    <text x="32" y="110" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#ffffff">Past Papers Archive</text>
    <text x="32" y="145" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Access A/L and O/L past papers with structured marking schemes.</text>

    <!-- Card 2 -->
    <rect x="380" y="0" width="340" height="240" rx="16" fill="url(#card-grad)" stroke="#334155" stroke-opacity="0.5" />
    <text x="412" y="55" font-family="system-ui, sans-serif" font-size="28" fill="#22d3ee">⏱</text>
    <text x="412" y="110" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#ffffff">Exam Countdown</text>
    <text x="412" y="145" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Real-time target countdowns with automated study reminders.</text>

    <!-- Card 3 -->
    <rect x="760" y="0" width="340" height="240" rx="16" fill="url(#card-grad)" stroke="#334155" stroke-opacity="0.5" />
    <text x="792" y="55" font-family="system-ui, sans-serif" font-size="28" fill="#c084fc">📱</text>
    <text x="792" y="110" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#ffffff">PWA Desktop and Mobile</text>
    <text x="792" y="145" font-family="system-ui, sans-serif" font-size="13" fill="#94a3b8">Install directly as a standalone app on PC, Mac, iPhone, and Android.</text>
  </g>
</svg>
`;

const mobileSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 750 1334" width="750" height="1334">
  <defs>
    <linearGradient id="m-bg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#090d16" />
      <stop offset="40%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e1b4b" />
    </linearGradient>
    <linearGradient id="m-accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#6366f1" />
      <stop offset="100%" stop-color="#06b6d4" />
    </linearGradient>
    <linearGradient id="m-card" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" stop-opacity="0.8" />
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.9" />
    </linearGradient>
  </defs>

  <rect width="750" height="1334" fill="url(#m-bg)" />

  <!-- Status Bar Mock -->
  <text x="40" y="44" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#ffffff">9:41</text>
  <text x="690" y="44" font-family="system-ui, sans-serif" font-size="16" font-weight="600" fill="#ffffff" text-anchor="end">5G</text>

  <!-- Mobile Top Header -->
  <rect x="0" y="64" width="750" height="70" fill="#0b1120" opacity="0.9" />
  <line x1="0" y1="134" x2="750" y2="134" stroke="#334155" stroke-opacity="0.4" />
  
  <rect x="30" y="80" width="38" height="38" rx="8" fill="url(#m-accent)" />
  <text x="80" y="99" font-family="system-ui, sans-serif" font-weight="800" font-size="18" fill="#ffffff">#ict_for_future</text>
  <text x="80" y="113" font-family="system-ui, sans-serif" font-weight="600" font-size="10" letter-spacing="2" fill="#94a3b8">LMS MOBILE</text>

  <!-- Mobile Hero -->
  <g transform="translate(40, 180)">
    <rect x="0" y="0" width="180" height="28" rx="14" fill="#4f46e5" fill-opacity="0.25" stroke="#6366f1" stroke-width="1" />
    <text x="90" y="19" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#38bdf8" text-anchor="middle">PWA READY</text>

    <text x="0" y="70" font-family="system-ui, sans-serif" font-weight="900" font-size="36" fill="#ffffff">Learn ICT</text>
    <text x="0" y="115" font-family="system-ui, sans-serif" font-weight="900" font-size="36" fill="url(#m-accent)">Anytime, Anywhere</text>
    <text x="0" y="155" font-family="system-ui, sans-serif" font-size="16" fill="#94a3b8">Fast, offline-ready, and lightweight mobile experience.</text>
  </g>

  <!-- Mobile Cards -->
  <g transform="translate(40, 420)">
    <!-- Exam Countdown Mini Widget -->
    <rect x="0" y="0" width="670" height="150" rx="16" fill="url(#m-card)" stroke="#334155" stroke-opacity="0.6" />
    <text x="30" y="45" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#ffffff">A/L ICT Examination Countdown</text>
    <g transform="translate(30, 70)">
      <rect x="0" y="0" width="130" height="55" rx="8" fill="#0f172a" />
      <text x="65" y="32" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#6366f1" text-anchor="middle">142</text>
      <text x="65" y="47" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">DAYS</text>

      <rect x="150" y="0" width="130" height="55" rx="8" fill="#0f172a" />
      <text x="215" y="32" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#6366f1" text-anchor="middle">08</text>
      <text x="215" y="47" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">HOURS</text>

      <rect x="300" y="0" width="130" height="55" rx="8" fill="#0f172a" />
      <text x="365" y="32" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#6366f1" text-anchor="middle">45</text>
      <text x="365" y="47" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">MINS</text>
    </g>

    <!-- Past Papers Card -->
    <rect x="0" y="180" width="670" height="240" rx="16" fill="url(#m-card)" stroke="#334155" stroke-opacity="0.6" />
    <text x="32" y="240" font-family="system-ui, sans-serif" font-size="28" fill="#818cf8">📄</text>
    <text x="32" y="290" font-family="system-ui, sans-serif" font-weight="700" font-size="20" fill="#ffffff">A/L and O/L Past Papers</text>
    <text x="32" y="325" font-family="system-ui, sans-serif" font-size="14" fill="#94a3b8">Search, filter by year and medium, and download marking schemes.</text>

    <!-- Install Action Button -->
    <rect x="0" y="460" width="670" height="60" rx="14" fill="url(#m-accent)" />
    <text x="335" y="497" font-family="system-ui, sans-serif" font-weight="700" font-size="18" fill="#ffffff" text-anchor="middle">Install to Home Screen</text>
  </g>

  <!-- Mobile Bottom Nav Bar -->
  <rect x="0" y="1240" width="750" height="94" fill="#090d16" stroke="#334155" stroke-width="1" />
  <text x="120" y="1285" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#6366f1" text-anchor="middle">Home</text>
  <text x="375" y="1285" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">Papers</text>
  <text x="630" y="1285" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#94a3b8" text-anchor="middle">Account</text>
</svg>
`;

async function main() {
  const screenshotsDir = path.join(__dirname, '..', 'public', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  await sharp(Buffer.from(desktopSvg))
    .resize(1280, 800)
    .png()
    .toFile(path.join(screenshotsDir, 'desktop-preview.png'));
  console.log('Generated desktop screenshot preview');

  await sharp(Buffer.from(mobileSvg))
    .resize(750, 1334)
    .png()
    .toFile(path.join(screenshotsDir, 'mobile-preview.png'));
  console.log('Generated mobile screenshot preview');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

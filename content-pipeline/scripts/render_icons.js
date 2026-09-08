const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const icons = require('react-icons/pi');

// icon name -> [file basename, hex color]
const JOBS = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const OUT_DIR = process.argv[3];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function run() {
  for (const job of JOBS) {
    const { icon, file, color } = job;
    const Comp = icons[icon];
    if (!Comp) {
      console.error('MISSING ICON:', icon);
      continue;
    }
    const svgString = ReactDOMServer.renderToStaticMarkup(
      React.createElement(Comp, { size: 256, color: color })
    );
    const outPath = path.join(OUT_DIR, file + '.png');
    await sharp(Buffer.from(svgString), { density: 300 })
      .resize(256, 256)
      .png()
      .toFile(outPath);
    console.log('wrote', outPath);
  }
}

run();

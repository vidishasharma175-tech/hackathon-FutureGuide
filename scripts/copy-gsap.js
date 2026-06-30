// copy-gsap.js - copies gsap from node_modules to public/vendor after npm install
const fs = require('fs');
const path = require('path');
const src = path.join(__dirname, '..', 'node_modules', 'gsap', 'dist', 'gsap.min.js');
const destDir = path.join(__dirname, '..', 'public', 'vendor');
const dest = path.join(destDir, 'gsap.min.js');
try{
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log('Copied gsap to public/vendor/gsap.min.js');
  } else {
    console.warn('gsap not found in node_modules. Run `npm install gsap` first.');
  }
}catch(e){ console.error('Failed to copy gsap:', e); process.exit(0); }

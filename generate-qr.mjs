import QRCode from 'qrcode';
import { mkdirSync } from 'fs';

const codes = ['LATHE-04', 'MILL-02', 'PRESS-07', 'WELD-01', 'DRILL-03', 'SAW-02'];

mkdirSync('qr-codes', { recursive: true });

for (const code of codes) {
  await QRCode.toFile(`qr-codes/${code}.png`, code, {
    width: 400,
    margin: 2,
    color: { dark: '#0f172a', light: '#ffffff' },
  });
  console.log(`✓ Generated qr-codes/${code}.png`);
}

console.log('\nDone! Print these or display on screen to scan with the app.');

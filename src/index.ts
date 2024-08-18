import sharp from 'sharp';
import * as fs from 'fs/promises';
import fetch from 'node-fetch';

interface Courses {
  Valute: {
    [key: string]: {
      ID: string;
      NumCode: string;
      CharCode: string;
      Nominal: number;
      Name: string;
      Value: number;
      Previous: number;
    };
  };
}

interface Losses {
  data: {
    [key: string]: {
      tanks: number;
      apv: number;
      artillery: number;
      mlrs: number;
      aaws: number;
      aircraft: number;
      helicopters: number;
      uav: number;
      vehicles: number;
      boats: number;
      submarines: number;
      se: number;
      missiles: number;
      personnel: number;
    };
  };
}

function trendString(prev: number, next: number) {
  return next > prev ? `<span color='green'>↗</span>` : `<span color='red'>↘</span>`
}

const fontfile = 'node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-cyrillic-400-normal.woff';

const course: Courses = (await fetch('https://www.cbr-xml-daily.ru/daily_json.js').then(f =>
  f.json()
)) as Courses;

try {
  await fs.mkdir('dist');
} catch (err: unknown) {
  if ((err as any).code !== 'EEXIST') throw err;
  console.log('dist exists');
}
const text = `$${course.Valute.USD.Value}${trendString(course.Valute.USD.Previous, course.Valute.USD.Value)}
€${course.Valute.EUR.Value}${trendString(course.Valute.EUR.Previous, course.Valute.EUR.Value)}
†???
`;
const img = await sharp({
  create: { height: 334, width: 275, background: { r: 0, g: 0, b: 0, alpha: 0 }, channels: 4 },
})
  .composite([
    { input: './resources/munk-o.png', left: 275 - 145, top: 0 },
    {
      input: { text: { text, rgba: true, dpi: 150, fontfile } },
      top: 0,
      left: 0,
    },
  ])
  .webp()
  .toFile('./dist/black_munk.webp');

console.log(img.size);

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

const course: Courses = (await fetch('https://www.cbr-xml-daily.ru/daily_json.js').then(f =>
  f.json()
)) as Courses;

const losses: Losses = (await fetch('https://russian-casualties.in.ua/api/v1/data/json/daily').then(
  f => f.json()
)) as Losses;

const [today] = Object.keys(losses.data).sort((a, b) => b.localeCompare(a));
console.log(today);

try {
  await fs.mkdir('dist');
} catch (err: unknown) {
  if ((err as any).code !== 'EEXIST') throw err;
  console.log('dist exists');
}
const img = await sharp({
  create: { height: 334, width: 250, background: { r: 0, g: 0, b: 0, alpha: 0 }, channels: 4 },
})
  .composite([
    { input: './resources/munk-o.png', left: 250 - 145, top: 0 },
    {
      input: { text: { text: `$${course.Valute.USD.Value}`, rgba: true, dpi: 150 } },
      top: 0,
      left: 0,
    },
    {
      input: { text: { text: `€${course.Valute.EUR.Value}`, rgba: true, dpi: 150 } },
      top: 35,
      left: 0,
    },
    {
      input: { text: { text: `💀${losses.data[today].personnel}`, rgba: true, dpi: 150 } },
      top: 60,
      left: 0,
    },
  ])
  .webp()
  .toFile('./dist/black_munk.webp');

console.log(img.size);

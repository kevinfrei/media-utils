import { Sleep } from '@freik/core-utils';
import ofs from 'fs';
import { Decode } from '../index';

const fs = {
  statAsync: ofs.promises.stat,
  unlinkAsync: ofs.promises.unlink,
  statSync: ofs.statSync,
  unlinkSync: ofs.unlinkSync,
};

const log = false ? console.log : (a: unknown) => {};

export function within(val: number, low: number, high: number): boolean {
  return val >= low && val <= high;
}

const cleanup = () => {
  for (let v = 0; v < 10; v++) {
    try {
      fs.unlinkSync(`src/__tests__/test-output${v}.wav`);
    } catch (e) {}
  }
};

beforeEach(cleanup);
afterEach(cleanup);
jest.setTimeout(30000);

test('Async m4a to wav (using faad)', async () => {
  const dec = await Decode.M4aAsync(
    'src/__tests__/01-quiet.m4a',
    'src/__tests__/test-output1.wav',
  );
  await Sleep(1000);
  expect(dec).toBe(true);
  const stat = await fs.statAsync('src/__tests__/test-output1.wav');
  expect(within(stat.size, 88700, 90200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Async mp3 to wav (using lame)', async () => {
  const dec = await Decode.Mp3Async(
    'src/__tests__/01-quiet.mp3',
    'src/__tests__/test-output2.wav',
  );
  await Sleep(1000);
  expect(dec).toBe(true);
  const stat = await fs.statAsync('src/__tests__/test-output2.wav');
  expect(stat.size).toBe(88788); // Not great, but it works for now
  log(dec);
});
test('Async flac to wav', async () => {
  const dec = await Decode.FlacAsync(
    'src/__tests__/01-quiet.flac',
    'src/__tests__/test-output3.wav',
  );
  expect(dec).toBe(true);
  await Sleep(1000);
  const stat = await fs.statAsync('src/__tests__/test-output3.wav');
  expect(within(stat.size, 133150, 133200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Async wma to wav', async () => {
  const dec = await Decode.WmaAsync(
    'src/__tests__/01-quiet.wma',
    'src/__tests__/test-output4.wav',
  );
  expect(dec).toBe(true);
  await Sleep(1000);
  const stat = await fs.statAsync('src/__tests__/test-output4.wav');
  expect(stat.size).toBe(90190); // Not great, but it works for now
  log(dec);
});

test('Simple m4a to wav (using faad)', () => {
  const dec = Decode.M4a(
    'src/__tests__/01-quiet.m4a',
    'src/__tests__/test-output5.wav',
  );
  expect(dec).toBe(true);
  const stat = fs.statSync('src/__tests__/test-output5.wav');
  expect(within(stat.size, 88700, 90200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Simple mp3 to wav (using lame)', () => {
  const dec = Decode.Mp3(
    'src/__tests__/01-quiet.mp3',
    'src/__tests__/test-output6.wav',
  );
  expect(dec).toBe(true);
  const stat = fs.statSync('src/__tests__/test-output6.wav');
  expect(stat.size).toBe(88788); // Not great, but it works for now
  log(dec);
});
test('Simple flac to wav', () => {
  const dec = Decode.Flac(
    'src/__tests__/01-quiet.flac',
    'src/__tests__/test-output7.wav',
  );
  expect(dec).toBe(true);
  const stat = fs.statSync('src/__tests__/test-output7.wav');
  expect(within(stat.size, 133150, 133200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Simple wma to wav', () => {
  const dec = Decode.Wma(
    'src/__tests__/01-quiet.wma',
    'src/__tests__/test-output8.wav',
  );
  expect(dec).toBe(true);
  const stat = fs.statSync('src/__tests__/test-output8.wav');
  expect(stat.size).toBe(90190); // Not great, but it works for now
  log(dec);
});

const types = ['m4a', 'wma', 'mp3', 'flac'];
for (let type of types) {
  test(`Automatic Async ${type} to wav conversion:`, async () => {
    const dec = await Decode.MakeWaveAsync(`src/__tests__/01-quiet.${type}`);
    expect(dec).toBeDefined();
    if (dec) {
      await Sleep(1000);
      const stat = await fs.statAsync(dec);
      expect(within(stat.size, 88000, 135000)).toBeTruthy();
      await fs.unlinkAsync(dec);
    }
  });
  test(`Automatic Simple ${type} to wav conversion:`, () => {
    const dec = Decode.MakeWave(`src/__tests__/01-quiet.${type}`);
    expect(dec).toBeDefined();
    if (dec) {
      const stat = fs.statSync(dec);
      expect(within(stat.size, 88000, 135000)).toBeTruthy();
      fs.unlinkSync(dec);
    }
  });
}

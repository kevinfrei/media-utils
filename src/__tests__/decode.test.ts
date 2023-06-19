import { Sleep } from '@freik/sync';
import * as ofs from 'fs';
import { Decode } from '../index.js';

const fs = {
  statAsync: ofs.promises.stat,
  unlinkAsync: ofs.promises.unlink,
  statSync: ofs.statSync,
  unlinkSync: ofs.unlinkSync,
};

const log = false ? console.log : (a: unknown) => {};

function within(val: number, low: number, high: number): boolean {
  return val >= low && val <= high;
}

function waitForFile(fileName: string): ofs.Stats | undefined {
  let time = new Date().getSeconds();
  do {
    try {
      const stat = fs.statSync(fileName);
      return stat;
    } catch (e) {}
  } while (new Date().getSeconds() - time < 3);
  return;
}

async function waitForFileAsync(
  fileName: string,
): Promise<ofs.Stats | undefined> {
  let time = new Date().getSeconds();
  do {
    try {
      const stat = await fs.statAsync(fileName);
      return stat;
    } catch (e) {}
  } while (new Date().getSeconds() - time < 3);
  return;
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
  expect(dec).toBe(true);
  const stat = await waitForFileAsync('src/__tests__/test-output1.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(within(stat.size, 88700, 90200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Async mp3 to wav (using lame)', async () => {
  const dec = await Decode.Mp3Async(
    'src/__tests__/01-quiet.mp3',
    'src/__tests__/test-output2.wav',
  );
  expect(dec).toBe(true);
  const stat = await waitForFileAsync('src/__tests__/test-output2.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(stat.size).toBe(88788); // Not great, but it works for now
  log(dec);
});
test('Async flac to wav', async () => {
  const dec = await Decode.FlacAsync(
    'src/__tests__/01-quiet.flac',
    'src/__tests__/test-output3.wav',
  );
  expect(dec).toBe(true);
  const stat = await waitForFileAsync('src/__tests__/test-output3.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(within(stat.size, 133150, 133200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Async wma to wav', async () => {
  const dec = await Decode.WmaAsync(
    'src/__tests__/01-quiet.wma',
    'src/__tests__/test-output4.wav',
  );
  expect(dec).toBe(true);
  const stat = await waitForFileAsync('src/__tests__/test-output4.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(within(stat.size, 81998, 90191)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});

test('Simple m4a to wav (using faad)', () => {
  const dec = Decode.M4a(
    'src/__tests__/01-quiet.m4a',
    'src/__tests__/test-output5.wav',
  );
  expect(dec).toBe(true);
  const stat = waitForFile('src/__tests__/test-output5.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(within(stat.size, 88700, 90200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Simple mp3 to wav (using lame)', () => {
  const dec = Decode.Mp3(
    'src/__tests__/01-quiet.mp3',
    'src/__tests__/test-output6.wav',
  );
  expect(dec).toBe(true);
  const stat = waitForFile('src/__tests__/test-output6.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(stat.size).toBe(88788); // Not great, but it works for now
  log(dec);
});
test('Simple flac to wav', () => {
  const dec = Decode.Flac(
    'src/__tests__/01-quiet.flac',
    'src/__tests__/test-output7.wav',
  );
  expect(dec).toBe(true);
  const stat = waitForFile('src/__tests__/test-output7.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(within(stat.size, 133150, 133200)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});
test('Simple wma to wav', () => {
  const dec = Decode.Wma(
    'src/__tests__/01-quiet.wma',
    'src/__tests__/test-output8.wav',
  );
  expect(dec).toBe(true);
  const stat = waitForFile('src/__tests__/test-output8.wav');
  expect(stat).toBeTruthy();
  if (!stat) return;
  expect(within(stat.size, 81998, 90190)).toBeTruthy(); // Not great, but it works for now
  log(dec);
});

const ranges = new Map<string, [number, number]>([
  ['m4a', [90000, 90500]],
  ['wma', [81500, 82500]],
  ['mp3', [88500, 89000]],
  ['flac', [133000, 133500]],
]);
for (let kvp of ranges) {
  const type = kvp[0];
  const range = kvp[1];
  test(`Automatic Async ${type} to wav conversion:`, async () => {
    const dec = await Decode.MakeWaveAsync(`src/__tests__/01-quiet.${type}`);
    expect(dec).toBeDefined();
    if (dec) {
      await Sleep(1000);
      const stat = await waitForFileAsync(dec);
      expect(stat).toBeTruthy();
      if (!stat) return;
      //  console.log(`${type}: ${stat.size}`);
      expect(within(stat.size, range[0], range[1])).toBeTruthy();
      await fs.unlinkAsync(dec);
    }
  });
  test(`Automatic Simple ${type} to wav conversion:`, () => {
    const dec = Decode.MakeWave(`src/__tests__/01-quiet.${type}`);
    expect(dec).toBeDefined();
    if (dec) {
      const stat = waitForFile(dec);
      expect(stat).toBeTruthy();
      if (!stat) return;
      expect(within(stat.size, range[0], range[1])).toBeTruthy();
      fs.unlinkSync(dec);
    }
  });
}

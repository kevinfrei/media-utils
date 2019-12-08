// @flow
// @format

const ofs = require('fs');
const util = require('util');
require('jest-extended');

const { Metadata, Decode } = require('./../../lib/index');
const fs = {
  statAsync: util.promisify(ofs.stat),
  unlinkAsync: util.promisify(ofs.unlink),
  ...ofs
};
const log = false ? console.log : ((a) => { });

const cleanup = () => {
  try {
    fs.unlinkSync(`output.wav`);
  } catch (e) { }
};

beforeEach(cleanup);
afterEach(cleanup);

test('Async m4a to wav (using faad)', async () => {
  const dec = await Decode.m4aAsync("01-quiet.m4a", "output.wav");
  expect(dec).toBe(true);
  const stat = await fs.statAsync("output.wav");
  expect(stat.size).toBeWithin(88700,90200); // Not great, but it works for now
  log(dec);
});
test('Async mp3 to wav (using lame)', async () => {
  const dec = await Decode.mp3Async("01-quiet.mp3", "output.wav");
  expect(dec).toBe(true);
  const stat = await fs.statAsync("output.wav");
  expect(stat.size).toBe(88788); // Not great, but it works for now
  log(dec);
});
test('Async flac to wav', async () => {
  const dec = await Decode.flacAsync("01-quiet.flac", "output.wav");
  expect(dec).toBe(true);
  const stat = await fs.statAsync("output.wav");
  expect(stat.size).toBeWithin(133150, 133200); // Not great, but it works for now
  log(dec);
});
test('Async wma to wav', async () => {
  const dec = await Decode.wmaAsync("01-quiet.wma", "output.wav");
  expect(dec).toBe(true);
  const stat = await fs.statAsync("output.wav");
  expect(stat.size).toBe(90190); // Not great, but it works for now
  log(dec);
});

test('Simple m4a to wav (using faad)', () => {
  const dec = Decode.m4a("01-quiet.m4a", "output.wav");
  expect(dec).toBe(true);
  const stat = fs.statSync("output.wav");
  expect(stat.size).toBeWithin(88700,90200); // Not great, but it works for now
  log(dec);
});
test('Simple mp3 to wav (using lame)', () => {
  const dec = Decode.mp3("01-quiet.mp3", "output.wav");
  expect(dec).toBe(true);
  const stat = fs.statSync("output.wav");
  expect(stat.size).toBe(88788); // Not great, but it works for now
  log(dec);
});
test('Simple flac to wav', () => {
  const dec = Decode.flac("01-quiet.flac", "output.wav");
  expect(dec).toBe(true);
  const stat = fs.statSync("output.wav");
  expect(stat.size).toBeWithin(133150, 133200); // Not great, but it works for now
  log(dec);
});
test('Simple wma to wav', () => {
  const dec = Decode.wma("01-quiet.wma", "output.wav");
  expect(dec).toBe(true);
  const stat = fs.statSync("output.wav");
  expect(stat.size).toBe(90190); // Not great, but it works for now
  log(dec);
});

const types = ['m4a', 'wma', 'mp3', 'flac'];
for (let type of types) {
  test(`Automatic Async ${type} to wav conversion:`, async () => {
    const dec = await Decode.makeWaveAsync(`01-quiet.${type}`);
    expect(dec).toBeDefined();
    if (dec) {
      const stat = await fs.statAsync(dec);
      const inRange = stat.size < 135000 && stat.size > 88000;
      expect(inRange).toBe(true);
      await fs.unlinkAsync(dec);
    }
  });
  test(`Automatic Simple ${type} to wav conversion:`, () => {
    const dec = Decode.makeWave(`01-quiet.${type}`);
    expect(dec).toBeDefined();
    if (dec) {
      const stat = fs.statSync(dec);
      const inRange = stat.size < 135000 && stat.size > 88000;
      expect(inRange).toBe(true);
      fs.unlinkSync(dec);
    }
  });
}

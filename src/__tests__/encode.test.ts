import ofs from 'fs';
import 'jest-extended';

import { Encode } from '../index';

const fs = {
  statAsync: ofs.promises.stat,
  statSync: ofs.statSync,
  unlinkSync: ofs.unlinkSync,
};

const log = false ? console.log : (a: unknown) => {};

const cleanup = () => {
  for (let ext of ['m4a', 'aac', 'mp3', 'flac']) {
    try {
      fs.unlinkSync(`output.${ext}`);
    } catch (e) {}
  }
};

beforeEach(cleanup);
afterEach(cleanup);

test('Simple wav to m4a (using faac)', () => {
  const enc = Encode.m4a('01-quiet.wav', 'output.m4a');
  expect(enc).toBe(true);
  const stat = fs.statSync('output.m4a');
  expect(stat.size).toBeWithin(7550, 9800); // Not great, but it works for now
  log(enc);
});
test('Simple wav to aac (using ffmpeg)', () => {
  const enc = Encode.ffmpeg('01-quiet.wav', 'output.aac');
  expect(enc).toBe(true);
  const stat = fs.statSync('output.aac');
  expect(stat.size).toBe(4455); // Not great, but it works for now
  log(enc);
});
test('Simple wav to flac', () => {
  const enc = Encode.flac('01-quiet.wav', 'output.flac');
  expect(enc).toBe(true);
  const stat = fs.statSync('output.flac');
  expect(stat.size).toBe(21117); // Not great, but it works for now
  log(enc);
});

test('Async wav to m4a (using faac)', async () => {
  const enc = await Encode.m4aAsync('01-quiet.wav', 'output.m4a');
  expect(enc).toBe(true);
  const stat = await fs.statAsync('output.m4a');
  expect(stat.size).toBeWithin(7550, 9800); // Not great, but it works for now
  log(enc);
});
test('Async wav to aac (using ffmpeg)', async () => {
  const enc = await Encode.ffmpegAsync('01-quiet.wav', 'output.aac');
  expect(enc).toBe(true);
  const stat = await fs.statAsync('output.aac');
  expect(stat.size).toBe(4455); // Not great, but it works for now
  log(enc);
});
test('Async wav to flac', async () => {
  const enc = await Encode.flacAsync('01-quiet.wav', 'output.flac');
  expect(enc).toBe(true);
  const stat = await fs.statAsync('output.flac');
  expect(stat.size).toBe(21117); // Not great, but it works for now
  log(enc);
});
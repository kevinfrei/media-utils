import { Covers } from '../index';
const log = false ? console.log : (a: unknown) => {};

it('Read a jpeg from an mp3 file', async () => {
  const filename = 'src/__tests__/jpg.mp3';
  const mimeData = await Covers.readFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/jpeg');
    expect(mimeData.data.length).toBe(21032);
  }
});
it('Read a jpeg from a flac file', async () => {
  const filename = 'src/__tests__/jpg.flac';
  const mimeData = await Covers.readFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/jpeg');
    expect(mimeData.data.length).toBe(21032);
  }
});
it('Read a jpeg from an m4a file', async () => {
  const filename = 'src/__tests__/jpg.m4a';
  const mimeData = await Covers.readFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/jpeg');
    expect(mimeData.data.length).toBe(21032);
  }
});
it('Read a png from an mp3 file', async () => {
  const filename = 'src/__tests__/png.mp3';
  const mimeData = await Covers.readFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/png');
    expect(mimeData.data.length).toBe(17068);
  }
});
it('Read a png from a flac file', async () => {
  const filename = 'src/__tests__/png.flac';
  const mimeData = await Covers.readFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/png');
    expect(mimeData.data.length).toBe(17068);
  }
});
it('Read a png from an m4a file', async () => {
  const filename = 'src/__tests__/png.m4a';
  const mimeData = await Covers.readFromFile(filename);
  expect(mimeData).toBeDefined();
  if (mimeData) {
    expect(mimeData.type).toBe('image/png');
    expect(mimeData.data.length).toBe(17068);
  }
});

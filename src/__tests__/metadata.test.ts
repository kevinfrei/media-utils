import { ObjUtil } from '@freik/core-utils';
import { Attributes, Metadata } from '../index';
const log = false ? console.log : (a: unknown) => {};

it('From an mp3 file, Async', async () => {
  const filename = 'src/__tests__/01-quiet.mp3';
  const md = await Metadata.fromFileAsync(filename);
  expect(md).toEqual({
    artist: 'The Artist',
    year: '2003',
    album: 'No Album',
    track: '1',
    title: 'Silence [w- Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'The Artist',
    year: 2003,
    album: 'No Album',
    track: 1,
    title: 'Silence',
    moreArtists: ['Other Artist'],
  });
  const rmd = await Metadata.RawMetadata(filename);
  const hasComm = ObjUtil.has('common', rmd);
  const hasForm = ObjUtil.has('format', rmd);
  const hasNat = ObjUtil.has('native', rmd);
  expect(hasComm && hasForm && hasNat).toBeTruthy();
});
it('From an m4a file, Async', async () => {
  const filename = 'src/__tests__/01-quiet.m4a';
  const md = await Metadata.fromFileAsync(filename);
  expect(md).toEqual({
    artist: 'The Artist',
    year: '2003',
    album: 'No Album',
    track: '1',
    title: 'Silence [w- Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'The Artist',
    year: 2003,
    album: 'No Album',
    track: 1,
    title: 'Silence',
    moreArtists: ['Other Artist'],
  });
  const rmd = await Metadata.RawMetadata(filename);
  const hasComm = ObjUtil.has('common', rmd);
  const hasForm = ObjUtil.has('format', rmd);
  const hasNat = ObjUtil.has('native', rmd);
  expect(hasComm && hasForm && hasNat).toBeTruthy();
});
it('From a flac file, Async', async () => {
  const filename = 'src/__tests__/01-quiet.flac';
  const md = await Metadata.fromFileAsync(filename);
  expect(md).toEqual({
    artist: 'The Artist',
    year: '2003',
    album: 'No Album',
    track: '1',
    title: 'Silence [w- Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'The Artist',
    year: 2003,
    album: 'No Album',
    track: 1,
    title: 'Silence',
    moreArtists: ['Other Artist'],
  });
  const rmd = await Metadata.RawMetadata(filename);
  const hasComm = ObjUtil.has('common', rmd);
  const hasForm = ObjUtil.has('format', rmd);
  const hasNat = ObjUtil.has('native', rmd);
  expect(hasComm && hasForm && hasNat).toBeTruthy();
});
it('Generic path', () => {
  const filename = 'something/artist - 1983 - album/01 - title.m4a';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});
it('Generic path, Two Primary artists', () => {
  const filename =
    'something/artist 1 & artist 2 - 1983 - album/01 - title.m4a';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1 & artist 2',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2'],
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});
it('Generic path, Multiple Primary artists', () => {
  const filename =
    'something/artist 1, artist 2, artist 3 & artist 4 - 1983 - album/01 - title.m4a';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist 1, artist 2, artist 3 & artist 4',
    year: '1983',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: ['artist 1', 'artist 2', 'artist 3', 'artist 4'],
    year: 1983,
    album: 'album',
    track: 1,
    title: 'title',
  });
});
it('Generic path, no year', () => {
  const filename = 'something/artist - album/01 - title.mp3';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    album: 'album',
    track: '01',
    title: 'title',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    album: 'album',
    track: 1,
    title: 'title',
  });
});
it('Generic path, other artist', () => {
  const filename =
    'something/artist - 1983 - album/02 - title [feat- Other Artist].aac';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
  });
});
it('Generic path, 2 other artists', () => {
  const filename =
    'something/artist - 1983 - album/02 - title [feat- Other Artist 1 & Other Artist 2].aac';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1 & Other Artist 2]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist 1', 'Other Artist 2'],
  });
});
it('Generic path, multiple other artists', () => {
  const filename =
    'something/artist - 1983 - album/02 - title [feat- Other Artist 1, Other Artist 2 & Other Artist 3].aac';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    track: '02',
    title: 'title [feat- Other Artist 1, Other Artist 2 & Other Artist 3]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist 1', 'Other Artist 2', 'Other Artist 3'],
  });
});
it('VA, other artist', () => {
  const filename =
    'something/VA - 1983 - album/02 - artist - title [with Other Artist].flac';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '1983',
    album: 'album',
    compilation: 'va',
    track: '02',
    title: 'title [with Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 1983,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'va',
  });
});
it('Soundtrack, other artist', () => {
  const filename =
    'something/Soundtrack - 2001 - album/02 - artist - title [featuring Other Artist].m4a';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist',
    year: '2001',
    album: 'album',
    compilation: 'ost',
    track: '02',
    title: 'title [featuring Other Artist]',
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, (md as unknown) as Attributes);
  expect(fmd).toEqual({
    originalPath: filename,
    artist: 'artist',
    year: 2001,
    album: 'album',
    track: 2,
    title: 'title',
    moreArtists: ['Other Artist'],
    vaType: 'ost',
  });
});

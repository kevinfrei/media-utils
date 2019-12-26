// @format

const { Metadata } = require('./../../lib/index');
const log = false ? console.log : ((a) => { });

it('From an mp3 file, Async', async () => {
  const md = await Metadata.fromFileAsync('01-quiet.mp3');
  expect(md).toEqual({
    artist: 'The Artist', year: '2003', album: 'No Album',
    track: '01', title: 'Silence [w- Other Artist]'
  });
  log(md);
});
it('From an mp3 file', () => {
  const filename = '01-quiet.mp3';
  const md = Metadata.fromFile(filename);
  expect(md).toEqual({
    artist: 'The Artist', year: '2003', album: 'No Album',
    track: '01', title: 'Silence [w- Other Artist]'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'The Artist', Year: 2003, Album: 'No Album',
    Track: 1, Title: 'Silence', MoreArtists: ['Other Artist']
  });
});
it('From an m4a file, Async', async () => {
  const md = await Metadata.fromFileAsync('01-quiet.m4a');
  expect(md).toEqual({
    artist: 'The Artist', year: '2003', album: 'No Album',
    track: '1', title: 'Silence [w- Other Artist]'
  });
  log(md);
});
it('From an m4a file', () => {
  const filename = '01-quiet.m4a';
  const md = Metadata.fromFile(filename);
  expect(md).toEqual({
    artist: 'The Artist', year: '2003', album: 'No Album',
    track: '1', title: 'Silence [w- Other Artist]'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'The Artist', Year: 2003, Album: 'No Album',
    Track: 1, Title: 'Silence', MoreArtists: ['Other Artist']
  });
});
it('From a flac file, Async', async () => {
  const md = await Metadata.fromFileAsync('01-quiet.flac');
  expect(md).toEqual({
    artist: 'The Artist', year: '2003', album: 'No Album',
    track: '01', title: 'Silence [w- Other Artist]'
  });
  log(md);
});
it('From a flac file', () => {
  const filename = '01-quiet.flac';
  const md = Metadata.fromFile(filename);
  expect(md).toEqual({
    artist: 'The Artist', year: '2003', album: 'No Album',
    track: '01', title: 'Silence [w- Other Artist]'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'The Artist', Year: 2003, Album: 'No Album',
    Track: 1, Title: 'Silence', MoreArtists: ['Other Artist']
  });
});
it('Generic path', () => {
  const filename = 'something/artist - 1983 - album/01 - title.m4a';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist', year: '1983', album: 'album',
    track: '01', title: 'title'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'artist', Year: 1983, Album: 'album',
    Track: 1, Title: 'title'
  });
});
it('Generic path, no year', () => {
  const filename = 'something/artist - album/01 - title.mp3';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist', album: 'album',
    track: '01', title: 'title'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'artist', Album: 'album',
    Track: 1, Title: 'title'
  });
});
it('Generic path, other artist', () => {
  const filename = 'something/artist - 1983 - album/02 - title [feat- Other Artist].aac';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist', year: '1983', album: 'album',
    track: '02', title: 'title [feat- Other Artist]'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'artist', Year: 1983, Album: 'album',
    Track: 2, Title: 'title', MoreArtists: ['Other Artist']
  });
});
it('VA, other artist', () => {
  const filename = 'something/VA - 1983 - album/02 - artist - title [with Other Artist].flac';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist', year: '1983', album: 'album',
    compilation: 'va', track: '02', title: 'title [with Other Artist]'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'artist', Year: 1983, Album: 'album',
    Track: 2, Title: 'title', MoreArtists: ['Other Artist'],
    VAType: 'va'
  });
});
it('Soundtrack, other artist', () => {
  const filename = 'something/Soundtrack - 2001 - album/02 - artist - title [featuring Other Artist].m4a';
  const md = Metadata.fromPath(filename);
  expect(md).toEqual({
    artist: 'artist', year: '2001', album: 'album',
    compilation: 'ost', track: '02', title: 'title [featuring Other Artist]'
  });
  log(md);
  const fmd = Metadata.FullFromObj(filename, md);
  expect(fmd).toEqual({
    OriginalPath: filename,
    Artist: 'artist', Year: 2001, Album: 'album',
    Track: 2, Title: 'title', MoreArtists: ['Other Artist'],
    VAType: 'ost'
  });
});

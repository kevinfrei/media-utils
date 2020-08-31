// @flow
// @format
'use strict';

import path from 'path';
import ocp from 'child_process';

import { ObjUtil } from '@freik/core-utils';
import { ProcUtil } from '@freik/node-utils';

import type {
  SimpleMetadata,
  FullMetadata,
  attributes,
  regexPattern,
  mdAcquire,
  mdAcquireAsync,
} from './index';

import type { spawnResult } from '@freik/node-utils';

const cp = {
  spawnAsync: ProcUtil.spawnAsync,
  spawnSync: ocp.spawnSync,
};

let cwd: string = process.cwd();

export function setCwd(pathname: string) {
  cwd = pathname;
}

const patterns: regexPattern[] = [
  {
    compilation: 'va',
    rgx: /^(?:.*\/)?(?:(?:va(?:rious artists)?)) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { year: 1, album: 2, track: 3, artist: 4, title: 5 },
  },
  {
    compilation: 'va',
    rgx: /^(?:.*\/)?(?:(?:va(?:various artists)?)) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { album: 1, track: 2, artist: 3, title: 4 },
  },
  {
    compilation: 'ost',
    rgx: /^(?:.*\/)?(?:(?:ost)|(?:soundtrack)) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { year: 1, album: 2, track: 3, artist: 4, title: 5 },
  },
  {
    compilation: 'ost',
    rgx: /^(?:.*\/)?(?:(?:ost)|(?:soundtrack)) - ([^\/]+)\/(\d+)(?: [-\.])? ([^\/]+) - ([^\/]+)$/i,
    metadata: { album: 1, track: 2, artist: 3, title: 4 },
  },
  {
    rgx: /^(?:.*\/)?([^\/]+) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+)$/i,
    metadata: { artist: 1, year: 2, album: 3, track: 4, title: 5 },
  },
  {
    rgx: /^(?:.*\/)?([^\/]+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+)$/i,
    metadata: { artist: 1, album: 2, track: 3, title: 4 },
  },
];

const moreArtistsRE: RegExp = /\[(?:(?:w-)|(?:feat-)|(?:with)|(?:featuring)) (.*)\]/i;
const getArtists = (artists: string): string[] => {
  if (artists.indexOf(' & ') >= 0) {
    return artists.split(', ').join(' & ').split(' & ');
  } else {
    return [artists];
  }
};

// This should pull the [w- Someone & Somebody else] from the title, and
// stick it in the artists array
const pullArtistsFromTitle = (
  title: string,
): { title: string; artists: string[] } => {
  const match = title.match(moreArtistsRE);
  if (!match) {
    return { title, artists: [] };
  }
  const artists = getArtists(match[1]);
  title = title.replace(moreArtistsRE, '').trim();
  return { title, artists };
};

export function addPattern(
  rgx: RegExp,
  metadata: { [key: string]: number },
  compilation?: any,
) {
  if (compilation) {
    patterns.push({ rgx, metadata, compilation: true });
  } else {
    patterns.push({ rgx, metadata });
  }
}

export const fromPath: mdAcquire = (pthnm) => {
  let pathname = pthnm.replace(/\\/g, '/');

  // A little helper
  const makeMetaDataFromRegex = (
    pathnm: string,
    pattern: regexPattern,
  ): SimpleMetadata | void => {
    if (!pattern.rgx.test(pathnm)) {
      return;
    }
    const match = pattern.rgx.exec(pathnm);
    if (!match) {
      return;
    }
    const result: { [key: string]: string } = {};
    // Comment syntax because otherwise it confuses syntax highlighting :/
    for (const attr in pattern.metadata) {
      if (pattern.metadata.hasOwnProperty(attr)) {
        const index = pattern.metadata[attr];
        result[attr] = match[index];
      }
    }
    if (typeof pattern.compilation === 'string') {
      result.compilation = pattern.compilation;
    } else if (pattern.compilation === true) {
      result.compilation = 'va';
    }
    return (result as unknown) as SimpleMetadata;
  };

  let theExtension: string = path.extname(pathname);
  if (!theExtension || theExtension.length < 3) {
    return;
  }
  if (theExtension[0] === '.') {
    theExtension = theExtension.substr(1);
  }
  pathname = pathname.substr(0, pathname.length - 1 - theExtension.length);
  for (const pattern of patterns) {
    const result = makeMetaDataFromRegex(pathname, pattern);
    if (result) {
      return (result as unknown) as SimpleMetadata;
    }
  }
};

const fromFileArgs = (pathname: string): string[] => [
  ObjUtil.deQuote(
    '--Output=General;{"artist":"%Performer%",' +
      '"albumArtist":"%Album/Performer%",' +
      '"compilation":"%Compilation%",' +
      '"year":"%Recorded_Date%",' +
      '"album":"%Album%",' +
      '"track":"%Track/Position%",' +
      '"title":"%Title%"}',
  ),
  pathname,
];

const fromFileFinish = (
  res: spawnResult | ocp.SpawnSyncReturns<string>,
): SimpleMetadata | void => {
  if (res.error || res.status || res.stdout.length < 20) {
    return;
  }

  let readyForParsing: string = res.stdout.toString();
  readyForParsing = readyForParsing.replace(/[\x01-\x1f]/g, '');
  const metadata: { [key: string]: string } = ObjUtil.reQuote(readyForParsing);

  // Requirements: Album, Artist, Track, Title
  if (
    !metadata.title ||
    !metadata.track ||
    !metadata.artist ||
    !metadata.album
  ) {
    return;
  }
  const title = metadata.title.trim();
  const track = metadata.track.trim();
  const album = metadata.album.trim();
  let artist = metadata.artist.trim();
  const comp = metadata.compilation ? metadata.compilation.trim() : undefined;
  const year = metadata.year ? metadata.year.trim() : undefined;

  // There's some weirdnes WRT %Performer% sometimes...
  const split = artist.split(' / ');
  if (split.length === 2 && split[0] === split[1]) {
    artist = split[0].trim();
  } else if (split.length > 1) {
    // TODO: do something here, but not this:
    // console.log(artist);
  }

  if (metadata.albumArtist === '') {
    delete metadata.albumArtist;
  } else if (
    false &&
    metadata.albumArtist === metadata.artist &&
    metadata.albumArtist !== 'Various Artists'
  ) {
    delete metadata.albumArtist;
  }
  let compilation: 'va' | 'ost' | undefined;
  if (
    (comp && metadata.albumArtist) ||
    metadata.albumArtist === 'Various Artists' ||
    metadata.albumArtist === 'VA'
  ) {
    compilation = 'va';
  } else if (
    metadata.albumArtist === 'Soundtrack' ||
    metadata.albumArtist === 'ost'
  ) {
    compilation = 'ost';
  }

  if (compilation && year) {
    return { artist, album, year, track, title, compilation };
  } else if (compilation) {
    return { artist, album, track, title, compilation };
  } else if (year) {
    return { artist, album, track, title, year };
  } else {
    return { artist, album, track, title };
  }
};

export const fromFileAsync: mdAcquireAsync = async (pathname: string) =>
  fromFileFinish(
    await cp.spawnAsync('mediainfo', fromFileArgs(pathname), {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    }),
  );

export const fromFile: mdAcquire = (pathname: string) =>
  fromFileFinish(
    cp.spawnSync('mediainfo', fromFileArgs(pathname), {
      cwd,
      encoding: 'utf8',
    }),
  );

export function FullFromObj(
  file: string,
  data: attributes,
): FullMetadata | void {
  const res: FullMetadata = {
    OriginalPath: file,
    Artist: '',
    Album: '',
    Track: 0,
    Title: '',
  };
  /*    Year?: 0,
    VAType?: 'va',
    MoreArtists?: string[],
    Mix?: string[],
    Disk?: number,
    DiskOf?: number
*/
  if (
    !(data.hasOwnProperty('artist') || data.hasOwnProperty('albumArtist')) ||
    !data.hasOwnProperty('album') ||
    !data.hasOwnProperty('track') ||
    !data.hasOwnProperty('title')
  ) {
    return;
  }
  const theArtist = data.hasOwnProperty('albumArtist')
    ? data.albumArtist
    : data.artist;
  const artistArray = getArtists(theArtist);
  res.Artist = artistArray.length > 1 ? artistArray : theArtist;
  res.Album = data.album;
  res.Track = Number.parseInt(data.track, 10);
  const { title, artists } = pullArtistsFromTitle(data.title);
  res.Title = title;
  res.MoreArtists = artists;

  // Now add any additional data we've got
  if (data.hasOwnProperty('year')) {
    res.Year = Number.parseInt(data.year, 10);
  }
  if (data.hasOwnProperty('artist') && data.hasOwnProperty('albumArtist')) {
    if (data.artist !== data.albumArtist && res.MoreArtists) {
      res.MoreArtists.push(data.artist);
    }
  }
  if (data.hasOwnProperty('moreArtists') && res.MoreArtists) {
    res.MoreArtists = [...res.MoreArtists, ...data.moreArtists];
  } else if (res.MoreArtists && res.MoreArtists.length === 0) {
    delete res.MoreArtists;
  }
  if (data.compilation) {
    if (data.compilation === 'va') {
      res.VAType = 'va';
    } else if (data.compilation === 'ost') {
      res.VAType = 'ost';
    }
  }
  return res;
}

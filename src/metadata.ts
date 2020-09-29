import { FTONData } from '@freik/core-utils';
import { promises as fs } from 'fs';
import type { MediaInfo } from 'mediainfo.js';
import MediaInfoFactory from 'mediainfo.js';
import path from 'path';
import type {
  attributes,
  FullMetadata,
  mdAcquire,
  mdAcquireAsync,
  regexPattern,
  SimpleMetadata,
} from './index';

let mediainfo: MediaInfo | null = null;

function has<K extends string>(key: K, x: any): x is { [key in K]: unknown } {
  return key in x;
}

function hasStr<K extends string>(key: K, x: any): x is { [key in K]: string } {
  return has(key, x) && typeof x[key] === 'string';
}

function hasObj<K extends string>(key: K, x: any): x is { [key in K]: string } {
  return has(key, x) && typeof x[key] === 'object';
}

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

function checkVa(split: string[]): [artist: string, vatype?: 'ost' | 'va'] {
  if (split.length > 1) {
    if (split[0].toLowerCase().indexOf('various artists') === 0) {
      const [, ...theSplit] = split;
      return [theSplit.join(' / '), 'va'];
    }
    if (split[0].toLowerCase().indexOf('soundtrack') === 0) {
      const [, ...theSplit] = split;
      return [theSplit.join(' / '), 'ost'];
    }
  }
  return [split.join(' / ')];
}

const fromFileFinish = (res: {
  media: {
    '@ref': string;
    track: FTONData[];
  };
}): SimpleMetadata | void => {
  const metadata: FTONData = res.media.track[0];
  // Requirements: Album, Artist, Track, Title
  if (
    !metadata ||
    !hasStr('Title', metadata) ||
    !hasStr('Track_Position', metadata) ||
    !hasStr('Performer', metadata) ||
    !hasStr('Album', metadata)
  ) {
    return;
  }
  const title = metadata.Title.trim();
  const track = metadata.Track_Position.trim();
  const album = metadata.Album.trim();
  let artist = metadata.Performer.trim();
  let albumPerformer = hasStr('Album_Performer', metadata)
    ? metadata.Album_Performer.trim()
    : '';
  const year = hasStr('Recorded_Date', metadata)
    ? metadata.Recorded_Date.trim()
    : undefined;

  // There's some weirdnes WRT %Performer% sometimes...
  const asplit = artist.split(' / ');
  const psplit = albumPerformer?.split(' / ');

  if (asplit.length === 2 && asplit[0].trim() === asplit[1].trim()) {
    artist = asplit[0].trim();
  }

  let acomp;
  let pcomp;
  [artist, acomp] = checkVa(asplit);
  [albumPerformer, pcomp] = checkVa(psplit);
  const compilation = acomp ?? pcomp;
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

async function acquireMetadata(
  pathname: string,
): Promise<{
  media: { '@ref': string; track: { [key: string]: string }[] };
}> {
  let buffer: Uint8Array | null = null;
  let fileHandle: fs.FileHandle | null = null;
  let fileSize: number = 0;

  const readChunk = async (size: number, offset: number) => {
    if (!buffer || buffer.length !== size) {
      buffer = new Uint8Array(size);
    }
    await fileHandle!.read(buffer, 0, size, offset);
    return buffer;
  };
  try {
    fileHandle = await fs.open(pathname, 'r');
    fileSize = (await fileHandle.stat()).size;
    return (await mediainfo!.analyzeData(() => fileSize, readChunk)) as any;
  } catch (err) {
    throw err;
  } finally {
    if (fileHandle) {
      await fileHandle.close();
    }
  }
}

export const fromFileAsync: mdAcquireAsync = async (pathname: string) => {
  if (!mediainfo) {
    mediainfo = (await MediaInfoFactory({ format: 'object' })) as any;
  }
  const result = await acquireMetadata(pathname);
  return fromFileFinish(result);
};

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
    !(hasStr('artist', data) || hasStr('albumArtist', data)) ||
    !hasStr('album', data) ||
    !hasStr('track', data) ||
    !hasStr('title', data)
  ) {
    return;
  }
  const theArtist = hasStr('albumArtist', data)
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
  if (hasStr('year', data)) {
    res.Year = Number.parseInt(data.year, 10);
  }
  if (hasStr('artist', data) && hasStr('albumArtist', data)) {
    if (data.artist !== data.albumArtist && res.MoreArtists) {
      res.MoreArtists.push(data.artist);
    }
  }
  if (hasStr('moreArtists', data) && res.MoreArtists) {
    res.MoreArtists = [...res.MoreArtists, ...data.moreArtists];
  } else if (res.MoreArtists && res.MoreArtists.length === 0) {
    delete res.MoreArtists;
  }
  if (hasStr('compilation', data)) {
    if (data.compilation === 'va') {
      res.VAType = 'va';
    } else if (data.compilation === 'ost') {
      res.VAType = 'ost';
    }
  }
  return res;
}
import { FTON, FTONData, Type } from '@freik/core-utils';
import * as mm from 'music-metadata';
import path from 'path';
import type { RegexPattern, SimpleMetadata } from './index';

const patterns: RegexPattern[] = [
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

export function addPattern(
  rgx: RegExp,
  metadata: { [key: string]: number },
  compilation?: boolean,
): void {
  if (compilation) {
    patterns.push({ rgx, metadata, compilation: true });
  } else {
    patterns.push({ rgx, metadata });
  }
}

export function fromPath(pthnm: string): SimpleMetadata | void {
  let pathname = pthnm.replace(/\\/g, '/');

  // A little helper
  const makeMetaDataFromRegex = (
    pathnm: string,
    pattern: RegexPattern,
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
      if (Type.has(pattern.metadata, attr)) {
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
}

function checkVa(split: string[]): [string] | [string, 'ost' | 'va'] {
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

export declare type MetadataResult = {
  media: { '@ref': string; track: { [key: string]: string }[] };
};

async function acquireMetadata(pathname: string): Promise<mm.IAudioMetadata> {
  return await mm.parseFile(pathname, { skipCovers: true });
}

export async function RawMetadata(pathname: string): Promise<FTONData> {
  const md = await acquireMetadata(pathname);
  return FTON.filter(md);
}

export async function fromFileAsync(
  pathname: string,
): Promise<SimpleMetadata | void> {
  const allMetadata = await RawMetadata(pathname);
  // Requirements: Album, Artist, Track, Title
  if (!Type.has(allMetadata, 'common')) {
    return;
  }
  const metadata = allMetadata.common;
  if (
    !metadata ||
    !Type.hasStr(metadata, 'title') ||
    !Type.hasStr(metadata, 'album') ||
    !Type.hasStr(metadata, 'artist') ||
    !Type.has(metadata, 'track') ||
    !Type.has(metadata.track, 'no') ||
    !Type.isNumber(metadata.track.no)
  ) {
    return;
  }
  const title = metadata.title.trim();
  const track = metadata.track.no.toString();
  const album = metadata.album.trim();
  let artist = metadata.artist.trim();
  // TODO: This isn't configured for the new metadata module I've switched to
  let albumPerformer = Type.hasStr(metadata, 'Album_Performer')
    ? metadata.Album_Performer.trim()
    : '';
  const year =
    Type.has(metadata, 'year') && Type.isNumber(metadata.year)
      ? metadata.year.toString()
      : undefined;

  // There's some weirdnes WRT %Performer% sometimes...
  const asplit = artist.split(' / ');
  const psplit = albumPerformer?.split(' / ');

  if (asplit.length === 2 && asplit[0].trim() === asplit[1].trim()) {
    artist = asplit[0].trim();
  }

  const [updateArtist, acomp] = checkVa(asplit);
  artist = updateArtist;
  const [updateAlbumPerformer, pcomp] = checkVa(psplit);
  albumPerformer = updateAlbumPerformer;
  const compilation = acomp ?? pcomp;
  if (compilation) {
    return { artist, album, year, track, title, compilation };
  } else {
    return { artist, album, year, track, title };
  }
}

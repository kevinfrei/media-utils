import { SimpleObject, Type } from '@freik/core-utils';
import { SimpleMetadata } from '@freik/media-core';
import { IAudioMetadata, parseFile } from 'music-metadata';

export * from '@freik/media-core';

export declare type MetadataResult = {
  media: { '@ref': string; track: { [key: string]: string }[] };
};

async function acquireMetadata(pathname: string): Promise<IAudioMetadata> {
  return await parseFile(pathname, { skipCovers: true });
}

export async function RawMetadata(pathname: string): Promise<SimpleObject> {
  try {
    const md = await acquireMetadata(pathname);
    return Type.asSimpleObject(md);
  } catch (err) {
    if (err instanceof Error) {
      return { error: { name: err.name, message: err.message } };
    } else if (Type.isString(err)) {
      return { error: err };
    } else {
      return { error: 'Unknown error' };
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

export async function FromFileAsync(
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
  const track = metadata.track.no.toString().trim();
  const album = metadata.album.trim();
  let artist = metadata.artist.trim();
  // TODO: This isn't configured for the new metadata module I've switched to
  let albumPerformer = Type.hasStr(metadata, 'Album_Performer')
    ? metadata.Album_Performer.trim()
    : '';

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
  const result: SimpleMetadata = {
    artist,
    album,
    track,
    title,
  };
  const compilation = acomp ?? pcomp;
  if (compilation) {
    result.compilation = compilation;
  }
  if (Type.has(metadata, 'year') && Type.isNumber(metadata.year)) {
    result.year = metadata.year.toString();
  }
  if (Type.has(metadata, 'disk') && Type.hasStr(metadata.disk, 'no')) {
    result.discNum = metadata.disk.no.toString().trim();
  }
  return result;
}

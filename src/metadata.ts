import { FTON, FTONData, Type } from '@freik/core-utils';
import { Schema } from '@freik/media-core';
import * as mm from 'music-metadata';
export * from '@freik/media-core';
type SimpleMetadata = Schema.SimpleMetadata;

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

import { SimpleMetadata } from '@freik/media-core';
import { FileUtil } from '@freik/node-utils';
import {
  SimpleObject,
  asSimpleObject,
  hasField,
  hasFieldType,
  hasStrField,
  isNumber,
  isString,
} from '@freik/typechk';
import { promises as fsp } from 'fs';
import { IAudioMetadata, parseFile } from 'music-metadata';
import path from 'path';

export * from '@freik/media-core';

export declare type MetadataResult = {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  media: { '@ref': string; track: { [key: string]: string }[] };
};

async function acquireMetadata(pathname: string): Promise<IAudioMetadata> {
  // Adding support for EMP files:
  if (pathname.toLocaleLowerCase().endsWith('.emp')) {
    const info = (
      await fsp.readFile(pathname, { encoding: 'utf8' })
    ).toString();
    const pointer: unknown = JSON.parse(info);
    if (hasFieldType(pointer, 'original', isString)) {
      const realPath = path.resolve(path.dirname(pathname), pointer.original);
      return await parseFile(realPath, { skipCovers: true });
      // TODO: Deep-copy the metadata info from "pointer" onto original md
      // (overriding anything that exists in the EMP JSON file)
    }
  }
  return await parseFile(pathname, { skipCovers: true });
}

export async function RawMetadata(pathname: string): Promise<SimpleObject> {
  try {
    const md = await acquireMetadata(pathname);
    return asSimpleObject(md);
  } catch (err) {
    /* istanbul ignore next */
    if (err instanceof Error) {
      return { error: { name: err.name, message: err.message } };
    } else if (isString(err)) {
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
  if (!hasField(allMetadata, 'common')) {
    /* istanbul ignore next */
    return;
  }
  const metadata = allMetadata.common;
  if (
    !metadata ||
    !hasStrField(metadata, 'title') ||
    !hasStrField(metadata, 'album') ||
    !hasStrField(metadata, 'artist') ||
    !hasField(metadata, 'track') ||
    !hasFieldType(metadata.track, 'no', isNumber)
  ) {
    /* istanbul ignore next */
    return;
  }
  const title = metadata.title.trim();
  const track = metadata.track.no.toString().trim();
  const album = metadata.album.trim();
  let artist = metadata.artist.trim();
  // TODO: This isn't configured for the new metadata module I've switched to
  let albumPerformer = hasStrField(metadata, 'Album_Performer')
    ? metadata.Album_Performer.trim()
    : '';

  // There's some weirdnes WRT %Performer% sometimes...
  const asplit = artist.split(' / ');
  const psplit = albumPerformer?.split(' / ');

  if (asplit.length === 2 && asplit[0].trim() === asplit[1].trim()) {
    /* istanbul ignore next */
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
    /* istanbul ignore next */
    result.compilation = compilation;
  }
  if (hasFieldType(metadata, 'year', isNumber)) {
    result.year = metadata.year.toString();
  }
  if (hasField(metadata, 'disk') && hasStrField(metadata.disk, 'no')) {
    /* istanbul ignore next */
    result.discNum = metadata.disk.no.toString().trim();
  }
  return result;
}

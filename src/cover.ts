import { MimeData } from '@freik/media-core';
import { promises as fs } from 'fs';
import * as mm from 'music-metadata';

async function AcquireMetadata(pathname: string): Promise<mm.IAudioMetadata> {
  return await mm.parseFile(pathname);
}

const mime2suffix = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
]);

/*
const header2mime = new Map<string, string>([
  ['/9j/4A', 'image/jpeg'],
  ['iVBORw', 'image/png'],
  ['R0lGOD', 'image/gif'],
]);
*/

export async function ReadFromFile(
  audioFile: string,
): Promise<MimeData | void> {
  const { common } = await AcquireMetadata(audioFile);
  const cover = mm.selectCover(common.picture);
  if (!cover) return;
  return {
    data: cover.data.toString('base64'),
    type: cover?.format,
  };
}

export async function ToFile(
  audioFile: string,
  outputFileNoSuffix: string,
): Promise<string | void> {
  const data = await ReadFromFile(audioFile);
  if (!data) return;
  const info = mime2suffix.get(data.type);
  const fileName = outputFileNoSuffix + (info ?? '');
  await fs.writeFile(fileName, data.data, 'base64');
  return fileName;
}

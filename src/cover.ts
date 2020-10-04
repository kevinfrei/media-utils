import { ObjUtil } from '@freik/core-utils';
import { promises as fs } from 'fs';
import type { MediaInfo } from 'mediainfo.js';
import MediaInfoFactory from 'mediainfo.js';
import { MimeData } from './index';
import { MetadataResult } from './metadata';

let mediainfo: MediaInfo | null = null;

async function getMediaInfo(): Promise<void> {
  if (!mediainfo) {
    mediainfo = ((await MediaInfoFactory({
      coverData: true,
      format: 'object',
    })) as any) as MediaInfo;
  }
}

async function acquireMetadata(pathname: string): Promise<MetadataResult> {
  await getMediaInfo();
  let buffer: Uint8Array | null = null;
  let fileHandle: fs.FileHandle | null = null;
  let fileSize = 0;

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
    return ((await mediainfo!.analyzeData(
      () => fileSize,
      readChunk,
    )) as any) as MetadataResult;
  } catch (err) {
    throw err;
  } finally {
    if (fileHandle) {
      await fileHandle.close();
    }
  }
}

const mime2suffix = new Map<string, string>([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/gif', '.gif'],
]);

const header2mime = new Map<string, string>([
  ['/9j/4A', 'image/jpeg'],
  ['iVBORw', 'image/png'],
  ['R0lGOD', 'image/gif'],
]);

export async function readFromFile(
  audioFile: string,
): Promise<MimeData | void> {
  const {
    media: {
      track: [generalData],
    },
  } = await acquireMetadata(audioFile);
  // We need at least this...
  if (
    !ObjUtil.hasStr('Cover', generalData) ||
    !ObjUtil.hasStr('Cover_Data', generalData)
  ) {
    return;
  }
  // For most types, we also get a type & mime type
  if (
    ObjUtil.hasStr('Cover_Type', generalData) &&
    ObjUtil.hasStr('Cover_Mime', generalData)
  ) {
    return { type: generalData.Cover_Mime, data: generalData.Cover_Data };
  }
  // For mp4 audio, we have to figure out the mime type. code is a total cheat
  const firstFew = generalData.Cover_Data.substr(0, 6);
  return {
    type: header2mime.get(firstFew) ?? 'image/unknown',
    data: generalData.Cover_Data,
  };
}

export async function toFile(
  audioFile: string,
  outputFileNoSuffix: string,
): Promise<string | void> {
  const data = await readFromFile(audioFile);
  if (!data) return;
  const info = mime2suffix.get(data.type);
  const fileName = outputFileNoSuffix + (info ?? '');
  await fs.writeFile(fileName, data.data, 'base64');
  return fileName;
}

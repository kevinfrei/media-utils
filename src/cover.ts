import { promises as fs } from 'fs';
import type { MediaInfo } from 'mediainfo.js';
import MediaInfoFactory from 'mediainfo.js';
import { MetadataResult } from './metadata';

let mediainfo: MediaInfo | null = null;

async function getMediaInfo() {
  if (!mediainfo) {
    mediainfo = ((await MediaInfoFactory({
      coverData: true,
      format: 'object',
    })) as any) as MediaInfo;
  }
}

async function acquireMetadata(pathname: string): Promise<MetadataResult> {
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

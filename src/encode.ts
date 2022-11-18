/* eslint-disable @typescript-eslint/naming-convention */
// Module:
// media/encode
// Provides wav file to compressed audio file tools
// Everything is synchronous currently

import { Type } from '@freik/core-utils';
import { Attributes, SimpleMetadata } from '@freik/media-core';
import { ProcUtil } from '@freik/node-utils';
import type { Encoder, EncoderAsync } from './index.js';

function prefixObj(str: string, obj: { [key: string]: string }): string[] {
  const res: string[] = [];
  for (const elem of Object.keys(obj)) {
    res.push(str + elem);
    if (obj[elem] !== null) {
      res.push(obj[elem]);
    }
  }
  return res;
}

function makeM4aArgs(
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
): string[] {
  let args: string[] = ['-w', '-o', outputFilename];
  if (options) {
    args = args.concat(prefixObj('-', options));
  }
  if (attrs) {
    args = args.concat(prefixObj('--', attrs as Attributes));
  }
  args.push(wavFile);
  return args;
}

const M4a: Encoder = (wavFile, outputFilename, options, attrs) => {
  const args = makeM4aArgs(wavFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('faac', args);
};

const M4aAsync: EncoderAsync = async (
  wavFile,
  outputFilename,
  options,
  attrs,
) => {
  const args = makeM4aArgs(wavFile, outputFilename, options, attrs);
  return await ProcUtil.spawnResAsync('faac', args);
};

// How to add cover images to the .m4a file:
// https://stackoverflow.com/questions/17798709/ffmpeg-how-to-embed-cover-art-image-to-m4a
const makeFfmpegArgs = (
  inputFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
  coverImage?: string,
): string[] => {
  // plus '-c:a', 'aac', '-cutoff', '16000'  in some world
  let args: string[] = ['-i', inputFile, '-vn'];
  if (options) {
    args = [...args, ...prefixObj('-', options)];
  }
  if (attrs) {
    for (const elem in attrs) {
      if (Type.hasStr(attrs, elem)) {
        const data: string = (attrs as any)[elem]; // eslint-disable-line
        args.push('-metadata');
        args.push(elem + '=' + data);
      }
    }
  }
  args.push(outputFilename);
  return args;
};

const Ffmpeg: Encoder = (
  inputFile,
  outputFilename,
  options,
  attrs,
  coverImage,
) => {
  const args = makeFfmpegArgs(
    inputFile,
    outputFilename,
    options,
    attrs,
    coverImage,
  );
  return ProcUtil.spawnRes('ffmpeg', args);
};

const FfmpegAsync: EncoderAsync = async (
  inputFile,
  outputFilename,
  options,
  attrs,
  coverImage,
) => {
  const args = makeFfmpegArgs(
    inputFile,
    outputFilename,
    options,
    attrs,
    coverImage,
  );
  return await ProcUtil.spawnResAsync('ffmpeg', args);
};

const makeFlacArgs = (
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
): string[] => {
  let args: string[] = [
    '--best',
    '-m',
    '-r',
    '8',
    '-e',
    '-p',
    '-o',
    outputFilename,
  ];
  if (options) {
    args = args.concat(prefixObj('-', options));
  }
  if (attrs) {
    if (Type.has(attrs, 'compilation')) {
      // There's no compilation tag that I know of.
      delete attrs.compilation;
    }
    const att: Attributes | SimpleMetadata | void = attrs;
    if (
      Type.isObject(att) &&
      Type.has(att, 'track') &&
      Type.isNumberOrString(att.track)
    ) {
      const trnum = att.track;
      delete att.track;
      att.tracknumber = trnum.toString();
    }
    const attrArray = prefixObj('--tag=', att);
    for (let i = 0; i < attrArray.length; i += 2) {
      args.push(attrArray[i] + '=' + attrArray[i + 1]);
    }
  }
  args.push(wavFile);
  return args;
};

const Flac: Encoder = (wavFile, outputFilename, options, attrs) => {
  const args = makeFlacArgs(wavFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('flac', args);
};

const FlacAsync: EncoderAsync = async (
  wavFile,
  outputFilename,
  options,
  attrs,
) => {
  const args = makeFlacArgs(wavFile, outputFilename, options, attrs);
  return await ProcUtil.spawnResAsync('flac', args);
};

export {
  M4a as Aac,
  M4a,
  Flac,
  Ffmpeg,
  M4aAsync,
  M4aAsync as AacAsync,
  FlacAsync,
  FfmpegAsync,
};

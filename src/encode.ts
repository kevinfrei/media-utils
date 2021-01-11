// Module:
// media/encode
// Provides wav file to compressed audio file tools
// Everything is synchronous currently

import { ProcUtil } from '@freik/node-utils';
import { Attributes, ObjUtil, SimpleMetadata, Type } from '@freik/core-utils';

import type { Encoder, EncoderAsync } from './index';

const makeM4aArgs = (
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
): string[] => {
  let args: string[] = ['-w', '-o', outputFilename];
  if (options) {
    args = args.concat(ObjUtil.prefixObj('-', options));
  }
  if (attrs) {
    args = args.concat(ObjUtil.prefixObj('--', attrs as Attributes));
  }
  args.push(wavFile);
  return args;
};

const m4a: Encoder = (wavFile, outputFilename, options, attrs) => {
  const args = makeM4aArgs(wavFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('faac', args);
};

const m4aAsync: EncoderAsync = async (
  wavFile,
  outputFilename,
  options,
  attrs,
) => {
  const args = makeM4aArgs(wavFile, outputFilename, options, attrs);
  return await ProcUtil.spawnResAsync('faac', args);
};

const makeFfmpegArgs = (
  inputFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
): string[] => {
  // plus '-c:a', 'aac', '-cutoff', '16000'  in some world
  let args: string[] = ['-i', inputFile, '-vn'];
  if (options) {
    args = [...args, ...ObjUtil.prefixObj('-', options)];
  }
  if (attrs) {
    for (const elem in attrs) {
      if (Type.hasStr(attrs, elem)) {
        args.push('-metadata');
        args.push(elem + '=' + attrs[elem]);
      }
    }
  }
  args.push(outputFilename);
  return args;
};

const ffmpeg: Encoder = (inputFile, outputFilename, options, attrs) => {
  const args = makeFfmpegArgs(inputFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('ffmpeg', args);
};

const ffmpegAsync: EncoderAsync = async (
  inputFile,
  outputFilename,
  options,
  attrs,
) => {
  const args = makeFfmpegArgs(inputFile, outputFilename, options, attrs);
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
    args = args.concat(ObjUtil.prefixObj('-', options));
  }
  if (attrs) {
    if (Type.has(attrs, 'compilation')) {
      // There's no compilation tag that I know of.
      delete attrs.compilation;
    }
    const att = attrs as Attributes;
    if (Type.isObject(att) && attrs.hasOwnProperty('track')) {
      const trnum = att.track;
      delete att.track;
      att.tracknumber = trnum;
    }
    const attrArray = ObjUtil.prefixObj('--tag=', att);
    for (let i = 0; i < attrArray.length; i += 2) {
      args.push(attrArray[i] + '=' + attrArray[i + 1]);
    }
  }
  args.push(wavFile);
  return args;
};

const flac: Encoder = (wavFile, outputFilename, options, attrs) => {
  const args = makeFlacArgs(wavFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('flac', args);
};

const flacAsync: EncoderAsync = async (
  wavFile,
  outputFilename,
  options,
  attrs,
) => {
  const args = makeFlacArgs(wavFile, outputFilename, options, attrs);
  return await ProcUtil.spawnResAsync('flac', args);
};

export {
  m4a as aac,
  m4a,
  flac,
  ffmpeg,
  m4aAsync,
  m4aAsync as aacAsync,
  flacAsync,
  ffmpegAsync,
};

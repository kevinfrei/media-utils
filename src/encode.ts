/* eslint-disable @typescript-eslint/naming-convention */
// Module:
// media/encode
// Provides wav file to compressed audio file tools
// Everything is synchronous currently

import { ProcUtil } from '@freik/node-utils';
import { ObjUtil, Type } from '@freik/core-utils';
import { Schema } from '@freik/media-core';
import type { Encoder, EncoderAsync } from './index';

type Attributes = Schema.Attributes;
type SimpleMetadata = Schema.SimpleMetadata;
function makeM4aArgs(
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
): string[] {
  let args: string[] = ['-w', '-o', outputFilename];
  if (options) {
    args = args.concat(ObjUtil.prefixObj('-', options));
  }
  if (attrs) {
    args = args.concat(ObjUtil.prefixObj('--', attrs as Attributes));
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
        const data: string = (attrs as any)[elem]; // eslint-disable-line
        args.push('-metadata');
        args.push(elem + '=' + data);
      }
    }
  }
  args.push(outputFilename);
  return args;
};

const Ffmpeg: Encoder = (inputFile, outputFilename, options, attrs) => {
  const args = makeFfmpegArgs(inputFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('ffmpeg', args);
};

const FfmpegAsync: EncoderAsync = async (
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
    const att = attrs;
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

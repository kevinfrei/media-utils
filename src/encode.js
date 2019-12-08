// @flow
// @format
'use strict';

// Module:
// media/encode
// Provides wav file to compressed audio file tools
// Everything is synchronous currently

const { ProcUtil } = require('my-node-utils');
const { ObjUtil } = require('my-utils');

import type { encoder, encoderAsync } from './index';

const makeM4aArgs = (wavFile, outputFilename, options, attrs): Array<string> => {
  let args: Array<string> = ['-w', '-o', outputFilename];
  if (options) {
    args = args.concat(ObjUtil.prefixObj('-', options));
  }
  if (attrs) {
    args = args.concat(ObjUtil.prefixObj('--', attrs));
  }
  args.push(wavFile);
  return args;
}

const m4a: encoder = (wavFile, outputFilename, options, attrs) => {
  const args = makeM4aArgs(wavFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('faac', args, { encoding: 'utf8' });
};

const m4aAsync: encoderAsync = async (wavFile, outputFilename, options, attrs) => {
  const args = makeM4aArgs(wavFile, outputFilename, options, attrs);
  return await ProcUtil.spawnResAsync('faac', args, { encoding: 'utf8' });
};

const makeFfmpegArgs = (inputFile, outputFilename, options, attrs): Array<string> => {
  let args: Array<string> = ['-i', inputFile, '-vn'];//, '-c:a', 'aac', '-cutoff', '16000' ];
  if (options) {
    args = [...args, ...ObjUtil.prefixObj('-', options)];
  }
  if (attrs) {
    for (let elem/*: string*/ in attrs) {
      if (attrs.hasOwnProperty(elem)) {
        args.push('-metadata');
        args.push(elem + '=' + attrs[elem]);
      }
    }
  }
  args.push(outputFilename);
  return args;
}

const ffmpeg: encoder = (inputFile, outputFilename, options, attrs) => {
  const args = makeFfmpegArgs(inputFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('ffmpeg', args, { encoding: 'utf8' });
};

const ffmpegAsync: encoderAsync = async (inputFile, outputFilename, options, attrs) => {
  const args = makeFfmpegArgs(inputFile, outputFilename, options, attrs);
  return await ProcUtil.spawnResAsync('ffmpeg', args, { encoding: 'utf8' });
};

const makeFlacArgs = (wavFile, outputFilename, options, attrs): Array<string> => {
  let args: Array<string> = [
    '--best',
    '-m',
    '-r',
    '8',
    '-e',
    '-p',
    '-o',
    outputFilename
  ];
  if (options) {
    args = args.concat(ObjUtil.prefixObj('-', options));
  }
  if (attrs) {
    if (attrs.hasOwnProperty('compilation')) {
      // There's no compilation tag that I know of.
      delete attrs.compilation;
    }
    if (attrs.hasOwnProperty('track')) {
      const trnum = attrs.track;
      delete attrs.track;
      attrs.tracknumber = trnum;
    }
    const attrArray = ObjUtil.prefixObj('--tag=', attrs);
    for (let i = 0; i < attrArray.length; i += 2) {
      args.push(attrArray[i] + '=' + attrArray[i + 1]);
    }
  }
  args.push(wavFile);
  return args;
}

const flac: encoder = (wavFile, outputFilename, options, attrs) => {
  const args = makeFlacArgs(wavFile, outputFilename, options, attrs);
  return ProcUtil.spawnRes('flac', args, { encoding: 'utf8' });
};

const flacAsync: encoderAsync = async (wavFile, outputFilename, options, attrs) => {
  const args = makeFlacArgs(wavFile, outputFilename, options, attrs);
  return await ProcUtil.spawnResAsync('flac', args, { encoding: 'utf8' });
};

module.exports = {
  aac: m4a,
  aacAsync: m4aAsync,
  m4a,
  m4aAsync,
  flac,
  flacAsync,
  ffmpeg,
  ffmpegAsync
}

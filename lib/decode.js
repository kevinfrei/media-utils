// @format
'use strict'; // Module:
// media/decode
// Provides compressed audio to wav file tools
// Everything is synchronous currently

const path = require('path');

const {
  ProcUtil,
  PathUtil
} = require('@freik/node-utils');

const mp3 = (inputFile, outputFile) => ProcUtil.spawnRes('lame', ['--quiet', '--decode', inputFile, outputFile]);

const mp3Async = async (inputFile, outputFile) => ProcUtil.spawnResAsync('lame', ['--quiet', '--decode', inputFile, outputFile]);

const flac = (inputFile, outputFile) => ProcUtil.spawnRes('flac', ['-d', inputFile, '-o', outputFile]);

const flacAsync = async (inputFile, outputFile) => ProcUtil.spawnResAsync('flac', ['-d', inputFile, '-o', outputFile]);

const aac = (inputFile, outputFile) => ProcUtil.spawnRes('faad', ['-o', outputFile, inputFile]);

const aacAsync = async (inputFile, outputFile) => ProcUtil.spawnResAsync('faad', ['-o', outputFile, inputFile]);

const ffmpeg = (inputFile, outputFile) => ProcUtil.spawnRes('ffmpeg', ['-i', inputFile, outputFile]);

const ffmpegAsync = async (inputFile, outputFile) => ProcUtil.spawnResAsync('ffmpeg', ['-i', inputFile, outputFile]); // K: we know we need to convert it.
// First convert it to a .wav file


const makeWave = (inputFile, fileType) => {
  const wavConvert = {
    mp3,
    flac,
    wma: ffmpeg,
    mp4: aac,
    aac,
    m4a: aac,
    m4b: aac
  };

  if (!fileType) {
    fileType = path.extname(inputFile);
  }

  if (fileType.length > 0 && fileType[0] === '.') {
    fileType = fileType.substr(1);
  }

  if (fileType.length < 1) {
    return;
  }

  if (fileType === 'wav') {
    return inputFile;
  }

  const tmpFile = PathUtil.getTemp('decode', 'wav');

  if (wavConvert[fileType] === undefined) {
    throw new Error('Unknown file type:' + fileType);
  }

  if (wavConvert[fileType](inputFile, tmpFile)) {
    return tmpFile;
  }
}; // K: we know we need to convert it.
// First convert it to a .wav file


const makeWaveAsync = async (inputFile, fileType) => {
  const wavConvert = {
    mp3: mp3Async,
    flac: flacAsync,
    wma: ffmpegAsync,
    mp4: aacAsync,
    aac: aacAsync,
    m4a: aacAsync,
    m4b: aacAsync
  };

  if (!fileType) {
    fileType = path.extname(inputFile);
  }

  if (fileType.length > 0 && fileType[0] === '.') {
    fileType = fileType.substr(1);
  }

  if (fileType.length < 1) {
    return;
  }

  if (fileType === 'wav') {
    return inputFile;
  }

  const tmpFile = PathUtil.getTemp('decode', 'wav');

  if (wavConvert[fileType] === undefined) {
    throw new Error('Unknown file type:' + fileType);
  }

  if (await wavConvert[fileType](inputFile, tmpFile)) {
    return tmpFile;
  }
};

module.exports = {
  m4a: aac,
  m4aAsync: aacAsync,
  mp3,
  mp3Async,
  flac,
  flacAsync,
  wma: ffmpeg,
  wmaAsync: ffmpegAsync,
  aac,
  aacAsync,
  ffmpeg,
  ffmpegAsync,
  makeWave,
  makeWaveAsync
};
//# sourceMappingURL=decode.js.map
// @flow
// @format
'use strict';

const Decode = require('./decode');
const Encode = require('./encode');
const Metadata = require('./metadata');

export type attributes = { [key: string]: string };
export type SimpleMetadata = {
  artist: string,
  album: string,
  year?: string,
  track: string,
  title: string,
  compilation?: 'va' | 'ost'
};
export type regexPattern = {
  compilation?: string | boolean,
  rgx: RegExp,
  metadata: { [key: string]: number }
};
export type mdAcquire = (pathname: string) => ?SimpleMetadata;
export type mdAcquireAsync = (pathname: string) => Promise<?SimpleMetadata>
export type decoder = (inputFile: string, outputFile: string) => boolean;
export type decoderAsync =  (inputFile: string, outputFile: string) => Promise<boolean>;
export type encoder = (
  wavFile: string,
  outputFilename: string,
  options: ?attributes,
  attrs: ?attributes
) => boolean;
export type encoderAsync = (
  wavFile: string,
  outputFilename: string,
  options: ?attributes,
  attrs: ?attributes
) => Promise<boolean>;
export type FullMetadata = {
  OriginalPath: string,
  Artist: string,
  Album: string,
  Year?: number,
  Track: number,
  Title: string,
  VAType?: 'va' | 'ost',
  MoreArtists?: Array<string>,
  Mix?: Array<string>,
  Disk?: number,
  DiskOf?: number
};

module.exports = {
  Encode,
  encoders: Encode,
  Decode,
  decoders: Decode,
  Metadata,
  md: Metadata
};

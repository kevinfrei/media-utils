// @flow
// @format
'use strict';

const Decode = require('./decode');
const Encode = require('./encode');
const Metadata = require('./metadata');

// This is a helper type used in a few places
export type attributes = { [key: string]: string };

// This is the most simplistic strongly typed metadata you'll find
export type SimpleMetadata = {
  artist: string,
  album: string,
  year?: string,
  track: string,
  title: string,
  compilation?: 'va' | 'ost'
};

// This is a more robust metadata type, meant to be used in,
// among other scenarios, situations where you're moving files around
export type FullMetadata = {
  OriginalPath: string,
  Artist: Array<string> | string,
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

// This is a general mechanism for describing how to extract
// various metadata components out of a file path
export type regexPattern = {
  // This can be something like "soundtrack"
  // or "true/false" to simply indicate that it's
  // a compilation of works by various artists
  compilation?: string | boolean,
  // This is the regular expression to match
  rgx: RegExp,
  // These are the names of the metadata fields
  // and their corresponding RegExp capture numbers
  metadata: { [key: string]: number }
};

// A function type for metadata acquisition
export type mdAcquire = (pathname: string) => ?SimpleMetadata;

// Same thing, but async...
export type mdAcquireAsync = (pathname: string) => Promise<?SimpleMetadata>

// A function type for decoding audio
export type decoder = (inputFile: string, outputFile: string) => boolean;

// Ditto, async
export type decoderAsync =  (inputFile: string, outputFile: string) => Promise<boolean>;

// A function type for encoding audio
export type encoder = (
  wavFile: string,
  outputFilename: string,
  options: ?attributes,
  attrs: ?attributes
) => boolean;

// Ditto, async
export type encoderAsync = (
  wavFile: string,
  outputFilename: string,
  options: ?attributes,
  attrs: ?attributes
) => Promise<boolean>;


module.exports = {
  Encode,
  encoders: Encode,
  Decode,
  decoders: Decode,
  Metadata,
  md: Metadata
};

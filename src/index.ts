export * as Covers from './cover';
export * as Decode from './decode';
export * as Encode from './encode';
import {
  Attributes,
  Metadata as oldMetadata,
  SimpleMetadata,
} from '@freik/media-core';
import * as newMetadata from './metadata';

// A function type for decoding audio
export type Decoder = (inputFile: string, outputFile: string) => boolean;

// Ditto, async
export type DecoderAsync = (
  inputFile: string,
  outputFile: string,
) => Promise<boolean>;

// A function type for encoding audio
export type Encoder = (
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes,
) => boolean;

// Ditto, async
export type EncoderAsync = (
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
) => Promise<boolean>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Metadata = { ...newMetadata, ...oldMetadata };

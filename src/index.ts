export * as Decode from './decode';
export * as Encode from './encode';
import * as oldMetadata from './metadata';
export * as Covers from './cover';
import { Media, Schema } from '@freik/media-core';

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
  options?: Schema.Attributes,
  attrs?: Schema.Attributes,
) => boolean;

// Ditto, async
export type EncoderAsync = (
  wavFile: string,
  outputFilename: string,
  options?: Schema.Attributes,
  attrs?: Schema.Attributes | Schema.SimpleMetadata,
) => Promise<boolean>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Metadata = { ...oldMetadata, ...Media };

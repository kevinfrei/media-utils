/* eslint-disable @typescript-eslint/naming-convention */
export * as Covers from './cover.js';
export * as Decode from './decode.js';
export * as Encode from './encode.js';
import {
  Attributes,
  Metadata as oldMetadata,
  SimpleMetadata,
  FullMetadata,
} from '@freik/media-core';
import * as newMetadata from './metadata.js';
import { SimpleObject, typecheck } from '@freik/typechk';

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
  coverImage?: string,
) => boolean;

// Ditto, async
export type EncoderAsync = (
  wavFile: string,
  outputFilename: string,
  options?: Attributes,
  attrs?: Attributes | SimpleMetadata,
  coverImage?: string,
) => Promise<boolean>;

type MetadataType = {
  FromFileAsync: (pathname: string) => Promise<SimpleMetadata | void>;
  RawMetadata: (pathname: string) => Promise<SimpleObject>;
  isSimpleMetadata: typecheck<SimpleMetadata>;
  AddPattern: (rgx: RegExp, compilation?: 'ost' | 'va') => void;
  FromPath: (pthnm: string) => SimpleMetadata | void;
  SplitArtistString: (artists: string) => string[];
  FullFromObj: (file: string, data: Attributes) => FullMetadata | void;
};

export const Metadata: MetadataType = { ...newMetadata, ...oldMetadata };

import * as Decode from './decode';
import * as Encode from './encode';
import * as metadata from './metadata';
import * as Cover from './cover';
import { Attributes, Media as WebSafe } from '@freik/core-utils';

// eslint-disable-next-line @typescript-eslint/naming-convention
const Metadata = { ...metadata, ...WebSafe };

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
  attrs?: Attributes,
) => Promise<boolean>;

export {
  Encode,
  Encode as Encoders,
  Decode,
  Decode as Decoders,
  Metadata,
  Metadata as MD,
  Cover,
  Cover as Covers,
};

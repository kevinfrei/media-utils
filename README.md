# media-utils

My general media utilities for audio encoding, decoding, and music metadata
manipulation.

There are 3 top level components in this module: `Encode`, `Decode`, and
`Metadata`. There are also aliases for those components, but I'm not going to
worry about those.

### Types

There are a number of Flow types exported by the modules. They're all exported directly from `media-utils`:

```typescript
// This is a helper type used in a few places
type attributes = { [key: string]: string };

// This is the most simplistic strongly typed metadata you'll find
type SimpleMetadata = {
  artist: string;
  album: string;
  year?: string;
  track: string;
  title: string;
  compilation?: 'va' | 'ost';
};

// This is a more robust metadata type, meant to be used in,
// among other scenarios, situations where you're moving files around
type FullMetadata = {
  OriginalPath: string;
  Artist: string;
  Album: string;
  Year?: number;
  Track: number;
  Title: string;
  VAType?: 'va' | 'ost';
  MoreArtists?: Array<string>;
  Mix?: Array<string>;
  Disk?: number;
  DiskOf?: number;
};

// This is a general mechanism for describing how to extract
// various metadata components out of a file path
type regexPattern = {
  // This can be something like "soundtrack"
  // or "true/false" to simply indicate that it's
  // a compilation of works by various artists
  compilation?: string | boolean;
  // This is the regular expression to match
  rgx: RegExp;
  // These are the names of the metadata fields
  // and their corresponding RegExp capture numbers
  metadata: { [key: string]: number };
};

// A function type for metadata acquisition
type mdAcquire = (pathname: string) => ?SimpleMetadata;

// Same thing, but async...
type mdAcquireAsync = (pathname: string) => Promise<?SimpleMetadata>;

// A function type for decoding audio
type decoder = (inputFile: string, outputFile: string) => boolean;

// Ditto, async
type decoderAsync = (inputFile: string, outputFile: string) => Promise<boolean>;

// A function type for encoding audio
type encoder = (
  wavFile: string,
  outputFilename: string,
  options: ?attributes,
  attrs: ?attributes,
) => boolean;

// Ditto, async
type encoderAsync = (
  wavFile: string,
  outputFilename: string,
  options: ?attributes,
  attrs: ?attributes,
) => Promise<boolean>;
```

## Metadata

## Decode

## Encode

These are functions that will encode an input audio file to the given format.

```typescript
function m4a(wavFile, outputFilename, options, attrs): encoder;
function m4aAsync(wavFile, outputFilename, options, attrs): encoderAsync;
```

Wrappers around the `faac` encoder for encoding to m4a/aac audio. They only
take wav audio files as input. Other input types will result in failure.

```typescript
function flac(wavFile, outputFilename, options, attrs): encoder;
function flacAsync(wavFile, outputFilename, options, attrs): encoderAsync;
```

Wrappers around the `flac` command line encoder, with the same constraint as
the `faac` encoder: inputs much be wav files.

```typescript
function ffmpeg(inputFile, outputFilename, options, attrs): encoder;
function ffmpegAsync(inputFile, outputFilename, options, attrs): encoderAsync;
```

Wrappers around `ffmpeg`. Given that it's wrapping such a flexible tool, you
_could_ use this to do video transcoding as well, but I don't really encourage
that right now. These are the most flexible encoders, as FFmpeg does an
excellent job of metadata translation between types. There's no constrain
(generally) on the input audio type. FFmpeg will just do it's transcoding magic.

// @format
'use strict';

const path = require('path');

const ocp = require('child_process');

const util = require('util');

const {
  ObjUtil
} = require('my-utils');

const {
  ProcUtil
} = require('my-node-utils');

const cp = {
  spawnAsync: ProcUtil.spawnAsync,
  ...ocp
};
let cwd = process.cwd();

const setCwd = path => {
  cwd = path;
};

let patterns = [{
  compilation: 'va',
  rgx: /^(?:.*\/)?(?:(?:va(?:rious artists)?)) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
  metadata: {
    year: 1,
    album: 2,
    track: 3,
    artist: 4,
    title: 5
  }
}, {
  compilation: 'va',
  rgx: /^(?:.*\/)?(?:(?:va(?:various artists)?)) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
  metadata: {
    album: 1,
    track: 2,
    artist: 3,
    title: 4
  }
}, {
  compilation: 'ost',
  rgx: /^(?:.*\/)?(?:(?:ost)|(?:soundtrack)) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+) - ([^\/]+)$/i,
  metadata: {
    year: 1,
    album: 2,
    track: 3,
    artist: 4,
    title: 5
  }
}, {
  compilation: 'ost',
  rgx: /^(?:.*\/)?(?:(?:ost)|(?:soundtrack)) - ([^\/]+)\/(\d+)(?: [-\.])? ([^\/]+) - ([^\/]+)$/i,
  metadata: {
    album: 1,
    track: 2,
    artist: 3,
    title: 4
  }
}, {
  rgx: /^(?:.*\/)?([^\/]+) - (\d+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+)$/i,
  metadata: {
    artist: 1,
    year: 2,
    album: 3,
    track: 4,
    title: 5
  }
}, {
  rgx: /^(?:.*\/)?([^\/]+) - ([^\/]+)\/(\d+)(?: ?[-\.])? ([^\/]+)$/i,
  metadata: {
    artist: 1,
    album: 2,
    track: 3,
    title: 4
  }
}];
const moreArtistsRE = /\[(?:(?:w-)|(?:feat-)|(?:with)|(?:featuring)) (.*)\]/i;

const getArtists = artists => {
  if (artists.indexOf(' & ') >= 0) {
    return artists.split(', ').join(' & ').split(' & ');
  } else {
    return [artists];
  }
}; // This should pull the [w- Someone & Somebody else] from the title, and
// stick it in the artists array


const pullArtistsFromTitle = title => {
  const match = title.match(moreArtistsRE);

  if (!match) {
    return {
      title,
      artists: []
    };
  }

  const artists = getArtists(match[1]);
  title = title.replace(moreArtistsRE, '').trim();
  return {
    title,
    artists
  };
};

const addPattern = (rgx, metadata, compilation) => {
  if (compilation) {
    patterns.push({
      rgx,
      metadata,
      compilation: true
    });
  } else {
    patterns.push({
      rgx,
      metadata
    });
  }
};

const fromPath = pathname => {
  pathname = pathname.replace(/\\/g, '/'); // A little helper

  const makeMetaDataFromRegex = (pathname, pattern) => {
    if (!pattern.rgx.test(pathname)) {
      return;
    }

    const match = pattern.rgx.exec(pathname);

    if (!match) {
      return;
    }

    let result = {}; // Comment syntax because otherwise it confuses syntax highlighting :/

    for (let attr
    /*: string*/
    in pattern.metadata) {
      if (pattern.metadata.hasOwnProperty(attr)) {
        let index = pattern.metadata[attr];
        result[attr] = match[index];
      }
    }

    if (typeof pattern.compilation === 'string') {
      result.compilation = pattern.compilation;
    } else if (pattern.compilation === true) {
      result.compilation = 'va';
    }

    return result;
  };

  let theExtension = path.extname(pathname);

  if (!theExtension || theExtension.length < 3) {
    return;
  }

  if (theExtension[0] === '.') {
    theExtension = theExtension.substr(1);
  }

  pathname = pathname.substr(0, pathname.length - 1 - theExtension.length);

  for (let pattern
  /*: regexPattern*/
  of patterns) {
    let result = makeMetaDataFromRegex(pathname, pattern);

    if (result) {
      return result;
    }
  }
};

const fromFileArgs = pathname => [ObjUtil.deQuote('--Output=General;{"artist":"%Performer%",' + '"albumArtist":"%Album/Performer%",' + '"compilation":"%Compilation%",' + '"year":"%Recorded_Date%",' + '"album":"%Album%",' + '"track":"%Track/Position%",' + '"title":"%Title%"}'), pathname];

const fromFileFinish = res => {
  if (res.error || res.status || res.stdout.length < 20) {
    return;
  }

  let readyForParsing = res.stdout.toString();
  readyForParsing = readyForParsing.replace(/[\x01-\x1f]/g, '');
  let metadata = ObjUtil.reQuote(readyForParsing); // Requirements: Album, Artist, Track, Title

  if (!metadata.title || !metadata.track || !metadata.artist || !metadata.album) {
    return;
  }

  let title = metadata.title.trim();
  let track = metadata.track.trim();
  let album = metadata.album.trim();
  let artist = metadata.artist.trim();
  let comp = metadata.compilation ? metadata.compilation.trim() : undefined;
  let year = metadata.year ? metadata.year.trim() : undefined; // There's some weirdnes WRT %Performer% sometimes...

  const split = artist.split(' / ');

  if (split.length === 2 && split[0] === split[1]) {
    artist = split[0].trim();
  } else if (split.length > 1) {
    console.log(artist);
  }

  if (metadata.albumArtist === '') {
    delete metadata.albumArtist;
  } else if (false && metadata.albumArtist === metadata.artist && metadata.albumArtist !== 'Various Artists') {
    delete metadata.albumArtist;
  }

  let compilation;

  if (comp && metadata.albumArtist || metadata.albumArtist === 'Various Artists' || metadata.albumArtist === 'VA') {
    compilation = 'va';
  } else if (metadata.albumArtist === 'Soundtrack' || metadata.albumArtist === 'ost') {
    compilation = 'ost';
  }

  if (compilation && year) {
    return {
      artist,
      album,
      year,
      track,
      title,
      compilation
    };
  } else if (compilation) {
    return {
      artist,
      album,
      track,
      title,
      compilation
    };
  } else if (year) {
    return {
      artist,
      album,
      track,
      title,
      year
    };
  } else {
    return {
      artist,
      album,
      track,
      title
    };
  }
};

const fromFileAsync = async pathname => fromFileFinish((await cp.spawnAsync('mediainfo', fromFileArgs(pathname), {
  cwd: cwd,
  encoding: 'utf8'
})));

const fromFile = pathname => fromFileFinish(cp.spawnSync('mediainfo', fromFileArgs(pathname), {
  cwd: cwd,
  encoding: 'utf8'
}));

const FullFromObj = (file, data) => {
  let res = {
    OriginalPath: file,
    Artist: '',
    Album: '',
    Track: 0,
    Title: ''
  };
  /*    Year?: 0,
    VAType?: 'va',
    MoreArtists?: Array<string>,
    Mix?: Array<string>,
    Disk?: number,
    DiskOf?: number
  */

  if (!(data.hasOwnProperty('artist') || data.hasOwnProperty('albumArtist')) || !data.hasOwnProperty('album') || !data.hasOwnProperty('track') || !data.hasOwnProperty('title')) {
    return;
  }

  let theArtist = data.hasOwnProperty('albumArtist') ? data.albumArtist : data.artist;
  const artistArray = getArtists(theArtist);
  res.Artist = artistArray.length > 1 ? artistArray : theArtist;
  res.Album = data.album;
  res.Track = Number.parseInt(data.track);
  const {
    title,
    artists
  } = pullArtistsFromTitle(data.title);
  res.Title = title;
  res.MoreArtists = artists; // Now add any additional data we've got

  if (data.hasOwnProperty('year')) {
    res.Year = Number.parseInt(data.year);
  }

  if (data.hasOwnProperty('artist') && data.hasOwnProperty('albumArtist')) {
    if (data.artist != data.albumArtist && res.MoreArtists) {
      res.MoreArtists.push(data.artist);
    }
  }

  if (data.hasOwnProperty('moreArtists') && res.MoreArtists) {
    res.MoreArtists = [...res.MoreArtists, ...data.moreArtists];
  } else if (res.MoreArtists && res.MoreArtists.length === 0) {
    delete res.MoreArtists;
  }

  if (data.compilation) {
    if (data.compilation === 'va') {
      res.VAType = 'va';
    } else if (data.compilation === 'ost') {
      res.VAType = 'ost';
    }
  }

  return res;
};

module.exports = {
  fromFile,
  fromFileAsync,
  fromPath,
  addPattern,
  FullFromObj,
  setCwd
};
//# sourceMappingURL=metadata.js.map
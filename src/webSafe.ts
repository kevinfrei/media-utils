import { Type } from '@freik/core-utils';
import { Attributes, FullMetadata } from './index';

const moreArtistsRE = /\[(?:(?:w-)|(?:feat-)|(?:with)|(?:featuring)) ([^\]]*)\]/i;
const variationRE = /\[([^\]]+)\]/;

// This should pull the [w- Someone & Somebody else] from the title, and
// stick it in the artists array
function pullArtistsFromTitle(
  title: string,
): { title: string; artists?: string[] } {
  const match = moreArtistsRE.exec(title);
  if (!match) {
    return { title: title.replace(/  +/g, ' ').trim() };
  }
  const artists = splitArtistString(match[1]);
  title = title.replace(moreArtistsRE, '').replace(/  +/g, ' ').trim();
  return { title, artists };
}

function pullVariationsFromTitle(
  title: string,
): { title: string; variations?: string[] } {
  let variations: string[] | undefined;
  let ttl = title;
  while (true) {
    const match = variationRE.exec(ttl);
    if (!match) {
      return { title: ttl, variations };
    }
    if (variations === undefined) {
      variations = [];
    }
    variations.push(match[1]);
    ttl = ttl.replace(variationRE, '').replace(/  +/g, ' ').trim();
  }
}

export function splitArtistString(artists: string): string[] {
  if (artists.indexOf(' & ') >= 0) {
    return artists
      .split(', ')
      .join(' & ')
      .split(' & ')
      .map((s) => s.trim());
  } else {
    return [artists];
  }
}

export function FullFromObj(
  file: string,
  data: Attributes,
): FullMetadata | void {
  const res: FullMetadata = {
    originalPath: file,
    artist: '',
    album: '',
    track: 0,
    title: '',
  };
  /*
    moreArtists?: string[],
    disk?: number,
    variation?: string[]
    TODO: Deal with variations (mix, live, remix, demo, etc...)
  */
  if (
    !(Type.hasStr(data, 'artist') || Type.hasStr(data, 'albumArtist')) ||
    !Type.hasStr(data, 'album') ||
    !Type.hasStr(data, 'track') ||
    !Type.hasStr(data, 'title')
  ) {
    return;
  }
  const theArtist = Type.hasStr(data, 'albumArtist')
    ? data.albumArtist
    : data.artist;
  const artistArray = splitArtistString(theArtist);
  res.artist = artistArray.length > 1 ? artistArray : theArtist;
  res.album = data.album;
  const track = Number.parseInt(data.track, 10);
  res.track = track % 100;
  if (res.track !== track) {
    res.disk = Math.floor(track / 100);
  }
  const { title: aTitle, artists } = pullArtistsFromTitle(data.title);
  res.moreArtists = artists;
  const { title, variations } = pullVariationsFromTitle(aTitle);
  res.title = title;
  res.variations = variations;

  // Now add any additional data we've got
  if (Type.hasStr(data, 'year')) {
    res.year = Number.parseInt(data.year, 10);
  }
  if (Type.hasStr(data, 'artist') && Type.hasStr(data, 'albumArtist')) {
    if (data.artist !== data.albumArtist && res.moreArtists) {
      res.moreArtists.push(data.artist);
    }
  }
  if (Type.hasStr(data, 'moreArtists') && res.moreArtists) {
    res.moreArtists = [...res.moreArtists, ...data.moreArtists];
  } else if (res.moreArtists && res.moreArtists.length === 0) {
    delete res.moreArtists;
  }
  if (Type.hasStr(data, 'compilation')) {
    if (data.compilation === 'va') {
      res.vaType = 'va';
    } else if (data.compilation === 'ost') {
      res.vaType = 'ost';
    }
  }
  return res;
}

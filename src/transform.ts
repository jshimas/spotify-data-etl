import csv from "csv-parser";
import { Artist, CleanTrack, RawTrack, Track } from "./types";
import { Readable } from "stream";

export async function parseCsv<T>(
  content: string,
  parse: (source: T) => T
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const data: T[] = [];

    Readable.from(content)
      .pipe(csv())
      .on("data", (row: T) => data.push(parse(row)))
      .on("end", () => resolve(data))
      .on("error", (error: string) => reject(error));
  });
}

export function transformTrack(track: RawTrack): CleanTrack {
  const [year, month, day] = track.release_date.split("-");

  return {
    ...track,
    release_year: Number(year) || "",
    release_month: Number(month) || "",
    release_day: Number(day) || "",
    danceability: transformDanceability(track.danceability),
  };
}

export function parseTrack<T extends Track>(track: T): T {
  return {
    ...track,
    duration_ms: Number(track.duration_ms) || 0,
    name: track.name.replace(/"/g, `""`),
    artists: track.artists.toString().replace(/"/g, `""`),
    id_artists: JSON.parse(track.id_artists.toString().replace(/'/g, '"')),
  };
}

function transformDanceability(danceability: number): string {
  if (danceability >= 0 && danceability < 0.5) {
    return "Low";
  } else if (danceability >= 0.5 && danceability <= 0.6) {
    return "Medium";
  } else if (danceability > 0.6 && danceability <= 1) {
    return "High";
  } else {
    return "Unknown";
  }
}

export function parseArtist(artist: Artist): Artist {
  return {
    ...artist,
    followers: Number(artist.followers) || 0,
    popularity: Number(artist.popularity) || 0,
    genres: artist.genres.replace(/"/g, `""`),
    name: artist.name.replace(/"/g, `""`),
  };
}

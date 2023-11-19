import { Artist, ArtistTrack, CleanTrack } from "./types";

export const csvTrackTemplate = (track: CleanTrack): string =>
  `${track.id},"${track.name}",${track.popularity},${track.duration_ms},${
    track.explicit
  },"${track.artists}","${JSON.stringify(track.id_artists).replace(
    /"/g,
    `'`
  )}",${track.release_year},${track.release_month},${track.release_day},"${
    track.danceability
  }",${track.energy},${track.key},${track.loudness},${track.mode},${
    track.speechiness
  },${track.acousticness},${track.instrumentalness},${track.liveness},${
    track.valence
  },${track.tempo},${track.time_signature}\n`;

export const dbTrackTemplate = (track: CleanTrack): string =>
  `${track.id},"${track.name}",${track.popularity},${track.duration_ms},${
    track.explicit
  },${Number(track.release_year) || null},${
    Number(track.release_month) || null
  },${Number(track.release_day) || null},"${track.danceability}",${
    track.energy
  },${track.key},${track.loudness},${track.mode},${track.speechiness},${
    track.acousticness
  },${track.instrumentalness},${track.liveness},${track.valence},${
    track.tempo
  },${track.time_signature}\n`;

export const dbArtistTrackTemplate = (artistTrack: ArtistTrack) =>
  `${artistTrack.artistId},${artistTrack.trackId}\n`;

export const trackCSVHeader: string =
  "id,name,popularity,duration_ms,explicit,artists,id_artists,release_year,release_month,release_day,danceability,energy,key,loudness,mode,speechiness,acousticness,instrumentalness,liveness,valence,tempo,time_signature\n";

export const artistsCSVHeader: string = "id,followers,genres,name,popularity\n";

export const csvArtistTemplate = (artist: Artist): string =>
  `${artist.id},${artist.followers},"${artist.genres}","${artist.name}",${artist.popularity}\n`;

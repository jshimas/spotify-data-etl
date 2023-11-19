import "dotenv/config";
import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";
import S3Bucket from "./aws";
import { BucketLocationConstraint } from "@aws-sdk/client-s3";
import { Artist, ArtistTrack, CleanTrack, RawTrack } from "./types";
import { parseArtist, parseCsv, parseTrack, transformTrack } from "./transform";
import {
  trackCSVHeader,
  csvTrackTemplate,
  artistsCSVHeader,
  csvArtistTemplate,
  dbTrackTemplate,
  dbArtistTrackTemplate,
} from "./templates";
import LocalPostgresRepo from "./postgres";

// declare S3 variables in .env file or override them here
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || "";
const REGION = process.env.REGION || "";
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID || "";
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY || "";

const s3 = new S3Bucket(
  S3_BUCKET_NAME,
  REGION as BucketLocationConstraint,
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY
);

const tracksPath: string = path.join(__dirname, "../datasets/tracks.csv");
const artistsPath: string = path.join(__dirname, "../datasets/artists.csv");

// a 'hashmap' object to store artists ids for O(1) lookup time
const uniqueTracksArtistsIds: { [id: string]: boolean } = {};

(async () => {
  const db: LocalPostgresRepo = new LocalPostgresRepo();
  try {
    await s3.initBucket();

    const tracksKey: string = "tracks.csv";
    console.log(`Transfering tracks to Bucket, key: ${tracksKey}`);
    await transferTracksToS3(tracksPath, tracksKey);

    const artistsKey: string = "artists.csv";
    console.log(`Transfering artists to Bucket, key: ${artistsKey}`);
    await transferArtistsToS3(artistsPath, artistsKey);

    await db.initDefaultEmptyDatabaseTables();

    console.log(
      "Transferring artists.csv from S3 to local Postgres...\n\t- Getting artists from S3"
    );
    const artistsContent: string = await s3.getFileContent(artistsKey);
    const artists: Artist[] = await parseCsv(artistsContent, parseArtist);
    console.log("\t- Inserting artists to local Postgres");
    await db.bulkInsertCSV<Artist>("artists", artists, csvArtistTemplate);

    console.log(
      "Transferring tracks.csv from S3 to local Postgres...\n\t- Getting tracks from S3"
    );
    const tracksContent: string = await s3.getFileContent(tracksKey);
    const tracks: CleanTrack[] = await parseCsv(tracksContent, parseTrack);
    console.log("\t- Inserting tracks to local Postgress");
    await db.bulkInsertCSV<CleanTrack>("tracks", tracks, dbTrackTemplate);

    console.log("Inserting artists_tracks");
    const artistsTracks: ArtistTrack[] = getArtistTracks(tracks);
    await db.bulkInsertCSV<ArtistTrack>(
      "artists_tracks",
      artistsTracks,
      dbArtistTrackTemplate
    );
    console.log("Job finished successfully!");
  } catch (error) {
    console.error(error);
  } finally {
    await db.disconnect();
  }
})();

async function transferTracksToS3(filePath: string, key: string) {
  try {
    const { s3UploadStream, upload } = s3.uploadFileStream(key);
    s3UploadStream.write(trackCSVHeader);

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (rawTrack: RawTrack) => {
          const track: RawTrack = parseTrack(rawTrack);
          if (track.name && track.name !== "" && track.duration_ms >= 60000) {
            const transformedTrack: CleanTrack = transformTrack(track);
            Array.from(transformedTrack.id_artists).forEach(
              (artistId) => (uniqueTracksArtistsIds[artistId] = true)
            );
            const csvTrack: string = csvTrackTemplate(transformedTrack);
            s3UploadStream.write(csvTrack);
          }
        })
        .on("end", async () => {
          s3UploadStream.end();
          await upload.done();
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    throw error;
  }
}

async function transferArtistsToS3(filePath: string, key: string) {
  try {
    const { s3UploadStream, upload } = s3.uploadFileStream(key);
    s3UploadStream.write(artistsCSVHeader);

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (rawArtist: Artist) => {
          if (rawArtist.id in uniqueTracksArtistsIds) {
            const artist = parseArtist(rawArtist);
            const csvArtist: string = csvArtistTemplate(artist);
            s3UploadStream.write(csvArtist);
          }
        })
        .on("end", async () => {
          s3UploadStream.end();
          await upload.done();
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  } catch (error) {
    throw error;
  }
}

function getArtistTracks(cleanTracks: CleanTrack[]): ArtistTrack[] {
  const artistTracks: ArtistTrack[] = [];

  cleanTracks.forEach((cleanTrack) => {
    const trackId = cleanTrack.id;
    const artistIds = Array.isArray(cleanTrack.id_artists)
      ? cleanTrack.id_artists
      : [cleanTrack.id_artists];

    artistIds.forEach((artistId) => {
      artistTracks.push({
        artistId,
        trackId,
      });
    });
  });

  return artistTracks;
}

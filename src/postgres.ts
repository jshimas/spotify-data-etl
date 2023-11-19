import { Pool } from "pg";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { CopyStreamQuery, from as copyFrom } from "pg-copy-streams";

class LocalPostgresRepo {
  private pgPool: Pool;

  constructor() {
    this.pgPool = new Pool({
      host: "localhost",
      database: "tracksdb",
      user: "postgres",
      password: "postgres",
      port: 5432,
    });
  }

  async disconnect() {
    await this.pgPool.end();
  }

  async bulkInsertCSV<T>(
    tableName: string,
    records: T[],
    template: (obj: T) => string
  ) {
    const artistsStream = Readable.from(records.map(template));
    await this.insertStream(tableName, artistsStream);
  }

  async insertStream(tableName: string, sourceStream: NodeJS.ReadableStream) {
    const client = await this.pgPool.connect();
    try {
      const copyStream: CopyStreamQuery = client.query(
        copyFrom(`COPY ${tableName} FROM STDIN WITH NULL AS 'null' CSV`)
      );
      await pipeline(sourceStream, copyStream);
    } catch (error) {
      throw error;
    } finally {
      client.release();
    }
  }

  async initDefaultEmptyDatabaseTables(): Promise<void> {
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS tracks (
        id TEXT PRIMARY KEY,
        name TEXT,
        popularity INT,
        duration_ms INT,
        explicit INT,
        release_year INT,
        release_month INT,
        release_day INT,
        danceability TEXT,
        energy FLOAT,
        key INT,
        loudness FLOAT,
        mode INT,
        speechiness FLOAT,
        acousticness FLOAT,
        instrumentalness FLOAT,
        liveness FLOAT,
        valence FLOAT,
        tempo FLOAT,
        time_signature INT
    );
    
      CREATE TABLE IF NOT EXISTS artists (
        id TEXT PRIMARY KEY,
        followers FLOAT,
        genres TEXT,
        name TEXT,
        popularity INT
    );

    CREATE TABLE IF NOT EXISTS artists_tracks (
      artist_id TEXT,
      track_id TEXT,
      PRIMARY KEY (artist_id, track_id)
    );
    
    TRUNCATE tracks, artists, artists_tracks`;

    try {
      await this.pgPool.query(createTablesQuery);
    } catch (err) {
      throw err;
    }
  }
}

export default LocalPostgresRepo;

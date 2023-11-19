CREATE VIEW tracks_with_followers_filtered AS
SELECT id, name, popularity, energy, danceability, artist_followers
FROM tracks_with_followers
WHERE artist_followers > 0;
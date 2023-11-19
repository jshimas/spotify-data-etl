CREATE VIEW tracks_with_followers AS
SELECT t.id, t.name, t.popularity, t.energy, t.danceability,
       a.followers AS artist_followers
FROM tracks t
JOIN artists_tracks at ON t.id = at.track_id
JOIN artists a ON at.artist_id = a.id;
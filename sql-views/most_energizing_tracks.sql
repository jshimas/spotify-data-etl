CREATE VIEW most_energizing_tracks AS
SELECT DISTINCT t.id, t.name AS track_name, t.energy, t.release_year
FROM tracks t
JOIN artists_tracks at ON t.id = at.track_id
JOIN artists a ON at.artist_id = a.id
JOIN (
    SELECT release_year, MAX(energy) AS max_energy
    FROM tracks
    JOIN artists_tracks at ON tracks.id = at.track_id
    JOIN artists ON at.artist_id = artists.id
    GROUP BY release_year
) max_energy_per_year ON t.release_year = max_energy_per_year.release_year AND t.energy = max_energy_per_year.max_energy
ORDER BY t.release_year;

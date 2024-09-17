const { Pool } = require("pg");

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongInPlaylist(playlist_id) {
    const query = {
        text: `
        SELECT p.id, p.name,
        COALESCE(
          array_agg(
            json_build_object(
              'id', s.id,
              'title', s.title,
              'performer', s.performer
            )
          ) FILTER (WHERE ps.song_id IS NOT NULL),
          ARRAY[]::json[]
        ) AS songs
        from playlist_songs AS ps
        JOIN playlists AS p ON p.id = ps.playlist_id
        JOIN songs AS s ON s.id = ps.song_id
        WHERE ps.playlist_id = $1
        GROUP BY p.id, p.name;
        `,
        values: [playlist_id],
      };
    const result = await this._pool.query(query);
    return result.rows[0];
  }

  async verifyPlaylistAccessIsOwner(playlistId, ownerId) {
    const query = {
      text: "SELECT * FROM playlists WHERE id = $1 AND owner = $2",
      values: [playlistId, ownerId],
    }

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      console.log('Playlist tidak ditemukan!');
      return
    }
    
    return result.rows[0].id;
  }
}

module.exports = PlaylistsService;
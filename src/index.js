import fetch from 'isomorphic-fetch';

export default function (access_token) {
  const populate = (playlist, profile, options) => {
    fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term', options)
      .then(res => res.json())
      .then((trackList) => {
        const uris = trackList.items.map(track => track.uri);

        const addOpts = Object.assign({}, options, {
          method: 'PUT',
          body: JSON.stringify({
            uris,
          }),
        });

        fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists/${playlist.id}/tracks`, addOpts);
      });
  };

  const options = {
    headers: { Authorization: `Bearer ${access_token}` },
  };

  const profilePending = fetch('https://api.spotify.com/v1/me', options);
  const playlistsPending = fetch('https://api.spotify.com/v1/me/playlists', options);

  Promise.all([profilePending, playlistsPending]).then(([profileReq, playlistsReq]) => {
    Promise.all([profileReq.json(), playlistsReq.json()]).then(([profile, playlists]) => {
      const playlist = playlists.items.filter(item => item.name === 'Your Top Songs')[0];
      if (playlist) {
        populate(playlist, profile, options);
      } else {
        const createOpts = Object.assign({}, options, {
          method: 'POST',
          body: JSON.stringify({
            name: 'Your Top Songs',
          }),
        });
        fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, createOpts)
          .then(response => response.json())
          .then(newPlaylist => populate(newPlaylist, profile, options));
      }
    });
  });
}

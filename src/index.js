import fetch from 'isomorphic-fetch';

export default function (access_token, store) {
  const populate = (playlistId, profileId, options) => {
    return fetch('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term', options)
      .then(res => res.json())
      .then((trackList) => {
        const uris = trackList.items.map(track => track.uri);

        const addOpts = Object.assign({}, options, {
          method: 'PUT',
          body: JSON.stringify({
            uris,
          }),
        });

        return fetch(
          `https://api.spotify.com/v1/users/${profileId}/playlists/${playlistId}/tracks`,
          addOpts
        ).then(() => ({ playlistId }));
      });
  };

  const options = {
    headers: { Authorization: `Bearer ${access_token}` },
  };

  const profilePending = fetch('https://api.spotify.com/v1/me', options);
  const playlistsPending = fetch('https://api.spotify.com/v1/me/playlists', options);

  return Promise.all([profilePending, playlistsPending]).then(([profileReq, playlistsReq]) =>
    Promise.all([profileReq.json(), playlistsReq.json()]).then(([profile, playlists]) => {
      const playlist = store && playlists.items.filter(item => item.id === store.playlistId)[0];
      if (playlist) {
        return populate(store.playlistId, profile.id, options);
      } else {
        const createOpts = Object.assign({}, options, {
          method: 'POST',
          body: JSON.stringify({
            name: 'Your Top Songs (TPDK 🤖)',
          }),
        });
        return fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, createOpts)
          .then(response => response.json())
          .then(playlist => populate(playlist.id, profile.id, options));
      }

    })
  );
}

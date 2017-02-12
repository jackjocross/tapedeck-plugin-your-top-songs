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

  return fetch('https://api.spotify.com/v1/me', options)
    .then((profileReq) => profileReq.json())
    .then((profile) => {
      if (store && store.playlistId) {
        return populate(store.playlistId, profile.id, options);
      } else {
        const createOpts = Object.assign({}, options, {
          method: 'POST',
          body: JSON.stringify({
            name: 'Your Top Songs',
          }),
        });
        return fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, createOpts)
          .then(response => response.json())
          .then(playlist => populate(playlist.id, profile.id, options));
      }
    });
}

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (access_token, store) {
  var populate = function populate(playlistId, profileId, options) {
    return (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=short_term', options).then(function (res) {
      return res.json();
    }).then(function (trackList) {
      var uris = trackList.items.map(function (track) {
        return track.uri;
      });

      var addOpts = Object.assign({}, options, {
        method: 'PUT',
        body: JSON.stringify({
          uris: uris
        })
      });

      return (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/users/' + profileId + '/playlists/' + playlistId + '/tracks', addOpts).then(function () {
        return { playlistId: playlistId };
      });
    });
  };

  var options = {
    headers: { Authorization: 'Bearer ' + access_token }
  };

  return (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/me', options).then(function (profileReq) {
    return profileReq.json();
  }).then(function (profile) {
    if (store && store.playlistId) {
      return populate(store.playlistId, profile.id, options);
    } else {
      var createOpts = Object.assign({}, options, {
        method: 'POST',
        body: JSON.stringify({
          name: 'Your Top Songs'
        })
      });
      return (0, _isomorphicFetch2.default)('https://api.spotify.com/v1/users/' + profile.id + '/playlists', createOpts).then(function (response) {
        return response.json();
      }).then(function (playlist) {
        return populate(playlist.id, profile.id, options);
      });
    }
  });
};

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
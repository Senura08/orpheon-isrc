// Remembers the ISRC of songs it has seen, by song address (uri).
var seen = {};

function remember(track) {
  if (track && track.uri && track.isrc) seen[track.uri] = track.isrc;
}

// Learn the ISRC of every song that starts playing.
myspoti.on('track', function (track) {
  remember(track);
});

// The button in the 3-dot menu (songs only).
myspoti.provide('menu', function (item) {
  if (item.kind !== 'track') return [];
  return [{ type: 'menu', label: 'Show ISRC', icon: 'info', action: 'show_isrc' }];
});

// What happens when you tap it.
myspoti.provide('tap', function (e) {
  if (e.action !== 'show_isrc') return;
  var uri = e.context && e.context.uri;
  var isrc = uri ? seen[uri] : null;
  if (!isrc) {
    var now = myspoti.player.current();
    if (now && now.isrc && (!uri || now.uri === uri)) isrc = now.isrc;
  }
  myspoti.notify(isrc ? 'ISRC: ' + isrc : 'No ISRC known for this song yet');
});

// Selectable text under the song's credits.
myspoti.provide('trackinfo', function (track) {
  remember(track);
  if (!track.isrc) return null;
  return [{ type: 'text', text: 'ISRC: ' + track.isrc, style: 'body' }];
});

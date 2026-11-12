var seen = {};

function remember(track) {
  if (track && track.uri && track.isrc) seen[track.uri] = track.isrc;
}

function methodsOf(obj) {
  var out = [];
  try { out = Object.getOwnPropertyNames(obj); } catch (err) {}
  if (!out.length) {
    try { for (var k in obj) out.push(k); } catch (err2) { out.push('error: ' + err2); }
  }
  return out.join(', ');
}

// Ask the app which Spotify commands exist, and log them.
try {
  myspoti.log('catalog methods: ' + methodsOf(myspoti.spotify.catalog));
  myspoti.log('search methods: ' + methodsOf(myspoti.spotify.search));
} catch (err) {
  myspoti.log('methods failed: ' + err);
}

myspoti.on('track', function (track) {
  remember(track);
  myspoti.log('track: ' + JSON.stringify(track));
});

myspoti.provide('menu', function (item) {
  if (item.kind !== 'track') return [];
  return [{ type: 'menu', label: 'Show ISRC', icon: 'info', action: 'show_isrc' }];
});

myspoti.provide('tap', function (e) {
  if (e.action !== 'show_isrc') return;
  myspoti.log('tap: ' + JSON.stringify(e));
  var now = null;
  try { now = myspoti.player.current(); } catch (err) { myspoti.log('current failed: ' + err); }
  myspoti.log('current: ' + JSON.stringify(now));
});

myspoti.provide('trackinfo', function (track) {
  myspoti.log('trackinfo: ' + JSON.stringify(track));
  remember(track);
  if (!track.isrc) return null;
  return [{ type: 'text', text: 'ISRC: ' + track.isrc, style: 'body' }];
});

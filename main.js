var seen = {};
var ISRC_RE = /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/;

// Digs through whatever Spotify returns and picks out something shaped like an ISRC.
function findIsrc(value, depth) {
  if (value === null || value === undefined || depth > 4) return null;
  if (typeof value === 'string') {
    var s = value.replace(/[- ]/g, '').toUpperCase();
    return ISRC_RE.test(s) ? s : null;
  }
  if (typeof value === 'object') {
    if (value.isrc) {
      var direct = findIsrc(value.isrc, depth + 1);
      if (direct) return direct;
    }
    for (var k in value) {
      var r = findIsrc(value[k], depth + 1);
      if (r) return r;
    }
  }
  return null;
}

// Asks Spotify's catalogue for the ISRC, trying a few ways and logging each.
function lookup(uri) {
  if (!uri) return null;
  if (seen[uri]) return seen[uri];
  var id = String(uri).split(':').pop();
  var tries = [
    ['catalog.isrc(uri)', function () { return myspoti.spotify.catalog.isrc(uri); }],
    ['catalog.isrc(id)', function () { return myspoti.spotify.catalog.isrc(id); }],
    ['catalog.track(uri)', function () { return myspoti.spotify.catalog.track(uri); }],
    ['catalog.track(id)', function () { return myspoti.spotify.catalog.track(id); }]
  ];
  for (var i = 0; i < tries.length; i++) {
    try {
      var result = tries[i][1]();
      var text = JSON.stringify(result);
      myspoti.log(tries[i][0] + ' -> ' + (text ? text.slice(0, 300) : String(result)));
      var found = findIsrc(result, 0);
      if (found) {
        seen[uri] = found;
        myspoti.log('ISRC found via ' + tries[i][0] + ': ' + found);
        return found;
      }
    } catch (err) {
      myspoti.log(tries[i][0] + ' failed: ' + err);
    }
  }
  return null;
}

function say(text) {
  try { myspoti.notify(text); } catch (err) { myspoti.log('notify blocked: ' + err); }
}

myspoti.provide('menu', function (item) {
  if (item.kind !== 'track') return [];
  return [{ type: 'menu', label: 'Show ISRC', icon: 'info', action: 'show_isrc' }];
});

myspoti.provide('tap', function (e) {
  if (e.action !== 'show_isrc') return;
  var uri = e.context && e.context.uri;
  var isrc = lookup(uri);
  myspoti.log('tap result for ' + uri + ': ' + isrc);
  say(isrc ? 'ISRC: ' + isrc : 'ISRC not found for this song');
});

myspoti.provide('trackinfo', function (track) {
  var isrc = track.isrc || lookup(track.uri);
  if (!isrc) return null;
  return [{ type: 'text', text: 'ISRC: ' + isrc, style: 'body' }];
});

var Key = '[Api-Key]'; // Replace '[Api-Key]' with an api key from https://www.worldtides.info/

Pebble.on('message', function(event) {
  // Get the message that was passed
  var message = event.data;

  if (message.fetch) {
    if(message.pos)
      requestTides(message.pos);
    else
      navigator.geolocation.getCurrentPosition(function(pos) {
        requestTides(pos);
      }, function(err) {
        console.error('Error getting location');
        Pebble.postMessage({
          'requestFailed': true,
          'err': "loc err"
        });
      },
      { timeout: 15000, maximumAge: 60000 });
  }
});

function request(url, type, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function (e) {
    // HTTP 4xx-5xx are errors:
    if (xhr.status >= 400 && xhr.status < 600) {
      console.error('Request failed with HTTP status ' + xhr.status + ', body: ' + this.responseText);
      return;
    }
    callback(this.responseText);
  };
  xhr.open(type, url);
  xhr.send();
}
function requestTides(pos)
{
  var url = 'https://www.worldtides.info/api' +
              '?lat=' + pos.coords.latitude +
              '&lon=' + pos.coords.longitude +
              '&heights&stations&datum=STND&start=' + new Date()/1000 +
              '&length=60&key=' + Key;

      request(url, 'GET', function(responseText) {
        var tidalData = JSON.parse(responseText);
        console.log(JSON.stringify(responseText));
        if(tidalData.heights)
        {
          if(tidalData.station===undefined)
            Pebble.postMessage({
              'requestFailed': true,
              'err': 'loc err'
            });
          else
            Pebble.postMessage({
              'height': tidalData.heights[0].height,
              'station': tidalData.station
            });
        }
        else
          Pebble.postMessage({
            'requestFailed': true,
            'err': 'tidal err'
          });
      });
}
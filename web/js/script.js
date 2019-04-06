(function(w, d, t) {
  var video = d.getElementById('video');
  var canvas = d.getElementById('canvas');
  var cameras = d.getElementById('cameras');
  var ctx = canvas.getContext('2d');
  var frame = d.getElementById('frame');
  var colors = [
    { r: 0, g: 0, b: 0 },
    { r: 0, g: 0, b: 0 }
  ];
  var deviceId;
  var tracker;
  var task;

  if (typeof t === 'undefined') {
    return;
  }

  function debugColor(idx) {
    var c = colors[idx];
    d.getElementById('color' + idx).style.background = 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')';
  }

  function setColor(idx) {
    colors[idx] = getAverageColor(5);
    debugColor(idx);
  }

  // get average color based on every nth pixel
  function getAverageColor(nth) {
    var width = canvas.width;
    var height = canvas.height;
    var pixels = ctx.getImageData(5, 5, 25, 25);
    var rgb = { r: 0, g: 0, b: 0 };
    var count = 0;
    var i = 0;

    while ( (i += nth * 4) < pixels.data.length ) {
      rgb.r += pixels.data[i];
      rgb.g += pixels.data[i+1];
      rgb.b += pixels.data[i+2];
      ++count;
    }

    return {
      r: Math.floor(rgb.r / count),
      g: Math.floor(rgb.g / count),
      b: Math.floor(rgb.b / count)
    };
  }

  function init() {
    var tolerance = 20;

    t.ColorTracker.registerColor('one', function(r, g, b) {
      var c = colors[0];
      return r > c.r - tolerance && r < c.r + tolerance &&
             g > c.g - tolerance && g < c.g + tolerance &&
             b > c.b - tolerance && b < c.b + tolerance;
    });

    t.ColorTracker.registerColor('two', function(r, g, b) {
      var c = colors[1];
      return r > c.r - tolerance && r < c.r + tolerance &&
             g > c.g - tolerance && g < c.g + tolerance &&
             b > c.b - tolerance && b < c.b + tolerance;
    });

    tracker = new t.ColorTracker(['one', 'two', 'magenta']);

    tracker.on('track', function(event) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      event.data.forEach(function(rect) {
        var color = rect.color;

        if (color === 'magenta') {
          ctx.strokeStyle = color;
          ctx.strokeRect(0, rect.y, canvas.width, rect.height);
        } else {
          /*
          TODO: bring back false positives
          // false positives
          if (rect.width > 100 || rect.height > 100 || Math.abs(rect.width - rect.height) > 15) {
            color = 'yellow';
          }
          */
          ctx.strokeStyle = (color === 'one' ? 'red' : 'blue');
          ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        }
      });
    });
  }

  function getCameras() {
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
      while (cameras.firstChild) {
        cameras.removeChild(cameras.firstChild);
      }
      var option;
      for (var i = 0, ii = devices.length; i < ii; ++i) {
        if (devices[i].kind === 'videoinput') {
          option = d.createElement('option');
          option.value = devices[i].deviceId;
          option.text = devices[i].label || 'Video #' + (i + 1);
          cameras.appendChild(option);
        }
      }
    });
  }

  function stop() {
    var tracks;

    if (video.srcObject) {
      tracks = video.srcObject.getTracks();
      for (var i = 0, ii = tracks.length; i < ii; ++i) {
        tracks[i].stop();
      }
    }

    if (task) {
      task.stop();
    }
  }

  function start() {
    var constraints = {
      audio: false,
      video: true
    };

    if (deviceId) {
      constraints.video = {
        deviceId: {
          exact: deviceId
        }
      };
    }

    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      video.srcObject = stream;
      init();
      task = t.track(video, tracker);
    }).catch(function (err) {
      console.log('navigator.MediaDevices.getUserMedia error: ', err.message, err.name);
    });
  }

  d.getElementById('start').addEventListener('click', function () {
    stop();
    start();
    getCameras();
  }, false);

  d.getElementById('stop').addEventListener('click', function () {
    stop();
  }, false);

  d.getElementById('set-one').addEventListener('click', function () {
    setColor(0);
  }, false);
  debugColor(0);

  d.getElementById('set-two').addEventListener('click', function () {
    setColor(1);
  }, false);
  debugColor(1);

  cameras.addEventListener('change', function () {
    deviceId = this.value;
    start();
  });

})(window, document, window.tracking);

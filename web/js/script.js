(function(w, d, t) {
  var video = d.getElementById('video');
  var canvas = d.getElementById('canvas');
  var cameras = d.getElementById('cameras');
  var ctx = canvas.getContext('2d');
  var frame = d.getElementById('frame');
  var deviceId;
  var tracker;
  var task;

  if (typeof t === 'undefined') {
    return;
  }

  function init() {

    t.ColorTracker.registerColor('one', function(r, g, b) {
      return (r > 50 && g < 60 && b < 60);
    });

    t.ColorTracker.registerColor('two', function(r, g, b) {
      return (r < 60 && g < 60 && b > 50);
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
          // false positives
          if (rect.width > 100 || rect.height > 100 || Math.abs(rect.width - rect.height) > 15) {
            color = 'yellow';
          }
          ctx.strokeStyle = color;
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

  cameras.addEventListener('change', function () {
    deviceId = this.value;
    start();
  });

})(window, document, window.tracking);

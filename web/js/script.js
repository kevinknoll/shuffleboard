(function(w, d, t) {
  var video = document.getElementById('video');
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var frame = d.getElementById('frame');
  var tracker;

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

  function start() {
    navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: {
          exact: 'environment'
        }
      }
    }).then(function (stream) {
      video.srcObject = stream;
      init();
      t.track(video, tracker);
    }).catch(function (err) {
      console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
    });
  }

  d.getElementById('start').addEventListener('click', start, false);

})(window, document, window.tracking);

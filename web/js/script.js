(function(w, d, t) {
  var img = d.getElementById('img');
  var frame = d.getElementById('frame');
  var tracker;

  if (typeof t === 'undefined') {
    return;
  }

  function plot(x, y, w, h, color) {
    var rect = d.createElement('div');
    var c = '';

    switch (color) {
      case 'one':
        c = 'red';
        break;
      case 'two':
        c = 'blue';
        break;
      default:
        c = 'yellow';
        break;
    }

    if (c) {
      rect.style.borderColor = c;
      rect.style.width = w + 'px';
      rect.style.height = h + 'px';
      rect.style.left = (img.offsetLeft + x) + 'px';
      rect.style.top = (img.offsetTop + y) + 'px';

      frame.appendChild(rect);
    }
  }

  function init() {
    t.ColorTracker.registerColor('one', function(r, g, b) {
      return (r > 50 && g < 60 && b < 60);
    });

    t.ColorTracker.registerColor('two', function(r, g, b) {
      return (r < 60 && g < 60 && b > 50);
    });

    tracker = new t.ColorTracker(['one', 'two']);

    tracker.on('track', function(event) {
      event.data.forEach(function(rect) {
        var color = rect.color;

        // false positives
        if (rect.width > 100 || rect.height > 100 || Math.abs(rect.width - rect.height) > 15) {
          color = 'unknown';
        }

        plot(rect.x, rect.y, rect.width, rect.height, color);
      });
    });

    w.addEventListener('load', function () {
      t.track(img, tracker);
    }, false);
  }

  init();

})(window, document, window.tracking);

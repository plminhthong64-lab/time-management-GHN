(function () {
  'use strict';
  var SLIDE_COUNT = 41;
  var DWELL_COMPLETE_MS = 2000;
  var sessionStart = Date.now();
  var image = document.getElementById('craft-image');
  var counter = document.getElementById('craft-counter');
  var bar = document.getElementById('craft-progress-bar');
  var prev = document.getElementById('craft-prev');
  var next = document.getElementById('craft-next');
  var caption = document.getElementById('craft-caption');
  caption.textContent = '';
  var index = 0;
  var completed = false;
  var dwellTimer = 0;

  function formatScormTime(ms) {
  var s = Math.floor(ms / 1000);
  var hh = String(Math.floor(s / 3600)).padStart(2, '0');
  var mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  var ss = String(s % 60).padStart(2, '0');
  return hh + ':' + mm + ':' + ss;
}

  function pad(n) { var s = String(n); while (s.length < 3) s = '0' + s; return s; }
  function readSavedIndex(max) {
    if (!window.craftScorm) return 0;
    var saved = window.craftScorm.getValue('cmi.core.lesson_location');
    if (!saved || isNaN(parseInt(saved, 10))) return 0;
    return Math.max(0, Math.min(max - 1, parseInt(saved, 10)));
  }
  function commitScorm() {
    if (!window.craftScorm) return;
    window.craftScorm.setValue('cmi.core.session_time', formatScormTime(Date.now() - sessionStart));
    window.craftScorm.commit();
  }
  function render() {
    image.src = 'slides/' + pad(index + 1) + '.png';
    counter.textContent = (index + 1) + ' / ' + SLIDE_COUNT;
    bar.style.width = SLIDE_COUNT > 1 ? Math.round((index / (SLIDE_COUNT - 1)) * 100) + '%' : '100%';
    prev.disabled = index === 0;
    next.disabled = index >= SLIDE_COUNT - 1;
    if (window.craftScorm) {
      window.craftScorm.setValue('cmi.core.lesson_location', String(index));
      var pct = SLIDE_COUNT > 1 ? Math.round((index / (SLIDE_COUNT - 1)) * 100) : 100;
      window.craftScorm.setValue('cmi.core.score.raw', String(pct));
      commitScorm();
    }
    window.clearTimeout(dwellTimer);
    if (!completed && index === SLIDE_COUNT - 1) {
      dwellTimer = window.setTimeout(markComplete, DWELL_COMPLETE_MS);
    }
  }
  function markComplete() {
    if (completed) return;
    completed = true;
    if (window.craftScorm) {
      window.craftScorm.setValue('cmi.core.lesson_status', 'completed');
      commitScorm();
    }
  }
  function go(n) { index = Math.max(0, Math.min(SLIDE_COUNT - 1, n)); render(); }

  prev.addEventListener('click', function () { go(index - 1); });
  next.addEventListener('click', function () { go(index + 1); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); go(index + 1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(index - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(SLIDE_COUNT - 1); }
  });

  window.addEventListener('DOMContentLoaded', function () {
    var startIndex = 0;
    if (window.craftScorm) {
      window.craftScorm.initialize();
      window.craftScorm.setValue('cmi.core.lesson_status', 'incomplete');
      startIndex = readSavedIndex(SLIDE_COUNT);
      commitScorm();
    }
    go(startIndex);
  });
  window.addEventListener('pagehide', function () {
    if (window.craftScorm) { commitScorm(); window.craftScorm.finish(); }
  });
}());
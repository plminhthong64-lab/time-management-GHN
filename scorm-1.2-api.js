(function (global) {
  'use strict';
  var FIND_DEPTH = 7;
  var api = null;
  var initialized = false;

  function findInWindow(win) {
    var depth = 0;
    while (win && !win.API && win.parent && win.parent !== win && depth < FIND_DEPTH) {
      win = win.parent;
      depth++;
    }
    return win && win.API ? win.API : null;
  }

  function findAPI() {
    var found = null;
    try { found = findInWindow(window); } catch (e) {}
    if (!found) {
      try {
        if (window.opener) found = findInWindow(window.opener);
      } catch (e) {}
    }
    return found;
  }

  function call(method, args) {
    if (!api) return '';
    try { return api[method].apply(api, args || []); } catch (e) { return ''; }
  }

  global.craftScorm = {
    initialize: function () {
      if (initialized) return true;
      api = findAPI();
      if (!api) return false;
      initialized = call('LMSInitialize', ['']) === 'true';
      return initialized;
    },
    setValue: function (key, value) {
      if (!initialized) return false;
      return call('LMSSetValue', [key, String(value)]) === 'true';
    },
    getValue: function (key) {
      if (!initialized) return '';
      return call('LMSGetValue', [key]);
    },
    commit: function () {
      if (!initialized) return false;
      return call('LMSCommit', ['']) === 'true';
    },
    finish: function () {
      if (!initialized) return false;
      var ok = call('LMSFinish', ['']) === 'true';
      initialized = false;
      return ok;
    },
    hasApi: function () { return !!api; }
  };
}(window));
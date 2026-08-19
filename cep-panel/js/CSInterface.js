/**
 * CSInterface.js - Adobe CEP (Common Extensibility Platform)
 * Stub/polyfill for development outside Adobe.
 * In production Adobe replaces this with the real CEP runtime.
 * Source: https://github.com/Adobe-CEP/CEP-Resources
 */

(function() {
  'use strict';

  function CSInterface() {
    this.hostEnvironment = {
      appName: typeof __adobe_cep__ !== 'undefined'
        ? JSON.parse(window.__adobe_cep__.getHostEnvironment()).appName
        : 'AEFT',
      appVersion: '24.0'
    };
  }

  CSInterface.prototype.getHostEnvironment = function() {
    if (typeof __adobe_cep__ !== 'undefined') {
      return JSON.parse(__adobe_cep__.getHostEnvironment());
    }
    return this.hostEnvironment;
  };

  CSInterface.prototype.evalScript = function(script, callback) {
    if (typeof __adobe_cep__ !== 'undefined') {
      window.__adobe_cep__.evalScript(script, callback);
    } else {
      // Dev mode fallback
      console.log('[CSInterface] evalScript:', script);
      if (callback) callback('dev-mode-result');
    }
  };

  CSInterface.prototype.getSystemPath = function(pathType) {
    if (typeof __adobe_cep__ !== 'undefined') {
      return __adobe_cep__.getSystemPath(pathType);
    }
    return '';
  };

  window.CSInterface = CSInterface;
})();

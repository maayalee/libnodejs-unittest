/*jshint esnext: true */
var assert = require('assert');

class TestRunner {
  constructor() {
    this._suites = [];
    this._result = '';
    this._shortResult = '';
    this._updateTimer = null;
    this._completeEvent = null;
    this._complete = false;
  }

  add(testSuite) {
    this._suites.push(testSuite);
  }

  run(completeEvent = function(){}) {
    this._completeEvent = completeEvent;
    var coroutine = this._runAsync();
    this._updateTimer = setInterval(function() {
      coroutine.next();
    }, 1);
  }
  
  *_runAsync() {
    for (var i = 0; i < this._suites.length; ++i) {
      this._suites[i].run();
      while (!this._suites[i].isComplete())
        yield;
      this._result += this._suites[i].summary();
      this._shortResult += this._suites[i].shortSummary();
    }
    this._completeEvent();
    this._complete = true;
    clearInterval(this._updateTimer);
  }

  isComplete() {
    return this._complete;
  }

  summary() {
    return this._result;
  }

  shortSummary() {
    return this._shortResult;
  }
}


module.exports = TestRunner;

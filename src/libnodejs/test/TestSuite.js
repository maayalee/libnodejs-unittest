/*jshint esnext: true */
var TestResult = require('./TestResult');

class TestSuite {
  constructor(suiteName) {
    this._suiteName = suiteName;
    this._log = '';
    this._testCases = [];
    this._testResult = null;
    this._updateTimer = null;
  }

  add(test_case) {
    this._testCases.push(test_case);
  }

  run() {
    var coroutine = this._runAsync();
    this._updateTimer = setInterval(function() {
      coroutine.next();
    }, 1);
  }
  
  *_runAsync() {
    this._testResult = new TestResult(this._suiteName);
    for (var i = 0; i < this._testCases.length; ++i) {
      this._testCases[i].run(this._testResult);
      while (!this._testCases[i].isComplete())
        yield;
    }
    clearInterval(this._updateTimer);
  }

  isComplete() {
    for (var i = 0; i < this._testCases.length; i++) {
      if (!this._testCases[i].isComplete()) {
        return false;
      }
    }
    return true;
  }

  summary() {
    return this._testResult.summary();
  }

  shortSummary() {
    return this._testResult.shortSummary();
  }

  log() {
    return this._log;
  }
}

module.exports = TestSuite;

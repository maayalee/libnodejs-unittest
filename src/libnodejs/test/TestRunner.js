/*jshint esnext: true */
var assert = require('assert');

class TestRunner {
  constructor() {
    this.suites = [];
    this.result = '';
    this.shortResult = '';
    this.interval = null;
    this.completeEvent = null;
    this.currentSuite = null;
    this.currentSuiteCount = 0;
  }

  add(testSuite) {
    this.suites.push(testSuite);
  }

  run(completeEvent = function(){}) {
    assert(completeEvent !== undefined);

    this.completeEvent = completeEvent;
    if (this.suites.length > 0) {
      this.currentSuiteCount = 0;
      this.currentSuite = this.suites[this.currentSuiteCount];
      this.currentSuite.run();

      var that = this;
      this.interval = setInterval(function() {
        that._update();
      }, 1);
    }
    else {
      this.completeEvent();
    }
  }

  _update() { 
    if (this.currentSuite.isComplete()) {
      this.result += this.currentSuite.summary();
      this.shortResult += this.currentSuite.shortSummary();
      this.currentSuiteCount++;
      if (this.currentSuiteCount === this.suites.length) {
        clearInterval(this.interval);
        this.completeEvent();
      }
      else {
        this.currentSuite = this.suites[this.currentSuiteCount];
        this.currentSuite.run();
      }
    }
  }

  isComplete() {
    var count = 0;
    for (var i = 0; i < this.suites.length; ++i) {
      if (this.suites[i].isComplete()) {
        count++;
      }
    }
    return count === this.suites.length;
  }

  summary() {
    return this.result;
  }

  shortSummary() {
    return this.shortResult;
  }
}


module.exports = TestRunner;

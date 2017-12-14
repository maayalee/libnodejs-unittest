/*jshint esnext: true */
var assert = require('assert');

function TestRunner() {
  this.suites = [];
  this.result = '';
  this.shortResult = '';
  this.interval = null;
  this.completeEvent = null;
  this.currentSuite = null;
  this.currentSuiteCount = 0;
}

TestRunner.prototype.add = function(testSuite) {
  this.suites.push(testSuite);
};

TestRunner.prototype.run = function(completeEvent) {
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
};

TestRunner.prototype._update = function() { 
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
};

TestRunner.prototype.isComplete = function() {
  var count = 0;
  for (var i = 0; i < this.suites.length; ++i) {
    if (this.suites[i].isComplete()) {
      count++;
    }
  }
  return count === this.suites.length;
};

TestRunner.prototype.summary = function() {
  return this.result;
};

TestRunner.prototype.shortSummary = function() {
  return this.shortResult;
};


module.exports = TestRunner;

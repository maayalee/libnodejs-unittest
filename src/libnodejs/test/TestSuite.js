/*jshint esnext: true */
var TestResult = require('./TestResult');

class TestSuite {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.log = '';
    this.testCases = [];
    this.testResult = null;
    this.currentTestCaseCount = 0;
    this.currentTestCase = null;
    this.interval = null;
  }

  add(test_case) {
    this.testCases.push(test_case);
  }

  run() {
    this.testResult = new TestResult(this.suiteName);

    if (this.testCases.length > 0) {
      this.currentTestCaseCount = 0;
      this.currentTestCase = this.testCases[this.currentTestCaseCount];
      this.currentTestCase.run(this.testResult);
      var that = this;
      this.interval = setInterval(function() {
        that._update();
      }, 1);
    }
  }

  _update() {
    if (this.currentTestCase.isComplete()) {
      this.currentTestCaseCount++;
      if (this.currentTestCaseCount === this.testCases.length) {
        clearInterval(this.interval);
      }
      else {
        this.currentTestCase = this.testCases[this.currentTestCaseCount];
        this.currentTestCase.run(this.testResult);
      }
    }
  }

  isComplete() {
    for (var i = 0; i < this.testCases.length; i++) {
      if (!this.testCases[i].isComplete()) {
        return false;
      }
    }
    return true;
  }

  summary() {
    return this.testResult.summary();
  }

  shortSummary() {
    return this.testResult.shortSummary();
  }

  log() {
    return this.log;
  }
}

module.exports = TestSuite;

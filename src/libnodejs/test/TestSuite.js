var TestResult = require('./TestResult');

function TestSuite(suiteName) {
  this.suiteName = suiteName;
  this.log = '';
  this.testCases = [];
  this.testResult = null;
  this.currentTestCaseCount = 0;
  this.currentTestCase = null;
  this.interval = null;
}

TestSuite.prototype.add = function(test_case) {
  this.testCases.push(test_case);
};

TestSuite.prototype.run = function() {
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
};

TestSuite.prototype._update = function() {
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
};

TestSuite.prototype.isComplete = function() {
  for (var i = 0; i < this.testCases.length; i++) {
    if (!this.testCases[i].isComplete()) {
      return false;
    }
  }
  return true;
};

TestSuite.prototype.summary= function() {
  return this.testResult.summary();
};

TestSuite.prototype.shortSummary= function() {
  return this.testResult.shortSummary();
};

TestSuite.prototype.log = function() {
  return this.log;
};

module.exports = TestSuite;

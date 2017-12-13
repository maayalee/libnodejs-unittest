
function TestRunner() {
  this.suites = [];
  this.result = '';
  this.shortResult = '';
  this.interval = null;
  this.complete_event = null;
  this.currentSuite = null;
  this.currentSuiteCount = 0;
}

TestRunner.prototype.add = function(test_suite) {
  this.suites.push(test_suite);
};

TestRunner.prototype.run = function(complete_event) {
  this.complete_event = complete_event;
  
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
    this.complete_event();
  }
};

TestRunner.prototype._update = function() { 
  if (this.currentSuite.isComplete()) {
    this.result += this.currentSuite.summary();
    this.shortResult += this.currentSuite.shortSummary();
    this.currentSuiteCount++;
    if (this.currentSuiteCount === this.suites.length) {
      clearInterval(this.interval);
      this.complete_event();
    }
    else {
      this.currentSuite = this.suites[this.currentSuiteCount];
      this.currentSuite.run();
    }
  }
};

TestRunner.prototype.summary = function() {
  return this.result;
};

TestRunner.prototype.shortSummary = function() {
  return this.shortResult;
};


module.exports = TestRunner;

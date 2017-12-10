var TestResult = require('./TestResult');

function TestSuite(suite_name) {
  this.suite_name = suite_name;
  this.log = '';
  this.test_cases = [];
  this.test_result = null;
  this.current_test_case_count = 0;
  this.current_test_case = null;
  this.interval = null;
}

TestSuite.prototype.add = function(test_case) {
  this.test_cases.push(test_case);
}

TestSuite.prototype.run = function() {
  this.test_result = new TestResult(this.suite_name);

  if (this.test_cases.length > 0) {
    this.current_test_case_count = 0;
    this.current_test_case = this.test_cases[this.current_test_case_count];
    this.current_test_case.run(this.test_result);
    var that = this;
    this.interval = setInterval(function() {
      that._update();
    }, 1);
  }
}

TestSuite.prototype._update = function() {
  if (this.current_test_case.is_complete()) {
    this.current_test_case_count++;
    if (this.current_test_case_count == this.test_cases.length) {
      clearInterval(this.interval);
    }
    else {
      this.current_test_case = this.test_cases[this.current_test_case_count];
      this.current_test_case.run(this.test_result);
    }
  }
}

TestSuite.prototype.is_complete = function() {
  for (var i = 0; i < this.test_cases.length; i++) {
    if (!this.test_cases[i].is_complete())
      return false;
  }
  return true;
}

TestSuite.prototype.summary= function() {
  return this.test_result.summary();
}

TestSuite.prototype.short_summary= function() {
  return this.test_result.short_summary();
}

TestSuite.prototype.log = function() {
  return this.log;
}

module.exports = TestSuite;

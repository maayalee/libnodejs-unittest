var sys  = require('sys');

function TestRunner() {
  this.suites = [];
  this.result = '';
  this.short_result = '';
  this.interval = null;
  this.complete_event = null;
  this.current_suite = null;
  this.current_suite_count = 0;
}

TestRunner.prototype.add = function(test_suite) {
  this.suites.push(test_suite);
}

TestRunner.prototype.run = function(complete_event) {
  this.complete_event = complete_event;

  if (this.suites.length > 0) {
    this.current_suite_count = 0;
    this.current_suite = this.suites[this.current_suite_count];
    this.current_suite.run();

    var that = this;
    this.interval = setInterval(function() {
      that._update();
    }, 1);
  }
  else {
    this.complete_event();
  }
}

TestRunner.prototype._update = function() { 
  if (this.current_suite.is_complete()) {
    this.result += this.current_suite.summary();
    this.short_result += this.current_suite.short_summary();
    this.current_suite_count++;
    if (this.current_suite_count == this.suites.length) {
      clearInterval(this.interval);
      this.complete_event();
    }
    else {
      this.current_suite = this.suites[this.current_suite_count];
      this.current_suite.run();
    }
  }
}

TestRunner.prototype.summary = function() {
  return this.result;
}

TestRunner.prototype.short_summary = function() {
  return this.short_result;
}


module.exports = TestRunner;

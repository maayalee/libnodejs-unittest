var util = require('util');

function TestResult(suiteName) {
  this.suiteName = suiteName;
  this.runCount = 0;
  this.failCount = 0;
  this.failMethods = [];
}

TestResult.prototype.test_started = function() {
  this.runCount++;
};

TestResult.prototype.test_failed = function(method_name, failed_message) {
  this.failCount++;
  this.failMethods.push({'name':method_name, 'message':failed_message});
};

TestResult.prototype.summary = function() {
  return this.suiteName + ': ' + this.runCount + ' run ' + this.failCount + ' failed' + '\n' +
          this.getFailedMessages();
};

TestResult.prototype.shortSummary = function() {
  return this.suiteName + ': ' + this.runCount + ' run ' + this.failCount + ' failed' + '\n' +
          this.getShortFailedMethods();
};

TestResult.prototype.getFailedMessages = function() {
  var result = '';
  this.failMethods.forEach(function(value) {
    var message = util.format('> Method: %s\n%s\n', value.name, value.message);
    result += message;
  });
  return result;
};

TestResult.prototype.getShortFailedMethods = function() {
  var result = '';
  this.failMethods.forEach(function(value) {
    var message = util.format('%s\n', value.name);
    result += message;
  });
  return result;
};

module.exports = TestResult;

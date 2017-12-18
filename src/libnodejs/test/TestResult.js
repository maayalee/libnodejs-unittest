/*jshint esnext: true */
var util = require('util');

class TestResult {
  constructor(suiteName) {
    this.suiteName = suiteName;
    this.runCount = 0;
    this.failCount = 0;
    this.failMethods = [];
  }

  test_started() {
    this.runCount++;
  }

  test_failed(method_name, failed_message) {
    this.failCount++;
    this.failMethods.push({'name':method_name, 'message':failed_message});
  }

  summary() {
    return this.suiteName + ': ' + this.runCount + ' run ' + this.failCount + ' failed' + '\n' +
    this.getFailedMessages();
  }

  shortSummary() {
    return this.suiteName + ': ' + this.runCount + ' run ' + this.failCount + ' failed' + '\n' +
    this.getShortFailedMethods();
  }

  getFailedMessages() {
    var result = '';
    this.failMethods.forEach(function(value) {
      var message = util.format('> Method: %s\n%s\n', value.name, value.message);
      result += message;
    });
    return result;
  }

  getShortFailedMethods() {
    var result = '';
    this.failMethods.forEach(function(value) {
      var message = util.format('%s\n', value.name);
      result += message;
    });
    return result;
  }
}
module.exports = TestResult;

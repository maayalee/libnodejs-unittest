/*jshint esnext: true */
var util = require('util');

class TestResult {
  constructor(suiteName) {
    this._suiteName = suiteName;
    this._runCount = 0;
    this._failCount = 0;
    this._failMethods = [];
  }

  testStarted() {
    this._runCount++;
  }

  testFailed(method_name, failed_message) {
    this._failCount++;
    this._failMethods.push({'name':method_name, 'message':failed_message});
  }

  summary() {
    return this._suiteName + ': ' + this._runCount + ' run ' + this._failCount + ' failed' + '\n' +
    this.getFailedMessages();
  }

  shortSummary() {
    return this._suiteName + ': ' + this._runCount + ' run ' + this._failCount + ' failed' + '\n' +
    this.getShortFailedMethods();
  }

  getFailedMessages() {
    var result = '';
    this._failMethods.forEach(function(value) {
      var message = util.format('> Method: %s\n%s\n', value.name, value.message);
      result += message;
    });
    return result;
  }

  getShortFailedMethods() {
    var result = '';
    this._failMethods.forEach(function(value) {
      var message = util.format('%s\n', value.name);
      result += message;
    });
    return result;
  }
}
module.exports = TestResult;

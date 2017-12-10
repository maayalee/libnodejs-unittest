var util = require('util');

function TestResult(suite_name) {
  this.suite_name = suite_name;
  this.run_count = 0;
  this.fail_count = 0;
  this.fail_methods = [];
}

TestResult.prototype.test_started = function() {
  this.run_count++;
}

TestResult.prototype.test_failed = function(method_name, failed_message) {
  this.fail_count++;
  this.fail_methods.push({'name':method_name, 'message':failed_message});
}

TestResult.prototype.summary = function() {
  return this.suite_name + ': ' + this.run_count + ' run ' + this.fail_count + ' failed' + '\n' +
          this.get_failed_messages();
}

TestResult.prototype.short_summary = function() {
  return this.suite_name + ': ' + this.run_count + ' run ' + this.fail_count + ' failed' + '\n' +
          this.get_short_failed_methods();
}

TestResult.prototype.get_failed_messages = function() {
  var result = '';
  this.fail_methods.forEach(function(value) {
    var message = util.format('> Method: %s\n%s\n', value.name, value.message);
    result += message;
  });
  return result;
}

TestResult.prototype.get_short_failed_methods = function() {
  var result = '';
  this.fail_methods.forEach(function(value) {
    var message = util.format('%s\n', value.name);
    result += message;
  });
  return result;
}

module.exports = TestResult;

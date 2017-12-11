var assert = require('assert');
var WasRun = require('./WasRun');
var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');
var TestRunner = require('../../../../src/libnodejs/test/TestRunner');


function TestRunnerTest(method_name) {
  TestCase.call(this, method_name);
}

TestRunnerTest.prototype = new TestCase();
TestRunnerTest.constructor = TestRunnerTest;

TestRunnerTest.prototype.test_run = function() {
  var runner = new Test_Runner();
  runner.add(Was_Run.create_suite());
  runner.run(function() {
    assert(runner.short_summary() == 'Was_Run: 3 run 1 failed\ntest_broken_method\n');
  });
}

TestRunnerTest.create_suite = function() {
  var suite = new TestSuite('TestRunnerTest');
  suite.add(new TestRunnerTest('test_run'));
  return suite;
}

module.exports = TestRunnerTest;
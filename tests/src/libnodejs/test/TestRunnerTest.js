/*jshint esnext: true */
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
  var runner = new TestRunner();
  runner.add(WasRun.createSuite());
  runner.run(()=>{});
  this.waitsFor(function() {
    return runner.isComplete();
  });
  this.runs(function() {
    assert(runner.shortSummary() === 'WasRun: 3 run 1 failed\ntestBrokenMethod\n');
  });
};

TestRunnerTest.createSuite = function() {
  var suite = new TestSuite('TestRunnerTest');
  suite.add(new TestRunnerTest('test_run'));
  return suite;
};

module.exports = TestRunnerTest;
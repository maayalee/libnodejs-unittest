/*jshint esnext: true */
var assert = require('assert');
var WasRun = require('./WasRun');
var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');
var TestRunner = require('../../../../src/libnodejs/test/TestRunner');

class TestRunnerTest extends TestCase {
  constructor(method_name) {
    super(method_name);
  }

  testRun() {
    var runner = new TestRunner();
    runner.add(WasRun.createSuite());
    runner.run();
    this._waitsFor(function() {
      return !runner.isComplete();
    }, 1000);
    this._runs(function() {
      assert(runner.shortSummary() === 'WasRun: 3 run 1 failed\ntestBrokenMethod\n');
    });
  }

  static createSuite() {
    var suite = new TestSuite('TestRunnerTest');
    suite.add(new TestRunnerTest('testRun'));
    return suite;
  }
}

module.exports = TestRunnerTest;
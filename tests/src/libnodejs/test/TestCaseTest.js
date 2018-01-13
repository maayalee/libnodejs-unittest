/*jshint esnext: true */
var assert = require('assert');
var WasRun = require('./WasRun');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');
var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestResult = require('../../../../src/libnodejs/test/TestResult');

class TestCaseTest extends TestCase {
  constructor(methodName) {
    super(methodName);
    this.wasRunTestResult = new TestResult('WasRun');
  }

  testMethod() {
    var wasRun = new WasRun('testMethod');
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    this.runs(function() {
      assert(wasRun.log === 'setUp testMethod tearDown ');
    });
  }

  testBrokenMethod() {
    var wasRun = new WasRun('testBrokenMethod');
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    var that = this;
    this.runs(function() {
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestBrokenMethod\n');
    });
  }

  testAsyncBrokenMethod() {
    var wasRun = new WasRun('testAsyncBrokenMethod');
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    var that = this;
    this.runs(function() {
      assert(wasRun.log === 'setUp testAsyncBrokenMethod exception tearDown ');
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestAsyncBrokenMethod\n');
    });
  }

  static createSuite() {
    var suite = new TestSuite('TestCaseTest');
    suite.add(new TestCaseTest('testMethod'));
    suite.add(new TestCaseTest('testBrokenMethod'));
    suite.add(new TestCaseTest('testAsyncBrokenMethod'));
    return suite;
  }
}
module.exports = TestCaseTest;
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
    var that = this;
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    this.runs(function() {
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestBrokenMethod\n');
    });
  }

  testAsyncBrokenMethod() {
    var wasRun = new WasRun('testAsyncBrokenMethod');
    var that = this;
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    this.runs(function() {
      assert(wasRun.log === 'setUp testAsyncBrokenMethod exception tearDown ');
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestAsyncBrokenMethod\n');
    });
  }

  testBrokenSetUp() {
    var wasRun = new WasRun('testBrokenSetUp');
    wasRun.raiseExceptionWhenSetUp = true;
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    var that = this;
    this.runs(function() {
      assert(wasRun.log === 'setUp tearDown ');
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestBrokenSetUp\n');
    });
  }

  testAsyncBrokenSetUp() {
    var wasRun = new WasRun('testAsyncBrokenSetUp');
    wasRun.raiseAsyncExceptionWhenSetUp = true;
    var that = this;
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    this.runs(function() {
      assert(wasRun.log === 'setUp tearDown ');
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestAsyncBrokenSetUp\n');
    });
  }

  testBrokenTearDown() {
    var wasRun = new WasRun('testBrokenTearDown');
    wasRun.raiseExceptionWhenTearDown = true;
    var that = this;
    wasRun.run(this.wasRunTestResult, function() {
      assert(wasRun.log === 'setUp testBrokenTearDown tearDown ');
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestBrokenTearDown\n');
    });
  }

  testAsyncBrokenTearDown() {
    var wasRun = new WasRun('testAsyncBrokenTearDown');
    wasRun.raiseExceptionWhenTearDown = true;
    var that = this;
    wasRun.run(this.wasRunTestResult);
    this.waitsFor(function() {
      return wasRun.isComplete();
    });
    this.runs(function() {
      assert(wasRun.log === 'setUp testAsyncBrokenTearDown tearDown ');
      assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestAsyncBrokenTearDown\n');
    });
  }


  static createSuite() {
    var suite = new TestSuite('TestCaseTest');
    suite.add(new TestCaseTest('testMethod'));
    suite.add(new TestCaseTest('testBrokenMethod'));
    suite.add(new TestCaseTest('testAsyncBrokenMethod'));
    suite.add(new TestCaseTest('testBrokenSetUp'));
    suite.add(new TestCaseTest('testAsyncBrokenSetUp'));
    suite.add(new TestCaseTest('testBrokenTearDown'));
    suite.add(new TestCaseTest('testAsyncBrokenTearDown'));
    return suite;
  }
}
module.exports = TestCaseTest;
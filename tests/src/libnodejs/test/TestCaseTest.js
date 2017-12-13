var assert = require('assert');
var WasRun = require('./WasRun');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');
var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestResult = require('../../../../src/libnodejs/test/TestResult');

function TestCaseTest(methodName) {
  TestCase.call(this, methodName);
  this.wasRunTestResult = new TestResult('WasRun');
}

TestCaseTest.prototype = new TestCase();
TestCaseTest.constructor = TestCaseTest;

TestCaseTest.prototype.testMethod = function() {
  var wasRun = new WasRun('testMethod');
  wasRun.run(this.wasRunTestResult);
  this.waitsFor(function() {
    return wasRun.isComplete();
  });
  this.runs(function() {
    assert(wasRun.log === 'setUp testMethod tearDown ');
  });
};

TestCaseTest.prototype.testBrokenMethod = function() {
  var wasRun = new WasRun('testBrokenMethod');
  var that = this;
  wasRun.run(this.wasRunTestResult);
  this.waitsFor(function() {
    return wasRun.isComplete();
  });
  this.runs(function() {
    assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestBrokenMethod\n');
  });
};

TestCaseTest.prototype.testAsyncBrokenMethod = function() {
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
};

TestCaseTest.prototype.testBrokenSetUp = function() {
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
};

TestCaseTest.prototype.testAsyncBrokenSetUp = function() {
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
};

TestCaseTest.prototype.testBrokenTearDown = function() {
  var wasRun = new WasRun('testBrokenTearDown');
  wasRun.raiseExceptionWhenTearDown = true;
  var that = this;
  wasRun.run(this.wasRunTestResult, function() {
    assert(wasRun.log === 'setUp testBrokenTearDown tearDown ');
    assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestBrokenTearDown\n');
  });
};

TestCaseTest.prototype.testAsyncBrokenTearDown = function() {
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
};

TestCaseTest.prototype.testTimeoutBrokenMethod = function() {
  // Was_Run 실행시에도 내부에서 예외 리스너를 등록한다. 비동기 함수(SetTimeout)에서 일어난 예외를 잡는 테스트를 위해 리스너를 제거한다. 
  // 제거하지 않으면 Was_Run에서 일어난 예외로 인해 Test_Case_Test도 예외가 발생해서 테스트가 실패한다.
  process.removeListener('uncaughtException', this.exceptionHandler);

  var wasRun = new WasRun('testTimeoutBrokenMethod');
  wasRun.run(this.wasRunTestResult);
  this.waitsFor(function() {
    return wasRun.isComplete();
  });
  var that = this;
  // 
  this.waits(200);
  this.runs(function() {
    assert(wasRun.log === 'setUp testTimeoutBrokenMethod exception tearDown ');
    assert(that.wasRunTestResult.shortSummary() === 'WasRun: 1 run 1 failed\ntestTimeoutBrokenMethod\n');
    process.addListener('uncaughtException', that.exceptionHandler);
  }, 100);
};

TestCaseTest.create_suite = function() {
  var suite = new TestSuite('TestCaseTest');
  suite.add(new TestCaseTest('testMethod'));
  suite.add(new TestCaseTest('testBrokenMethod'));
  suite.add(new TestCaseTest('testAsyncBrokenMethod'));
  suite.add(new TestCaseTest('testTimeoutBrokenMethod'));
  suite.add(new TestCaseTest('testBrokenSetUp'));
  suite.add(new TestCaseTest('testAsyncBrokenSetUp'));
  suite.add(new TestCaseTest('testBrokenTearDown'));
  suite.add(new TestCaseTest('testAsyncBrokenTearDown'));
  return suite;
};

module.exports = TestCaseTest;
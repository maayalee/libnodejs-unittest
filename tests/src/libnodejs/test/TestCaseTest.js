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
  var was_run = new WasRun('testMethod');
  was_run.run(this.wasRunTestResult, function() {
    assert(was_run.log == 'set_up testMethod tear_down');
  });
}

TestCaseTest.prototype.testBrokenMethod = function() {
  var was_run = new WasRun('testBrokenMethod');
  var that = this;
  was_run.run(this.wasRunTestResult, function() {
    assert(that.wasRunTestResult.short_summary() == 'WasRun: 1 run 1 failed\ntestBrokenMethod\n');
  });
}

TestCaseTest.prototype.testAsyncBrokenMethod = function() {
  var was_run = new WasRun('testAsyncBrokenMethod');
  var that = this;
  was_run.run(this.wasRunTestResult, function() {
    assert(that.wasRunTestResult.short_summary() == 'WasRun: 1 run 1 failed\ntestAsyncBrokenMethod\n');
  });
}

TestCaseTest.prototype.testBrokenSetup = function() {
  var was_run = new WasRun('testBrokenSetup');
  was_run.raise_excption_when_set_up = true;
  var that = this;
  was_run.run(this.wasRunTestResult, function() {
    assert(was_run.log == 'set_up tear_down');
    assert(that.wasRunTestResult.short_summary() == 'WasRun: 1 run 1 failed\ntestBrokenSetup\n');
  });
}

TestCaseTest.prototype.testAsyncBrokenSetup = function() {
  var was_run = new WasRun('testAsyncBrokenSetup');
  was_run.raise_async_excption_when_set_up = true;
  var that = this;
  was_run.run(this.wasRunTestResult, function() {
    assert(was_run.log == 'set_up tear_down');
    assert(that.wasRunTestResult.short_summary() == 'WasRun: 1 run 1 failed\ntestAsyncBrokenSetup\n');
  });
}

TestCaseTest.prototype.testBrokenTearDown = function() {
  var was_run = new WasRun('testBrokenTearDown');
  was_run.raise_excption_when_tear_down = true;
  var that = this;
  was_run.run(this.wasRunTestResult, function() {
    assert(was_run.log == 'set_up testBrokenTearDown tear_down');
    assert(that.wasRunTestResult.short_summary() == 'WasRun: 1 run 1 failed\ntestBrokenTearDown\n');
  });
}

TestCaseTest.prototype.testAsyncBrokenTearDown = function() {
  var was_run = new WasRun('testAsyncBrokenTearDown');
  was_run.raise_excption_when_tear_down = true;
  var that = this;
  was_run.run(this.wasRunTestResult, function() {
    assert(was_run.log == 'set_up testAsyncBrokenTearDown tear_down');
    assert(that.wasRunTestResult.short_summary() == 'WasRun: 1 run 1 failed\ntestAsyncBrokenTearDown\n');
  });
}

TestCaseTest.prototype.testSettimeoutBrokenMethod = function() {
  // WasRun 실행시에도 내부에서 예외 리스너를 등록한다. 비동기 함수에서 일어난
  // 예외를 잡는 테스트를 위해 리스너를 제거한다.
  // 제거하지 않으면 WasRun에서 일어난 예외로 인해 TestCaseTest도 예외가 발생해서
  // 테스트가 실패한다.
  process.removeListener('uncaughtException', this.exceptionHandler);

  var was_run = new WasRun('testSettimeoutBrokenMethod');
  var was_run_complete = false;
  var that = this;
  was_run.run(this.wasRunTestResult, function() {
    was_run_complete = true;
  });

  this.waits_for(function() {
    return was_run_complete;
  });

  this.runs(function() {
    that.assert(was_run.log == 'set_up exception tear_down');
    that.assert(that.wasRunTestResult.short_summary() == 'WasRun: 1 run 1 failed\ntestSettimeoutBrokenMethod\n');
  });
}


TestCaseTest.create_suite = function() {
  var suite = new TestSuite('TestCaseTest');
  suite.add(new TestCaseTest('testMethod'));
  suite.add(new TestCaseTest('testBrokenMethod'));
  suite.add(new TestCaseTest('testAsyncBrokenMethod'));
  suite.add(new TestCaseTest('testBrokenSetup'));
  suite.add(new TestCaseTest('testAsyncBrokenSetup'));
  suite.add(new TestCaseTest('testBrokenTearDown'));
  suite.add(new TestCaseTest('testAsyncBrokenTearDown'));
  suite.add(new TestCaseTest('testSettimeoutBrokenMethod'));
  return suite;
}

module.exports = TestCaseTest;
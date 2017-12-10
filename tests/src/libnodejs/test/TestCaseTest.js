var assert = require('assert');
var WasRun = require('./WasRun');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');
var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestResult = require('../../../../src/libnodejs/test/TestResult');

function TestCaseTest(method_name) {
  TestCase.call(this, method_name);
  this.was_run_test_result = new TestResult('WasRun');
}

TestCaseTest.prototype = new TestCase();
TestCaseTest.constructor = TestCaseTest;

TestCaseTest.prototype.test_method = function() {
  var was_run = new WasRun('test_method');
  was_run.run(this.was_run_test_result, function() {
    assert(was_run.log == 'set_up test_method tear_down');
  });
}

TestCaseTest.prototype.test_broken_method = function() {
  var was_run = new WasRun('test_broken_method');
  var that = this;
  was_run.run(this.was_run_test_result, function() {
    assert(that.was_run_test_result.short_summary() == 'WasRun: 1 run 1 failed\ntest_broken_method\n');
  });
}

TestCaseTest.prototype.test_async_broken_method = function() {
  var was_run = new WasRun('test_async_broken_method');
  var that = this;
  was_run.run(this.was_run_test_result, function() {
    assert(that.was_run_test_result.short_summary() == 'WasRun: 1 run 1 failed\ntest_async_broken_method\n');
  });
}

TestCaseTest.prototype.test_broken_set_up = function() {
  var was_run = new WasRun('test_broken_set_up');
  was_run.raise_excption_when_set_up = true;
  var that = this;
  was_run.run(this.was_run_test_result, function() {
    assert(was_run.log == 'set_up tear_down');
    assert(that.was_run_test_result.short_summary() == 'WasRun: 1 run 1 failed\ntest_broken_set_up\n');
  });
}

TestCaseTest.prototype.test_async_broken_set_up = function() {
  var was_run = new WasRun('test_async_broken_set_up');
  was_run.raise_async_excption_when_set_up = true;
  var that = this;
  was_run.run(this.was_run_test_result, function() {
    assert(was_run.log == 'set_up tear_down');
    assert(that.was_run_test_result.short_summary() == 'WasRun: 1 run 1 failed\ntest_async_broken_set_up\n');
  });
}

TestCaseTest.prototype.test_broken_tear_down = function() {
  var was_run = new WasRun('test_broken_tear_down');
  was_run.raise_excption_when_tear_down = true;
  var that = this;
  was_run.run(this.was_run_test_result, function() {
    assert(was_run.log == 'set_up test_broken_tear_down tear_down');
    assert(that.was_run_test_result.short_summary() == 'WasRun: 1 run 1 failed\ntest_broken_tear_down\n');
  });
}

TestCaseTest.prototype.test_async_broken_tear_down = function() {
  var was_run = new WasRun('test_async_broken_tear_down');
  was_run.raise_excption_when_tear_down = true;
  var that = this;
  was_run.run(this.was_run_test_result, function() {
    assert(was_run.log == 'set_up test_async_broken_tear_down tear_down');
    assert(that.was_run_test_result.short_summary() == 'WasRun: 1 run 1 failed\ntest_async_broken_tear_down\n');
  });
}

TestCaseTest.prototype.test_settimeout_broken_method = function() {
  // WasRun 실행시에도 내부에서 예외 리스너를 등록한다. 비동기 함수에서 일어난
  // 예외를 잡는 테스트를 위해 리스너를 제거한다.
  // 제거하지 않으면 WasRun에서 일어난 예외로 인해 TestCaseTest도 예외가 발생해서
  // 테스트가 실패한다.
  process.removeListener('uncaughtException', this.exception_handler);

  var was_run = new WasRun('test_settimeout_broken_method');
  var was_run_complete = false;
  var that = this;
  was_run.run(this.was_run_test_result, function() {
    was_run_complete = true;
  });

  this.waits_for(function() {
    return was_run_complete;
  });

  this.runs(function() {
    that.assert(was_run.log == 'set_up exception tear_down');
    that.assert(that.was_run_test_result.short_summary() == 'WasRun: 1 run 1 failed\ntest_settimeout_broken_method\n');
  });
}


TestCaseTest.create_suite = function() {
  var suite = new TestSuite('TestCaseTest');
  suite.add(new TestCaseTest('test_method'));
  suite.add(new TestCaseTest('test_broken_method'));
  suite.add(new TestCaseTest('test_async_broken_method'));
  suite.add(new TestCaseTest('test_broken_set_up'));
  suite.add(new TestCaseTest('test_async_broken_set_up'));
  suite.add(new TestCaseTest('test_broken_tear_down'));
  suite.add(new TestCaseTest('test_async_broken_tear_down'));
  suite.add(new TestCaseTest('test_settimeout_broken_method'));
  return suite;
}

module.exports = TestCaseTest;
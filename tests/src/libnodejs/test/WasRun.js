var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');

function WasRun(methodName) {
  TestCase.call(this, methodName);
  this.log = '';
  this.raisExceptionWhenSetUp = false;
  this.raiseAsyncExceptionWhenSetUp = false;
  this.raiseExceptionWhenTearDown = false;
  this.raiseAsyncExceptionWhenTearDown = false;
} 
WasRun.prototype = new TestCase();
WasRun.prototype.constructor = WasRun;

WasRun.prototype.setUp = function() {
  this.log += 'setUp ';
  if (this.raisExceptionWhenSetUp)
    throw new Error("test exception");
  if (this.raiseAsyncExceptionWhenSetUp) {
    this.set_timeout(function() {
      throw new Error('test async exception');
    }, 1);
  }
}

WasRun.prototype.testMethod = function() {
  this.log += 'testMethod ';
}

WasRun.prototype.tear_down = function() {
  this.log += 'tear_down';
  if (this.raiseExceptionWhenTearDown)
    throw new Error('test exception');
  if (this.raiseAsyncExceptionWhenTearDown) {
    this.set_timeout(function() {
      throw new Error('test async exception');
    }, 1);
  }
}

WasRun.prototype.testBrokenMethod = function() {
  throw new Error("test exception");
}

WasRun.prototype.test_async_broken_method = function() {
  this.set_timeout(function() {
    throw new Error('test async exception');
  });
}

WasRun.prototype.testSettimeoutBrokenMethod = function() {
  // 두번째 방법: set_timeout 함수를 이용하여 비동기 함수 호출
  // set_timout 함수는 내부에서 자동으로 시간을 계산해서 timeout 처리후
  // 다음 테스트 케이스로 넘어간다.
  // -> domain 모듈을 로직을 처리하므로 set_timeout과 setTimout을 섞어써도 
  // 예외를 잡을 수 있다.
  /*
  var that = this;
  this.runs_timeout(function() {
    that.runs_timeout(function() {
      that.log += 'exception ';
      throw new Error('test async exception');
    }, 1);
  }, 1);
  */

  // 첫번째 방법: 기본 비동기 함수 호출하기. setTimeout실행후 
  // 다음 테스트 케이스가 실행되도록 wait함수를 호출한다.
  // process에 등록한 이벤트로 예외를 잡을 수 밖에 없다.
  /*
  var that = this;
  setTimeout(function() {
   setTimeout(function() {
      that.log += 'exception ';
      throw new Error('test async exception');
    }, 1);
  }, 1);
  that.waits(5);
  */

  var that = this;
  setTimeout(function() {
    that.log += 'exception ';
    throw new Error('test async exception');
  }, 1);
  that.waits(10);
}

WasRun.prototype.testBrokenSetup = function() {
  this.log += 'testBrokenSetup ';
}

WasRun.prototype.testAsyncBrokenSetUp = function() {
  this.log += 'testAsyncBrokenSetUp ';
}

WasRun.prototype.testBrokenTearDown = function() {
  this.log += 'testBrokenTearDown ';
}

WasRun.prototype.testAsyncBrokenTearDown = function() {
  this.log += 'testAsyncBrokenTearDown ';
}

WasRun.prototype.log = function() {
  return this.log;
}

WasRun.prototype.raisExceptionWhenSetUp = function(enable) {
  this.raisExceptionWhenSetUp = enable;
}

WasRun.create_suite = function() {
  var suite = new TestSuite('WasRun');
  suite.add(new WasRun('testMethod'));
  suite.add(new WasRun('testBrokenMethod'));
  suite.add(new WasRun('testBrokenSetup'));
  return suite;
}

module.exports = WasRun;

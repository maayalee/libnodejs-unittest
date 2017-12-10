var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');

function WasRun(method_name) {
  TestCase.call(this, method_name);
  this.log = '';
  this.raise_excption_when_set_up = false;
  this.raise_async_excption_when_set_up = false;
  this.raise_excption_when_tear_down = false;
  this.raise_async_excption_when_tear_down = false;
} 
WasRun.prototype = new TestCase();
WasRun.prototype.constructor = WasRun;

WasRun.prototype.set_up = function() {
  this.log += 'set_up ';
  if (this.raise_excption_when_set_up)
    throw new Error("test exception");
  if (this.raise_async_excption_when_set_up) {
    this.set_timeout(function() {
      throw new Error('test async exception');
    }, 1);
  }
}

WasRun.prototype.test_method = function() {
  this.log += 'test_method ';
}

WasRun.prototype.tear_down = function() {
  this.log += 'tear_down';
  if (this.raise_excption_when_tear_down)
    throw new Error('test exception');
  if (this.raise_async_excption_when_tear_down) {
    this.set_timeout(function() {
      throw new Error('test async exception');
    }, 1);
  }
}

WasRun.prototype.test_broken_method = function() {
  throw new Error("test exception");
}

WasRun.prototype.test_async_broken_method = function() {
  this.set_timeout(function() {
    throw new Error('test async exception');
  });
}

WasRun.prototype.test_settimeout_broken_method = function() {
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

WasRun.prototype.test_broken_set_up = function() {
  this.log += 'test_broken_set_up ';
}

WasRun.prototype.test_async_broken_set_up = function() {
  this.log += 'test_async_broken_set_up ';
}

WasRun.prototype.test_broken_tear_down = function() {
  this.log += 'test_broken_tear_down ';
}

WasRun.prototype.test_async_broken_tear_down = function() {
  this.log += 'test_async_broken_tear_down ';
}

WasRun.prototype.log = function() {
  return this.log;
}

WasRun.prototype.raise_excption_when_set_up = function(enable) {
  this.raise_excption_when_set_up = enable;
}

WasRun.create_suite = function() {
  var suite = new TestSuite('WasRun');
  suite.add(new WasRun('test_method'));
  suite.add(new WasRun('test_broken_method'));
  suite.add(new WasRun('test_broken_set_up'));
  return suite;
}

module.exports = WasRun;

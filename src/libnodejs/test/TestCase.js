/*jshint esnext: true */
var assert = require('assert');
var util = require('util');

function TestCase(methodName) {
  this.methodName = methodName;
  this.complete = false;
  this.timerID = 0;
  this.timers = [];
  this.stepIntervalID = null;
  this.updateIntervalID = null;
  this.runCompleteEvent = null;
  this.testResult = null;

  var that = this;
  this.exceptionHandler = function(error) {
    console.log("TestCase::UnitTest Exception :" + error);
    // interval 함수내에서 예외가 발생하게 되면 자동으로 clearInterval 될 수 있으므로
    // updateHandler를 다시 등록하여 tearDown에서 발생하는 타이머 호출 함수를 갱신하기 위해 재등록해준다.
    clearInterval(that.updateHandler);
    that.updateIntervalID = setInterval(that.updateHandler, 1);
    that._clearTimers();
    that._addFailedCount(error);
    that._startTearDown();
  };

  this.updateHandler = function() {
    var date = new Date();
    var timer = that._getCurrentTimer();
    if (timer.type === 'waitsFor') {
      // wait 시간이 정해진 TIMEOUT시간을 넘어서면 에러
      if (date.getTime() >= timer.timeout) {
        // exceptionHandler가 호출되게 된다.
        throw new Error('waitsFor handler is  timeout => timer pass is ' + timer.pass());
      }
            // 넘겨 받은 함수가 true를 리턴하면 대기 해제
      if (timer.pass()) {
        that._removeTimer(timer.id);
      }
    } else if (timer.type === 'waits') {
      // wait 시간이 넘어서면 대기 해제
      if (date.getTime() >= timer.timeout) {
        that._removeTimer(timer.id);
      }
    } else if (timer.type === 'runs') {
      if (date.getTime() >= timer.timeout) {
        timer.handler();
        that._removeTimer(timer.id);
      }
    }
  };
}

TestCase.prototype._getCurrentTimer = function() {
  if (this.timers.length === 0) {
    return {
      'type' : ''
    };
  }
  return this.timers[0];
};

TestCase.prototype._removeTimer = function(id) {
  for (var i = 0; i < this.timers.length; i++) {
    if (this.timers[i].id === id) {
      this.timers.splice(i, 1);
      break;
    }
  }
};

TestCase.prototype.setUp = function() {
};

TestCase.prototype.tearDown = function() {
};

/**
 * 비동기 테스트 콜백함수를 추가한다.
 * 
 * @param callback
 *          Function 실행할 콜백 함수
 * @param waitMicroSeconds
 *          int 함수 대기시간. 밀리세켠드 단위
 */
TestCase.prototype.runs = function(callback, waitMicroSeconds = 0) {
  this.timerID++;
  var that = this;
  var id = that.timerID;
  var handler = function() {
    try {
      callback();
    } catch (error) {
      // console.log('catch error!:' + error.stack);
      that._clearTimers();
      that._addFailedCount(error);
      that._startTearDown();
    }
  };
  this.timers.push({
    'id' : this.timerID,
    'type' : 'runs',
    'handler' : handler,
    'timeout' : new Date().getTime() + waitMicroSeconds
  });
};

/**
 * 비동기 테스트 콜백함수 실행을 대기시킨다.
 * 
 * @callback Function 실행 대기 여부를 검사하는 콜백 함수. 이 함수가 true를 리턴하면 다음 테스트 콜백 함수를 실행한다.
 * @waitMicroSeconds int 실행 대기 타임 아웃 시간. 밀리세컨드 단위
 */
TestCase.prototype.waitsFor = function(callback, timeoutMicroSeconds = 10000) {
  this.timerID++;
  var that = this;
  var id = that.timerID;
  this.timers.push({
    'id' : this.timerID,
    'type' : 'waitsFor',
    'pass' : callback,
    'handler' : function() {
    },
    'timeout' : new Date().getTime() + timeoutMicroSeconds
  });
};

/**
 * 비동기 테스트 콜백 함수 실행을 대기. waitsFor 처럼 특정 조건이 아닌 정해진 시간동안만 무조건 대기하는 함수
 * 
 * @param waitMicroSeconds
 *          int 대기시간
 */
TestCase.prototype.waits = function(waitMicroSeconds) {
  this.timerID++;
  var that = this;
  var id = that.timerID;
  this.timers.push({
    'id' : this.timerID,
    'type' : 'waits',
    'handler' : function() {
    },
    'timeout' : new Date().getTime() + waitMicroSeconds
  });
};

TestCase.prototype.run = function(testResult, runCompleteEvent) {
  this.testResult = testResult;
  this.runCompleteEvent = runCompleteEvent;
  this.updateIntervalID = setInterval(this.updateHandler, 1);

  try {
    process.addListener('uncaughtException', this.exceptionHandler);
    // set up
    testResult.test_started();
    this._startSetUp();
  } catch (error) {
    this._clearTimers();
    this._addFailedCount(error);
    this._startTearDown();
  }
};

TestCase.prototype._startSetUp = function() {
  this.setUp();
  var that = this;
  this.stepIntervalID = setInterval(function() {
    if (that.timers.length === 0) {
      clearInterval(that.stepIntervalID);
      that._startRun();
    }
  }, 1);
};

TestCase.prototype._startRun = function() {
  try {
    // run test 시작
    eval('this.' + this.methodName + '();');
    var that = this; // run test 시에 요청된 비동기 처리가 모두 완료되면 테스트 케이스 종료
    this.stepIntervalID = setInterval(function() {
      if (that.timers.length === 0) {
        clearInterval(that.stepIntervalID);
        that._startTearDown();
      }
    }, 1);
  } catch (error) {
    this._clearTimers();
    this._addFailedCount(error);
    this._startTearDown();
  }
};

TestCase.prototype._startTearDown = function() {
  try {
    // tear down 처리 시작. tearDown중 예외는 잡아서 처리해야지 계속 _startTearDown호출 되는 것을 막을 수
    // 있다.
    this.tearDown();
  } catch (error) {
    this._clearTimers();
    this._addFailedCount(error);
  }
  // 테스트케이스 완료 처리 시작
  var that = this;
  this.stepIntervalID = setInterval(function() {
    if (that.timers.length === 0) {
      clearInterval(that.stepIntervalID);
      clearInterval(that.updateIntervalID);
      that.complete = true;
      if (undefined !== that.runCompleteEvent) {
        try {
          that.runCompleteEvent();
        } catch (error) {
          console.error('TestCase::_startTearDown::complete event is failed:' + error.stack);
        }
      }
      process.removeListener('uncaughtException', that.exceptionHandler);
    }
  }, 1);
};

TestCase.prototype._addFailedCount = function(error) {
  var message = util.format('%s \n%s', error.message, error.stack);
  this.testResult.test_failed(this.methodName, message);
};

TestCase.prototype._clearTimers = function() {
  clearInterval(this.stepIntervalID);
  this.timers.length = 0;
};

TestCase.prototype.isComplete = function() {
  return this.complete;
};

TestCase.prototype.printTimers = function(message) {
  console.log(message);
  for (var i = 0; i < this.timers.length; i++) {
    console.log('idx:' + i + ',id:' + this.timers[i].id + ',type:' + this.timers[i].type);
  }
};

module.exports = TestCase;
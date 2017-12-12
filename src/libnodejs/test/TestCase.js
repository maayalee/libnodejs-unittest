var assert = require('assert');
var util = require('util');
var domain = require('domain');

function TestCase(methodName) {
  this.methodName = methodName;
  this.complete = false;
  this.timerID = 0;
  this.timers = [];
  this.step_interval_id = null;
  this.updateIntervalID = null;
  this.runCompleteEvent = null;
  this.test_result = null;

  var that = this;
  this.exceptionHandler = function(error) {
    // interval 함수내에서 예외가 발생하게 되면 자동으로 clearInterval 될 수 있으므로
    // updateHandler를 다시 등록하여 tearDown에서 발생하는 타이머 호출 함수를
    // 갱신하기 위해 재등록해준다.
    clearInterval(that.updateHandler);
    that.updateIntervalID = setInterval(that.updateHandler, 1);
    that._clearTimers();
    that._addFailedCount(error);
    that._start_tearDown();
  }; 

  this.updateHandler = function() {
	var date = new Date();
    var timer = that._getCurrentTimer();
    if (timer.type == 'waitsFor') {
      // wait 시간이 정해진 TIMEOUT시간을 넘어서면 에러
      if (date.getTime() >= timer.timeout) {
        // exceptionHandler가 호출되게 된다.
        throw new Error('waitsFor handler is  timeout => ' + timer.pass);
      }
      // 넘겨 받은 함수가 true를 리턴하면 대기 해제
      if (timer.pass())
        that._removeTimer(timer.id);
    }
    else if (timer.type == 'waits') {
      // wait 시간이 넘어서면 대기 해제
      if (date.getTime() >= timer.timeout) {
        that._removeTimer(timer.id);
      }
    }
    else if (timer.type == 'runs') {
      if (date.getTime() >= timer.timeout) {
        timer.handler();
        that._removeTimer(timer.id);
      }
    }
  }
}

TestCase.WAIT_FOR_DEFAULT_TIMEOUT = 5000;

TestCase.prototype._getCurrentTimer = function() {
  if (this.timers.length == 0) {
    return {'type':'' };
  }
  return this.timers[0];
}

TestCase.prototype._removeTimer = function(id) {
  for (var i = 0; i < this.timers.length; i++) {
    if (this.timers[i].id == id) {
      this.timers.splice(i, 1);
      break;
    }
  }
}

TestCase.prototype.setUp = function() {
}

TestCase.prototype.tearDown = function() {
}

/**
 * 비동기 테스트 콜백함수를 추가한다.
 *
 * @param callback Function 실행할 콜백 함수
 * @param wait_micro_seconds int 함수 대기시간. 밀리세켠드 단위
 */
TestCase.prototype.runs = function(callback, timeoutMicroSeconds) {
  if (undefined == timeoutMicroSeconds)
    timeoutMicroSeconds = 0;
  this._add_runs(callback, timeoutMicroSeconds);
}

/**
 * 비동기 테스트 콜백함수 실행을 대기시킨다. 
 *
 * @callback Function 실행 대기 여부를 검사하는 콜백 함수. 이 함수가 true를 리턴하면 다음 테스트 콜백 함수를 실행한다.
 * @timeoutMicroSeconds int 실행 대기 타임 아웃 시간. 밀리세컨드 단위
 */
TestCase.prototype.waitsFor = function(callback, timeoutMicroSeconds) {
  if (undefined == timeoutMicroSeconds)
    timeoutMicroSeconds = TestCase.WAIT_FOR_DEFAULT_TIMEOUT;
  this._add_waitsFor(callback, timeoutMicroSeconds);
}


/**
 * 비동기 테스트 콜백 함수 실행을 대기. waitsFor 처럼 특정 조건이 아닌 정해진 시간동안만 무조건 대기하는 함수
 *
 * @param micro_seconds int 대기시간
 */
TestCase.prototype.waits = function(micro_seconds) {
  this._add_waits(micro_seconds);
}

TestCase.prototype._add_runs = function(callback, wait_micro_seconds) {
  this.timerID++;
  var that = this;
  var id = that.timerID;
  var handler = function() { 
    try {
        callback();
    }
    catch (error) {
      //console.log('catch error!:' + error.stack);
      that._clearTimers();
      that._addFailedCount(error);
      that._start_tearDown();
    }
  };
  this.timers.push({
    'id':this.timerID, 
    'type':'runs',
    'handler':handler,
    'timeout':  new Date().getTime() + wait_micro_seconds
  });
};

TestCase.prototype._add_waitsFor = function(callback, timeoutMicroSeconds) {
  this.timerID++;
  var that = this;
  var id = that.timerID; 
  this.timers.push({
    'id':this.timerID, 
    'type':'waitsFor',
    'pass':callback,
    'handler': function() {},
    'timeout': new Date().getTime() + timeoutMicroSeconds
  });
};

TestCase.prototype._add_waits = function(timeoutMicroSeconds) {
  this.timerID++;
  var that = this;
  var id = that.timerID; 
  this.timers.push({
    'id':this.timerID, 
    'type':'waits',
    'handler': function() {},
    'timeout': new Date().getTime() + timeoutMicroSeconds
  });
};

TestCase.prototype.run = function(test_result, runCompleteEvent) {
  this.test_result = test_result;
  this.runCompleteEvent = runCompleteEvent;
  this.updateIntervalID = setInterval(this.updateHandler, 1);

  try {
    process.on('uncaughtException', this.exceptionHandler);
    // set up 
    test_result.test_started();
    this._start_set_up();
  }
  catch (error) {
    this._clearTimers();
    this._addFailedCount(error);
    this._start_tearDown();
  }
}

TestCase.prototype._start_set_up = function() {
  this.set_up();
  var that = this;
  this.step_interval_id = setInterval(function() {
    if (that.timers.length == 0) {
      clearInterval(that.step_interval_id);
      that._start_run();
    }
  }, 1);
}

TestCase.prototype._start_run = function () {
  try {
    // run test 시작
    eval('this.' + this.methodName + '();');
    var that = this; // run test 시에 요청된 비동기 처리가 모두 완료되면 테스트 케이스 종료
    this.step_interval_id = setInterval(function() { 
      if (that.timers.length == 0) {
        clearInterval(that.step_interval_id);
        that._start_tearDown();
      }
    }, 1);
  }
  catch (error) {
    this._clearTimers();
    this._addFailedCount(error);
    this._start_tearDown();
  }
}

TestCase.prototype._start_tearDown = function() {
  try {
    // tear down 처리 시작. tearDown중 예외는 잡아서 처리해야지 계속 _start_tearDown호출
    // 되는 것을 막을 수 있다.
    this.tearDown();
  }
  catch (error) {
    this._clearTimers();
    this._addFailedCount(error); 
  } 

  // 테스트케이스 완료 처리 시작
  var that = this;
  this.step_interval_id = setInterval(function() {
    if (that.timers.length == 0) {
      clearInterval(that.step_interval_id);
      clearInterval(that.updateIntervalID);
      that.complete = true;
      if (null != that.runCompleteEvent) { 
        try {
          that.runCompleteEvent();
        }
        catch (error){
          console.error('TESTS', 'TestCase::_start_tearDown::complete event is failed:' + error.stack);
        }
      } 
      process.removeListener('uncaughtException', that.exceptionHandler);
    } 
  }, 1);
}

TestCase.prototype.assert = function(statement, message) {
  if (false == statement) {
    if (undefined == message)
      message = 'statement is wrong';
    throw new Error('Assert: ' + message);
  }
}

TestCase.prototype._addFailedCount = function(error) {
  var message = util.format('%s \n%s', error.message, error.stack);
  this.test_result.test_failed(this.methodName, message);
}

TestCase.prototype._clearTimers = function() {
  clearInterval(this.step_interval_id);
  for (var i = 0; i < this.timers.length; i++) {
  }
  this.timers.length = 0;
}

TestCase.prototype.isComplete = function() {
  return this.complete;
}

TestCase.prototype.printTimers = function(message) {
  console.log(message);
  for (var i = 0; i < this.timers.length; i++) {
    console.log('idx:' + i + ',id:' + this.timers[i].id + ',type:' + this.timers[i].type);
  }
}

module.exports = TestCase;
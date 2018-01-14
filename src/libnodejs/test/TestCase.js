/*jshint esnext: true */
var assert = require('assert');
var util = require('util');
var Runs = require('./Runs');
var Waits = require('./Waits');
var WaitsFor = require('./WaitsFor');

class TestCase {
  constructor(methodName) {
    this._methodName = methodName;
    this._complete = false;
    this._tasks = [];
    this._runCompleteEvent = null;
    this._testResult = null;
    this._updateTimer = null;
  }
  
  run(testResult, runCompleteEvent = function(){}) {
    this._testResult = testResult;
    this._runCompleteEvent = runCompleteEvent;
    var coroutine = this._runAsync();
    this._updateTimer = setInterval(function() {
      coroutine.next();
    }, 1)
  }

  isComplete() {
    return this._complete;
  }

  printTasks(message) {
    console.log(message);
    for (var i = 0; i < this._tasks.length; i++) {
      console.dir(this._tasks[i]);
    }
  }


  _getCurrentTask() {
    if (this._tasks.length === 0) {
      return null;
    }
    return this._tasks[0];
  }

  _removeTask() {
    this._tasks.splice(0, 1);
  }

  /**
   * 테스트케이스를 실행전 호출되는 메서드. 이메서드에서 발생하는 예외는 실패가 아닌 에러로 간주한다
   */
  _setUp() {
  }
  
  /**
   * 테스트케이스를 실행후 호출되는 메서드. 이메서드에서 발생하는 예외는 실패가 아닌 에러로 간주한다
   */
  _tearDown() {
  }

  /**
   * 비동기 테스트 콜백함수를 추가한다.
   * 
   * @param callback Function 실행할 콜백 함수
   */
  _runs(callback) {
    this._tasks.push(new Runs(callback));
  }
  /**
   * 비동기 테스트 콜백함수 실행을 대기시킨다.
   * 
   * @callback Function 실행 대기 여부를 검사하는 콜백 함수. 이 함수가 true를 리턴하면 다음 테스트 콜백 함수를
   *           실행한다.
   * @waitMicroSeconds int 실행 대기 타임 아웃 시간. 밀리세컨드 단위
   */
  _waitsFor(callback, timeoutMicroSeconds = 10000) {
    this._tasks.push(new WaitsFor(callback, timeoutMicroSeconds));
  }

  /**
   * 비동기 테스트 콜백 함수 실행을 대기. waitsFor 처럼 특정 조건이 아닌 정해진 시간동안만 무조건 대기하는 함수
   * 
   * @param waitMicroSeconds int 대기시간
   */
  _waits(waitMicroSeconds) {
    this._tasks.push(new Waits(waitMicroSeconds));
  }

  *_runAsync() {
    this._testResult.testStarted();
    
    this._setUp();
    try {
      eval('this.' + this._methodName + '();');
      for(var i = 0; i < this._tasks.length; i++) {
        yield;
        this._tasks[i].prepare();
        while (this._tasks[i].isWait()) {
          yield;
        }
        this._tasks[i].run();
      }
    }
    catch (error) {
      var message = util.format('%s \n%s', error.message, error.stack);
      this._testResult.testFailed(this._methodName, message);
    }
    this._tearDown();
    
    this._runCompleteEvent();
    this._complete = true;
    clearInterval(this._updateTimer);
  } 
}

module.exports = TestCase;
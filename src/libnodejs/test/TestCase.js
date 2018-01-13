/*jshint esnext: true */
var assert = require('assert');
var util = require('util');
var Runs = require('./Runs');
var Waits = require('./Waits');
var WaitsFor = require('./WaitsFor');

class TestCase {
  constructor(methodName) {
    this.methodName = methodName;
    this.complete = false;
    this.tasks = [];
    this.runCompleteEvent = null;
    this.testResult = null;
  }

  _getCurrentTask() {
    if (this.tasks.length === 0) {
      return null;
    }
    return this.tasks[0];
  }

  _removeTask() {
    this.tasks.splice(0, 1);
  }

  /**
   * 테스트케이스를 실행전 호출되는 메서드. 이메서드에서 발생하는 예외는 실패가 아닌 에러로 간주한다
   */
  setUp() {
  }
  
  /**
   * 테스트케이스를 실행후 호출되는 메서드. 이메서드에서 발생하는 예외는 실패가 아닌 에러로 간주한다
   */
  tearDown() {
  }

  /**
   * 비동기 테스트 콜백함수를 추가한다.
   * 
   * @param callback Function 실행할 콜백 함수
   */
  runs(callback) {
    this.tasks.push(new Runs(callback));
  }
  /**
   * 비동기 테스트 콜백함수 실행을 대기시킨다.
   * 
   * @callback Function 실행 대기 여부를 검사하는 콜백 함수. 이 함수가 true를 리턴하면 다음 테스트 콜백 함수를
   *           실행한다.
   * @waitMicroSeconds int 실행 대기 타임 아웃 시간. 밀리세컨드 단위
   */
  waitsFor(callback, timeoutMicroSeconds = 10000) {
    this.tasks.push(new WaitsFor(callback, timeoutMicroSeconds));
  }

  /**
   * 비동기 테스트 콜백 함수 실행을 대기. waitsFor 처럼 특정 조건이 아닌 정해진 시간동안만 무조건 대기하는 함수
   * 
   * @param waitMicroSeconds int 대기시간
   */
  waits(waitMicroSeconds) {
    this.tasks.push(new Waits(waitMicroSeconds));
  }

  *runAsync() {
    this.testResult.testStarted();
    
    this.setUp();
    try {
      eval('this.' + this.methodName + '();');
      for(var i = 0; i < this.tasks.length; i++) {
        yield;
        this.tasks[i].prepare();
        while (this.tasks[i].isWait()) {
          yield;
        }
        this.tasks[i].run();
      }
    }
    catch (error) {
      var message = util.format('%s \n%s', error.message, error.stack);
      this.testResult.testFailed(this.methodName, message);
    }
    this.tearDown();
    
    this.runCompleteEvent();
    this.complete = true;
  }
  
  *_runSetup() {
    this.setUp();
    for(var i = 0; i < this.tasks.length; i++) {
      yield;
      var task = this.tasks[i];
      task.start();
      while (task.isWait()) {
        yield;
      }
      task.end();
    }
  }
  
  run(testResult, runCompleteEvent = function(){}) {
    this.testResult = testResult;
    this.runCompleteEvent = runCompleteEvent;
    var coroutine = this.runAsync();
    setInterval(function() {
      coroutine.next();
    }, 1)
  }

  isComplete() {
    return this.complete;
  }

  printTasks(message) {
    console.log(message);
    for (var i = 0; i < this.tasks.length; i++) {
      console.log('idx:' + i + ',id:' + this.tasks[i].id + ',type:' + this.tasks[i].type);
    }
  }

}

module.exports = TestCase;
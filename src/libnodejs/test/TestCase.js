/*jshint esnext: true */
var assert = require('assert');
var util = require('util');
var Runs = require('./Runs');
var Waits = require('./Waits');

class TestCase {
  constructor(methodName) {
    this.methodName = methodName;
    this.complete = false;
    this.tasks = [];
    this.runCompleteEvent = null;
    this.testResult = null;

    var that = this;
    this.exceptionHandler = function(error) {
      console.log("TestCase::UnitTest Exception :" + error);
      that._addFailedCount(error);
    };
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
  /*
  _removeTask(id) {
    for (var i = 0; i < this.tasks.length; i++) {
      if (this.tasks[i].id === id) {
        this.tasks.splice(i, 1);
        break;
      }
    }
  }
  */
  setUp() {
  }

  tearDown() {
  }

  /**
   * 비동기 테스트 콜백함수를 추가한다.
   * 
   * @param callback Function 실행할 콜백 함수
   */
  runs(callback) {
    var that = this;
    var handler = function() {
      try {
        callback();
      } catch (error) {
        // console.log('catch error!:' + error.stack);
        that._addFailedCount(error);
      }
    };
    this.tasks.push(new Runs(handler));
  }
  /**
   * 비동기 테스트 콜백함수 실행을 대기시킨다.
   * 
   * @callback Function 실행 대기 여부를 검사하는 콜백 함수. 이 함수가 true를 리턴하면 다음 테스트 콜백 함수를
   *           실행한다.
   * @waitMicroSeconds int 실행 대기 타임 아웃 시간. 밀리세컨드 단위
   */
  waitsFor(callback, timeoutMicroSeconds = 10000) {
    var that = this;
    //this.tasks.push(new Waits(timeoutMicroSeconds));
    /*
    this.tasks.push({
      'started': false,
      'type' : 'waitsFor',
      'pass' : callback,
      'handler' : function() {
      },
      'timeout' : timeoutMicroSeconds
    });
    */
  }

  /**
   * 비동기 테스트 콜백 함수 실행을 대기. waitsFor 처럼 특정 조건이 아닌 정해진 시간동안만 무조건 대기하는 함수
   * 
   * @param waitMicroSeconds
   *          int 대기시간
   */
  waits(waitMicroSeconds) {
    this.tasks.push(new Waits(waitMicroSeconds));
  }
  
  *runAsync() {
    process.addListener('uncaughtException', this.exceptionHandler);
    // set up
    this.testResult.test_started();
    this.setUp();
    this._RunMethod();
    
    for(var i = 0; i < this.tasks.length; i++) {
      yield;
      var task = this.tasks[i];
      task.start();
      while (task.isWait()) {
        yield;
      }
      task.end();
    }
    
    this.tearDown();
    if (undefined !== this.runCompleteEvent) {
      this.runCompleteEvent();
    }
    this.complete = true;
  }
  
  run(testResult, runCompleteEvent) {
    this.testResult = testResult;
    this.runCompleteEvent = runCompleteEvent;
    var coroutine = this.runAsync();
    setInterval(function() {
      coroutine.next();
    }, 1)
  }

  _RunMethod() {
    try {
      // run test 시작
      eval('this.' + this.methodName + '();');
    } catch (error) {
      this._addFailedCount(error);
    }
  }

  _addFailedCount(error) {
    var message = util.format('%s \n%s', error.message, error.stack);
    this.testResult.test_failed(this.methodName, message);
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
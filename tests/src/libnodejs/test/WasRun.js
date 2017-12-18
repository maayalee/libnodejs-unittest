/*jshint esnext: true */
var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');

class WasRun extends TestCase {
  constructor(methodName) {
    super(methodName);
    this.log = '';
    this.raiseExceptionWhenSetUp = false;
    this.raiseAsyncExceptionWhenSetUp = false;
    this.raiseExceptionWhenTearDown = false;
    this.raiseAsyncExceptionWhenTearDown = false;
  }

  setUp() {
    this.log += 'setUp ';
    if (this.raiseExceptionWhenSetUp) {
      throw new Error("test exception");
    }
    if (this.raiseAsyncExceptionWhenSetUp) {
      this.runs(function() {
        throw new Error('test async exception');
      });
    }
  }

  testMethod() {
    this.log += 'testMethod ';
  }

  tearDown() {
    this.log += 'tearDown ';
    if (this.raiseExceptionWhenTearDown) {
      throw new Error('test exception');
    }
    if (this.raiseAsyncExceptionWhenTearDown) {
      this.runs(function() {
        throw new Error('test async exception');
      });
    }
  }

  testBrokenMethod() {
    throw new Error("test exception");
  }

  testAsyncBrokenMethod() {
    this.log += 'testAsyncBrokenMethod ';
    var that = this;
    this.runs(function() {
      that.log += 'exception ';
      throw new Error('test async exception');
    });
  }

  testBrokenSetUp() {
    this.log += 'testBrokenSetUp ';
  }

  testAsyncBrokenSetUp() {
    this.log += 'testAsyncBrokenSetUp ';
  }

  testBrokenTearDown() {
    this.log += 'testBrokenTearDown ';
  }

  testAsyncBrokenTearDown() {
    this.log += 'testAsyncBrokenTearDown ';
  }

  log() {
    return this.log;
  }

  static createSuite() {
    var suite = new TestSuite('WasRun');
    suite.add(new WasRun('testMethod'));
    suite.add(new WasRun('testBrokenMethod'));
    suite.add(new WasRun('testBrokenSetUp'));
    return suite;
  }
}
module.exports = WasRun;

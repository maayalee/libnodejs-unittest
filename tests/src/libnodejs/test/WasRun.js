var TestCase = require('../../../../src/libnodejs/test/TestCase');
var TestSuite = require('../../../../src/libnodejs/test/TestSuite');

function WasRun(methodName) {
  TestCase.call(this, methodName);
  this.log = '';
  this.raiseExceptionWhenSetUp = false;
  this.raiseAsyncExceptionWhenSetUp = false;
  this.raiseExceptionWhenTearDown = false;
  this.raiseAsyncExceptionWhenTearDown = false;
}
WasRun.prototype = new TestCase();
WasRun.prototype.constructor = WasRun;

WasRun.prototype.setUp = function() {
  this.log += 'setUp ';
  if (this.raiseExceptionWhenSetUp) {
    throw new Error("test exception");
  }
  if (this.raiseAsyncExceptionWhenSetUp) {
    this.runs(function() {
      throw new Error('test async exception');
    });
  }
};

WasRun.prototype.testMethod = function() {
  this.log += 'testMethod ';
};

WasRun.prototype.tearDown = function() {
  this.log += 'tearDown ';
  if (this.raiseExceptionWhenTearDown) {
    throw new Error('test exception');
  }
  if (this.raiseAsyncExceptionWhenTearDown) {
    this.runs(function() {
      throw new Error('test async exception');
    });
  }
};

WasRun.prototype.testBrokenMethod = function() {
  throw new Error("test exception");
};

WasRun.prototype.testAsyncBrokenMethod = function() {
  this.log += 'testAsyncBrokenMethod ';
  var that = this;
  this.runs(function() {
    that.log += 'exception ';
    throw new Error('test async exception');
  });
};

WasRun.prototype.testBrokenSetUp = function() {
  this.log += 'testBrokenSetUp ';
};

WasRun.prototype.testAsyncBrokenSetUp = function() {
  this.log += 'testAsyncBrokenSetUp ';
};

WasRun.prototype.testBrokenTearDown = function() {
  this.log += 'testBrokenTearDown ';
};

WasRun.prototype.testAsyncBrokenTearDown = function() {
  this.log += 'testAsyncBrokenTearDown ';
};

WasRun.prototype.log = function() {
  return this.log;
};

WasRun.createSuite = function() {
  var suite = new TestSuite('WasRun');
  suite.add(new WasRun('testMethod'));
  suite.add(new WasRun('testBrokenMethod'));
  suite.add(new WasRun('testBrokenSetUp'));
  return suite;
};

module.exports = WasRun;

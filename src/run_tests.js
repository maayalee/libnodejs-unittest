var TestCase = require('../src/libnodejs/test/TestCase');
var TestRunner = require('../src/libnodejs/test/TestRunner');
var TestCaseTest = require('../tests/src/libnodejs/test/TestCaseTest');
var TestRunnerTest = require('../tests/src/libnodejs/test/TestRunnerTest');

var runner = new TestRunner();
runner.add(TestCaseTest.createSuite());
runner.add(TestRunnerTest.createSuite());
runner.run(function() {
  console.log(runner.summary());
  process.exit();
});
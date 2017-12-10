var TestCase = require('./src/libnodejs/test/TestCase');
var TestRunner = require('./src/libnodejs/test/TestRunner');
var TestCaseTest = require('./tests/src/libnodejs/test/TestCaseTest');

var runner = new TestRunner();
runner.add(TestCaseTest.create_suite());
runner.run(function() {
 console.log(runner.summary());
 process.exit();
});
/*jshint esnext: true */
var AsyncTask = require('./AsyncTask');

class WaitsFor extends AsyncTask {
  constructor(waitCallback, timeoutMicroSeconds) {
    super();
    this.waitCallback = waitCallback;
    this.timeoutMicroSeconds = timeoutMicroSeconds;
  }
  
  prepare() {
    this.timeoutTime = this._getCurrentTime() + this.timeoutMicroSeconds;
  }
  
  isWait() {
    if (this.timeoutTime > this._getCurrentTime()) {
      return false;
    }
    else {
      return this.waitCallback();
    }
  }
  
  run() {
  }  
  
  _getCurrentTime() {
    return new Date().getTime();
  }
}

module.exports = WaitsFor;
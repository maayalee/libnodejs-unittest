/*jshint esnext: true */
var AsyncTask = require('./AsyncTask');

class WaitsFor extends AsyncTask {
  constructor(waitCallback, timeoutMicroSeconds) {
    super();
    this._waitCallback = waitCallback;
    this._timeoutMicroSeconds = timeoutMicroSeconds;
  }
  
  prepare() {
    this._timeoutTime = this._getCurrentTime() + this._timeoutMicroSeconds;
  }
  
  isWait() {
    if (this._timeoutTime > this._getCurrentTime()) {
      return false;
    }
    else {
      return this._waitCallback();
    }
  }
  
  run() {
  }  
  
  _getCurrentTime() {
    return new Date().getTime();
  }
}

module.exports = WaitsFor;
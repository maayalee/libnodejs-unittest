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
      return this._waitCallback();
    }
    else {
      return false;
    }
  }
  
  run() {
  }  
  
  _getCurrentTime() {
    return new Date().getTime();
  }
}

module.exports = WaitsFor;
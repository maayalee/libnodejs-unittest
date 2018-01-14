/*jshint esnext: true */
var AsyncTask = require('./AsyncTask');

class Waits extends AsyncTask {
  constructor(waitMicroSeconds) {
    super();
    this._waitMicroSeconds = waitMicroSeconds;
  }
  
  prepare() {
    this._completeTime = this._getCurrentTime() + this._waitMicroSeconds;
  }
  
  isWait() {
    if (this._completeTime > this._getCurrentTime()) {
      return true;
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

module.exports = Waits;
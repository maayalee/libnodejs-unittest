/*jshint esnext: true */
var AsyncTask = require('./AsyncTask');

class Waits extends AsyncTask {
  constructor(waitMicroSeconds) {
    super();
    this.waitMicroSeconds = waitMicroSeconds;
  }
  
  prepare() {
    this.completeTime = this._getCurrentTime() + this.waitMicroSeconds;
  }
  
  isWait() {
    if (this.completeTime > this._getCurrentTime())
      return true;
    else
      return false;
  }
  
  run() {
  }  
  
  _getCurrentTime() {
    return new Date().getTime();
  }
}

module.exports = Waits;
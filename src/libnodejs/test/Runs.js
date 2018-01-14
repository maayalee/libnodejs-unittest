/*jshint esnext: true */
var AsyncTask = require('./AsyncTask');

class Runs extends AsyncTask {
  constructor(callback) {
    super();
    this._callback = callback;
  }
  
  start() {
  }
  
  isWait() {
    return false;
  }
  
  run() {
    this._callback();
  }  
}

module.exports = Runs;
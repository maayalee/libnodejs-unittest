/*jshint esnext: true */
var AsyncTask = require('./AsyncTask');

class Runs extends AsyncTask {
  constructor(callback) {
    super();
    this.callback = callback;
  }
  
  start() {
  }
  
  isWait() {
    return false;
  }
  
  end() {
    this.callback();
  }  
}

module.exports = Runs;
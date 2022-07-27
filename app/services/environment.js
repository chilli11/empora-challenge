import ENV from '../../env.js';

export default {
  API_KEY: ENV.API_KEY,
  API_URI: ENV.API_URI,
  API_PATH: ENV.API_PATH,
  STDIN_TIMEOUT: ENV.STDIN_TIMEOUT,

  setValue: function(key, value) {
    this[key] = value;
  }
};
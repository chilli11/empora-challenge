import axios from 'axios';
import ENV from './environment.js';

const APIKey = ENV.API_KEY;
const validateUrl = ENV.API_URI + ENV.API_PATH;

/**
 * @param {AddressDTO} address address parsed from CSV
 * @returns {AxiosResponse}
 */
export const validateAddress = async function(address) {
  try {
    let queryParams = Object.keys(address).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(address[key])
    }).join('&');
    return await axios.get(`${validateUrl}?${queryParams}&APIKey=${APIKey}`);
  } catch (err) {
    return err;
  }
}
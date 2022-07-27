/**
 * @name ValidationResponse
 * @prop {string} status VALID | SUSPECT | INVALID
 * @prop {string} formattedAddress corrected address, comma separated
 * @prop {string} addressline1
 * @prop {string} addresslinelast
 * @prop {string} postalcode
 * @prop {string} city
 * @prop {string} state
 * @prop {string} country ISO-3166 2-character country code; ex: 'us' 
 * @prop {string} type S | P | null => street address | PO Box/Pickup/delivery service | unspecified
 * @prop {string} originalInput comma delimited line from CSV used for validation request
 */
export default class {
  status;
  formattedaddress;
  addressline1;
  addresslinelast;
  postalcode;
  city;
  state;
  country;
  type;
  originalInput;

  /**
   * Assigns all values from the `data` property from `axios.get` response to the instance
   * @param {Object} responseData `data` property from `axios.get` response
   * @param {string} originalInput comma delimited line from CSV used for validation request
   */
  constructor(responseData, originalInput) {    
    Object.assign(this, { ...responseData, originalInput });
  }

  get finalOutput() {
    return `${this.addressline1}, ${this.city}, ${this.postalcode}`;
  }
}

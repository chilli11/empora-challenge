/**
 * @name AddressDTO
 * @prop {string} StreetAddress
 * @prop {string} City
 * @prop {string} PostalCode
 * @prop {string} CountryCode ISO-3166 2-character country code; default: 'us'
 */
export default class {
  StreetAddress;
  City;
  PostalCode;
  CountryCode = 'us'

  /**
   * @param {{'Street Address': string, 'City': string, 'Postal Code': string}} address address parsed from CSV
   */
  constructor(address) {
    this.StreetAddress = address['Street Address'];
    this.City = address.City;
    this.PostalCode = address['Postal Code'];

    let missing = Object.keys(this).filter(k => !this[k]);
    if (missing.length) throw `${this.originalInput} -> ERROR: Missing parameter(s): ${missing.join(', ')}`;
  }

  get originalInput() {
    return `${this.StreetAddress}, ${this.City}, ${this.PostalCode}`;
  }
}

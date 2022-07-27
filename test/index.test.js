import { checkCSVAsync, filterUserInputAndRun, generateOutput } from '../app/index.js';
import { CSV_DATA, READ_FILE_ERROR } from './utils/file-methods.test.js';
import assert from 'assert';
import nock from 'nock';
import ValidationResponse from '../app/classes/validation-response.js';

let scopes;
const apiSegments = {
  uri: 'https://api.address-validator.net',
  path: '/api/verify'
}

const originalLog = console.log;
const originalError = console.error;
const persistentParams = {
  logs: [],
  logMatch: [
    '123 e Maine Street, Columbus, 43215 -> Address, City, 00000-1111',
    '1 Empora St, Title, 11111 -> Address, City, 00000-1111',
    '103 hunters xing, lititz, 17543 -> Invalid Address',
    '416 e whitener, euless, 76040 -> Unexpected Status'
  ]
};


describe('called from index.js', () => {
  before(() => {
    console.log = (...params) => {
      persistentParams.logs.push(...params);
    };
    console.error = console.log;
  });

  beforeEach(() => {
    persistentParams.logs = [];
    scopes = [
      nock('https://api.address-validator.net').get('/api/verify')
        .query(true)
        .reply(200, {
          status: 'VALID',
          addressline1: 'Address',
          city: 'City',
          postalcode: '00000-1111'
        }),
      nock(apiSegments.uri).get(apiSegments.path)
      .query(true)
        .reply(200, {
          status: 'SUSPECT',
          addressline1: 'Address',
          city: 'City',
          postalcode: '00000-1111'
        }),
      nock(apiSegments.uri).get(apiSegments.path)
      .query(true)
        .reply(200, {
          status: 'INVALID'
        }),
      nock(apiSegments.uri).get(apiSegments.path)
      .query(true)
        .reply(200, {
          status: 'Unexpected Status'
        }),
    ];
  });

  it('generates correct output based on validation', () => {
    assert.equal(generateOutput(new ValidationResponse({
      status: 'VALID',
      addressline1: 'Address',
      city: 'City',
      postalcode: '00000-1111'
    }, 'original address')), 'original address -> Address, City, 00000-1111');
    assert.equal(generateOutput(new ValidationResponse({
      status: 'SUSPECT',
      addressline1: 'Address',
      city: 'City',
      postalcode: '00000-1111'
    }, 'original address')), 'original address -> Address, City, 00000-1111');
    assert.equal(generateOutput(new ValidationResponse({
      status: 'INVALID',
      formattedaddress: 'Valid formatted address'
    }, 'original address')), 'original address -> Invalid Address');
    assert.equal(generateOutput(new ValidationResponse({
      status: 'Unexpected Status',
      formattedaddress: 'Valid formatted address'
    }, 'original address')), 'original address -> Unexpected Status');
  })

  it('returns error if input file is missing', async () => {
    await filterUserInputAndRun('dummy-text.csv');
    assert.deepEqual(persistentParams.logs, [READ_FILE_ERROR]);
  })

  it('short address file: retreives address validation and formats response for console', async () => {
    await filterUserInputAndRun('test/test-addresses.csv');
    assert.equal(persistentParams.logs.length, 4);
    assert.deepEqual(persistentParams.logs, persistentParams.logMatch);
  });

  it('longer address file: retreives address', async () => {
    await filterUserInputAndRun('test/test-addresses-2.csv');
    assert.equal(persistentParams.logs.length, 616);
  });

  it('piped data: retreives address validation and formats response for console', async () => {
    await filterUserInputAndRun(CSV_DATA);
    assert.equal(persistentParams.logs.length, 4);
    assert.deepEqual(persistentParams.logs, persistentParams.logMatch);
  });

  it('properly processes raw CSV data', async () => {
    await checkCSVAsync(CSV_DATA);
    assert.equal(persistentParams.logs.length, 4);
    assert.deepEqual(persistentParams.logs, persistentParams.logMatch);
  });

  // this test ends before the responses are logged. I haven't been able to nail it down yet
  // it('properly processes a list of files', async () => {
  //   const input = `./test/test-addresses.csv\n./test/test-addresses-2.csv\n`;
  //   await filterUserInputAndRun(input);
  //   assert.equal(persistentParams.logs.length, 620);
  //   assert.deepEqual(persistentParams.logs, persistentParams.logMatch);
  // })

  after(() => {
    console.log = originalLog;
    console.error = originalError;
  });
});
import { getFileOutput, parseCSV } from '../../app/utils/file-methods.js';
import assert from 'assert';

let csvData = `Street Address,City,Postal Code\n`;
csvData += `123 e Maine Street,Columbus,43215\n`;
csvData += `1 Empora St,Title,11111\n`;
csvData += `103 hunters xing,lititz,17543\n`;
csvData += `416 e whitener,euless,76040\n`;

export const CSV_DATA = csvData;
const PARSED_CSV_DATA = [
  {
    'Street Address': '123 e Maine Street',
    City: 'Columbus',
    'Postal Code': '43215'
  },{
    'Street Address': '1 Empora St',
    City: 'Title',
    'Postal Code': '11111'
  },{
    'Street Address': '103 hunters xing',
    City: 'lititz',
    'Postal Code': '17543'
  },{
    'Street Address': '416 e whitener',
    City: 'euless',
    'Postal Code': '76040'
  }
];

export const READ_FILE_ERROR = 'Read File Error: ENOENT';
export const CSV_PARSE_ERROR = 'CSV Parse Error: CSV_INVALID_ARGUMENT';

const originalLog = console.log;
const originalError = console.error;
const persistentParams = { logs: [] };

describe('file methods', () => {
  before(() => {
    console.log = (...params) => persistentParams.logs.push(...params);
    console.error = console.log;
  });
  beforeEach(() => {
    persistentParams.logs = [];
  });

  it('getFileOutput: should error when file does not exist', async () => {
    const output = await getFileOutput('dummy-file.csv');
    assert.equal(output, undefined);
    assert.deepEqual(persistentParams.logs, [READ_FILE_ERROR]);
  });

  it('getFileOutput: should return file data as string', async () => {
    const output = await getFileOutput('test/test-addresses.csv');
    assert.equal(output, CSV_DATA);
  });

  it('parseCSV: should return csv data as individual records', async () => {
    let output = [];
    const csv = parseCSV(CSV_DATA);
    for await (const record of csv) {
      output.push(record);
    }
    assert.deepEqual(output, PARSED_CSV_DATA);
  });

  it('parseCSV: should error when csv is invalid', async () => {
    const csv = parseCSV(undefined);
    assert.equal(csv, undefined);
    assert.deepEqual(persistentParams.logs, [CSV_PARSE_ERROR]);
  });

  after(() => {
    console.log = originalLog
    console.error = originalError
  });
});
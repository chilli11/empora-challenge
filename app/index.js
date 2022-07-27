#!/usr/bin/env node

import { consoleError } from './utils/error-handler.js';
import { getFileOutput, parseCSV } from './utils/file-methods.js';
import { hideBin } from 'yargs/helpers'
import { validateAddress } from './services/validation.js';
import AddressDTO from './classes/address-dto.js';
import ENV from './services/environment.js';
import ValidationResponse from './classes/validation-response.js';
import yargs from 'yargs';

const opts = yargs(hideBin(process.argv))
  .option('key', {
    alias: 'k',
    description: 'API key',
    type: 'string'
  })
  .option('timeout', {
    alias: 't',
    description: 'Timeout for checking stdin for data',
    type: 'string'
  }).argv;

/**
 * Parse the initial user input
 * If the list line ends with `.csv` or `.txt`
 * it will be parsed as a list of file paths.
 * @param {string} userInput 
 */
export async function filterUserInputAndRun(userInput) {
  if (!!userInput) {
    let filteredInput = userInput;
    if (/.[csv|txt]$/.test(userInput.trim())) {
      try {
        let list = userInput.trim().split(`\n`);
        if (list.length > 1) {
          return list.forEach(line => filterUserInputAndRun(line));
        } else {
          filteredInput = await getFileOutput(list[0].trim());
        }
      } catch (err) {
        consoleError('ERROR', err);
      }
    }
    return await checkCSVAsync(filteredInput);
  }
}

/**
 * Takes CSV data from `filterUserInputAndRun` and runs the 
 * CSV parsing and address validation
 * @param {string} fileOutput CSV data
 */
export async function checkCSVAsync(fileOutput) {
  try {
    if (fileOutput) {
      let done = false;
      const csv = parseCSV(fileOutput);
      csv.on('end', () => done = true);
      for await (const record of csv) {
        const addressDTO = new AddressDTO(record);
        const { data } = await validateAddress(addressDTO);

        const validation = new ValidationResponse(data, addressDTO.originalInput);
        const output = generateOutput(validation);
        console.log(output);
      }
      return;
    }
  } catch (err) {
    consoleError('ERROR', err);
  }
}

/**
 * Creates the output string for an address
 * validation response
 * @param {ValidationResponse} validation
 * @returns {string} '`{originalInput}` -> `{status|formattedaddress}`'
 */
export function generateOutput(validation) {
  const { status, originalInput, finalOutput } = validation;
  if (!validation) return 'NO DATA'
  switch (status) {
    case null:
    case "":
    case undefined:
      return validation;
    case 'INVALID':
      return `${originalInput} -> Invalid Address`;
    case 'VALID':
    case 'SUSPECT':
      return `${originalInput} -> ${finalOutput}`;
    default:
      return `${originalInput} -> ${status}`;
  }
}

if (opts.k) ENV.setValue('API_KEY', opts.k);
if (opts.t) ENV.setValue('STDIN_TIMEOUT', opts.t);

if (opts._[0]) {
  filterUserInputAndRun(opts._[0]);
} else {
  const timer = setTimeout(() => process.stdin.pause(), ENV.STDIN_TIMEOUT);
  process.stdin.on('data', (data) => {
    clearTimeout(timer);
    filterUserInputAndRun(data.toString());
    process.stdin.pause()
  });
}
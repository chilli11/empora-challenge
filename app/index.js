#!/usr/bin/env node

import { consoleError } from './utils/error-handler.js';
import { getFileOutput, parseCSV } from './utils/file-methods.js';
import { hideBin } from 'yargs/helpers'
import { validateAddress } from './services/address-validator.js';
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
 * 
 * @param {string} userInput 
 * @param {Object} flags
 * @param {string} flags.key
 * @param {number} flags.timeout
 * @returns 
 */
export async function Main(userInput, flags) {
  const { key, timeout } = flags;
  if (key) {
    ENV.setValue('API_KEY', key);
  }
  if (timeout && parseInt(timeout, 10) > 0) {
    ENV.setValue('STDIN_TIMEOUT', timeout);
  }
  return await filterUserInputAndRun(userInput);
}

/**
 * Parse the initial user input
 * Runs recursively to detect lists of files.
 * If the last line ends with `.csv` or `.txt`
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
          let fileOutput = await getFileOutput(list[0].trim());
          return filterUserInputAndRun(fileOutput);
        }
      } catch (err) {
        consoleError('Error', err);
      }
    }
    return await validateFromCSV(filteredInput);
  }
}

/**
 * Takes CSV data and runs the 
 * CSV parsing and address validation
 * @param {string} fileOutput CSV data
 */
export async function validateFromCSV(fileOutput) {
  try {
    if (fileOutput) {
      const csv = parseCSV(fileOutput);
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
    consoleError('Error', err);
  }
}

/**
 * Creates the output string for an address
 * validation response
 * @param {ValidationResponse} validation
 * @returns {string} '`{originalInput}` -> `{status|formattedaddress}`'
 */
export function generateOutput(validation) {
  if (!validation) return 'NO DATA'

  const { status, originalInput, finalOutput } = validation;
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

if (opts._[0]) {
  Main(opts._[0], { key: opts.key, timeout: opts.t });
} else {
  const timer = setTimeout(() => process.stdin.pause(), ENV.STDIN_TIMEOUT);
  process.stdin.on('data', (data) => {
    clearTimeout(timer);
    Main(data.toString(), { key: opts.key, timeout: opts.t });
    process.stdin.pause()
  });
}
import fs from 'fs/promises';
import { consoleError } from './error-handler.js';
import { parse } from 'csv-parse';

/**
 * @param {string} filepath
 * @returns {string} contents of the file
 */
export async function getFileOutput(filepath) {
  try {
    return await fs.readFile(filepath, { encoding: 'utf8' });
  } catch (err) {
    return consoleError('Read File Error', err.code)
  }
}

/**
 * @param {string} fileOutput 
 * @returns {Parser}
 */
export function parseCSV(fileOutput) {
  try {
    return parse(fileOutput, {
      columns: true,
      skip_records_with_empty_values: true,
      skip_empty_lines: true
    });
  } catch (err) {
    return consoleError('CSV Parse Error', err.code);
  }
}
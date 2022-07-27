/**
 * console.error(`${heading}: ${message}`, errorObj)
 * @param {string} heading
 * @param {string} message
 * @param {Object} errorObj
 */
export function consoleError(heading, message) {
  let error = heading || 'ERROR';
  if (message && typeof message == 'string') {
    error += `: ${message}`;
  }
  console.error(error);
}
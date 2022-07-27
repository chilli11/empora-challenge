# Simple Address Validator

This nodejs console app takes a CSV formatted string of addresses and validates them against
the [byteplant address validator](https://www.address-validator.net).

## Run the code

1. `yarn` or `npm i` to install
2. Set the `API_KEY` in `env.example.js` and change the file name to `env.js`
3. Run it:
    - `cat ./file.csv | node .` OR
    - `node . ./file.csv`

## Testing

Run `yarn test` to run the Mocha test suite.

## Design

I divided the code up as I would if I were beginning to develop something more robust.
- `classes` for data models
- `services` for API handlers and context-independent business logic
- `utils` for simple, atomic methods that are likely to be used repeatedly
- `index.js` for the main program

I would have liked to atomize more of the `index.js` functionality, but things were starting
to get out of hand. The nesting and recursion, along with the async-iterator pattern in the csv parse
added some layers of complexity that I would need more time to abstract out.

### Features

- The app can accept a `.txt` or `.csv` file, as long as it is in the prescibed format:
    ```
    Street Address, City, Postal Code
    123 e Maine Street, Columbus, 43215
    1 Empora St, Title, 11111
    ```

- It can also accept a `\n`-separated list of `.txt` or `.csv` files. This will cause each
file to be processed asynchronously.
- The `API_KEY` can be changed at runtime by passing the `k` flag
- There is a timeout set on the check for data on `stdin`. It can be changed in the `env.js` file, or
at runtime by passing the `t` flag. It is in milliseconds.

### Notes

- I use Windows, so `cat` created some issues with PowerShell. I have tested this using `type`, instead
  - `type ./test/test-addresses.csv | node .`
- there are a few test files available:
    ```
      📦test
      ┣ 📜empty.csv
      ┣ 📜test-addresses.csv // four addresses, 'SUSPECT' and 'INVALID' statuses
      ┣ 📜test-addresses-2.csv // same as above, repeated 154x (616 records)
      ┗ 📜test-list.txt // list of multiple files
    ```
- If the last line of data ends in `.txt` or `.csv` it will be treated as a list of files. On
recursion only lines pointing to valid files will be evaluated.
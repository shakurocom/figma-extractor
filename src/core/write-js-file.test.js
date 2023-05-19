import fs from 'fs';
import { vol } from 'memfs';
import path from 'path';

import { writeJsFile } from './write-js-file';

jest.mock('fs');

describe('writeJsFile', () => {
  afterEach(() => {
    vol.reset();
  });

  it('checks existing of a new file', () => {
    expect(fs.existsSync('/ui/theme')).toBe(false);

    writeJsFile(
      `
    module.exports = {
      a: 1,
      b: 2,
      c: 3,
    };
    `,
      path.join('/ui/theme/', 'file-name.js'),
    );

    expect(fs.existsSync('/ui/theme')).toBe(true);
  });

  it('writes test data into a new file', () => {
    writeJsFile(
      `
    module.exports = {
      a: 1,
      b: 2,
      c: 3,
    };
    `,
      path.join('/ui/theme/', 'file-name.js'),
    );

    expect(vol.toJSON()).toMatchSnapshot();
  });
});

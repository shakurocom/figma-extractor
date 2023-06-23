import fs from 'fs';
import { vol } from 'memfs';
import path from 'path';

import { writeFile } from './write-file';

jest.mock('fs');

describe('writeFile', () => {
  afterEach(() => {
    vol.reset();
  });

  it('checks existing of a new file', () => {
    expect(fs.existsSync('/ui/theme')).toBe(false);

    writeFile(
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
    writeFile(
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

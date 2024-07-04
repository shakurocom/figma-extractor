import fs from 'fs';
import { vol } from 'memfs';

import { checkFilePath, readFile } from './fs-util';

jest.mock('fs');

describe('checkFilePath', () => {
  afterEach(() => {
    vol.reset();
  });

  it('should check an existing file', () => {
    vol.fromJSON({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '/file.path': '{json:"data"}',
    });

    jest.spyOn(fs, 'existsSync');

    expect(checkFilePath('/file.path')).toBeTruthy();

    expect(fs.existsSync).toHaveBeenCalledWith('/file.path');
  });

  it('should check and return false for wrong file', () => {
    vol.fromJSON({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '/file.path': '{json:"data"}',
    });

    jest.spyOn(fs, 'existsSync');

    expect(checkFilePath('/empty.path')).toBeFalsy();

    expect(fs.existsSync).toHaveBeenCalledWith('/empty.path');
  });
});

describe('readFile', () => {
  afterEach(() => {
    vol.reset();
  });

  it('should read an existed file', () => {
    vol.fromJSON({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '/file.path': '{json:"data"}',
    });

    return readFile('/file.path').then(res => {
      expect(res).toBe('{json:"data"}');
    });
  });

  it('should throw the error', () => {
    vol.fromJSON({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      '/file.path': '{json:"data"}',
    });

    return readFile('/empty.path').catch(err => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe("ENOENT: no such file or directory, open '/empty.path'");
    });
  });
});

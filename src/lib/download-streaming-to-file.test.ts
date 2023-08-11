import fs from 'fs';
import { vol } from 'memfs';
import moxios from 'moxios';
import path from 'path';

import { downloadStreamingToFile } from './download-streaming-to-file';

jest.mock('fs');

const svgDirectory = path.join(__dirname, '../utils/generate-styles/fixtures');

const stubRequest = () => {
  moxios.stubRequest('https://test-svg-file-url', {
    status: 200,
    response: (fs as any).__originalFs.createReadStream(path.join(svgDirectory, 'pin.svg')),
  });
};

const checkAndCreateTmpFolder = (folderName: string) => {
  if (!fs.existsSync(folderName)) {
    fs.mkdirSync(folderName, { recursive: true });
  }
};

describe('downloadStreamingToFile', () => {
  beforeEach(() => {
    moxios.install();
  });

  afterEach(() => {
    moxios.uninstall();
    vol.reset();
  });

  it('should download and create a received file', done => {
    stubRequest();
    checkAndCreateTmpFolder('/tmp/svg');

    downloadStreamingToFile('https://test-svg-file-url', '/tmp/svg/test-file.svg');

    moxios.wait(() => {
      const request = moxios.requests.at(0);
      expect(request.url).toBe('https://test-svg-file-url');

      expect(vol.toJSON()).toMatchSnapshot();
      done();
    });
  });

  it('should create request with passing particular headers', done => {
    stubRequest();
    checkAndCreateTmpFolder('/tmp/svg');

    downloadStreamingToFile('https://test-svg-file-url', '/tmp/svg/test-file.svg', {
      header1: 'header1',
      header2: 'header2',
    });

    moxios.wait(() => {
      const request = moxios.requests.at(0);
      expect(request.url).toBe('https://test-svg-file-url');
      expect(request.headers.header1).toBe('header1');
      expect(request.headers.header2).toBe('header2');

      done();
    });
  });

  it('should throw the error with "no exist such file or directory"', done => {
    stubRequest();

    const errorCatcher = jest.fn();

    downloadStreamingToFile('https://test-svg-file-url', '/tmp/svg/test-file.svg').catch(
      errorCatcher,
    );

    moxios.wait(() => {
      const request = moxios.requests.at(0);
      expect(request.url).toBe('https://test-svg-file-url');

      expect(errorCatcher).toHaveBeenCalledWith(expect.any(Error));
      expect(errorCatcher.mock.calls[0][0].message).toEqual(
        "ENOENT: no such file or directory, open '/tmp/svg/test-file.svg'",
      );
      done();
    });
  });

  /// TODO: Need to update moxios library to a master branch and re-develop this test according to that changes
  // Now, the latest version of moxios library is 0.4.0 that doesn't have methods for error working
  xit('should throw the error with "Internal server error"', done => {
    moxios.stubRequest('https://bad-test-svg-file-url', {
      status: 502,
      response: undefined,
    });
    checkAndCreateTmpFolder('/tmp/svg');

    downloadStreamingToFile('https://bad-test-svg-file-url', '/tmp/svg/test-file.svg');

    moxios.wait(() => {
      const request = moxios.requests.at(0);
      expect(request.url).toBe('https://bad-test-svg-file-url');
      done();
    });
  });
});

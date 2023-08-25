import fs from 'fs';
import { vol } from 'memfs';
import path from 'path';

import { optimizeSvg } from './optimize-svg';

jest.mock('fs');
jest.mock('fs/promises');

const svgDirectory = path.join(__dirname, '../utils/generate-styles/fixtures');

describe('optimizeSvg', () => {
  afterEach(() => {
    vol.reset();
  });

  it('should optimize exist svg file', () => {
    const fileName = '/tmp/svg/pin.svg';
    vol.fromJSON({
      [fileName]: (fs as any).__originalFs.readFileSync(path.join(svgDirectory, 'pin.svg'), {
        encoding: 'UTF-8',
      }),
    });

    expect(vol.toJSON()).toMatchSnapshot();

    return optimizeSvg(fileName).then(() => {
      expect(vol.toJSON()).toMatchSnapshot();
    });
  });

  it("should thrown the error because a file doesn't exist", () => {
    const fileName = '/tmp/svg/pin.svg';

    return expect(optimizeSvg(fileName)).rejects.toThrow(
      "ENOENT: no such file or directory, open '/tmp/svg/pin.svg'",
    );
  });

  it("should throw the error because a file can't be written", () => {
    const fileName = '/tmp/svg/pin.svg';

    vol.fromJSON({
      [fileName]: (fs as any).__originalFs.readFileSync(path.join(svgDirectory, 'pin.svg'), {
        encoding: 'UTF-8',
      }),
    });

    fs.writeFile = jest.fn() as any;

    (fs.writeFile as jest.Mock).mockImplementationOnce(
      (file: any, data: any, callback: (err: Error) => void) => {
        callback(new Error(`The file: '${file}' can't be written`));
      },
    );

    return expect(optimizeSvg(fileName)).rejects.toThrow(
      "The file: '/tmp/svg/pin.svg' can't be written",
    );
  });
});

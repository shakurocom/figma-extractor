import fs from 'fs';
import { vol } from 'memfs';
import path from 'path';

jest.mock('fs');
jest.mock('axios');

import axios from 'axios';

import { downloadStreamingToFile } from './download-streaming-to-file';

const svgDirectory = path.join(__dirname, '../utils/generate-styles/fixtures');

afterEach(() => {
  vol.reset();
  jest.clearAllMocks();
});

it('retries on 429 and succeeds on next attempt', async () => {
  fs.mkdirSync('/tmp/svg', { recursive: true });

  let callCount = 0;
  (axios as jest.MockedFunction<typeof axios>).mockImplementation(async () => {
    callCount++;
    if (callCount < 2) {
      const err: any = new Error('Too Many Requests');
      err.response = { status: 429, headers: {} };
      throw err;
    }

    return {
      data: (fs as any).__originalFs.createReadStream(path.join(svgDirectory, 'pin.svg')),
    } as any;
  });

  await downloadStreamingToFile('https://test-svg-file-url', '/tmp/svg/test-retry.svg');

  expect(callCount).toBe(2);
});

it('does not retry on non-429 errors', async () => {
  fs.mkdirSync('/tmp/svg', { recursive: true });

  let callCount = 0;
  (axios as jest.MockedFunction<typeof axios>).mockImplementation(async () => {
    callCount++;
    const err: any = new Error('Server Error');
    err.response = { status: 500, headers: {} };
    throw err;
  });

  await expect(
    downloadStreamingToFile('https://test-svg-file-url', '/tmp/svg/test-noretry.svg'),
  ).rejects.toThrow('Server Error');

  expect(callCount).toBe(1);
});

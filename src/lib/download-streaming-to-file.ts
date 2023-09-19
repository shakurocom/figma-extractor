import axios from 'axios';
import fs from 'fs';

export const downloadStreamingToFile = async function (
  uri: string,
  filename: string,
  headers?: Record<string, string>,
) {
  return new Promise(async (resolve, reject) => {
    const writer = fs.createWriteStream(filename);
    const response = await axios({
      url: uri,
      method: 'GET',
      responseType: 'stream',
      headers: {
        ...headers,
      },
    });

    await response.data.pipe(writer);
    await writer.on('finish', async () => {
      resolve(filename);
    });
    writer.on('error', reject);
  });
};

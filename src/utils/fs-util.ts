import fs from 'fs';

export const checkFilePath = (filePath: string) => {
  return fs.existsSync(filePath);
};

export const readFile = (filePath: string) => {
  return new Promise<string>((resolve, reject) => {
    fs.readFile(filePath, 'utf8', function (err, data) {
      if (err) {
        reject(err);

        return;
      }

      resolve(data);
    });
  });
};

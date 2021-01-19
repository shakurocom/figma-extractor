import fs from 'fs';
import path from 'path';
import shell from 'shelljs';

export const writeStyleFile = (template: string, fileName: string, config: Config) => {
  fs.writeFile(
    path.join(__dirname, `../../../${config.exportStylesPath || ''}/${fileName}`),
    template,
    err => {
      if (err) console.log(err);
      console.log(`Formatting ${fileName} file...`);
      shell.exec(
        `yarn eslint ${path.join(
          __dirname,
          `../../../${config.exportStylesPath || ''}/${fileName}`,
        )} --fix`,
      );
      console.log(`Generate ${fileName} is completed`);
    },
  );
};

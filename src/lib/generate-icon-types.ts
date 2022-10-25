import fs from 'fs';
import shell from 'shelljs';

const typeIconsTemplate = (names: string[]) =>
  `
  /* eslint-disable max-lines */

  export const ICONS = [${names.map(name => `'${name}'`).join(', ')}] as const;

  export type IconsType = typeof ICONS[number];
  `;

export const generateIconTypes = (iconNames: string[], path: string) => {
  fs.writeFile(`${path}/types.ts`, typeIconsTemplate(iconNames), err => {
    if (err) console.log(err);
    shell.exec(`yarn eslint ${path}/types.ts --fix`);
    console.log('Wrote icons type ');
  });
};

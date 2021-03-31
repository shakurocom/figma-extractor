import fs from 'fs';
import shell from 'shelljs';

const typeIconsTemplate = (names: string[]) =>
  `export type IconsType = ${names.map(name => `'${name}'`).join(' | ')};
   export const ICONS = [${names.map(name => `'${name}'`).join(', ')}];
  `;

export const generateIconTypes = (iconNames: string[], path: string) => {
  fs.writeFile(`${path}/types.ts`, typeIconsTemplate(iconNames), err => {
    if (err) console.log(err);
    shell.exec(`yarn eslint ${path}/types.ts --fix`);
    console.log('Wrote icons type ');
  });
};

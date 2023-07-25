import fs from 'fs';
import path from 'path';

import { Config } from '@/types';

import { generateIconTypes } from '../../lib/generate-icon-types';
import { generateIconsSprite } from '../../lib/generate-icons-sprite';

const getIconNameByFilename = (filename: string): string => filename.split('.')[0];

export const generateIconSpriteFromLocalFiles = (config: Config): void => {
  const pathIconsFolder = path.join(config?.icons?.exportPath ?? '', 'svg');

  if (!fs.existsSync(pathIconsFolder)) {
    throw Error('Attempt to generate icon sprite from non-existent files');
  }

  const pathSpriteFolder = path.join(config?.icons?.exportPath ?? '');

  if (config?.icons?.generateTypes) {
    const dirEntries = fs.readdirSync(pathIconsFolder, { withFileTypes: true });

    const iconNames = dirEntries
      .filter(dirEntry => dirEntry.isFile())
      .map(file => file.name)
      .map(getIconNameByFilename);

    generateIconTypes(iconNames, pathSpriteFolder);
  }

  generateIconsSprite(pathSpriteFolder);
};
